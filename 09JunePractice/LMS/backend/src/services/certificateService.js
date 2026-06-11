const mongoose = require('mongoose');
const Certificate = require('../models/Certificate');
const Course = require('../models/Course');
const User = require('../models/User');
const Progress = require('../models/Progress');
const AppError = require('../utils/AppError');
const { generatePDFBuffer } = require('../utils/pdfGenerator');

const generateCertificatePDF = async (courseId, userId) => {
  // 1. Fetch course details
  const course = await Course.findById(courseId);
  if (!course) {
    throw new AppError('Course not found', 404);
  }

  // 2. Fetch progress details
  const progress = await Progress.findOne({ userId, courseId });
  if (!progress) {
    throw new AppError('Learner is not enrolled in this course.', 403);
  }

  // 3. Verify final exam is passed
  if (!progress.finalExamPassed) {
    throw new AppError('Certificate unavailable. You must pass the final examination first.', 403);
  }

  // 4. Find or create certificate record
  let certRecord = await Certificate.findOne({ userId, courseId });
  if (!certRecord) {
    const uniqueId = 'CERT-LMS-' + new mongoose.Types.ObjectId().toString().toUpperCase();
    try {
      certRecord = new Certificate({
        certificateId: uniqueId,
        userId,
        courseId,
        issuedAt: new Date()
      });
      await certRecord.save();
    } catch (err) {
      // Handle parallel hits race condition resulting in 11000 duplicate key error
      if (err.code === 11000) {
        certRecord = await Certificate.findOne({ userId, courseId });
        if (!certRecord) {
          throw new AppError('Internal database error during certificate mapping', 500);
        }
      } else {
        throw err;
      }
    }
  }

  // 5. Query latest user name from database
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  // 6. Generate the PDF buffer
  const formattedDate = certRecord.issuedAt.toISOString().split('T')[0];
  const pdfBuffer = generatePDFBuffer({
    name: user.name,
    courseTitle: course.title,
    date: formattedDate,
    certificateId: certRecord.certificateId
  });

  // Construct dynamic safe filename (replace spaces/special characters with underscores)
  const safeTitle = course.title.replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `${safeTitle}_Certificate.pdf`;

  return {
    pdfBuffer,
    filename,
    certificateId: certRecord.certificateId
  };
};

module.exports = {
  generateCertificatePDF
};
