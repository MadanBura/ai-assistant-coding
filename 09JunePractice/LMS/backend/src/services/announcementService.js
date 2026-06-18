const Announcement = require('../models/Announcement');
const Course = require('../models/Course');
const Progress = require('../models/Progress');
const AppError = require('../utils/AppError');

const createAnnouncement = async ({ courseId, title, content, priority }, creatorId) => {
  const course = await Course.findById(courseId);
  if (!course) {
    throw new AppError('Course not found', 404);
  }

  if (course.instructorId.toString() !== creatorId) {
    throw new AppError('Only the owning instructor can modify this course.', 403);
  }

  const announcement = new Announcement({
    courseId,
    title,
    content,
    priority,
    creatorId
  });

  await announcement.save();

  return {
    id: announcement._id.toString(),
    courseId: announcement.courseId.toString(),
    title: announcement.title,
    content: announcement.content,
    priority: announcement.priority,
    creatorId: announcement.creatorId.toString(),
    createdAt: announcement.createdAt
  };
};

const getAnnouncements = async (courseId, user) => {
  const course = await Course.findById(courseId);
  if (!course) {
    throw new AppError('Course not found', 404);
  }

  if (user.role === 'Learner') {
    const progress = await Progress.findOne({ userId: user.id, courseId });
    if (!progress) {
      throw new AppError('Access denied. You must enroll in this course to view announcements.', 403);
    }
  } else if (user.role === 'Instructor') {
    if (course.instructorId.toString() !== user.id) {
      throw new AppError('Only the owning instructor can view these announcements.', 403);
    }
  }

  const announcements = await Announcement.find({ courseId }).sort({ createdAt: -1 });

  return announcements.map(a => ({
    id: a._id.toString(),
    title: a.title,
    content: a.content,
    priority: a.priority,
    createdAt: a.createdAt
  }));
};

module.exports = {
  createAnnouncement,
  getAnnouncements
};
