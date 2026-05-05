const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Acceso denegado. Token no proporcionado.',
      });
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const usuario = await Usuario.findByPk(decoded.id, {
      attributes: { exclude: ['password'] },
    });

    if (!usuario || !usuario.activo) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido o usuario inactivo.',
      });
    }

    req.usuario = usuario;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Sesión expirada. Por favor inicia sesión nuevamente.',
      });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token inválido.',
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor.',
    });
  }
};

module.exports = authMiddleware;
