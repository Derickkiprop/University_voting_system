function ensureCandidate(req, res, next) {
    if (req.session.user && req.session.user.role === 'candidate') {
        return next();
    }
    res.redirect('/vote/clogin'); // Redirect to the login page if not authorized
}

module.exports = { ensureCandidate };
