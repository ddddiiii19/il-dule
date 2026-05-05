const { validationResult } = require('express-validator');
const PerfilAprendizaje = require('../models/PerfilAprendizaje');

// GET /api/perfil
const getPerfil = async (req, res, next) => {
  try {
    const perfil = await PerfilAprendizaje.findOne({
      where: { usuario_id: req.usuario.id },
    });

    if (!perfil) {
      return res.status(404).json({
        success: false,
        message: 'Perfil de aprendizaje no completado aún.',
      });
    }

    return res.status(200).json({ success: true, data: { perfil } });
  } catch (error) {
    next(error);
  }
};

// POST /api/perfil
const crearPerfil = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Datos inválidos',
        errors: errors.array().map((e) => e.msg),
      });
    }

    const { respuestas } = req.body;

    // VARK scoring
    let visual = 0,
      auditivo = 0,
      kinestesico = 0,
      lectura = 0;

    respuestas.forEach((r) => {
      switch (r.estilo) {
        case 'visual':
          visual++;
          break;
        case 'auditivo':
          auditivo++;
          break;
        case 'kinestesico':
          kinestesico++;
          break;
        case 'lectura_escritura':
          lectura++;
          break;
      }
    });

    const maxScore = Math.max(visual, auditivo, kinestesico, lectura);
    let estilo_predominante = 'visual';
    if (maxScore === auditivo) estilo_predominante = 'auditivo';
    else if (maxScore === kinestesico) estilo_predominante = 'kinestesico';
    else if (maxScore === lectura) estilo_predominante = 'lectura_escritura';

    // Determine preferred methods
    const metodos_map = {
      visual: ['Mapas mentales', 'Diagramas', 'Videos educativos'],
      auditivo: ['Podcasts educativos', 'Grupos de estudio', 'Lectura en voz alta'],
      kinestesico: ['Ejercicios prácticos', 'Laboratorios', 'Técnica Pomodoro'],
      lectura_escritura: ['Resúmenes escritos', 'Fichas de estudio', 'Método Cornell'],
    };

    // Procrastination from body
    const { horas_estudio, nivel_procrastinacion } = req.body;

    // Upsert
    const [perfil, created] = await PerfilAprendizaje.findOrCreate({
      where: { usuario_id: req.usuario.id },
      defaults: {
        usuario_id: req.usuario.id,
        estilo_predominante,
        puntaje_visual: visual,
        puntaje_auditivo: auditivo,
        puntaje_kinestesico: kinestesico,
        puntaje_lectura: lectura,
        horas_estudio_diarias: horas_estudio || null,
        nivel_procrastinacion: nivel_procrastinacion || null,
        metodos_preferidos: metodos_map[estilo_predominante] || [],
        respuestas_raw: respuestas,
        completado: true,
      },
    });

    if (!created) {
      await perfil.update({
        estilo_predominante,
        puntaje_visual: visual,
        puntaje_auditivo: auditivo,
        puntaje_kinestesico: kinestesico,
        puntaje_lectura: lectura,
        horas_estudio_diarias: horas_estudio || perfil.horas_estudio_diarias,
        nivel_procrastinacion: nivel_procrastinacion || perfil.nivel_procrastinacion,
        metodos_preferidos: metodos_map[estilo_predominante],
        respuestas_raw: respuestas,
        completado: true,
      });
    }

    return res.status(created ? 201 : 200).json({
      success: true,
      message: created ? 'Perfil creado exitosamente.' : 'Perfil actualizado.',
      data: { perfil },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getPerfil, crearPerfil };
