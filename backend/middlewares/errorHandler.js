const errorHandler = (err, req, res, next) => {
  console.error('❌ Error:', err.stack || err.message);

  // Sequelize validation errors
  if (err.name === 'SequelizeValidationError') {
    const messages = err.errors.map((e) => e.message);
    return res.status(400).json({
      success: false,
      message: 'Error de validación',
      errors: messages,
    });
  }

  // Sequelize unique constraint
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({
      success: false,
      message: 'Ya existe un registro con estos datos.',
    });
  }

  // Default error
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Error interno del servidor';

  return res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Ruta no encontrada: ${req.originalUrl}`,
  });
};

module.exports = { errorHandler, notFound };
