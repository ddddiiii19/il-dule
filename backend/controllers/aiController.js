const { OpenAI } = require('openai');
const PerfilAprendizaje = require('../models/PerfilAprendizaje');
const Evento = require('../models/Evento');
const { Op } = require('sequelize');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// POST /api/ai/chat
const chat = async (req, res, next) => {
  try {
    const { mensaje, historial = [] } = req.body;

    if (!mensaje || mensaje.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'El mensaje no puede estar vacío.',
      });
    }

    // Get user's learning profile
    const perfil = await PerfilAprendizaje.findOne({
      where: { usuario_id: req.usuario.id, completado: true },
    });

    // Get upcoming events (next 7 days)
    const ahora = new Date();
    const enSieteDias = new Date(ahora.getTime() + 7 * 24 * 60 * 60 * 1000);

    const proximosEventos = await Evento.findAll({
      where: {
        usuario_id: req.usuario.id,
        fecha_inicio: { [Op.between]: [ahora, enSieteDias] },
        completado: false,
      },
      order: [['fecha_inicio', 'ASC']],
      limit: 5,
    });

    // Build context for AI
    let contextoUsuario = `Eres IL-DULE, un asistente académico inteligente y empático diseñado para ayudar a estudiantes de secundaria y universidad en Colombia a organizarse mejor. Tu tono es amigable, motivador y conciso.`;

    contextoUsuario += `\n\nEstudiante: ${req.usuario.nombre}`;

    if (perfil) {
      contextoUsuario += `\nPerfil de aprendizaje: Estilo predominante ${perfil.estilo_predominante}.`;
      contextoUsuario += `\nMétodos de estudio preferidos: ${perfil.metodos_preferidos.join(', ') || 'No especificados'}.`;
      if (perfil.nivel_procrastinacion) {
        contextoUsuario += `\nNivel de procrastinación: ${perfil.nivel_procrastinacion}.`;
      }
    }

    if (proximosEventos.length > 0) {
      contextoUsuario += `\n\nEventos próximos (7 días):`;
      proximosEventos.forEach((ev) => {
        const fecha = new Date(ev.fecha_inicio).toLocaleDateString('es-CO');
        contextoUsuario += `\n- ${ev.titulo} (${ev.tipo}, prioridad ${ev.prioridad}) - ${fecha}`;
      });
    } else {
      contextoUsuario += `\n\nEl estudiante no tiene eventos próximos en los próximos 7 días.`;
    }

    contextoUsuario += `\n\nResponde siempre en español. Sé específico y útil. Máximo 200 palabras por respuesta. Si el estudiante tiene eventos urgentes, menciónalo de forma amable.`;

    // Build messages for OpenAI
    const messages = [
      { role: 'system', content: contextoUsuario },
      ...historial.slice(-10), // Keep last 10 messages for context
      { role: 'user', content: mensaje },
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      max_tokens: 400,
      temperature: 0.7,
    });

    const respuesta = completion.choices[0]?.message?.content || 'Lo siento, no pude procesar tu consulta.';

    return res.status(200).json({
      success: true,
      data: {
        respuesta,
        tokens_usados: completion.usage?.total_tokens || 0,
      },
    });
  } catch (error) {
    if (error?.status === 429) {
      return res.status(429).json({
        success: false,
        message: 'Límite de uso de IA alcanzado. Por favor intenta en unos minutos.',
      });
    }
    if (error?.status === 401) {
      return res.status(500).json({
        success: false,
        message: 'Error de configuración del servicio de IA.',
      });
    }
    next(error);
  }
};

// POST /api/ai/sugerencias
const getSugerencias = async (req, res, next) => {
  try {
    const perfil = await PerfilAprendizaje.findOne({
      where: { usuario_id: req.usuario.id, completado: true },
    });

    const pendientes = await Evento.count({
      where: { usuario_id: req.usuario.id, completado: false },
    });

    let prompt = `Genera 3 sugerencias cortas y motivadoras de organización académica para el estudiante ${req.usuario.nombre}.`;

    if (perfil) {
      prompt += ` Su estilo de aprendizaje es ${perfil.estilo_predominante}.`;
    }

    if (pendientes > 0) {
      prompt += ` Tiene ${pendientes} tareas pendientes.`;
    }

    prompt += ` Devuelve exactamente 3 sugerencias en formato JSON array: [{"titulo": "...", "descripcion": "..."}]. Sin markdown, solo JSON puro.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 300,
      temperature: 0.8,
    });

    let sugerencias = [];
    try {
      const raw = completion.choices[0]?.message?.content || '[]';
      const cleaned = raw.replace(/```json|```/g, '').trim();
      sugerencias = JSON.parse(cleaned);
    } catch {
      sugerencias = [
        { titulo: 'Técnica Pomodoro', descripcion: 'Trabaja 25 minutos y descansa 5.' },
        { titulo: 'Planifica tu semana', descripcion: 'Reserva tiempo para cada materia.' },
        { titulo: 'Prioriza tareas', descripcion: 'Empieza siempre por lo más urgente.' },
      ];
    }

    return res.status(200).json({ success: true, data: { sugerencias } });
  } catch (error) {
    next(error);
  }
};

module.exports = { chat, getSugerencias };
