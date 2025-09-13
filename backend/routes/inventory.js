const express = require('express');
const { Item, Distributor } = require('../models');
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
  category: Joi.string().optional(),
  supplier: Joi.string().optional(),
  sortBy: Joi.string().valid('name', 'category', 'stock', 'price', 'createdAt').optional(),
  sortOrder: Joi.string().valid('ASC', 'DESC').optional()
});

// @route   GET /api/inventory/test
// @desc    Test inventory endpoint
// @access  Public
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Inventory endpoint is working' });
});

// @route   GET /api/inventory
// @desc    Get all inventory items
// @access  Private
router.get('/', authenticateToken, validateQuery(querySchema), async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      category,
      supplier,
      sortBy = 'name',
      sortOrder = 'ASC'
    } = req.query;

    const offset = (page - 1) * limit;

    // Build where clause
    const whereClause = {};
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { category: { [Op.iLike]: `%${search}%` } },
        { sku: { [Op.iLike]: `%${search}%` } },
        { barcode: { [Op.iLike]: `%${search}%` } }
      ];
    }
    if (category) {
      whereClause.category = { [Op.iLike]: `%${category}%` };
    }
    if (supplier) {
      whereClause['$distributor.name$'] = { [Op.iLike]: `%${supplier}%` };
    }

    const { count, rows } = await Item.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Distributor,
          as: 'distributor',
          attributes: ['id', 'name', 'location']
        }
      ],
      order: [[sortBy, sortOrder]],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        items: rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get inventory error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inventory',
      error: error.message
    });
  }
});

// @route   GET /api/inventory/:id
// @desc    Get single inventory item
// @access  Private
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const item = await Item.findByPk(id, {
      include: [
        {
          model: Distributor,
          as: 'distributor',
          attributes: ['id', 'name', 'location', 'contactPerson']
        }
      ]
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    res.json({
      success: true,
      data: { item }
    });
  } catch (error) {
    console.error('Get item error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch item',
      error: error.message
    });
  }
});

// @route   POST /api/inventory
// @desc    Create new inventory item
// @access  Private (CSR, TL, Admin)
router.post('/', authenticateToken, authorizeRoles('CSR', 'TL', 'Admin'), validate(schemas.item), async (req, res) => {
  try {
    const itemData = req.body;

    // Check if SKU or barcode already exists
    if (itemData.sku || itemData.barcode) {
      const existingItem = await Item.findOne({
        where: {
          [Op.or]: [
            ...(itemData.sku ? [{ sku: itemData.sku }] : []),
            ...(itemData.barcode ? [{ barcode: itemData.barcode }] : [])
          ]
        }
      });

      if (existingItem) {
        return res.status(409).json({
          success: false,
          message: 'Item with this SKU or barcode already exists'
        });
      }
    }

    const item = await Item.create(itemData);

    // Fetch with distributor info
    const itemWithDistributor = await Item.findByPk(item.id, {
      include: [
        {
          model: Distributor,
          as: 'distributor',
          attributes: ['id', 'name', 'location']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Item created successfully',
      data: { item: itemWithDistributor }
    });
  } catch (error) {
    console.error('Create item error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create item',
      error: error.message
    });
  }
});

// @route   PUT /api/inventory/:id
// @desc    Update inventory item
// @access  Private (CSR, TL, Admin)
router.put('/:id', authenticateToken, authorizeRoles('CSR', 'TL', 'Admin'), validate(schemas.item), async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const item = await Item.findByPk(id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    // Check if SKU or barcode already exists (excluding current item)
    if (updateData.sku || updateData.barcode) {
      const existingItem = await Item.findOne({
        where: {
          id: { [Op.ne]: id },
          [Op.or]: [
            ...(updateData.sku ? [{ sku: updateData.sku }] : []),
            ...(updateData.barcode ? [{ barcode: updateData.barcode }] : [])
          ]
        }
      });

      if (existingItem) {
        return res.status(409).json({
          success: false,
          message: 'Item with this SKU or barcode already exists'
        });
      }
    }

    await item.update(updateData);

    // Fetch updated item with distributor info
    const updatedItem = await Item.findByPk(id, {
      include: [
        {
          model: Distributor,
          as: 'distributor',
          attributes: ['id', 'name', 'location']
        }
      ]
    });

    res.json({
      success: true,
      message: 'Item updated successfully',
      data: { item: updatedItem }
    });
  } catch (error) {
    console.error('Update item error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update item',
      error: error.message
    });
  }
});

// @route   DELETE /api/inventory/:id
// @desc    Delete inventory item
// @access  Private (TL, Admin)
router.delete('/:id', authenticateToken, authorizeRoles('TL', 'Admin'), async (req, res) => {
  try {
    const { id } = req.params;

    const item = await Item.findByPk(id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    // Check if item has been ordered (soft delete instead)
    const hasOrders = await item.getOrderItems();
    if (hasOrders.length > 0) {
      // Soft delete - deactivate instead of hard delete
      await item.update({ isActive: false });
      return res.json({
        success: true,
        message: 'Item deactivated successfully (has existing orders)'
      });
    }

    await item.destroy();

    res.json({
      success: true,
      message: 'Item deleted successfully'
    });
  } catch (error) {
    console.error('Delete item error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete item',
      error: error.message
    });
  }
});

// @route   GET /api/inventory/categories
// @desc    Get all categories
// @access  Private
router.get('/categories', authenticateToken, async (req, res) => {
  try {
    const categories = await Item.findAll({
      attributes: ['category'],
      group: ['category'],
      order: [['category', 'ASC']]
    });

    const categoryList = categories.map(item => item.category);

    res.json({
      success: true,
      data: { categories: categoryList }
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: error.message
    });
  }
});

// @route   PUT /api/inventory/:id/stock
// @desc    Update item stock
// @access  Private (CSR, TL, Admin)
router.put('/:id/stock', authenticateToken, authorizeRoles('CSR', 'TL', 'Admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { stock, note } = req.body;

    if (typeof stock !== 'number' || stock < 0) {
      return res.status(400).json({
        success: false,
        message: 'Stock must be a non-negative number'
      });
    }

    const item = await Item.findByPk(id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    const oldStock = item.stock;
    await item.update({ stock });

    // Log stock change in warehouse logs
    const { WarehouseLog } = require('../models');
    await WarehouseLog.create({
      type: 'adjustment',
      status: 'received',
      quantity: stock - oldStock,
      note: note || `Stock adjusted from ${oldStock} to ${stock}`,
      itemId: id,
      createdBy: req.user.id
    });

    res.json({
      success: true,
      message: 'Stock updated successfully',
      data: { 
        item: {
          id: item.id,
          name: item.name,
          stock: item.stock,
          oldStock
        }
      }
    });
  } catch (error) {
    console.error('Update stock error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update stock',
      error: error.message
    });
  }
});

module.exports = router;
