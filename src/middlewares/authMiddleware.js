const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { promisify } = require('util');

// Middleware para proteger rutas
exports.protect = async (req, res, next) => {
  try {
    let token;
    
    // Verificar si hay token en los headers
    if (req.headers.authorization ? req.headers.authorization.startsWith('Bearer') : false) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies ?. req.cookies.token) {
      // O verificar si hay token en las cookies
      token = req.cookies.token;
    }
    
    // Verificar si el token existe
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No autorizado, inicie sesión para acceder'
      });
    }
    
    try {
      // Verificar el token (usando promisify para mejor manejo de errores)
      const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET || 'walletfy_secret_key');
      
      // Obtener el usuario del token (excluyendo la contraseña)
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'El usuario asociado a este token ya no existe'
        });
      }
      
      // Verificar si el token fue emitido antes del último cambio de contraseña
      if (user.passwordChangedAt) {
        const changedTimestamp = parseInt(user.passwordChangedAt.getTime() / 1000, 10);
        
        // Si el token fue emitido antes del cambio de contraseña
        if (decoded.iat < changedTimestamp) {
          return res.status(401).json({
            success: false,
            message: 'La contraseña ha sido cambiada recientemente. Por favor, inicie sesión nuevamente'
          });
        }
      }
      
      // Agregar el usuario a la solicitud
      req.user = user;
      next();
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: 'Token inválido. Por favor, inicie sesión nuevamente'
        });
      } else if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Su sesión ha expirado. Por favor, inicie sesión nuevamente'
        });
      } else {
        return res.status(401).json({
          success: false,
          message: 'No autorizado, error en la autenticación'
        });
      }
    }
  } catch (error) {
    console.error('Error en middleware de autenticación:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor',
      error: error.message
    });
  }
};

// Middleware para roles específicos
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({
        success: false,
        message: 'No tiene permisos para realizar esta acción'
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Su rol no tiene permisos para realizar esta acción'
      });
    }
    
    next();
  };
};

// Middleware para verificar la propiedad de un recurso
exports.checkOwnership = (model) => async (req, res, next) => {
  try {
    const resourceId = req.params.id;
    const userId = req.user.id;
    
    const resource = await model.findById(resourceId);
    
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Recurso no encontrado'
      });
    }
    
    // Verificar si el usuario es el propietario del recurso
    if (resource.user && resource.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'No tiene permisos para acceder a este recurso'
      });
    }
    
    next();
  } catch (error) {
    console.error('Error al verificar propiedad:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor',
      error: error.message
    });
  }
};
