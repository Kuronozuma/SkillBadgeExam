const express = require('express');
const { Item, Customer, Order, OrderItem, WarehouseLog } = require('../models');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { Op } = require('sequelize');

const router = express.Router();

// @route   GET /api/reports/inventory
// @desc    Get inventory report
// @access  Private
router.get('/inventory', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate, category } = req.query;

    const whereClause = { isActive: true };
    if (category) {
      whereClause.category = { [Op.iLike]: `%${category}%` };
    }

    const items = await Item.findAll({
      where: whereClause,
      include: [
        {
          model: OrderItem,
          as: 'orderItems',
          attributes: ['quantity'],
          required: false,
          include: [
            {
              model: Order,
              as: 'order',
              attributes: ['orderDate'],
              where: startDate || endDate ? {
                orderDate: {
                  ...(startDate ? { [Op.gte]: new Date(startDate) } : {}),
                  ...(endDate ? { [Op.lte]: new Date(endDate) } : {})
                }
              } : undefined,
              required: false
            }
          ]
        }
      ],
      order: [['name', 'ASC']]
    });

    const inventoryReport = items.map(item => {
      const itemData = item.toJSON();
      const orderItems = itemData.orderItems || [];
      const totalOrdered = orderItems.reduce((sum, orderItem) => sum + orderItem.quantity, 0);

      return {
        id: itemData.id,
        name: itemData.name,
        category: itemData.category,
        stock: itemData.stock,
        price: itemData.price,
        ordered: totalOrdered,
        status: itemData.stock < itemData.minStockLevel ? 'Low Stock' : 'Normal',
        totalValue: itemData.stock * itemData.price
      };
    });

    res.json({
      success: true,
      data: { inventory: inventoryReport }
    });
  } catch (error) {
    console.error('Get inventory report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate inventory report',
      error: error.message
    });
  }
});

// @route   GET /api/reports/customers
// @desc    Get customer report
// @access  Private
router.get('/customers', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const whereClause = { isActive: true };
    if (startDate || endDate) {
      whereClause.orderDate = {
        ...(startDate ? { [Op.gte]: new Date(startDate) } : {}),
        ...(endDate ? { [Op.lte]: new Date(endDate) } : {})
      };
    }

    const customers = await Customer.findAll({
      where: { isActive: true },
      include: [
        {
          model: Order,
          as: 'orders',
          attributes: ['id', 'orderDate', 'totalAmount', 'finalAmount', 'status'],
          where: whereClause.orderDate ? { orderDate: whereClause.orderDate } : undefined,
          required: false
        }
      ],
      order: [['name', 'ASC']]
    });

    const customerReport = customers.map(customer => {
      const customerData = customer.toJSON();
      const orders = customerData.orders || [];
      const totalOrders = orders.length;
      const totalSpent = orders.reduce((sum, order) => sum + parseFloat(order.finalAmount || 0), 0);
      const lastOrder = orders.length > 0 
        ? orders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))[0].orderDate
        : null;

      return {
        id: customerData.id,
        name: customerData.name,
        orders: totalOrders,
        totalSpent: totalSpent,
        lastOrder: lastOrder,
        status: totalOrders > 30 ? 'Key Account' : 'Regular'
      };
    });

    res.json({
      success: true,
      data: { clients: customerReport }
    });
  } catch (error) {
    console.error('Get customer report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate customer report',
      error: error.message
    });
  }
});

