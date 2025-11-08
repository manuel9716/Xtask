#!/bin/bash

# Script para configurar la base de datos PostgreSQL

set -e

echo "🚀 Configurando base de datos XtaskFlow..."

# Verificar si Docker está corriendo
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker no está corriendo. Por favor inicia Docker Desktop."
    exit 1
fi

# Verificar si existe .env
if [ ! -f .env ]; then
    echo "📝 Creando archivo .env desde .env.example..."
    cp .env.example .env
    echo "✅ Archivo .env creado. Por favor revisa y ajusta las variables si es necesario."
fi

# Iniciar PostgreSQL
echo "🐘 Iniciando PostgreSQL..."
docker-compose up -d postgres

# Esperar a que PostgreSQL esté listo
echo "⏳ Esperando a que PostgreSQL esté listo..."
sleep 5

# Verificar que el contenedor está corriendo
if docker ps | grep -q xtaskflow-postgres; then
    echo "✅ PostgreSQL está corriendo"
else
    echo "❌ Error: PostgreSQL no pudo iniciarse"
    docker-compose logs postgres
    exit 1
fi

# Ejecutar migraciones
echo "📦 Ejecutando migraciones..."
npm run db:push

echo ""
echo "✅ ¡Base de datos configurada exitosamente!"
echo ""
echo "📊 Información de conexión:"
echo "   Host: localhost"
echo "   Puerto: 5432"
echo "   Base de datos: xtaskflow_db"
echo "   Usuario: xtaskflow_user"
echo "   Contraseña: XtaskFlow2024!"
echo ""
echo "🔧 Comandos útiles:"
echo "   - Ver logs: docker-compose logs -f postgres"
echo "   - Detener: docker-compose stop postgres"
echo "   - Reiniciar: docker-compose restart postgres"
echo "   - Drizzle Studio: npm run db:studio"
echo ""
echo "🌐 Interfaces web disponibles:"
echo "   - pgAdmin: http://localhost:5050"
echo "   - Adminer: http://localhost:8081"
echo ""
