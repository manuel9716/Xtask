# 🔄 Migración a SQL Server 2019

**Fecha**: 13 de Octubre, 2025

---

## 📋 Resumen

Se ha configurado el proyecto XtaskFlow para conectarse a una base de datos **SQL Server 2019** local en lugar de PostgreSQL.

---

## 🔧 Configuración Actual

### Credenciales de Base de Datos

```
Servidor: localhost
Puerto: 1433
Base de datos: Xtask_dev
Usuario: sa
Contraseña: Str0ng!Passw0rd
```

### Cadena de Conexión

```env
DATABASE_URL=mssql://sa:Str0ng!Passw0rd@localhost:1433/Xtask_dev
```

---

## ✅ Cambios Realizados

### 1. Dependencias Instaladas

```bash
npm install mssql tedious @types/mssql
```

**Paquetes agregados**:
- `mssql` - Driver de SQL Server para Node.js
- `tedious` - Driver TDS (Tabular Data Stream) para SQL Server
- `@types/mssql` - Tipos de TypeScript para mssql

### 2. Archivo `server/db.ts` Actualizado

- ✅ Soporte para detección automática de tipo de base de datos
- ✅ Configuración específica para SQL Server
- ✅ Mantiene compatibilidad con PostgreSQL
- ✅ Pool de conexiones configurado

**Características**:
```typescript
// Detecta automáticamente el tipo de BD por la URL
const isSqlServer = DATABASE_URL.startsWith('mssql://');
const isPostgres = DATABASE_URL.startsWith('postgresql://');

// Configuración optimizada para SQL Server local
- encrypt: false
- trustServerCertificate: true
- Pool: max 10 conexiones
```

### 3. Archivo `drizzle.config.ts` Actualizado

⚠️ **Nota Importante**: Drizzle ORM no soporta SQL Server directamente.

**Implicaciones**:
- Las migraciones automáticas con `npm run db:push` **NO funcionarán**
- Debes crear las tablas manualmente en SQL Server
- Usa SQL Server Management Studio (SSMS) o Azure Data Studio

### 4. Archivo `.env.example` Actualizado

Ahora incluye la configuración de SQL Server como opción principal.

---

## 🚀 Cómo Usar

### Paso 1: Configurar Variables de Entorno

Copia el archivo `.env.example` a `.env`:

```bash
cp .env.example .env
```

El archivo `.env` debe contener:

```env
DATABASE_URL=mssql://sa:Str0ng!Passw0rd@localhost:1433/Xtask_dev
NODE_ENV=development
SESSION_SECRET=your-super-secret-session-key-change-this-in-production
PORT=5000
```

### Paso 2: Verificar SQL Server

Asegúrate de que SQL Server 2019 esté corriendo:

```bash
# En Windows (PowerShell)
Get-Service MSSQLSERVER

# O verifica la conexión
sqlcmd -S localhost -U sa -P "Str0ng!Passw0rd" -Q "SELECT @@VERSION"
```

### Paso 3: Crear la Base de Datos

Si la base de datos `Xtask_dev` no existe, créala:

```sql
CREATE DATABASE Xtask_dev;
GO

USE Xtask_dev;
GO
```

### Paso 4: Iniciar el Servidor

```bash
npm run dev
```

Deberías ver el mensaje:
```
✅ Conectado a SQL Server
```

---

## 📊 Crear Tablas en SQL Server

Ya que Drizzle ORM no soporta SQL Server, debes crear las tablas manualmente.

### Opción 1: Usar Azure Data Studio

1. Abre Azure Data Studio
2. Conéctate a `localhost` con usuario `sa`
3. Abre una nueva consulta
4. Ejecuta los scripts SQL de creación de tablas

### Opción 2: Usar SQL Server Management Studio (SSMS)

1. Abre SSMS
2. Conéctate a `localhost` con autenticación SQL
3. Crea las tablas necesarias

### Opción 3: Usar sqlcmd

```bash
sqlcmd -S localhost -U sa -P "Str0ng!Passw0rd" -d Xtask_dev -i create_tables.sql
```

---

## 📝 Script de Creación de Tablas

Necesitarás crear un script SQL basado en el schema de Drizzle. Aquí hay un ejemplo básico:

```sql
-- Ejemplo: Tabla de usuarios
CREATE TABLE users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    username NVARCHAR(255) NOT NULL UNIQUE,
    password NVARCHAR(255) NOT NULL,
    email NVARCHAR(255),
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE()
);

-- Ejemplo: Tabla de empleados
CREATE TABLE empleados (
    id INT IDENTITY(1,1) PRIMARY KEY,
    nombre NVARCHAR(255) NOT NULL,
    apellido NVARCHAR(255) NOT NULL,
    email NVARCHAR(255) UNIQUE,
    telefono NVARCHAR(50),
    fecha_contratacion DATE,
    salario DECIMAL(18,2),
    departamento NVARCHAR(100),
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE()
);

-- Agregar más tablas según tu schema...
```

---

## ⚠️ Limitaciones Actuales

