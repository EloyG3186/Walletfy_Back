const Event = require('../models/Event');

// Obtener todos los eventos
exports.getAllEvents = async (req, res) => {
  try {
    // Filtrar por tipo si se proporciona en la consulta
    const filter = {};
    if (req.query.type) {
      filter.type = req.query.type;
    }

    const events = await Event.find(filter).sort({ date: -1 });
    
    res.status(200).json({
      success: true,
      events
    });
  } catch (error) {
    console.error('Error al obtener eventos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener los eventos',
      error: error.message
    });
  }
};

// Obtener un evento por ID
exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Evento no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      event
    });
  } catch (error) {
    console.error('Error al obtener evento por ID:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener el evento',
      error: error.message
    });
  }
};

// Crear un nuevo evento
exports.createEvent = async (req, res) => {
  try {
    const newEvent = new Event(req.body);
    await newEvent.save();
    
    res.status(201).json({
      success: true,
      message: 'Evento creado exitosamente',
      event: newEvent
    });
  } catch (error) {
    console.error('Error al crear evento:', error);
    res.status(400).json({
      success: false,
      message: 'Error al crear el evento',
      error: error.message
    });
  }
};

// Actualizar un evento existente
exports.updateEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Evento no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Evento actualizado exitosamente',
      event
    });
  } catch (error) {
    console.error('Error al actualizar evento:', error);
    res.status(400).json({
      success: false,
      message: 'Error al actualizar el evento',
      error: error.message
    });
  }
};

// Eliminar un evento
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Evento no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Evento eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar evento:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar el evento',
      error: error.message
    });
  }
};

// Obtener resumen de gastos por mes (opcional)
exports.getMonthlyExpenseSummary = async (req, res) => {
  try {
    // Obtener el año y mes de la consulta o usar el mes actual
    const now = new Date();
    const year = parseInt(req.query.year) || now.getFullYear();
    const month = parseInt(req.query.month) || now.getMonth() + 1;
    
    // Calcular timestamps para el primer y último día del mes
    const startDate = new Date(year, month - 1, 1).getTime() / 1000;
    const endDate = new Date(year, month, 0, 23, 59, 59).getTime() / 1000;
    
    // Buscar eventos en el rango de fechas
    const events = await Event.find({
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: 1 });
    
    // Calcular totales
    const summary = {
      totalIncome: 0,
      totalExpense: 0,
      balance: 0,
      events: events
    };
    
    events.forEach(event => {
      if (event.type === 'income') {
        summary.totalIncome += event.amount;
      } else {
        summary.totalExpense += event.amount;
      }
    });
    
    summary.balance = summary.totalIncome - summary.totalExpense;
    
    res.status(200).json({
      success: true,
      summary
    });
  } catch (error) {
    console.error('Error al obtener resumen mensual:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener el resumen mensual',
      error: error.message
    });
  }
};
