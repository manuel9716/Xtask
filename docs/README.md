# XTask Platform - Sistema de Gestión Empresarial

XTask es una plataforma completa de gestión empresarial que integra gestión de proyectos, recursos humanos, finanzas, nómina y más.

## 📋 Tabla de Contenidos

- [Requisitos Previos](#requisitos-previos)
- [Instalación Local](#instalación-local)
- [Configuración](#configuración)
- [Desarrollo](#desarrollo)
- [Producción](#producción)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Tecnologías](#tecnologías)

## 🔧 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** v18 o superior ([Descargar](https://nodejs.org/))
- **PostgreSQL** v15 o superior ([Descargar](https://www.postgresql.org/download/))
- **npm** v9 o superior (viene con Node.js)
- **Git** ([Descargar](https://git-scm.com/))

## 🚀 Instalación Local

### 1. Clonar el repositorio (si aplica)

```bash
git clone <url-del-repositorio>
cd XtaskFlow
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar Base de Datos

El proyecto soporta **SQL Server** y **PostgreSQL**.

#### Opción A: SQL Server 2019 (Configuración Actual)

**Requisitos**:
- SQL Server 2019 instalado y corriendo
- Base de datos: `Xtask_dev`
- Usuario: `sa`
- Puerto: `1433`

**Verificar SQL Server**:
```bash
# Windows (PowerShell)
Get-Service MSSQLSERVER

# Probar conexión
sqlcmd -S localhost -U sa -P "Str0ng!Passw0rd" -Q "SELECT @@VERSION"
```

**Crear base de datos** (si no existe):
```sql
CREATE DATABASE Xtask_dev;
GO
```

⚠️ **Importante**: Debes crear las tablas manualmente. Ver `docs/MIGRACION_SQL_SERVER.md`

#### Opción B: PostgreSQL Local

**En macOS (usando Homebrew)**:
```bash
# Instalar PostgreSQL
brew install postgresql@15

# Iniciar el servicio
brew services start postgresql@15

# Crear base de datos
createdb xtask_db
```

**En Windows**:
1. Descarga e instala PostgreSQL desde [postgresql.org](https://www.postgresql.org/download/windows/)
2. Usa pgAdmin o la línea de comandos para crear la base de datos:
```sql
CREATE DATABASE xtask_db;
```

**En Linux (Ubuntu/Debian)**:
```bash
# Instalar PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Iniciar servicio
sudo systemctl start postgresql

# Crear base de datos
sudo -u postgres createdb xtask_db
```

### 4. Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```bash
cp .env.example .env
```

Edita el archivo `.env` con tus configuraciones:

**Para SQL Server** (actual):
```env
DATABASE_URL=mssql://sa:Str0ng!Passw0rd@localhost:1433/Xtask_dev
NODE_ENV=development
SESSION_SECRET=tu-clave-secreta-super-segura
PORT=5000
```

**Para PostgreSQL**:
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/xtask_db
NODE_ENV=development
SESSION_SECRET=tu-clave-secreta-super-segura
PORT=5000
```

### 5. Inicializar la Base de Datos

**Para PostgreSQL**:
```bash
# Ejecutar migraciones y crear tablas
npm run db:push
```

**Para SQL Server**:
⚠️ Debes crear las tablas manualmente. Consulta:
- `docs/MIGRACION_SQL_SERVER.md` - Guía completa
- `infrastructure/scripts/generate-sqlserver-schema.md` - Conversión de schema

### 6. Iniciar el Servidor de Desarrollo

```bash
npm run dev
```

**Salida esperada**:
- SQL Server: `✅ Conectado a SQL Server`
- PostgreSQL: `✅ Conectado a PostgreSQL`

La aplicación estará disponible en: **http://localhost:5000**

## ⚙️ Configuración

### Variables de Entorno

| Variable | Descripción | Requerida | Ejemplo |
|----------|-------------|-----------|---------|
| `DATABASE_URL` | URL de conexión a BD (SQL Server o PostgreSQL) | ✅ Sí | `mssql://sa:pass@localhost:1433/Xtask_dev` |
| `NODE_ENV` | Entorno de ejecución | ✅ Sí | `development` o `production` |
| `SESSION_SECRET` | Clave secreta para sesiones | ✅ Sí | Cadena aleatoria segura |
| `PORT` | Puerto del servidor | ❌ No | `5000` (por defecto) |
| `SENDGRID_API_KEY` | API key de SendGrid para emails | ❌ No | `SG.xxx...` |
| `STRIPE_SECRET_KEY` | Clave secreta de Stripe | ❌ No | `sk_test_xxx...` |
| `OPENAI_API_KEY` | API key de OpenAI | ❌ No | `sk-xxx...` |

### Base de Datos

El proyecto soporta **SQL Server 2019** y **PostgreSQL**.

- **SQL Server**: Usa el driver `mssql` directamente (sin ORM)
- **PostgreSQL**: Usa **Drizzle ORM** para gestión de base de datos

Los esquemas están en `shared/schema.ts`.

#### Comandos útiles:

```bash
# Solo para PostgreSQL - Aplicar cambios al esquema
npm run db:push

# Verificar tipos de TypeScript
npm run check
```

⚠️ **Nota**: Si usas SQL Server, las migraciones deben hacerse manualmente. Ver `docs/MIGRACION_SQL_SERVER.md`

## 💻 Desarrollo

### Estructura de Comandos

```bash
# Desarrollo con hot-reload
npm run dev

# Verificar tipos de TypeScript
npm run check

# Construir para producción
npm run build

# Iniciar en modo producción
npm start
```

### Desarrollo del Frontend

El frontend está en la carpeta `client/` y usa:
- **React 18** con TypeScript
- **Vite** para desarrollo rápido
- **TailwindCSS** para estilos
- **shadcn/ui** para componentes
- **TanStack Query** para gestión de estado del servidor

### Desarrollo del Backend

El backend está en la carpeta `server/` y usa:
- **Express.js** con TypeScript
- **Drizzle ORM** para base de datos
- **Passport.js** para autenticación
- Arquitectura modular por dominios

## 🏭 Producción

### Construcción

```bash
npm run build
```

Esto genera:
- Frontend compilado en `dist/public/`
- Backend compilado en `dist/index.js`

### Despliegue con Docker

```bash
# Construir imagen
docker build -f infrastructure/docker/Dockerfile -t xtask-platform .

# Ejecutar contenedor
docker run -p 5000:5000 \
  -e DATABASE_URL="postgresql://..." \
  -e SESSION_SECRET="..." \
  xtask-platform
```

### Despliegue con Docker Compose

```bash
cd infrastructure/docker
docker-compose up -d
```

### Despliegue en Kubernetes

Los manifiestos están en la carpeta `infrastructure/k8s/`:

```bash
kubectl apply -f infrastructure/k8s/
```

## 📁 Estructura del Proyecto

```
XtaskFlow/
├── client/                      # Frontend React
│   ├── src/
│   │   ├── components/         # Componentes reutilizables
│   │   ├── modules/            # Módulos por dominio
│   │   ├── lib/                # Utilidades y configuración
│   │   └── main.tsx            # Punto de entrada
│   └── index.html
├── server/                      # Backend Express (ACTIVO)
│   ├── modules/                # Lógica de negocio por módulo
│   ├── routes/                 # Rutas de la API
│   ├── middleware/             # Middlewares personalizados
│   ├── auth.ts                 # Configuración de autenticación
│   ├── db.ts                   # Configuración de base de datos
│   └── index.ts                # Punto de entrada del servidor
├── shared/                      # Código compartido
│   ├── schema.ts               # Esquemas de base de datos (Drizzle)
│   ├── types/                  # Tipos TypeScript compartidos
│   └── utils/                  # Utilidades comunes
├── infrastructure/              # Infraestructura del proyecto
│   ├── docker/                 # Configuración Docker
│   │   ├── Dockerfile
│   │   ├── docker-compose.yml
│   │   └── .dockerignore
│   ├── k8s/                    # Manifiestos de Kubernetes
│   └── scripts/                # Scripts de utilidad
├── docs/                        # Documentación
│   ├── architecture/           # Documentación de arquitectura
│   ├── api/                    # Documentación de API
│   └── guides/                 # Guías de uso
├── tests/                       # Tests E2E y de integración
├── uploads/                     # Archivos subidos (gitignored)
├── package.json
├── tsconfig.json
├── vite.config.ts
└── drizzle.config.ts
```

> 📖 **Para más detalles**: Ver `docs/ESTRUCTURA_ORGANIZADA.md`

## 🛠️ Tecnologías

### Frontend
- **React 18** - Framework UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool
- **TailwindCSS** - Framework CSS
- **Radix UI** - Componentes accesibles
- **TanStack Query** - Gestión de estado del servidor
- **React Hook Form** - Manejo de formularios
- **Zod** - Validación de esquemas
- **Wouter** - Enrutamiento ligero

### Backend
- **Node.js** - Runtime
- **Express.js** - Framework web
- **TypeScript** - Tipado estático
- **Drizzle ORM** - ORM para PostgreSQL
- **Passport.js** - Autenticación
- **Multer** - Subida de archivos
- **PDFKit** - Generación de PDFs

### Base de Datos
- **PostgreSQL** - Base de datos relacional
- **Drizzle ORM** - ORM type-safe

### DevOps
- **Docker** - Contenedorización
- **Kubernetes** - Orquestación
- **NGINX** - Reverse proxy

## 🔐 Seguridad

- Las contraseñas se hashean con `scrypt`
- Sesiones seguras con `express-session`
- Cookies HTTP-only en producción
- Variables de entorno para secretos
- Validación de datos con Zod

## 📝 Módulos Principales

1. **Autenticación** - Login, registro, gestión de sesiones
2. **Proyectos** - Gestión de proyectos con tableros Kanban
3. **Recursos Humanos** - Empleados, evaluaciones, habilidades
4. **Finanzas** - Presupuestos, transacciones, nómina
5. **Proveedores** - Gestión de proveedores
6. **KPIs** - Indicadores de rendimiento y bonificaciones
7. **Microlearning** - Capacitaciones y contenido educativo
8. **Dashboard** - Widgets personalizables y reportes

## 🐛 Solución de Problemas

### Error: "DATABASE_URL must be set"
- Asegúrate de tener el archivo `.env` con `DATABASE_URL` configurado
- Verifica que la base de datos esté corriendo

### Error: "Cannot find module"
- Ejecuta `npm install` nuevamente
- Borra `node_modules` y `package-lock.json`, luego `npm install`

### Error de conexión a SQL Server
- Verifica que SQL Server esté corriendo: `Get-Service MSSQLSERVER`
- Comprueba las credenciales en `DATABASE_URL`
- Asegúrate de que la base de datos existe
- Verifica que el puerto 1433 esté abierto

### Error de conexión a PostgreSQL
- Verifica que PostgreSQL esté corriendo: `pg_isready`
- Comprueba las credenciales en `DATABASE_URL`
- Asegúrate de que la base de datos existe: `psql -l`

### Puerto 5000 ya en uso
- Cambia el puerto en `.env`: `PORT=3000`
- O mata el proceso: `lsof -ti:5000 | xargs kill -9`

### Problemas con SQL Server
Ver guía completa: `docs/MIGRACION_SQL_SERVER.md`

## 📞 Soporte

Para problemas o preguntas, revisa la documentación en la carpeta `docs/`:

- **Inicio Rápido**: `docs/guides/INICIO_RAPIDO.md`
- **Comandos Rápidos**: `docs/guides/COMANDOS_RAPIDOS.md`
- **Setup Local**: `docs/SETUP_LOCAL.md`
- **Arquitectura**: `docs/ARQUITECTURA.md`
- **Estructura Organizada**: `docs/ESTRUCTURA_ORGANIZADA.md`
- **Migración SQL Server**: `docs/MIGRACION_SQL_SERVER.md` ⭐

## 📄 Licencia

MIT License - Ver archivo LICENSE para más detalles.
