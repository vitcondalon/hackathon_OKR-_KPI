const path = require('path');
const fs = require('fs');
const { sendSuccess } = require('../utils/response');

const guidePath = path.resolve(__dirname, '../../../USER_GUIDE.md');

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function markdownToHtml(markdown) {
  const lines = String(markdown || '').replace(/\r/g, '').split('\n');
  const html = [];
  let inList = false;

  function closeList() {
    if (inList) {
      html.push('</ul>');
      inList = false;
    }
  }

  lines.forEach((line) => {
    const trimmed = line.trim();

    if (!trimmed) {
      closeList();
      return;
    }

    if (trimmed === '---') {
      closeList();
      html.push('<hr />');
      return;
    }

    if (trimmed.startsWith('### ')) {
      closeList();
      html.push(`<h3>${escapeHtml(trimmed.slice(4))}</h3>`);
      return;
    }

    if (trimmed.startsWith('## ')) {
      closeList();
      html.push(`<h2>${escapeHtml(trimmed.slice(3))}</h2>`);
      return;
    }

    if (trimmed.startsWith('# ')) {
      closeList();
      html.push(`<h1>${escapeHtml(trimmed.slice(2))}</h1>`);
      return;
    }

    if (trimmed.startsWith('- ') || /^\d+\.\s+/.test(trimmed)) {
      if (!inList) {
        html.push('<ul>');
        inList = true;
      }
      const content = trimmed.replace(/^\d+\.\s+/, '').replace(/^- /, '');
      html.push(`<li>${escapeHtml(content)}</li>`);
      return;
    }

    closeList();
    html.push(`<p>${escapeHtml(trimmed)}</p>`);
  });

  closeList();
  return html.join('\n');
}

