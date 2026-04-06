const PRINTABLE_ASCII_REGEX = /^[\x09\x0A\x0D\x20-\x7E]*$/;
const VIETNAMESE_STYLE_PHRASES = [
  'du an',
  'quy trinh',
  'nhan su',
  'phong ban',
  'truong bo phan',
  'quan ly',
  'nhan vien',
  'hieu nang',
  'nang cap',
  'cai tien',
  'sang kien',
  'ky luat',
  'phoi hop',
  'chat luong',
  'thuc dat',
  'ke hoach',
  'tong diem',
  'tong he so',
  'khong dat',
  'can cai thien',
  'xuat sac',
  'muc tieu',
  'ho so',
  'danh gia',
  'chu ky',
  'cap nhat',
  'phe duyet',
  'nhan xet',
  'bao cao'
];
const VIETNAMESE_STYLE_TOKENS = ['tot', 'dat'];

function isBlank(value) {
  return value === null || value === undefined || String(value).trim() === '';
}

function normalizeForLanguageCheck(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function detectVietnameseStyleContent(value) {
  const normalized = normalizeForLanguageCheck(value);
  if (!normalized) {
    return null;
  }

  const padded = ` ${normalized} `;
  for (const phrase of VIETNAMESE_STYLE_PHRASES) {
    if (padded.includes(` ${phrase} `)) {
      return phrase;
    }
  }

  for (const token of VIETNAMESE_STYLE_TOKENS) {
    if (padded.includes(` ${token} `)) {
      return token;
    }
  }

  return null;
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

  const blockedToken = detectVietnameseStyleContent(normalized);
  if (blockedToken) {
    const error = new Error(`${label} must be entered in English only for now. Avoid Vietnamese transliterated content such as "${blockedToken}".`);
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
