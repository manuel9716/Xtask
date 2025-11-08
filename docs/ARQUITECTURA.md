# Arquitectura del Proyecto XTask Platform

## 📐 Visión General

XTask es una aplicación full-stack monolítica con arquitectura modular que sigue principios de Domain-Driven Design (DDD) y arquitectura hexagonal en algunos módulos.

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENTE                              │
│  React 18 + TypeScript + Vite + TailwindCSS + shadcn/ui   │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTP/REST
                     │ TanStack Query
┌────────────────────┴────────────────────────────────────────┐
│                    SERVIDOR EXPRESS                         │
│  Node.js + TypeScript + Express.js + Passport.js          │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  Auth    │  │ Proyectos│  │ Recursos │  │ Finanzas │  │
│  │  Module  │  │  Module  │  │  Module  │  │  Module  │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │   KPI    │  │  Nómina  │  │Suppliers │  │Dashboard │  │
│  │  Module  │  │  Module  │  │  Module  │  │  Module  │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
└────────────────────┬────────────────────────────────────────┘
                     │ Drizzle ORM
┌────────────────────┴────────────────────────────────────────┐
│                    POSTGRESQL                               │
│  Base de datos relacional con esquemas normalizados        │
└─────────────────────────────────────────────────────────────┘
```

## 🏗️ Estructura de Directorios

```
XtaskFlow/
├── client/                      # Frontend (React)
│   ├── src/
│   │   ├── components/         # Componentes UI reutilizables
│   │   │   ├── ui/            # shadcn/ui components
│   │   │   ├── layout/        # Layout components
│   │   │   └── shared/        # Componentes compartidos
│   │   ├── modules/           # Módulos de negocio
│   │   │   ├── auth/          # Autenticación
│   │   │   ├── proyectos/     # Gestión de proyectos
│   │   │   ├── recursos/      # Recursos humanos
│   │   │   ├── finanzas/      # Finanzas y presupuestos
│   │   │   ├── nomina/        # Nómina
│   │   │   ├── kpi/           # KPIs y bonificaciones
│   │   │   ├── microlearning/ # Capacitaciones
│   │   │   └── dashboard/     # Dashboard principal
│   │   ├── lib/               # Utilidades y configuración
│   │   │   ├── api.ts         # Cliente API (fetch wrapper)
│   │   │   ├── utils.ts       # Funciones utilitarias
│   │   │   └── queryClient.ts # Configuración TanStack Query
│   │   ├── hooks/             # Custom React hooks
│   │   ├── types/             # TypeScript types
│   │   ├── App.tsx            # Componente raíz
│   │   └── main.tsx           # Entry point
│   └── index.html             # HTML template
│
├── server/                      # Backend (Express)
│   ├── modules/                # Módulos de negocio (hexagonal)
│   │   ├── nomina/            # Módulo de nómina
│   │   │   ├── domain/        # Entidades y lógica de dominio
│   │   │   ├── application/   # Casos de uso
│   │   │   ├── infrastructure/# Repositorios y servicios externos
│   │   │   └── nomina.controller.ts
│   │   └── [otros módulos]/
│   ├── routes/                 # Definición de rutas REST
│   │   ├── auth.routes.ts
│   │   ├── proyectos.routes.ts
│   │   ├── recursos.routes.ts
│   │   ├── nomina.routes.ts
│   │   └── [otras rutas]/
│   ├── middleware/             # Middlewares personalizados
│   │   └── auth.middleware.ts # Verificación de autenticación
│   ├── scripts/                # Scripts de utilidad
│   ├── auth.ts                 # Configuración Passport.js
│   ├── db.ts                   # Configuración base de datos
│   ├── storage.ts              # Capa de acceso a datos
│   ├── vite.ts                 # Integración Vite en desarrollo
│   ├── routes.ts               # Registro de rutas
│   └── index.ts                # Entry point del servidor
│
├── shared/                      # Código compartido cliente/servidor
│   ├── schema.ts               # Esquemas Drizzle ORM
│   └── schema/                 # Esquemas modulares
│       ├── users.ts
│       └── [otros esquemas]/
│
├── k8s/                        # Manifiestos Kubernetes
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── ingress.yaml
│   └── [otros manifiestos]/
│
├── docs/                       # Documentación
│   ├── SETUP_LOCAL.md
│   └── ARQUITECTURA.md
│
├── uploads/                    # Archivos subidos (gitignored)
├── attached_assets/            # Assets adjuntos
├── migrations/                 # Migraciones de BD (generadas)
│
├── package.json
├── tsconfig.json
├── vite.config.ts
├── drizzle.config.ts
├── Dockerfile
├── docker-compose.yml
└── README.md
```

## 🎯 Patrones de Arquitectura

### Frontend: Component-Based Architecture

```typescript
// Estructura típica de un módulo frontend
modules/
  └── recursos/
      ├── components/          # Componentes específicos del módulo
      │   ├── EmpleadoCard.tsx
      │   ├── EmpleadoForm.tsx
      │   └── EmpleadoList.tsx
      ├── hooks/              # Hooks personalizados
      │   ├── useEmpleados.ts
      │   └── useEmpleadoMutations.ts
      ├── types/              # Tipos TypeScript
      │   └── empleado.types.ts
      └── RecursosPage.tsx    # Página principal
