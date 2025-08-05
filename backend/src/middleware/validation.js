const Joi = require('joi');

// Generic validation middleware
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error } = schema.validate(req[property], { abortEarly: false });
    
    if (error) {
      const errorMessages = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errorMessages
      });
    }
    
    next();
  };
};

// User validation schemas
const userSchemas = {
  register: Joi.object({
    firstName: Joi.string().min(2).max(50).required(),
    lastName: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])')).required()
      .messages({
        'string.pattern.base': 'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character'
      }),
    role: Joi.string().valid('user', 'manager', 'admin').default('user'),
    phone: Joi.string().pattern(/^[\+]?[1-9][\d]{0,15}$/).optional(),
    department: Joi.string().max(100).optional()
  }),
  
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),
  
  update: Joi.object({
    firstName: Joi.string().min(2).max(50),
    lastName: Joi.string().min(2).max(50),
    phone: Joi.string().pattern(/^[\+]?[1-9][\d]{0,15}$/),
    department: Joi.string().max(100)
  }).min(1)
};

// Project validation schemas
const projectSchemas = {
  create: Joi.object({
    name: Joi.string().min(3).max(200).required(),
    description: Joi.string().max(1000).optional(),
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().greater(Joi.ref('startDate')).required(),
    budget: Joi.number().positive().optional(),
    status: Joi.string().valid('planning', 'active', 'completed', 'cancelled').default('planning'),
    managerId: Joi.string().required(),
    teamMembers: Joi.array().items(Joi.string()).optional(),
    location: Joi.object({
      address: Joi.string().required(),
      city: Joi.string().required(),
      state: Joi.string().required(),
      zipCode: Joi.string().required(),
      coordinates: Joi.object({
        lat: Joi.number().min(-90).max(90),
        lng: Joi.number().min(-180).max(180)
      }).optional()
    }).optional()
  }),
  
  update: Joi.object({
    name: Joi.string().min(3).max(200),
    description: Joi.string().max(1000),
    startDate: Joi.date().iso(),
    endDate: Joi.date().iso(),
    budget: Joi.number().positive(),
    status: Joi.string().valid('planning', 'active', 'completed', 'cancelled'),
    managerId: Joi.string(),
    teamMembers: Joi.array().items(Joi.string()),
    location: Joi.object({
      address: Joi.string().required(),
      city: Joi.string().required(),
      state: Joi.string().required(),
      zipCode: Joi.string().required(),
      coordinates: Joi.object({
        lat: Joi.number().min(-90).max(90),
        lng: Joi.number().min(-180).max(180)
      }).optional()
    })
  }).min(1)
};

// ID parameter validation
const idSchema = Joi.object({
  id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required() // MongoDB ObjectId pattern
});

const mysqlIdSchema = Joi.object({
  id: Joi.number().integer().positive().required()
});

module.exports = {
  validate,
  userSchemas,
  projectSchemas,
  idSchema,
  mysqlIdSchema
};