# Guía de Migración de Replit a Local

## 📝 Resumen de Cambios

Esta guía documenta todos los cambios realizados para migrar el proyecto XTask de Replit a un entorno de desarrollo local.

## ✅ Cambios Realizados

### 1. Archivos Modificados

#### `vite.config.ts`
**Antes:**
```typescript
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

export default defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer(),
          ),
        ]
      : []),
  ],
  // ...
});
```

**Después:**
```typescript
export default defineConfig({
  plugins: [
    react(),
  ],
  // ...
});
```

**Razón**: Los plugins de Replit no son necesarios ni funcionan fuera de Replit.

---

#### `package.json`
**Cambios:**
1. **Removidas dependencias de desarrollo:**
   - `@replit/vite-plugin-cartographer`
   - `@replit/vite-plugin-runtime-error-modal`

2. **Agregados scripts:**
   ```json
   "db:studio": "drizzle-kit studio",
   "db:generate": "drizzle-kit generate"
   ```

**Razón**: Eliminar dependencias específicas de Replit y agregar herramientas útiles para desarrollo local.

---

### 2. Archivos Nuevos Creados

#### `.env.example`
Archivo template con todas las variables de entorno necesarias:
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/xtask_db
NODE_ENV=development
SESSION_SECRET=your-super-secret-session-key
PORT=5000
SENDGRID_API_KEY=
STRIPE_SECRET_KEY=
OPENAI_API_KEY=
```

**Propósito**: Documentar las variables de entorno requeridas y proporcionar valores por defecto para desarrollo local.

---

#### `README.md`
Documentación completa del proyecto incluyendo:
- Requisitos previos
- Instalación paso a paso
- Configuración de PostgreSQL
- Variables de entorno
- Comandos de desarrollo
- Despliegue con Docker y Kubernetes
- Solución de problemas

**Propósito**: Guía principal para cualquier desarrollador que quiera trabajar en el proyecto.

---

#### `scripts/setup-local.sh`
Script bash automatizado que:
- Verifica Node.js y PostgreSQL
- Instala dependencias npm
- Crea archivo `.env`
- Crea base de datos
- Inicializa esquema

**Propósito**: Automatizar el proceso de configuración inicial.

---

#### `docs/SETUP_LOCAL.md`
Guía detallada de configuración que incluye:
- Diferencias entre Replit y local
- Requisitos del sistema
- Instalación manual y automatizada
- Configuración de PostgreSQL local vs Neon
- Variables de entorno explicadas
- Solución de problemas comunes
- Checklist de verificación

**Propósito**: Documentación exhaustiva para resolver cualquier problema durante la configuración.

---

#### `docs/ARQUITECTURA.md`
Documentación técnica completa:
- Diagrama de arquitectura
- Estructura de directorios explicada
- Patrones de diseño utilizados
- Flujo de datos
- Modelo de base de datos
- Stack tecnológico
- Estrategias de deployment

**Propósito**: Entender la arquitectura del proyecto para facilitar el desarrollo y mantenimiento.

---

#### `docs/MIGRACION_REPLIT.md`
Este documento que estás leyendo.

**Propósito**: Documentar el proceso de migración para referencia futura.

---

## 🔄 Diferencias Clave: Replit vs Local

| Aspecto | Replit | Local |
|---------|--------|-------|
| **Base de Datos** | PostgreSQL 16 integrado | PostgreSQL local (15+) o Neon cloud |
| **Variables de Entorno** | Replit Secrets UI | Archivo `.env` |
| **Puerto** | 5000 (único no bloqueado) | Cualquiera (default 5000) |
| **Hot Reload** | Automático | Vite HMR |
| **Plugins de Vite** | Plugins de Replit | Solo plugins estándar |
| **Instalación** | Automática | Manual (`npm install`) |
| **Conexión DB** | Neon serverless | Pool estándar o Neon |

## 📦 Dependencias Removidas

```json
{
  "devDependencies": {
    "@replit/vite-plugin-cartographer": "^0.0.11",     // ❌ Removido
    "@replit/vite-plugin-runtime-error-modal": "^0.0.3" // ❌ Removido
  }
}
```

Estas dependencias son específicas de Replit y no funcionan fuera de su entorno.

## 🔧 Configuración de Base de Datos

### Opción 1: PostgreSQL Local (Recomendado para desarrollo)

**Ventajas:**
- ✅ Más rápido (sin latencia de red)
- ✅ Funciona sin internet
- ✅ Control total
- ✅ Gratis

**Desventajas:**
- ❌ Requiere instalación
- ❌ Configuración inicial

**Setup:**
```bash
# macOS
brew install postgresql@15
brew services start postgresql@15
createdb xtask_db

# Linux
sudo apt install postgresql
sudo systemctl start postgresql
sudo -u postgres createdb xtask_db

