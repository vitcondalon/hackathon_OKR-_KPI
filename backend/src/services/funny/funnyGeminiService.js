const env = require('../../config/env');

const DEFAULT_TIMEOUT_MS = 8000;

function isConfigured() {
  return Boolean(env.geminiApiKey && env.geminiModel);
}

function getModelName() {
  return env.geminiModel;
}

async function generateAnswer(prompt) {
  if (!isConfigured()) {
    const error = new Error('Gemini is not configured');
    error.code = 'GEMINI_NOT_CONFIGURED';
    throw error;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), env.geminiTimeoutMs || DEFAULT_TIMEOUT_MS);

  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${env.geminiModel}:generateContent?key=${env.geminiApiKey}`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          topP: 0.8,
          maxOutputTokens: 500
        }
      }),
      signal: controller.signal
    });

    if (!response.ok) {
      const text = await response.text();
      const error = new Error(`Gemini request failed with status ${response.status}`);
      error.code = 'GEMINI_HTTP_ERROR';
      error.details = text;
      throw error;
    }

    const payload = await response.json();
    const parts = payload?.candidates?.[0]?.content?.parts || [];
    const answer = parts.map((part) => part.text || '').join('\n').trim();

    if (!answer) {
      const error = new Error('Gemini returned empty answer');
      error.code = 'GEMINI_EMPTY_ANSWER';
      throw error;
    }

    return answer;
  } catch (error) {
    if (error.name === 'AbortError') {
      const timeoutError = new Error('Gemini request timed out');
      timeoutError.code = 'GEMINI_TIMEOUT';
      throw timeoutError;
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

module.exports = {
  isConfigured,
  getModelName,
  generateAnswer
};