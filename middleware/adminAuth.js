function ensureAdmin(req, res, next) {
    if (req.session && req.session.user && req.session.user.role === 'admin') {
        return next();
    }
    res.redirect('/admin/login'); // Redirect to the login page if not authorized
}

module.exports = ensureAdmin;
