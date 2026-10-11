const jwt = require('jsonwebtoken');
const { validateJwtSecret } = require('../util/jwtSecret');

module.exports = function authenticate(req, res, next) {
    const authorization = req.get('Authorization');
    const match = typeof authorization === 'string' && authorization.match(/^Bearer\s+(.+)$/i);
    if (!match) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    let secret;
    try {
        secret = validateJwtSecret();
    } catch (error) {
        error.status = 500;
        return next(error);
    }

    try {
        const payload = jwt.verify(match[1], secret);
        if (typeof payload.sub !== 'string' || !/^[a-f\d]{24}$/i.test(payload.sub)) {
            return res.status(401).json({ error: 'Invalid authentication token' });
        }
        req.user = { userId: payload.sub };
        return next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid authentication token' });
    }
};
