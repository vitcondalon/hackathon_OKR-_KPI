const fs = require('fs');
const path = require('path');
const { pool } = require('../src/config/db');

async function runSqlFile(client, filePath) {
  const sql = fs.readFileSync(filePath, 'utf8');
  await client.query(sql);
}

async function run() {
  const client = await pool.connect();

  try {
    const schemaPath = path.resolve(__dirname, '../../database/schema.sql');
    const seedPath = path.resolve(__dirname, '../../database/seed.sql');

    await runSqlFile(client, schemaPath);
    await runSqlFile(client, seedPath);

    console.log('Schema and seed executed successfully.');
    console.log('Demo accounts:');
    console.log('ADM-001@company / Admin@123');
    console.log('MGR-ENG-001@company / Manager@123');
    console.log('MGR-SAL-001@company / Manager@123');
    console.log('MGR-HR-001@company / Manager@123');
    console.log('HR-001@company / Manager@123');
    console.log('EMP-ENG-001@company / Employee@123');
    console.log('EMP-SAL-001@company / Employee@123');
    console.log('EMP-HR-001@company / Employee@123');
    console.log('');
    console.log('Massive demo data generated:');
    console.log('- Bulk employees: EMP-<DEPT>-002 .. EMP-<DEPT>-500');
    console.log('- Bulk usernames: emp.<dept-lower>.002 .. emp.<dept-lower>.500');
    console.log('- Bulk password: Employee@123');
    console.log('- Departments with bulk data: ENG, SAL, HR');
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch(async (error) => {
  console.error('Seed failed:', error);
  await pool.end();
  process.exit(1);
});
