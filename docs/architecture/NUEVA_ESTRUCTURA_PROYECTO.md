# 🏗️ Nueva Estructura del Proyecto XtaskFlow

## 📋 Visión General

Este proyecto está organizado con **separación clara entre Frontend y Backend**, cada uno con su propia arquitectura:

- **Frontend**: Arquitectura por Capas (Layered Architecture)
- **Backend**: Arquitectura Hexagonal (Ports & Adapters)

---

## 📁 Estructura Raíz del Proyecto

```
XtaskFlow/
├── 📱 frontend/                 # Aplicación Frontend (React + Vite)
│   ├── src/
│   │   ├── presentation/       # Capa de Presentación (UI)
│   │   ├── application/        # Capa de Aplicación (Lógica de App)
│   │   ├── domain/             # Capa de Dominio (Modelos y Reglas)
│   │   └── infrastructure/     # Capa de Infraestructura (APIs, Storage)
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
│
├── 🔧 backend/                  # Aplicación Backend (Express + Node)
│   ├── src/
│   │   ├── domain/             # Núcleo del Negocio
│   │   ├── application/        # Casos de Uso
│   │   ├── infrastructure/     # Adaptadores Externos
│   │   └── interfaces/         # Puntos de Entrada (HTTP, CLI)
│   ├── package.json
│   └── tsconfig.json
│
├── 📦 shared/                   # Código Compartido
│   ├── types/                  # Tipos TypeScript compartidos
│   ├── schemas/                # Schemas de DB (Drizzle)
│   └── utils/                  # Utilidades comunes
│
├── 🐳 infrastructure/           # Infraestructura del Proyecto
│   ├── docker/                 # Dockerfiles
│   ├── k8s/                    # Kubernetes manifests
│   └── scripts/                # Scripts de utilidad
│
├── 📚 docs/                     # Documentación
│   ├── architecture/           # Documentación de arquitectura
│   ├── api/                    # Documentación de API
│   └── guides/                 # Guías de uso
│
├── 🧪 tests/                    # Tests E2E y de integración
│   ├── e2e/
│   └── integration/
│
├── docker-compose.yml          # Configuración de Docker Compose
├── package.json                # Package.json raíz (scripts globales)
└── README.md                   # Documentación principal
```

---

## 🎨 Frontend - Arquitectura por Capas

### Estructura Detallada

