import sql from 'mssql';

const DATABASE_URL = 'mssql://sa:Str0ng!Passw0rd@localhost:1433/Xtask_dev';

async function checkEmployees() {
  try {
    console.log('🔍 Conectando a SQL Server...');
    
    const urlParts = DATABASE_URL.replace('mssql://', '').split(/[@:/]/);
    const [user, password, host, port, database] = urlParts;

    const config: sql.config = {
      user,
      password,
      server: host,
      port: parseInt(port) || 1433,
      database,
      options: {
        encrypt: false,
        trustServerCertificate: true,
        enableArithAbort: true,
      },
    };

    const pool = await sql.connect(config);
    console.log('✅ Conectado a SQL Server\n');

    // Primero verificar la estructura de la tabla
    console.log('📋 Estructura de la tabla employees:');
    const columns = await pool.request().query(`
      SELECT COLUMN_NAME, DATA_TYPE
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'employees'
      ORDER BY ORDINAL_POSITION
    `);
    
    columns.recordset.forEach((col: any) => {
      console.log(`  - ${col.COLUMN_NAME} (${col.DATA_TYPE})`);
    });

    // Verificar empleados
    const result = await pool.request().query(`
      SELECT TOP 10 *
      FROM employees
    `);

    console.log(`\n📊 Total de empleados: ${result.recordset.length}\n`);

    if (result.recordset.length > 0) {
      console.log('Empleados registrados:');
      result.recordset.forEach((emp: any) => {
        console.log(`  - ID: ${emp.id} | ${JSON.stringify(emp).substring(0, 100)}...`);
      });
    } else {
      console.log('⚠️  No hay empleados registrados en la base de datos.');
    }

    await pool.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkEmployees();
