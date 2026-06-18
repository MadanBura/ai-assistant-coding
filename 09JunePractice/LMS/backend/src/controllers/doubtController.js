const doubtService = require('../services/doubtService');
const AppError = require('../utils/AppError');

const createDoubt = async (req, res, next) => {
  try {
    const { topicId, question } = req.body;
    const studentId = req.user.id;

    const doubt = await doubtService.createDoubt({ topicId, question }, studentId);

    res.status(201).json({
      success: true,
      data: {
        id: doubt._id.toString(),
        topicId: doubt.topicId.toString(),
        studentId: doubt.studentId.toString(),
        question: doubt.question,
        answers: doubt.answers,
        isResolved: doubt.isResolved,
        createdAt: doubt.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

const postAnswer = async (req, res, next) => {
  try {
    const doubtId = req.params.doubtId || req.params.id;
    const { content, isOfficial } = req.body;
    const user = req.user;

    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(doubtId)) {
      return next(new AppError('Invalid doubt ID.', 400));
    }

    const doubt = await doubtService.postAnswer(doubtId, { content, isOfficial }, user);

    res.status(200).json({
      success: true,
      data: {
        id: doubt._id.toString(),
        isResolved: doubt.isResolved,
        answers: doubt.answers.map(a => ({
          repliedBy: a.repliedBy.toString(),
          content: a.content,
          isOfficial: a.isOfficial,
          createdAt: a.createdAt
        }))
      }
    });
  } catch (error) {
    next(error);
  }
};

const getDoubts = async (req, res, next) => {
  try {
    const topicId = req.query.topicId || req.params.topicId;
    const user = req.user;

    if (!topicId) {
      return next(new AppError('Topic ID is required.', 400));
    }

    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(topicId)) {
      return next(new AppError('Invalid topic ID.', 400));
    }

    const doubts = await doubtService.getDoubts(topicId, user);

    res.status(200).json({
      success: true,
      data: doubts.map(d => ({
        id: d._id.toString(),
        topicId: d.topicId.toString(),
        studentId: d.studentId.toString(),
        question: d.question,
        answers: d.answers,
        isResolved: d.isResolved,
        createdAt: d.createdAt
      }))
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createDoubt,
  postAnswer,
  getDoubts
};
