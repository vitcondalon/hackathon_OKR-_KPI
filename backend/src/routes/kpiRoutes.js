const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const { listKpis, createKpi, updateKpi, deleteKpi } = require('../controllers/kpiController');

const router = express.Router();

router.use(authMiddleware);
router.get('/', listKpis);
router.post('/', createKpi);
router.put('/:id', updateKpi);
router.delete('/:id', deleteKpi);

module.exports = router;
