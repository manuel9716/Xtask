# 🚀 Inicio Rápido - XTask Platform

## ⚡ Setup en 5 Minutos

### 1️⃣ Requisitos
- Node.js 18+ instalado
- PostgreSQL 15+ instalado y corriendo

### 2️⃣ Instalación Automática

```bash
# Ejecutar script de configuración
./scripts/setup-local.sh
```

El script te guiará por todo el proceso.

### 3️⃣ Configurar Base de Datos

Edita el archivo `.env` que se creó:

```bash
nano .env
```

Asegúrate de que `DATABASE_URL` apunte a tu PostgreSQL local:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/xtask_db
SESSION_SECRET=cambia-esto-por-algo-seguro
```

### 4️⃣ Iniciar Aplicación

```bash
npm run dev
```

Abre tu navegador en: **http://localhost:5000**

---

## 🔧 Setup Manual (si el script falla)

### Paso 1: Instalar Dependencias
```bash
npm install
```

### Paso 2: Crear Base de Datos
```bash
# macOS/Linux
createdb xtask_db

# O con psql
psql -U postgres -c "CREATE DATABASE xtask_db;"
```

### Paso 3: Configurar Variables de Entorno
```bash
cp .env.example .env
# Editar .env con tus valores
```

### Paso 4: Inicializar Esquema
```bash
npm run db:push
```

### Paso 5: Iniciar Servidor
```bash
npm run dev
```

---

## 📝 Comandos Útiles

```bash
# Desarrollo
npm run dev              # Iniciar servidor de desarrollo

# Base de Datos
npm run db:push          # Aplicar cambios al esquema
npm run db:studio        # Abrir GUI de base de datos
npm run db:generate      # Generar migraciones

# Producción
npm run build            # Construir para producción
npm start                # Iniciar en modo producción

# Utilidades
npm run check            # Verificar tipos TypeScript
```

---

## 🐛 Problemas Comunes

### "DATABASE_URL must be set"
```bash
cp .env.example .env
nano .env  # Configurar DATABASE_URL
```

### "Port 5000 already in use"
```bash
lsof -ti:5000 | xargs kill -9
```

### "Cannot connect to database"
```bash
# Verificar que PostgreSQL está corriendo
pg_isready

# Iniciar PostgreSQL (macOS)
brew services start postgresql@15

# Iniciar PostgreSQL (Linux)
sudo systemctl start postgresql
```

---

## 📚 Más Información

- **Documentación completa**: Ver `README.md`
- **Configuración detallada**: Ver `docs/SETUP_LOCAL.md`
- **Arquitectura**: Ver `docs/ARQUITECTURA.md`
- **Migración desde Replit**: Ver `docs/MIGRACION_REPLIT.md`

---

## 🎯 Estructura del Proyecto

```
XtaskFlow/
├── client/          # Frontend React
├── server/          # Backend Express
├── shared/          # Código compartido
├── docs/            # Documentación
├── scripts/         # Scripts de utilidad
├── .env.example     # Template de variables
└── README.md        # Documentación principal
```

---

## ✅ Verificación

Una vez iniciado, deberías ver:

```
[express] serving on port 5000
```

Y al abrir http://localhost:5000 deberías ver la aplicación XTask.

---

**¿Necesitas ayuda?** Consulta `docs/SETUP_LOCAL.md` para solución de problemas detallada.
