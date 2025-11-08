# 🗂️ Guía Rápida de Estructura del Proyecto

**Última actualización**: 13 de Octubre, 2025

## 📍 Ubicación de Archivos Clave

### 🎨 Frontend
```
client/
├── src/              # Todo el código fuente del frontend
├── index.html        # Punto de entrada HTML
```

### ⚙️ Backend
```
server/               # Backend ACTIVO
├── modules/          # Módulos de negocio (empleados, proyectos, etc.)
├── routes/           # Definición de rutas API
├── middleware/       # Middlewares personalizados
├── auth.ts           # Sistema de autenticación
├── db.ts             # Conexión a base de datos
└── index.ts          # Punto de entrada del servidor
```

### 📦 Código Compartido
```
shared/
├── schema.ts         # Schemas de Drizzle ORM
├── types/            # Tipos TypeScript compartidos
└── utils/            # Utilidades comunes
```

### 🐳 Infraestructura
```
infrastructure/
├── docker/           # Todo lo relacionado con Docker
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── .dockerignore
├── k8s/              # Manifiestos de Kubernetes
└── scripts/          # Scripts de utilidad
    ├── setup-db.sh
    ├── setup-local.sh
    └── migrate-module.sh
```

### 📚 Documentación
```
docs/
├── architecture/     # Documentación de arquitectura
├── api/              # Documentación de API
├── guides/           # Guías de uso
└── *.md              # Documentos generales
```

---

## 🚀 Comandos Más Usados

### Desarrollo
```bash
npm run dev              # Iniciar desarrollo (frontend + backend)
npm run check            # Verificar tipos TypeScript
```

### Base de Datos
```bash
npm run db:push          # Aplicar cambios al schema
npm run db:studio        # Abrir Drizzle Studio
npm run db:generate      # Generar migraciones
```

### Docker
```bash
cd infrastructure/docker
docker-compose up -d     # Iniciar servicios
docker-compose down      # Detener servicios
```

### Scripts de Infraestructura
```bash
./infrastructure/scripts/setup-db.sh       # Configurar BD
./infrastructure/scripts/setup-local.sh    # Setup local
```

---

## 📂 ¿Dónde Encuentro...?

| Necesito... | Lo encuentro en... |
|-------------|-------------------|
| Componentes React | `client/src/components/` |
| Módulos de negocio | `server/modules/` |
| Rutas de API | `server/routes/` |
| Schemas de BD | `shared/schema.ts` |
| Configuración Docker | `infrastructure/docker/` |
| Documentación | `docs/` |
| Tests E2E | `tests/e2e/` |
| Archivos subidos | `uploads/` |
| Variables de entorno | `.env` (crear desde `.env.example`) |

---

## 🔧 Archivos de Configuración

| Archivo | Propósito |
|---------|-----------|
| `package.json` | Dependencias y scripts del proyecto |
| `tsconfig.json` | Configuración de TypeScript |
| `vite.config.ts` | Configuración de Vite (build tool) |
| `tailwind.config.ts` | Configuración de Tailwind CSS |
| `drizzle.config.ts` | Configuración de Drizzle ORM |
| `components.json` | Configuración de shadcn/ui |
| `.env` | Variables de entorno (NO en git) |
| `.env.example` | Plantilla de variables de entorno |

---

## 📖 Documentación Importante

### Para Empezar
1. **`README.md`** - Documentación principal del proyecto
2. **`docs/guides/INICIO_RAPIDO.md`** - Guía de inicio rápido
3. **`docs/SETUP_LOCAL.md`** - Configuración local detallada

### Arquitectura
1. **`docs/ARQUITECTURA.md`** - Arquitectura general
2. **`docs/ARQUITECTURA_BACKEND.md`** - Arquitectura del backend
3. **`docs/ARQUITECTURA_FRONTEND.md`** - Arquitectura del frontend
4. **`docs/architecture/NUEVA_ESTRUCTURA_PROYECTO.md`** - Estructura propuesta

### Desarrollo
1. **`docs/guides/COMANDOS_RAPIDOS.md`** - Comandos útiles
2. **`docs/api/api-references.md`** - Referencias de API
3. **`docs/diccionario_de_datos.md`** - Diccionario de datos

### Organización
1. **`docs/ESTRUCTURA_ORGANIZADA.md`** - Detalles de la organización actual

---

## ⚠️ Notas Importantes

### Backend Duplicado
Existen dos carpetas de backend:
- **`server/`** → Backend ACTIVO (usar este)
- **`backend/`** → En migración (arquitectura hexagonal parcial)

### Frontend
El frontend está en **`client/`**, no en `frontend/`.

### Infraestructura
Todos los archivos Docker, K8s y scripts están ahora en **`infrastructure/`**.

---

## 🎯 Flujo de Trabajo Típico

### 1. Iniciar el Proyecto
```bash
npm install                    # Instalar dependencias
cp .env.example .env          # Configurar variables de entorno
npm run db:push               # Configurar base de datos
npm run dev                   # Iniciar desarrollo
```

### 2. Desarrollar una Nueva Feature
```bash
# 1. Crear componente en client/src/components/
# 2. Crear módulo en server/modules/
# 3. Definir rutas en server/routes/
# 4. Actualizar schema en shared/schema.ts si es necesario
# 5. Ejecutar npm run db:push si cambió el schema
```

### 3. Desplegar
```bash
npm run build                          # Build del proyecto
cd infrastructure/docker
docker-compose up -d                   # Desplegar con Docker
```

---

## 🔍 Búsqueda Rápida

### Por Módulo de Negocio
```
Empleados:
- Frontend: client/src/modules/empleados/
- Backend: server/modules/empleados/
- Rutas: server/routes/empleados.ts

Proyectos:
- Frontend: client/src/modules/proyectos/
- Backend: server/modules/proyectos/
- Rutas: server/routes/proyectos.ts

Nómina:
- Frontend: client/src/modules/nomina/
- Backend: server/modules/nomina/
- Rutas: server/routes/nomina.ts
```

### Por Tipo de Archivo
```
Componentes UI:    client/src/components/
Hooks:             client/src/lib/hooks/
Stores:            client/src/lib/stores/
API Clients:       client/src/lib/api/
Controladores:     server/modules/*/controller.ts
Servicios:         server/modules/*/service.ts
Schemas:           shared/schema.ts
Tipos:             shared/types/
```

---

## 📞 Ayuda

Si no encuentras algo, consulta:
1. **`docs/ESTRUCTURA_ORGANIZADA.md`** - Documentación completa de la estructura
2. **`README.md`** - Documentación principal
3. **`docs/guides/`** - Guías específicas

---

**Tip**: Usa la búsqueda de tu IDE (Cmd/Ctrl + P) para encontrar archivos rápidamente.
