/**
 * Script para actualizar contraseñas de usuarios en SQL Server
 * Uso: npx tsx infrastructure/scripts/update-user-password.ts
 */

import 'dotenv/config';
import sql from 'mssql';

async function updateUserPassword(username: string, password: string) {
  let pool: sql.ConnectionPool | null = null;
  
  try {
    // Parsear DATABASE_URL
    const dbUrl = process.env.DATABASE_URL!;
    const urlParts = dbUrl.replace('mssql://', '').split(/[@:/]/);
    const [user, pass, host, port, database] = urlParts;
    
    // Configurar conexión
    const config: sql.config = {
      user: user,
      password: pass,
      server: host,
      port: parseInt(port) || 1433,
      database: database,
      options: {
        encrypt: false,
        trustServerCertificate: true,
        enableArithAbort: true,
      },
    };
    
    console.log(`🔌 Conectando a SQL Server...`);
    pool = new sql.ConnectionPool(config);
    await pool.connect();
    console.log(`✅ Conectado a SQL Server`);
    
    // Generar hash bcrypt de "admin123"
    const bcrypt = await import('bcrypt');
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log(`🔐 Hash generado para: ${password}`);
    
    const result = await pool.request()
      .input('username', sql.NVarChar, username)
      .input('password', sql.NVarChar, hashedPassword)
      .query(`
        UPDATE users 
        SET [password] = @password
        OUTPUT INSERTED.id, INSERTED.username, INSERTED.email, INSERTED.role
        WHERE username = @username
      `);
    
    if (result.recordset.length > 0) {
      console.log('\n✅ Contraseña actualizada exitosamente:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`Usuario: ${result.recordset[0].username}`);
      console.log(`Email: ${result.recordset[0].email}`);
      console.log(`Role: ${result.recordset[0].role}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`\n🔐 Nueva contraseña: ${password}`);
      console.log(`\n💡 Ahora puedes hacer login con:`);
      console.log(`   Usuario: ${username}`);
      console.log(`   Contraseña: ${password}`);
    } else {
      console.log(`\n❌ Usuario '${username}' no encontrado`);
    }
    
    await pool.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error actualizando contraseña:', error);
    if (pool) {
      await pool.close();
    }
    process.exit(1);
  }
}

// Actualizar contraseña de viky
console.log('🔧 Actualizando contraseña de usuario...\n');
updateUserPassword('viky', 'admin123');
