const { sendError } = require('../utils/response');

function roleMiddleware(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 401, 'Unauthorized');
    }

    if (!allowedRoles.includes(req.user.role)) {
      return sendError(res, 403, 'Forbidden');
    }

    return next();
  };
}

module.exports = roleMiddleware;
