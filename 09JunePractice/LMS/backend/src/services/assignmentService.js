const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const Topic = require('../models/Topic');
const Module = require('../models/Module');
const Course = require('../models/Course');
const Progress = require('../models/Progress');
const AppError = require('../utils/AppError');
const { checkTopicOwnership, checkCourseOwnership } = require('./courseService');

const createAssignment = async ({ topicId, title, description, maxScore, dueDate, referenceFileUrl }, instructorId) => {
  await checkTopicOwnership(topicId, instructorId);

  if (dueDate && new Date(dueDate) <= new Date()) {
    throw new AppError('Due date must be in the future.', 400);
  }

  const assignment = new Assignment({
    topicId,
    title,
    description,
    maxScore: maxScore !== undefined ? maxScore : 100,
    dueDate,
    referenceFileUrl
  });

  await assignment.save();
  return assignment;
};

const submitAssignment = async (assignmentId, studentId, submittedFileUrl) => {
  const assignment = await Assignment.findById(assignmentId);
  if (!assignment) {
    throw new AppError('Assignment not found', 404);
  }

  if (assignment.dueDate && new Date() > new Date(assignment.dueDate)) {
    throw new AppError('Submission deadline has passed.', 403);
  }

  const topic = await Topic.findById(assignment.topicId);
  const moduleObj = await Module.findById(topic.moduleId);
  const courseId = moduleObj.courseId;

  // Verify enrollment
  const progress = await Progress.findOne({ userId: studentId, courseId });
  if (!progress) {
    throw new AppError('Access denied. You must enroll in this course to view announcements.', 403);
  }

  // Sequential lock check
  const modules = await Module.find({ courseId }).sort({ sequenceIndex: 1 });
  const moduleIds = modules.map(m => m._id);
  const allTopics = await Topic.find({ moduleId: { $in: moduleIds } }).sort({ sequenceIndex: 1 });

  const currentTopicIndex = allTopics.findIndex(t => t._id.toString() === topic._id.toString());
  const completedTopics = progress.completedTopics || [];

  for (let i = 0; i < currentTopicIndex; i++) {
    if (!completedTopics.includes(allTopics[i]._id.toString())) {
      throw new AppError('Topic is locked.', 403);
    }
  }

  const submission = await Submission.findOneAndUpdate(
    { assignmentId, studentId },
    { submittedFileUrl, status: 'Submitted', grade: undefined, feedback: undefined, feedbackFileUrl: undefined },
    { upsert: true, new: true }
  );

  return submission;
};

const gradeSubmission = async (submissionId, { grade, feedback, feedbackFileUrl }, instructorId) => {
  const submission = await Submission.findById(submissionId);
  if (!submission) {
    throw new AppError('Submission not found', 404);
  }

  const assignment = await Assignment.findById(submission.assignmentId);
  const topic = await Topic.findById(assignment.topicId);
  const moduleObj = await Module.findById(topic.moduleId);

  await checkCourseOwnership(moduleObj.courseId, instructorId);

  if (grade === undefined || grade < 0 || grade > assignment.maxScore) {
    throw new AppError('Grade must be between 0 and assignment maximum score.', 400);
  }

  if (!feedback || !feedback.trim()) {
    throw new AppError('Grade and feedback comments are required.', 400);
  }

  submission.grade = grade;
  submission.feedback = feedback.trim();
  submission.status = 'Graded';
  if (feedbackFileUrl) {
    submission.feedbackFileUrl = feedbackFileUrl;
  }

  await submission.save();
  return submission;
};

const getAssignmentByTopic = async (topicId, userId, role) => {
  const topic = await Topic.findById(topicId);
  if (!topic) {
    throw new AppError('Topic not found', 404);
  }

  if (role === 'Learner') {
    const moduleObj = await Module.findById(topic.moduleId);
    const progress = await Progress.findOne({ userId, courseId: moduleObj.courseId });
    if (!progress) {
      throw new AppError('Access denied. You must enroll in this course.', 403);
    }
    
    const modules = await Module.find({ courseId: moduleObj.courseId }).sort({ sequenceIndex: 1 });
    const moduleIds = modules.map(m => m._id);
    const allTopics = await Topic.find({ moduleId: { $in: moduleIds } }).sort({ sequenceIndex: 1 });
    const currentTopicIndex = allTopics.findIndex(t => t._id.toString() === topic._id.toString());
    const completedTopics = progress.completedTopics || [];
    for (let i = 0; i < currentTopicIndex; i++) {
      if (!completedTopics.includes(allTopics[i]._id.toString())) {
        throw new AppError('Topic is locked.', 403);
      }
    }
  }

  const assignment = await Assignment.findOne({ topicId });
  return assignment;
};

const getSubmission = async (assignmentId, studentId) => {
  const submission = await Submission.findOne({ assignmentId, studentId });
  return submission;
};

const getSubmissions = async (assignmentId, instructorId) => {
  const assignment = await Assignment.findById(assignmentId);
  if (!assignment) {
    throw new AppError('Assignment not found', 404);
  }
  const topic = await Topic.findById(assignment.topicId);
  const moduleObj = await Module.findById(topic.moduleId);
  
  await checkCourseOwnership(moduleObj.courseId, instructorId);

  const submissions = await Submission.find({ assignmentId }).populate('studentId', 'name email');
  return submissions;
};

module.exports = {
  createAssignment,
  submitAssignment,
  gradeSubmission,
  getAssignmentByTopic,
  getSubmission,
  getSubmissions
};
