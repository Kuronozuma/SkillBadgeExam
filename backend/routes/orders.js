const express = require('express');
const { Order, OrderItem, Customer, Item, User } = require('../models');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { validate, schemas, validateQuery } = require('../middleware/validation');
const Joi = require('joi');
const { Op } = require('sequelize');

const router = express.Router();

// Query validation schema
const querySchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  status: Joi.string().valid('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled').optional(),
  customerId: Joi.number().integer().positive().optional(),
  search: Joi.string().optional(),
  sortBy: Joi.string().valid('orderDate', 'status', 'totalAmount', 'createdAt').optional(),
  sortOrder: Joi.string().valid('ASC', 'DESC').optional(),
  startDate: Joi.date().optional(),
  endDate: Joi.date().optional()
});

// @route   GET /api/orders
// @desc    Get all orders
// @access  Private
router.get('/', authenticateToken, validateQuery(querySchema), async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      customerId,
      search,
      sortBy = 'orderDate',
      sortOrder = 'DESC',
      startDate,
      endDate
    } = req.query;

    const offset = (page - 1) * limit;

    // Build where clause
    const whereClause = {};
    if (status) {
      whereClause.status = status;
    }
    if (customerId) {
      whereClause.customerId = customerId;
    }
    if (startDate || endDate) {
      whereClause.orderDate = {
        ...(startDate ? { [Op.gte]: new Date(startDate) } : {}),
        ...(endDate ? { [Op.lte]: new Date(endDate) } : {})
      };
    }

    const { count, rows } = await Order.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Customer,
          as: 'customer',
          attributes: ['id', 'name', 'email'],
          where: search ? {
            [Op.or]: [
              { name: { [Op.iLike]: `%${search}%` } },
              { email: { [Op.iLike]: `%${search}%` } }
            ]
          } : undefined,
          required: search ? true : false
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName', 'username']
        },
        {
          model: User,
          as: 'assignee',
          attributes: ['id', 'firstName', 'lastName', 'username'],
          required: false
        },
        {
          model: OrderItem,
          as: 'orderItems',
          attributes: ['id', 'quantity', 'unitPrice', 'totalPrice'],
          include: [
            {
              model: Item,
              as: 'item',
              attributes: ['id', 'name', 'category', 'sku']
            }
          ]
        }
      ],
      order: [[sortBy, sortOrder]],
      limit: parseInt(limit),
      offset: parseInt(offset)
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
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message
    });
  }
});

// @route   GET /api/orders/:id
// @desc    Get single order
// @access  Private
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findByPk(id, {
      include: [
        {
          model: Customer,
          as: 'customer',
          attributes: ['id', 'name', 'email', 'phone', 'address']
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName', 'username']
        },
        {
          model: User,
          as: 'assignee',
          attributes: ['id', 'firstName', 'lastName', 'username'],
          required: false
        },
        {
          model: OrderItem,
          as: 'orderItems',
          include: [
            {
              model: Item,
              as: 'item',
              attributes: ['id', 'name', 'category', 'sku', 'stock']
            }
          ]
        }
      ]
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: { order }
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order',
      error: error.message
    });
  }
});

