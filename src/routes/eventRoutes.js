const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const validateRequest = require('../middlewares/validateRequest');
const { eventCreateSchema, eventUpdateSchema } = require('../models/validation');

// Ruta para obtener todos los eventos y crear un nuevo evento
router.route('/')
  .get(eventController.getAllEvents)
  .post(validateRequest(eventCreateSchema), eventController.createEvent);

// Ruta para obtener, actualizar y eliminar un evento específico por ID
router.route('/:id')
  .get(eventController.getEventById)
  .put(validateRequest(eventUpdateSchema), eventController.updateEvent)
  .delete(eventController.deleteEvent);

// Ruta para obtener el resumen mensual de gastos (opcional)
router.get('/summary/monthly', eventController.getMonthlyExpenseSummary);

module.exports = router;
