#!/bin/bash

# Script de Validación de Setup SQL Server
# Fecha: 13 de Octubre, 2025

echo "🔍 Validando configuración de SQL Server..."
echo "============================================"
echo ""

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Contadores
PASSED=0
FAILED=0
WARNINGS=0

# Función para checks
check_pass() {
    echo -e "${GREEN}✅ $1${NC}"
    ((PASSED++))
}

check_fail() {
    echo -e "${RED}❌ $1${NC}"
    ((FAILED++))
}

check_warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
    ((WARNINGS++))
}

echo "1️⃣  Verificando archivo .env..."
if [ -f ".env" ]; then
    check_pass "Archivo .env existe"
    
    if grep -q "DATABASE_URL=mssql://" .env; then
        check_pass "DATABASE_URL configurado para SQL Server"
    else
        check_fail "DATABASE_URL NO está configurado para SQL Server"
        echo "   Debe comenzar con: mssql://"
    fi
else
    check_fail "Archivo .env NO existe"
    echo "   Ejecuta: cp .env.example .env"
fi

echo ""
echo "2️⃣  Verificando dependencias..."

if [ -d "node_modules/mssql" ]; then
    check_pass "Paquete 'mssql' instalado"
else
    check_fail "Paquete 'mssql' NO instalado"
    echo "   Ejecuta: npm install mssql"
fi

if [ -d "node_modules/tedious" ]; then
    check_pass "Paquete 'tedious' instalado"
else
    check_fail "Paquete 'tedious' NO instalado"
    echo "   Ejecuta: npm install tedious"
fi

echo ""
echo "3️⃣  Verificando archivos de configuración..."

if [ -f "server/db.ts" ]; then
    check_pass "server/db.ts existe"
    
    if grep -q "isSqlServer" server/db.ts; then
        check_pass "Detección de SQL Server implementada"
    else
        check_warn "Detección de SQL Server podría no estar implementada"
    fi
else
    check_fail "server/db.ts NO existe"
fi

if [ -f "server/storage-sqlserver.ts" ]; then
    check_pass "server/storage-sqlserver.ts existe"
else
    check_fail "server/storage-sqlserver.ts NO existe"
fi

echo ""
echo "4️⃣  Verificando servidor..."

if lsof -ti:5001 > /dev/null 2>&1; then
    check_pass "Servidor corriendo en puerto 5001"
else
    check_warn "Servidor NO está corriendo"
    echo "   Ejecuta: npm run dev"
fi

echo ""
echo "5️⃣  Buscando referencias problemáticas..."

# Buscar imports de db en rutas
DB_IMPORTS=$(grep -r "from.*['\"].*db['\"]" server/routes/*.ts 2>/dev/null | wc -l)
if [ "$DB_IMPORTS" -gt 0 ]; then
    check_warn "Encontradas $DB_IMPORTS referencias a 'db' en rutas"
    echo "   Estas rutas podrían no funcionar con SQL Server"
else
    check_pass "No se encontraron referencias directas a 'db' en rutas"
fi

# Buscar uso de drizzle-orm
DRIZZLE_USAGE=$(grep -r "from 'drizzle-orm'" server/routes/*.ts 2>/dev/null | wc -l)
if [ "$DRIZZLE_USAGE" -gt 0 ]; then
    check_warn "Encontradas $DRIZZLE_USAGE referencias a 'drizzle-orm' en rutas"
    echo "   Drizzle ORM no funciona con SQL Server"
else
    check_pass "No se encontraron referencias a drizzle-orm en rutas"
fi

echo ""
echo "6️⃣  Verificando métodos implementados en SQL Server Storage..."

if [ -f "server/storage-sqlserver.ts" ]; then
    METHODS=$(grep -c "async get\|async create\|async update\|async delete" server/storage-sqlserver.ts)
    check_pass "Encontrados $METHODS métodos implementados en SQL Server Storage"
    
    if [ "$METHODS" -lt 10 ]; then
        check_warn "Solo $METHODS métodos implementados (se necesitan más)"
    fi
else
    check_fail "No se puede verificar métodos (archivo no existe)"
fi

echo ""
echo "============================================"
echo "📊 RESUMEN DE VALIDACIÓN"
echo "============================================"
echo -e "${GREEN}✅ Pasados: $PASSED${NC}"
echo -e "${YELLOW}⚠️  Advertencias: $WARNINGS${NC}"
echo -e "${RED}❌ Fallidos: $FAILED${NC}"
echo ""

if [ "$FAILED" -eq 0 ] && [ "$WARNINGS" -eq 0 ]; then
    echo -e "${GREEN}🎉 ¡Todo está configurado correctamente!${NC}"
    exit 0
elif [ "$FAILED" -eq 0 ]; then
    echo -e "${YELLOW}⚠️  Configuración funcional pero con advertencias${NC}"
    echo "   Revisa el reporte: REPORTE_DEBUG_COMPLETO.md"
    exit 0
else
    echo -e "${RED}❌ Hay problemas que deben corregirse${NC}"
    echo "   Revisa el reporte: REPORTE_DEBUG_COMPLETO.md"
    exit 1
fi
