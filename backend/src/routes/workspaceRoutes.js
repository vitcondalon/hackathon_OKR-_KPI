const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const {
  bootstrap,
  createPeriod,
  createReview,
  addReviewItem,
  updateReviewItem,
  addReviewComment,
  applyReviewAction
} = require('../controllers/workspaceController');

const router = express.Router();

router.use(authMiddleware);

router.get('/bootstrap', bootstrap);
router.post('/periods', createPeriod);
router.post('/reviews', createReview);
router.post('/reviews/:reviewId/items', addReviewItem);
router.put('/reviews/:reviewId/items/:itemId', updateReviewItem);
router.post('/reviews/:reviewId/comments', addReviewComment);
router.post('/reviews/:reviewId/actions', applyReviewAction);

module.exports = router;
