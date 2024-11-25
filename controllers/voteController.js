const Candidate = require('../models/candidate');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// Ensure the uploads directory exists
 const uploadDir = path.join(__dirname, '../uploads'); 
 if (!fs.existsSync(uploadDir))
     { fs.mkdirSync(uploadDir); }

// Set storage options for multer
 const storage = multer.diskStorage({
     destination: (req, file, cb) => {
         cb(null, uploadDir); // Use the uploads directory 
         }, 
         filename: (req, file, cb) => { 
            cb(null, Date.now() + path.extname(file.originalname)); // Set file name with timestamp 
            } 
        });

// Initialize multer with storage configuration
 const upload = multer({ storage: storage });

 // Show the form for adding candidates 
 exports.addCandidatePage = (req, res) => { 
    res.render('vote/addCandidate'); // Ensure 'addCandidate' is the correct EJS file 
    };

// Route handler for adding a new candidate
 exports.addCandidate = [upload.single('photo'), async (req, res) => { 
    const { name, position, password } = req.body; 
    const photo = req.file ? req.file.filename : null; 
    try { 
        // Hash the password before storing it 
        const hashedPassword = await bcrypt.hash(password, 10); 
        // Call the model method to add the new candidate
         await Candidate.create({ name, position, photo, password: hashedPassword }); 
         res.redirect('/vote/voting'); } 
         catch (err) { console.error('Error adding new candidate:', err); 
            res.status(500).send('Error adding new candidate'); 
        } 
    }

    ];



// Update vote count
exports.updateVoteCount = async (req, res) => {
  const { candidateId } = req.body;

  if (!candidateId) {
    return res.status(400).json({ message: 'Candidate ID is required' });
  }

  try {
    await Candidate.updateVoteCount(candidateId);
    res.redirect('/vote/voting');
  } catch (error) {
    res.status(500).json({ message: 'Error updating vote count', error });
  }
};

// Show the candidate login page
 exports.showLoginPage = (req, res) => {
     res.render('vote/candLogin'); };

// Candidate login 
exports.login = async (req, res) => {
     const { position, password } = req.body; 
     if (!position || !password) 
        { 
            return res.status(400).json({ message: 'All fields are required' });
        } try { 
            const candidate = await Candidate.findByPosition(position);
             if (!candidate) 
                { 
                    return res.status(400).json({ message: 'Invalid position or password' });
                 } 
                 const isMatch = await bcrypt.compare(password, candidate.password);
                  if (!isMatch) 
                    { 
                        return res.status(400).json({ message: 'Invalid position or password' }); 
                    }
                     // Store candidate info in session
                      req.session.user = { id: candidate.id, position: candidate.position, role: 'candidate' }; 
                      res.redirect('/vote/dashboard');
                     } 
                     catch (error) 
                     { 
                        res.status(500).json({ message: 'Error logging in', error }); 
                    } 
                };

// Show the voting page 
exports.showVotingPage = async (req, res) => { 
    try {
         const candidates = await Candidate.findAll();
         const student = req.session.user;
         // Group candidates by position 
         const categorizedCandidates = candidates.reduce((acc, candidate) => { 
            if (!acc[candidate.position])
                 { acc[candidate.position] = []; 
            } 
            acc[candidate.position].push(candidate); 
            return acc; 
        }, {});
         res.render('vote/voting', { categorizedCandidates , student, error: '' });
         } catch (error) {
             res.status(500).json({ message: 'Error fetching candidates', error }); 
            } 
        };

        
        // Handle vote submission
       exports.submitVote = async (req, res) => {
            const studentId = req.session.user.id;
            const votes = req.body;
        
            try {
                for (const position in votes) {
                    if (votes.hasOwnProperty(position)) {
                        const candidateId = votes[position];
        
                        // Check if the student has already voted for this position
                        const [rows] = await db.execute(
                            'SELECT * FROM student_votes WHERE student_id = ? AND position = ?',
                            [studentId, position]
                        );
                        if (rows.length > 0) {
                            return res.status(400).render('vote/voting', {
                                student: req.session.user,
                                error: `You have already voted for the position: ${position}`,
                                categorizedCandidates: []
                            });
                        }
        
                        // Insert the vote into the student_votes table
                        await db.execute(
                            'INSERT INTO student_votes (student_id, candidate_id, position) VALUES (?, ?, ?)',
                            [studentId, candidateId, position]
                        );
        
                        // Update the vote count for the candidate
                        await Candidate.updateVoteCount(candidateId);
                    }
                }
                res.redirect('/vote/voting');
            } catch (error) {
                console.error('Error submitting vote:', error.message);
                res.status(500).render('vote/voting', {
                    student: req.session.user,
                    error: 'Error submitting vote',
                    categorizedCandidates: []
                });
            }
        };
        

    // Show the candidate dashboard 
    exports.showDashboard = async (req, res) => { 
        try { 
            const candidateId = req.session.user.id; 
            const candidate = await Candidate.findById(candidateId);
             const allCandidates = await Candidate.findAll();
              const candidateVotes = allCandidates.map(c => ({ name: c.name, position: c.position, votes: c.vote_count })); 
              res.render('candidates/dashboard', { candidate, candidateVotes });
             } catch (error) { 
                res.status(500).json({ message: 'Error fetching dashboard data', error });
             }
             }; 
             
    // Show the candidate profile page
     exports.showProfile = async (req, res) => { 
        try { 
            const candidateId = req.session.user.id; 
            const candidate = await Candidate.findById(candidateId); 
            res.render('candidates/profile', { candidate });
         } catch (error) {
             res.status(500).json({ message: 'Error fetching profile data', error });
             } 
            };

   // Handle profile update 
   exports.updateProfile = async (req, res) => { 
    const candidateId = req.session.user.id; 
    const { name, position, photo } = req.body; 
    try { await Candidate.update(candidateId, { name, position, photo }); 
    res.render('candidates/profile'); 
    } catch (error) { 
        res.status(500).json({ message: 'Error updating profile', error }); 
    } 
    };


 // Handle search queries
  exports.search = async (req, res) => {
     try {
         const query = req.query.query; 
         const results = await Candidate.search(query); 
         const candidateId = req.session.user.id; 
         const candidate = await Candidate.findById(candidateId); 
         const student = req.session.user;
         res.render('candidates/searchResults', { query, results, candidate, student});
         } 
         catch (error) { 
            res.status(500).json({ message: 'Error performing search', error });
         } 
        };