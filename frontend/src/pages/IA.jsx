import React, { useState, useEffect, useRef } from 'react';
import { aiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/layout/Navbar';
import './IA.css';

const QUICK_SUGGESTIONS = [
  '¿Cómo puedo organizar mejor mi semana?',
  'Dame técnicas para estudiar para un examen',
  '¿Qué método Pomodoro me recomiendas?',
  'Tengo muchas tareas, ¿por dónde empiezo?',
];

const CONVERSATION_EXAMPLES = [
  { id: 1, name: 'Organización semanal', preview: 'Cómo organizar mis tareas...', time: 'Hoy' },
  { id: 2, name: 'Técnicas de estudio', preview: 'Método Pomodoro para examen...', time: 'Ayer' },
  { id: 3, name: 'Gestión del tiempo', preview: 'Priorización de actividades...', time: '2d' },
];

export default function IA() {
  const { usuario } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sugerencias, setSugerencias] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    loadSugerencias();
    // Welcome message
    setMessages([
      {
        id: Date.now(),
        role: 'assistant',
        content: `¡Hola ${usuario?.nombre?.split(' ')[0] || ''}! 👋 Soy tu asistente académico IL-DULE. Estoy aquí para ayudarte a organizarte mejor y alcanzar tus metas estudiantiles. ¿En qué te puedo ayudar hoy?`,
        timestamp: new Date(),
      },
    ]);
  }, [usuario]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadSugerencias = async () => {
    try {
      const res = await aiService.sugerencias();
      setSugerencias(res.data.data.sugerencias);
    } catch {
      setSugerencias([]);
    }
  };

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;

    setInput('');
    const userMsg = {
      id: Date.now(),
      role: 'user',
      content: msg,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const historial = messages
        .filter((m) => m.role !== 'system')
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await aiService.chat(msg, historial);
      const aiMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        content: res.data.data.respuesta,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      const errMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        content: '⚠️ Hubo un error al procesar tu mensaje. Por favor intenta nuevamente.',
        timestamp: new Date(),
        isError: true,
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="ia-page">
      <Navbar />

      <div className="ia-layout">
        {/* Conversations sidebar - matches Image 6 left panel */}
        <aside className="ia-sidebar">
          <div className="ia-sidebar-header">
            <h3>Conversaciones</h3>
          </div>

          <div className="conversations-list">
            {CONVERSATION_EXAMPLES.map((conv) => (
              <div
                key={conv.id}
                className={`conversation-item ${activeConv === conv.id ? 'active' : ''}`}
                onClick={() => setActiveConv(conv.id)}
              >
                <div className="conv-avatar">
                  <div className="conv-avatar-shapes">
                    <div className="cav-tri" />
                    <div className="cav-sq" />
                  </div>
                </div>
                <div className="conv-info">
                  <span className="conv-name">{conv.name}</span>
                  <span className="conv-preview">{conv.preview}</span>
                </div>
                <span className="conv-time">{conv.time}</span>
              </div>
            ))}
          </div>
        </aside>

        {/* Chat area - matches Image 6 right panel */}
        <main className="ia-chat">
          {/* Chat header */}
          <div className="chat-header">
            <button className="chat-back" aria-label="Volver">‹</button>
            <span className="chat-name">Asistente IA</span>
            <div className="chat-actions">
              <button className="chat-icon-btn" aria-label="Adjuntar">📎</button>
              <button className="chat-icon-btn" aria-label="Más opciones">⋮</button>
            </div>
          </div>

          {/* Messages */}
          <div className="chat-messages">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`message-wrapper ${msg.role === 'user' ? 'user' : 'assistant'} animate-fadeIn`}
              >
                {msg.role === 'assistant' && (
                  <div className="msg-avatar-ai">
                    <div className="mini-shapes-ai">
                      <div className="ai-tri" />
                      <div className="ai-sq" />
                    </div>
                  </div>
                )}
                <div className={`message-bubble ${msg.role} ${msg.isError ? 'error' : ''}`}>
                  <p>{msg.content}</p>
                  <span className="msg-time">{formatTime(msg.timestamp)}</span>
                </div>
              </div>
            ))}

            {loading && (
              <div className="message-wrapper assistant">
                <div className="msg-avatar-ai">
                  <div className="mini-shapes-ai">
                    <div className="ai-tri" />
                    <div className="ai-sq" />
                  </div>
                </div>
                <div className="message-bubble assistant typing">
                  <span className="typing-dots">
                    <span />
                    <span />
                    <span />
                  </span>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Quick suggestions - matches Image 6 pill buttons */}
          {messages.length <= 1 && (
            <div className="quick-suggestions">
              {QUICK_SUGGESTIONS.map((s, i) => (
                <button key={i} className="suggestion-pill" onClick={() => sendMessage(s)}>
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input area - matches Image 6 bottom bar */}
          <div className="chat-input-area">
            <button className="input-action-btn" aria-label="Emoji">😊</button>
            <button className="input-action-btn" aria-label="Añadir">➕</button>
            <div className="chat-input-wrapper">
              <textarea
                className="chat-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Escribe tu pregunta..."
                rows={1}
                disabled={loading}
              />
            </div>
            <button className="input-action-btn" aria-label="Menu">☰</button>
            <button
              className="send-btn"
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              aria-label="Enviar"
            >
              {loading ? <span className="loading-spinner-sm" /> : '🔍'}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
