# 📁 Estructura Organizada del Proyecto XtaskFlow

**Fecha de Organización**: 13 de Octubre, 2025

## 🎯 Resumen de Cambios Realizados

Se ha reorganizado el proyecto para mejorar la mantenibilidad y seguir las mejores prácticas de arquitectura de software.

---

## 📂 Estructura Actual del Proyecto

```
XtaskFlow/
├── 📱 client/                      # Frontend (React + Vite)
│   ├── src/                        # Código fuente del frontend
│   └── index.html
│
├── 🔧 server/                      # Backend ACTIVO (Express + Node)
│   ├── application/                # Lógica de aplicación
│   ├── domain/                     # Modelos de dominio
│   ├── infrastructure/             # Adaptadores externos
│   ├── interfaces/                 # Controladores HTTP
│   ├── middleware/                 # Middleware de Express
│   ├── modules/                    # Módulos del sistema
│   ├── routes/                     # Definición de rutas
│   ├── scripts/                    # Scripts del servidor
│   ├── auth.ts                     # Autenticación
│   ├── db.ts                       # Conexión a base de datos
│   ├── index.ts                    # Punto de entrada
│   ├── routes.ts                   # Configuración de rutas
│   ├── storage.ts                  # Gestión de almacenamiento
│   └── vite.ts                     # Configuración de Vite
│
├── 📦 shared/                      # Código compartido
│   ├── constants/                  # Constantes compartidas
│   ├── schema/                     # Schemas de Drizzle
│   ├── schemas/                    # Schemas adicionales
│   ├── types/                      # Tipos TypeScript
│   ├── utils/                      # Utilidades comunes
│   └── schema.ts                   # Schema principal
│
├── 🐳 infrastructure/              # Infraestructura del proyecto
│   ├── docker/                     # Configuración Docker
│   │   ├── Dockerfile
│   │   ├── .dockerignore
│   │   ├── docker-compose.yml
│   │   └── docker-compose.k8s.yml
│   ├── k8s/                        # Manifiestos de Kubernetes
│   └── scripts/                    # Scripts de utilidad
│       ├── migrate-module.sh
│       ├── setup-db.sh
│       └── setup-local.sh
│
├── 📚 docs/                        # Documentación
│   ├── architecture/               # Documentación de arquitectura
│   │   ├── ARQUITECTURA_ORGANIZADA.md
│   │   └── NUEVA_ESTRUCTURA_PROYECTO.md
│   ├── api/                        # Documentación de API
│   │   ├── api-references.json
│   │   └── api-references.md
│   ├── guides/                     # Guías de uso
│   │   ├── COMANDOS_RAPIDOS.md
│   │   ├── INICIO_RAPIDO.md
│   │   └── INSTRUCCIONES_PARA_TI.md
│   ├── ARQUITECTURA.md
│   ├── ARQUITECTURA_BACKEND.md
│   ├── ARQUITECTURA_FRONTEND.md
│   ├── AZURE_DATA_STUDIO_SETUP.md
│   ├── CAMBIOS_REALIZADOS.md
│   ├── diccionario_de_datos.md
│   ├── GUIA_MIGRACION.md
│   ├── LEEME_PRIMERO.md
│   ├── MIGRACION_EMPLEADOS_COMPLETADA.md
│   ├── MIGRACION_REPLIT.md
│   ├── replit.md
│   ├── RESUMEN_CAMBIOS.md
│   ├── RESUMEN_EJECUTIVO.md
│   └── SETUP_LOCAL.md
│
├── 🧪 tests/                       # Tests del proyecto
│   ├── e2e/                        # Tests end-to-end
│   └── integration/                # Tests de integración
│
├── 📁 backend/                     # Backend EN MIGRACIÓN (Arquitectura Hexagonal)
│   ├── src/                        # Código fuente (parcialmente implementado)
│   └── tests/                      # Tests del backend
│
├── 📤 uploads/                     # Archivos subidos
│   ├── contratos/
│   ├── facturas/
│   └── static/
│
├── 📎 attached_assets/             # Assets adjuntos
│
├── 📄 Archivos de Configuración
│   ├── .env                        # Variables de entorno (NO en git)
│   ├── .env.example                # Ejemplo de variables de entorno
│   ├── .gitignore                  # Archivos ignorados por git
│   ├── .replit                     # Configuración de Replit
│   ├── components.json             # Configuración de componentes
│   ├── drizzle.config.ts           # Configuración de Drizzle ORM
│   ├── package.json                # Dependencias del proyecto
│   ├── package-lock.json           # Lock de dependencias
│   ├── postcss.config.js           # Configuración de PostCSS
│   ├── tailwind.config.ts          # Configuración de Tailwind CSS
│   ├── tsconfig.json               # Configuración de TypeScript
│   ├── vite.config.ts              # Configuración de Vite
│   ├── generated-icon.png          # Icono generado
│   └── README.md                   # Documentación principal
│
└── 📦 node_modules/                # Dependencias (NO en git)
```

---

## 🔄 Cambios Realizados

### ✅ Documentación Consolidada

**Antes**: Archivos `.md` dispersos en la raíz del proyecto

**Después**: Toda la documentación organizada en `/docs`

- **`/docs/architecture/`**: Documentación de arquitectura del sistema
- **`/docs/api/`**: Referencias y documentación de API
- **`/docs/guides/`**: Guías de uso y desarrollo

