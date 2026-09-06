const { validationResult } = require('express-validator');
const { ApiError } = require('../utils/apiError');

// Runs after an array of express-validator checks; converts failures into
// a single, consistent 400 response instead of scattering ad-hoc checks.
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(ApiError.badRequest('Validation failed', errors.array().map((e) => ({
      field: e.path,
      message: e.msg,
    }))));
  }
  return next();
}

module.exports = { validate };
