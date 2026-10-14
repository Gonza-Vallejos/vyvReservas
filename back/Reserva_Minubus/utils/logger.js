const LEVELS = { debug: 10, info: 20, warn: 30, error: 40 };
const write = (level, event, metadata = {}) => {
  const configuredLevel = process.env.LOG_LEVEL || 'info';
  if (LEVELS[level] < (LEVELS[configuredLevel] || LEVELS.info)) return;

  const entry = {
    timestamp: new Date().toISOString(),
    level,
    event,
    ...metadata,
  };

  // JSON facilita buscar por requestId, usuarioId o código de error.
  const output = JSON.stringify(entry);
  if (level === 'error') console.error(output);
  else if (level === 'warn') console.warn(output);
  else console.log(output);
};

const errorDetails = (error) => ({
  errorName: error?.name,
  errorMessage: error?.message,
  errorStack: process.env.NODE_ENV === 'development' ? error?.stack : undefined,
});

module.exports = {
  debug: (event, metadata) => write('debug', event, metadata),
  info: (event, metadata) => write('info', event, metadata),
  warn: (event, metadata) => write('warn', event, metadata),
  error: (event, metadata) => write('error', event, metadata),
  errorDetails,
};
