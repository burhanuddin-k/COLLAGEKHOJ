// Wraps async route handlers so rejected promises reach the central
// error middleware instead of crashing the process or hanging the request.
function asyncHandler(fn) {
  return function wrapped(req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

class ApiError extends Error {
  constructor(statusCode, message, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }

  static badRequest(message, details) { return new ApiError(400, message, details); }
  static unauthorized(message = 'Unauthorized') { return new ApiError(401, message); }
  static forbidden(message = 'Forbidden') { return new ApiError(403, message); }
  static notFound(message = 'Not found') { return new ApiError(404, message); }
  static conflict(message) { return new ApiError(409, message); }
  static internal(message = 'Internal server error') { return new ApiError(500, message); }
}

module.exports = { asyncHandler, ApiError };
