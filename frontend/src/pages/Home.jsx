import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { eventosService } from '../services/api';
import Navbar from '../components/layout/Navbar';
import './Home.css';

const CheckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const MODULE_CARDS = [
  {
    id: 'lista',
    title: 'Haz tu lista',
    description: 'Este espacio lo puedes utilizar para agregar tus tareas y marcarlas una vez completadas.',
    icon: '✅',
    path: '/tareas',
    bg: 'var(--color-rose)',
  },
  {
    id: 'calendario',
    title: 'Calendario',
    description: 'Es importante saber cómo organizarás tus tareas diarias en el día.',
    icon: '📅',
    path: '/calendario',
  },
  {
    id: 'reloj',
    title: 'Reloj',
    description: 'Es importante tener un control en el tiempo mientras haces tus tareas.',
    icon: '⏰',
    path: '/ia',
  },
];

export default function Home() {
  const { usuario } = useAuth();
  const [tareas, setTareas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCard, setActiveCard] = useState('lista');

  useEffect(() => {
    loadTareas();
  }, []);

  const loadTareas = async () => {
    try {
      const res = await eventosService.getAll({ completado: false });
      setTareas(res.data.data.eventos.slice(0, 5));
    } catch {
      setTareas([]);
    } finally {
      setLoading(false);
    }
  };

  const activeModule = MODULE_CARDS.find((m) => m.id === activeCard) || MODULE_CARDS[0];

  return (
    <div className="home-page">
      <Navbar />

      <main className="home-main">
        {/* Hero section */}
        <section className="home-hero">
          {/* Feature card */}
          <div
            className="hero-card"
            style={{ background: activeModule.bg || 'var(--color-surface)' }}
          >
            <div className="hero-card-check">
              <CheckIcon />
            </div>
            <h2 className="hero-title">{activeModule.title.toUpperCase()}</h2>
            <p className="hero-subtitle">IL-DULE</p>
            <p className="hero-description">{activeModule.description}</p>
          </div>

          {/* Illustration placeholder */}
          <div className="hero-illustration">
            <div className="illustration-shapes">
              <div className="shape shape-triangle" />
              <div className="shape shape-star" />
              <div className="shape shape-square" />
            </div>
          </div>

          {/* Side icons */}
          <div className="hero-side-icons">
            <Link to="/tareas" className="side-icon-btn" title="Lista de tareas">
              <span className="side-icon-shape">
                <div className="mini-shapes">
                  <div className="mini-tri" />
                  <div className="mini-sq" />
                </div>
              </span>
            </Link>
          </div>
        </section>

        {/* Module list - matches the list in image 1 */}
        <section className="modules-section">
          {MODULE_CARDS.map((mod) => (
            <Link
              to={mod.path}
              key={mod.id}
              className={`module-row ${activeCard === mod.id ? 'active' : ''}`}
              onClick={() => setActiveCard(mod.id)}
            >
              <div className="module-row-icon">
                <div className="mini-shapes-icon">
                  <div className="mini-tri" />
                  <div className="mini-sq" />
                </div>
              </div>
              <div className="module-row-content">
                <span className="module-row-title">{mod.title}</span>
                <span className="module-row-desc">{mod.description}</span>
              </div>
              <button
                className="module-row-menu"
                onClick={(e) => { e.preventDefault(); }}
                aria-label="Opciones"
              >
                ⋮
              </button>
            </Link>
          ))}
        </section>

        {/* Footer links */}
        <footer className="home-footer">
          <Link to="/nosotros">Quienes somos</Link>
          <span>·</span>
          <a href="#redes">redes</a>
          <span>·</span>
          <a href="#enfoque">enfoque</a>
          <span>·</span>
          <a href="#contacto">números de servicio</a>
          <span>·</span>
          <a href="#etc">etc etc</a>
        </footer>
      </main>
    </div>
  );
}
