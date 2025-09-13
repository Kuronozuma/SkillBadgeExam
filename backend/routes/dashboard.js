const express = require('express');
const { Item, Customer, Order, OrderItem } = require('../models');
const { authenticateToken } = require('../middleware/auth');
const { Op } = require('sequelize');

const router = express.Router();

// @route   GET /api/dashboard
// @desc    Get dashboard overview data
// @access  Private
router.get('/', authenticateToken, async (req, res) => {
  try {
    // Get most and least ordered items
    const items = await Item.findAll({
      where: { isActive: true },
      include: [
        {
          model: OrderItem,
          as: 'orderItems',
          attributes: ['quantity'],
          required: false
        }
      ]
    });

    const itemsWithOrderCounts = items.map(item => {
      const itemData = item.toJSON();
      const orderItems = itemData.orderItems || [];
      const totalOrdered = orderItems.reduce((sum, orderItem) => sum + orderItem.quantity, 0);
      
      return {
        ...itemData,
        ordered: totalOrdered
      };
    });

    // Find most and least ordered items
    const mostOrdered = itemsWithOrderCounts.reduce((max, item) => 
      item.ordered > max.ordered ? item : max, itemsWithOrderCounts[0] || { ordered: 0 }
    );
    
    const leastOrdered = itemsWithOrderCounts.reduce((min, item) => 
      item.ordered < min.ordered ? item : min, itemsWithOrderCounts[0] || { ordered: 0 }
    );

    // Get top customer
    const customers = await Customer.findAll({
      where: { isActive: true },
      include: [
        {
          model: Order,
          as: 'orders',
          attributes: ['id'],
          required: false
        }
      ]
    });

    const customersWithOrderCounts = customers.map(customer => {
      const customerData = customer.toJSON();
      const orders = customerData.orders || [];
      
      return {
        ...customerData,
        orders: orders.length
      };
    });

    const topCustomer = customersWithOrderCounts.reduce((max, customer) => 
      customer.orders > max.orders ? customer : max, customersWithOrderCounts[0] || { orders: 0 }
    );

    // Get unique categories
    const categories = [...new Set(itemsWithOrderCounts.map(item => item.category))];

    // Get top 5 performing items
    const topItems = [...itemsWithOrderCounts]
      .sort((a, b) => b.ordered - a.ordered)
      .slice(0, 5)
      .map(item => ({
        id: item.id,
        name: item.name,
        ordered: item.ordered
      }));

    res.json({
      success: true,
      data: {
        most: {
          name: mostOrdered.name,
          ordered: mostOrdered.ordered
        },
        least: {
          name: leastOrdered.name,
          ordered: leastOrdered.ordered
        },
        topCustomer: {
          name: topCustomer.name,
          orders: topCustomer.orders
        },
        categories,
        topItems
      }
    });
  } catch (error) {
    console.error('Get dashboard data error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data',
      error: error.message
    });
  }
});

// @route   GET /api/dashboard/stats
// @desc    Get dashboard statistics
// @access  Private
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const { period = '30' } = req.query; // days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Get total counts
    const [
      totalItems,
      totalCustomers,
      totalOrders,
      lowStockItems
    ] = await Promise.all([
      Item.count({ where: { isActive: true } }),
      Customer.count({ where: { isActive: true } }),
      Order.count({
        where: {
          orderDate: {
            [Op.gte]: startDate
          }
        }
      }),
      Item.count({
        where: {
          isActive: true,
          stock: {
            [Op.lte]: Order.sequelize.col('minStockLevel')
          }
        }
      })
    ]);

    // Get revenue data
    const revenueData = await Order.findAll({
      where: {
        orderDate: {
          [Op.gte]: startDate
        }
      },
      attributes: [
        [Order.sequelize.fn('SUM', Order.sequelize.col('finalAmount')), 'totalRevenue'],
        [Order.sequelize.fn('AVG', Order.sequelize.col('finalAmount')), 'averageOrderValue']
      ],
      raw: true
    });

    const revenue = revenueData[0] || { totalRevenue: 0, averageOrderValue: 0 };

    // Get order status distribution
    const orderStatusData = await Order.findAll({
      where: {
        orderDate: {
          [Op.gte]: startDate
        }
      },
      attributes: [
        'status',
        [Order.sequelize.fn('COUNT', Order.sequelize.col('id')), 'count']
      ],
      group: ['status'],
      raw: true
    });

    const orderStatus = orderStatusData.reduce((acc, item) => {
      acc[item.status] = parseInt(item.count) || 0;
      return acc;
    }, {});

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
              [Op.gte]: startDate
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

    res.json({
      success: true,
      data: {
        overview: {
          totalItems,
          totalCustomers,
          totalOrders,
          lowStockItems,
          totalRevenue: parseFloat(revenue.totalRevenue) || 0,
          averageOrderValue: parseFloat(revenue.averageOrderValue) || 0
        },
        orderStatus,
        topCategories: topCategories.map(cat => ({
          name: cat.category,
          quantity: parseInt(cat.totalQuantity) || 0
        }))
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics',
      error: error.message
    });
  }
});

// @route   GET /api/dashboard/recent-activity
// @desc    Get recent activity
// @access  Private
router.get('/recent-activity', authenticateToken, async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    // Get recent orders
    const recentOrders = await Order.findAll({
      include: [
        {
          model: Customer,
          as: 'customer',
          attributes: ['id', 'name']
        },
        {
          model: require('../models').User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName', 'username']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit)
    });

    // Get recent warehouse activity
    const recentWarehouseActivity = await require('../models').WarehouseLog.findAll({
      include: [
        {
          model: Item,
          as: 'item',
          attributes: ['id', 'name', 'category'],
          required: false
        },
        {
          model: require('../models').User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName', 'username']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit)
    });

    res.json({
      success: true,
      data: {
        recentOrders,
        recentWarehouseActivity
      }
    });
  } catch (error) {
    console.error('Get recent activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent activity',
      error: error.message
    });
  }
});

module.exports = router;
