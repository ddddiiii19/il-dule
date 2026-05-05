const express = require('express');
const { body } = require('express-validator');
const { register, login, me, logout } = require('../controllers/authController');
const authMiddleware = require('../middlewares/auth');

const router = express.Router();

// Validation rules
const registerValidation = [
  body('nombre').trim().notEmpty().withMessage('El nombre es requerido').isLength({ min: 2 }).withMessage('Mínimo 2 caracteres'),
  body('email').isEmail().withMessage('Email inválido').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
];

const loginValidation = [
  body('email').isEmail().withMessage('Email inválido').normalizeEmail(),
  body('password').notEmpty().withMessage('La contraseña es requerida'),
];

// Routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.get('/me', authMiddleware, me);
router.post('/logout', authMiddleware, logout);

module.exports = router;
