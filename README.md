# 🌸 IL-DULE — Asistente Académico Inteligente

> **Corporación Tecnológica Industrial Colombiana — TEINCO**
> Semillero SIIANTEC · Ingeniería en Sistemas · 2026

IL-DULE es una aplicación web de gestión académica que integra inteligencia artificial para ayudar a estudiantes de secundaria y universidad a organizar su tiempo, gestionar tareas y recibir recomendaciones personalizadas de estudio.

---

## 🧩 Arquitectura

```
il-dule/
├── backend/                    # Node.js + Express (API REST)
│   ├── config/
│   │   ├── database.js         # Conexión PostgreSQL con Sequelize
│   │   └── syncDb.js           # Script de sincronización de modelos
│   ├── controllers/
│   │   ├── authController.js   # Registro, login, me, logout
│   │   ├── eventosController.js # CRUD de eventos académicos
│   │   ├── aiController.js     # Integración OpenAI (chat + sugerencias)
│   │   └── perfilController.js # Perfil de aprendizaje VARK
│   ├── middlewares/
│   │   ├── auth.js             # Verificación JWT
│   │   └── errorHandler.js     # Manejo global de errores
│   ├── models/
│   │   ├── Usuario.js          # Modelo de usuario
│   │   ├── Evento.js           # Modelo de evento académico
│   │   └── PerfilAprendizaje.js # Modelo de perfil VARK
│   ├── routes/
│   │   ├── auth.js             # /api/auth/*
│   │   ├── events.js           # /api/events/*
│   │   └── ai.js               # /api/ai/* y /api/perfil/*
│   ├── .env.example
│   ├── package.json
│   └── server.js               # Entry point
│
├── frontend/                   # React SPA
│   ├── public/
│   │   ├── index.html
│   │   └── manifest.json
│   └── src/
│       ├── components/
│       │   ├── auth/
│       │   ├── common/
│       │   │   └── ProtectedRoute.jsx
│       │   ├── layout/
│       │   │   ├── Navbar.jsx
│       │   │   └── Navbar.css
│       │   └── tasks/
│       │       ├── EventoModal.jsx
│       │       └── EventoModal.css
│       ├── context/
│       │   └── AuthContext.jsx  # Estado global de autenticación
│       ├── hooks/
│       │   └── useNotifications.js # Web Notifications API
│       ├── pages/
│       │   ├── Login.jsx + Login.css
│       │   ├── Home.jsx + Home.css
│       │   ├── Tareas.jsx + Tareas.css
│       │   ├── Calendario.jsx + Calendario.css
│       │   ├── IA.jsx + IA.css
│       │   └── Encuesta.jsx + Encuesta.css
│       ├── services/
│       │   └── api.js           # Axios + interceptores JWT
│       ├── styles/
│       │   └── global.css       # Variables CSS + reset
│       ├── App.jsx              # Router principal
│       └── index.js
│
└── database/
    └── schema.sql              # Script SQL completo
```

---

## ⚙️ Requisitos previos

| Herramienta | Versión mínima |
|-------------|----------------|
| Node.js     | 18.x           |
| npm         | 9.x            |
| PostgreSQL  | 14.x           |
| Git         | 2.x            |

---

## 🚀 Instalación paso a paso

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/il-dule.git
cd il-dule
```

### 2. Configurar la base de datos PostgreSQL

```bash
# Conectarse a PostgreSQL como superusuario
psql -U postgres

# Dentro de psql:
CREATE DATABASE ildule_db;
\c ildule_db
\i database/schema.sql
\q
```

### 3. Configurar el Backend

```bash
cd backend

# Instalar dependencias
npm install

# Copiar y editar variables de entorno
cp .env.example .env
```

Editar `.env` con tus valores:

```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=ildule_db
DB_USER=postgres
DB_PASSWORD=TU_PASSWORD_AQUI

JWT_SECRET=il_dule_super_secret_key_2026
JWT_EXPIRES_IN=7d

OPENAI_API_KEY=sk-XXXXXXXXXXXXXXXXXXXXXXXXXXXX

FRONTEND_URL=http://localhost:3000
```

```bash
# Sincronizar modelos con la base de datos
npm run db:sync

# Iniciar en desarrollo
npm run dev
```

El backend quedará disponible en `http://localhost:5000`

### 4. Configurar el Frontend

```bash
cd ../frontend

# Instalar dependencias
npm install

# (Opcional) Crear .env si necesitas cambiar la URL de la API
echo "REACT_APP_API_URL=http://localhost:5000/api" > .env

# Iniciar en desarrollo
npm start
```

El frontend quedará disponible en `http://localhost:3000`

---

## 🔌 API Endpoints

### Autenticación — `/api/auth`

| Método | Ruta       | Descripción              | Auth |
|--------|------------|--------------------------|------|
| POST   | /register  | Registrar usuario        | No   |
| POST   | /login     | Iniciar sesión           | No   |
| GET    | /me        | Obtener usuario actual   | Sí   |
| POST   | /logout    | Cerrar sesión            | Sí   |

**Ejemplo — Registro:**
```json
POST /api/auth/register
{
  "nombre": "Sharon Fino",
  "email": "sharon@teinco.edu.co",
  "password": "mipass123"
}
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "usuario": {
      "id": "uuid",
      "nombre": "Sharon Fino",
      "email": "sharon@teinco.edu.co",
      "avatar_inicial": "S",
      "tiene_perfil": false
    }
  }
}
```

---

### Eventos — `/api/events` 🔐

