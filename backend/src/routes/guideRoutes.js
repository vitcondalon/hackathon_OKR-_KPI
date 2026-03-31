const express = require('express');
const { getGuideInfo, viewGuide, downloadGuide } = require('../controllers/guideController');

const router = express.Router();

router.get('/user-guide', getGuideInfo);
router.get('/user-guide/view', viewGuide);
router.get('/user-guide/download', downloadGuide);

module.exports = router;
