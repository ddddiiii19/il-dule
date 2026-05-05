const express = require('express');
const { body } = require('express-validator');
const { chat, getSugerencias } = require('../controllers/aiController');
const { getPerfil, crearPerfil } = require('../controllers/perfilController');
const authMiddleware = require('../middlewares/auth');

const aiRouter = express.Router();
const perfilRouter = express.Router();

// All routes require auth
aiRouter.use(authMiddleware);
perfilRouter.use(authMiddleware);

// AI routes
aiRouter.post(
  '/chat',
  [body('mensaje').trim().notEmpty().withMessage('El mensaje es requerido')],
  chat
);
aiRouter.get('/sugerencias', getSugerencias);

// Perfil routes
perfilRouter.get('/', getPerfil);
perfilRouter.post(
  '/',
  [body('respuestas').isArray({ min: 1 }).withMessage('Las respuestas son requeridas')],
  crearPerfil
);

module.exports = { aiRouter, perfilRouter };
