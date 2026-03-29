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
    console.log('admin@okr.local / Admin@123');
    console.log('manager.eng@okr.local / Manager@123');
    console.log('manager.sales@okr.local / Manager@123');
    console.log('manager.hr@okr.local / Manager@123');
    console.log('lan@okr.local / Employee@123');
    console.log('nam@okr.local / Employee@123');
    console.log('ha@okr.local / Employee@123');
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
