const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const { chat, suggestions, questions, summary, insights, health } = require('../controllers/funnyController');

const router = express.Router();

router.use(authMiddleware);
router.get('/health', roleMiddleware('admin', 'manager', 'employee'), health);
router.get('/suggestions', roleMiddleware('admin', 'manager', 'employee'), suggestions);
router.get('/questions', roleMiddleware('admin', 'manager', 'employee'), questions);
router.get('/summary', roleMiddleware('admin', 'manager', 'employee'), summary);
router.get('/insights', roleMiddleware('admin', 'manager', 'employee'), insights);
router.post('/chat', roleMiddleware('admin', 'manager', 'employee'), chat);

module.exports = router;
