const Admin = require('../models/admin');
const Candidate = require('../models/candidate');
const Student = require('../models/student');
const Vote = require('../models/vote');
const bcrypt = require('bcryptjs');
const db = require('../config/db');

// Show admin dashboard
exports.showDashboard = async (req, res) => {
    try {
        const admin = req.session.user;

        const [totalCandidates, totalStudents] = await Promise.all([
            Candidate.count(),
            Student.count(),
        ]);

        const [votedRows] = await db.execute(`
            SELECT COUNT(DISTINCT student_id) AS votedCount FROM student_votes;
        `);
        const votedCount = votedRows[0]?.votedCount || 0;

        const notVotedCount = totalStudents - votedCount;

        const [candidateVotesRows] = await db.execute(`
            SELECT candidates.name, COUNT(student_votes.candidate_id) AS votes
            FROM candidates
            LEFT JOIN student_votes ON candidates.id = student_votes.candidate_id
            GROUP BY candidates.name;
        `);

        const candidateVotes = candidateVotesRows.map(row => ({
            name: row.name,
            votes: row.votes || 0,
        }));

        console.log('Dashboard Data:', {
            totalCandidates,
            totalStudents,
            votedCount,
            notVotedCount,
            candidateVotes,
        });

        res.render('admin/dashboard', {
            admin,
            totalCandidates,
            totalStudents,
            votedCount,
            notVotedCount,
            candidateVotes,
        });
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.status(500).json({ message: 'Error fetching dashboard data', error });
    }
};


// Show admin profile
exports.showProfile = async (req, res) => {
    try {
        const adminId = req.session.user.id;  // Ensure the admin is logged in and ID is available in session
        if (!adminId) {
            throw new Error('Admin not logged in');
        }

        const admin = await Admin.findById(adminId);
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        res.render('admin/profile', { admin , error: null});
    } catch (error) {
        console.error('Error fetching profile data:', error.message);
        res.status(500).json({ admin: null, message: 'Error fetching profile data', error: error.message });
    }
};

// Update admin profile
exports.updateProfile = async (req, res) => {
    const adminId = req.session.user.id;
    const { username, password } = req.body;

    // Validate the username field (make sure it's not empty)
    if (!username) {
        return res.status(400).json({ message: 'Username is required.' });
    }

    try {
        // Prepare the update object with the provided username
        const updates = { username };

        // If a password is provided, hash it and include it in the update object
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            updates.password_hash = hashedPassword;
        }

        // Call the update method with the updates object
        await Admin.update(adminId, updates);

        // Redirect to the admin profile page
        res.redirect('/admin/profile');
    } catch (error) {
        console.error('Error updating profile:', error.message);
        res.status(500).json({ message: 'Error updating profile', error: error.message });
    }
};



