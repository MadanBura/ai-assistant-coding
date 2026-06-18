const mongoose = require('mongoose');
const Course = require('../models/Course');
const Topic = require('../models/Topic');
const Module = require('../models/Module');
const AppError = require('../utils/AppError');
const gamificationService = require('./gamificationService');
const Resource = require('../models/Resource');
const Progress = require('../models/Progress');
const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const FinalExam = require('../models/FinalExam');
const FinalExamAttempt = require('../models/FinalExamAttempt');

const getSortedCourseTopics = async (courseId) => {
  const modules = await Module.find({ courseId }).sort({ sequenceIndex: 1 });
  const moduleIds = modules.map(m => m._id);
  const topics = await Topic.find({ moduleId: { $in: moduleIds } });

  const moduleSeqMap = {};
  modules.forEach(m => {
    moduleSeqMap[m._id.toString()] = m.sequenceIndex;
  });

  topics.sort((a, b) => {
    const aModSeq = moduleSeqMap[a.moduleId.toString()];
    const bModSeq = moduleSeqMap[b.moduleId.toString()];
    if (aModSeq !== bModSeq) {
      return aModSeq - bModSeq;
    }
    return a.sequenceIndex - b.sequenceIndex;
  });

  return topics;
};

const enrollInCourse = async (courseId, userId) => {
  const course = await Course.findById(courseId);
  if (!course) {
    throw new AppError('Course not found', 404);
  }

  const existingEnrollment = await Progress.findOne({ userId, courseId });
  if (existingEnrollment) {
    throw new AppError('Already enrolled in this course.', 409);
  }

  const progress = new Progress({ userId, courseId });
  await progress.save();

  return {
    id: progress._id.toString(),
    userId: progress.userId.toString(),
    courseId: progress.courseId.toString(),
    progressPercent: progress.progressPercent,
    completedTopics: progress.completedTopics,
    completedQuizzes: progress.completedQuizzes,
    finalExamPassed: progress.finalExamPassed
  };
};

const getCourseProgress = async (courseId, userId) => {
  const course = await Course.findById(courseId);
  if (!course) {
    throw new AppError('Course not found', 404);
  }

  const progress = await Progress.findOne({ userId, courseId });
  if (!progress) {
    throw new AppError('Learner is not enrolled in this course.', 403);
  }

  const sortedTopics = await getSortedCourseTopics(courseId);

  return {
    progressPercent: progress.progressPercent,
    completedTopics: progress.completedTopics.map(id => id.toString()),
    totalTopics: sortedTopics.length
  };
};

const markTopicComplete = async (topicId, userId) => {
  const topic = await Topic.findById(topicId);
  if (!topic) {
    throw new AppError('Topic not found', 404);
  }

  const mod = await Module.findById(topic.moduleId);
  if (!mod) {
    throw new AppError('Module not found', 404);
  }

  const courseId = mod.courseId;
  const progress = await Progress.findOne({ userId, courseId });
  if (!progress) {
    throw new AppError('Learner is not enrolled in this course.', 403);
  }

  const sortedTopics = await getSortedCourseTopics(courseId);
  const topicIndex = sortedTopics.findIndex(t => t._id.toString() === topicId);
  if (topicIndex === -1) {
    throw new AppError('Topic not found in this course', 404);
  }

  // Check sequential locks
  const completedSet = new Set(progress.completedTopics.map(id => id.toString()));
  for (let i = 0; i < topicIndex; i++) {
    const prevTopicId = sortedTopics[i]._id.toString();
    if (!completedSet.has(prevTopicId)) {
      throw new AppError('Pre-requisite topics are not completed.', 403);
    }
  }

  if (!completedSet.has(topicId)) {
    progress.completedTopics.push(topicId);
  }
  progress.progressPercent = Math.round((progress.completedTopics.length / sortedTopics.length) * 100);
  await progress.save();

  return {
    progressPercent: progress.progressPercent
  };
};

const getTopicDetails = async (courseId, topicId, userId) => {
  const course = await Course.findById(courseId);
  if (!course) {
    throw new AppError('Course not found', 404);
  }

  const topic = await Topic.findById(topicId);
  if (!topic) {
    throw new AppError('Topic not found', 404);
  }

  const mod = await Module.findById(topic.moduleId);
  if (!mod || mod.courseId.toString() !== courseId) {
    throw new AppError('Topic not found in this course', 404);
  }

  const progress = await Progress.findOne({ userId, courseId });
  if (!progress) {
    throw new AppError('Learner is not enrolled in this course.', 403);
  }

  const sortedTopics = await getSortedCourseTopics(courseId);
  const topicIndex = sortedTopics.findIndex(t => t._id.toString() === topicId);
  if (topicIndex === -1) {
    throw new AppError('Topic not found in this course', 404);
  }

  // Check sequential locks
  const completedSet = new Set(progress.completedTopics.map(id => id.toString()));
  for (let i = 0; i < topicIndex; i++) {
    const prevTopicId = sortedTopics[i]._id.toString();
    if (!completedSet.has(prevTopicId)) {
      throw new AppError('Topic is locked.', 403);
    }
  }

  const resources = await Resource.find({ topicId });

  return {
    id: topic._id.toString(),
    title: topic.title,
    resources: resources.map(r => ({
      id: r._id.toString(),
      type: r.type,
      url: r.url,
      content: r.content
    }))
  };
};