```

**Principios**:
- **Composición**: Componentes pequeños y reutilizables
- **Separación de Concerns**: Lógica separada de presentación
- **Custom Hooks**: Encapsulación de lógica de negocio
- **Type Safety**: TypeScript estricto

### Backend: Modular Monolith + Hexagonal (parcial)

```typescript
// Módulo con arquitectura hexagonal (ejemplo: nómina)
modules/
  └── nomina/
      ├── domain/                    # Capa de dominio
      │   ├── entities/             # Entidades de negocio
      │   ├── value-objects/        # Objetos de valor
      │   └── interfaces/           # Interfaces de repositorios
      ├── application/              # Capa de aplicación
      │   ├── use-cases/           # Casos de uso
      │   └── services/            # Servicios de aplicación
      ├── infrastructure/          # Capa de infraestructura
      │   ├── repositories/        # Implementación de repositorios
      │   └── external-services/   # Servicios externos
      └── nomina.controller.ts     # Controlador HTTP

// Módulos tradicionales (mayoría)
routes/
  └── recursos.routes.ts           # Rutas + lógica en un archivo
```

**Principios**:
- **Modularidad**: Cada módulo es independiente
- **Separation of Concerns**: Capas bien definidas
- **Dependency Injection**: Inversión de dependencias (parcial)
- **Single Responsibility**: Cada archivo tiene un propósito claro

## 🔄 Flujo de Datos

### Flujo de Lectura (GET)

```
1. Usuario interactúa con UI
   └─> React Component

2. Component usa hook personalizado
   └─> useQuery (TanStack Query)

3. Query hace fetch a la API
   └─> fetch('/api/empleados')

4. Express recibe request
   └─> Route Handler (empleados.routes.ts)

5. Handler consulta base de datos
   └─> storage.getEmpleados() o db.query()

6. Drizzle ORM ejecuta query
   └─> SELECT * FROM empleados

7. PostgreSQL retorna datos
   └─> Rows

8. Datos fluyen de vuelta
   └─> Route Handler → Express → HTTP Response

9. TanStack Query cachea y actualiza
   └─> Component re-renderiza con datos
```

### Flujo de Escritura (POST/PUT/DELETE)

```
1. Usuario envía formulario
   └─> React Hook Form + Zod validation

2. Validación en cliente
   └─> Si falla: muestra errores
   └─> Si pasa: continúa

3. Mutation se ejecuta
   └─> useMutation (TanStack Query)

4. POST/PUT/DELETE a API
   └─> fetch('/api/empleados', { method: 'POST', body: data })

5. Express recibe y valida
   └─> Middleware de autenticación
   └─> Validación de datos (Zod en algunos casos)

6. Handler procesa request
   └─> Lógica de negocio
   └─> Transacciones si es necesario

7. Drizzle ORM ejecuta operación
   └─> INSERT/UPDATE/DELETE

8. PostgreSQL confirma operación
   └─> Commit transaction

9. Response enviada al cliente
   └─> { success: true, data: {...} }

10. TanStack Query invalida caché
    └─> queryClient.invalidateQueries(['empleados'])
    └─> Re-fetch automático
    └─> UI actualizada
```

## 🗄️ Modelo de Datos

### Esquema Principal (simplificado)

```sql
-- Usuarios y Autenticación
users
  ├─ id (PK)
  ├─ username (unique)
  ├─ password (hashed)
  ├─ email
  ├─ role (admin/manager/user)
  └─ created_at

-- Proyectos
projects
  ├─ id (PK)
  ├─ name
  ├─ description
  ├─ status
  ├─ start_date
  ├─ end_date
  ├─ budget
  └─ created_by (FK → users)

-- Empleados (Recursos Humanos)
employees
  ├─ id (PK)
  ├─ user_id (FK → users, nullable)
  ├─ first_name
  ├─ last_name
  ├─ email
  ├─ phone
  ├─ position
  ├─ department
  ├─ hire_date
  ├─ salary
  ├─ contract_type
  └─ status

-- Nómina
payroll
  ├─ id (PK)
  ├─ employee_id (FK → employees)
  ├─ project_id (FK → projects)
  ├─ period_start
  ├─ period_end
  ├─ base_salary
  ├─ bonuses
  ├─ deductions
  ├─ net_salary
  ├─ status
  └─ paid_at