| Método | Ruta             | Descripción                  |
|--------|------------------|------------------------------|
| GET    | /                | Listar eventos (con filtros) |
| GET    | /:id             | Obtener evento por ID        |
| POST   | /                | Crear evento                 |
| PUT    | /:id             | Actualizar evento            |
| DELETE | /:id             | Eliminar evento              |
| PATCH  | /:id/complete    | Toggle completado            |

**Query params para GET /:**
```
?start=2026-01-01&end=2026-01-31
?tipo=tarea
?prioridad=alta
?completado=false
```

**Ejemplo — Crear evento:**
```json
POST /api/events
Authorization: Bearer <token>
{
  "titulo": "Entregar proyecto final",
  "descripcion": "Proyecto de Ingeniería de Software",
  "tipo": "proyecto",
  "fecha_inicio": "2026-05-15T09:00:00.000Z",
  "fecha_limite": "2026-05-20T23:59:00.000Z",
  "prioridad": "alta",
  "recordatorio_minutos": 60
}
```

---

### IA — `/api/ai` 🔐

| Método | Ruta          | Descripción                          |
|--------|---------------|--------------------------------------|
| POST   | /chat         | Enviar mensaje al asistente IA       |
| GET    | /sugerencias  | Obtener 3 sugerencias personalizadas |

**Ejemplo — Chat:**
```json
POST /api/ai/chat
{
  "mensaje": "¿Cómo puedo estudiar mejor para mi examen de mañana?",
  "historial": [
    { "role": "user", "content": "Hola" },
    { "role": "assistant", "content": "¡Hola! ¿En qué te ayudo?" }
  ]
}
```

---

### Perfil — `/api/perfil` 🔐

| Método | Ruta | Descripción                    |
|--------|------|--------------------------------|
| GET    | /    | Obtener perfil de aprendizaje  |
| POST   | /    | Crear/actualizar perfil        |

**Ejemplo — Crear perfil:**
```json
POST /api/perfil
{
  "respuestas": [
    { "pregunta_id": 1, "estilo": "visual" },
    { "pregunta_id": 2, "estilo": "kinestesico" },
    { "pregunta_id": 3, "estilo": "visual" },
    { "pregunta_id": 4, "estilo": "auditivo" }
  ],
  "horas_estudio": 3,
  "nivel_procrastinacion": "medio"
}
```

---

## 🔐 Seguridad implementada

- **bcrypt** (12 rounds) para hash de contraseñas
- **JWT** con expiración configurable para sesiones
- **CORS** restringido al origen del frontend
- **express-validator** para validación de entradas
- **HTTPS** recomendado en producción con Nginx + Let's Encrypt
- Protección de API Key de OpenAI en el backend (nunca expuesta al cliente)
- Ley 1581 de 2012 — Protección de datos personales (Colombia)

---

## 🎨 Paleta de colores

| Variable                  | Color     | Uso                         |
|---------------------------|-----------|-----------------------------|
| `--color-primary`         | `#7C6BAE` | Elementos principales       |
| `--color-primary-dark`    | `#5C4B8A` | Hover, activos              |
| `--color-rose`            | `#F8E8E8` | Card de bienvenida          |
| `--color-dark`            | `#1A1625`  | Navbar avatar, botones      |
| `--color-priority-alta`   | `#E57373` | Prioridad alta              |
| `--color-priority-media`  | `#8B7EC8` | Prioridad media             |
| `--color-priority-baja`   | `#81C784` | Prioridad baja              |

---

## 🏭 Despliegue en producción

### Backend con PM2 + Nginx

```bash
# Instalar PM2 globalmente
npm install -g pm2

# Iniciar el backend
cd backend
NODE_ENV=production pm2 start server.js --name "il-dule-api"
pm2 save
pm2 startup

# Configurar Nginx como proxy inverso
sudo nano /etc/nginx/sites-available/ildule
```

**Configuración Nginx:**

```nginx
server {
    listen 80;
    server_name tu-dominio.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name tu-dominio.com;

    ssl_certificate     /etc/letsencrypt/live/tu-dominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/tu-dominio.com/privkey.pem;

    # Frontend (React build)
    root /var/www/il-dule/frontend/build;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # API backend
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Certificado SSL con Let's Encrypt
sudo certbot --nginx -d tu-dominio.com

# Build del frontend
cd frontend
npm run build
sudo cp -r build/* /var/www/il-dule/frontend/build/
```

---

## 🧪 Datos de prueba

```
Email:    demo@ildule.co
Password: test1234
```

---

## 👥 Equipo

| Nombre                      | Rol           |
|-----------------------------|---------------|
| Sharon Yulieth Fino Osorio  | Frontend / UX |
| Klarent Santiago Paez Ramirez | Backend / DB |
| David Hernando Parra Castro | IA / Testing  |

**Docentes:** Víctor Guzmán · Patricia Mora

---

## 📄 Marco Legal

- Ley 115 de 1994 — Ley General de Educación (Colombia)
- Ley 1341 de 2009 — TIC en Colombia
- Ley 1581 de 2012 — Protección de Datos Personales
- ODS 4 — Educación de calidad (CEPAL / ONU)

---

## 📚 Tecnologías principales

| Categoría  | Tecnología                            |
|------------|---------------------------------------|
| Frontend   | React 18, React Router 6, Axios       |
| Calendar   | FullCalendar 6                        |
| Backend    | Node.js 18, Express 4, Sequelize 6    |
| Base datos | PostgreSQL 14                         |
| Auth       | JWT, bcrypt                           |
| IA         | OpenAI GPT-4o-mini                    |
| Despliegue | PM2, Nginx, Let's Encrypt             |
| Diseño     | CSS Variables, DM Sans (Google Fonts) |

---

*IL-DULE — TEINCO 2026 · Bogotá D.C., Colombia*
