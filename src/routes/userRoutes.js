const express = require('express');
const router = express.Router();
const passport = require('passport');
const userController = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');
const validateRequest = require('../middlewares/validateRequest');
const { userRegisterSchema, userLoginSchema, userUpdateSchema } = require('../models/validation');

// Rutas de autenticación local
router.post('/register', validateRequest(userRegisterSchema), userController.registerUser);
router.post('/login', validateRequest(userLoginSchema), userController.loginUser);

// Rutas de perfil de usuario
router.get('/profile', protect, userController.getUserProfile);
router.put('/profile', protect, validateRequest(userUpdateSchema), userController.updateUserProfile);

// Rutas de autenticación con Google
router.get('/auth/google', 
  passport.authenticate('google', { scope: ['profile', 'email'] })
);
router.get('/auth/google/callback', 
  passport.authenticate('google', { session: false, failureRedirect: '/api/users/auth/error' }),
  userController.googleAuthCallback
);

// Rutas de autenticación con Facebook
router.get('/auth/facebook',
  passport.authenticate('facebook', { scope: ['email'] })
);
router.get('/auth/facebook/callback',
  passport.authenticate('facebook', { session: false, failureRedirect: '/api/users/auth/error' }),
  userController.facebookAuthCallback
);

// Ruta para manejar errores de autenticación
router.get('/auth/error', (req, res) => {
  res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/error?message=${encodeURIComponent('Error en la autenticación con el proveedor externo. Por favor, intente nuevamente.')}`);
});

module.exports = router;
