# ⚡ Comandos Rápidos - XtaskFlow

## 🚀 Inicio Rápido (Primera Vez)

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar base de datos
./scripts/setup-db.sh

# 3. Iniciar desarrollo
npm run dev
```

---

## 🗄️ Base de Datos

### Iniciar/Detener
```bash
# Iniciar PostgreSQL
docker-compose up -d postgres

# Iniciar con herramientas web
docker-compose up -d postgres pgadmin adminer

# Iniciar SQL Server (opcional)
docker-compose --profile sqlserver up -d sqlserver

# Detener todo
docker-compose down

# Detener y eliminar datos
docker-compose down -v
```

### Migraciones
```bash
# Aplicar cambios de schema
npm run db:push

# Generar migraciones
npm run db:generate

# Abrir Drizzle Studio
npm run db:studio
```

### Verificar Estado
```bash
# Ver contenedores corriendo
docker ps

# Ver logs de PostgreSQL
docker-compose logs -f postgres

# Conectar a PostgreSQL
docker exec -it xtaskflow-postgres psql -U xtaskflow_user -d xtaskflow_db

# Listar tablas
docker exec -it xtaskflow-postgres psql -U xtaskflow_user -d xtaskflow_db -c "\dt"
```

---

## 🏗️ Desarrollo

### Servidor
```bash
# Desarrollo (con hot reload)
npm run dev

# Build para producción
npm run build

# Iniciar producción
npm start

# Verificar tipos TypeScript
npm run check
```

### Frontend (si está separado)
```bash
# Desarrollo
cd client && npm run dev

# Build
cd client && npm run build

# Preview
cd client && npm run preview
```

---

## 🔄 Migración de Módulos

### Generar Estructura Completa
```bash
# Generar módulo de empleados
./scripts/migrate-module.sh empleados

# Generar módulo de proyectos
./scripts/migrate-module.sh proyectos

# Generar módulo de nómina
./scripts/migrate-module.sh nomina

# Generar módulo de capacitaciones
./scripts/migrate-module.sh capacitaciones
```

### Buscar TODOs
```bash
# Buscar todos los TODOs en backend
grep -r "TODO" server/

# Buscar TODOs en frontend
grep -r "TODO" client/src/

# Buscar TODOs en un módulo específico
grep -r "TODO" server/domain/entities/empleados.entity.ts
```

---

## 🧪 Testing

### Ejecutar Tests
```bash
# Todos los tests
npm test

# Tests en modo watch
npm run test:watch

# Tests con coverage
npm run test:coverage
```

### Probar Endpoints
```bash
# GET - Listar empleados
curl http://localhost:5000/api/empleados

# GET - Obtener empleado por ID
curl http://localhost:5000/api/empleados/1

# POST - Crear empleado
curl -X POST http://localhost:5000/api/empleados \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Juan Pérez","email":"juan@example.com"}'

# PUT - Actualizar empleado
curl -X PUT http://localhost:5000/api/empleados/1 \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Juan Pérez Actualizado"}'

# DELETE - Eliminar empleado
curl -X DELETE http://localhost:5000/api/empleados/1
```

---

## 🌐 Acceso a Herramientas Web

### Interfaces de Base de Datos
```bash
# pgAdmin
open http://localhost:5050
# Email: admin@xtaskflow.com
# Password: admin

# Adminer
open http://localhost:8081
# Sistema: PostgreSQL
# Servidor: postgres
# Usuario: xtaskflow_user
# Contraseña: XtaskFlow2024!

# Drizzle Studio
npm run db:studio
# Se abre automáticamente en el navegador
```

### Aplicación
```bash
# Backend API
open http://localhost:5000

# Frontend (si está separado)
open http://localhost:5173
```

---

## 📦 Gestión de Dependencias

### Instalar/Actualizar
```bash
# Instalar todas las dependencias
npm install

# Instalar dependencia específica
npm install <paquete>

# Instalar dependencia de desarrollo
npm install -D <paquete>

# Actualizar dependencias
npm update

# Verificar dependencias obsoletas
npm outdated
```

### Limpiar
```bash
# Limpiar node_modules y reinstalar
rm -rf node_modules package-lock.json
npm install

# Limpiar cache de npm
npm cache clean --force
```

---

## 🔍 Debugging

### Logs y Diagnóstico
```bash
# Ver logs de Docker
docker-compose logs -f

# Ver logs de PostgreSQL
docker-compose logs -f postgres

# Ver logs de aplicación
npm run dev 2>&1 | tee app.log

# Verificar puertos en uso
lsof -i :5000  # Backend
lsof -i :5432  # PostgreSQL
lsof -i :5050  # pgAdmin
lsof -i :8081  # Adminer
```

### Verificar Configuración
```bash
# Ver variables de entorno
cat .env

# Verificar configuración de Docker
docker-compose config

# Verificar versiones
node --version
npm --version
docker --version
docker-compose --version
```

---

## 🔧 Mantenimiento

### Limpieza
```bash
# Limpiar contenedores detenidos
docker container prune

# Limpiar imágenes no usadas
docker image prune

# Limpiar volúmenes no usados
docker volume prune

# Limpiar todo (cuidado!)
docker system prune -a
```

### Backup de Base de Datos
```bash
# Backup de PostgreSQL
docker exec xtaskflow-postgres pg_dump -U xtaskflow_user xtaskflow_db > backup.sql

# Restaurar backup
cat backup.sql | docker exec -i xtaskflow-postgres psql -U xtaskflow_user -d xtaskflow_db

