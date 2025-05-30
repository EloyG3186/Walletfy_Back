const Event = require('../models/Event');

// Obtener todos los eventos del usuario autenticado
exports.getAllEvents = async (req, res) => {
  try {
    console.log('Usuario autenticado:', req.user._id);
    
    // Filtrar solo por el ID del usuario
    const filter = { user: req.user._id };
    
    // Solo filtrar por tipo si es 'income' o 'expense'
    if (req.query.type && (req.query.type === 'income' || req.query.type === 'expense')) {
      filter.type = req.query.type;
      console.log(`Filtrando por tipo: ${req.query.type}`);
    } else if (req.query.type) {
      console.log(`Ignorando filtro de tipo inválido: ${req.query.type}`);
    }
    
    console.log('Filtro de búsqueda final:', filter);
    
    // Contar total de eventos en la base de datos (para depuración)
    const totalEvents = await Event.countDocuments({});
    console.log('Total de eventos en la base de datos:', totalEvents);
    
    // Contar eventos del usuario sin filtro de tipo
    const userEvents = await Event.countDocuments({ user: req.user._id });
    console.log('Total de eventos del usuario:', userEvents);
    
    const events = await Event.find(filter).sort({ date: -1 });
    console.log('Eventos encontrados para el usuario con filtros:', events.length);
    
    res.status(200).json({
      success: true,
      count: events.length,
      events: events || [] // Asegura que siempre sea un array
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
    const event = await Event.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    
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
    // Validar que los campos requeridos estén presentes
    const requiredFields = ['name', 'description', 'date', 'amount', 'type'];
    const missingFields = [];
    
    for (const field of requiredFields) {
      if (req.body[field] === undefined || req.body[field] === null || req.body[field] === '') {
        missingFields.push(field);
      }
    }
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Error de validación',
        errors: [`Campos requeridos faltantes: ${missingFields.join(', ')}`]
      });
    }
    
    // Validar que los tipos de datos sean correctos
    if (typeof req.body.date !== 'number') {
      return res.status(400).json({
        success: false,
        message: 'Error de validación',
        errors: [`El campo 'date' debe ser un número (timestamp). Valor recibido: ${typeof req.body.date}`]
      });
    }
    
    if (typeof req.body.amount !== 'number') {
      return res.status(400).json({
        success: false,
        message: 'Error de validación',
        errors: [`El campo 'amount' debe ser un número. Valor recibido: ${typeof req.body.amount}`]
      });
    }
    
    if (req.body.type !== 'income' && req.body.type !== 'expense') {
      return res.status(400).json({
        success: false,
        message: 'Error de validación',
        errors: [`El campo 'type' debe ser 'income' o 'expense'. Valor recibido: ${req.body.type}`]
      });
    }
    
    // Log para depuración
    console.log('Datos del evento a crear:', JSON.stringify(req.body, null, 2));
    
    const newEvent = new Event({
      ...req.body,
      user: req.user._id
    });
    
    await newEvent.save();
    
    res.status(201).json({
      success: true,
      message: 'Evento creado exitosamente',
      event: newEvent
    });
  } catch (error) {
    console.error('Error al crear evento:', error);
    
    // Manejar errores de validación de mongoose
    if (error.name === 'ValidationError') {
      const validationErrors = Object.keys(error.errors).map(field => {
        return `${field}: ${error.errors[field].message}`;
      });
      
      return res.status(400).json({
        success: false,
        message: 'Error de validación',
        errors: validationErrors
      });
    }
    
    res.status(400).json({
      success: false,
      message: 'Error al crear el evento',
      errors: [error.message]
    });
  }
};

// Actualizar un evento existente
exports.updateEvent = async (req, res) => {
  try {
    const event = await Event.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
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
    const event = await Event.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });
    
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
    
    // Buscar eventos en el rango de fechas para el usuario autenticado
    const events = await Event.find({
      user: req.user._id,
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
