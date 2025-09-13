const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const OrderItem = sequelize.define('OrderItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1
    }
  },
  unitPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  totalPrice: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  discount: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 0.00,
    validate: {
      min: 0,
      max: 100
    }
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  orderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'orders',
      key: 'id'
    }
  },
  itemId: {
    type: DataTypes.STRING(50),
    allowNull: false,
    references: {
      model: 'items',
      key: 'id'
    }
  }
}, {
  tableName: 'order_items',
  timestamps: true,
  hooks: {
    beforeSave: (orderItem) => {
      // Calculate total price
      orderItem.totalPrice = orderItem.quantity * orderItem.unitPrice;
      
      // Apply discount if any
      if (orderItem.discount > 0) {
        const discountAmount = (orderItem.totalPrice * orderItem.discount) / 100;
        orderItem.totalPrice = orderItem.totalPrice - discountAmount;
      }
    }
  }
});

module.exports = OrderItem;
