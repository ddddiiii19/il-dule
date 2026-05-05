#!/bin/bash
# ============================================================
# IL-DULE — Script de instalación rápida
# TEINCO 2026 · Bogotá D.C.
# ============================================================

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}"
echo "  ██╗██╗         ██████╗ ██╗   ██╗██╗     ███████╗"
echo "  ██║██║         ██╔══██╗██║   ██║██║     ██╔════╝"
echo "  ██║██║   ████  ██║  ██║██║   ██║██║     █████╗  "
echo "  ██║██║         ██║  ██║██║   ██║██║     ██╔══╝  "
echo "  ██║███████╗    ██████╔╝╚██████╔╝███████╗███████╗"
echo "  ╚═╝╚══════╝    ╚═════╝  ╚═════╝ ╚══════╝╚══════╝"
echo -e "${NC}"
echo -e "${YELLOW}  Asistente Académico Inteligente — TEINCO 2026${NC}"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js no encontrado. Por favor instala Node.js 18+${NC}"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Se requiere Node.js 18+. Versión actual: $(node -v)${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js $(node -v) detectado${NC}"

# Check PostgreSQL
if ! command -v psql &> /dev/null; then
    echo -e "${YELLOW}⚠️  PostgreSQL no encontrado en PATH. Asegúrate de tenerlo instalado.${NC}"
else
    echo -e "${GREEN}✅ PostgreSQL detectado: $(psql --version)${NC}"
fi

echo ""
echo -e "${BLUE}📦 Instalando dependencias del backend...${NC}"
cd backend
npm install
echo -e "${GREEN}✅ Backend listo${NC}"

echo ""
echo -e "${BLUE}📦 Instalando dependencias del frontend...${NC}"
cd ../frontend
npm install
echo -e "${GREEN}✅ Frontend listo${NC}"

cd ..

# Setup .env if not exists
if [ ! -f "backend/.env" ]; then
    echo ""
    echo -e "${YELLOW}⚙️  Creando archivo .env del backend...${NC}"
    cp backend/.env.example backend/.env
    echo -e "${YELLOW}📝 IMPORTANTE: Edita backend/.env con tus valores reales:${NC}"
    echo "   - DB_PASSWORD (tu contraseña de PostgreSQL)"
    echo "   - OPENAI_API_KEY (tu API key de OpenAI)"
    echo "   - JWT_SECRET (cambia por una clave segura)"
fi

echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   ✅ IL-DULE instalado correctamente          ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}🚀 Próximos pasos:${NC}"
echo ""
echo "1. Edita backend/.env con tus credenciales"
echo ""
echo "2. Configura la base de datos:"
echo "   psql -U postgres -c 'CREATE DATABASE ildule_db;'"
echo "   psql -U postgres -d ildule_db -f database/schema.sql"
echo ""
echo "3. Sincroniza los modelos:"
echo "   cd backend && npm run db:sync"
echo ""
echo "4. Inicia el backend (terminal 1):"
echo "   cd backend && npm run dev"
echo ""
echo "5. Inicia el frontend (terminal 2):"
echo "   cd frontend && npm start"
echo ""
echo -e "${BLUE}🌐 URLs:${NC}"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:5000/api/health"
echo ""
echo -e "${YELLOW}📚 Demo credentials: demo@ildule.co / test1234${NC}"
echo ""
