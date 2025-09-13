const Joi = require('joi');

// Validation schemas
const schemas = {
  // User validation
  register: Joi.object({
    username: Joi.string().alphanum().min(3).max(50).required(),
    email: Joi.string().email().optional(),
    password: Joi.string().min(6).required(),
    firstName: Joi.string().min(1).max(50).optional(),
    lastName: Joi.string().min(1).max(50).optional(),
    role: Joi.string().valid('CSR', 'TL', 'Accounting', 'Admin').optional()
  }),

  login: Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required()
  }),

  // Customer validation
  customer: Joi.object({
    name: Joi.string().min(1).max(100).required(),
    email: Joi.string().email().optional(),
    phone: Joi.string().max(20).optional(),
    address: Joi.string().optional(),
    contactPerson: Joi.string().max(100).optional(),
    notes: Joi.string().optional()
  }),

  // Distributor validation
  distributor: Joi.object({
    name: Joi.string().min(1).max(100).required(),
    contactEmail: Joi.string().email().optional(),
    contactPhone: Joi.string().max(20).optional(),
    contactPerson: Joi.string().max(100).optional(),
    location: Joi.string().max(200).optional(),
    address: Joi.string().optional(),
    notes: Joi.string().optional()
  }),

  // Item validation
  item: Joi.object({
    name: Joi.string().min(1).max(200).required(),
    category: Joi.string().min(1).max(50).required(),
    description: Joi.string().optional(),
    stock: Joi.number().integer().min(0).required(),
    price: Joi.number().precision(2).min(0).required(),
    cost: Joi.number().precision(2).min(0).optional(),
    sku: Joi.string().max(50).optional(),
    barcode: Joi.string().max(50).optional(),
    minStockLevel: Joi.number().integer().min(0).optional(),
    maxStockLevel: Joi.number().integer().min(0).optional(),
    distributorId: Joi.number().integer().positive().optional(),
    notes: Joi.string().optional()
  }),

  // Order validation
  order: Joi.object({
    customerId: Joi.number().integer().positive().required(),
    priority: Joi.string().valid('low', 'medium', 'high', 'urgent').optional(),
    requiredDate: Joi.date().optional(),
    notes: Joi.string().optional(),
    assignedTo: Joi.number().integer().positive().optional(),
    items: Joi.array().items(
      Joi.object({
        itemId: Joi.string().required(),
        quantity: Joi.number().integer().min(1).required(),
        unitPrice: Joi.number().precision(2).min(0).required(),
        discount: Joi.number().precision(2).min(0).max(100).optional(),
        notes: Joi.string().optional()
      })
    ).min(1).required()
  }),

  // Warehouse log validation
  warehouseLog: Joi.object({
    type: Joi.string().valid('received', 'shipped', 'damaged', 'spoiled', 'missing', 'returned', 'adjustment').required(),
    status: Joi.string().valid('pending', 'shipped', 'delivered', 'received', 'missing', 'damaged', 'spoiled').optional(),
    quantity: Joi.number().integer().min(0).required(),
    note: Joi.string().optional(),
    referenceNumber: Joi.string().max(100).optional(),
    location: Joi.string().max(100).optional(),
    orderId: Joi.number().integer().positive().optional(),
    itemId: Joi.string().optional()
  })
};

// Validation middleware factory
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    req.body = value;
    next();
  };
};

// Query parameter validation
const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        message: 'Query validation error',
        errors
      });
    }

    req.query = value;
    next();
  };
};

module.exports = {
  schemas,
  validate,
  validateQuery
};