### 1. Sin Drizzle ORM para SQL Server

**Problema**: Drizzle ORM no tiene soporte completo para SQL Server.

**Solución Actual**: 
- Usamos el driver `mssql` directamente
- Las consultas deben escribirse en SQL nativo
- No hay ORM type-safe para SQL Server

**Ejemplo de uso**:
```typescript
import { getSqlServerPool } from './db';

async function getEmpleados() {
  const pool = await getSqlServerPool();
  const result = await pool.request()
    .query('SELECT * FROM empleados');
  return result.recordset;
}
```

### 2. Sin Migraciones Automáticas

**Problema**: `npm run db:push` no funciona con SQL Server.

**Solución**: 
- Crear scripts SQL manualmente
- Usar herramientas de migración de SQL Server
- Considerar usar [Flyway](https://flywaydb.org/) o [Liquibase](https://www.liquibase.org/)

### 3. Código Existente Usa Drizzle

**Problema**: El código actual del proyecto usa Drizzle ORM para consultas.

**Solución a Futuro**:
- Opción A: Migrar consultas a SQL nativo con `mssql`
- Opción B: Usar PostgreSQL en lugar de SQL Server
- Opción C: Implementar un adaptador personalizado

---

## 🔄 Volver a PostgreSQL

Si necesitas volver a PostgreSQL:

### 1. Actualizar `.env`

```env
DATABASE_URL=postgresql://xtaskflow_user:XtaskFlow2024!@localhost:5432/xtaskflow_db
```

### 2. Reiniciar el Servidor

```bash
npm run dev
```

El sistema detectará automáticamente PostgreSQL y usará Drizzle ORM.

---

## 🛠️ Herramientas Recomendadas

### Para SQL Server

1. **Azure Data Studio** (Recomendado)
   - Multiplataforma (Windows, Mac, Linux)
   - Moderno y ligero
   - [Descargar](https://docs.microsoft.com/en-us/sql/azure-data-studio/download)

2. **SQL Server Management Studio (SSMS)**
   - Solo Windows
   - Completo y potente
   - [Descargar](https://docs.microsoft.com/en-us/sql/ssms/download-sql-server-management-studio-ssms)

3. **DBeaver**
   - Multiplataforma
   - Soporta múltiples bases de datos
   - [Descargar](https://dbeaver.io/)

---

## 📚 Documentación Relacionada

- **Azure Data Studio Setup**: `docs/AZURE_DATA_STUDIO_SETUP.md`
- **Diccionario de Datos**: `docs/diccionario_de_datos.md`
- **Setup Local**: `docs/SETUP_LOCAL.md`

---

## 🐛 Solución de Problemas

### Error: "Cannot connect to SQL Server"

**Causas comunes**:
1. SQL Server no está corriendo
2. Puerto 1433 bloqueado por firewall
3. Autenticación SQL Server no habilitada

**Soluciones**:

```bash
# Verificar que SQL Server esté corriendo
Get-Service MSSQLSERVER

# Iniciar SQL Server
Start-Service MSSQLSERVER

# Verificar conectividad
sqlcmd -S localhost -U sa -P "Str0ng!Passw0rd" -Q "SELECT 1"
```

### Error: "Login failed for user 'sa'"

**Causa**: Contraseña incorrecta o autenticación SQL no habilitada.

**Solución**:
1. Verifica la contraseña en SQL Server Configuration Manager
2. Asegúrate de que SQL Server esté en modo de autenticación mixta
3. Reinicia el servicio de SQL Server

### Error: "Database 'Xtask_dev' does not exist"

**Solución**:
```sql
CREATE DATABASE Xtask_dev;
```

### Error: "Connection timeout"

**Solución**:
1. Verifica que SQL Server esté escuchando en el puerto 1433
2. Desactiva el firewall temporalmente para probar
3. Configura una regla de firewall para el puerto 1433

---

## 📞 Soporte

Para más información sobre SQL Server:
- [Documentación oficial de SQL Server](https://docs.microsoft.com/en-us/sql/sql-server/)
- [Documentación de mssql para Node.js](https://www.npmjs.com/package/mssql)

---

## 🎯 Próximos Pasos Recomendados

1. **Crear Script de Migración**
   - [ ] Generar script SQL completo desde el schema de Drizzle
   - [ ] Crear todas las tablas necesarias
   - [ ] Insertar datos de prueba

2. **Adaptar Código Existente**
   - [ ] Identificar consultas que usan Drizzle ORM
   - [ ] Migrar a consultas SQL nativas con `mssql`
   - [ ] Crear helpers para consultas comunes

3. **Implementar Migraciones**
   - [ ] Configurar Flyway o Liquibase
   - [ ] Crear sistema de versionado de BD
   - [ ] Documentar proceso de migración

4. **Testing**
   - [ ] Probar todas las funcionalidades con SQL Server
   - [ ] Verificar rendimiento
   - [ ] Ajustar índices y optimizaciones

---

**Última actualización**: 13 de Octubre, 2025
