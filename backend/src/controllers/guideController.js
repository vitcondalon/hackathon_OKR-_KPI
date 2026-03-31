const path = require('path');
const { sendSuccess } = require('../utils/response');

const guidePath = path.resolve(__dirname, '../../../USER_GUIDE.md');

function getGuideMetadata() {
  return {
    name: 'USER_GUIDE.md',
    path: '/api/guides/user-guide/download',
    format: 'markdown'
  };
}

function getGuideInfo(req, res) {
  return sendSuccess(
    res,
    {
      title: 'OKR/KPI User Guide',
      view_url: '/api/guides/user-guide/raw',
      download_url: '/api/guides/user-guide/download'
    },
    'Guide endpoint ready',
    200,
    getGuideMetadata()
  );
}

function downloadGuide(req, res) {
  return res.download(guidePath, 'USER_GUIDE.md');
}

function rawGuide(req, res) {
  return res.type('text/markdown; charset=utf-8').sendFile(guidePath);
}

module.exports = {
  getGuideInfo,
  downloadGuide,
  rawGuide
};
