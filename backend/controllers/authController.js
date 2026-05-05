const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const Usuario = require('../models/Usuario');
const PerfilAprendizaje = require('../models/PerfilAprendizaje');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Datos inválidos',
        errors: errors.array().map((e) => e.msg),
      });
    }

    const { nombre, email, password } = req.body;

    // Check if email exists
    const existente = await Usuario.findOne({ where: { email: email.toLowerCase() } });
    if (existente) {
      return res.status(400).json({
        success: false,
        message: 'Este correo ya está registrado.',
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user
    const usuario = await Usuario.create({
      nombre: nombre.trim(),
      email: email.toLowerCase().trim(),
      password: passwordHash,
    });

    const token = generateToken(usuario.id);

    return res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente.',
      data: {
        token,
        usuario: {
          id: usuario.id,
          nombre: usuario.nombre,
          email: usuario.email,
          avatar_inicial: usuario.avatar_inicial,
          tiene_perfil: false,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Datos inválidos',
        errors: errors.array().map((e) => e.msg),
      });
    }

    const { email, password } = req.body;

    // Find user
    const usuario = await Usuario.findOne({
      where: { email: email.toLowerCase(), activo: true },
    });

    if (!usuario) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales incorrectas.',
      });
    }

    // Check password
    const passwordValida = await bcrypt.compare(password, usuario.password);
    if (!passwordValida) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales incorrectas.',
      });
    }

    // Check if has learning profile
    const perfil = await PerfilAprendizaje.findOne({
      where: { usuario_id: usuario.id, completado: true },
    });

    const token = generateToken(usuario.id);

    return res.status(200).json({
      success: true,
      message: 'Inicio de sesión exitoso.',
      data: {
        token,
        usuario: {
          id: usuario.id,
          nombre: usuario.nombre,
          email: usuario.email,
          avatar_inicial: usuario.avatar_inicial,
          tiene_perfil: !!perfil,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/auth/me
const me = async (req, res, next) => {
  try {
    const perfil = await PerfilAprendizaje.findOne({
      where: { usuario_id: req.usuario.id, completado: true },
    });

    return res.status(200).json({
      success: true,
      data: {
        usuario: {
          id: req.usuario.id,
          nombre: req.usuario.nombre,
          email: req.usuario.email,
          avatar_inicial: req.usuario.avatar_inicial,
          tiene_perfil: !!perfil,
          perfil: perfil || null,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/logout
const logout = async (req, res) => {
  // JWT is stateless; client removes token
  return res.status(200).json({
    success: true,
    message: 'Sesión cerrada exitosamente.',
  });
};

module.exports = { register, login, me, logout };
