const { verifyToken } = require('../utils/jwt');
const { query } = require('../config/db');

async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const [scheme, token] = authHeader.split(' ');

    if (scheme?.toLowerCase() !== 'bearer' || !token) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
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
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    req.user = user;
    return next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
}

module.exports = authMiddleware;
