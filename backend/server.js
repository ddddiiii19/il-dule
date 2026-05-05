require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { testConnection } = require('./config/database');

// Import models (register with Sequelize)
require('./models/Usuario');
require('./models/Evento');
require('./models/PerfilAprendizaje');

// Import routes
const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const { aiRouter, perfilRouter } = require('./routes/ai');

// Import middlewares
const { errorHandler, notFound } = require('./middlewares/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'IL-DULE API funcionando correctamente ✅',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/ai', aiRouter);
app.use('/api/perfil', perfilRouter);

// ─── Error handling ───────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Start server ─────────────────────────────────────────────────────────────
const startServer = async () => {
  await testConnection();
  app.listen(PORT, () => {
    console.log(`\n🚀 IL-DULE Backend corriendo en http://localhost:${PORT}`);
    console.log(`📚 Ambiente: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔐 JWT activado | 🤖 OpenAI integrado\n`);
  });
};

startServer();

module.exports = app;
