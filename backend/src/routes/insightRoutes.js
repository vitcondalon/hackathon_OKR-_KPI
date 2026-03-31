const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const { overview } = require('../controllers/insightController');

const router = express.Router();

router.use(authMiddleware);
router.get('/overview', roleMiddleware('admin', 'manager', 'employee'), overview);

module.exports = router;

