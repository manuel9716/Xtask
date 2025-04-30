import { execSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

// Función principal para inicializar la base de datos
async function initDatabase() {
  try {
    console.log('==============================================');
    console.log('Iniciando la inicialización de la base de datos');
    console.log('==============================================');

    // Paso 1: Ejecutar migración de schema
    console.log('\n[PASO 1] Ejecutando migración de esquema...');
    try {
      // Usar drizzle-kit para aplicar la migración
      execSync('npm run db:push', { stdio: 'inherit' });
      console.log('✅ Migración de esquema completada exitosamente');
    } catch (error) {
      console.error('❌ Error al ejecutar la migración de esquema:', error);
      process.exit(1);
    }

    // Paso 2: Sembrar datos de usuarios
    console.log('\n[PASO 2] Sembrando datos de usuarios...');
    try {
      // Ejecutar script de siembra de usuarios
      execSync('npx tsx server/scripts/seed-users.ts', { stdio: 'inherit' });
      console.log('✅ Siembra de usuarios completada exitosamente');
    } catch (error) {
      console.error('❌ Error al sembrar usuarios:', error);
      process.exit(1);
    }

    console.log('\n==============================================');
    console.log('✅ Inicialización de la base de datos completada');
    console.log('==============================================');
  } catch (error) {
    console.error('ERROR GENERAL:', error);
    process.exit(1);
  }
}

// Ejecutar la función de inicialización
initDatabase();