// Assessment & Evaluation logic
const getTopicAssessment = async (topicId, userId) => {
  const topic = await Topic.findById(topicId);
  if (!topic) {
    throw new AppError('Topic not found', 404);
  }

  const mod = await Module.findById(topic.moduleId);
  if (!mod) {
    throw new AppError('Module not found', 404);
  }

  const courseId = mod.courseId;
  const progress = await Progress.findOne({ userId, courseId });
  if (!progress) {
    throw new AppError('Learner is not enrolled in this course.', 403);
  }

  // Check sequential locks
  const sortedTopics = await getSortedCourseTopics(courseId);
  const topicIndex = sortedTopics.findIndex(t => t._id.toString() === topicId);
  if (topicIndex === -1) {
    throw new AppError('Topic not found in this course', 404);
  }

  const completedSet = new Set(progress.completedTopics.map(id => id.toString()));
  for (let i = 0; i < topicIndex; i++) {
    const prevTopicId = sortedTopics[i]._id.toString();
    if (!completedSet.has(prevTopicId)) {
      throw new AppError('Topic is locked.', 403);
    }
  }

  const quiz = await Quiz.findOne({ topicId });
  if (!quiz) {
    throw new AppError('No quiz associated with this topic', 404);
  }

  return {
    passingThreshold: quiz.passingThreshold,
    questions: quiz.questions.map((q, idx) => ({
      id: quiz._id.toString() + '_q' + idx,
      questionText: q.questionText,
      options: q.options
    }))
  };
};

const submitQuizAssessment = async (topicId, answers, userId) => {
  const topic = await Topic.findById(topicId);
  if (!topic) {
    throw new AppError('Topic not found', 404);
  }

  const mod = await Module.findById(topic.moduleId);
  if (!mod) {
    throw new AppError('Module not found', 404);
  }

  const courseId = mod.courseId;
  const progress = await Progress.findOne({ userId, courseId });
  if (!progress) {
    throw new AppError('Learner is not enrolled in this course.', 403);
  }

  // Check sequential locks
  const sortedTopics = await getSortedCourseTopics(courseId);
  const topicIndex = sortedTopics.findIndex(t => t._id.toString() === topicId);
  if (topicIndex === -1) {
    throw new AppError('Topic not found in this course', 404);
  }

  const completedSet = new Set(progress.completedTopics.map(id => id.toString()));
  for (let i = 0; i < topicIndex; i++) {
    const prevTopicId = sortedTopics[i]._id.toString();
    if (!completedSet.has(prevTopicId)) {
      throw new AppError('Topic is locked.', 403);
    }
  }

  const quiz = await Quiz.findOne({ topicId });
  if (!quiz) {
    throw new AppError('No quiz associated with this topic', 404);
  }

  // Grade the quiz
  let correctCount = 0;
  quiz.questions.forEach((q, idx) => {
    const expectedId = quiz._id.toString() + '_q' + idx;
    const answer = answers.find(a => a.questionId === expectedId || a.questionId === q._id.toString());
    if (answer && answer.selectedOptionIndex === q.correctOptionIndex) {
      correctCount++;
    }
  });

  const score = Math.round((correctCount / quiz.questions.length) * 100);
  const passed = score >= quiz.passingThreshold;

  // Log the attempt
  const attempt = new QuizAttempt({ userId, topicId, score, passed });
  await attempt.save();

  // If passed, add topic to progress
  if (passed) {
    if (!completedSet.has(topicId)) {
      progress.completedTopics.push(topicId);
    }
    progress.progressPercent = Math.round((progress.completedTopics.length / sortedTopics.length) * 100);
    await progress.save();
  }

  return {
    score,
    passed,
    passingThreshold: quiz.passingThreshold,
    progressPercent: progress.progressPercent
  };
};

