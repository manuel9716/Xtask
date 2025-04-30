import { AuthRepository } from '../../domain/repositories/AuthRepository';
import { LoginCredentials, AuthResponse, Usuario } from '../../domain/entities/Usuario';
import { db } from '@/server/db';
import { users } from '@/shared/schema';
import { eq, or } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Implementación del repositorio que usa la base de datos directamente
// Esta clase se usaría principalmente en el backend, no en el frontend
export class AuthDbAdapter implements AuthRepository {
  private readonly JWT_SECRET = process.env.JWT_SECRET || 'xtask-secret-key';
  private readonly TOKEN_EXPIRY = '8h';

  async authenticate(credentials: LoginCredentials): Promise<AuthResponse> {
    const { identifier, password } = credentials;

    // Buscar usuario por email o username
    const [user] = await db
      .select()
      .from(users)
      .where(
        or(
          eq(users.email, identifier),
          eq(users.username, identifier)
        )
      )
      .limit(1);

    if (!user) {
      throw new Error('Credenciales incorrectas');
    }

    // Verificar si la cuenta está activa
    if (!user.isActive) {
      throw new Error('Esta cuenta ha sido desactivada');
    }

    // Verificar la contraseña
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      throw new Error('Credenciales incorrectas');
    }

    // Generar token JWT
    const token = jwt.sign(
      { 
        userId: user.id,
        username: user.username, 
        role: user.role 
      },
      this.JWT_SECRET,
      { expiresIn: this.TOKEN_EXPIRY }
    );

    // Crear respuesta sin incluir la contraseña
    const { password: _, ...userWithoutPassword } = user;
    
    return {
      user: userWithoutPassword as Omit<Usuario, 'password'>,
      token
    };
  }

  async validateToken(token: string): Promise<boolean> {
    try {
      jwt.verify(token, this.JWT_SECRET);
      return true;
    } catch (error) {
      return false;
    }
  }

  async getUserByToken(token: string): Promise<Omit<Usuario, 'password'> | null> {
    try {
      // Verificar y decodificar el token
      const decoded = jwt.verify(token, this.JWT_SECRET) as { userId: number };
      
      // Buscar el usuario por ID
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, decoded.userId))
        .limit(1);
      
      if (!user) {
        return null;
      }
      
      // Excluir la contraseña
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword as Omit<Usuario, 'password'>;
    } catch (error) {
      return null;
    }
  }

  async logout(token: string): Promise<void> {
    // En un sistema con JWT simplemente no hacemos nada en el servidor
    // La invalidación sucede en el cliente al eliminar el token
    return;
    
    // En un sistema más complejo, podríamos implementar una lista negra de tokens
    // await this.blacklistToken(token);
  }
}