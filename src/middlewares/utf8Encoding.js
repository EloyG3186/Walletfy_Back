/**
<<<<<<< HEAD
 * Middleware para asegurar la codificación UTF-8 en todas las respuestas
=======
 * Middleware para asegurar la codificacion UTF-8 en todas las respuestas
>>>>>>> 6cafcb5a073de74189b94d0efffd0f96a288afd6
 */
const utf8Encoding = (req, res, next) => {
  // Configurar encabezados para UTF-8
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  
<<<<<<< HEAD
  // Preservar el método json original
  const originalJson = res.json;
  
  // Sobrescribir el método json para asegurar que los datos se codifiquen correctamente
=======
  // Preservar el metodo json original
  const originalJson = res.json;
  
  // Sobrescribir el metodo json para asegurar que los datos se codifiquen correctamente
>>>>>>> 6cafcb5a073de74189b94d0efffd0f96a288afd6
  res.json = function(obj) {
    return originalJson.call(this, obj);
  };
  
  next();
};

module.exports = utf8Encoding;
