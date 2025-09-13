const express = require('express');
const { WarehouseLog, Order, Item, User } = require('../models');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { validate, schemas, validateQuery } = require('../middleware/validation');
const Joi = require('joi');
const { Op } = require('sequelize');

const router = express.Router();

// Query validation schema
const querySchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  type: Joi.string().valid('received', 'shipped', 'damaged', 'spoiled', 'missing', 'returned', 'adjustment').optional(),
  status: Joi.string().valid('pending', 'shipped', 'delivered', 'received', 'missing', 'damaged', 'spoiled').optional(),
  sortBy: Joi.string().valid('createdAt', 'type', 'status', 'quantity').optional(),
  sortOrder: Joi.string().valid('ASC', 'DESC').optional(),
  startDate: Joi.date().optional(),
  endDate: Joi.date().optional()
});

// @route   GET /api/warehouse
// @desc    Get all warehouse logs
// @access  Private
router.get('/', authenticateToken, validateQuery(querySchema), async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      type,
      status,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      startDate,
      endDate
    } = req.query;

    const offset = (page - 1) * limit;

    // Build where clause
    const whereClause = {};
    if (type) {
      whereClause.type = type;
    }
    if (status) {
      whereClause.status = status;
    }
    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) {
        whereClause.createdAt[Op.gte] = new Date(startDate);
      }
      if (endDate) {
        whereClause.createdAt[Op.lte] = new Date(endDate);
      }
    }

    const { count, rows } = await WarehouseLog.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Order,
          as: 'order',
          attributes: ['id', 'orderNumber', 'status'],
          required: false
        },
        {
          model: Item,
          as: 'item',
          attributes: ['id', 'name', 'category', 'sku'],
          required: false
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName', 'username']
        }
      ],
      order: [[sortBy, sortOrder]],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        logs: rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get warehouse logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch warehouse logs',
      error: error.message
    });
  }
});

// @route   GET /api/warehouse/summary
// @desc    Get warehouse summary statistics
// @access  Private
router.get('/summary', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const whereClause = {};
    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) {
        whereClause.createdAt[Op.gte] = new Date(startDate);
      }
      if (endDate) {
        whereClause.createdAt[Op.lte] = new Date(endDate);
      }
    }

    // Get counts by type
    const typeCounts = await WarehouseLog.findAll({
      where: whereClause,
      attributes: [
        'type',
        [WarehouseLog.sequelize.fn('COUNT', WarehouseLog.sequelize.col('id')), 'count']
      ],
      group: ['type'],
      raw: true
    });

    // Get counts by status
    const statusCounts = await WarehouseLog.findAll({
      where: whereClause,
      attributes: [
        'status',
        [WarehouseLog.sequelize.fn('COUNT', WarehouseLog.sequelize.col('id')), 'count']
      ],
      group: ['status'],
      raw: true
    });

    // Get total quantities by type
    const quantityByType = await WarehouseLog.findAll({
      where: whereClause,
      attributes: [
        'type',
        [WarehouseLog.sequelize.fn('SUM', WarehouseLog.sequelize.col('quantity')), 'totalQuantity']
      ],
      group: ['type'],
      raw: true
    });

    // Get recent activity (last 10 logs)
    const recentActivity = await WarehouseLog.findAll({
      where: whereClause,
      include: [
        {
          model: Item,
          as: 'item',
          attributes: ['id', 'name', 'category'],
          required: false
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: 10
    });

    res.json({
      success: true,
      data: {
        typeCounts: typeCounts.reduce((acc, item) => {
          acc[item.type] = parseInt(item.count);
          return acc;
        }, {}),
        statusCounts: statusCounts.reduce((acc, item) => {
          acc[item.status] = parseInt(item.count);
          return acc;
        }, {}),
        quantityByType: quantityByType.reduce((acc, item) => {
          acc[item.type] = parseInt(item.totalQuantity) || 0;
          return acc;
        }, {}),
        recentActivity
      }
    });
  } catch (error) {
    console.error('Get warehouse summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch warehouse summary',
      error: error.message
    });
  }
});

// @route   POST /api/warehouse
// @desc    Create new warehouse log
// @access  Private (CSR, TL, Admin)
router.post('/', authenticateToken, authorizeRoles('CSR', 'TL', 'Admin'), validate(schemas.warehouseLog), async (req, res) => {
  try {
    const logData = {
      ...req.body,
      createdBy: req.user.id
    };

    const log = await WarehouseLog.create(logData);

    // If it's a stock adjustment, update the item stock
    if (logData.type === 'adjustment' && logData.itemId) {
      const item = await Item.findByPk(logData.itemId);
      if (item) {
        const newStock = item.stock + logData.quantity;
        await item.update({ stock: Math.max(0, newStock) });
      }
    }

    // Fetch the created log with relations
    const logWithRelations = await WarehouseLog.findByPk(log.id, {
      include: [
        {
          model: Order,
          as: 'order',
          attributes: ['id', 'orderNumber', 'status'],
          required: false
        },
        {
          model: Item,
          as: 'item',
          attributes: ['id', 'name', 'category', 'sku'],
          required: false
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName', 'username']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Warehouse log created successfully',
      data: { log: logWithRelations }
    });
  } catch (error) {
    console.error('Create warehouse log error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create warehouse log',
      error: error.message
    });
  }
});

// @route   PUT /api/warehouse/:id
// @desc    Update warehouse log
// @access  Private (CSR, TL, Admin)
router.put('/:id', authenticateToken, authorizeRoles('CSR', 'TL', 'Admin'), validate(schemas.warehouseLog), async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const log = await WarehouseLog.findByPk(id);
    if (!log) {
      return res.status(404).json({
        success: false,
        message: 'Warehouse log not found'
      });
    }

    await log.update(updateData);

    // Fetch updated log with relations
    const updatedLog = await WarehouseLog.findByPk(id, {
      include: [
        {
          model: Order,
          as: 'order',
          attributes: ['id', 'orderNumber', 'status'],
          required: false
        },
        {
          model: Item,
          as: 'item',
          attributes: ['id', 'name', 'category', 'sku'],
          required: false
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName', 'username']
        }
      ]
    });

    res.json({
      success: true,
      message: 'Warehouse log updated successfully',
      data: { log: updatedLog }
    });
  } catch (error) {
    console.error('Update warehouse log error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update warehouse log',
      error: error.message
    });
  }
});

// @route   DELETE /api/warehouse/:id
// @desc    Delete warehouse log
// @access  Private (TL, Admin)
router.delete('/:id', authenticateToken, authorizeRoles('TL', 'Admin'), async (req, res) => {
  try {
    const { id } = req.params;

    const log = await WarehouseLog.findByPk(id);
    if (!log) {
      return res.status(404).json({
        success: false,
        message: 'Warehouse log not found'
      });
    }

    await log.destroy();

    res.json({
      success: true,
      message: 'Warehouse log deleted successfully'
    });
  } catch (error) {
    console.error('Delete warehouse log error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete warehouse log',
      error: error.message
    });
  }
});

// @route   GET /api/warehouse/items/:itemId
// @desc    Get warehouse logs for specific item
// @access  Private
router.get('/items/:itemId', authenticateToken, async (req, res) => {
  try {
    const { itemId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const item = await Item.findByPk(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    const { count, rows } = await WarehouseLog.findAndCountAll({
      where: { itemId },
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName', 'username']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });

    res.json({
      success: true,
      data: {
        logs: rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get item warehouse logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch item warehouse logs',
      error: error.message
    });
  }
});

module.exports = router;
