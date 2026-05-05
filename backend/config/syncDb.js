require('dotenv').config();
const { sequelize } = require('./database');

// Import all models to register them
require('../models/Usuario');
require('../models/Evento');
require('../models/PerfilAprendizaje');

const syncDb = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log('✅ Base de datos sincronizada correctamente.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al sincronizar la base de datos:', error);
    process.exit(1);
  }
};

syncDb();
