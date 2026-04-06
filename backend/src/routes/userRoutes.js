const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const {
  listUsers,
  createUser,
  getUserById,
  updateUser,
  deleteUser
} = require('../controllers/userController');

const router = express.Router();

router.use(authMiddleware);
router.get('/', roleMiddleware('admin'), listUsers);
router.post('/', roleMiddleware('admin'), createUser);
router.get('/:id', roleMiddleware('admin'), getUserById);
router.put('/:id', roleMiddleware('admin'), updateUser);
router.delete('/:id', roleMiddleware('admin'), deleteUser);

module.exports = router;
