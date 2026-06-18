const gamificationService = require('../services/gamificationService');
const AppError = require('../utils/AppError');

const createBadge = async (req, res, next) => {
  try {
    const courseId = req.body.courseId || req.params.id;
    const { title, description, iconUrl, triggerType } = req.body;
    const instructorId = req.user.id;

    const badge = await gamificationService.createBadge({
      courseId,
      title,
      description,
      iconUrl,
      triggerType
    }, instructorId);

    res.status(201).json({
      success: true,
      data: {
        id: badge._id.toString(),
        courseId: badge.courseId.toString(),
        title: badge.title,
        description: badge.description,
        iconUrl: badge.iconUrl,
        triggerType: badge.triggerType
      }
    });
  } catch (error) {
    next(error);
  }
};

const getUserBadges = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const data = await gamificationService.getUserBadges(userId);

    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

const getInstructorBadges = async (req, res, next) => {
  try {
    const instructorId = req.user.id;
    const data = await gamificationService.getInstructorBadges(instructorId);

    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBadge,
  getUserBadges,
  getInstructorBadges
};
