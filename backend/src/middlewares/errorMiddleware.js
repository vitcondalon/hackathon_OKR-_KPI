const { ZodError } = require('zod');

function notFoundMiddleware(req, res) {
  res.status(404).json({ success: false, message: 'Route not found' });
}

function errorMiddleware(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  if (error instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message
      }))
    });
  }

  const status = Number(error.status) || 500;
  const message = error.message || 'Internal Server Error';

  if (status >= 500) {
    console.error(error);
  }

  return res.status(status).json({ success: false, message });
}

module.exports = {
  notFoundMiddleware,
  errorMiddleware
};
