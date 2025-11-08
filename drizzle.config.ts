import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

// Detectar el tipo de base de datos
const isSqlServer = process.env.DATABASE_URL.startsWith('mssql://');

if (isSqlServer) {
  console.warn('⚠️  Drizzle Kit no soporta SQL Server directamente.');
  console.warn('⚠️  Las migraciones deben manejarse manualmente para SQL Server.');
  console.warn('⚠️  Usa scripts SQL directos o herramientas como SQL Server Management Studio.');
}

// Configuración para PostgreSQL (por defecto)
// Nota: Si usas SQL Server, este archivo no se usará para migraciones
export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL.startsWith('postgresql://') 
      ? process.env.DATABASE_URL 
      : 'postgresql://dummy:dummy@localhost:5432/dummy', // Dummy para evitar errores
  },
});
