const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const passport = require('passport');
const session = require('express-session');
const cookieParser = require('cookie-parser');
require('dotenv').config();

// Import database connection
const connectDB = require('./src/config/db');

// Import middlewares
const errorHandler = require('./src/middlewares/errorHandler');
const utf8Encoding = require('./src/middlewares/utf8Encoding');

// Import routes
const eventRoutes = require('./src/routes/eventRoutes');
const userRoutes = require('./src/routes/userRoutes');
const statsRoutes = require('./src/routes/statsRoutes');

// Import Passport config
require('./src/config/passport');

// Create Express app
const app = express();

// Middleware
// Usar paquete cors con configuración explícita
app.use(cors({
  // Modo desarrollo: permitir cualquier origen
  origin: function(origin, callback) {
    // Lista de dominios permitidos
    const allowedOrigins = [
      'http://localhost:5173',
      'https://28b1-2800-bf0-8047-1463-8d3d-565e-ef62-6558.ngrok-free.app'
      // Puedes añadir aquí tu nueva URL de ngrok cuando la obtengas
    ];
    
    // En desarrollo, permitir cualquier origen
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    
    // Permitir solicitudes sin origen (como aplicaciones móviles o curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('Origen bloqueado por CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'ngrok-skip-browser-warning']
}));

// Asegurar que preflight OPTIONS funcione correctamente
app.options('*', cors());
app.use(express.json({ charset: 'utf-8' }));
app.use(express.urlencoded({ extended: true, charset: 'utf-8' }));
app.use(morgan('dev'));
app.use(cookieParser());

// Configuración de sesión para Passport
app.use(session({
  secret: process.env.SESSION_SECRET || 'walletfy_session_secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));

// Inicializar Passport
app.use(passport.initialize());
app.use(passport.session());

// Aplicar middleware de codificaciu00f3n UTF-8
app.use(utf8Encoding);

// Welcome route
app.get('/', (req, res) => {
  res.json({
    message: 'Bienvenido a la API de Walletfy',
    version: '1.0.0',
    endpoints: {
      events: '/api/events',
      users: '/api/users',
      stats: '/api/stats'
    }
  });
});

// Routes
app.use('/api/events', eventRoutes);
app.use('/api/users', userRoutes);
app.use('/api/stats', statsRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada'
  });
});

// Error handling middleware
app.use(errorHandler);

// Connect to MongoDB
connectDB();

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
