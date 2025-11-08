#!/bin/bash

# Script para reorganizar el proyecto XtaskFlow
# Separa claramente Frontend y Backend con sus respectivas arquitecturas

set -e

echo "🏗️  Reorganizando proyecto XtaskFlow..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para crear directorio si no existe
create_dir() {
    if [ ! -d "$1" ]; then
        mkdir -p "$1"
        echo -e "${GREEN}✓${NC} Creado: $1"
    else
        echo -e "${YELLOW}→${NC} Ya existe: $1"
    fi
}

echo ""
echo -e "${BLUE}📁 Paso 1: Creando estructura de Frontend${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Frontend - Presentation Layer
create_dir "frontend/src/presentation/components/common"
create_dir "frontend/src/presentation/components/layout"
create_dir "frontend/src/presentation/components/features/empleados"
create_dir "frontend/src/presentation/components/features/proyectos"
create_dir "frontend/src/presentation/components/features/nomina"
create_dir "frontend/src/presentation/components/features/dashboard"
create_dir "frontend/src/presentation/pages"
create_dir "frontend/src/presentation/routes"
create_dir "frontend/src/presentation/styles/themes"

# Frontend - Application Layer
create_dir "frontend/src/application/hooks/empleados"
create_dir "frontend/src/application/hooks/proyectos"
create_dir "frontend/src/application/hooks/nomina"
create_dir "frontend/src/application/hooks/common"
create_dir "frontend/src/application/services"
create_dir "frontend/src/application/store"
create_dir "frontend/src/application/validators"

# Frontend - Domain Layer
create_dir "frontend/src/domain/models"
create_dir "frontend/src/domain/types"
create_dir "frontend/src/domain/constants"

# Frontend - Infrastructure Layer
create_dir "frontend/src/infrastructure/http/interceptors"
create_dir "frontend/src/infrastructure/http/endpoints"
create_dir "frontend/src/infrastructure/storage"
create_dir "frontend/src/infrastructure/config"

# Frontend - Public
create_dir "frontend/public/assets"

echo ""
echo -e "${BLUE}⚙️  Paso 2: Creando estructura de Backend${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Backend - Domain Layer
create_dir "backend/src/domain/entities"
create_dir "backend/src/domain/value-objects"
create_dir "backend/src/domain/repositories"
create_dir "backend/src/domain/services"
create_dir "backend/src/domain/events"

# Backend - Application Layer
create_dir "backend/src/application/use-cases/empleados"
create_dir "backend/src/application/use-cases/proyectos"
create_dir "backend/src/application/use-cases/nomina"
create_dir "backend/src/application/use-cases/auth"
create_dir "backend/src/application/dto"
create_dir "backend/src/application/ports"

# Backend - Infrastructure Layer
create_dir "backend/src/infrastructure/database/drizzle/schema"
create_dir "backend/src/infrastructure/database/drizzle/migrations"
create_dir "backend/src/infrastructure/database/repositories"
create_dir "backend/src/infrastructure/external-services/email"
create_dir "backend/src/infrastructure/external-services/storage"
create_dir "backend/src/infrastructure/external-services/notifications"
create_dir "backend/src/infrastructure/config"

# Backend - Interfaces Layer
create_dir "backend/src/interfaces/http/controllers"
create_dir "backend/src/interfaces/http/routes"
create_dir "backend/src/interfaces/http/middleware"
create_dir "backend/src/interfaces/cli/commands"
create_dir "backend/src/interfaces/events/handlers"

# Backend - Shared
create_dir "backend/src/shared/utils"
create_dir "backend/src/shared/constants"
create_dir "backend/src/shared/types"

# Backend - Tests
create_dir "backend/tests/unit"
create_dir "backend/tests/integration"
create_dir "backend/tests/fixtures"

echo ""
echo -e "${BLUE}📦 Paso 3: Creando estructura de Shared${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

create_dir "shared/types"
create_dir "shared/schemas"
create_dir "shared/utils"
create_dir "shared/constants"

echo ""
echo -e "${BLUE}🐳 Paso 4: Creando estructura de Infrastructure${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

create_dir "infrastructure/docker"
create_dir "infrastructure/k8s"
create_dir "infrastructure/scripts"

echo ""
echo -e "${BLUE}📚 Paso 5: Creando estructura de Docs${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

create_dir "docs/architecture"
create_dir "docs/api"
create_dir "docs/guides"

echo ""
echo -e "${BLUE}🧪 Paso 6: Creando estructura de Tests${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

create_dir "tests/e2e"
create_dir "tests/integration"

echo ""
echo -e "${GREEN}✅ Estructura de carpetas creada exitosamente!${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${YELLOW}📋 Próximos pasos:${NC}"
echo "  1. Mover archivos existentes a la nueva estructura"
echo "  2. Actualizar imports y referencias"
echo "  3. Actualizar package.json con nuevos scripts"
echo "  4. Verificar que todo funcione correctamente"
echo ""
echo "Ver NUEVA_ESTRUCTURA_PROYECTO.md para más detalles"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
