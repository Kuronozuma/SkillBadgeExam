const { sequelize } = require('../models');
const { seedData } = require('./seed');

const setup = async () => {
  try {
    console.log('🚀 Setting up APSI Backend...');

    // Test database connection
    console.log('📡 Testing database connection...');
    await sequelize.authenticate();
    console.log('✅ Database connection successful');

    // Sync database models
    console.log('🗄️  Creating database tables...');
    await sequelize.sync({ force: true });
    console.log('✅ Database tables created');

    // Seed sample data
    console.log('🌱 Seeding sample data...');
    await seedData();
    console.log('✅ Sample data seeded');

    console.log('\n🎉 Setup completed successfully!');
    console.log('\n📊 Next steps:');
    console.log('1. Start the backend server: npm run dev');
    console.log('2. Start the frontend: cd ../frontend && npm run dev');
    console.log('3. Login with test accounts:');
    console.log('   - Admin: admin / admin123');
    console.log('   - CSR: csr1 / csr123');
    console.log('   - TL: tl1 / tl123');
    console.log('   - Accounting: accounting1 / acc123');

  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
};

// Run setup if this file is executed directly
if (require.main === module) {
  setup()
    .then(() => {
      console.log('✅ Setup completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Setup failed:', error);
      process.exit(1);
    });
}

module.exports = { setup };
