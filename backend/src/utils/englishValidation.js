const PRINTABLE_ASCII_REGEX = /^[\x09\x0A\x0D\x20-\x7E]*$/;

function isBlank(value) {
  return value === null || value === undefined || String(value).trim() === '';
}

function assertEnglishBusinessText(value, label = 'This field') {
  if (isBlank(value)) {
    return;
  }

  const normalized = String(value);
  if (!PRINTABLE_ASCII_REGEX.test(normalized)) {
    const error = new Error(`${label} must be entered in English only for now. Use plain English text without Vietnamese accents or locale-specific characters.`);
    error.status = 400;
    throw error;
  }
}

function assertEnglishBusinessPayload(payload, fieldLabels = {}) {
  for (const [field, label] of Object.entries(fieldLabels)) {
    if (Object.prototype.hasOwnProperty.call(payload, field)) {
      assertEnglishBusinessText(payload[field], label);
    }
  }
}

module.exports = {
  assertEnglishBusinessText,
  assertEnglishBusinessPayload
};
