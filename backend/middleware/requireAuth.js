const { getAuth } = require('@clerk/express');

module.exports = function requireAuth(req, res, next) {
    const { isAuthenticated, userId } = getAuth(req);
    if (!isAuthenticated) {
        return res.status(401).json({ error: 'Não autenticado' });
    }
    req.userId = userId;
    next();
};