-- KPIs
kpis
  ├─ id (PK)
  ├─ employee_id (FK → employees)
  ├─ metric_name
  ├─ target_value
  ├─ current_value
  ├─ period
  └─ created_at

-- Capacitaciones
trainings
  ├─ id (PK)
  ├─ title
  ├─ description
  ├─ content
  ├─ duration
  ├─ created_by (FK → users)
  └─ created_at

-- Relaciones Muchos a Muchos
employee_projects
  ├─ employee_id (FK → employees)
  ├─ project_id (FK → projects)
  ├─ role
  └─ assigned_at

employee_trainings
  ├─ employee_id (FK → employees)
  ├─ training_id (FK → trainings)
  ├─ completed
  ├─ score
  └─ completed_at
```

### Relaciones Principales

```
users ──┬─── projects (1:N)
        └─── employees (1:1, opcional)

employees ──┬─── payroll (1:N)
            ├─── kpis (1:N)
            ├─── employee_projects (N:M)
            └─── employee_trainings (N:M)

projects ──┬─── payroll (1:N)
           └─── employee_projects (N:M)
```

## 🔐 Autenticación y Autorización

### Sistema de Autenticación

```typescript
// Estrategia: Passport.js Local Strategy + Sessions

1. Usuario envía credenciales
   └─> POST /api/login { username, password }

2. Passport.js valida
   └─> LocalStrategy
   └─> Compara password hasheado (scrypt)

3. Si válido, crea sesión
   └─> express-session
   └─> Session guardada en PostgreSQL (connect-pg-simple)
   └─> Cookie enviada al cliente (httpOnly)

4. Requests subsecuentes
   └─> Cookie en headers
   └─> Session deserializada
   └─> req.user disponible

5. Logout
   └─> POST /api/logout
   └─> Session destruida
```

### Middleware de Protección

```typescript
// Proteger rutas
function requireAuth(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  next();
}

// Proteger por rol
function requireRole(role) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  };
}

// Uso
app.get('/api/admin/users', requireAuth, requireRole('admin'), handler);
```

## 🎨 Frontend: Tecnologías y Patrones

### Stack Tecnológico

| Tecnología | Propósito | Uso |
|------------|-----------|-----|
| **React 18** | Framework UI | Componentes, hooks, context |
| **TypeScript** | Tipado estático | Type safety en toda la app |
| **Vite** | Build tool | Dev server, HMR, bundling |
| **TailwindCSS** | Estilos | Utility-first CSS |
| **shadcn/ui** | Componentes | Componentes accesibles pre-diseñados |
| **Radix UI** | Primitivos UI | Base de shadcn/ui |
| **TanStack Query** | Estado del servidor | Fetching, caching, sincronización |
| **React Hook Form** | Formularios | Manejo de formularios performante |
| **Zod** | Validación | Esquemas de validación type-safe |
| **Wouter** | Routing | Router ligero |
| **Recharts** | Gráficos | Visualización de datos |

### Patrones de Componentes

```typescript
// 1. Presentational Component (sin lógica)
export function EmpleadoCard({ empleado }: { empleado: Empleado }) {
  return (
    <Card>
      <CardHeader>{empleado.nombre}</CardHeader>
      <CardContent>{empleado.puesto}</CardContent>
    </Card>
  );
}

// 2. Container Component (con lógica)
export function EmpleadosList() {
  const { data, isLoading } = useEmpleados();
  
  if (isLoading) return <Skeleton />;
  
  return (
    <div>
      {data?.map(emp => <EmpleadoCard key={emp.id} empleado={emp} />)}
    </div>
  );
}

// 3. Custom Hook (lógica reutilizable)
export function useEmpleados() {
  return useQuery({
    queryKey: ['empleados'],
    queryFn: () => fetch('/api/empleados').then(r => r.json()),
  });
}

// 4. Form Component (con validación)
const schema = z.object({
  nombre: z.string().min(2),
  email: z.string().email(),
});

export function EmpleadoForm() {
  const form = useForm({ resolver: zodResolver(schema) });
  const mutation = useCreateEmpleado();
  
  return (
    <Form {...form}>
      <FormField name="nombre" />
      <FormField name="email" />
      <Button onClick={form.handleSubmit(mutation.mutate)}>
        Guardar
      </Button>
    </Form>
  );
}
```

## 🖥️ Backend: Tecnologías y Patrones

### Stack Tecnológico

| Tecnología | Propósito | Uso |
|------------|-----------|-----|
| **Node.js 18+** | Runtime | Ejecución JavaScript del lado del servidor |
| **Express.js** | Framework web | Routing, middleware, HTTP |
| **TypeScript** | Tipado estático | Type safety |
| **Drizzle ORM** | ORM | Queries type-safe a PostgreSQL |
| **Passport.js** | Autenticación | Estrategias de auth |
| **express-session** | Sesiones | Manejo de sesiones |
| **Multer** | File uploads | Subida de archivos |
| **PDFKit** | PDF generation | Generación de reportes |
| **Zod** | Validación | Validación de datos (parcial) |

### Patrones de Rutas

```typescript
// 1. CRUD Básico
router.get('/api/empleados', async (req, res) => {
  const empleados = await storage.getEmpleados();
  res.json(empleados);
});

