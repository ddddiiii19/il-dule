import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { perfilService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/layout/Navbar';
import './Encuesta.css';

const PREGUNTAS = [
  {
    id: 1,
    pregunta: '¿Cómo prefieres que te expliquen un tema nuevo?',
    opciones: [
      { texto: 'Con diagramas, mapas o imágenes', estilo: 'visual' },
      { texto: 'Escuchando una explicación en voz alta', estilo: 'auditivo' },
      { texto: 'Practicando y haciendo ejercicios', estilo: 'kinestesico' },
      { texto: 'Leyendo libros o tomando notas detalladas', estilo: 'lectura_escritura' },
    ],
  },
  {
    id: 2,
    pregunta: 'Cuando estudias para un examen, ¿qué técnica usas más?',
    opciones: [
      { texto: 'Hago mapas mentales o esquemas visuales', estilo: 'visual' },
      { texto: 'Me explico el tema a mí mismo o a alguien', estilo: 'auditivo' },
      { texto: 'Resuelvo ejercicios y problemas prácticos', estilo: 'kinestesico' },
      { texto: 'Leo y resumo el material en mis propias palabras', estilo: 'lectura_escritura' },
    ],
  },
  {
    id: 3,
    pregunta: 'Al recordar algo que aprendiste, ¿qué sueles visualizar?',
    opciones: [
      { texto: 'Una imagen, gráfico o página del libro', estilo: 'visual' },
      { texto: 'La voz del profesor o cómo lo explicó', estilo: 'auditivo' },
      { texto: 'Lo que hice o experimenté', estilo: 'kinestesico' },
      { texto: 'El texto que leíste o escribiste', estilo: 'lectura_escritura' },
    ],
  },
  {
    id: 4,
    pregunta: 'Cuando tienes un tiempo libre de estudio, ¿qué prefieres hacer?',
    opciones: [
      { texto: 'Ver videos, documentales o películas', estilo: 'visual' },
      { texto: 'Escuchar música, podcasts o audiolibros', estilo: 'auditivo' },
      { texto: 'Practicar un deporte o manualidades', estilo: 'kinestesico' },
      { texto: 'Leer libros, artículos o escribir', estilo: 'lectura_escritura' },
    ],
  },
  {
    id: 5,
    pregunta: '¿Cuántas horas al día sueles dedicar al estudio?',
    tipo: 'horas',
    opciones: [
      { texto: 'Menos de 1 hora', valor: 0.5 },
      { texto: '1 a 2 horas', valor: 1.5 },
      { texto: '2 a 4 horas', valor: 3 },
      { texto: 'Más de 4 horas', valor: 5 },
    ],
  },
  {
    id: 6,
    pregunta: '¿Con qué frecuencia pospones tus tareas?',
    tipo: 'procrastinacion',
    opciones: [
      { texto: 'Casi nunca, soy muy organizado/a', valor: 'bajo' },
      { texto: 'A veces, depende de la tarea', valor: 'medio' },
      { texto: 'Con frecuencia me cuesta empezar', valor: 'alto' },
      { texto: 'Casi siempre dejo todo para el final', valor: 'alto' },
    ],
  },
];

export default function Encuesta() {
  const { updateUsuario } = useAuth();
  const navigate = useNavigate();
  const [currentQ, setCurrentQ] = useState(0);
  const [respuestas, setRespuestas] = useState([]);
  const [horasEstudio, setHorasEstudio] = useState(null);
  const [nivelProc, setNivelProc] = useState(null);
  const [loading, setLoading] = useState(false);

  const pregunta = PREGUNTAS[currentQ];
  const progress = ((currentQ + 1) / PREGUNTAS.length) * 100;

  const handleSelect = (opcion) => {
    if (pregunta.tipo === 'horas') {
      setHorasEstudio(opcion.valor);
    } else if (pregunta.tipo === 'procrastinacion') {
      setNivelProc(opcion.valor);
    } else {
      setRespuestas((prev) => {
        const filtered = prev.filter((r) => r.pregunta_id !== pregunta.id);
        return [...filtered, { pregunta_id: pregunta.id, estilo: opcion.estilo }];
      });
    }

    setTimeout(() => {
      if (currentQ < PREGUNTAS.length - 1) {
        setCurrentQ((c) => c + 1);
      } else {
        handleSubmit();
      }
    }, 300);
  };

  const isSelected = (opcion) => {
    if (pregunta.tipo === 'horas') return horasEstudio === opcion.valor;
    if (pregunta.tipo === 'procrastinacion') return nivelProc === opcion.valor;
    return respuestas.some((r) => r.pregunta_id === pregunta.id && r.estilo === opcion.estilo);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await perfilService.create({
        respuestas: respuestas.filter((r) => r.estilo),
        horas_estudio: horasEstudio,
        nivel_procrastinacion: nivelProc,
      });
      updateUsuario({ tiene_perfil: true });
      navigate('/');
    } catch (err) {
      console.error(err);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="encuesta-page">
      <Navbar />

      <main className="encuesta-main">
        <div className="encuesta-card animate-fadeInScale">
          {/* Header */}
          <div className="encuesta-header">
            <div className="encuesta-logo">
              <span>🌸</span>
              <h2>Perfil de aprendizaje</h2>
            </div>
            <p className="encuesta-subtitle">
              Responde estas preguntas para personalizar tu experiencia en IL-DULE
            </p>
          </div>

          {/* Progress */}
          <div className="progress-section">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <span className="progress-label">
              {currentQ + 1} de {PREGUNTAS.length}
            </span>
          </div>

          {/* Question */}
          {loading ? (
            <div className="encuesta-loading">
              <div className="loading-spinner-lg" />
              <p>Analizando tu perfil...</p>
            </div>
          ) : (
            <div className="question-section animate-fadeIn" key={currentQ}>
              <h3 className="question-text">{pregunta.pregunta}</h3>

              <div className="options-grid">
                {pregunta.opciones.map((op, i) => (
                  <button
                    key={i}
                    className={`option-btn ${isSelected(op) ? 'selected' : ''}`}
                    onClick={() => handleSelect(op)}
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
                    <span className="option-letter">
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className="option-text">{op.texto}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="encuesta-nav">
            {currentQ > 0 && (
              <button
                className="nav-back-btn"
                onClick={() => setCurrentQ((c) => c - 1)}
                disabled={loading}
              >
                ← Anterior
              </button>
            )}
            <button
              className="nav-skip-btn"
              onClick={() => {
                if (currentQ < PREGUNTAS.length - 1) setCurrentQ((c) => c + 1);
                else handleSubmit();
              }}
              disabled={loading}
            >
              {currentQ === PREGUNTAS.length - 1 ? 'Finalizar' : 'Omitir →'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
