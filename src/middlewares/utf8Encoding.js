/**
 * Middleware para asegurar la codificación UTF-8 en todas las respuestas
 */
const utf8Encoding = (req, res, next) => {
  // Configurar encabezados para UTF-8
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  
  // Preservar el método json original
  const originalJson = res.json;
  
  // Sobrescribir el método json para asegurar que los datos se codifiquen correctamente
  res.json = function(obj) {
    return originalJson.call(this, obj);
  };
  
  next();
};

module.exports = utf8Encoding;
