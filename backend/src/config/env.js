const path = require('path');
const dotenv = require('dotenv');

dotenv.config({
  path: path.resolve(__dirname, '../../.env')
});

function required(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

function numberFromEnv(name, fallback, { min = null, integer = false } = {}) {
  const raw = process.env[name];
  const value = raw === undefined || raw === '' ? fallback : Number(raw);

  if (!Number.isFinite(value)) {
    throw new Error(`Invalid numeric env var: ${name}`);
  }

  if (integer && !Number.isInteger(value)) {
    throw new Error(`Invalid integer env var: ${name}`);
  }

  if (min !== null && value < min) {
    throw new Error(`Env var ${name} must be >= ${min}`);
  }

  return value;
}

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  host: process.env.HOST || '0.0.0.0',
  port: numberFromEnv('PORT', 8000, { min: 1, integer: true }),
  apiPrefix: '/api',
  databaseUrl: required('DATABASE_URL'),
  jwtSecret: required('JWT_SECRET'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
  funnyEnabled: process.env.FUNNY_ENABLED !== 'false',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  geminiModel: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
  geminiTimeoutMs: numberFromEnv('GEMINI_TIMEOUT_MS', 8000, { min: 1000, integer: true })
};

module.exports = env;
