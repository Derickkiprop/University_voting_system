function ensureStudent(req, res, next) {
    if (req.session.user && req.session.user.role === 'student') {
        return next();
    }
    res.redirect('/auth/login'); // Redirect to the login page if not authorized
}

module.exports = { ensureStudent };
