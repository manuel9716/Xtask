import sql from 'mssql';

const DATABASE_URL = 'mssql://sa:Str0ng!Passw0rd@localhost:1433/Xtask_dev';

async function seedEmployees() {
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

    // Verificar si ya hay empleados
    const checkResult = await pool.request().query(`
      SELECT COUNT(*) as count FROM employees
    `);

    if (checkResult.recordset[0].count > 0) {
      console.log(`⚠️  Ya hay ${checkResult.recordset[0].count} empleados registrados.`);
      console.log('¿Deseas continuar y agregar más empleados? (Ctrl+C para cancelar)\n');
    }

    // Obtener usuarios existentes
    const users = await pool.request().query(`
      SELECT TOP 5 id, username FROM users ORDER BY id
    `);

    console.log(`📊 Usuarios disponibles: ${users.recordset.length}\n`);

    const empleados = [
      {
        first_name: 'Juan',
        last_name: 'Pérez García',
        position: 'Gerente de Proyectos',
        department: 'Tecnología',
        identification: '1234567890',
        phone_number: '+57 300 123 4567',
        contract_status: 'activo',
        contract_type: 'indefinido',
        salary: 8000000,
        skills: 'Gestión de proyectos, Liderazgo, Scrum',
      },
      {
        first_name: 'María',
        last_name: 'González López',
        position: 'Desarrolladora Senior',
        department: 'Tecnología',
        identification: '9876543210',
        phone_number: '+57 301 234 5678',
        contract_status: 'activo',
        contract_type: 'indefinido',
        salary: 7000000,
        skills: 'React, Node.js, TypeScript, SQL',
      },
      {
        first_name: 'Carlos',
        last_name: 'Rodríguez Martínez',
        position: 'Arquitecto de Software',
        department: 'Tecnología',
        identification: '5555555555',
        phone_number: '+57 302 345 6789',
        contract_status: 'activo',
        contract_type: 'indefinido',
        salary: 9000000,
        skills: 'Arquitectura, Microservicios, Cloud, DevOps',
      },
      {
        first_name: 'Ana',
        last_name: 'Martínez Silva',
        position: 'Diseñadora UX/UI',
        department: 'Diseño',
        identification: '4444444444',
        phone_number: '+57 303 456 7890',
        contract_status: 'activo',
        contract_type: 'indefinido',
        salary: 5500000,
        skills: 'Figma, Adobe XD, Diseño de interfaces, Prototipado',
      },
      {
        first_name: 'Luis',
        last_name: 'Hernández Castro',
        position: 'Analista de Negocios',
        department: 'Finanzas',
        identification: '3333333333',
        phone_number: '+57 304 567 8901',
        contract_status: 'activo',
        contract_type: 'indefinido',
        salary: 6000000,
        skills: 'Análisis financiero, Excel, Power BI, SQL',
      },
      {
        first_name: 'Laura',
        last_name: 'Sánchez Ruiz',
        position: 'QA Tester',
        department: 'Tecnología',
        identification: '2222222222',
        phone_number: '+57 305 678 9012',
        contract_status: 'activo',
        contract_type: 'temporal',
        salary: 4500000,
        skills: 'Testing manual, Selenium, Cypress, Jira',
      },
      {
        first_name: 'Diego',
        last_name: 'Torres Vargas',
        position: 'Scrum Master',
        department: 'Tecnología',
        identification: '1111111111',
        phone_number: '+57 306 789 0123',
        contract_status: 'activo',
        contract_type: 'indefinido',
        salary: 7500000,
        skills: 'Scrum, Agile, Facilitación, Coaching',
      },
      {
        first_name: 'Patricia',
        last_name: 'Ramírez Ortiz',
        position: 'Gerente de Recursos Humanos',
        department: 'Recursos Humanos',
        identification: '6666666666',
        phone_number: '+57 307 890 1234',
        contract_status: 'activo',
        contract_type: 'indefinido',
        salary: 8500000,
        skills: 'Gestión de talento, Reclutamiento, Nómina',
      },
    ];

    console.log('📝 Insertando empleados...\n');

    for (let i = 0; i < empleados.length; i++) {
      const emp = empleados[i];
      const userId = users.recordset[i % users.recordset.length]?.id || null;

      await pool.request().query(`
        INSERT INTO employees (
          user_id,
          first_name,
          last_name,
          position,
          department,
          identification,
          phone_number,
          contract_status,
          contract_type,
          salary,
          skills,
          hire_date,
          created_at,
          address,
          emergency_contact,
          base_benefits,
          base_deductions,
          tax_rate
        ) VALUES (
          ${userId ? userId : 'NULL'},
          '${emp.first_name}',
          '${emp.last_name}',
          '${emp.position}',
          '${emp.department}',
          '${emp.identification}',
          '${emp.phone_number}',
          '${emp.contract_status}',
          '${emp.contract_type}',
          ${emp.salary},
          '${emp.skills}',
          GETDATE(),
          GETDATE(),
          'Dirección de ejemplo',
          'Contacto de emergencia',
          0,
          0,
          0.19
        )
      `);

      console.log(`  ✅ ${emp.first_name} ${emp.last_name} - ${emp.position}`);
    }

    // Verificar total
    const finalCount = await pool.request().query(`
      SELECT COUNT(*) as count FROM employees
    `);

    console.log(`\n✅ Total de empleados en la base de datos: ${finalCount.recordset[0].count}`);

    await pool.close();
    console.log('\n✅ Empleados creados exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

seedEmployees();