```
frontend/
├── src/
│   ├── 🎭 presentation/                    # CAPA DE PRESENTACIÓN
│   │   ├── components/                     # Componentes React
│   │   │   ├── common/                     # Componentes reutilizables
│   │   │   │   ├── Button/
│   │   │   │   ├── Input/
│   │   │   │   ├── Modal/
│   │   │   │   └── Table/
│   │   │   ├── layout/                     # Componentes de layout
│   │   │   │   ├── Header/
│   │   │   │   ├── Sidebar/
│   │   │   │   └── Footer/
│   │   │   └── features/                   # Componentes por feature
│   │   │       ├── empleados/
│   │   │       ├── proyectos/
│   │   │       ├── nomina/
│   │   │       └── dashboard/
│   │   │
│   │   ├── pages/                          # Páginas/Vistas
│   │   │   ├── EmpleadosPage/
│   │   │   ├── ProyectosPage/
│   │   │   ├── NominaPage/
│   │   │   └── DashboardPage/
│   │   │
│   │   ├── routes/                         # Configuración de rutas
│   │   │   └── AppRoutes.tsx
│   │   │
│   │   └── styles/                         # Estilos globales
│   │       ├── globals.css
│   │       └── themes/
│   │
│   ├── 🧠 application/                     # CAPA DE APLICACIÓN
│   │   ├── hooks/                          # Custom Hooks
│   │   │   ├── empleados/
│   │   │   │   ├── useEmpleados.ts
│   │   │   │   ├── useCreateEmpleado.ts
│   │   │   │   └── useUpdateEmpleado.ts
│   │   │   ├── proyectos/
│   │   │   └── common/
│   │   │
│   │   ├── services/                       # Servicios de aplicación
│   │   │   ├── empleados.service.ts
│   │   │   ├── proyectos.service.ts
│   │   │   └── auth.service.ts
│   │   │
│   │   ├── store/                          # Estado global (Zustand/Redux)
│   │   │   ├── empleados.store.ts
│   │   │   ├── auth.store.ts
│   │   │   └── ui.store.ts
│   │   │
│   │   └── validators/                     # Validadores (Zod)
│   │       ├── empleado.validator.ts
│   │       └── proyecto.validator.ts
│   │
│   ├── 💎 domain/                          # CAPA DE DOMINIO
│   │   ├── models/                         # Modelos de dominio
│   │   │   ├── Empleado.model.ts
│   │   │   ├── Proyecto.model.ts
│   │   │   └── Nomina.model.ts
│   │   │
│   │   ├── types/                          # Tipos e interfaces
│   │   │   ├── empleado.types.ts
│   │   │   ├── proyecto.types.ts
│   │   │   └── common.types.ts
│   │   │
│   │   └── constants/                      # Constantes de dominio
│   │       ├── empleado.constants.ts
│   │       └── routes.constants.ts
│   │
│   ├── 🔌 infrastructure/                  # CAPA DE INFRAESTRUCTURA
│   │   ├── http/                           # Cliente HTTP
│   │   │   ├── client.ts                   # Axios/Fetch configurado
│   │   │   ├── interceptors/
│   │   │   └── endpoints/                  # Endpoints de API
│   │   │       ├── empleados.endpoints.ts
│   │   │       ├── proyectos.endpoints.ts
│   │   │       └── auth.endpoints.ts
│   │   │
│   │   ├── storage/                        # Almacenamiento local
│   │   │   ├── localStorage.ts
│   │   │   └── sessionStorage.ts
│   │   │
│   │   └── config/                         # Configuración
│   │       ├── env.ts
│   │       └── api.config.ts
│   │
│   ├── App.tsx                             # Componente raíz
│   ├── main.tsx                            # Punto de entrada
│   └── vite-env.d.ts
│
├── public/                                 # Archivos estáticos
│   ├── favicon.ico
│   └── assets/
│
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.ts
```

### Flujo de Datos en el Frontend

```
Usuario Interactúa
        ↓
[PRESENTATION] Componente React
        ↓
[APPLICATION] Custom Hook / Service
        ↓
[INFRASTRUCTURE] HTTP Client / API Endpoint
        ↓
Backend API
        ↓
[INFRASTRUCTURE] Respuesta procesada
        ↓
[DOMAIN] Modelo de dominio
        ↓
[APPLICATION] Estado actualizado
        ↓
[PRESENTATION] UI actualizada
```

---

## ⚙️ Backend - Arquitectura Hexagonal

### Estructura Detallada

