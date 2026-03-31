const insightService = require('../services/insightService');

async function overview(req, res, next) {
  try {
    const payload = await insightService.getInsightOverview(req.user, { limit: 5 });
    return res.json({
      success: true,
      message: 'OK',
      errors: null,
      ...payload
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  overview
};
