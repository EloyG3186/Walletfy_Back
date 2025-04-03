const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre es obligatorio'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'La descripción es obligatoria'],
    trim: true
  },
  date: {
    type: Number, // Timestamp en formato Unix como lo usa el frontend
    required: [true, 'La fecha es obligatoria']
  },
  amount: {
    type: Number,
    required: [true, 'El monto es obligatorio']
  },
  type: {
    type: String,
    enum: ['income', 'expense'],
    required: [true, 'El tipo es obligatorio']
  },
  attachment: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Event', EventSchema);
