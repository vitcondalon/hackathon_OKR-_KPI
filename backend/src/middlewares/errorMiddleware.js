const { ZodError } = require('zod');
const logger = require('../utils/logger');
const { sendError } = require('../utils/response');

function isDatabaseConnectionError(error) {
  if (!error) return false;
  const message = String(error.message || '').toLowerCase();
  const code = String(error.code || '').toUpperCase();

  if (['28P01', 'ECONNREFUSED', 'ENOTFOUND', 'ETIMEDOUT', '3D000'].includes(code)) {
    return true;
  }

  return (
    message.includes('password authentication failed') ||
    message.includes('connection refused') ||
    message.includes('failed to connect') ||
    (message.includes('database') && message.includes('does not exist'))
  );
}

function notFoundMiddleware(req, res) {
  return sendError(res, 404, 'Route not found', [
    {
      path: req.originalUrl,
      message: 'The requested endpoint does not exist'
    }
  ]);
}

function errorMiddleware(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  if (error instanceof ZodError) {
    return sendError(
      res,
      400,
      'Validation error',
      error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message
      }))
    );
  }

  const status = Number(error.status) || 500;
  let message = error.message || 'Internal Server Error';
  let errors = Array.isArray(error.errors) ? error.errors : null;

  if (status >= 500 && isDatabaseConnectionError(error)) {
    return sendError(res, 503, 'Database connection error. Please check backend DATABASE_URL.');
  }

  if (status >= 500) {
    logger.error('Unhandled backend error', {
      method: req.method,
      path: req.originalUrl,
      status,
      message: error.message,
      code: error.code
    });
    message = 'Internal Server Error';
    errors = null;
  }

  return sendError(res, status, message, errors);
}

module.exports = {
  notFoundMiddleware,
  errorMiddleware
};
