const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const { listCycles, createCycle, updateCycle } = require('../controllers/cycleController');

const router = express.Router();

router.use(authMiddleware);
router.get('/', listCycles);
router.post('/', roleMiddleware('admin', 'manager'), createCycle);
router.put('/:id', roleMiddleware('admin', 'manager'), updateCycle);

module.exports = router;
