const express = require('express');
const { Customer, Order } = require('../models');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { validate, schemas, validateQuery } = require('../middleware/validation');
const Joi = require('joi');
const { Op } = require('sequelize');

const router = express.Router();

// Query validation schema
const querySchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  search: Joi.string().optional(),
  sortBy: Joi.string().valid('name', 'createdAt', 'updatedAt').optional(),
  sortOrder: Joi.string().valid('ASC', 'DESC').optional()
});

// @route   GET /api/customers
// @desc    Get all customers
// @access  Private
router.get('/', authenticateToken, validateQuery(querySchema), async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = 'name',
      sortOrder = 'ASC'
    } = req.query;

    const offset = (page - 1) * limit;

    // Build where clause
    const whereClause = { isActive: true };
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { contactPerson: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows } = await Customer.findAndCountAll({
      where: whereClause,
      order: [[sortBy, sortOrder]],
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [
        {
          model: Order,
          as: 'orders',
          attributes: ['id', 'status', 'orderDate', 'totalAmount'],
          required: false
        }
      ]
    });

    // Add order counts and last order date
    const customersWithStats = rows.map(customer => {
      const customerData = customer.toJSON();
      const orders = customerData.orders || [];
      
      return {
        ...customerData,
        orders: orders.length,
        lastOrder: orders.length > 0 
          ? orders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))[0].orderDate
          : null,
        totalSpent: orders.reduce((sum, order) => sum + parseFloat(order.totalAmount || 0), 0)
      };
    });

    res.json({
      success: true,
      data: {
        customers: customersWithStats,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch customers',
      error: error.message
    });
  }
});

// @route   GET /api/customers/:id
// @desc    Get single customer
// @access  Private
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const customer = await Customer.findByPk(id, {
      include: [
        {
          model: Order,
          as: 'orders',
          attributes: ['id', 'orderNumber', 'status', 'orderDate', 'totalAmount', 'finalAmount'],
          order: [['orderDate', 'DESC']]
        }
      ]
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    const customerData = customer.toJSON();
    const orders = customerData.orders || [];

    res.json({
      success: true,
      data: {
        customer: {
          ...customerData,
          totalOrders: orders.length,
          totalSpent: orders.reduce((sum, order) => sum + parseFloat(order.finalAmount || 0), 0),
          lastOrder: orders.length > 0 ? orders[0].orderDate : null
        }
      }
    });
  } catch (error) {
    console.error('Get customer error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch customer',
      error: error.message
    });
  }
});

// @route   POST /api/customers
// @desc    Create new customer
// @access  Private (CSR, TL, Admin)
router.post('/', authenticateToken, authorizeRoles('CSR', 'TL', 'Admin'), validate(schemas.customer), async (req, res) => {
  try {
    const customerData = req.body;

    // Check if customer with same email already exists
    if (customerData.email) {
      const existingCustomer = await Customer.findOne({
        where: { email: customerData.email }
      });

      if (existingCustomer) {
        return res.status(409).json({
          success: false,
          message: 'Customer with this email already exists'
        });
      }
    }

    const customer = await Customer.create(customerData);

    res.status(201).json({
      success: true,
      message: 'Customer created successfully',
      data: { customer }
    });
  } catch (error) {
    console.error('Create customer error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create customer',
      error: error.message
    });
  }
});

// @route   PUT /api/customers/:id
// @desc    Update customer
// @access  Private (CSR, TL, Admin)
router.put('/:id', authenticateToken, authorizeRoles('CSR', 'TL', 'Admin'), validate(schemas.customer), async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const customer = await Customer.findByPk(id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Check if email is already taken by another customer
    if (updateData.email && updateData.email !== customer.email) {
      const existingCustomer = await Customer.findOne({
        where: { email: updateData.email, id: { [Op.ne]: id } }
      });

      if (existingCustomer) {
        return res.status(409).json({
          success: false,
          message: 'Customer with this email already exists'
        });
      }
    }

    await customer.update(updateData);

    res.json({
      success: true,
      message: 'Customer updated successfully',
      data: { customer }
    });
  } catch (error) {
    console.error('Update customer error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update customer',
      error: error.message
    });
  }
});

// @route   DELETE /api/customers/:id
// @desc    Delete customer (soft delete)
// @access  Private (TL, Admin)
router.delete('/:id', authenticateToken, authorizeRoles('TL', 'Admin'), async (req, res) => {
  try {
    const { id } = req.params;

    const customer = await Customer.findByPk(id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Check if customer has orders
    const orders = await customer.getOrders();
    if (orders.length > 0) {
      // Soft delete - deactivate instead of hard delete
      await customer.update({ isActive: false });
      return res.json({
        success: true,
        message: 'Customer deactivated successfully (has existing orders)'
      });
    }

    await customer.destroy();

    res.json({
      success: true,
      message: 'Customer deleted successfully'
    });
  } catch (error) {
    console.error('Delete customer error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete customer',
      error: error.message
    });
  }
});

// @route   GET /api/customers/:id/orders
// @desc    Get customer orders
// @access  Private
router.get('/:id/orders', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10, status } = req.query;

    const customer = await Customer.findByPk(id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    const whereClause = { customerId: id };
    if (status) {
      whereClause.status = status;
    }

    const { count, rows } = await Order.findAndCountAll({
      where: whereClause,
      order: [['orderDate', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      include: [
        {
          model: require('../models').User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName', 'username']
        }
      ]
    });

    res.json({
      success: true,
      data: {
        orders: rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get customer orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch customer orders',
      error: error.message
    });
  }
});

module.exports = router;
