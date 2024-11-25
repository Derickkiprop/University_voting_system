const Admin = require('../models/admin');
const Candidate = require('../models/candidate');
const Student = require('../models/student');
const bcrypt = require('bcryptjs');
const db = require('../config/db');

// Show admin dashboard
exports.showDashboard = async (req, res) => {
    try {
        const admin = req.session.user;
        const [totalCandidates, totalStudents] = await Promise.all([
            Candidate.count(),
            Student.count()
        ]);

        // Calculate voted and not voted counts
        const votedQuery = 'SELECT COUNT(DISTINCT student_id) AS count FROM votes';
        const [votedRows] = await db.execute(votedQuery);
        const votedCount = votedRows[0].count;

        const notVotedCount = totalStudents - votedCount;

        // Retrieve vote counts for each candidate 
        const candidateVotesQuery = ` SELECT candidates.name, COUNT(votes.candidate_id) AS
         votes FROM candidates LEFT JOIN votes ON candidates.id = votes.candidate_id GROUP BY candidates.name `; 
        const [candidateVotesRows] = await db.execute(candidateVotesQuery); 
        const candidateVotes = candidateVotesRows.map(row => ({ name: row.name, votes: row.votes }));

        res.render('admin/dashboard', {
            admin,
            totalCandidates,
            totalStudents,
            votedCount,
            notVotedCount,
            candidateVotes
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching dashboard data', error });
    }
};

// Show admin profile
exports.showProfile = async (req, res) => {
    try {
        const adminId = req.session.user.id;
        const admin = await Admin.findById(adminId);
        res.render('admin/profile', { admin });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching profile data', error });
    }
};

// Update admin profile
exports.updateProfile = async (req, res) => {
    const adminId = req.session.user.id;
    const { name, email, password } = req.body;

    try {
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            await Admin.update(adminId, { name, email, password_hash: hashedPassword });
        } else {
            await Admin.update(adminId, { name, email });
        }
        res.redirect('/admin/profile');
    } catch (error) {
        res.status(500).json({ message: 'Error updating profile', error });
    }
};

// Handle search queries
exports.search = async (req, res) => {
    try {
        const query = req.query.query;
        const results = await Candidate.search(query);
        const admin = req.session.user;

        res.render('admin/searchResults', { query, results, admin });
    } catch (error) {
        res.status(500).json({ message: 'Error performing search', error });
    }
};

// Add candidate
exports.addCandidate = async (req, res) => {
    const { name, position, photo, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await Candidate.create({ name, position, photo, password_hash: hashedPassword });
        res.redirect('/admin/dashboard');
    } catch (error) {
        res.status(500).json({ message: 'Error adding candidate', error });
    }
};

// Update candidate
exports.updateCandidate = async (req, res) => {
    const candidateId = req.params.id;
    const { name, position, photo } = req.body;

    try {
        await Candidate.update(candidateId, { name, position, photo });
        res.redirect('/admin/dashboard');
    } catch (error) {
        res.status(500).json({ message: 'Error updating candidate', error });
    }
};

// Delete candidate
exports.deleteCandidate = async (req, res) => {
    const candidateId = req.params.id;

    try {
        await Candidate.delete(candidateId);
        res.redirect('/admin/dashboard');
    } catch (error) {
        res.status(500).json({ message: 'Error deleting candidate', error });
    }
};

// Approve candidate
exports.approveCandidate = async (req, res) => {
    const candidateId = req.params.id;

    try {
        await Candidate.approve(candidateId);
        res.redirect('/admin/dashboard');
    } catch (error) {
        res.status(500).json({ message: 'Error approving candidate', error });
    }
};

// Manage students
exports.manageStudents = async (req, res) => {
    try {
        const students = await Student.findAll();
        res.render('admin/manageStudents', { admin: req.session.user, students });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching students', error });
    }
};

// Update student
exports.updateStudent = async (req, res) => {
    const studentId = req.params.id;
    const { name, email, department, regNo } = req.body;

    try {
        await Student.update(studentId, { name, email, department, regNo });
        res.redirect('/admin/manageStudents');
    } catch (error) {
        res.status(500).json({ message: 'Error updating student', error });
    }
};

// Delete student
exports.deleteStudent = async (req, res) => {
    const studentId = req.params.id;

    try {
        await Student.delete(studentId);
        res.redirect('/admin/manageStudents');
    } catch (error) {
        res.status(500).json({ message: 'Error deleting student', error });
    }
};

// Show login page
exports.showRegisterPage = (req, res) => {
    res.render('admin/register', { error: '' });
};

// Handle admin registration
exports.register = async (req, res) => {
    const { username, password } = req.body;

    try {
        const existingAdmin = await Admin.findByUsername(username);
        if (existingAdmin) {
            return res.status(400).render('admin/register', { error: 'Username already in use' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        await Admin.create({ username, password_hash: hashedPassword });
        res.redirect('/admin/login');
    } catch (error) {
        console.error('Error registering admin:', error.message);
        res.status(500).render('admin/register', { error: 'An error occurred during registration. Please try again.' });
    }
};

// Show login page
exports.showLoginPage = (req, res) => {
    res.render('admin/login', { error: '' });
};

// Handle admin login
exports.login = async (req, res) => {
    const { username, password } = req.body;

    try {
        const admin = await Admin.findByUsername(username);
        if (!admin) {
            return res.status(400).render('admin/login', { error: 'Invalid username or password' });
        }
        const isMatch = await bcrypt.compare(password, admin.password_hash);
        if (!isMatch) {
            return res.status(400).render('admin/login', { error: 'Invalid username or password' });
        }
        req.session.user = {
            id: admin.id,
            username: admin.username,
            role: 'admin'
        };
        res.redirect('/admin/dashboard');
    } catch (error) {
        console.error('Error logging in admin:', error.message);
        res.status(500).render('admin/login', { error: 'An error occurred during login. Please try again.' });
    }
};

// Handle admin logout
exports.logout = (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.redirect('/admin/dashboard');
        }
        res.redirect('/admin/login');
    });
};

// Show manage candidate page
exports.manageCandidates = (req, res) => {
    res.render('admin/manageCandidate');
};