router.post('/api/empleados', requireAuth, async (req, res) => {
  const empleado = await storage.createEmpleado(req.body);
  res.status(201).json(empleado);
});

// 2. Con validación
router.post('/api/empleados', requireAuth, async (req, res) => {
  const schema = z.object({
    nombre: z.string(),
    email: z.string().email(),
  });
  
  const validated = schema.parse(req.body);
  const empleado = await storage.createEmpleado(validated);
  res.status(201).json(empleado);
});

// 3. Con transacciones
router.post('/api/nomina/procesar', requireAuth, async (req, res) => {
  await db.transaction(async (tx) => {
    // Crear nómina
    const nomina = await tx.insert(payrollTable).values(...);
    
    // Actualizar empleado
    await tx.update(employeesTable).set(...);
    
    // Crear registro de pago
    await tx.insert(paymentsTable).values(...);
  });
  
  res.json({ success: true });
});
```

## 🚀 Deployment

### Desarrollo Local

```bash
npm run dev
# Vite dev server + Express en puerto 5000
# Hot reload habilitado
```

### Producción

```bash
# Build
npm run build
# → Vite build → dist/public/
# → esbuild → dist/index.js

# Start
npm start
# → node dist/index.js
# → Sirve static files desde dist/public/
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["npm", "start"]
```

### Kubernetes

```yaml
# Deployment con HPA
apiVersion: apps/v1
kind: Deployment
metadata:
  name: xtask
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: xtask
        image: xtask:latest
        ports:
        - containerPort: 5000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: xtask-secrets
              key: database-url
```

## 📊 Monitoreo y Logging

### Logging

```typescript
// server/vite.ts
export function log(message: string, source = "express") {
  const time = new Date().toLocaleTimeString("en-US");
  console.log(`${time} [${source}] ${message}`);
}

// Uso
log("GET /api/empleados 200 in 45ms");
```

### Health Checks

```typescript
// Endpoint de salud para Kubernetes
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

app.get('/ready', async (req, res) => {
  try {
    await db.execute(sql`SELECT 1`);
    res.json({ status: 'ready' });
  } catch (error) {
    res.status(503).json({ status: 'not ready' });
  }
});
```

## 🔧 Configuración y Variables

### Configuración por Entorno

```typescript
// Desarrollo
NODE_ENV=development
DATABASE_URL=postgresql://localhost:5432/xtask_db
SESSION_SECRET=dev-secret

// Producción
NODE_ENV=production
DATABASE_URL=postgresql://prod-host/xtask_db
SESSION_SECRET=<strong-random-secret>
```

### Feature Flags (no implementado actualmente)

Potencial mejora futura:
```typescript
const features = {
  enableAI: process.env.ENABLE_AI === 'true',
  enablePayments: process.env.ENABLE_PAYMENTS === 'true',
};
```

## 📈 Escalabilidad

### Estrategias Actuales

1. **Horizontal Scaling**: Múltiples instancias detrás de load balancer
2. **Database Connection Pooling**: Pool de conexiones PostgreSQL
3. **Stateless Sessions**: Sesiones en PostgreSQL (no en memoria)
4. **Static Asset Caching**: Assets servidos con cache headers

### Mejoras Futuras

1. **Redis para sesiones**: Más rápido que PostgreSQL
2. **CDN para assets**: CloudFront, Cloudflare
3. **Read replicas**: Separar lecturas de escrituras
4. **Caching layer**: Redis para queries frecuentes
5. **Message queue**: Bull/BullMQ para tareas asíncronas

## 🧪 Testing (no implementado actualmente)

### Estructura Recomendada

```
tests/
├── unit/
│   ├── components/
│   └── utils/
├── integration/
│   └── api/
└── e2e/
    └── flows/
```

### Stack Recomendado

- **Vitest**: Unit tests
- **React Testing Library**: Component tests
- **Playwright**: E2E tests
- **Supertest**: API tests

## 📚 Referencias

- [React Documentation](https://react.dev/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Express.js](https://expressjs.com/)
- [TanStack Query](https://tanstack.com/query)
- [shadcn/ui](https://ui.shadcn.com/)

---

**Última actualización**: Enero 2025
