const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generar token JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'walletfy_secret_key', {
    expiresIn: '30d'
  });
};

// Registrar un nuevo usuario
exports.registerUser = async (req, res) => {
  try {
    console.log('Datos recibidos en registerUser:', JSON.stringify(req.body, null, 2));
    
    // Verificar que todos los campos requeridos estén presentes
    if (!req.body.email) {
      return res.status(400).json({
        success: false,
        message: 'El correo electrónico es obligatorio',
        debug: { receivedData: req.body }
      });
    }
    
    if (!req.body.password) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña es obligatoria',
        debug: { receivedData: req.body }
      });
    }
    
    // Extraer confirmPassword y mantener el resto de los datos, incluyendo email
    const { confirmPassword, ...userData } = req.body;

    // Verificar si el usuario ya existe
    const userExists = await User.findOne({ email: userData.email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'El correo electrónico ya está registrado'
      });
    }

    // Verificar que las contraseñas coincidan
    if (req.body.password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Las contraseñas no coinciden'
      });
    }

    // Asegurarse de que initialMoney sea un número
    if (userData.initialMoney && isNaN(Number(userData.initialMoney))) {
      return res.status(400).json({
        success: false,
        message: 'El dinero inicial debe ser un número válido'
      });
    }
    
    // Convertir initialMoney a número si existe
    if (userData.initialMoney) {
      userData.initialMoney = Number(userData.initialMoney);
    }

    // Crear nuevo usuario
    const user = await User.create(userData);

    // Generar token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        initialMoney: user.initialMoney,
        profilePicture: user.profilePicture
      },
      token
    });
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    
    // Proporcionar mensajes de error más específicos
    if (error.name === 'ValidationError') {
      // Error de validación de Mongoose
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: 'Error de validación',
        errors: messages
      });
    }
    
    res.status(400).json({
      success: false,
      message: 'Error al registrar el usuario',
      error: error.message
    });
  }
};

// Iniciar sesión
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Verificar si el usuario existe
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Verificar contraseña
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Generar token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Inicio de sesión exitoso',
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        initialMoney: user.initialMoney,
        profilePicture: user.profilePicture
      },
      token
    });
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    res.status(500).json({
      success: false,
      message: 'Error al iniciar sesión',
      error: error.message
    });
  }
};

// Obtener perfil del usuario
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        initialMoney: user.initialMoney,
        profilePicture: user.profilePicture
      }
    });
  } catch (error) {
    console.error('Error al obtener perfil de usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener el perfil de usuario',
      error: error.message
    });
  }
};

// Actualizar perfil de usuario
exports.updateUserProfile = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Perfil actualizado exitosamente',
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        initialMoney: user.initialMoney,
        profilePicture: user.profilePicture
      }
    });
  } catch (error) {
    console.error('Error al actualizar perfil de usuario:', error);
    res.status(400).json({
      success: false,
      message: 'Error al actualizar el perfil de usuario',
      error: error.message
    });
  }
};

// Autenticación con Google (callback)
exports.googleAuthCallback = async (req, res) => {
  try {
    // El usuario ya está autenticado por Passport
    const token = generateToken(req.user._id);
    
    // Redirigir al frontend con el token
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/success?token=${token}`);
  } catch (error) {
    console.error('Error en autenticación con Google:', error);
    // Redirigir con mensaje de error específico
    const errorMsg = encodeURIComponent('Error al autenticar con Google. Por favor, intente nuevamente.');
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/error?message=${errorMsg}`);
  }
};

// Autenticación con Facebook (callback)
exports.facebookAuthCallback = async (req, res) => {
  try {
    // El usuario ya está autenticado por Passport
    const token = generateToken(req.user._id);
    
    // Redirigir al frontend con el token
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/success?token=${token}`);
  } catch (error) {
    console.error('Error en autenticación con Facebook:', error);
    // Redirigir con mensaje de error específico
    const errorMsg = encodeURIComponent('Error al autenticar con Facebook. Por favor, intente nuevamente.');
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/error?message=${errorMsg}`);
  }
};
