const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const { listCheckins, createCheckin } = require('../controllers/checkinController');

const router = express.Router();

router.use(authMiddleware);
router.get('/', listCheckins);
router.post('/', createCheckin);

module.exports = router;
