const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const validateRequest = require('../middlewares/validateRequest');
const { protect } = require('../middlewares/authMiddleware');
const { eventCreateSchema, eventUpdateSchema } = require('../models/validation');

// Aplicar middleware de autenticación a todas las rutas
router.use(protect);

// Ruta para obtener todos los eventos y crear un nuevo evento
router.route('/')
  .get(eventController.getAllEvents)
  .post(validateRequest(eventCreateSchema), eventController.createEvent);

// Ruta para obtener el resumen mensual de gastos (opcional)
router.get('/summary/monthly', eventController.getMonthlyExpenseSummary);

// Ruta para obtener, actualizar y eliminar un evento específico por ID
router.route('/:id')
  .get(eventController.getEventById)
  .put(validateRequest(eventUpdateSchema), eventController.updateEvent)
  .delete(eventController.deleteEvent);

module.exports = router;
