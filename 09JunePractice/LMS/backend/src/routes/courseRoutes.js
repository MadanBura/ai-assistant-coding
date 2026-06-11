const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const analyticsController = require('../controllers/analyticsController');
const { verifyToken, verifyRole } = require('../middlewares/authMiddleware');

// Course CRUD
router.get('/courses', verifyToken, courseController.getAllCourses);
router.post('/courses', verifyToken, verifyRole('Instructor'), courseController.createCourse);
router.get('/courses/:id', verifyToken, courseController.getCourseById);
router.put('/courses/:id', verifyToken, verifyRole('Instructor'), courseController.updateCourse);
router.delete('/courses/:id', verifyToken, verifyRole('Instructor'), courseController.deleteCourse);

// Curriculum design
router.post('/courses/:id/modules', verifyToken, verifyRole('Instructor'), courseController.addModule);
router.put('/courses/:id/curriculum/reorder', verifyToken, verifyRole('Instructor'), courseController.reorderModules);
router.post('/modules/:moduleId/topics', verifyToken, verifyRole('Instructor'), courseController.addTopic);

// Resource Management
router.post('/topics/:topicId/resources', verifyToken, verifyRole('Instructor'), courseController.addResource);
router.put('/resources/:id', verifyToken, verifyRole('Instructor'), courseController.updateResource);

// Analytics
router.get('/courses/:id/analytics', verifyToken, verifyRole('Instructor'), analyticsController.getCourseAnalytics);

module.exports = router;