```
backend/
├── src/
│   ├── 💎 domain/                          # NÚCLEO DEL NEGOCIO
│   │   ├── entities/                       # Entidades de dominio
│   │   │   ├── Empleado.entity.ts
│   │   │   ├── Proyecto.entity.ts
│   │   │   └── Nomina.entity.ts
│   │   │
│   │   ├── value-objects/                  # Value Objects
│   │   │   ├── Email.vo.ts
│   │   │   ├── Money.vo.ts
│   │   │   └── DateRange.vo.ts
│   │   │
│   │   ├── repositories/                   # Interfaces de repositorios
│   │   │   ├── IEmpleadoRepository.ts
│   │   │   ├── IProyectoRepository.ts
│   │   │   └── INominaRepository.ts
│   │   │
│   │   ├── services/                       # Servicios de dominio
│   │   │   ├── SalarioCalculator.service.ts
│   │   │   └── ContratoValidator.service.ts
│   │   │
│   │   └── events/                         # Eventos de dominio
│   │       ├── EmpleadoCreated.event.ts
│   │       └── NominaProcesada.event.ts
│   │
│   ├── 🧠 application/                     # CASOS DE USO
│   │   ├── use-cases/                      # Casos de uso
│   │   │   ├── empleados/
│   │   │   │   ├── CreateEmpleado.usecase.ts
│   │   │   │   ├── GetEmpleados.usecase.ts
│   │   │   │   ├── UpdateEmpleado.usecase.ts
│   │   │   │   └── DeleteEmpleado.usecase.ts
│   │   │   ├── proyectos/
│   │   │   │   ├── CreateProyecto.usecase.ts
│   │   │   │   └── AssignEmpleado.usecase.ts
│   │   │   └── nomina/
│   │   │       ├── ProcesarNomina.usecase.ts
│   │   │       └── GenerarReporte.usecase.ts
│   │   │
│   │   ├── dto/                            # Data Transfer Objects
│   │   │   ├── empleado.dto.ts
│   │   │   ├── proyecto.dto.ts
│   │   │   └── nomina.dto.ts
│   │   │
│   │   └── ports/                          # Puertos (interfaces)
│   │       ├── IEmailService.ts
│   │       ├── IFileStorage.ts
│   │       └── INotificationService.ts
│   │
│   ├── 🔌 infrastructure/                  # ADAPTADORES
│   │   ├── database/                       # Persistencia
│   │   │   ├── drizzle/
│   │   │   │   ├── schema/
│   │   │   │   └── migrations/
│   │   │   ├── repositories/               # Implementaciones
│   │   │   │   ├── EmpleadoRepository.impl.ts
│   │   │   │   ├── ProyectoRepository.impl.ts
│   │   │   │   └── NominaRepository.impl.ts
│   │   │   └── connection.ts
│   │   │
│   │   ├── external-services/              # Servicios externos
│   │   │   ├── email/
│   │   │   │   └── SendGridEmail.service.ts
│   │   │   ├── storage/
│   │   │   │   └── LocalFileStorage.service.ts
│   │   │   └── notifications/
│   │   │       └── PushNotification.service.ts
│   │   │
│   │   └── config/                         # Configuración
│   │       ├── database.config.ts
│   │       ├── env.config.ts
│   │       └── logger.config.ts
│   │
│   ├── 🌐 interfaces/                      # PUNTOS DE ENTRADA
│   │   ├── http/                           # API REST
│   │   │   ├── controllers/
│   │   │   │   ├── EmpleadoController.ts
│   │   │   │   ├── ProyectoController.ts
│   │   │   │   └── NominaController.ts
│   │   │   ├── routes/
│   │   │   │   ├── empleado.routes.ts
│   │   │   │   ├── proyecto.routes.ts
│   │   │   │   └── index.routes.ts
│   │   │   ├── middleware/
│   │   │   │   ├── auth.middleware.ts
│   │   │   │   ├── error.middleware.ts
│   │   │   │   └── validation.middleware.ts
│   │   │   └── server.ts
│   │   │
│   │   ├── cli/                            # Interfaz de línea de comandos
│   │   │   └── commands/
│   │   │
│   │   └── events/                         # Event listeners
│   │       └── handlers/
│   │
│   ├── shared/                             # Código compartido del backend
│   │   ├── utils/
│   │   ├── constants/
│   │   └── types/
│   │
│   └── index.ts                            # Punto de entrada principal
│
├── tests/                                  # Tests del backend
│   ├── unit/
│   ├── integration/
│   └── fixtures/
│
├── package.json
├── tsconfig.json
└── drizzle.config.ts
```

### Flujo de Datos en el Backend

```
HTTP Request
        ↓
[INTERFACES] Controller
        ↓
[APPLICATION] Use Case
        ↓
[DOMAIN] Entity + Business Logic
        ↓
[DOMAIN] Repository Interface
        ↓
[INFRASTRUCTURE] Repository Implementation
        ↓
Database
        ↓
[INFRASTRUCTURE] Data mapped to Entity
        ↓
[DOMAIN] Entity
        ↓
[APPLICATION] DTO
        ↓
[INTERFACES] HTTP Response
```

---

## 📦 Shared - Código Compartido

