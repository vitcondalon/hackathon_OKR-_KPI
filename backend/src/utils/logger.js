function formatMeta(meta = {}) {
  const entries = Object.entries(meta).filter(([, value]) => value !== undefined);
  if (entries.length === 0) {
    return '';
  }

  return ` ${JSON.stringify(Object.fromEntries(entries))}`;
}

function log(level, message, meta) {
  const timestamp = new Date().toISOString();
  const line = `[${timestamp}] [${level}] ${message}${formatMeta(meta)}`;

  if (level === 'ERROR') {
    console.error(line);
    return;
  }

  if (level === 'WARN') {
    console.warn(line);
    return;
  }

  console.log(line);
}

function info(message, meta) {
  log('INFO', message, meta);
}

function warn(message, meta) {
  log('WARN', message, meta);
}

function error(message, meta) {
  log('ERROR', message, meta);
}

module.exports = {
  info,
  warn,
  error
};
