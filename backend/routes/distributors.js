const express = require('express');
const { Distributor, Item } = require('../models');
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
  sortBy: Joi.string().valid('name', 'location', 'createdAt').optional(),
  sortOrder: Joi.string().valid('ASC', 'DESC').optional()
});

// @route   GET /api/distributors
// @desc    Get all distributors
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
        { contactPerson: { [Op.iLike]: `%${search}%` } },
        { location: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows } = await Distributor.findAndCountAll({
      where: whereClause,
      order: [[sortBy, sortOrder]],
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [
        {
          model: Item,
          as: 'items',
          attributes: ['id', 'name', 'category', 'stock', 'price'],
          required: false,
          where: { isActive: true }
        }
      ]
    });

    // Add item counts
    const distributorsWithStats = rows.map(distributor => {
      const distributorData = distributor.toJSON();
      const items = distributorData.items || [];
      
      return {
        ...distributorData,
        itemCount: items.length,
        totalValue: items.reduce((sum, item) => sum + (parseFloat(item.stock) * parseFloat(item.price || 0)), 0)
      };
    });

    res.json({
      success: true,
      data: {
        distributors: distributorsWithStats,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get distributors error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch distributors',
      error: error.message
    });
  }
});

// @route   GET /api/distributors/:id
// @desc    Get single distributor
// @access  Private
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const distributor = await Distributor.findByPk(id, {
      include: [
        {
          model: Item,
          as: 'items',
          attributes: ['id', 'name', 'category', 'stock', 'price', 'sku'],
          where: { isActive: true },
          required: false
        }
      ]
    });

    if (!distributor) {
      return res.status(404).json({
        success: false,
        message: 'Distributor not found'
      });
    }

    const distributorData = distributor.toJSON();
    const items = distributorData.items || [];

    res.json({
      success: true,
      data: {
        distributor: {
          ...distributorData,
          itemCount: items.length,
          totalValue: items.reduce((sum, item) => sum + (parseFloat(item.stock) * parseFloat(item.price || 0)), 0)
        }
      }
    });
  } catch (error) {
    console.error('Get distributor error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch distributor',
      error: error.message
    });
  }
});

// @route   POST /api/distributors
// @desc    Create new distributor
// @access  Private (CSR, TL, Admin)
router.post('/', authenticateToken, authorizeRoles('CSR', 'TL', 'Admin'), validate(schemas.distributor), async (req, res) => {
  try {
    const distributorData = req.body;

    // Check if distributor with same name already exists
    const existingDistributor = await Distributor.findOne({
      where: { name: distributorData.name }
    });

    if (existingDistributor) {
      return res.status(409).json({
        success: false,
        message: 'Distributor with this name already exists'
      });
    }

    const distributor = await Distributor.create(distributorData);

    res.status(201).json({
      success: true,
      message: 'Distributor created successfully',
      data: { distributor }
    });
  } catch (error) {
    console.error('Create distributor error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create distributor',
      error: error.message
    });
  }
});

// @route   PUT /api/distributors/:id
// @desc    Update distributor
// @access  Private (CSR, TL, Admin)
router.put('/:id', authenticateToken, authorizeRoles('CSR', 'TL', 'Admin'), validate(schemas.distributor), async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const distributor = await Distributor.findByPk(id);
    if (!distributor) {
      return res.status(404).json({
        success: false,
        message: 'Distributor not found'
      });
    }

    // Check if name is already taken by another distributor
    if (updateData.name && updateData.name !== distributor.name) {
      const existingDistributor = await Distributor.findOne({
        where: { name: updateData.name, id: { [Op.ne]: id } }
      });

      if (existingDistributor) {
        return res.status(409).json({
          success: false,
          message: 'Distributor with this name already exists'
        });
      }
    }

    await distributor.update(updateData);

    res.json({
      success: true,
      message: 'Distributor updated successfully',
      data: { distributor }
    });
  } catch (error) {
    console.error('Update distributor error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update distributor',
      error: error.message
    });
  }
});

// @route   DELETE /api/distributors/:id
// @desc    Delete distributor (soft delete)
// @access  Private (TL, Admin)
router.delete('/:id', authenticateToken, authorizeRoles('TL', 'Admin'), async (req, res) => {
  try {
    const { id } = req.params;

    const distributor = await Distributor.findByPk(id);
    if (!distributor) {
      return res.status(404).json({
        success: false,
        message: 'Distributor not found'
      });
    }

    // Check if distributor has items
    const items = await distributor.getItems();
    if (items.length > 0) {
      // Soft delete - deactivate instead of hard delete
      await distributor.update({ isActive: false });
      return res.json({
        success: true,
        message: 'Distributor deactivated successfully (has associated items)'
      });
    }

    await distributor.destroy();

    res.json({
      success: true,
      message: 'Distributor deleted successfully'
    });
  } catch (error) {
    console.error('Delete distributor error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete distributor',
      error: error.message
    });
  }
});

// @route   GET /api/distributors/:id/items
// @desc    Get distributor items
// @access  Private
router.get('/:id/items', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10, category, search } = req.query;

    const distributor = await Distributor.findByPk(id);
    if (!distributor) {
      return res.status(404).json({
        success: false,
        message: 'Distributor not found'
      });
    }

    const whereClause = { distributorId: id, isActive: true };
    if (category) {
      whereClause.category = { [Op.iLike]: `%${category}%` };
    }
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { sku: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows } = await Item.findAndCountAll({
      where: whereClause,
      order: [['name', 'ASC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
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
    console.error('Get distributor items error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch distributor items',
      error: error.message
    });
  }
});

module.exports = router;
