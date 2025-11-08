# 👋 Instrucciones para Manuel

## 🎉 ¡Migración Completada!

He revisado y adaptado completamente tu proyecto XTask de Replit para que funcione en tu entorno local. Aquí está todo lo que necesitas saber.

---

## 📦 ¿Qué se hizo?

### ✅ Cambios en el Código
1. **Removí plugins de Replit** de `vite.config.ts`
2. **Limpié dependencias** en `package.json`
3. **Mejoré `.gitignore`** para proteger archivos sensibles

### ✅ Documentación Creada
1. **README.md** - Guía principal completa
2. **INICIO_RAPIDO.md** - Para empezar en 5 minutos
3. **.env.example** - Template de configuración
4. **docs/SETUP_LOCAL.md** - Guía detallada
5. **docs/ARQUITECTURA.md** - Documentación técnica
6. **docs/MIGRACION_REPLIT.md** - Proceso de migración
7. **scripts/setup-local.sh** - Script de configuración automática

---

## 🚀 Cómo Empezar AHORA

### Opción 1: Rápida (Recomendada) ⚡

```bash
# 1. Ejecutar el script de setup
./scripts/setup-local.sh

# 2. Editar el archivo .env que se creó
nano .env

# 3. Cambiar esta línea con tu configuración de PostgreSQL:
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/xtask_db

# 4. Iniciar el servidor
npm run dev
```

### Opción 2: Manual 🔧

```bash
# 1. Instalar dependencias
npm install

# 2. Crear base de datos
createdb xtask_db

# 3. Copiar template de variables
cp .env.example .env

# 4. Editar .env
nano .env

# 5. Inicializar base de datos
npm run db:push

# 6. Iniciar servidor
npm run dev
```

---

## ⚙️ Configuración de PostgreSQL

### Si NO tienes PostgreSQL instalado:

#### En macOS:
```bash
# Instalar con Homebrew
brew install postgresql@15

# Iniciar el servicio
brew services start postgresql@15

# Crear la base de datos
createdb xtask_db
```

#### Verificar que funciona:
```bash
pg_isready
# Debe mostrar: "accepting connections"
```

### Si prefieres usar Neon (como en Replit):

