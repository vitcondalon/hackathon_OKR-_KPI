const { pool } = require('../src/config/db');

async function run() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const result = await client.query(
      `UPDATE employee_reviews
       SET rating_level = CASE rating_level
         WHEN 'xuat_sac' THEN 'excellent'
         WHEN 'tot' THEN 'good'
         WHEN 'dat' THEN 'meets_expectations'
         WHEN 'can_cai_thien' THEN 'needs_improvement'
         WHEN 'khong_dat' THEN 'does_not_meet_expectations'
         ELSE rating_level
       END
       WHERE rating_level IN ('xuat_sac', 'tot', 'dat', 'can_cai_thien', 'khong_dat')`
    );

    await client.query('COMMIT');
    console.log(`Rating levels backfilled successfully. Updated ${result.rowCount} review(s).`);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Rating level backfill failed:', error);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch(async (error) => {
  console.error('Rating level backfill failed:', error);
  await pool.end();
  process.exit(1);
});
