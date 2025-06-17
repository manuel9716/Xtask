import { Router, Request, Response } from "express";
import { db } from "../db";
import { userSkills, users } from "@shared/schema";
import { eq, and } from "drizzle-orm";
import jwt from 'jsonwebtoken';

const habilidadesRouter = Router();

// Middleware de autenticación
function isAuthenticated(req: Request, res: Response, next: Function) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: "No autorizado: Token requerido" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'xtask-secret-key') as { userId: number };
    req.user = { id: decoded.userId } as any;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Token inválido o expirado" });
  }
}

/**
 * Obtiene todas las habilidades de un usuario específico
 * GET /api/habilidades/:userId
 */
habilidadesRouter.get("/:userId", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    const currentUserId = req.user?.id;

    if (isNaN(userId)) {
      return res.status(400).json({ error: "ID de usuario inválido" });
    }

    // Verificar permisos: solo el propio usuario o un admin puede ver las habilidades
    // Por ahora permitimos que cualquier usuario autenticado vea las habilidades
    // En el futuro se puede implementar validación de roles más estricta

    const habilidades = await db
      .select()
      .from(userSkills)
      .where(eq(userSkills.userId, userId))
      .orderBy(userSkills.tipo, userSkills.nombre);

    // Agrupar habilidades por tipo
    const habilidadesAgrupadas = habilidades.reduce((acc, habilidad) => {
      const tipo = habilidad.tipo;
      if (!acc[tipo]) {
        acc[tipo] = [];
      }
      acc[tipo].push(habilidad);
      return acc;
    }, {} as Record<string, typeof habilidades>);

    res.json(habilidadesAgrupadas);
  } catch (error: any) {
    console.error("Error al obtener habilidades:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Crea una nueva habilidad para un usuario
 * POST /api/habilidades
 */
habilidadesRouter.post("/", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { userId, tipo, nombre, nivel, observaciones } = req.body;
    const currentUserId = req.user?.id;

    // Validar datos requeridos
    if (!userId || !tipo || !nombre || !nivel) {
      return res.status(400).json({ 
        error: "Faltan campos requeridos: userId, tipo, nombre, nivel" 
      });
    }

    // Verificar que el tipo sea válido
    const tiposValidos = ["herramienta", "habilidad_blanda", "conocimiento", "idioma"];
    if (!tiposValidos.includes(tipo)) {
      return res.status(400).json({ 
        error: "Tipo de habilidad inválido. Debe ser: " + tiposValidos.join(", ") 
      });
    }

    // Verificar que el nivel sea válido
    const nivelesValidos = ["básico", "intermedio", "avanzado", "experto"];
    if (!nivelesValidos.includes(nivel)) {
      return res.status(400).json({ 
        error: "Nivel de habilidad inválido. Debe ser: " + nivelesValidos.join(", ") 
      });
    }

    // Verificar permisos: solo el propio usuario puede agregar habilidades a su perfil
    // Por ahora, cualquier usuario autenticado puede agregar habilidades a cualquier usuario
    // En el futuro se puede restringir más

    // Verificar que el usuario existe
    const [usuario] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));

    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Verificar que no exista ya una habilidad con el mismo nombre y tipo para este usuario
    const [habilidadExistente] = await db
      .select()
      .from(userSkills)
      .where(
        and(
          eq(userSkills.userId, userId),
          eq(userSkills.tipo, tipo),
          eq(userSkills.nombre, nombre)
        )
      );

    if (habilidadExistente) {
      return res.status(400).json({ 
        error: "Ya existe una habilidad con este nombre y tipo para el usuario" 
      });
    }

    // Crear la nueva habilidad
    const [nuevaHabilidad] = await db
      .insert(userSkills)
      .values({
        userId,
        tipo,
        nombre,
        nivel,
        observaciones: observaciones || null,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();

    res.status(201).json(nuevaHabilidad);
  } catch (error: any) {
    console.error("Error al crear habilidad:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Actualiza una habilidad existente
 * PATCH /api/habilidades/:id
 */
habilidadesRouter.patch("/:id", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { tipo, nombre, nivel, observaciones } = req.body;
    const currentUserId = req.user?.id;

    if (isNaN(id)) {
      return res.status(400).json({ error: "ID de habilidad inválido" });
    }

    // Verificar que la habilidad existe
    const [habilidadExistente] = await db
      .select()
      .from(userSkills)
      .where(eq(userSkills.id, id));

    if (!habilidadExistente) {
      return res.status(404).json({ error: "Habilidad no encontrada" });
    }

    // Verificar permisos: solo el propietario puede editar sus habilidades
    // Por ahora permitimos editar a cualquier usuario autenticado
    // En el futuro se puede restringir más

    // Validar tipos y niveles si se proporcionan
    if (tipo) {
      const tiposValidos = ["herramienta", "habilidad_blanda", "conocimiento", "idioma"];
      if (!tiposValidos.includes(tipo)) {
        return res.status(400).json({ 
          error: "Tipo de habilidad inválido. Debe ser: " + tiposValidos.join(", ") 
        });
      }
    }

    if (nivel) {
      const nivelesValidos = ["básico", "intermedio", "avanzado", "experto"];
      if (!nivelesValidos.includes(nivel)) {
        return res.status(400).json({ 
          error: "Nivel de habilidad inválido. Debe ser: " + nivelesValidos.join(", ") 
        });
      }
    }

    // Construir objeto de actualización
    const datosActualizacion: any = {
      updatedAt: new Date()
    };

    if (tipo !== undefined) datosActualizacion.tipo = tipo;
    if (nombre !== undefined) datosActualizacion.nombre = nombre;
    if (nivel !== undefined) datosActualizacion.nivel = nivel;
    if (observaciones !== undefined) datosActualizacion.observaciones = observaciones;

    // Actualizar la habilidad
    const [habilidadActualizada] = await db
      .update(userSkills)
      .set(datosActualizacion)
      .where(eq(userSkills.id, id))
      .returning();

    res.json(habilidadActualizada);
  } catch (error: any) {
    console.error("Error al actualizar habilidad:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Elimina una habilidad
 * DELETE /api/habilidades/:id
 */
habilidadesRouter.delete("/:id", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const currentUserId = req.user?.id;

    if (isNaN(id)) {
      return res.status(400).json({ error: "ID de habilidad inválido" });
    }

    // Verificar que la habilidad existe
    const [habilidadExistente] = await db
      .select()
      .from(userSkills)
      .where(eq(userSkills.id, id));

    if (!habilidadExistente) {
      return res.status(404).json({ error: "Habilidad no encontrada" });
    }

    // Verificar permisos: solo el propietario puede eliminar sus habilidades
    // Por ahora permitimos eliminar a cualquier usuario autenticado
    // En el futuro se puede restringir más

    // Eliminar la habilidad
    await db
      .delete(userSkills)
      .where(eq(userSkills.id, id));

    res.json({ success: true, message: "Habilidad eliminada correctamente" });
  } catch (error: any) {
    console.error("Error al eliminar habilidad:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Obtiene todas las habilidades del usuario actual
 * GET /api/habilidades/mis-habilidades
 */
habilidadesRouter.get("/mis-habilidades", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    const habilidades = await db
      .select()
      .from(userSkills)
      .where(eq(userSkills.userId, userId as number))
      .orderBy(userSkills.tipo, userSkills.nombre);

    // Agrupar habilidades por tipo
    const habilidadesAgrupadas = habilidades.reduce((acc, habilidad) => {
      const tipo = habilidad.tipo;
      if (!acc[tipo]) {
        acc[tipo] = [];
      }
      acc[tipo].push(habilidad);
      return acc;
    }, {} as Record<string, typeof habilidades>);

    res.json(habilidadesAgrupadas);
  } catch (error: any) {
    console.error("Error al obtener mis habilidades:", error);
    res.status(500).json({ error: error.message });
  }
});

export default habilidadesRouter;