// @route   GET /api/reports/monthly
// @desc    Get monthly summary report
// @access  Private
router.get('/monthly', authenticateToken, async (req, res) => {
  try {
    const { year = new Date().getFullYear(), month = new Date().getMonth() + 1 } = req.query;

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    // Get order statistics
    const orderStats = await Order.findAll({
      where: {
        orderDate: {
          [Op.between]: [startDate, endDate]
        }
      },
      attributes: [
        [Order.sequelize.fn('COUNT', Order.sequelize.col('id')), 'totalOrders'],
        [Order.sequelize.fn('SUM', Order.sequelize.col('finalAmount')), 'totalRevenue'],
        [Order.sequelize.fn('AVG', Order.sequelize.col('finalAmount')), 'averageOrderValue']
      ],
      raw: true
    });

    // Get new customers this month
    const newCustomers = await Customer.count({
      where: {
        createdAt: {
          [Op.between]: [startDate, endDate]
        },
        isActive: true
      }
    });

    // Get top categories
    const topCategories = await OrderItem.findAll({
      include: [
        {
          model: Item,
          as: 'item',
          attributes: ['category']
        },
        {
          model: Order,
          as: 'order',
          where: {
            orderDate: {
              [Op.between]: [startDate, endDate]
            }
          }
        }
      ],
      attributes: [
        [Item.sequelize.col('item.category'), 'category'],
        [OrderItem.sequelize.fn('SUM', OrderItem.sequelize.col('quantity')), 'totalQuantity']
      ],
      group: [Item.sequelize.col('item.category')],
      order: [[OrderItem.sequelize.fn('SUM', OrderItem.sequelize.col('quantity')), 'DESC']],
      limit: 5,
      raw: true
    });

    // Get warehouse activity
    const warehouseStats = await WarehouseLog.findAll({
      where: {
        createdAt: {
          [Op.between]: [startDate, endDate]
        }
      },
      attributes: [
        'type',
        [WarehouseLog.sequelize.fn('COUNT', WarehouseLog.sequelize.col('id')), 'count']
      ],
      group: ['type'],
      raw: true
    });

    const stats = orderStats[0] || { totalOrders: 0, totalRevenue: 0, averageOrderValue: 0 };

    res.json({
      success: true,
      data: {
        period: { year: parseInt(year), month: parseInt(month) },
        orders: {
          total: parseInt(stats.totalOrders) || 0,
          revenue: parseFloat(stats.totalRevenue) || 0,
          averageValue: parseFloat(stats.averageOrderValue) || 0
        },
        customers: {
          new: newCustomers
        },
        categories: topCategories.map(cat => ({
          name: cat.category,
          quantity: parseInt(cat.totalQuantity) || 0
        })),
        warehouse: warehouseStats.reduce((acc, stat) => {
          acc[stat.type] = parseInt(stat.count) || 0;
          return acc;
        }, {})
      }
    });
  } catch (error) {
    console.error('Get monthly report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate monthly report',
      error: error.message
    });
  }
});

// @route   GET /api/reports/sales
// @desc    Get sales report
// @access  Private (Accounting, Admin)
router.get('/sales', authenticateToken, authorizeRoles('Accounting', 'Admin'), async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;

    let dateFormat;
    switch (groupBy) {
      case 'day':
        dateFormat = '%Y-%m-%d';
        break;
      case 'week':
        dateFormat = '%Y-%u';
        break;
      case 'month':
        dateFormat = '%Y-%m';
        break;
      case 'year':
        dateFormat = '%Y';
        break;
      default:
        dateFormat = '%Y-%m-%d';
    }

    const whereClause = {};
    if (startDate || endDate) {
      whereClause.orderDate = {
        ...(startDate ? { [Op.gte]: new Date(startDate) } : {}),
        ...(endDate ? { [Op.lte]: new Date(endDate) } : {})
      };
    }

    const salesData = await Order.findAll({
      where: whereClause,
      attributes: [
        [Order.sequelize.fn('DATE_FORMAT', Order.sequelize.col('orderDate'), dateFormat), 'period'],
        [Order.sequelize.fn('COUNT', Order.sequelize.col('id')), 'orderCount'],
        [Order.sequelize.fn('SUM', Order.sequelize.col('finalAmount')), 'totalRevenue'],
        [Order.sequelize.fn('AVG', Order.sequelize.col('finalAmount')), 'averageOrderValue']
      ],
      group: [Order.sequelize.fn('DATE_FORMAT', Order.sequelize.col('orderDate'), dateFormat)],
      order: [[Order.sequelize.fn('DATE_FORMAT', Order.sequelize.col('orderDate'), dateFormat), 'ASC']],
      raw: true
    });

    res.json({
      success: true,
      data: {
        sales: salesData.map(item => ({
          period: item.period,
          orderCount: parseInt(item.orderCount) || 0,
          totalRevenue: parseFloat(item.totalRevenue) || 0,
          averageOrderValue: parseFloat(item.averageOrderValue) || 0
        }))
      }
    });
  } catch (error) {
    console.error('Get sales report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate sales report',
      error: error.message
    });
  }
});

// @route   GET /api/reports/stock-alerts
// @desc    Get stock alerts report
// @access  Private
router.get('/stock-alerts', authenticateToken, async (req, res) => {
  try {
    const items = await Item.findAll({
      where: {
        isActive: true,
        stock: {
          [Op.lte]: Order.sequelize.col('minStockLevel')
        }
      },
      order: [['stock', 'ASC']]
    });

    const stockAlerts = items.map(item => ({
      id: item.id,
      name: item.name,
      category: item.category,
      currentStock: item.stock,
      minStockLevel: item.minStockLevel,
      deficit: item.minStockLevel - item.stock,
      status: item.stock === 0 ? 'Out of Stock' : 'Low Stock'
    }));

    res.json({
      success: true,
      data: { stockAlerts }
    });
  } catch (error) {
    console.error('Get stock alerts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate stock alerts',
      error: error.message
    });
  }
});

module.exports = router;
