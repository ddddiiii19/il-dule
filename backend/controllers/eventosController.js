const { validationResult } = require('express-validator');
const { Op } = require('sequelize');
const Evento = require('../models/Evento');

// Color mapping by priority
const PRIORITY_COLORS = {
  alta: '#E57373',
  media: '#8B7EC8',
  baja: '#81C784',
};

// GET /api/events
const getEventos = async (req, res, next) => {
  try {
    const { start, end, tipo, prioridad, completado } = req.query;

    const where = { usuario_id: req.usuario.id };

    if (start && end) {
      where.fecha_inicio = { [Op.between]: [new Date(start), new Date(end)] };
    }
    if (tipo) where.tipo = tipo;
    if (prioridad) where.prioridad = prioridad;
    if (completado !== undefined) where.completado = completado === 'true';

    const eventos = await Evento.findAll({
      where,
      order: [['fecha_inicio', 'ASC']],
    });

    return res.status(200).json({
      success: true,
      data: { eventos },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/events/:id
const getEvento = async (req, res, next) => {
  try {
    const evento = await Evento.findOne({
      where: { id: req.params.id, usuario_id: req.usuario.id },
    });

    if (!evento) {
      return res.status(404).json({ success: false, message: 'Evento no encontrado.' });
    }

    return res.status(200).json({ success: true, data: { evento } });
  } catch (error) {
    next(error);
  }
};

// POST /api/events
const crearEvento = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Datos inválidos',
        errors: errors.array().map((e) => e.msg),
      });
    }

    const {
      titulo,
      descripcion,
      tipo,
      fecha_inicio,
      fecha_fin,
      fecha_limite,
      prioridad,
      todo_el_dia,
      recordatorio_minutos,
    } = req.body;

    const color = PRIORITY_COLORS[prioridad] || PRIORITY_COLORS.media;

    const evento = await Evento.create({
      usuario_id: req.usuario.id,
      titulo,
      descripcion,
      tipo: tipo || 'tarea',
      fecha_inicio,
      fecha_fin: fecha_fin || null,
      fecha_limite: fecha_limite || null,
      prioridad: prioridad || 'media',
      color,
      todo_el_dia: todo_el_dia || false,
      recordatorio_minutos: recordatorio_minutos || 30,
    });

    return res.status(201).json({
      success: true,
      message: 'Evento creado exitosamente.',
      data: { evento },
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/events/:id
const actualizarEvento = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Datos inválidos',
        errors: errors.array().map((e) => e.msg),
      });
    }

    const evento = await Evento.findOne({
      where: { id: req.params.id, usuario_id: req.usuario.id },
    });

    if (!evento) {
      return res.status(404).json({ success: false, message: 'Evento no encontrado.' });
    }

    const updates = { ...req.body };

    // Update color if priority changed
    if (updates.prioridad) {
      updates.color = PRIORITY_COLORS[updates.prioridad] || evento.color;
    }

    await evento.update(updates);

    return res.status(200).json({
      success: true,
      message: 'Evento actualizado.',
      data: { evento },
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/events/:id
const eliminarEvento = async (req, res, next) => {
  try {
    const evento = await Evento.findOne({
      where: { id: req.params.id, usuario_id: req.usuario.id },
    });

    if (!evento) {
      return res.status(404).json({ success: false, message: 'Evento no encontrado.' });
    }

    await evento.destroy();

    return res.status(200).json({
      success: true,
      message: 'Evento eliminado exitosamente.',
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/events/:id/complete
const toggleCompletado = async (req, res, next) => {
  try {
    const evento = await Evento.findOne({
      where: { id: req.params.id, usuario_id: req.usuario.id },
    });

    if (!evento) {
      return res.status(404).json({ success: false, message: 'Evento no encontrado.' });
    }

    await evento.update({ completado: !evento.completado });

    return res.status(200).json({
      success: true,
      message: `Tarea marcada como ${evento.completado ? 'completada' : 'pendiente'}.`,
      data: { evento },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEventos,
  getEvento,
  crearEvento,
  actualizarEvento,
  eliminarEvento,
  toggleCompletado,
};
