import sql from 'mssql';

const DATABASE_URL = 'mssql://sa:Str0ng!Passw0rd@localhost:1433/Xtask_dev';

async function testDashboard() {
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

    // Obtener empleados activos
    const empleadosResult = await pool.request().query(`
      SELECT 
        id,
        first_name,
        last_name,
        position,
        department,
        identification,
        hire_date,
        contract_status,
        contract_type,
        salary,
        phone_number,
        address,
        emergency_contact
      FROM employees
      WHERE contract_status = 'activo'
      ORDER BY first_name, last_name
    `);

    console.log(`📊 Empleados encontrados: ${empleadosResult.recordset.length}\n`);

    const empleados = empleadosResult.recordset.map((emp: any) => ({
      id: emp.id,
      nombre: emp.first_name,
      apellido: emp.last_name,
      identificacion: emp.identification,
      depto: emp.department,
      cargo: emp.position,
      fecha_ingreso: emp.hire_date,
      estado_contrato: emp.contract_status,
      tipo_contrato: emp.contract_type,
      telefono: emp.phone_number,
      direccion: emp.address,
      contacto_emergencia: emp.emergency_contact,
      nomina: {
        sueldo_base: emp.salary || 0,
        frecuencia_pago: 'Mensual',
        metodo_pago: 'Transferencia Bancaria'
      },
      proyectos: []
    }));

    const totalNominaMensual = empleados.reduce((sum: number, emp: any) => sum + (emp.nomina?.sueldo_base || 0), 0);

    const data = {
      kpis: {
        empleadosActivos: empleados.length,
        nominaMensual: totalNominaMensual,
        bonificacionesMes: 0,
        porcentajePagadas: 0,
        proximaFechaPago: null
      },
      timeline: [],
      charts: {
        gastoPorProyecto: [],
        sueldosVsBonos: [
          { name: 'Sueldos', value: totalNominaMensual },
          { name: 'Bonos', value: 0 }
        ],
        historico6Meses: []
      },
      calendar: [],
      nominasRecientes: [],
      empleados: empleados
    };

    console.log('✅ Datos del dashboard:');
    console.log(JSON.stringify(data, null, 2));

    await pool.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testDashboard();
