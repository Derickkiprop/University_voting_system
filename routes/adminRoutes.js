const express = require('express');
const app = express();
const router = express.Router();
const adminController = require('../controllers/adminController');
const ensureAdmin = require('../middleware/adminAuth');

const multer = require('multer');
const upload = multer({ dest: 'uploads/' });


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
router.get('/manageCandidates', ensureAdmin, adminController.manageCandidates);
router.post('/addCandidate', ensureAdmin, upload.single('photo'), adminController.addCandidate);
router.get('/updateCandidate/:id', ensureAdmin, upload.single('photo'), adminController.updateCandidateForm);
router.post('/updateCandidate/:id', ensureAdmin, upload.single('photo'), adminController.updateCandidate);
router.post('/updateCandidate', ensureAdmin, adminController.updateCandidate);
router.post('/deleteCandidate/:id',ensureAdmin, adminController.deleteCandidate);
router.post('/approveCandidate/:id', ensureAdmin, adminController.approveCandidate);
router.post('/declineCandidate/:id', ensureAdmin, adminController.declineCandidate);

// Manage students routes
router.get('/students', ensureAdmin, adminController.manageStudents);
router.get('/manageStudents', ensureAdmin, adminController.manageStudents);
router.get('/updateStudent/:id', ensureAdmin, adminController.updateStudentForm);
router.post('/updateStudent/:id', ensureAdmin, adminController.updateStudent);
router.post('/deleteStudent/:id', ensureAdmin, adminController.deleteStudent);

// Admin search route
router.get('/search', ensureAdmin, adminController.search);

// Election results route 
router.get('/results', ensureAdmin, adminController.showResults);

app.get('/admin/updateProfile', (req, res) => {
    res.render('updateProfile', {
        admin: req.session.user // or wherever the admin data is stored
    });
});

module.exports = router;
