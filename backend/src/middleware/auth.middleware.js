const { verifyToken } = require('../utils/jwt');
const { ApiError } = require('../utils/apiError');

// Requires a valid JWT. Attaches { id, role, email } to req.user.
function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return next(ApiError.unauthorized('Missing or malformed Authorization header'));
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    return next();
  } catch (err) {
    return next(ApiError.unauthorized('Invalid or expired token'));
  }
}

// Optional auth — attaches req.user if a valid token is present,
// but does not reject the request otherwise. Useful for endpoints
// that behave differently for logged-in users (e.g. "is this saved?").
function optionalAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme === 'Bearer' && token) {
    try {
      req.user = verifyToken(token);
    } catch (err) {
      // ignore invalid token for optional auth
    }
  }
  return next();
}

// Usage: requireRole('admin') or requireRole('admin', 'college')
function requireRole(...allowedRoles) {
  return function (req, res, next) {
    if (!req.user) return next(ApiError.unauthorized());
    if (!allowedRoles.includes(req.user.role)) {
      return next(ApiError.forbidden('You do not have permission to perform this action'));
    }
    return next();
  };
}

module.exports = { requireAuth, optionalAuth, requireRole };
