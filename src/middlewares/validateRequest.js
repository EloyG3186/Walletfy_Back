/**
 * Middleware para validar las solicitudes antes de procesarlas
 */
const validateRequest = (schema) => {
  return (req, res, next) => {
    try {
      // Validar el cuerpo de la solicitud contra el esquema proporcionado
      const { error } = schema.validate(req.body);
      
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Error de validaciu00f3n',
          errors: error.details.map(detail => detail.message)
        });
      }
      
      next();
    } catch (err) {
      next(err);
    }
  };
};

module.exports = validateRequest;
