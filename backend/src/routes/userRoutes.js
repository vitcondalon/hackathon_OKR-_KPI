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
router.get('/', listUsers);
router.post('/', roleMiddleware('admin'), createUser);
router.get('/:id', getUserById);
router.put('/:id', roleMiddleware('admin'), updateUser);
router.delete('/:id', roleMiddleware('admin'), deleteUser);

module.exports = router;
