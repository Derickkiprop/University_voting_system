const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const ensureAdmin = require('../middleware/adminAuth');
// Admin authentication routes
router.get('/register', adminController.showRegisterPage);
router.post('/register',  adminController.register);
router.get('/login', adminController.showLoginPage);
router.post('/login', adminController.login);
router.get('/logout', ensureAdmin, adminController.logout);

// Admin dashboard route
router.get('/dashboard', ensureAdmin, adminController.showDashboard);

// Admin profile routes
router.get('/profile', ensureAdmin, adminController.showProfile);
router.post('/profile', ensureAdmin, adminController.updateProfile);

// Manage candidates routes
router.get('/candidates', ensureAdmin, adminController.manageCandidates);
router.post('/addCandidate', ensureAdmin, adminController.addCandidate);
router.post('/updateCandidate', ensureAdmin, adminController.updateCandidate);
router.post('/deleteCandidate/:id',ensureAdmin, adminController.deleteCandidate);
router.post('/approveCandidate/:id', ensureAdmin, adminController.approveCandidate);

// Manage students routes
router.get('/students', ensureAdmin, adminController.manageStudents);
router.post('/updateStudent', ensureAdmin, adminController.updateStudent);
router.post('/deleteStudent/:id', ensureAdmin, adminController.deleteStudent);

// Admin search route
router.get('/search', ensureAdmin, adminController.search);

module.exports = router;
