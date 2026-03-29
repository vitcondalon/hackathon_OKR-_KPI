const { sendSuccess } = require('../utils/response');
const dashboardService = require('../services/dashboardService');

async function summary(req, res, next) {
  try {
    const data = await dashboardService.getSummary();
    return sendSuccess(res, data);
  } catch (error) {
    return next(error);
  }
}

async function progress(req, res, next) {
  try {
    const data = await dashboardService.getProgressOverview();
    return sendSuccess(res, data);
  } catch (error) {
    return next(error);
  }
}

async function risks(req, res, next) {
  try {
    const data = await dashboardService.getRisks();
    return sendSuccess(res, data);
  } catch (error) {
    return next(error);
  }
}

async function topPerformers(req, res, next) {
  try {
    const data = await dashboardService.getTopPerformers();
    return sendSuccess(res, data);
  } catch (error) {
    return next(error);
  }
}

async function charts(req, res, next) {
  try {
    const data = await dashboardService.getCharts();
    return sendSuccess(res, data);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  summary,
  progress,
  risks,
  topPerformers,
  charts
};
