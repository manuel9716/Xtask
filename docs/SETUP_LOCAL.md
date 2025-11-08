# Guía de Configuración Local - XTask Platform

Esta guía detalla cómo migrar el proyecto de Replit a tu entorno de desarrollo local.

## 📋 Índice

1. [Diferencias entre Replit y Local](#diferencias-entre-replit-y-local)
2. [Requisitos del Sistema](#requisitos-del-sistema)
3. [Instalación Paso a Paso](#instalación-paso-a-paso)
4. [Configuración de Base de Datos](#configuración-de-base-de-datos)
5. [Variables de Entorno](#variables-de-entorno)
6. [Solución de Problemas Comunes](#solución-de-problemas-comunes)

## 🔄 Diferencias entre Replit y Local

### Cambios Realizados

| Aspecto | Replit | Local |
|---------|--------|-------|
| **Plugins de Vite** | `@replit/vite-plugin-cartographer`, `@replit/vite-plugin-runtime-error-modal` | Removidos |
| **Base de Datos** | PostgreSQL 16 integrado | PostgreSQL local (15+) |
| **Variables de Entorno** | Configuradas en Replit Secrets | Archivo `.env` local |
| **Puerto** | 5000 (único puerto no bloqueado) | 5000 (configurable) |
| **Hot Reload** | Automático en Replit | Vite HMR local |
| **Conexión DB** | Neon serverless con WebSockets | Pool de conexiones estándar |

### Archivos Modificados

1. **`vite.config.ts`** - Removidos plugins de Replit
2. **`package.json`** - Removidas dependencias de Replit
3. **`.env.example`** - Creado para configuración local
4. **`README.md`** - Documentación completa agregada

### Archivos Nuevos

- `.env.example` - Template de variables de entorno
- `README.md` - Documentación principal
- `scripts/setup-local.sh` - Script de configuración automatizada
- `docs/SETUP_LOCAL.md` - Esta guía detallada

## 💻 Requisitos del Sistema

### Software Requerido

#### Node.js (v18+)
```bash
# Verificar versión
node -v  # Debe ser v18.0.0 o superior

# Instalar en macOS
brew install node@18

# Instalar en Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar en Windows
# Descargar desde https://nodejs.org/
```

#### PostgreSQL (v15+)
```bash
# Verificar versión
psql --version  # Debe ser 15.x o superior

# Instalar en macOS
brew install postgresql@15
brew services start postgresql@15

# Instalar en Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql

# Instalar en Windows
# Descargar desde https://www.postgresql.org/download/windows/
```

#### Git
```bash
# Verificar instalación
git --version

# Instalar en macOS
brew install git

# Instalar en Ubuntu/Debian
sudo apt install git
```

### Recursos del Sistema

- **RAM**: Mínimo 4GB, recomendado 8GB+
- **Disco**: 2GB libres para dependencias y datos
- **CPU**: Cualquier procesador moderno de 64 bits

## 🚀 Instalación Paso a Paso

### Opción 1: Script Automatizado (Recomendado)

```bash
# Navegar al directorio del proyecto
cd /Users/manuel97/Documents/Proyectos/XtaskFlow

# Ejecutar script de configuración
./scripts/setup-local.sh
```

El script realizará:
1. ✅ Verificación de Node.js y PostgreSQL
2. ✅ Instalación de dependencias npm
3. ✅ Creación del archivo `.env`
4. ✅ Creación de la base de datos
5. ✅ Inicialización del esquema

### Opción 2: Configuración Manual

#### Paso 1: Instalar Dependencias

```bash
cd /Users/manuel97/Documents/Proyectos/XtaskFlow
npm install
```

#### Paso 2: Configurar PostgreSQL

```bash
# Crear base de datos
createdb xtask_db

# O usando psql
psql -U postgres
CREATE DATABASE xtask_db;
\q
```

#### Paso 3: Configurar Variables de Entorno

```bash
# Copiar template
cp .env.example .env

# Editar con tu editor favorito
nano .env
# o
code .env
```

Configuración mínima requerida:
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/xtask_db
NODE_ENV=development
SESSION_SECRET=genera-una-clave-secreta-aleatoria-aqui
PORT=5000
```

#### Paso 4: Inicializar Base de Datos

```bash
# Aplicar esquema
npm run db:push

# (Opcional) Abrir Drizzle Studio para ver la BD
npm run db:studio
```

#### Paso 5: Iniciar Servidor

```bash
npm run dev
```

Abre tu navegador en: **http://localhost:5000**

## 🗄️ Configuración de Base de Datos

### PostgreSQL Local

#### Configuración Básica

```bash
# Iniciar PostgreSQL (macOS)
brew services start postgresql@15

# Iniciar PostgreSQL (Linux)
sudo systemctl start postgresql
sudo systemctl enable postgresql  # Iniciar al arrancar

# Verificar que está corriendo
pg_isready
```

#### Crear Usuario y Base de Datos

```bash
# Conectar como superusuario
psql -U postgres

# Crear usuario (si no existe)
CREATE USER xtask_user WITH PASSWORD 'tu_password_seguro';

# Crear base de datos
CREATE DATABASE xtask_db OWNER xtask_user;

# Dar permisos
GRANT ALL PRIVILEGES ON DATABASE xtask_db TO xtask_user;

# Salir
\q
```

Actualiza tu `.env`:
```env
DATABASE_URL=postgresql://xtask_user:tu_password_seguro@localhost:5432/xtask_db
```

### Alternativa: Usar Neon (Cloud)

Si prefieres usar Neon como en Replit:

1. Crea una cuenta en [neon.tech](https://neon.tech)
2. Crea un nuevo proyecto
3. Copia la connection string
4. Actualiza `.env`:

```env
DATABASE_URL=postgresql://user:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require
```

### Drizzle ORM - Comandos Útiles

```bash
# Aplicar cambios al esquema (sin migraciones)
npm run db:push

# Generar migraciones
npm run db:generate

# Abrir Drizzle Studio (GUI para la BD)
npm run db:studio
```

## 🔐 Variables de Entorno

### Variables Requeridas

```env
# Base de datos (OBLIGATORIO)
DATABASE_URL=postgresql://user:pass@localhost:5432/xtask_db

# Entorno (OBLIGATORIO)
NODE_ENV=development

# Sesiones (OBLIGATORIO)
SESSION_SECRET=clave-super-secreta-cambiala-en-produccion
```

### Variables Opcionales

```env
# Puerto del servidor (default: 5000)
PORT=5000

# SendGrid para emails
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx

# Stripe para pagos
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx

# OpenAI para funcionalidades de IA
OPENAI_API_KEY=sk-xxxxxxxxxxxxx

# Google Cloud Storage
GOOGLE_CLOUD_PROJECT_ID=tu-proyecto-id
GOOGLE_CLOUD_BUCKET_NAME=tu-bucket
GOOGLE_APPLICATION_CREDENTIALS=path/to/credentials.json
```

### Generar SESSION_SECRET Seguro

```bash
# Opción 1: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Opción 2: OpenSSL
openssl rand -hex 32

# Opción 3: Python
python3 -c "import secrets; print(secrets.token_hex(32))"
```

## 🐛 Solución de Problemas Comunes

### Error: "DATABASE_URL must be set"

**Causa**: No existe el archivo `.env` o la variable no está configurada.

**Solución**:
```bash
# Verificar que existe .env
ls -la .env

# Si no existe, crearlo
cp .env.example .env

# Editar y agregar DATABASE_URL
nano .env
```

### Error: "Cannot connect to database"

**Causa**: PostgreSQL no está corriendo o las credenciales son incorrectas.

**Solución**:
```bash
# Verificar que PostgreSQL está corriendo
pg_isready

# Si no está corriendo (macOS)
brew services start postgresql@15

# Si no está corriendo (Linux)
sudo systemctl start postgresql

# Verificar conexión manual
psql -U postgres -d xtask_db

# Si falla, verifica usuario y contraseña en .env
```

### Error: "Port 5000 already in use"

**Causa**: Otro proceso está usando el puerto 5000.

**Solución**:
```bash
# Ver qué proceso usa el puerto
lsof -ti:5000

# Matar el proceso
lsof -ti:5000 | xargs kill -9

# O cambiar el puerto en .env
echo "PORT=3000" >> .env
```

### Error: "Cannot find module"

**Causa**: Dependencias no instaladas o `node_modules` corrupto.

**Solución**:
```bash
# Limpiar e instalar de nuevo
rm -rf node_modules package-lock.json
npm install

# Si persiste, limpiar caché
npm cache clean --force
npm install
```

### Error: TypeScript "Cannot find type definition"

**Causa**: Dependencias de desarrollo no instaladas.

**Solución**:
```bash
# Instalar todas las dependencias (incluyendo dev)
npm install

# Verificar tipos
npm run check
```

### Error: "EADDRINUSE" al iniciar

**Causa**: El puerto ya está en uso por otra instancia.

**Solución**:
```bash
# Opción 1: Matar proceso en el puerto
lsof -ti:5000 | xargs kill -9

# Opción 2: Usar otro puerto
PORT=3001 npm run dev
```

### Base de Datos: Tablas no existen

**Causa**: No se ha ejecutado `db:push`.

**Solución**:
```bash
# Aplicar esquema
npm run db:push

# Verificar tablas
psql -U postgres -d xtask_db -c "\dt"
```

### Problemas con Permisos (macOS/Linux)

**Causa**: Scripts sin permisos de ejecución.

**Solución**:
```bash
# Dar permisos al script
chmod +x scripts/setup-local.sh

# Si hay problemas con PostgreSQL
sudo chown -R $(whoami) /usr/local/var/postgresql@15
```

## 📊 Verificación de la Instalación

### Checklist de Verificación

```bash
# ✅ Node.js instalado
node -v

# ✅ PostgreSQL corriendo
pg_isready

# ✅ Base de datos existe
psql -U postgres -l | grep xtask_db

# ✅ Dependencias instaladas
ls node_modules | wc -l  # Debe mostrar ~1000+

# ✅ Archivo .env existe
cat .env | grep DATABASE_URL

# ✅ Esquema aplicado
psql -U postgres -d xtask_db -c "\dt" | wc -l  # Debe mostrar varias tablas

# ✅ Servidor inicia
npm run dev
# Debe mostrar: "serving on port 5000"
```

### Prueba de Funcionalidad

1. **Servidor corriendo**: http://localhost:5000
2. **API funcional**: http://localhost:5000/api/user (debe retornar 401)
3. **Frontend carga**: Debe ver la página de inicio/login

## 🔄 Migración desde Replit

Si estás migrando datos desde Replit:

### Exportar Datos de Replit

```bash
# En Replit Shell
pg_dump $DATABASE_URL > backup.sql
```

### Importar a Local

```bash
# Descargar backup.sql desde Replit
# Luego en local:
psql -U postgres -d xtask_db < backup.sql
```

## 📚 Recursos Adicionales

- [Documentación de Drizzle ORM](https://orm.drizzle.team/)
- [PostgreSQL Tutorial](https://www.postgresql.org/docs/current/tutorial.html)
- [Vite Documentation](https://vitejs.dev/)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)

## 🆘 Soporte

Si encuentras problemas no cubiertos aquí:

1. Revisa el `README.md` principal
2. Consulta `replit.md` para detalles de arquitectura
3. Revisa los logs del servidor: `npm run dev`
4. Verifica logs de PostgreSQL: `tail -f /usr/local/var/log/postgresql@15.log`

---

**Última actualización**: Enero 2025