// Search Function
exports.search = async (req, res) => { 
    const query = req.query.query; 
    try { 
        const [results] = await db.execute(` SELECT id, name, email, department, regNo, photo FROM students WHERE name LIKE ? OR email LIKE ? OR department LIKE ? OR regNo LIKE ? `, [`%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`]); 
        res.render('admin/searchResult',
             { admin: req.session.user, query: query, results: results, error: null 
                // Ensure error is defined 
                }); 
            } catch (error) { 
                console.error('Error searching for students:', error.message);
                 res.status(500).render('admin/searchResult',
                     { admin: req.session.user, query: query, results: [], error: 'Error searching for students' });
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

// Update Candidate - Display Form 
exports.updateCandidateForm = async (req, res) => { 
    const candidateId = req.params.id; 
    try { 
        const [candidateRows] = await db.execute('SELECT * FROM candidates WHERE id = ?', [candidateId]); 
        const candidate = candidateRows[0];
         res.render('admin/updateCandidate', 
            { admin: req.session.user, candidate: candidate, error: null 
                // Ensure error is defined 
                });
             } 
             catch (error) {
                 console.error('Error fetching candidate:', error.message);
                  res.status(500).render('admin/updateCandidate', 
                    { admin: req.session.user, error: 'Error fetching candidate', candidate: null });
                 } 
        };

// Update Candidate - Handle Form Submission 
exports.updateCandidate = async (req, res) => { 
    const candidateId = req.params.id;
     const { name, position } = req.body;
      try { 
        let query = 'UPDATE candidates SET name = ?, position = ? WHERE id = ?'; 
        let values = [name, position, candidateId]; 
        // Check if a new photo is uploaded 
        if (req.file) { 
            const photoPath = req.file.path; 
            // Assuming multer is used for file upload
             query = 'UPDATE candidates SET name = ?, position = ?, photo = ? WHERE id = ?'; 
             values = [name, position, photoPath, candidateId]; 
            } 
            await db.execute(query, values); 
            res.redirect('/admin/manageCandidates'); 
        } 
        catch (error) { 
            console.error('Error updating candidate:', error.message);
             res.status(500).render('admin/updateCandidate', 
                {
                     admin: req.session.user, error: 'Error updating candidate',
                     candidate: { id: candidateId, name: req.body.name, position: req.body.position } }); 
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
        await db.execute('UPDATE candidates SET status = ? WHERE id = ?', ['approved', candidateId]); 
        res.redirect('/admin/manageCandidates'); 
    } 
    catch (error) { 
        console.error('Error approving candidate:', error.message);
         res.status(500).render('admin/manageCandidates', 
            { admin: req.session.user, error: 'Error approving candidate', candidates: [] });
         } 
};

// Decline Candidate 
exports.declineCandidate = async (req, res) => {
     const candidateId = req.params.id; 
     try { 
        await db.execute('UPDATE candidates SET status = ? WHERE id = ?', ['declined', candidateId]);
         res.redirect('/admin/manageCandidates');
         } 
         catch (error) { 
            console.error('Error declining candidate:', error.message); 
            res.status(500).render('admin/manageCandidates',
                 { admin: req.session.user, error: 'Error declining candidate', candidates: [] });
                 } 
         };

// Manage students
exports.manageStudents = async (req, res) => { 
    try { 
        const [students] = await db.execute('SELECT * FROM students');
         res.render('admin/manageStudents', { admin: req.session.user, students: students, error: null
             // Ensure error is defined 
             });
             } catch (error) { 
                console.error('Error fetching students:', error);
                 res.status(500).render(
                    'admin/manageStudents', 
                    { admin: req.session.user, error: error.message || 'Error fetching students', students: [] 
                        // Provide an empty array in case of error 
                        
                  }); 
                        } 
                    };

// Update Student - Display Form
 exports.updateStudentForm = async (req, res) => { 
    const studentId = req.params.id;
     try {
         const [studentRows] = await db.execute('SELECT * FROM students WHERE id = ?', [studentId]); 
         const student = studentRows[0]; 
         res.render('admin/updateStudent', { admin: req.session.user, student: student, error: null 
            // Ensure error is defined 
            });
         } catch (error) { 
            console.error('Error fetching student:', error.message);
             res.status(500).render('admin/updateStudent', 
                { admin: req.session.user, 
                    error: 'Error fetching student', student: null });
                 } 
 }; 
                
// Update Student - Handle Form Submission 
exports.updateStudent = async (req, res) => { 
    const studentId = req.params.id;
     const { name, email, department, regNo, password } = req.body;
      try { 
        await db.execute('UPDATE students SET name = ?, email = ?, department = ?, regNo = ?, password = ? WHERE id = ?', [name, email, department, regNo, password, studentId]);
         res.redirect('/admin/students'); 
        } 
        catch (error) { 
            console.error('Error updating student:', error.message);
             res.status(500).render('admin/updateStudent', 
                { admin: req.session.user, error: 'Error updating student', 
                    student: { id: studentId, name, email, department, regNo } });
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
exports.manageCandidates = async (req, res) => { 
    try { 
        const [candidates] = await db.execute('SELECT * FROM candidates');
         res.render('admin/manageCandidates', { admin: req.session.user, candidates: candidates, error: null
             // Ensure error is defined 
             });
             }
              catch (error) { console.error('Error fetching candidates:', error.message); 
                res.status(500).render('admin/manageCandidates',
                     { admin: req.session.user, error: 'Error fetching candidates', candidates: [] }); 
                    } 
                };

// Fetch and Display Election Results 
exports.showResults = async (req, res) => { 
    try {
         const [candidates] = await db.execute('SELECT name, position, vote_count FROM candidates ORDER BY vote_count DESC'); 
         // Find the highest number of votes 
         const maxVotes = Math.max(...candidates.map(candidate => candidate.vote_count)); 
         res.render('admin/results', 
            { admin: req.session.user, candidates: candidates, maxVotes: maxVotes, error: null 
                // Ensure error is defined 
                });
             } 
             catch (error) { 
                console.error('Error fetching election results:', error.message);
                 res.status(500).render('admin/results', 
                    { admin: req.session.user, candidates: [], maxVotes: 0, error: 'Error fetching election results' });
                 } 
};