**Archivos movidos**:
- `ARQUITECTURA_ORGANIZADA.md` → `docs/architecture/`
- `NUEVA_ESTRUCTURA_PROYECTO.md` → `docs/architecture/`
- `COMANDOS_RAPIDOS.md` → `docs/guides/`
- `INICIO_RAPIDO.md` → `docs/guides/`
- `INSTRUCCIONES_PARA_TI.md` → `docs/guides/`
- `CAMBIOS_REALIZADOS.md` → `docs/`
- `LEEME_PRIMERO.md` → `docs/`
- `MIGRACION_EMPLEADOS_COMPLETADA.md` → `docs/`
- `RESUMEN_CAMBIOS.md` → `docs/`
- `RESUMEN_EJECUTIVO.md` → `docs/`
- `replit.md` → `docs/`

### ✅ Infraestructura Organizada

**Antes**: Archivos Docker, K8s y scripts dispersos

**Después**: Todo centralizado en `/infrastructure`

**Estructura**:
```
infrastructure/
├── docker/
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── docker-compose.yml
│   └── docker-compose.k8s.yml
├── k8s/
│   └── [manifiestos de Kubernetes]
└── scripts/
    ├── migrate-module.sh
    ├── setup-db.sh
    └── setup-local.sh
```

### ✅ Archivos Temporales Eliminados

Se eliminaron archivos temporales y de sistema:
- `cookies.txt`
- `response.json`
- `.DS_Store`

### ✅ Carpetas Vacías Eliminadas

Se eliminaron carpetas vacías que no aportaban valor:
- `frontend/` (vacía, el frontend real está en `client/`)
- `.config/` (configuraciones temporales)
- `.local/` (archivos locales temporales)

---

## ⚠️ Notas Importantes

### Backend Duplicado

Actualmente existen **dos carpetas de backend**:

1. **`/server/`** - **BACKEND ACTIVO** ✅
   - Es el código que se ejecuta actualmente
   - Contiene toda la lógica de negocio funcional
   - Referenciado en `package.json` (scripts `dev`, `build`, `start`)

2. **`/backend/`** - **EN MIGRACIÓN** 🚧
   - Implementación parcial de arquitectura hexagonal
   - Contiene solo el módulo de empleados migrado
   - **NO está siendo utilizado actualmente**

**Recomendación**: Completar la migración de todos los módulos de `/server/` a `/backend/` siguiendo la arquitectura hexagonal, o eliminar `/backend/` si no se va a continuar con la migración.

### Frontend

El frontend está en la carpeta **`/client/`**, no en `frontend/`.

---

## 📊 Beneficios de la Organización

✅ **Documentación centralizada**: Fácil de encontrar y mantener
✅ **Infraestructura separada**: Clara separación de concerns
✅ **Menos clutter**: Raíz del proyecto más limpia
✅ **Mejor navegabilidad**: Estructura predecible y estándar
✅ **Preparado para CI/CD**: Infraestructura lista para automatización

---

## 🚀 Próximos Pasos Recomendados

### 1. Decidir sobre la Arquitectura del Backend

**Opción A**: Completar la migración a arquitectura hexagonal
- Migrar todos los módulos de `/server/` a `/backend/`
- Actualizar `package.json` para usar `/backend/`
- Eliminar `/server/` una vez completada la migración

**Opción B**: Mantener la estructura actual
- Eliminar `/backend/` si no se va a usar
- Continuar desarrollando en `/server/`
- Documentar la arquitectura actual

### 2. Organizar el Frontend

Considerar reorganizar `/client/` siguiendo la arquitectura por capas documentada en `docs/architecture/NUEVA_ESTRUCTURA_PROYECTO.md`:

```
client/
├── src/
│   ├── presentation/    # Componentes UI
│   ├── application/     # Hooks, servicios, store
│   ├── domain/          # Modelos, tipos, constantes
│   └── infrastructure/  # HTTP, storage, config
```

### 3. Mejorar la Gestión de Tests

- Mover tests específicos del backend a `/server/tests/` o `/backend/tests/`
- Mantener en `/tests/` solo tests E2E y de integración
- Agregar tests unitarios para cada módulo

### 4. Configuración de Path Aliases

Actualizar `tsconfig.json` con path aliases para facilitar imports:

```json
{
  "compilerOptions": {
    "paths": {
      "@client/*": ["./client/src/*"],
      "@server/*": ["./server/*"],
      "@shared/*": ["./shared/*"],
      "@infrastructure/*": ["./infrastructure/*"]
    }
  }
}
```

---

## 📝 Comandos Actualizados

### Desarrollo
```bash
npm run dev              # Iniciar todo (frontend + backend)
```

### Build
```bash
npm run build            # Build todo
```

### Database
```bash
npm run db:push          # Push schema a DB
npm run db:studio        # Abrir Drizzle Studio
npm run db:generate      # Generar migraciones
```

### Docker
```bash
# Desde la carpeta infrastructure/docker/
docker-compose up        # Iniciar servicios
docker-compose down      # Detener servicios
```

### Scripts de Infraestructura
```bash
# Desde la raíz del proyecto
./infrastructure/scripts/setup-db.sh          # Configurar base de datos
./infrastructure/scripts/setup-local.sh       # Configuración local
./infrastructure/scripts/migrate-module.sh    # Migrar módulo
```

---

## 📖 Documentación Relacionada

- **Arquitectura General**: `docs/ARQUITECTURA.md`
- **Arquitectura Backend**: `docs/ARQUITECTURA_BACKEND.md`
- **Arquitectura Frontend**: `docs/ARQUITECTURA_FRONTEND.md`
- **Nueva Estructura Propuesta**: `docs/architecture/NUEVA_ESTRUCTURA_PROYECTO.md`
- **Guía de Inicio Rápido**: `docs/guides/INICIO_RAPIDO.md`
- **Comandos Rápidos**: `docs/guides/COMANDOS_RAPIDOS.md`
- **Setup Local**: `docs/SETUP_LOCAL.md`

---

**Última actualización**: 13 de Octubre, 2025
