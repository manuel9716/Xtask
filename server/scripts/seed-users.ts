import { db } from '../db';
import { users } from '@shared/schema';
import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';

// Función para crear hash de contraseña
async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

// Función principal para sembrar datos de usuarios
async function seedUsers() {
  try {
    console.log('Iniciando siembra de usuarios...');

    // Verificar si ya existen usuarios
    const existingUsers = await db.select().from(users);
    const count = existingUsers.length;

    if (count > 0) {
      console.log(`Ya existen ${count} usuarios en la base de datos. Omitiendo siembra.`);
      return;
    }

    // Usuarios de prueba (no usar en producción)
    const testUsers = [
      {
        username: 'admin',
        password: await hashPassword('admin123'),
        email: 'admin@xtask.com',
        fullName: 'Administrador XTask',
        role: 'admin',
        isActive: true
      },
      {
        username: 'usuario',
        password: await hashPassword('usuario123'),
        email: 'usuario@xtask.com',
        fullName: 'Usuario Regular',
        role: 'user',
        isActive: true
      },
      {
        username: 'gerente',
        password: await hashPassword('gerente123'),
        email: 'gerente@xtask.com',
        fullName: 'Gerente Departamento',
        role: 'manager',
        isActive: true
      }
    ];

    // Insertar usuarios
    const result = await db.insert(users).values(testUsers).returning();
    
    console.log(`Se han sembrado ${result.length} usuarios exitosamente`);
    result.forEach(user => {
      console.log(`- ${user.username} (${user.role}): ${user.email}`);
    });

  } catch (error) {
    console.error('Error al sembrar usuarios:', error);
  } finally {
    process.exit(0);
  }
}

// Ejecutar la función de siembra
seedUsers();