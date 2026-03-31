const { verifyToken } = require('../utils/jwt');
const { query } = require('../config/db');
const { sendError } = require('../utils/response');

async function authMiddleware(req, res, next) {
  try {
    const authHeader = String(req.headers.authorization || '').trim();
    const [scheme, token] = authHeader.split(' ');

    if (scheme?.toLowerCase() !== 'bearer' || !token) {
      return sendError(res, 401, 'Unauthorized');
    }

    const decoded = verifyToken(token);
    const userResult = await query(
      `SELECT
         u.id,
         u.employee_code,
         u.username,
         u.email,
         u.full_name,
         u.department_id,
         u.manager_user_id,
         u.is_active,
         r.code AS role,
         r.display_name AS role_name,
         d.name AS department_name
       FROM users u
       JOIN roles r ON r.id = u.role_id
       LEFT JOIN departments d ON d.id = u.department_id
       WHERE u.id = $1 AND u.deleted_at IS NULL`,
      [decoded.userId]
    );

    const user = userResult.rows[0];
    if (!user || !user.is_active) {
      return sendError(res, 401, 'Unauthorized');
    }

    req.user = user;
    return next();
  } catch (error) {
    return sendError(res, 401, 'Invalid or expired token');
  }
}

module.exports = authMiddleware;
