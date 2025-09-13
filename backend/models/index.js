const { sequelize } = require('../config/database');
const User = require('./User');
const Customer = require('./Customer');
const Distributor = require('./Distributor');
const Item = require('./Item');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const WarehouseLog = require('./WarehouseLog');

// Define associations
const defineAssociations = () => {
  // User associations
  User.hasMany(Order, { foreignKey: 'createdBy', as: 'createdOrders' });
  User.hasMany(Order, { foreignKey: 'assignedTo', as: 'assignedOrders' });

  // Customer associations
  Customer.hasMany(Order, { foreignKey: 'customerId', as: 'orders' });

  // Distributor associations
  Distributor.hasMany(Item, { foreignKey: 'distributorId', as: 'items' });

  // Item associations
  Item.belongsTo(Distributor, { foreignKey: 'distributorId', as: 'distributor' });
  Item.hasMany(OrderItem, { foreignKey: 'itemId', as: 'orderItems' });

  // Order associations
  Order.belongsTo(Customer, { foreignKey: 'customerId', as: 'customer' });
  Order.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
  Order.belongsTo(User, { foreignKey: 'assignedTo', as: 'assignee' });
  Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'orderItems' });
  Order.hasMany(WarehouseLog, { foreignKey: 'orderId', as: 'warehouseLogs' });

  // OrderItem associations
  OrderItem.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });
  OrderItem.belongsTo(Item, { foreignKey: 'itemId', as: 'item' });

  // WarehouseLog associations
  WarehouseLog.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });
  WarehouseLog.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
};

// Initialize associations
defineAssociations();

module.exports = {
  sequelize,
  User,
  Customer,
  Distributor,
  Item,
  Order,
  OrderItem,
  WarehouseLog
};
