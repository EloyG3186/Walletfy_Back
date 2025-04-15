/**
 * Middleware para validar las solicitudes antes de procesarlas
 */
const validateRequest = (schema) => {
  return (req, res, next) => {
    try {
      console.log('Validando solicitud con datos:', req.body);
      
      // Validar el cuerpo de la solicitud contra el esquema proporcionado
      const { error, value } = schema.validate(req.body, {
        abortEarly: false, // Recopilar todos los errores, no solo el primero
        stripUnknown: false // No eliminar campos desconocidos
      });
      
      if (error) {
        console.log('Errores de validación:', error.details);
        return res.status(400).json({
          success: false,
          message: 'Error de validación',
          errors: error.details.map(detail => detail.message)
        });
      }
      
      // Actualizar req.body con los valores validados
      req.body = value;
      
      next();
    } catch (err) {
      console.error('Error en validateRequest:', err);
      next(err);
    }
  };
};

module.exports = validateRequest;
