const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const Topic = require('../models/Topic');
const Module = require('../models/Module');
const Course = require('../models/Course');
const Progress = require('../models/Progress');
const AppError = require('../utils/AppError');
const { checkTopicOwnership } = require('./courseService');

const setupQuiz = async (topicId, { questions, releaseRule }, instructorId) => {
  await checkTopicOwnership(topicId, instructorId);

  if (!questions || !Array.isArray(questions) || questions.length === 0) {
    throw new AppError('Question text is required.', 400);
  }

  for (const q of questions) {
    if (!q.questionText || !q.options || !Array.isArray(q.options) || q.options.length < 2) {
      throw new AppError('Question text is required.', 400);
    }
    if (q.correctOptionIndex === undefined || q.correctOptionIndex < 0 || q.correctOptionIndex >= q.options.length) {
      throw new AppError('Correct option index out of bounds.', 400);
    }
  }

  if (releaseRule && !['Always', 'OnPassing', 'AfterDeadline'].includes(releaseRule)) {
    throw new AppError('Invalid release rule.', 400);
  }

  const quiz = await Quiz.findOneAndUpdate(
    { topicId },
    { questions, releaseRule: releaseRule || 'Always' },
    { upsert: true, new: true, runValidators: true }
  );

  return quiz;
};

const submitQuiz = async (topicId, { answers }, studentId) => {
  const quiz = await Quiz.findOne({ topicId });
  if (!quiz) {
    throw new AppError('Quiz not found.', 404);
  }

  const topic = await Topic.findById(topicId);
  const moduleObj = await Module.findById(topic.moduleId);
  const courseId = moduleObj.courseId;

  // Verify enrollment
  const progress = await Progress.findOne({ userId: studentId, courseId });
  if (!progress) {
    throw new AppError('Access denied. You must enroll in this course to view announcements.', 403);
  }

  if (!answers || !Array.isArray(answers) || answers.length !== quiz.questions.length) {
    throw new AppError('Answers length mismatch.', 400);
  }

  let correctCount = 0;
  const processedQuestions = quiz.questions.map((q, idx) => {
    const qId = q._id.toString();
    const legacyQId = quiz._id.toString() + '_q' + idx;
    const ans = answers.find(a => a.questionId === qId || a.questionId === legacyQId);
    const selectedOptionIndex = ans ? ans.selectedOptionIndex : -1;
    const isCorrect = selectedOptionIndex === q.correctOptionIndex;

    if (isCorrect) {
      correctCount++;
    }

    return {
      questionId: qId,
      questionText: q.questionText,
      options: q.options,
      correctOptionIndex: q.correctOptionIndex,
      userAnswerIndex: selectedOptionIndex,
      explanation: q.explanation
    };
  });

  const score = Math.round((correctCount / quiz.questions.length) * 100);
  const passed = score >= quiz.passingThreshold;

  const attempt = new QuizAttempt({
    userId: studentId,
    topicId,
    score,
    passed
  });
  await attempt.save();

  // If passed, mark topic completed in Progress
  if (passed) {
    if (!progress.completedTopics.includes(topicId.toString())) {
      progress.completedTopics.push(topicId.toString());
      // Re-calculate progress percent
      const modules = await Module.find({ courseId });
      const moduleIds = modules.map(m => m._id);
      const totalTopicsCount = await Topic.countDocuments({ moduleId: { $in: moduleIds } });
      progress.progressPercent = Math.round((progress.completedTopics.length / totalTopicsCount) * 100);
      await progress.save();
    }
  }

  // Trigger custom badge unlocking evaluations asynchronously
  const gamificationService = require('./gamificationService');
  await gamificationService.evaluateQuizBadge(studentId, topicId, score).catch(console.error);
  await gamificationService.evaluateCourseCompletionBadge(studentId, courseId, progress.progressPercent).catch(console.error);



  // Filter explanations based on release rule
  const showExplanations =
    quiz.releaseRule === 'Always' ||
    (quiz.releaseRule === 'OnPassing' && passed);

  const finalQuestions = processedQuestions.map(q => ({
    questionText: q.questionText,
    options: q.options,
    userAnswerIndex: q.userAnswerIndex,
    correctOptionIndex: q.correctOptionIndex,
    explanation: showExplanations ? q.explanation : null
  }));

  return {
    attemptId: attempt._id.toString(),
    score,
    passed,
    questions: finalQuestions
  };
};

const getQuizAttempt = async (attemptId, studentId) => {
  const attempt = await QuizAttempt.findById(attemptId);
  if (!attempt) {
    throw new AppError('Attempt record not found.', 404);
  }

  if (attempt.userId.toString() !== studentId.toString()) {
    throw new AppError('Access denied. You can only view your own attempts.', 403);
  }

  const quiz = await Quiz.findOne({ topicId: attempt.topicId });
  if (!quiz) {
    throw new AppError('Quiz not found.', 404);
  }

  const showExplanations =
    quiz.releaseRule === 'Always' ||
    (quiz.releaseRule === 'OnPassing' && attempt.passed);

  const finalQuestions = quiz.questions.map(q => ({
    questionText: q.questionText,
    options: q.options,
    correctOptionIndex: q.correctOptionIndex,
    explanation: showExplanations ? q.explanation : null
  }));

  return {
    id: attempt._id.toString(),
    score: attempt.score,
    passed: attempt.passed,
    questions: finalQuestions
  };
};

module.exports = {
  setupQuiz,
  submitQuiz,
  getQuizAttempt
};
