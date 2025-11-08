# 📝 Guía para Generar Schema de SQL Server

Ya que Drizzle ORM no soporta SQL Server directamente, necesitas crear las tablas manualmente.

## 🔍 Pasos para Generar el Schema

### 1. Revisar el Schema de Drizzle

El schema actual está en: `shared/schema.ts`

### 2. Convertir a SQL Server

Necesitas convertir manualmente cada tabla de Drizzle a sintaxis de SQL Server.

## 📋 Conversión de Tipos

### Tipos de Drizzle → SQL Server

| Drizzle | SQL Server |
|---------|------------|
| `serial()` | `INT IDENTITY(1,1)` |
| `integer()` | `INT` |
| `text()` | `NVARCHAR(MAX)` |
| `varchar(n)` | `NVARCHAR(n)` |
| `boolean()` | `BIT` |
| `timestamp()` | `DATETIME2` |
| `date()` | `DATE` |
| `decimal(p,s)` | `DECIMAL(p,s)` |
| `json()` | `NVARCHAR(MAX)` (JSON) |
| `uuid()` | `UNIQUEIDENTIFIER` |

### Ejemplo de Conversión

**Drizzle (TypeScript)**:
```typescript
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  email: varchar('email', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow(),
});
```

**SQL Server (SQL)**:
```sql
CREATE TABLE users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    username NVARCHAR(MAX) NOT NULL UNIQUE,
    email NVARCHAR(255),
    created_at DATETIME2 DEFAULT GETDATE()
);
```

## 🚀 Proceso Recomendado

### Opción 1: Manual

1. Abre `shared/schema.ts`
2. Por cada tabla, crea el equivalente en SQL
3. Ejecuta los scripts en Azure Data Studio

### Opción 2: Usar Herramienta de Conversión

Puedes usar herramientas online para ayudar con la conversión:
- [SQL Translator](https://www.sqltranslator.com/)
- [DB Fiddle](https://www.db-fiddle.com/)

### Opción 3: Generar desde PostgreSQL

Si tienes PostgreSQL funcionando:

1. Ejecuta `npm run db:push` con PostgreSQL
2. Exporta el schema de PostgreSQL
3. Usa herramientas de migración para convertir a SQL Server

## 📝 Template Básico

```sql
-- ============================================
-- XtaskFlow Database Schema
-- SQL Server 2019
-- ============================================

USE Xtask_dev;
GO

-- Tabla: users
CREATE TABLE users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    username NVARCHAR(255) NOT NULL UNIQUE,
    password NVARCHAR(255) NOT NULL,
    email NVARCHAR(255),
    role NVARCHAR(50) DEFAULT 'user',
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE()
);
GO

-- Tabla: empleados
CREATE TABLE empleados (
    id INT IDENTITY(1,1) PRIMARY KEY,
    nombre NVARCHAR(255) NOT NULL,
    apellido NVARCHAR(255) NOT NULL,
    email NVARCHAR(255) UNIQUE,
    telefono NVARCHAR(50),
    fecha_contratacion DATE,
    fecha_nacimiento DATE,
    salario DECIMAL(18,2),
    departamento NVARCHAR(100),
    puesto NVARCHAR(100),
    estado NVARCHAR(50) DEFAULT 'activo',
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE()
);
GO

-- Agregar índices
CREATE INDEX idx_empleados_email ON empleados(email);
CREATE INDEX idx_empleados_departamento ON empleados(departamento);
GO

-- Agregar más tablas según tu schema...
```

## 🔧 Herramientas Útiles

### Azure Data Studio

```bash
# Ejecutar script desde línea de comandos
sqlcmd -S localhost -U sa -P "Str0ng!Passw0rd" -d Xtask_dev -i schema.sql
```

### Verificar Tablas Creadas

```sql
-- Ver todas las tablas
SELECT TABLE_NAME 
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_TYPE = 'BASE TABLE';

-- Ver estructura de una tabla
EXEC sp_help 'empleados';
```

## 📚 Referencias

- [SQL Server Data Types](https://docs.microsoft.com/en-us/sql/t-sql/data-types/data-types-transact-sql)
- [CREATE TABLE Syntax](https://docs.microsoft.com/en-us/sql/t-sql/statements/create-table-transact-sql)
- [Identity Columns](https://docs.microsoft.com/en-us/sql/t-sql/statements/create-table-transact-sql-identity-property)

---

**Nota**: Si necesitas ayuda para convertir el schema completo, revisa el archivo `shared/schema.ts` y crea un issue con las tablas que necesitas convertir.
