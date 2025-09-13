const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const WarehouseLog = sequelize.define('WarehouseLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  type: {
    type: DataTypes.ENUM('received', 'shipped', 'damaged', 'spoiled', 'missing', 'returned', 'adjustment'),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'shipped', 'delivered', 'received', 'missing', 'damaged', 'spoiled'),
    allowNull: false,
    defaultValue: 'pending'
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 0
    }
  },
  note: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  referenceNumber: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  location: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  orderId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'orders',
      key: 'id'
    }
  },
  itemId: {
    type: DataTypes.STRING(50),
    allowNull: true,
    references: {
      model: 'items',
      key: 'id'
    }
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'warehouse_logs',
  timestamps: true
});

module.exports = WarehouseLog;
