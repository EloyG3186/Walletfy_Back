const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

// Import database connection
const connectDB = require('./src/config/db');

// Import middlewares
const errorHandler = require('./src/middlewares/errorHandler');
const utf8Encoding = require('./src/middlewares/utf8Encoding');

// Import routes
const eventRoutes = require('./src/routes/eventRoutes');

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json({ charset: 'utf-8' }));
app.use(express.urlencoded({ extended: true, charset: 'utf-8' }));
app.use(morgan('dev'));

// Aplicar middleware de codificaciu00f3n UTF-8
app.use(utf8Encoding);

// Welcome route
app.get('/', (req, res) => {
  res.json({
    message: 'Bienvenido a la API de Walletfy',
    version: '1.0.0',
    endpoints: {
      events: '/api/events'
    }
  });
});

// Routes
app.use('/api/events', eventRoutes);

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
