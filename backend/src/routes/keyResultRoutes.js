const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const {
  listKeyResults,
  createKeyResult,
  updateKeyResult,
  deleteKeyResult
} = require('../controllers/keyResultController');

const router = express.Router();

router.use(authMiddleware);
router.get('/', listKeyResults);
router.post('/', createKeyResult);
router.put('/:id', updateKeyResult);
router.delete('/:id', deleteKeyResult);

module.exports = router;
