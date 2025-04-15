const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');
const auth = require('../middlewares/authMiddleware');

// Todas las rutas de estadísticas requieren autenticación
router.use(auth.protect);

// Rutas para estadísticas
router.get('/periods', statsController.getTransactionPeriods);
router.get('/daily', statsController.getDailyExpenseStats);
router.get('/weekly', statsController.getWeeklyExpenseStats);
router.get('/category', statsController.getCategoryExpenseStats);

module.exports = router;