const getFinalExam = async (courseId, userId) => {
  const course = await Course.findById(courseId);
  if (!course) {
    throw new AppError('Course not found', 404);
  }

  const progress = await Progress.findOne({ userId, courseId });
  if (!progress) {
    throw new AppError('Learner is not enrolled in this course.', 403);
  }

  const sortedTopics = await getSortedCourseTopics(courseId);
  if (progress.completedTopics.length < sortedTopics.length) {
    throw new AppError('Final exam is locked until all curriculum topics are completed.', 403);
  }

  const exam = await FinalExam.findOne({ courseId });
  if (!exam) {
    throw new AppError('No final exam configured for this course', 404);
  }

  // Check 24-hour lockout
  const recentAttempt = await FinalExamAttempt.findOne({ userId, courseId }).sort({ createdAt: -1 });
  if (recentAttempt && !recentAttempt.passed) {
    const hoursSinceLastAttempt = (Date.now() - new Date(recentAttempt.createdAt).getTime()) / (1000 * 60 * 60);
    if (hoursSinceLastAttempt < 24) {
      throw new AppError(`You recently failed the exam. Please prepare and re-attempt after 24 hours.`, 403);
    }
  }

  return {
    passingThreshold: exam.passingThreshold,
    questions: exam.questions.map((q, idx) => ({
      id: exam._id.toString() + '_q' + idx,
      questionText: q.questionText,
      options: q.options
    }))
  };
};

const submitFinalExam = async (courseId, answers, userId) => {
  const course = await Course.findById(courseId);
  if (!course) {
    throw new AppError('Course not found', 404);
  }

  const progress = await Progress.findOne({ userId, courseId });
  if (!progress) {
    throw new AppError('Learner is not enrolled in this course.', 403);
  }

  const sortedTopics = await getSortedCourseTopics(courseId);
  if (progress.completedTopics.length < sortedTopics.length) {
    throw new AppError('Final exam is locked until all curriculum topics are completed.', 403);
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const exam = await FinalExam.findOne({ courseId }).session(session);
    if (!exam) {
      progress.finalExamPassed = true;
      await progress.save({ session });
      await gamificationService.evaluateCourseCompletionBadge(userId, courseId, progress.progressPercent, session).catch(console.error);
      
      await session.commitTransaction();
      session.endSession();
      
      return {
        score: 100,
        passed: true,
        passingThreshold: 0,
        certificateEligible: true
      };
    }

    // Check 24-hour lockout for submissions too to prevent concurrent submissions
    const recentAttempt = await FinalExamAttempt.findOne({ userId, courseId }).sort({ createdAt: -1 }).session(session);
    if (recentAttempt && !recentAttempt.passed) {
      const hoursSinceLastAttempt = (Date.now() - new Date(recentAttempt.createdAt).getTime()) / (1000 * 60 * 60);
      if (hoursSinceLastAttempt < 24) {
        throw new AppError(`You recently failed the exam. Please prepare and re-attempt after 24 hours.`, 403);
      }
    }

    // Grade the exam
    let correctCount = 0;
    exam.questions.forEach((q, idx) => {
      const expectedId = exam._id.toString() + '_q' + idx;
      const answer = answers.find(a => a.questionId === expectedId || a.questionId === q._id.toString());
      if (answer && answer.selectedOptionIndex === q.correctOptionIndex) {
        correctCount++;
      }
    });

    const score = Math.round((correctCount / exam.questions.length) * 100);
    const passed = score >= exam.passingThreshold;

    // Log the attempt
    const attempt = new FinalExamAttempt({ userId, courseId, score, passed });
    await attempt.save({ session });

    if (passed) {
      progress.finalExamPassed = true;
      await progress.save({ session });
      await gamificationService.evaluateCourseCompletionBadge(userId, courseId, progress.progressPercent, session).catch(console.error);
    }

    await session.commitTransaction();
    session.endSession();

    return {
      score,
      passed,
      passingThreshold: exam.passingThreshold,
      certificateEligible: passed
    };
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};

const getEnrolledCourses = async (userId) => {
  const progressList = await Progress.find({ userId });
  console.log('[DEBUG-BACKEND] getEnrolledCourses progressList:', progressList);
  const enrollments = await Promise.all(
    progressList.map(async (p) => {
      const course = await Course.findById(p.courseId);
      if (!course) return null;
      return {
        course: {
          id: course._id.toString(),
          title: course.title,
          category: course.category,
          description: course.description
        },
        progressPercent: p.progressPercent,
        finalExamPassed: p.finalExamPassed
      };
    })
  );
  console.log('[DEBUG-BACKEND] getEnrolledCourses returning:', enrollments.filter(Boolean));
  return enrollments.filter(Boolean);
};

module.exports = {
  enrollInCourse,
  getCourseProgress,
  markTopicComplete,
  getTopicDetails,
  getFinalExam,
  getTopicAssessment,
  submitQuizAssessment,
  submitFinalExam,
  getEnrolledCourses
};

