const express = require('express');
const router = express.Router();
const voteController = require('../controllers/voteController');
const {ensureStudent} = require('../middleware/studentAuth');
const {ensureCandidate} = require('../middleware/candidateAuth');

// Route to show the form for adding a new candidate 
router.get('/add', voteController.addCandidatePage);

// Route  for adding a new candidate
router.post('/add', voteController.addCandidate);

// Route to update the vote count of a candidate
router.post('/vote', voteController.updateVoteCount);

// Route to show the candidate login page 
router.get('/clogin', voteController.showLoginPage);

// Route to handle candidate login
 router.post('/clogin', voteController.login);

// Route to display the voting page 
 router.get('/voting', ensureStudent, voteController.showVotingPage);

// Route to handle vote submission 
  router.post('/submit', ensureStudent, voteController.submitVote);

// Route to display candidate dashboard
 router.get('/dashboard', ensureCandidate, voteController.showDashboard);

// Route to display candidate profile
  router.get('/profile', ensureCandidate, voteController.showProfile);

// Route to handle profile updates
   router.post('/profile', ensureCandidate, voteController.updateProfile);

// Route to handle logout 
router.get('/logout', (req, res) => { 
  req.session.destroy(err => { if (err) 
    { 
      return res.redirect('/vote/dashboard'); 
    } res.redirect('/vote/clogin');
   });
});

// Route to handle search 
router.get('/search',ensureCandidate,voteController.search);
module.exports = router;
