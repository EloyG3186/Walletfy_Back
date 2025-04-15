const Event = require('../models/Event');

/**
 * Obtener años y meses con transacciones
 */
exports.getTransactionPeriods = async (req, res) => {
  try {
    // Buscar todos los eventos del usuario
    const events = await Event.find({ user: req.user._id });
    
    // Extraer años y meses únicos
    const periods = {};
    
    events.forEach(event => {
      const date = new Date(event.date * 1000);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      
      if (!periods[year]) {
        periods[year] = new Set();
      }
      
      periods[year].add(month);
    });
    
    // Convertir a formato adecuado para el frontend
    const result = Object.keys(periods).map(year => ({
      year: parseInt(year),
      months: Array.from(periods[year]).sort((a, b) => a - b)
    })).sort((a, b) => b.year - a.year); // Ordenar años de más reciente a más antiguo
    
    return res.json({
      success: true,
      periods: result
    });
    
  } catch (error) {
    console.error('Error al obtener períodos de transacciones:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener períodos de transacciones',
      error: error.message
    });
  }
};

/**
 * Obtener estadísticas de gastos e ingresos por día
 */
exports.getDailyExpenseStats = async (req, res) => {
  try {
    // Obtener parámetros de consulta (año y mes)
    const now = new Date();
    const year = parseInt(req.query.year) || now.getFullYear();
    const month = parseInt(req.query.month) || now.getMonth() + 1;
    
    // Calcular timestamps para el primer y último día del mes
    const startDate = new Date(year, month - 1, 1).getTime() / 1000;
    const endDate = new Date(year, month, 0, 23, 59, 59).getTime() / 1000;
    
    console.log(`Obteniendo estadísticas diarias para: ${year}-${month}`);
    console.log(`Rango de fechas: ${startDate} - ${endDate}`);
    console.log(`Usuario: ${req.user._id}`);
    
    // Buscar todos los eventos (gastos e ingresos) en el rango de fechas para el usuario autenticado
    const events = await Event.find({
      user: req.user._id,
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: 1 });
    
    console.log(`Eventos encontrados: ${events.length}`);
    
    // Agrupar eventos por día y tipo
    const dailyStats = {};
    
    // Procesar eventos por día
    events.forEach(event => {
      const date = new Date(event.date * 1000);
      const day = date.getDate();
      const dayStr = day.toString();
      const isIncome = event.type === 'income';
      
      if (!dailyStats[dayStr]) {
        dailyStats[dayStr] = {
          day: dayStr,
          dayName: `Día ${day}`,
          income: 0,
          expense: 0,
          total: 0
        };
      }
      
      if (isIncome) {
        dailyStats[dayStr].income += event.amount;
        dailyStats[dayStr].total += event.amount;
      } else {
        dailyStats[dayStr].expense += event.amount;
        dailyStats[dayStr].total -= event.amount;
      }
    });
    
    // Convertir a arrays para el frontend (solo días con datos)
    const statsArray = Object.values(dailyStats);
    
    // Ordenar por día
    statsArray.sort((a, b) => parseInt(a.day) - parseInt(b.day));
    
    // Extraer datos para el formato esperado por el frontend
    const labels = statsArray.map(stat => stat.dayName);
    const data = statsArray.map(stat => stat.expense); // Mantenemos compatibilidad con el frontend actual
    
    // Datos adicionales para el nuevo formato
    const incomeData = statsArray.map(stat => stat.income);
    const expenseData = statsArray.map(stat => stat.expense);
    const balanceData = statsArray.map(stat => stat.total);
    
    // Calcular totales
    const totalIncome = incomeData.reduce((sum, amount) => sum + amount, 0);
    const totalExpense = expenseData.reduce((sum, amount) => sum + amount, 0);
    const totalBalance = totalIncome - totalExpense;
    
    return res.json({
      success: true,
      stats: {
        labels,
        data,
        total: totalExpense, // Mantenemos compatibilidad con el frontend actual
        // Datos adicionales para el nuevo formato
        incomeData,
        expenseData,
        balanceData,
        totalIncome,
        totalExpense,
        totalBalance,
        detailedStats: statsArray
      }
    });
  } catch (error) {
    console.error('Error al obtener estadísticas diarias:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas diarias',
      error: error.message
    });
  }
};

/**
 * Obtener estadísticas de gastos e ingresos semanales
 */
