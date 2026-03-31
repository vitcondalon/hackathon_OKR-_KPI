const { Pool } = require('pg');
const env = require('./env');
const logger = require('../utils/logger');

function isConnectionError(error) {
  const code = String(error?.code || '').toUpperCase();
  return ['ECONNREFUSED', 'ENOTFOUND', 'ETIMEDOUT', '3D000', '28P01'].includes(code);
}

function buildCandidateUrls(connectionString) {
  const candidates = [connectionString];

  try {
    const parsed = new URL(connectionString);
    const host = parsed.hostname;
    const port = parsed.port || '5432';
    const isLocalHost = host === 'localhost' || host === '127.0.0.1';

    if (isLocalHost && (port === '5432' || port === '5433')) {
      const alternate = new URL(connectionString);
      alternate.port = port === '5432' ? '5433' : '5432';
      candidates.push(alternate.toString());
    }
  } catch (error) {
    logger.warn('DATABASE_URL could not be parsed for fallback candidates');
  }

  return Array.from(new Set(candidates));
}

function createPool(connectionString) {
  const nextPool = new Pool({ connectionString });
  nextPool.on('error', (error) => {
    logger.error('Unexpected PostgreSQL pool error', {
      code: error?.code,
      message: error?.message
    });
  });
  return nextPool;
}

const candidateUrls = buildCandidateUrls(env.databaseUrl);
let activeConnectionString = candidateUrls[0];
let activePool = createPool(activeConnectionString);
let failoverAttempted = false;

async function tryFailover() {
  if (failoverAttempted || candidateUrls.length < 2) {
    return false;
  }

  failoverAttempted = true;

  for (const candidate of candidateUrls) {
    if (candidate === activeConnectionString) {
      continue;
    }

    const candidatePool = createPool(candidate);

    try {
      await candidatePool.query('SELECT 1');
      await activePool.end().catch(() => {});
      activePool = candidatePool;
      activeConnectionString = candidate;
      logger.warn('Database connection switched to fallback URL', {
        candidate
      });
      return true;
    } catch (error) {
      await candidatePool.end().catch(() => {});
    }
  }

  return false;
}

async function query(text, params = []) {
  const queryParams = Array.isArray(params) ? params : [];

  try {
    return await activePool.query(text, queryParams);
  } catch (error) {
    if (!isConnectionError(error)) {
      throw error;
    }

    const switched = await tryFailover();
    if (!switched) {
      throw error;
    }

    return activePool.query(text, queryParams);
  }
}

module.exports = {
  get pool() {
    return activePool;
  },
  query
};
