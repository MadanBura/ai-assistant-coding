const path = require('path');
const fs = require('fs').promises;
const multer = require('multer');
const assignmentService = require('../services/assignmentService');
const AppError = require('../utils/AppError');

// Configure Multer
const storage = multer.memoryStorage();
const uploadSingle = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }
}).single('submissionFile');

const uploadFeedbackFile = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }
}).single('feedbackFile');

const checkFile = (file) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExts = ['.pdf', '.zip', '.doc', '.docx'];
  if (!allowedExts.includes(ext)) {
    throw new AppError('Invalid file type. Only PDF, ZIP, and Word Documents are allowed.', 415);
  }

  const buffer = file.buffer;
  if (!buffer || buffer.length === 0) {
    throw new AppError('File buffer empty.', 400);
  }

  // Magic bytes check
  const pdfBytes = [0x25, 0x50, 0x44, 0x46]; // %PDF
  const zipBytes = [0x50, 0x4B, 0x03, 0x04]; // PK..
  const docBytes = [0xD0, 0xCF, 0x11, 0xE0];

  const matches = (bytes) => bytes.every((b, i) => buffer[i] === b);

  if (ext === '.pdf' && !matches(pdfBytes)) {
    throw new AppError('File signature mismatch for PDF.', 415);
  }
  if ((ext === '.zip' || ext === '.docx') && !matches(zipBytes.slice(0, 2))) {
    throw new AppError('File signature mismatch for ZIP/DOCX.', 415);
  }
  if (ext === '.doc' && !matches(docBytes.slice(0, 4))) {
    throw new AppError('File signature mismatch for DOC.', 415);
  }
};

const saveFile = async (file, category, refId) => {
  const uploadDir = path.join(__dirname, '../../public/uploads');
  await fs.mkdir(uploadDir, { recursive: true });

  const ext = path.extname(file.originalname).toLowerCase();
  const filename = `${category}_${refId}_${Date.now()}${ext}`;
  const filepath = path.join(uploadDir, filename);

  await fs.writeFile(filepath, file.buffer);
  return `/uploads/${filename}`;
};

const createAssignment = async (req, res, next) => {
  try {
    const { topicId, title, description, maxScore, dueDate, referenceFileUrl } = req.body;
    const instructorId = req.user.id;

    const assignment = await assignmentService.createAssignment({
      topicId,
      title,
      description,
      maxScore,
      dueDate,
      referenceFileUrl
    }, instructorId);

    res.status(201).json({
      success: true,
      data: {
        id: assignment._id.toString(),
        topicId: assignment.topicId.toString(),
        title: assignment.title,
        description: assignment.description,
        maxScore: assignment.maxScore,
        dueDate: assignment.dueDate,
        referenceFileUrl: assignment.referenceFileUrl
      }
    });
  } catch (error) {
    next(error);
  }
};

const submitAssignment = (req, res, next) => {
  uploadSingle(req, res, async (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(new AppError('File exceeds the 10MB size limit.', 413));
      }
      return next(err);
    }

    try {
      const assignmentId = req.params.assignmentId || req.params.id;
      const studentId = req.user.id;

      const mongoose = require('mongoose');
      if (!mongoose.Types.ObjectId.isValid(assignmentId)) {
        return next(new AppError('Invalid assignment ID.', 400));
      }

      if (!req.file) {
        return next(new AppError('Submission file is required.', 400));
      }

      // Check extension and magic bytes
      checkFile(req.file);

      // Save file and get relative url
      const submittedFileUrl = await saveFile(req.file, 'submission', studentId);

      const submission = await assignmentService.submitAssignment(assignmentId, studentId, submittedFileUrl);

      res.status(201).json({
        success: true,
        data: {
          id: submission._id.toString(),
          assignmentId: submission.assignmentId.toString(),
          studentId: submission.studentId.toString(),
          submittedFileUrl: submission.submittedFileUrl,
          submittedAt: submission.submittedAt,
          status: submission.status
        }
      });
    } catch (error) {
      next(error);
    }
  });
};

const gradeSubmission = (req, res, next) => {
  uploadFeedbackFile(req, res, async (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(new AppError('File exceeds the 10MB size limit.', 413));
      }
      return next(err);
    }

    try {
      const submissionId = req.params.submissionId || req.params.id;
      const instructorId = req.user.id;

      const mongoose = require('mongoose');
      if (!mongoose.Types.ObjectId.isValid(submissionId)) {
        return next(new AppError('Invalid submission ID.', 400));
      }

      const grade = req.body.grade;
      const feedback = req.body.feedback;

      let feedbackFileUrl = undefined;
      if (req.file) {
        feedbackFileUrl = await saveFile(req.file, 'feedback', submissionId);
      }

      const submission = await assignmentService.gradeSubmission(submissionId, {
        grade,
        feedback,
        feedbackFileUrl
      }, instructorId);

      res.status(200).json({
        success: true,
        data: {
          id: submission._id.toString(),
          status: submission.status,
          grade: submission.grade,
          feedback: submission.feedback,
          feedbackFileUrl: submission.feedbackFileUrl
        }
      });
    } catch (error) {
      next(error);
    }
  });
};

const getAssignmentByTopic = async (req, res, next) => {
  try {
    const topicId = req.query.topicId || req.params.topicId;
    const userId = req.user.id;
    const role = req.user.role;

    if (!topicId) {
      return next(new AppError('Topic ID is required.', 400));
    }

    const assignment = await assignmentService.getAssignmentByTopic(topicId, userId, role);

    res.status(200).json({
      success: true,
      data: assignment ? {
        id: assignment._id.toString(),
        topicId: assignment.topicId.toString(),
        title: assignment.title,
        description: assignment.description,
        maxScore: assignment.maxScore,
        dueDate: assignment.dueDate,
        referenceFileUrl: assignment.referenceFileUrl
      } : null
    });
  } catch (error) {
    next(error);
  }
};

const getSubmission = async (req, res, next) => {
  try {
    const assignmentId = req.params.assignmentId || req.params.id;
    const studentId = req.user.id;

    const submission = await assignmentService.getSubmission(assignmentId, studentId);

    res.status(200).json({
      success: true,
      data: submission ? {
        id: submission._id.toString(),
        assignmentId: submission.assignmentId.toString(),
        studentId: submission.studentId.toString(),
        submittedFileUrl: submission.submittedFileUrl,
        submittedAt: submission.submittedAt,
        status: submission.status,
        grade: submission.grade,
        feedback: submission.feedback,
        feedbackFileUrl: submission.feedbackFileUrl
      } : null
    });
  } catch (error) {
    next(error);
  }
};

const getSubmissions = async (req, res, next) => {
  try {
    const assignmentId = req.params.assignmentId || req.params.id;
    const instructorId = req.user.id;

    const submissions = await assignmentService.getSubmissions(assignmentId, instructorId);

    res.status(200).json({
      success: true,
      data: submissions.map(s => ({
        id: s._id.toString(),
        assignmentId: s.assignmentId.toString(),
        studentId: s.studentId ? {
          id: s.studentId._id.toString(),
          name: s.studentId.name,
          email: s.studentId.email
        } : null,
        submittedFileUrl: s.submittedFileUrl,
        submittedAt: s.submittedAt,
        status: s.status,
        grade: s.grade,
        feedback: s.feedback,
        feedbackFileUrl: s.feedbackFileUrl
      }))
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAssignment,
  submitAssignment,
  gradeSubmission,
  getAssignmentByTopic,
  getSubmission,
  getSubmissions
};
