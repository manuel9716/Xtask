import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
const { Pool } = pkg;
import sql from 'mssql';
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Detectar el tipo de base de datos por la URL
const isPostgres = process.env.DATABASE_URL.startsWith('postgresql://');
const isSqlServer = process.env.DATABASE_URL.startsWith('mssql://');

let db: any;
let pool: any;
let sqlServerPool: sql.ConnectionPool | null = null;

// Función para inicializar la conexión a SQL Server
async function initSqlServer() {
  // Formato: mssql://user:password@host:port/database
  const urlParts = process.env.DATABASE_URL!.replace('mssql://', '').split(/[@:/]/);
  const [user, password, host, port, database] = urlParts;

  const config: sql.config = {
    user: user,
    password: password,
    server: host,
    port: parseInt(port) || 1433,
    database: database,
    options: {
      encrypt: false, // Para SQL Server local
      trustServerCertificate: true,
      enableArithAbort: true,
    },
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 30000,
    },
  };

  sqlServerPool = new sql.ConnectionPool(config);
  
  try {
    await sqlServerPool.connect();
    console.log('✅ Conectado a SQL Server');
    return sqlServerPool;
  } catch (err) {
    console.error('❌ Error conectando a SQL Server:', err);
    throw err;
  }
}

if (isSqlServer) {
  // Para SQL Server, exportamos el pool directamente
  // No usamos Drizzle ORM ya que no tiene soporte completo para SQL Server
  pool = initSqlServer();
  db = null; // No usamos Drizzle para SQL Server por ahora

} else if (isPostgres) {
  // Configuración para PostgreSQL (código original)
  pool = new Pool({ 
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  db = drizzle(pool, { schema });
  console.log('✅ Conectado a PostgreSQL');

} else {
  throw new Error('DATABASE_URL debe comenzar con postgresql:// o mssql://');
}

// Helper para obtener el pool de SQL Server
export async function getSqlServerPool(): Promise<sql.ConnectionPool> {
  if (sqlServerPool) {
    return sqlServerPool;
  }
  return await initSqlServer();
}

export { db, pool, isSqlServer, isPostgres };
