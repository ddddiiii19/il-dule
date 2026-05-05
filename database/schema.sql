-- ============================================================
-- IL-DULE Database Setup Script
-- Corporación Tecnológica Industrial Colombiana - TEINCO
-- 2026 Bogotá D.C.
-- ============================================================

-- Create database (run as superuser)
-- CREATE DATABASE ildule_db;
-- \c ildule_db

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── Table: usuarios ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS usuarios (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre          VARCHAR(100) NOT NULL,
    email           VARCHAR(150) NOT NULL UNIQUE,
    password        VARCHAR(255) NOT NULL,
    avatar_inicial  VARCHAR(5),
    activo          BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_activo ON usuarios(activo);

-- ─── Table: eventos ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS eventos (
    id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id            UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    titulo                VARCHAR(200) NOT NULL,
    descripcion           TEXT,
    tipo                  VARCHAR(20) NOT NULL DEFAULT 'tarea'
                          CHECK (tipo IN ('tarea','clase','proyecto','examen','actividad','otro')),
    fecha_inicio          TIMESTAMPTZ NOT NULL,
    fecha_fin             TIMESTAMPTZ,
    fecha_limite          TIMESTAMPTZ,
    prioridad             VARCHAR(10) NOT NULL DEFAULT 'media'
                          CHECK (prioridad IN ('alta','media','baja')),
    completado            BOOLEAN DEFAULT FALSE,
    color                 VARCHAR(20) DEFAULT '#8B7EC8',
    todo_el_dia           BOOLEAN DEFAULT FALSE,
    recordatorio_minutos  INTEGER DEFAULT 30,
    created_at            TIMESTAMPTZ DEFAULT NOW(),
    updated_at            TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_eventos_usuario_id   ON eventos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_eventos_fecha_inicio ON eventos(fecha_inicio);
CREATE INDEX IF NOT EXISTS idx_eventos_completado   ON eventos(completado);
CREATE INDEX IF NOT EXISTS idx_eventos_prioridad    ON eventos(prioridad);

-- ─── Table: perfiles_aprendizaje ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS perfiles_aprendizaje (
    id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id            UUID NOT NULL UNIQUE REFERENCES usuarios(id) ON DELETE CASCADE,
    estilo_predominante   VARCHAR(30) NOT NULL
                          CHECK (estilo_predominante IN ('visual','auditivo','kinestesico','lectura_escritura')),
    puntaje_visual        INTEGER DEFAULT 0,
    puntaje_auditivo      INTEGER DEFAULT 0,
    puntaje_kinestesico   INTEGER DEFAULT 0,
    puntaje_lectura       INTEGER DEFAULT 0,
    horas_estudio_diarias DECIMAL(4,2),
    nivel_procrastinacion VARCHAR(10)
                          CHECK (nivel_procrastinacion IN ('bajo','medio','alto')),
    metodos_preferidos    TEXT[] DEFAULT '{}',
    respuestas_raw        JSONB,
    completado            BOOLEAN DEFAULT FALSE,
    created_at            TIMESTAMPTZ DEFAULT NOW(),
    updated_at            TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_perfil_usuario_id ON perfiles_aprendizaje(usuario_id);

-- ─── Auto-update updated_at trigger ──────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_usuarios_updated_at
    BEFORE UPDATE ON usuarios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_eventos_updated_at
    BEFORE UPDATE ON eventos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_perfiles_updated_at
    BEFORE UPDATE ON perfiles_aprendizaje
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─── Sample data for testing ─────────────────────────────────────────
-- Password: 'test1234' hashed with bcrypt (12 rounds)
INSERT INTO usuarios (id, nombre, email, password, avatar_inicial)
VALUES (
    uuid_generate_v4(),
    'Estudiante Demo',
    'demo@ildule.co',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMUmRUUMG5xg8Trt/qrjxLuFGu',
    'E'
) ON CONFLICT (email) DO NOTHING;

-- ─── Useful queries ───────────────────────────────────────────────────
-- Check all tables
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Count events by priority
-- SELECT prioridad, COUNT(*) FROM eventos GROUP BY prioridad;

-- Events due in the next 7 days
-- SELECT titulo, fecha_inicio, prioridad FROM eventos
-- WHERE fecha_inicio BETWEEN NOW() AND NOW() + INTERVAL '7 days'
-- AND completado = FALSE
-- ORDER BY fecha_inicio;
