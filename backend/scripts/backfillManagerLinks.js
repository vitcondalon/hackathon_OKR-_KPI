const { pool } = require('../src/config/db');

async function run() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const adminResult = await client.query(
      `SELECT u.id
       FROM users u
       JOIN roles r ON r.id = u.role_id
       WHERE u.deleted_at IS NULL
         AND u.is_active = TRUE
         AND r.code = 'admin'
       ORDER BY u.id ASC
       LIMIT 1`
    );

    const adminUserId = adminResult.rows[0]?.id || null;

    if (adminUserId) {
      await client.query(
        `UPDATE users u
         SET manager_user_id = $1
         FROM roles r
         WHERE r.id = u.role_id
           AND u.deleted_at IS NULL
           AND u.is_active = TRUE
           AND u.manager_user_id IS NULL
           AND r.code IN ('manager', 'hr')`,
        [adminUserId]
      );
    }

    await client.query(
      `UPDATE users u
       SET manager_user_id = d.manager_user_id
       FROM roles r, departments d
       WHERE r.id = u.role_id
         AND d.id = u.department_id
         AND u.deleted_at IS NULL
         AND u.is_active = TRUE
         AND u.manager_user_id IS NULL
         AND r.code = 'employee'
         AND d.manager_user_id IS NOT NULL`
    );

    await client.query('COMMIT');
    console.log('Manager links backfilled successfully.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Manager link backfill failed:', error);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch(async (error) => {
  console.error('Manager link backfill failed:', error);
  await pool.end();
  process.exit(1);
});