# .env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/xtask_db
```

---

### Opción 2: Neon (Cloud, como en Replit)

**Ventajas:**
- ✅ Sin instalación local
- ✅ Mismo comportamiento que Replit
- ✅ Backups automáticos
- ✅ Escalable

**Desventajas:**
- ❌ Requiere internet
- ❌ Latencia de red
- ❌ Plan gratuito limitado

**Setup:**
1. Crear cuenta en [neon.tech](https://neon.tech)
2. Crear proyecto
3. Copiar connection string
4. Agregar a `.env`:
```env
DATABASE_URL=postgresql://user:pass@ep-xxx.region.aws.neon.tech/dbname?sslmode=require
```

## 🚀 Proceso de Migración Paso a Paso

### Para Nuevos Desarrolladores

1. **Clonar/Obtener el proyecto**
   ```bash
   cd /Users/manuel97/Documents/Proyectos/XtaskFlow
   ```

2. **Ejecutar script de setup**
   ```bash
   ./scripts/setup-local.sh
   ```

3. **Editar `.env`**
   ```bash
   nano .env
   # Configurar DATABASE_URL y SESSION_SECRET
   ```

4. **Iniciar desarrollo**
   ```bash
   npm run dev
   ```

### Para Migrar Datos desde Replit

Si tienes datos en Replit que quieres migrar:

1. **En Replit Shell, exportar datos:**
   ```bash
   pg_dump $DATABASE_URL > backup.sql
   ```

2. **Descargar `backup.sql` desde Replit**

3. **En local, importar:**
   ```bash
   psql -U postgres -d xtask_db < backup.sql
   ```

## ⚠️ Consideraciones Importantes

### 1. Variables de Entorno

**En Replit:**
- Se configuran en "Secrets" (UI)
- Automáticamente disponibles

**En Local:**
- Archivo `.env` en la raíz
- **NUNCA** commitear `.env` a Git
- Usar `.env.example` como template

### 2. Puerto del Servidor

**En Replit:**
- Debe ser 5000 (único puerto no bloqueado)

**En Local:**
- Puede ser cualquiera
- Cambiar en `.env`: `PORT=3000`

### 3. Sesiones

**En Replit:**
- Almacenadas en PostgreSQL de Replit

**En Local:**
- Almacenadas en PostgreSQL local
- Sesiones no se comparten entre Replit y local

### 4. Archivos Subidos

**En Replit:**
- Carpeta `uploads/` persiste

**En Local:**
- Carpeta `uploads/` es local
- No se sincroniza con Replit
- Está en `.gitignore`

## 🐛 Problemas Comunes y Soluciones

### Error: "Cannot find module '@replit/...'"

**Causa:** Dependencias de Replit aún referenciadas.

**Solución:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### Error: "DATABASE_URL must be set"

**Causa:** Archivo `.env` no existe o está mal configurado.

**Solución:**
```bash
cp .env.example .env
nano .env  # Editar DATABASE_URL
```

### Error: "Port 5000 already in use"

**Causa:** Otro proceso usa el puerto.

**Solución:**
```bash
# Opción 1: Matar proceso
lsof -ti:5000 | xargs kill -9

# Opción 2: Cambiar puerto
echo "PORT=3001" >> .env
```

### Error: "Cannot connect to database"

**Causa:** PostgreSQL no está corriendo.

**Solución:**
```bash
# macOS
brew services start postgresql@15

# Linux
sudo systemctl start postgresql

# Verificar
pg_isready
```

## 📋 Checklist de Migración

- [x] Plugins de Replit removidos de `vite.config.ts`
- [x] Dependencias de Replit removidas de `package.json`
- [x] Archivo `.env.example` creado
- [x] `README.md` creado con documentación completa
- [x] Script `setup-local.sh` creado
- [x] Documentación en `docs/` creada
- [ ] PostgreSQL instalado localmente (usuario debe hacer)
- [ ] Archivo `.env` configurado (usuario debe hacer)
- [ ] Base de datos creada (usuario debe hacer)
- [ ] Esquema inicializado con `npm run db:push` (usuario debe hacer)

## 🎯 Próximos Pasos Recomendados

### Para el Usuario

1. **Instalar PostgreSQL** si no lo tienes
2. **Ejecutar script de setup**: `./scripts/setup-local.sh`
3. **Configurar `.env`** con tus valores
4. **Iniciar desarrollo**: `npm run dev`

### Mejoras Futuras (Opcional)

1. **Testing**
   - Agregar Vitest para unit tests
   - Agregar Playwright para E2E tests

2. **CI/CD**
   - GitHub Actions para testing automático
   - Deploy automático a producción

3. **Docker Compose mejorado**
   - Incluir PostgreSQL en docker-compose
   - Volúmenes para persistencia

4. **Monitoreo**
   - Agregar logging estructurado
   - Métricas con Prometheus

5. **Documentación**
   - API documentation con Swagger/OpenAPI
   - Storybook para componentes

## 📚 Recursos Adicionales

- [Documentación de PostgreSQL](https://www.postgresql.org/docs/)
- [Drizzle ORM Docs](https://orm.drizzle.team/)
- [Vite Documentation](https://vitejs.dev/)
- [Express.js Guide](https://expressjs.com/)

## 🤝 Contribuir

Si encuentras problemas o mejoras:

1. Documenta el problema en `docs/`
2. Actualiza `README.md` si es necesario
3. Considera agregar al script `setup-local.sh`

---

**Migración completada**: Enero 2025  
**Versión del proyecto**: 1.0.0  
**Compatibilidad**: Node.js 18+, PostgreSQL 15+