```
shared/
├── types/                      # Tipos compartidos
│   ├── api.types.ts
│   ├── database.types.ts
│   └── common.types.ts
│
├── schemas/                    # Schemas de Drizzle
│   ├── empleados.schema.ts
│   ├── proyectos.schema.ts
│   └── index.ts
│
├── utils/                      # Utilidades compartidas
│   ├── date.utils.ts
│   ├── format.utils.ts
│   └── validation.utils.ts
│
└── constants/                  # Constantes compartidas
    ├── errors.constants.ts
    └── status.constants.ts
```

---

## 🐳 Infrastructure - Infraestructura del Proyecto

```
infrastructure/
├── docker/
│   ├── Dockerfile.frontend
│   ├── Dockerfile.backend
│   └── Dockerfile.nginx
│
├── k8s/
│   ├── deployment.yml
│   ├── service.yml
│   └── ingress.yml
│
└── scripts/
    ├── setup-db.sh
    ├── migrate-module.sh
    ├── deploy.sh
    └── backup.sh
```

---

## 📚 Docs - Documentación

```
docs/
├── architecture/
│   ├── frontend-architecture.md
│   ├── backend-architecture.md
│   └── database-design.md
│
├── api/
│   ├── empleados-api.md
│   ├── proyectos-api.md
│   └── swagger.yml
│
└── guides/
    ├── getting-started.md
    ├── development.md
    └── deployment.md
```

---

## 🎯 Principios de Diseño

### Frontend (Arquitectura por Capas)

1. **Presentation**: Solo UI, no lógica de negocio
2. **Application**: Orquestación, hooks, servicios
3. **Domain**: Modelos, tipos, constantes
4. **Infrastructure**: APIs, storage, configuración

**Regla**: Las capas superiores pueden usar las inferiores, pero no al revés.

### Backend (Arquitectura Hexagonal)

1. **Domain**: Núcleo puro, sin dependencias externas
2. **Application**: Casos de uso, orquestación
3. **Infrastructure**: Implementaciones concretas
4. **Interfaces**: Puntos de entrada (HTTP, CLI, etc.)

**Regla**: El dominio no conoce la infraestructura. Todo depende del dominio.

---

## 🔄 Migración desde Estructura Actual

### Paso 1: Crear nueva estructura
```bash
./infrastructure/scripts/create-structure.sh
```

### Paso 2: Mover archivos gradualmente
- Migrar módulo por módulo
- Empezar con empleados (ya migrado)
- Continuar con proyectos, nómina, etc.

### Paso 3: Actualizar imports
- Usar path aliases en tsconfig.json
- Actualizar referencias

### Paso 4: Verificar funcionamiento
- Tests unitarios
- Tests de integración
- Tests E2E

---

## 📊 Beneficios de esta Estructura

✅ **Separación clara** entre frontend y backend
✅ **Escalabilidad** - Fácil agregar nuevos módulos
✅ **Mantenibilidad** - Código organizado y predecible
✅ **Testabilidad** - Fácil crear tests para cada capa
✅ **Independencia** - Frontend y backend pueden desplegarse separadamente
✅ **Reutilización** - Código compartido en `/shared`
✅ **Documentación** - Estructura autodocumentada

---

## 🚀 Comandos Principales

```bash
# Desarrollo
npm run dev                    # Iniciar todo (frontend + backend)
npm run dev:frontend          # Solo frontend
npm run dev:backend           # Solo backend

# Build
npm run build                 # Build todo
npm run build:frontend        # Build frontend
npm run build:backend         # Build backend

# Tests
npm run test                  # Todos los tests
npm run test:frontend         # Tests frontend
npm run test:backend          # Tests backend
npm run test:e2e              # Tests E2E

# Database
npm run db:push               # Push schema a DB
npm run db:studio             # Abrir Drizzle Studio
npm run db:migrate            # Ejecutar migraciones

# Docker
docker-compose up             # Iniciar servicios
docker-compose down           # Detener servicios
```

---

**Última actualización**: 13 de Octubre, 2025
