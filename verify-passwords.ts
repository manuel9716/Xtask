import 'dotenv/config';
import sql from 'mssql';
import bcrypt from 'bcrypt';

async function verify() {
  let pool: sql.ConnectionPool | null = null;
  
  try {
    const dbUrl = process.env.DATABASE_URL!;
    const urlParts = dbUrl.replace('mssql://', '').split(/[@:/]/);
    const [dbUser, dbPass, host, port, database] = urlParts;
    
    const config: sql.config = {
      user: dbUser,
      password: dbPass,
      server: host,
      port: parseInt(port) || 1433,
      database: database,
      options: {
        encrypt: false,
        trustServerCertificate: true,
        enableArithAbort: true,
      },
    };
    
    console.log('🔌 Conectando a SQL Server...\n');
    pool = new sql.ConnectionPool(config);
    await pool.connect();
    
    // Verificar admin
    const adminResult = await pool.request()
      .input('username', sql.NVarChar, 'admin')
      .query('SELECT * FROM users WHERE username = @username');
    
    if (adminResult.recordset.length > 0) {
      const admin = adminResult.recordset[0];
      const isValid = await bcrypt.compare('admin123', admin.password);
      console.log('👤 Usuario: admin');
      console.log('   Hash:', admin.password.substring(0, 30) + '...');
      console.log('   Password "admin123":', isValid ? '✅ VÁLIDA' : '❌ INVÁLIDA');
    }
    
    console.log('');
    
    // Verificar viky
    const vikyResult = await pool.request()
      .input('username', sql.NVarChar, 'viky')
      .query('SELECT * FROM users WHERE username = @username');
    
    if (vikyResult.recordset.length > 0) {
      const viky = vikyResult.recordset[0];
      const isValid = await bcrypt.compare('admin123', viky.password);
      console.log('👤 Usuario: viky');
      console.log('   Hash:', viky.password.substring(0, 30) + '...');
      console.log('   Password "admin123":', isValid ? '✅ VÁLIDA' : '❌ INVÁLIDA');
    }
    
    await pool.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    if (pool) await pool.close();
    process.exit(1);
  }
}

verify();
