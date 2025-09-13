const { sequelize, User, Customer, Distributor, Item, Order, OrderItem, WarehouseLog } = require('../models');
const bcrypt = require('bcryptjs');

const seedData = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    await WarehouseLog.destroy({ where: {} });
    await OrderItem.destroy({ where: {} });
    await Order.destroy({ where: {} });
    await Item.destroy({ where: {} });
    await Customer.destroy({ where: {} });
    await Distributor.destroy({ where: {} });
    await User.destroy({ where: {} });

    console.log('✅ Cleared existing data');

    // Create users
    const users = await User.bulkCreate([
      {
        username: 'admin',
        password: 'admin123',
        firstName: 'Admin',
        lastName: 'User',
        role: 'Admin'
      },
      {
        username: 'csr1',
        password: 'csr123',
        firstName: 'John',
        lastName: 'Doe',
        role: 'CSR'
      },
      {
        username: 'tl1',
        password: 'tl123',
        firstName: 'Jane',
        lastName: 'Smith',
        role: 'TL'
      },
      {
        username: 'accounting1',
        password: 'acc123',
        firstName: 'Bob',
        lastName: 'Johnson',
        role: 'Accounting'
      }
    ]);

    console.log('✅ Created users');

    // Create distributors
    const distributors = await Distributor.bulkCreate([
      {
        name: 'Distributor A',
        contactEmail: 'alice@dist.com',
        contactPerson: 'Alice Johnson',
        location: 'East Warehouse',
        address: '123 East Street, City, State 12345'
      },
      {
        name: 'Distributor B',
        contactEmail: 'bob@dist.com',
        contactPerson: 'Bob Wilson',
        location: 'North Warehouse',
        address: '456 North Avenue, City, State 12345'
      }
    ]);

    console.log('✅ Created distributors');

    // Create customers
    const customers = await Customer.bulkCreate([
      {
        name: 'Alpha Store',
        email: 'alpha@store.com',
        phone: '+1-555-0101',
        address: '789 Main Street, City, State 12345',
        contactPerson: 'Alice Manager'
      },
      {
        name: 'Beta Mart',
        email: 'beta@mart.com',
        phone: '+1-555-0102',
        address: '321 Oak Avenue, City, State 12345',
        contactPerson: 'Bob Manager'
      },
      {
        name: 'Gamma Shop',
        email: 'gamma@shop.com',
        phone: '+1-555-0103',
        address: '654 Pine Road, City, State 12345',
        contactPerson: 'Carol Manager'
      }
    ]);

    console.log('✅ Created customers');

    // Create items
    const items = await Item.bulkCreate([
      {
        id: 'sku-1',
        name: 'Rice 50kg',
        category: 'Food',
        stock: 85,
        price: 39.99,
        cost: 30.00,
        sku: 'RICE-50KG',
        minStockLevel: 20,
        distributorId: distributors[0].id
      },
      {
        id: 'sku-2',
        name: 'Sugar 25kg',
        category: 'Food',
        stock: 30,
        price: 24.99,
        cost: 18.00,
        sku: 'SUGAR-25KG',
        minStockLevel: 15,
        distributorId: distributors[0].id
      },
      {
        id: 'sku-3',
        name: 'Soap',
        category: 'Hygiene',
        stock: 100,
        price: 2.50,
        cost: 1.50,
        sku: 'SOAP-001',
        minStockLevel: 50,
        distributorId: distributors[1].id
      },
      {
        id: 'sku-4',
        name: 'Cooking Oil 5L',
        category: 'Food',
        stock: 42,
        price: 15.75,
        cost: 12.00,
        sku: 'OIL-5L',
        minStockLevel: 20,
        distributorId: distributors[0].id
      },
      {
        id: 'sku-5',
        name: 'Flour 10kg',
        category: 'Food',
        stock: 25,
        price: 18.50,
        cost: 14.00,
        sku: 'FLOUR-10KG',
        minStockLevel: 10,
        distributorId: distributors[0].id
      },
      {
        id: 'sku-6',
        name: 'Toothpaste',
        category: 'Hygiene',
        stock: 75,
        price: 4.99,
        cost: 3.00,
        sku: 'TOOTH-001',
        minStockLevel: 30,
        distributorId: distributors[1].id
      }
    ]);

    console.log('✅ Created items');

    // Create orders
    const orders = await Order.bulkCreate([
      {
        orderNumber: 'ORD-001',
        status: 'delivered',
        priority: 'medium',
        totalAmount: 79.98,
        discountAmount: 0,
        taxAmount: 0,
        finalAmount: 79.98,
        orderDate: new Date('2025-09-10'),
        deliveredDate: new Date('2025-09-12'),
        customerId: customers[0].id,
        createdBy: users[1].id,
        assignedTo: users[2].id,
        notes: 'Regular order'
      },
      {
        orderNumber: 'ORD-002',
        status: 'shipped',
        priority: 'high',
        totalAmount: 49.98,
        discountAmount: 5.00,
        taxAmount: 0,
        finalAmount: 44.98,
        orderDate: new Date('2025-09-15'),
        shippedDate: new Date('2025-09-16'),
        customerId: customers[1].id,
        createdBy: users[1].id,
        assignedTo: users[2].id,
        notes: 'Urgent delivery needed'
      },
      {
        orderNumber: 'ORD-003',
        status: 'processing',
        priority: 'low',
        totalAmount: 125.00,
        discountAmount: 0,
        taxAmount: 0,
        finalAmount: 125.00,
        orderDate: new Date('2025-09-20'),
        customerId: customers[2].id,
        createdBy: users[1].id,
        assignedTo: users[2].id,
        notes: 'Bulk order'
      }
    ]);

    console.log('✅ Created orders');

    // Create order items
    await OrderItem.bulkCreate([
      {
        orderId: orders[0].id,
        itemId: items[0].id,
        quantity: 2,
        unitPrice: 39.99,
        totalPrice: 79.98
      },
      {
        orderId: orders[1].id,
        itemId: items[1].id,
        quantity: 2,
        unitPrice: 24.99,
        totalPrice: 49.98,
        discount: 10
      },
      {
        orderId: orders[2].id,
        itemId: items[0].id,
        quantity: 2,
        unitPrice: 39.99,
        totalPrice: 79.98
      },
      {
        orderId: orders[2].id,
        itemId: items[3].id,
        quantity: 3,
        unitPrice: 15.75,
        totalPrice: 47.25
      }
    ]);

    console.log('✅ Created order items');

    // Create warehouse logs
    await WarehouseLog.bulkCreate([
      {
        type: 'received',
        status: 'received',
        quantity: 100,
        note: 'Initial stock received',
        itemId: items[0].id,
        createdBy: users[2].id
      },
      {
        type: 'received',
        status: 'received',
        quantity: 50,
        note: 'Stock replenishment',
        itemId: items[1].id,
        createdBy: users[2].id
      },
      {
        type: 'shipped',
        status: 'shipped',
        quantity: 2,
        note: 'Order ORD-001 shipped',
        orderId: orders[0].id,
        itemId: items[0].id,
        createdBy: users[2].id
      },
      {
        type: 'shipped',
        status: 'shipped',
        quantity: 2,
        note: 'Order ORD-002 shipped',
        orderId: orders[1].id,
        itemId: items[1].id,
        createdBy: users[2].id
      },
      {
        type: 'adjustment',
        status: 'received',
        quantity: 5,
        note: 'Stock adjustment - found extra items',
        itemId: items[2].id,
        createdBy: users[2].id
      }
    ]);

    console.log('✅ Created warehouse logs');

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📊 Sample Data Summary:');
    console.log(`- Users: ${users.length}`);
    console.log(`- Customers: ${customers.length}`);
    console.log(`- Distributors: ${distributors.length}`);
    console.log(`- Items: ${items.length}`);
    console.log(`- Orders: ${orders.length}`);
    console.log('\n🔑 Test Accounts:');
    console.log('Admin: admin / admin123');
    console.log('CSR: csr1 / csr123');
    console.log('TL: tl1 / tl123');
    console.log('Accounting: accounting1 / acc123');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  seedData()
    .then(() => {
      console.log('✅ Seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = { seedData };
