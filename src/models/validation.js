const Joi = require('joi');

// Esquema de validaciu00f3n para la creaciu00f3n de eventos
const eventCreateSchema = Joi.object({
  name: Joi.string().required().trim().min(3).max(100)
    .messages({
      'string.empty': 'El nombre no puede estar vacu00edo',
      'string.min': 'El nombre debe tener al menos 3 caracteres',
      'string.max': 'El nombre no puede exceder los 100 caracteres',
      'any.required': 'El nombre es obligatorio'
    }),
  description: Joi.string().required().trim().min(5).max(500)
    .messages({
      'string.empty': 'La descripciu00f3n no puede estar vacu00eda',
      'string.min': 'La descripciu00f3n debe tener al menos 5 caracteres',
      'string.max': 'La descripciu00f3n no puede exceder los 500 caracteres',
      'any.required': 'La descripciu00f3n es obligatoria'
    }),
  date: Joi.number().required().positive()
    .messages({
      'number.base': 'La fecha debe ser un nu00famero (timestamp)',
      'number.positive': 'La fecha debe ser un valor positivo',
      'any.required': 'La fecha es obligatoria'
    }),
  amount: Joi.number().required().precision(2)
    .messages({
      'number.base': 'El monto debe ser un nu00famero',
      'any.required': 'El monto es obligatorio'
    }),
  type: Joi.string().required().valid('income', 'expense')
    .messages({
      'string.empty': 'El tipo no puede estar vacu00edo',
      'any.only': 'El tipo debe ser "income" o "expense"',
      'any.required': 'El tipo es obligatorio'
    }),
  attachment: Joi.string().allow('').default('')
});

// Esquema de validaciu00f3n para la actualizaciu00f3n de eventos
const eventUpdateSchema = Joi.object({
  name: Joi.string().trim().min(3).max(100)
    .messages({
      'string.empty': 'El nombre no puede estar vacu00edo',
      'string.min': 'El nombre debe tener al menos 3 caracteres',
      'string.max': 'El nombre no puede exceder los 100 caracteres'
    }),
  description: Joi.string().trim().min(5).max(500)
    .messages({
      'string.empty': 'La descripciu00f3n no puede estar vacu00eda',
      'string.min': 'La descripciu00f3n debe tener al menos 5 caracteres',
      'string.max': 'La descripciu00f3n no puede exceder los 500 caracteres'
    }),
  date: Joi.number().positive()
    .messages({
      'number.base': 'La fecha debe ser un nu00famero (timestamp)',
      'number.positive': 'La fecha debe ser un valor positivo'
    }),
  amount: Joi.number().precision(2)
    .messages({
      'number.base': 'El monto debe ser un nu00famero'
    }),
  type: Joi.string().valid('income', 'expense')
    .messages({
      'string.empty': 'El tipo no puede estar vacu00edo',
      'any.only': 'El tipo debe ser "income" o "expense"'
    }),
  attachment: Joi.string().allow('').default('')
});

module.exports = {
  eventCreateSchema,
  eventUpdateSchema
};