exports.getWeeklyExpenseStats = async (req, res) => {
  try {
    // Obtener parámetros de consulta (año y mes)
    const now = new Date();
    const year = parseInt(req.query.year) || now.getFullYear();
    const month = parseInt(req.query.month) || now.getMonth() + 1;
    
    // Calcular timestamps para el primer y último día del mes
    const startDate = new Date(year, month - 1, 1).getTime() / 1000;
    const endDate = new Date(year, month, 0, 23, 59, 59).getTime() / 1000;
    
    console.log(`Obteniendo estadísticas semanales para: ${year}-${month}`);
    console.log(`Rango de fechas: ${startDate} - ${endDate}`);
    console.log(`Usuario: ${req.user._id}`);
    
    // Buscar todos los eventos (gastos e ingresos) en el rango de fechas para el usuario autenticado
    const events = await Event.find({
      user: req.user._id,
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: 1 });
    
    console.log(`Eventos encontrados: ${events.length}`);
    
    // Agrupar eventos por semana y tipo
    const weeklyStats = {};
    
    // Obtener el primer día del mes
    const firstDayOfMonth = new Date(year, month - 1, 1);
    const firstDayOfWeek = firstDayOfMonth.getDay(); // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
    
    // Procesar eventos por semana
    events.forEach(event => {
      const date = new Date(event.date * 1000);
      const day = date.getDate();
      
      // Calcular la semana (1-5)
      const week = Math.ceil((day + firstDayOfWeek) / 7);
      const weekStr = week.toString();
      const isIncome = event.type === 'income';
      
      if (!weeklyStats[weekStr]) {
        weeklyStats[weekStr] = {
          week: weekStr,
          weekName: `Semana ${week}`,
          income: 0,
          expense: 0,
          total: 0
        };
      }
      
      if (isIncome) {
        weeklyStats[weekStr].income += event.amount;
        weeklyStats[weekStr].total += event.amount;
      } else {
        weeklyStats[weekStr].expense += event.amount;
        weeklyStats[weekStr].total -= event.amount;
      }
    });
    
    // Convertir a arrays para el frontend (solo semanas con datos)
    const statsArray = Object.values(weeklyStats);
    
    // Ordenar por semana
    statsArray.sort((a, b) => parseInt(a.week) - parseInt(b.week));
    
    // Extraer datos para el formato esperado por el frontend
    const labels = statsArray.map(stat => stat.weekName);
    const data = statsArray.map(stat => stat.expense); // Mantenemos compatibilidad con el frontend actual
    
    // Datos adicionales para el nuevo formato
    const incomeData = statsArray.map(stat => stat.income);
    const expenseData = statsArray.map(stat => stat.expense);
    const balanceData = statsArray.map(stat => stat.total);
    
    // Calcular totales
    const totalIncome = incomeData.reduce((sum, amount) => sum + amount, 0);
    const totalExpense = expenseData.reduce((sum, amount) => sum + amount, 0);
    const totalBalance = totalIncome - totalExpense;
    
    return res.json({
      success: true,
      stats: {
        labels,
        data,
        total: totalExpense, // Mantenemos compatibilidad con el frontend actual
        // Datos adicionales para el nuevo formato
        incomeData,
        expenseData,
        balanceData,
        totalIncome,
        totalExpense,
        totalBalance,
        detailedStats: statsArray
      }
    });
  } catch (error) {
    console.error('Error al obtener estadísticas semanales:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas semanales',
      error: error.message
    });
  }
};

/**
 * Obtener estadísticas de gastos e ingresos por categoría
 */
exports.getCategoryExpenseStats = async (req, res) => {
  try {
    // Obtener parámetros de consulta (año y mes)
    const now = new Date();
    const year = parseInt(req.query.year) || now.getFullYear();
    const month = parseInt(req.query.month) || now.getMonth() + 1;
    
    // Calcular timestamps para el primer y último día del mes
    const startDate = new Date(year, month - 1, 1).getTime() / 1000;
    const endDate = new Date(year, month, 0, 23, 59, 59).getTime() / 1000;
    
    console.log(`Obteniendo estadísticas por categoría para: ${year}-${month}`);
    console.log(`Rango de fechas: ${startDate} - ${endDate}`);
    console.log(`Usuario: ${req.user._id}`);
    
    // Buscar todos los eventos (gastos e ingresos) en el rango de fechas para el usuario autenticado
    const events = await Event.find({
      user: req.user._id,
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: 1 });
    
    console.log(`Eventos encontrados: ${events.length}`);
    
    // Agrupar eventos por categoría y tipo
    const categoryStats = {};
    const incomeCategories = {};
    const expenseCategories = {};
    
    // Procesar eventos por categoría
    events.forEach(event => {
      const category = event.category || 'Sin categoría';
      const isIncome = event.type === 'income';
      
      // Agrupar por tipo para mantener estadísticas separadas
      if (isIncome) {
        if (!incomeCategories[category]) {
          incomeCategories[category] = 0;
        }
        incomeCategories[category] += event.amount;
      } else {
        if (!expenseCategories[category]) {
          expenseCategories[category] = 0;
        }
        expenseCategories[category] += event.amount;
      }
      
      // Agrupar para estadísticas detalladas
      if (!categoryStats[category]) {
        categoryStats[category] = {
          category,
          income: 0,
          expense: 0,
          total: 0
        };
      }
      
      if (isIncome) {
        categoryStats[category].income += event.amount;
        categoryStats[category].total += event.amount;
      } else {
        categoryStats[category].expense += event.amount;
        categoryStats[category].total -= event.amount;
      }
    });
    
    // Convertir a arrays para el frontend (solo categorías con datos)
    const statsArray = Object.values(categoryStats);
    
    // Ordenar por monto total (de mayor a menor)
    statsArray.sort((a, b) => Math.abs(b.total) - Math.abs(a.total));
    
    // Extraer datos para el formato esperado por el frontend
    const labels = statsArray.map(stat => stat.category);
    const data = statsArray.map(stat => stat.expense); // Mantenemos compatibilidad con el frontend actual
    
    // Datos adicionales para el nuevo formato
    const incomeData = statsArray.map(stat => stat.income);
    const expenseData = statsArray.map(stat => stat.expense);
    const balanceData = statsArray.map(stat => stat.total);
    
    // Calcular totales
    const totalIncome = incomeData.reduce((sum, amount) => sum + amount, 0);
    const totalExpense = expenseData.reduce((sum, amount) => sum + amount, 0);
    const totalBalance = totalIncome - totalExpense;
    
    return res.json({
      success: true,
      stats: {
        labels,
        data,
        total: totalExpense, // Mantenemos compatibilidad con el frontend actual
        // Datos adicionales para el nuevo formato
        incomeData,
        expenseData,
        balanceData,
        totalIncome,
        totalExpense,
        totalBalance,
        detailedStats: statsArray
      }
    });
  } catch (error) {
    console.error('Error al obtener estadísticas por categoría:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas por categoría',
      error: error.message
    });
  }
};
