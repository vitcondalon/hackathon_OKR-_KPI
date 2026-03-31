const express = require('express');
const { getGuideInfo, downloadGuide, rawGuide } = require('../controllers/guideController');

const router = express.Router();

router.get('/user-guide', getGuideInfo);
router.get('/user-guide/raw', rawGuide);
router.get('/user-guide/download', downloadGuide);

module.exports = router;
