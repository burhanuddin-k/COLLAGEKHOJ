const logger = require('../utils/logger');
const { ApiError } = require('../utils/apiError');

function notFoundHandler(req, res, next) {
  next(ApiError.notFound(`Route ${req.method} ${req.originalUrl} not found`));
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const isApiError = err instanceof ApiError;
  const statusCode = isApiError ? err.statusCode : 500;

  logger.error(err.message, {
    statusCode,
    path: req.originalUrl,
    method: req.method,
    stack: err.stack,
  });

  // Never leak raw DB errors, stack traces, or internal messages to the client.
  const safeMessage = isApiError || statusCode < 500
    ? err.message
    : 'Something went wrong on our end. Please try again shortly.';

  res.status(statusCode).json({
    success: false,
    error: {
      message: safeMessage,
      details: isApiError ? err.details : undefined,
    },
  });
}

module.exports = { notFoundHandler, errorHandler };
