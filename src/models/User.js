const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: function() {
      // Solo es obligatorio si no hay autenticación externa
      return !this.googleId && !this.facebookId;
    },
    trim: true
  },
  lastName: {
    type: String,
    required: function() {
      // Solo es obligatorio si no hay autenticación externa
      return !this.googleId && !this.facebookId;
    },
    trim: true
  },
  email: {
    type: String,
    required: [true, 'El correo electrónico es obligatorio'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Por favor ingrese un correo electrónico válido']
  },
  phone: {
    type: String,
    required: function() {
      // Solo es obligatorio si no hay autenticación externa
      return !this.googleId && !this.facebookId;
    },
    trim: true
  },
  password: {
    type: String,
    required: function() {
      // Solo es obligatorio si no hay autenticación externa
      return !this.googleId && !this.facebookId;
    },
    minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
    select: false
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },
  facebookId: {
    type: String,
    unique: true,
    sparse: true
  },
  profilePicture: {
    type: String,
    default: ''
  },
  initialMoney: {
    type: Number,
    default: 0
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  passwordChangedAt: Date,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  active: {
    type: Boolean,
    default: true,
    select: false
  }
}, {
  timestamps: true
});

// Encriptar contraseña antes de guardar
UserSchema.pre('save', async function(next) {
  // Solo encriptar si la contraseña ha sido modificada (o es nueva)
  if (!this.isModified('password')) return next();
  
  try {
    // Generar salt
    const salt = await bcrypt.genSalt(10);
    // Encriptar contraseña con salt
    this.password = await bcrypt.hash(this.password, salt);
    
    // Actualizar passwordChangedAt solo si no es un documento nuevo
    if (!this.isNew) {
      this.passwordChangedAt = Date.now() - 1000; // Restar 1 segundo para asegurar que el token se creó después del cambio
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

// Método para comparar contraseñas
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Método para generar token de restablecimiento de contraseña
UserSchema.methods.createPasswordResetToken = function() {
  // Generar token aleatorio
  const resetToken = crypto
    .randomBytes(32)
    .toString('hex');

  // Guardar versión hasheada del token en la base de datos
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Establecer expiración (10 minutos)
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  // Devolver token sin hashear (se enviará por correo)
  return resetToken;
};

// Filtrar usuarios inactivos
UserSchema.pre(/^find/, function(next) {
  // 'this' apunta a la consulta actual
  this.find({ active: { $ne: false } });
  next();
});

module.exports = mongoose.model('User', UserSchema);
