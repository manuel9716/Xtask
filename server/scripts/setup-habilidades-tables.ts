import sql from 'mssql';

const DATABASE_URL = 'mssql://sa:Str0ng!Passw0rd@localhost:1433/Xtask_dev';

async function setupHabilidadesTables() {
  try {
    console.log('🔍 Conectando a SQL Server...');
    
    // Parsear la URL
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

    // Verificar si la tabla user_skills existe
    const checkTable = await pool.request().query(`
      SELECT COUNT(*) as count 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_NAME = 'user_skills'
    `);

    const tableExists = checkTable.recordset[0].count > 0;
    console.log(`Tabla 'user_skills': ${tableExists ? '✅ Existe' : '❌ No existe'}`);

    // Crear tabla user_skills si no existe
    if (!tableExists) {
      console.log('\n📝 Creando tabla user_skills...');
      await pool.request().query(`
        CREATE TABLE user_skills (
          id INT IDENTITY(1,1) PRIMARY KEY,
          user_id INT NOT NULL,
          skill_name NVARCHAR(255) NOT NULL,
          skill_level NVARCHAR(50) DEFAULT 'Básico',
          tipo NVARCHAR(100) DEFAULT 'general',
          years_experience INT DEFAULT 0,
          description NVARCHAR(MAX),
          created_at DATETIME DEFAULT GETDATE(),
          updated_at DATETIME DEFAULT GETDATE(),
          CONSTRAINT FK_user_skills_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);
      console.log('✅ Tabla user_skills creada exitosamente\n');

      // Crear índices
      await pool.request().query(`
        CREATE INDEX IDX_user_skills_user_id ON user_skills(user_id);
        CREATE INDEX IDX_user_skills_tipo ON user_skills(tipo);
      `);
      console.log('✅ Índices creados\n');
    }

    // Verificar si hay datos en user_skills
    const countSkills = await pool.request().query(`
      SELECT COUNT(*) as count FROM user_skills
    `);

    const totalSkills = countSkills.recordset[0].count;
    console.log(`📊 Total de habilidades en la base de datos: ${totalSkills}`);

    // Si no hay habilidades, crear datos de prueba
    if (totalSkills === 0) {
      console.log('\n📝 Creando habilidades de prueba...');
      
      // Verificar si hay usuarios
      const checkUsers = await pool.request().query(`
        SELECT COUNT(*) as count FROM users
      `);
      
      const totalUsers = checkUsers.recordset[0].count;
      
      if (totalUsers === 0) {
        console.log('⚠️  No hay usuarios en la base de datos. Primero debes crear usuarios.');
      } else {
        // Obtener algunos usuarios
        const users = await pool.request().query(`
          SELECT TOP 2 id, username FROM users
        `);

        const habilidadesPorTipo = {
          'Técnicas': [
            { name: 'JavaScript', level: 'Avanzado', years: 5 },
            { name: 'TypeScript', level: 'Avanzado', years: 3 },
            { name: 'React', level: 'Avanzado', years: 4 },
            { name: 'Node.js', level: 'Intermedio', years: 3 },
            { name: 'SQL Server', level: 'Intermedio', years: 2 },
          ],
          'Blandas': [
            { name: 'Trabajo en equipo', level: 'Avanzado', years: 5 },
            { name: 'Comunicación', level: 'Avanzado', years: 5 },
            { name: 'Liderazgo', level: 'Intermedio', years: 3 },
          ],
          'Idiomas': [
            { name: 'Español', level: 'Nativo', years: 20 },
            { name: 'Inglés', level: 'Avanzado', years: 10 },
          ]
        };

        for (const user of users.recordset) {
          console.log(`\n  Agregando habilidades para usuario: ${user.username}`);
          
          for (const [tipo, habilidades] of Object.entries(habilidadesPorTipo)) {
            for (const habilidad of habilidades) {
              await pool.request().query(`
                INSERT INTO user_skills (user_id, skill_name, skill_level, tipo, years_experience, description)
                VALUES (
                  ${user.id}, 
                  '${habilidad.name}', 
                  '${habilidad.level}', 
                  '${tipo}', 
                  ${habilidad.years},
                  'Habilidad de prueba para ${user.username}'
                )
              `);
            }
            console.log(`    ✅ ${habilidades.length} habilidades de tipo "${tipo}" agregadas`);
          }
        }

        console.log(`\n✅ Habilidades de prueba creadas para ${users.recordset.length} usuarios`);
      }
    }

    await pool.close();
    console.log('\n✅ Configuración de tablas de habilidades completada');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error configurando tablas de habilidades:', error);
    process.exit(1);
  }
}

setupHabilidadesTables();
