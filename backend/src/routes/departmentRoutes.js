const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const {
  listDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment
} = require('../controllers/departmentController');

const router = express.Router();

router.use(authMiddleware);
router.get('/', listDepartments);
router.post('/', roleMiddleware('admin', 'manager'), createDepartment);
router.put('/:id', roleMiddleware('admin', 'manager'), updateDepartment);
router.delete('/:id', roleMiddleware('admin'), deleteDepartment);

module.exports = router;
