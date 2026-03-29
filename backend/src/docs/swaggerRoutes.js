const express = require('express');
const { buildOpenApiSpec } = require('./openapi');

const router = express.Router();

router.get('/openapi.json', (req, res) => {
  res.json(buildOpenApiSpec(req));
});

router.get('/', (req, res) => {
  const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
  const specUrl = `${protocol}://${req.get('host')}/api/docs/openapi.json`;

  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; script-src 'self' https://cdn.jsdelivr.net; font-src 'self' https://cdn.jsdelivr.net; connect-src 'self' https:"
  );

  res.type('html').send(`<!doctype html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>OKR KPI API Docs</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css" />
  <style>
    body { margin: 0; background: #fafafa; }
    .topbar { display: none; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-standalone-preset.js"></script>
  <script src="/api/docs/swagger-init.js"></script>
</body>
</html>`);
});

router.get('/swagger-init.js', (req, res) => {
  const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
  const specUrl = `${protocol}://${req.get('host')}/api/docs/openapi.json`;

  res.type('application/javascript').send(`window.onload = function () {
  window.ui = SwaggerUIBundle({
    url: '${specUrl}',
    dom_id: '#swagger-ui',
    deepLinking: true,
    presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
    layout: 'BaseLayout'
  });
};`);
});

module.exports = router;
