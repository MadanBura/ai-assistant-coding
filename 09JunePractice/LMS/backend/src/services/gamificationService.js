const Badge = require('../models/Badge');
const UserBadge = require('../models/UserBadge');
const Course = require('../models/Course');
const AppError = require('../utils/AppError');
const { checkCourseOwnership } = require('./courseService');

const createBadge = async ({ courseId, title, description, iconUrl, triggerType }, instructorId) => {
  await checkCourseOwnership(courseId, instructorId);

  const badge = new Badge({
    courseId,
    title,
    description,
    iconUrl,
    triggerType
  });

  await badge.save();
  return badge;
};

const getUserBadges = async (userId) => {
  const userBadges = await UserBadge.find({ userId }).populate('badgeId');
  
  // Format to match exact required response shape:
  // [ { badgeId: { id, title, description, iconUrl }, unlockedAt } ]
  return userBadges.filter(ub => ub.badgeId).map(ub => ({
    badgeId: {
      id: ub.badgeId._id.toString(),
      courseId: ub.badgeId.courseId.toString(),
      title: ub.badgeId.title,
      description: ub.badgeId.description,
      iconUrl: ub.badgeId.iconUrl
    },
    unlockedAt: ub.unlockedAt
  }));
};

const getInstructorBadges = async (instructorId) => {
  const courses = await Course.find({ instructorId }, '_id');
  const courseIds = courses.map(c => c._id);
  const badges = await Badge.find({ courseId: { $in: courseIds } }).sort({ createdAt: -1 });
  
  return badges.map(b => ({
    id: b._id.toString(),
    courseId: b.courseId.toString(),
    title: b.title,
    description: b.description,
    iconUrl: b.iconUrl,
    triggerType: b.triggerType,
    createdAt: b.createdAt
  }));
};

const unlockBadge = async (userId, badgeId, session) => {
  try {
    const userBadge = new UserBadge({ userId, badgeId });
    await userBadge.save({ session });
  } catch (err) {
    if (err.code !== 11000) {
      console.error('Error unlocking badge:', err);
    }
  }
};

const evaluateQuizBadge = async (studentId, topicId, score) => {
  if (score !== 100) return;

  try {
    const Topic = require('../models/Topic');
    const Module = require('../models/Module');
    const topic = await Topic.findById(topicId);
    if (!topic) return;

    const moduleObj = await Module.findById(topic.moduleId);
    if (!moduleObj) return;

    const courseId = moduleObj.courseId;
    const badges = await Badge.find({ courseId, triggerType: 'PerfectQuizzes' });

    for (const b of badges) {
      await unlockBadge(studentId, b._id);
    }
  } catch (e) {
    console.error('Quiz badge evaluation failed:', e);
  }
};

const evaluateCourseCompletionBadge = async (userId, courseId, progressPercent, session) => {
  if (progressPercent !== 100) return;

  try {
    const badge = await Badge.findOne({ courseId, triggerType: 'CourseCompletion' }).session(session);
    if (badge) {
      await unlockBadge(userId, badge._id, session);
    }
  } catch (e) {
    console.error('Course completion badge evaluation failed:', e);
  }
};

module.exports = {
  createBadge,
  getUserBadges,
  getInstructorBadges,
  evaluateQuizBadge,
  evaluateCourseCompletionBadge
};
