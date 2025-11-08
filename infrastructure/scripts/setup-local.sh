#!/bin/bash

# Script de configuración para entorno local de XTask Platform
# Este script ayuda a configurar el proyecto en tu máquina local

set -e  # Salir si hay algún error

echo "🚀 Configurando XTask Platform para desarrollo local..."
echo ""

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar Node.js
echo "📦 Verificando Node.js..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js no está instalado${NC}"
    echo "Por favor instala Node.js v18 o superior desde https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js v18 o superior es requerido (actual: v$NODE_VERSION)${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Node.js $(node -v) detectado${NC}"

# Verificar PostgreSQL
echo ""
echo "🐘 Verificando PostgreSQL..."
if ! command -v psql &> /dev/null; then
    echo -e "${YELLOW}⚠️  PostgreSQL no está instalado o no está en el PATH${NC}"
    echo "Por favor instala PostgreSQL v15 o superior:"
    echo "  - macOS: brew install postgresql@15"
    echo "  - Ubuntu: sudo apt install postgresql postgresql-contrib"
    echo "  - Windows: https://www.postgresql.org/download/windows/"
    echo ""
    read -p "¿Deseas continuar de todas formas? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo -e "${GREEN}✅ PostgreSQL detectado${NC}"
fi

# Instalar dependencias
echo ""
echo "📥 Instalando dependencias de Node.js..."
npm install
echo -e "${GREEN}✅ Dependencias instaladas${NC}"

# Configurar archivo .env
echo ""
echo "⚙️  Configurando variables de entorno..."
if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        cp .env.example .env
        echo -e "${GREEN}✅ Archivo .env creado desde .env.example${NC}"
        echo -e "${YELLOW}⚠️  IMPORTANTE: Edita el archivo .env con tus configuraciones${NC}"
        echo "   Especialmente la variable DATABASE_URL"
    else
        echo -e "${RED}❌ No se encontró .env.example${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}⚠️  El archivo .env ya existe, no se sobrescribirá${NC}"
fi

# Crear base de datos (opcional)
echo ""
read -p "¿Deseas crear la base de datos 'xtask_db' ahora? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Creando base de datos..."
    
    # Intentar crear la base de datos
    if command -v createdb &> /dev/null; then
        createdb xtask_db 2>/dev/null && echo -e "${GREEN}✅ Base de datos 'xtask_db' creada${NC}" || echo -e "${YELLOW}⚠️  La base de datos ya existe o hubo un error${NC}"
    else
        echo -e "${YELLOW}⚠️  No se pudo crear automáticamente. Créala manualmente:${NC}"
        echo "   psql -U postgres -c 'CREATE DATABASE xtask_db;'"
    fi
fi

# Inicializar esquema de base de datos
echo ""
read -p "¿Deseas inicializar el esquema de la base de datos? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Aplicando migraciones..."
    npm run db:push
    echo -e "${GREEN}✅ Esquema de base de datos inicializado${NC}"
fi

# Resumen final
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ ¡Configuración completada!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📝 Próximos pasos:"
echo ""
echo "1. Edita el archivo .env con tus configuraciones:"
echo "   nano .env"
echo ""
echo "2. Inicia el servidor de desarrollo:"
echo "   npm run dev"
echo ""
echo "3. Abre tu navegador en:"
echo "   http://localhost:5000"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📚 Para más información, consulta el README.md"
echo ""
