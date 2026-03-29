const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const {
  summary,
  progress,
  risks,
  topPerformers,
  charts
} = require('../controllers/dashboardController');

const router = express.Router();

router.use(authMiddleware);
router.get('/summary', summary);
router.get('/progress', progress);
router.get('/risks', risks);
router.get('/top-performers', topPerformers);
router.get('/charts', charts);

module.exports = router;
