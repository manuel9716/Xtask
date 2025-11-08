import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config({ path: join(__dirname, '../../.env') });

import { getSqlServerPool } from '../db';

async function setupNominaTables() {
  try {
    console.log('🔍 Verificando tablas de nómina en SQL Server...');
    const pool = await getSqlServerPool();

    // Verificar si la tabla nominas existe
    const checkNominasTable = await pool.request().query(`
      SELECT COUNT(*) as count 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_NAME = 'nominas'
    `);

    const nominasExists = checkNominasTable.recordset[0].count > 0;
    console.log(`Tabla 'nominas': ${nominasExists ? '✅ Existe' : '❌ No existe'}`);

    // Verificar si la tabla nomina_detalles existe
    const checkDetallesTable = await pool.request().query(`
      SELECT COUNT(*) as count 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_NAME = 'nomina_detalles'
    `);

    const detallesExists = checkDetallesTable.recordset[0].count > 0;
    console.log(`Tabla 'nomina_detalles': ${detallesExists ? '✅ Existe' : '❌ No existe'}`);

    // Crear tabla nominas si no existe
    if (!nominasExists) {
      console.log('📝 Creando tabla nominas...');
      await pool.request().query(`
        CREATE TABLE nominas (
          id INT IDENTITY(1,1) PRIMARY KEY,
          titulo NVARCHAR(255),
          periodo_inicio DATETIME NOT NULL,
          periodo_fin DATETIME NOT NULL,
          total DECIMAL(18,2) DEFAULT 0,
          estado NVARCHAR(50) DEFAULT 'PENDIENTE',
          fecha_creacion DATETIME DEFAULT GETDATE(),
          fecha_actualizacion DATETIME DEFAULT GETDATE()
        )
      `);
      console.log('✅ Tabla nominas creada exitosamente');
    }

    // Crear tabla nomina_detalles si no existe
    if (!detallesExists) {
      console.log('📝 Creando tabla nomina_detalles...');
      await pool.request().query(`
        CREATE TABLE nomina_detalles (
          id INT IDENTITY(1,1) PRIMARY KEY,
          nomina_id INT NOT NULL,
          empleado_id INT NOT NULL,
          salario_base DECIMAL(18,2) DEFAULT 0,
          bonificaciones DECIMAL(18,2) DEFAULT 0,
          deducciones DECIMAL(18,2) DEFAULT 0,
          total DECIMAL(18,2) DEFAULT 0,
          fecha_creacion DATETIME DEFAULT GETDATE(),
          CONSTRAINT FK_nomina_detalles_nomina FOREIGN KEY (nomina_id) REFERENCES nominas(id) ON DELETE CASCADE
        )
      `);
      console.log('✅ Tabla nomina_detalles creada exitosamente');
    }

    // Verificar si hay datos en nominas
    const countNominas = await pool.request().query(`
      SELECT COUNT(*) as count FROM nominas
    `);

    const totalNominas = countNominas.recordset[0].count;
    console.log(`\n📊 Total de nóminas en la base de datos: ${totalNominas}`);

    // Si no hay nóminas, crear datos de prueba
    if (totalNominas === 0) {
      console.log('\n📝 Creando nóminas de prueba...');
      
      // Verificar si hay empleados
      const checkEmpleados = await pool.request().query(`
        SELECT COUNT(*) as count FROM empleados
      `);
      
      const totalEmpleados = checkEmpleados.recordset[0].count;
      
      if (totalEmpleados === 0) {
        console.log('⚠️  No hay empleados en la base de datos. Primero debes crear empleados.');
      } else {
        // Obtener algunos empleados
        const empleados = await pool.request().query(`
          SELECT TOP 5 id, nombre, apellido FROM empleados
        `);

        // Crear nómina de prueba para el mes actual
        const hoy = new Date();
        const primerDia = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        const ultimoDia = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);

        const insertNomina = await pool.request().query(`
          INSERT INTO nominas (titulo, periodo_inicio, periodo_fin, total, estado)
          OUTPUT INSERTED.id
          VALUES (
            'Nómina ${hoy.toLocaleString('es-ES', { month: 'long', year: 'numeric' })}',
            '${primerDia.toISOString()}',
            '${ultimoDia.toISOString()}',
            0,
            'PENDIENTE'
          )
        `);

        const nominaId = insertNomina.recordset[0].id;
        console.log(`✅ Nómina creada con ID: ${nominaId}`);

        // Agregar detalles para cada empleado
        let totalNomina = 0;
        for (const emp of empleados.recordset) {
          const salarioBase = 3000000 + Math.random() * 2000000; // Salario entre 3M y 5M
          const bonificaciones = Math.random() * 500000; // Bonificación hasta 500K
          const deducciones = salarioBase * 0.08; // 8% de deducciones
          const total = salarioBase + bonificaciones - deducciones;
          totalNomina += total;

          await pool.request().query(`
            INSERT INTO nomina_detalles (nomina_id, empleado_id, salario_base, bonificaciones, deducciones, total)
            VALUES (${nominaId}, ${emp.id}, ${salarioBase}, ${bonificaciones}, ${deducciones}, ${total})
          `);
          
          console.log(`  ✅ Detalle agregado para ${emp.nombre} ${emp.apellido}`);
        }

        // Actualizar el total de la nómina
        await pool.request().query(`
          UPDATE nominas SET total = ${totalNomina} WHERE id = ${nominaId}
        `);

        console.log(`✅ Total de nómina actualizado: $${totalNomina.toFixed(2)}`);

        // Crear una nómina del mes anterior (pagada)
        const mesAnterior = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1);
        const ultimoDiaMesAnterior = new Date(hoy.getFullYear(), hoy.getMonth(), 0);

        const insertNominaAnterior = await pool.request().query(`
          INSERT INTO nominas (titulo, periodo_inicio, periodo_fin, total, estado)
          OUTPUT INSERTED.id
          VALUES (
            'Nómina ${mesAnterior.toLocaleString('es-ES', { month: 'long', year: 'numeric' })}',
            '${mesAnterior.toISOString()}',
            '${ultimoDiaMesAnterior.toISOString()}',
            ${totalNomina * 0.95},
            'PAGADA'
          )
        `);

        console.log(`✅ Nómina anterior creada con ID: ${insertNominaAnterior.recordset[0].id}`);
      }
    }

    console.log('\n✅ Configuración de tablas de nómina completada');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error configurando tablas de nómina:', error);
    process.exit(1);
  }
}

setupNominaTables();