// @route   POST /api/orders
// @desc    Create new order
// @access  Private (CSR, TL, Admin)
router.post('/', authenticateToken, authorizeRoles('CSR', 'TL', 'Admin'), validate(schemas.order), async (req, res) => {
  try {
    const { customerId, priority, requiredDate, notes, assignedTo, items } = req.body;

    // Verify customer exists
    const customer = await Customer.findByPk(customerId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Verify assigned user exists (if provided)
    if (assignedTo) {
      const assignee = await User.findByPk(assignedTo);
      if (!assignee) {
        return res.status(404).json({
          success: false,
          message: 'Assigned user not found'
        });
      }
    }

    // Verify all items exist and calculate totals
    let totalAmount = 0;
    let discountAmount = 0;
    let taxAmount = 0;

    for (const item of items) {
      const itemRecord = await Item.findByPk(item.itemId);
      if (!itemRecord) {
        return res.status(404).json({
          success: false,
          message: `Item with ID ${item.itemId} not found`
        });
      }

      const itemTotal = item.quantity * item.unitPrice;
      const itemDiscount = itemTotal * (item.discount || 0) / 100;
      const itemFinal = itemTotal - itemDiscount;

      totalAmount += itemTotal;
      discountAmount += itemDiscount;
    }

    // For now, tax is 0% - can be configured later
    const finalAmount = totalAmount - discountAmount + taxAmount;

    // Create order
    const order = await Order.create({
      customerId,
      priority: priority || 'medium',
      requiredDate,
      notes,
      assignedTo,
      totalAmount,
      discountAmount,
      taxAmount,
      finalAmount,
      createdBy: req.user.id
    });

    // Create order items
    const orderItems = [];
    for (const item of items) {
      const orderItem = await OrderItem.create({
        orderId: order.id,
        itemId: item.itemId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount || 0,
        notes: item.notes
      });
      orderItems.push(orderItem);
    }

    // Fetch complete order with relations
    const completeOrder = await Order.findByPk(order.id, {
      include: [
        {
          model: Customer,
          as: 'customer',
          attributes: ['id', 'name', 'email']
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName', 'username']
        },
        {
          model: User,
          as: 'assignee',
          attributes: ['id', 'firstName', 'lastName', 'username'],
          required: false
        },
        {
          model: OrderItem,
          as: 'orderItems',
          include: [
            {
              model: Item,
              as: 'item',
              attributes: ['id', 'name', 'category', 'sku']
            }
          ]
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: { order: completeOrder }
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.message
    });
  }
});

// @route   PUT /api/orders/:id
// @desc    Update order
// @access  Private (CSR, TL, Admin)
router.put('/:id', authenticateToken, authorizeRoles('CSR', 'TL', 'Admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Only allow certain fields to be updated
    const allowedFields = ['status', 'priority', 'requiredDate', 'notes', 'assignedTo'];
    const filteredData = {};
    
    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        filteredData[field] = updateData[field];
      }
    }

    await order.update(filteredData);

    // Fetch updated order with relations
    const updatedOrder = await Order.findByPk(id, {
      include: [
        {
          model: Customer,
          as: 'customer',
          attributes: ['id', 'name', 'email']
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName', 'username']
        },
        {
          model: User,
          as: 'assignee',
          attributes: ['id', 'firstName', 'lastName', 'username'],
          required: false
        },
        {
          model: OrderItem,
          as: 'orderItems',
          include: [
            {
              model: Item,
              as: 'item',
              attributes: ['id', 'name', 'category', 'sku']
            }
          ]
        }
      ]
    });

    res.json({
      success: true,
      message: 'Order updated successfully',
      data: { order: updatedOrder }
    });
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order',
      error: error.message
    });
  }
});

// @route   DELETE /api/orders/:id
// @desc    Cancel order
// @access  Private (CSR, TL, Admin)
router.delete('/:id', authenticateToken, authorizeRoles('CSR', 'TL', 'Admin'), async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Only allow cancellation if order is not shipped or delivered
    if (['shipped', 'delivered'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel order that has been shipped or delivered'
      });
    }

    await order.update({ status: 'cancelled' });

    res.json({
      success: true,
      message: 'Order cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel order',
      error: error.message
    });
  }
});

// @route   PUT /api/orders/:id/status
// @desc    Update order status
// @access  Private (CSR, TL, Admin)
router.put('/:id/status', authenticateToken, authorizeRoles('CSR', 'TL', 'Admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const updateData = { status };
    
    // Set appropriate dates based on status
    if (status === 'shipped') {
      updateData.shippedDate = new Date();
    } else if (status === 'delivered') {
      updateData.deliveredDate = new Date();
    }

    await order.update(updateData);

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: { order }
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status',
      error: error.message
    });
  }
});

module.exports = router;
