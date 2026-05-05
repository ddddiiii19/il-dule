const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'ildule_db',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'password',
  {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    dialectOptions: {
      ssl:
        process.env.NODE_ENV === 'production'
          ? { require: true, rejectUnauthorized: false }
          : false,
    },
  }
);

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ PostgreSQL conectado correctamente.');
  } catch (error) {
    console.error('❌ Error al conectar con PostgreSQL:', error.message);
    process.exit(1);
  }
};

module.exports = { sequelize, testConnection };