1. Ve a [neon.tech](https://neon.tech) y crea una cuenta
2. Crea un nuevo proyecto
3. Copia la "Connection String"
4. Pégala en tu `.env`:
```env
DATABASE_URL=postgresql://user:pass@ep-xxx.region.aws.neon.tech/dbname?sslmode=require
```

---

## 🔐 Variables de Entorno Importantes

Tu archivo `.env` debe tener al menos esto:

```env
# Base de datos (OBLIGATORIO)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/xtask_db

# Entorno (OBLIGATORIO)
NODE_ENV=development

# Clave de sesiones (OBLIGATORIO)
SESSION_SECRET=genera-una-clave-aleatoria-aqui
```

### Generar SESSION_SECRET seguro:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 🎯 Comandos que Usarás

```bash
# Desarrollo diario
npm run dev              # Iniciar servidor (puerto 5000)

# Base de datos
npm run db:push          # Aplicar cambios al esquema
npm run db:studio        # Ver base de datos en el navegador

# Verificación
npm run check            # Verificar TypeScript

# Producción
npm run build            # Construir para producción
npm start                # Iniciar en modo producción
```

---

## 🐛 Si Algo Sale Mal

### Error: "DATABASE_URL must be set"
```bash
# Asegúrate de tener el archivo .env
ls -la .env

# Si no existe, créalo
cp .env.example .env
nano .env
```

### Error: "Port 5000 already in use"
```bash
# Matar el proceso que usa el puerto
lsof -ti:5000 | xargs kill -9
```

### Error: "Cannot connect to database"
```bash
# Verificar que PostgreSQL está corriendo
pg_isready

# Si no está corriendo, iniciarlo
brew services start postgresql@15
```

### Error: "Cannot find module"
```bash
# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

---

## 📚 Documentación Disponible

### Para Empezar
- **INICIO_RAPIDO.md** ← Empieza aquí
- **README.md** ← Documentación completa

### Para Problemas
- **docs/SETUP_LOCAL.md** ← Solución de problemas detallada

### Para Entender el Proyecto
- **docs/ARQUITECTURA.md** ← Cómo está construido
- **docs/MIGRACION_REPLIT.md** ← Qué cambió desde Replit

### Resumen de Cambios
- **CAMBIOS_REALIZADOS.md** ← Lista de todo lo modificado

---

## ✅ Checklist de Verificación

Después de configurar, verifica que todo funciona:

```bash
# ✅ Node.js instalado
node -v
# Debe mostrar: v18.x.x o superior

# ✅ PostgreSQL corriendo
pg_isready
# Debe mostrar: "accepting connections"

# ✅ Base de datos existe
psql -l | grep xtask_db
# Debe aparecer en la lista

# ✅ Dependencias instaladas
ls node_modules | wc -l
# Debe mostrar ~1000+

# ✅ Archivo .env configurado
cat .env | grep DATABASE_URL
# Debe mostrar tu connection string

# ✅ Servidor inicia
npm run dev
# Debe mostrar: "serving on port 5000"

# ✅ Aplicación funciona
# Abre: http://localhost:5000
# Debe cargar la aplicación
```

---

## 🎓 Estructura del Proyecto

```
XtaskFlow/
├── client/              # Frontend React
│   └── src/
│       ├── components/  # Componentes UI
│       ├── modules/     # Módulos de negocio
│       └── lib/         # Utilidades
│
├── server/              # Backend Express
│   ├── modules/         # Lógica de negocio
│   ├── routes/          # Rutas API
│   └── index.ts         # Punto de entrada
│
├── shared/              # Código compartido
│   └── schema.ts        # Esquemas de BD
│
├── docs/                # Documentación
├── scripts/             # Scripts de utilidad
├── .env.example         # Template de config
└── README.md            # Documentación principal
```

---

## 💡 Tips Útiles

### Durante Desarrollo

1. **Usa Drizzle Studio** para ver tu base de datos:
   ```bash
   npm run db:studio
   # Abre http://localhost:4983
   ```

2. **Hot Reload está activo**: Los cambios se reflejan automáticamente

3. **Logs del servidor**: Aparecen en la terminal donde ejecutaste `npm run dev`

### Antes de Hacer Cambios en la BD

```bash
# Siempre haz backup antes de cambios importantes
pg_dump xtask_db > backup_$(date +%Y%m%d).sql
```

### Si Trabajas con el Equipo

1. **NUNCA** commitees el archivo `.env`
2. Usa `.env.example` para documentar nuevas variables
3. Actualiza el README si agregas funcionalidades

---

## 🔄 Migrar Datos desde Replit (Opcional)

Si tienes datos en Replit que quieres traer:

### En Replit:
```bash
pg_dump $DATABASE_URL > backup.sql
# Descargar el archivo backup.sql
```

### En Local:
```bash
psql -U postgres -d xtask_db < backup.sql
```

---

## 🚀 Próximos Pasos

### Ahora Mismo
1. ✅ Ejecutar `./scripts/setup-local.sh`
2. ✅ Configurar `.env`
3. ✅ Iniciar con `npm run dev`
4. ✅ Abrir http://localhost:5000

### Después
- 📖 Leer `docs/ARQUITECTURA.md` para entender el proyecto
- 🧪 Explorar el código en `client/` y `server/`
- 🎨 Personalizar según tus necesidades

---

## 🆘 ¿Necesitas Ayuda?

### Orden de Consulta
1. **INICIO_RAPIDO.md** - Problemas básicos
2. **docs/SETUP_LOCAL.md** - Problemas de configuración
3. **README.md** - Documentación general
4. **docs/ARQUITECTURA.md** - Dudas técnicas

### Comandos de Diagnóstico
```bash
# Ver versiones
node -v
npm -v
psql --version

# Ver procesos
lsof -ti:5000

# Ver logs de PostgreSQL (macOS)
tail -f /usr/local/var/log/postgresql@15.log

# Verificar conexión a BD
psql -U postgres -d xtask_db -c "SELECT 1;"
```

---

## 🎉 ¡Listo!

Tu proyecto está completamente configurado para desarrollo local. Todo el código está adaptado, documentado y listo para usar.

**Recuerda**: Si algo no funciona, consulta `docs/SETUP_LOCAL.md` que tiene soluciones detalladas para todos los problemas comunes.

---

**¡Buena suerte con tu proyecto XTask!** 🚀

Si tienes preguntas, toda la documentación está en la carpeta `docs/`.