# Backup con timestamp
docker exec xtaskflow-postgres pg_dump -U xtaskflow_user xtaskflow_db > backup_$(date +%Y%m%d_%H%M%S).sql
```

---

## 📊 Monitoreo

### Estado del Sistema
```bash
# Ver uso de recursos de Docker
docker stats

# Ver espacio en disco de Docker
docker system df

# Ver contenedores activos
docker ps

# Ver todos los contenedores
docker ps -a

# Ver redes de Docker
docker network ls

# Ver volúmenes de Docker
docker volume ls
```

### Performance
```bash
# Analizar bundle size (frontend)
cd client && npm run build -- --analyze

# Ver tiempo de build
time npm run build

# Profiling de Node.js
node --prof server/index.js
```

---

## 🚨 Solución de Problemas

### Reset Completo
```bash
# 1. Detener todo
docker-compose down -v

# 2. Limpiar node_modules
rm -rf node_modules package-lock.json

# 3. Reinstalar
npm install

# 4. Reiniciar base de datos
./scripts/setup-db.sh

# 5. Iniciar desarrollo
npm run dev
```

### Puerto Ocupado
```bash
# Encontrar proceso usando puerto 5000
lsof -i :5000

# Matar proceso
kill -9 <PID>

# O cambiar puerto en .env
echo "PORT=5001" >> .env
```

### Base de Datos no Conecta
```bash
# Verificar que el contenedor está corriendo
docker ps | grep postgres

# Ver logs de errores
docker-compose logs postgres

# Reiniciar contenedor
docker-compose restart postgres

# Verificar conexión manualmente
docker exec -it xtaskflow-postgres psql -U xtaskflow_user -d xtaskflow_db -c "SELECT 1"
```

---

## 📝 Git

### Commits Frecuentes
```bash
# Ver cambios
git status

# Agregar cambios
git add .

# Commit con mensaje descriptivo
git commit -m "feat: migrar módulo de empleados a arquitectura hexagonal"

# Push
git push origin main
```

### Branches para Migración
```bash
# Crear branch para migración
git checkout -b feature/migrate-empleados

# Trabajar en la migración
# ...

# Commit y push
git add .
git commit -m "feat: estructura hexagonal para empleados"
git push origin feature/migrate-empleados

# Merge a main (después de review)
git checkout main
git merge feature/migrate-empleados
```

---

## 📚 Documentación

### Ver Documentación
```bash
# Abrir documentación principal
cat ARQUITECTURA_ORGANIZADA.md

# Ver guía de migración
cat docs/GUIA_MIGRACION.md

# Ver arquitectura backend
cat docs/ARQUITECTURA_BACKEND.md

# Ver arquitectura frontend
cat docs/ARQUITECTURA_FRONTEND.md

# Ver todos los docs
ls -la docs/
```

---

## 🎯 Flujo de Trabajo Típico

### Día a Día
```bash
# 1. Iniciar base de datos (si no está corriendo)
docker-compose up -d postgres

# 2. Iniciar desarrollo
npm run dev

# 3. Trabajar en código
# ...

# 4. Probar cambios
curl http://localhost:5000/api/empleados

# 5. Commit
git add .
git commit -m "feat: implementar caso de uso crear empleado"

# 6. Al terminar el día
docker-compose stop
```

### Migrar un Módulo Completo
```bash
# 1. Generar estructura
./scripts/migrate-module.sh empleados

# 2. Implementar backend
# - Editar server/domain/entities/empleados.entity.ts
# - Editar server/application/use-cases/empleados/...
# - Editar server/infrastructure/database/repositories/...
# - Editar server/interfaces/http/controllers/...

# 3. Implementar frontend
# - Editar client/src/domain/models/empleados.model.ts
# - Editar client/src/application/services/empleados.service.ts
# - Editar client/src/application/hooks/empleados/...
# - Editar client/src/presentation/pages/empleados/...

# 4. Probar
npm run dev
curl http://localhost:5000/api/empleados

# 5. Commit
git add .
git commit -m "feat: migrar módulo de empleados completo"
```

---

## 🎓 Comandos de Aprendizaje

### Explorar Estructura
```bash
# Ver estructura de carpetas backend
tree server/ -L 3

# Ver estructura de carpetas frontend
tree client/src/ -L 3

# Contar líneas de código
find server/ -name "*.ts" | xargs wc -l

# Buscar patrones
grep -r "export class" server/domain/entities/
```

### Ejemplos de Uso
```bash
# Ver ejemplo de entidad
cat server/domain/entities/empleados.entity.ts

# Ver ejemplo de caso de uso
cat server/application/use-cases/empleados/create-empleados.use-case.ts

# Ver ejemplo de controlador
cat server/interfaces/http/controllers/empleados.controller.ts

# Ver ejemplo de hook
cat client/src/application/hooks/empleados/useEmpleados.ts
```

---

## 💡 Tips y Trucos

### Aliases Útiles (agregar a ~/.zshrc o ~/.bashrc)
```bash
# Agregar al final de ~/.zshrc
alias xtask-db="docker-compose up -d postgres"
alias xtask-dev="npm run dev"
alias xtask-logs="docker-compose logs -f postgres"
alias xtask-studio="npm run db:studio"
alias xtask-migrate="./scripts/migrate-module.sh"
alias xtask-reset="docker-compose down -v && ./scripts/setup-db.sh"

# Recargar configuración
source ~/.zshrc
```

### Uso de Aliases
```bash
# Iniciar base de datos
xtask-db

# Iniciar desarrollo
xtask-dev

# Ver logs
xtask-logs

# Abrir Drizzle Studio
xtask-studio

# Generar módulo
xtask-migrate empleados

# Reset completo
xtask-reset
```

---

**Última actualización:** 13 de Octubre, 2025
**Versión:** 1.0.0
