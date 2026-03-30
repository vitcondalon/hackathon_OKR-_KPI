const MAX_MESSAGE_LENGTH = 500;

function stripControlCharacters(value) {
  return value.replace(/[\u0000-\u001F\u007F]/g, ' ');
}

function normalizeWhitespace(value) {
  return value.replace(/\s+/g, ' ').trim();
}

function sanitizeMessage(rawMessage) {
  const asString = typeof rawMessage === 'string' ? rawMessage : '';
  const stripped = stripControlCharacters(asString);
  const normalized = normalizeWhitespace(stripped);
  const cleanedMessage = normalized.slice(0, MAX_MESSAGE_LENGTH);

  const lower = cleanedMessage.toLowerCase();
  const injectionSignals = [
    'ignore previous',
    'system prompt',
    'developer message',
    'reveal env',
    'show env',
    'jwt_secret',
    'database_url',
    'api key',
    'drop table',
    'truncate table'
  ];

  const blockedPatterns = injectionSignals.filter((signal) => lower.includes(signal));

  return {
    cleanedMessage,
    maxLength: MAX_MESSAGE_LENGTH,
    flags: {
      hasPromptInjectionSignal: blockedPatterns.length > 0,
      blockedPatterns
    }
  };
}

module.exports = {
  sanitizeMessage,
  MAX_MESSAGE_LENGTH
};