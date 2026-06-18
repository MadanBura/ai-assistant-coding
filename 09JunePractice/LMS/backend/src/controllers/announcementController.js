const announcementService = require('../services/announcementService');

const createAnnouncement = async (req, res, next) => {
  try {
    const courseId = req.body.courseId || req.params.id;
    const { title, content, priority } = req.body;
    const creatorId = req.user.id;

    const data = await announcementService.createAnnouncement(
      { courseId, title, content, priority },
      creatorId
    );

    res.status(201).json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

const getAnnouncements = async (req, res, next) => {
  try {
    const courseId = req.query.courseId || req.params.id;
    const user = req.user;

    const data = await announcementService.getAnnouncements(courseId, user);

    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAnnouncement,
  getAnnouncements
};
