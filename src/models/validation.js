const Joi = require('joi');

// Esquema de validación para la creación de eventos
const eventCreateSchema = Joi.object({
  name: Joi.string().required().trim().min(3).max(100)
    .messages({
      'string.empty': 'El nombre no puede estar vacío',
      'string.min': 'El nombre debe tener al menos 3 caracteres',
      'string.max': 'El nombre no puede exceder los 100 caracteres',
      'any.required': 'El nombre es obligatorio'
    }),
  description: Joi.string().required().trim().min(5).max(500)
    .messages({
      'string.empty': 'La descripción no puede estar vacía',
      'string.min': 'La descripción debe tener al menos 5 caracteres',
      'string.max': 'La descripción no puede exceder los 500 caracteres',
      'any.required': 'La descripción es obligatoria'
    }),
  date: Joi.number().required().positive()
    .messages({
      'number.base': 'La fecha debe ser un número (timestamp)',
      'number.positive': 'La fecha debe ser un valor positivo',
      'any.required': 'La fecha es obligatoria'
    }),
  amount: Joi.number().required().precision(2)
    .messages({
      'number.base': 'El monto debe ser un número',
      'any.required': 'El monto es obligatorio'
    }),
  type: Joi.string().required().valid('income', 'expense')
    .messages({
      'string.empty': 'El tipo no puede estar vacío',
      'any.only': 'El tipo debe ser "income" o "expense"',
      'any.required': 'El tipo es obligatorio'
    }),
  attachment: Joi.string().allow('').default('')
});

// Esquema de validación para la actualización de eventos
const eventUpdateSchema = Joi.object({
  name: Joi.string().trim().min(3).max(100)
    .messages({
      'string.empty': 'El nombre no puede estar vacío',
      'string.min': 'El nombre debe tener al menos 3 caracteres',
      'string.max': 'El nombre no puede exceder los 100 caracteres'
    }),
  description: Joi.string().trim().min(5).max(500)
    .messages({
      'string.empty': 'La descripción no puede estar vacía',
      'string.min': 'La descripción debe tener al menos 5 caracteres',
      'string.max': 'La descripción no puede exceder los 500 caracteres'
    }),
  date: Joi.number().positive()
    .messages({
      'number.base': 'La fecha debe ser un número (timestamp)',
      'number.positive': 'La fecha debe ser un valor positivo'
    }),
  amount: Joi.number().precision(2)
    .messages({
      'number.base': 'El monto debe ser un número'
    }),
  type: Joi.string().valid('income', 'expense')
    .messages({
      'string.empty': 'El tipo no puede estar vacío',
      'any.only': 'El tipo debe ser "income" o "expense"'
    }),
  attachment: Joi.string().allow('').default('')
});

// Esquema de validación para el registro de usuarios
const userRegisterSchema = Joi.object({
  firstName: Joi.string().required().trim().min(2).max(50)
    .messages({
      'string.empty': 'El nombre no puede estar vacío',
      'string.min': 'El nombre debe tener al menos 2 caracteres',
      'string.max': 'El nombre no puede exceder los 50 caracteres',
      'any.required': 'El nombre es obligatorio'
    }),
  lastName: Joi.string().required().trim().min(2).max(50)
    .messages({
      'string.empty': 'El apellido no puede estar vacío',
      'string.min': 'El apellido debe tener al menos 2 caracteres',
      'string.max': 'El apellido no puede exceder los 50 caracteres',
      'any.required': 'El apellido es obligatorio'
    }),
  email: Joi.string().required().email().trim().lowercase()
    .messages({
      'string.empty': 'El correo electrónico no puede estar vacío',
      'string.email': 'Por favor ingrese un correo electrónico válido',
      'any.required': 'El correo electrónico es obligatorio'
    }),
  phone: Joi.string().required().trim().min(7).max(15)
    .messages({
      'string.empty': 'El teléfono no puede estar vacío',
      'string.min': 'El teléfono debe tener al menos 7 caracteres',
      'string.max': 'El teléfono no puede exceder los 15 caracteres',
      'any.required': 'El teléfono es obligatorio'
    }),
  password: Joi.string().required().min(6).max(30)
    .messages({
      'string.empty': 'La contraseña no puede estar vacía',
      'string.min': 'La contraseña debe tener al menos 6 caracteres',
      'string.max': 'La contraseña no puede exceder los 30 caracteres',
      'any.required': 'La contraseña es obligatoria'
    }),
  confirmPassword: Joi.string().required().valid(Joi.ref('password'))
    .messages({
      'any.only': 'Las contraseñas no coinciden',
      'any.required': 'La confirmación de contraseña es obligatoria'
    }),
  initialMoney: Joi.alternatives().try(
    Joi.number(),
    Joi.string().custom((value, helpers) => {
      const num = Number(value);
      if (isNaN(num)) {
        return helpers.error('number.base');
      }
      return false;
    })
  ).default(0)
    .messages({
      'number.base': 'El dinero inicial debe ser un número'
    }),
  // Campos opcionales para la autenticación con proveedores externos
  googleId: Joi.string().allow('').optional(),
  facebookId: Joi.string().allow('').optional(),
  profilePicture: Joi.string().allow('').optional()
}).options({ stripUnknown: true });

// Esquema de validación para el inicio de sesión
const userLoginSchema = Joi.object({
  email: Joi.string().required().email().trim().lowercase()
    .messages({
      'string.empty': 'El correo electrónico no puede estar vacío',
      'string.email': 'Por favor ingrese un correo electrónico válido',
      'any.required': 'El correo electrónico es obligatorio'
    }),
  password: Joi.string().required()
    .messages({
      'string.empty': 'La contraseña no puede estar vacía',
      'any.required': 'La contraseña es obligatoria'
    })
});

// Esquema de validación para la actualización de usuarios
const userUpdateSchema = Joi.object({
  firstName: Joi.string().trim().min(2).max(50)
    .messages({
      'string.empty': 'El nombre no puede estar vacío',
      'string.min': 'El nombre debe tener al menos 2 caracteres',
      'string.max': 'El nombre no puede exceder los 50 caracteres'
    }),
  lastName: Joi.string().trim().min(2).max(50)
    .messages({
      'string.empty': 'El apellido no puede estar vacío',
      'string.min': 'El apellido debe tener al menos 2 caracteres',
      'string.max': 'El apellido no puede exceder los 50 caracteres'
    }),
  phone: Joi.string().trim().min(7).max(15)
    .messages({
      'string.empty': 'El teléfono no puede estar vacío',
      'string.min': 'El teléfono debe tener al menos 7 caracteres',
      'string.max': 'El teléfono no puede exceder los 15 caracteres'
    }),
  initialMoney: Joi.number()
    .messages({
      'number.base': 'El dinero inicial debe ser un número'
    }),
  profilePicture: Joi.string().allow('').default('')
});

module.exports = {
  eventCreateSchema,
  eventUpdateSchema,
  userRegisterSchema,
  userLoginSchema,
  userUpdateSchema
};
