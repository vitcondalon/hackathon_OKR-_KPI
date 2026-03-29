const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const {
  listObjectives,
  getObjectiveById,
  createObjective,
  updateObjective,
  deleteObjective
} = require('../controllers/objectiveController');

const router = express.Router();

router.use(authMiddleware);
router.get('/', listObjectives);
router.post('/', createObjective);
router.get('/:id', getObjectiveById);
router.put('/:id', updateObjective);
router.delete('/:id', deleteObjective);

module.exports = router;
