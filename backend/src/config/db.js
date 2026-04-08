const { Pool } = require('pg');
const env = require('./env');
const logger = require('../utils/logger');

function createPool(connectionString) {
  const pool = new Pool({ connectionString });

  pool.on('error', (error) => {
    logger.error('Unexpected PostgreSQL pool error', {
      code: error?.code,
      message: error?.message
    });
  });

  return pool;
}

const activePool = createPool(env.databaseUrl);

async function query(text, params = []) {
  const queryParams = Array.isArray(params) ? params : [];
  return activePool.query(text, queryParams);
}

module.exports = {
  pool: activePool,
  query
};
