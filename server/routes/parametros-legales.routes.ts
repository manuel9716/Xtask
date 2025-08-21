import { Router } from "express";
import { db } from "../db";
import { parametrosLegales } from "@shared/schema";
import { eq, and } from "drizzle-orm";

const router = Router();

// GET /api/parametros-legales - Obtener parámetros legales vigentes
router.get("/", async (req, res) => {
  try {
    const año = req.query.año ? parseInt(req.query.año as string) : new Date().getFullYear();
    
    const [parametros] = await db.select()
      .from(parametrosLegales)
      .where(
        and(
          eq(parametrosLegales.año, año),
          eq(parametrosLegales.activo, true)
        )
      );

    if (!parametros) {
      // Crear parámetros por defecto para el año actual
      const parametrosDefecto = {
        año,
        salarioMinimo: "1300000", // Salario mínimo 2024 Colombia
        auxilioTransporte: "162000", // Auxilio de transporte 2024
        uvt: "47065", // UVT 2024
        salud: "4.0",
        pension: "4.0",
        arlPorcentajes: JSON.stringify({
          "1": "0.522",
          "2": "1.044", 
          "3": "2.436",
          "4": "4.350",
          "5": "6.960"
        }),
        vigenciaDesde: new Date(`${año}-01-01`),
        vigenciaHasta: new Date(`${año}-12-31`),
        activo: true,
        createdAt: new Date()
      };

      const [nuevoParametro] = await db.insert(parametrosLegales)
        .values(parametrosDefecto)
        .returning();

      return res.json(nuevoParametro);
    }

    res.json(parametros);
  } catch (error) {
    console.error("Error obteniendo parámetros legales:", error);
    res.status(500).json({ 
      error: "Error interno del servidor",
      message: error instanceof Error ? error.message : "Error desconocido"
    });
  }
});

// POST /api/parametros-legales - Crear o actualizar parámetros legales
router.post("/", async (req, res) => {
  try {
    const parametrosData = req.body;
    
    // Verificar si ya existen parámetros para el año
    const existentes = await db.select()
      .from(parametrosLegales)
      .where(eq(parametrosLegales.año, parametrosData.año));

    if (existentes.length > 0) {
      // Actualizar existentes
      const [parametros] = await db.update(parametrosLegales)
        .set({ ...parametrosData, activo: false })
        .where(eq(parametrosLegales.año, parametrosData.año))
        .returning();

      // Crear nueva versión activa
      const [nuevosParametros] = await db.insert(parametrosLegales)
        .values({ ...parametrosData, activo: true, createdAt: new Date() })
        .returning();

      return res.json(nuevosParametros);
    } else {
      // Crear nuevos
      const [parametros] = await db.insert(parametrosLegales)
        .values({ ...parametrosData, activo: true, createdAt: new Date() })
        .returning();

      return res.json(parametros);
    }
  } catch (error) {
    console.error("Error creando parámetros legales:", error);
    res.status(500).json({ 
      error: "Error interno del servidor",
      message: error instanceof Error ? error.message : "Error desconocido"
    });
  }
});

export default router;