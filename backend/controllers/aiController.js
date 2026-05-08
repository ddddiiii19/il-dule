const { OpenAI } = require('openai');
const PerfilAprendizaje = require('../models/PerfilAprendizaje');
const Evento = require('../models/Evento');
const { Op } = require('sequelize');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ─────────────────────────────────────────────────────────────
// POST /api/ai/chat
// ─────────────────────────────────────────────────────────────
const chat = async (req, res, next) => {
  try {
    const { mensaje, historial = [] } = req.body;

    if (!mensaje || mensaje.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'El mensaje no puede estar vacío.',
      });
    }

    // Obtener perfil de aprendizaje
    const perfil = await PerfilAprendizaje.findOne({
      where: {
        usuario_id: req.usuario.id,
        completado: true,
      },
    });

    // Obtener próximos eventos (7 días)
    const ahora = new Date();
    const enSieteDias = new Date(
      ahora.getTime() + 7 * 24 * 60 * 60 * 1000
    );

    const proximosEventos = await Evento.findAll({
      where: {
        usuario_id: req.usuario.id,
        fecha_inicio: {
          [Op.between]: [ahora, enSieteDias],
        },
        completado: false,
      },
      order: [['fecha_inicio', 'ASC']],
      limit: 5,
    });

    // ─────────────────────────────────────────────────────────
    // Contexto del sistema
    // ─────────────────────────────────────────────────────────
    let contextoUsuario = `
Eres IL-DULE, un asistente académico inteligente y empático.

Ayudas a estudiantes de secundaria y universidad en Colombia
a organizar tareas, estudiar mejor y reducir procrastinación.

Tu tono debe ser:
- amigable
- motivador
- claro
- breve
- útil

Siempre responde en español.
Máximo 200 palabras por respuesta.
`;

    contextoUsuario += `\nNombre del estudiante: ${req.usuario.nombre}`;

    if (perfil) {
      contextoUsuario += `
      
Perfil de aprendizaje:
- Estilo predominante: ${perfil.estilo_predominante}
- Métodos preferidos: ${
        perfil.metodos_preferidos?.join(', ') || 'No especificados'
      }
`;

      if (perfil.nivel_procrastinacion) {
        contextoUsuario += `
- Nivel de procrastinación: ${perfil.nivel_procrastinacion}
`;
      }
    }

    if (proximosEventos.length > 0) {
      contextoUsuario += `\nPróximos eventos importantes:\n`;

      proximosEventos.forEach((ev) => {
        const fecha = new Date(ev.fecha_inicio).toLocaleDateString('es-CO');

        contextoUsuario += `
- ${ev.titulo}
  Tipo: ${ev.tipo}
  Prioridad: ${ev.prioridad}
  Fecha: ${fecha}
`;
      });
    } else {
      contextoUsuario += `
      
El estudiante no tiene eventos próximos en los siguientes 7 días.
`;
    }

    // ─────────────────────────────────────────────────────────
    // Construcción de mensajes
    // ─────────────────────────────────────────────────────────
    const messages = [
      {
        role: 'system',
        content: contextoUsuario,
      },

      ...historial.slice(-10),

      {
        role: 'user',
        content: mensaje,
      },
    ];

    // ─────────────────────────────────────────────────────────
    // OpenAI Request
    // ─────────────────────────────────────────────────────────
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      max_tokens: 400,
      temperature: 0.7,
    });

    const respuesta =
      completion?.choices?.[0]?.message?.content ||
      'Lo siento, no pude procesar tu consulta.';

    return res.status(200).json({
      success: true,
      data: {
        respuesta,
        tokens_usados: completion?.usage?.total_tokens || 0,
      },
    });
  } catch (error) {
    console.error('❌ OpenAI Error:', error);

    // Sin créditos / límite excedido
    if (error?.status === 429) {
      return res.status(429).json({
        success: false,
        message:
          'La cuota de OpenAI fue excedida o no tienes créditos disponibles.',
      });
    }

    // API Key inválida
    if (error?.status === 401) {
      return res.status(500).json({
        success: false,
        message: 'API Key de OpenAI inválida o mal configurada.',
      });
    }

    return res.status(500).json({
      success: false,
      message: error?.message || 'Error interno del servidor.',
    });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/ai/sugerencias
// ─────────────────────────────────────────────────────────────
const getSugerencias = async (req, res, next) => {
  try {
    const perfil = await PerfilAprendizaje.findOne({
      where: {
        usuario_id: req.usuario.id,
        completado: true,
      },
    });

    const pendientes = await Evento.count({
      where: {
        usuario_id: req.usuario.id,
        completado: false,
      },
    });

    let prompt = `
Genera exactamente 3 sugerencias cortas y motivadoras
de organización académica para el estudiante ${req.usuario.nombre}.
`;

    if (perfil) {
      prompt += `
El estilo de aprendizaje del estudiante es:
${perfil.estilo_predominante}.
`;
    }

    if (pendientes > 0) {
      prompt += `
El estudiante tiene ${pendientes} tareas pendientes.
`;
    }

    prompt += `
Devuelve exclusivamente un JSON array válido.
No uses markdown.

Formato:
[
  {
    "titulo": "...",
    "descripcion": "..."
  }
]
`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 300,
      temperature: 0.8,
    });

    let sugerencias = [];

    try {
      const raw =
        completion?.choices?.[0]?.message?.content || '[]';

      const cleaned = raw
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();

      sugerencias = JSON.parse(cleaned);
    } catch (parseError) {
      console.error('❌ Error parseando sugerencias:', parseError);

      sugerencias = [
        {
          titulo: 'Técnica Pomodoro',
          descripcion: 'Trabaja 25 minutos y descansa 5.',
        },
        {
          titulo: 'Planifica tu semana',
          descripcion: 'Reserva tiempo específico para cada materia.',
        },
        {
          titulo: 'Prioriza tareas',
          descripcion: 'Empieza primero por las tareas más urgentes.',
        },
      ];
    }

    return res.status(200).json({
      success: true,
      data: {
        sugerencias,
      },
    });
  } catch (error) {
    console.error('❌ Error IA sugerencias:', error);

    if (error?.status === 429) {
      return res.status(429).json({
        success: false,
        message:
          'La cuota de OpenAI fue excedida o no tienes créditos disponibles.',
      });
    }

    return res.status(500).json({
      success: false,
      message: error?.message || 'Error interno del servidor.',
    });
  }
};

module.exports = {
  chat,
  getSugerencias,
};