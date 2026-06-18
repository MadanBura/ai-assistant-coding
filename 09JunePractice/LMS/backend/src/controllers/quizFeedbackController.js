const quizFeedbackService = require('../services/quizFeedbackService');
const AppError = require('../utils/AppError');

const setupQuiz = async (req, res, next) => {
  try {
    const { topicId, questions, releaseRule } = req.body;
    const instructorId = req.user.id;

    const quiz = await quizFeedbackService.setupQuiz(topicId, { questions, releaseRule }, instructorId);

    res.status(201).json({
      success: true,
      data: {
        id: quiz._id.toString(),
        topicId: quiz.topicId.toString(),
        releaseRule: quiz.releaseRule,
        questions: quiz.questions.map(q => ({
          questionText: q.questionText,
          options: q.options,
          correctOptionIndex: q.correctOptionIndex,
          explanation: q.explanation
        }))
      }
    });
  } catch (error) {
    next(error);
  }
};

const submitQuiz = async (req, res, next) => {
  try {
    const topicId = req.params.topicId || req.body.topicId;
    const { answers } = req.body;
    const studentId = req.user.id;

    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(topicId)) {
      return next(new AppError('Invalid topic ID.', 400));
    }

    const data = await quizFeedbackService.submitQuiz(topicId, { answers }, studentId);

    res.status(200).json({
      success: true,
      ...data
    });
  } catch (error) {
    next(error);
  }
};

const getQuizAttempt = async (req, res, next) => {
  try {
    const attemptId = req.params.attemptId || req.params.id;
    const studentId = req.user.id;

    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(attemptId)) {
      return next(new AppError('Invalid attempt ID.', 400));
    }

    const data = await quizFeedbackService.getQuizAttempt(attemptId, studentId);

    res.status(200).json({
      success: true,
      ...data
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  setupQuiz,
  submitQuiz,
  getQuizAttempt
};