function buildGuideHtml() {
  const markdown = fs.readFileSync(guidePath, 'utf8');
  const content = markdownToHtml(markdown);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>OKR/KPI User Guide</title>
  <style>
    :root {
      color-scheme: light;
      --page: #f3f6fb;
      --paper: #ffffff;
      --line: #dbe5f3;
      --text: #162031;
      --muted: #5a6478;
      --brand: #246bff;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: Manrope, "Segoe UI", sans-serif;
      color: var(--text);
      background:
        radial-gradient(circle at 10% 0, rgba(36,107,255,0.16), transparent 20%),
        linear-gradient(180deg, #f9fbff 0%, var(--page) 100%);
    }
    .toolbar {
      position: sticky;
      top: 0;
      z-index: 10;
      padding: 16px;
      display: flex;
      justify-content: center;
    }
    .toolbar a {
      text-decoration: none;
      font-weight: 700;
      font-size: 14px;
      color: white;
      background: var(--brand);
      border-radius: 999px;
      padding: 11px 18px;
      box-shadow: 0 12px 24px rgba(36,107,255,0.24);
    }
    .page-wrap {
      display: flex;
      justify-content: center;
      padding: 12px 16px 40px;
    }
    .page {
      width: 100%;
      max-width: 880px;
      background: var(--paper);
      border: 1px solid var(--line);
      border-radius: 24px;
      padding: 42px 44px;
      box-shadow: 0 22px 55px rgba(15,23,42,0.08);
    }
    h1, h2, h3 { line-height: 1.2; color: #0f172a; }
    h1 { margin: 0 0 14px; font-size: 33px; }
    h2 { margin: 28px 0 10px; font-size: 22px; padding-top: 10px; border-top: 1px solid var(--line); }
    h3 { margin: 18px 0 8px; font-size: 16px; }
    p, li { font-size: 15px; line-height: 1.72; color: var(--text); }
    p { margin: 9px 0; }
    ul { margin: 10px 0 16px; padding-left: 22px; }
    hr { border: 0; border-top: 1px solid var(--line); margin: 22px 0; }
    code {
      font-family: Consolas, "Courier New", monospace;
      background: #eef4ff;
      color: #1f4fb8;
      border-radius: 7px;
      padding: 2px 6px;
      font-size: 0.92em;
    }
    @media (max-width: 900px) {
      .page { padding: 28px 20px; border-radius: 18px; }
      h1 { font-size: 28px; }
    }
  </style>
</head>
<body>
  <div class="toolbar">
    <a href="/api/guides/user-guide/download">Download PDF</a>
  </div>
  <div class="page-wrap">
    <main class="page">
      ${content}
    </main>
  </div>
</body>
</html>`;
}

function escapePdfText(value) {
  return String(value)
    .replaceAll('\\', '\\\\')
    .replaceAll('(', '\\(')
    .replaceAll(')', '\\)');
}

function wrapText(text, maxLength = 88) {
  const words = String(text || '').split(/\s+/).filter(Boolean);
  if (words.length === 0) return [''];

  const lines = [];
  let current = '';

  words.forEach((word) => {
    const next = current ? `${current} ${word}` : word;
    if (next.length <= maxLength) {
      current = next;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  });

  if (current) lines.push(current);
  return lines;
}

function markdownToPdfLines(markdown) {
  const sourceLines = String(markdown || '').replace(/\r/g, '').split('\n');
  const output = [];

  sourceLines.forEach((line) => {
    const trimmed = line.trim();

    if (!trimmed || trimmed === '---') {
      output.push('');
      return;
    }

    if (trimmed.startsWith('# ')) {
      output.push(trimmed.slice(2).toUpperCase());
      output.push('');
      return;
    }

    if (trimmed.startsWith('## ')) {
      output.push(trimmed.slice(3).toUpperCase());
      output.push('');
      return;
    }

    if (trimmed.startsWith('### ')) {
      output.push(trimmed.slice(4));
      return;
    }

    if (trimmed.startsWith('- ')) {
      wrapText(`- ${trimmed.slice(2)}`, 82).forEach((wrapped) => output.push(wrapped));
      return;
    }

    if (/^\d+\.\s+/.test(trimmed)) {
      wrapText(trimmed, 82).forEach((wrapped) => output.push(wrapped));
      return;
    }

    wrapText(trimmed, 88).forEach((wrapped) => output.push(wrapped));
  });

  return output;
}

function buildPdfBuffer(lines) {
  const pageWidth = 595;
  const pageHeight = 842;
  const startX = 54;
  const startY = 790;
  const lineHeight = 16;
  const linesPerPage = 44;
  const pages = [];

  for (let index = 0; index < lines.length; index += linesPerPage) {
    pages.push(lines.slice(index, index + linesPerPage));
  }

  if (pages.length === 0) {
    pages.push(['User guide is empty.']);
  }

  const objects = [];
  const pageObjectIds = [];
  const contentObjectIds = [];

  objects[1] = '<< /Type /Catalog /Pages 2 0 R >>';
  objects[2] = null;

  let nextObjectId = 3;
  pages.forEach(() => {
    pageObjectIds.push(nextObjectId);
    nextObjectId += 1;
    contentObjectIds.push(nextObjectId);
    nextObjectId += 1;
  });
  const fontObjectId = nextObjectId;

  pages.forEach((pageLines, pageIndex) => {
    const contentCommands = ['BT', '/F1 11 Tf', `${startX} ${startY} Td`, `${lineHeight} TL`];
    pageLines.forEach((line, lineIndex) => {
      if (lineIndex > 0) contentCommands.push('T*');
      contentCommands.push(`(${escapePdfText(line)}) Tj`);
    });
    contentCommands.push('ET');

    const stream = contentCommands.join('\n');
    const contentObjectId = contentObjectIds[pageIndex];
    const pageObjectId = pageObjectIds[pageIndex];

    objects[contentObjectId] = `<< /Length ${Buffer.byteLength(stream, 'utf8')} >>\nstream\n${stream}\nendstream`;
    objects[pageObjectId] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Contents ${contentObjectId} 0 R /Resources << /Font << /F1 ${fontObjectId} 0 R >> >> >>`;
  });

  objects[2] = `<< /Type /Pages /Kids [${pageObjectIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${pageObjectIds.length} >>`;
  objects[fontObjectId] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>';

  let pdf = '%PDF-1.4\n';
  const offsets = [0];

  for (let objectId = 1; objectId < objects.length; objectId += 1) {
    offsets[objectId] = Buffer.byteLength(pdf, 'utf8');
    pdf += `${objectId} 0 obj\n${objects[objectId]}\nendobj\n`;
  }

  const xrefOffset = Buffer.byteLength(pdf, 'utf8');
  pdf += `xref\n0 ${objects.length}\n`;
  pdf += '0000000000 65535 f \n';

  for (let objectId = 1; objectId < objects.length; objectId += 1) {
    pdf += `${String(offsets[objectId]).padStart(10, '0')} 00000 n \n`;
  }

  pdf += `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return Buffer.from(pdf, 'utf8');
}

function getGuideMetadata() {
  return {
    name: 'USER_GUIDE.pdf',
    view_path: '/api/guides/user-guide/view',
    download_path: '/api/guides/user-guide/download',
    format: 'pdf'
  };
}

function getGuideInfo(req, res) {
  return sendSuccess(
    res,
    {
      title: 'OKR/KPI User Guide',
      view_url: '/api/guides/user-guide/view',
      download_url: '/api/guides/user-guide/download'
    },
    'Guide endpoint ready',
    200,
    getGuideMetadata()
  );
}

function viewGuide(req, res) {
  return res.type('text/html; charset=utf-8').send(buildGuideHtml());
}

function downloadGuide(req, res) {
  const markdown = fs.readFileSync(guidePath, 'utf8');
  const pdfLines = markdownToPdfLines(markdown);
  const pdfBuffer = buildPdfBuffer(pdfLines);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="USER_GUIDE.pdf"');
  res.setHeader('Content-Length', pdfBuffer.length);
  return res.send(pdfBuffer);
}

module.exports = {
  getGuideInfo,
  viewGuide,
  downloadGuide
};
