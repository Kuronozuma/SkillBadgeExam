const { Sequelize } = require('sequelize');

// Database configuration
const sequelize = new Sequelize({
  host: process.env.DB_HOST || 'aws-1-ap-southeast-1.pooler.supabase.com',
  port: process.env.DB_PORT || 6543,
  database: process.env.DB_NAME || 'postgres',
  username: process.env.DB_USER || 'postgres.pewzgccnpxionwzimdma',
  password: process.env.DB_PASSWORD || 'oMbNJshv7FgqeVrC',
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

module.exports = { sequelize };
