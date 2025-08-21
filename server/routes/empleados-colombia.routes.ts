import { Router } from "express";
import { colombiaService } from "../modules/nomina/colombia.service";
import { insertEmployeeSchema, insertHistorialContratoSchema, insertNovedadNominaSchema } from "@shared/schema";
import { ZodError } from "zod";

const router = Router();

// ========== GESTIÓN DE EMPLEADOS ==========

// GET /api/empleados-colombia - Obtener todos los empleados
router.get("/", async (req, res) => {
  try {
    const empleados = await colombiaService.getAllEmpleados();
    res.json(empleados);
  } catch (error) {
    console.error("Error obteniendo empleados:", error);
    res.status(500).json({ 
      error: "Error interno del servidor",
      message: error instanceof Error ? error.message : "Error desconocido"
    });
  }
});

// GET /api/empleados-colombia/:id - Obtener empleado por ID
router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const empleado = await colombiaService.getEmpleado(id);
    
    if (!empleado) {
      return res.status(404).json({ error: "Empleado no encontrado" });
    }
    
    res.json(empleado);
  } catch (error) {
    console.error("Error obteniendo empleado:", error);
    res.status(500).json({ 
      error: "Error interno del servidor",
      message: error instanceof Error ? error.message : "Error desconocido"
    });
  }
});

// POST /api/empleados-colombia - Crear nuevo empleado
router.post("/", async (req, res) => {
  try {
    const empleadoData = insertEmployeeSchema.parse(req.body);
    const empleado = await colombiaService.createEmpleado(empleadoData);
    
    res.status(201).json(empleado);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ 
        error: "Datos de empleado inválidos",
        details: error.errors 
      });
    }
    
    console.error("Error creando empleado:", error);
    res.status(500).json({ 
      error: "Error interno del servidor",
      message: error instanceof Error ? error.message : "Error desconocido"
    });
  }
});

// PATCH /api/empleados-colombia/:id - Actualizar empleado
router.patch("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const empleadoData = req.body; // Validación parcial en el servicio
    
    const empleado = await colombiaService.updateEmpleado(id, empleadoData);
    res.json(empleado);
  } catch (error) {
    console.error("Error actualizando empleado:", error);
    res.status(500).json({ 
      error: "Error interno del servidor",
      message: error instanceof Error ? error.message : "Error desconocido"
    });
  }
});

// DELETE /api/empleados-colombia/:id - Eliminar empleado (soft delete)
router.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await colombiaService.deleteEmpleado(id);
    
    res.json({ message: "Empleado eliminado correctamente" });
  } catch (error) {
    console.error("Error eliminando empleado:", error);
    res.status(500).json({ 
      error: "Error interno del servidor",
      message: error instanceof Error ? error.message : "Error desconocido"
    });
  }
});

// ========== HISTORIAL DE CONTRATOS ==========

// GET /api/empleados-colombia/:id/historial-contratos
router.get("/:id/historial-contratos", async (req, res) => {
  try {
    const empleadoId = parseInt(req.params.id);
    const historial = await colombiaService.getHistorialContratos(empleadoId);
    res.json(historial);
  } catch (error) {
    console.error("Error obteniendo historial de contratos:", error);
    res.status(500).json({ 
      error: "Error interno del servidor",
      message: error instanceof Error ? error.message : "Error desconocido"
    });
  }
});

// POST /api/empleados-colombia/:id/cambio-contrato
router.post("/:id/cambio-contrato", async (req, res) => {
  try {
    const empleadoId = parseInt(req.params.id);
    const cambio = req.body;
    
    const historial = await colombiaService.createHistorialContrato(empleadoId, cambio);
    res.status(201).json(historial);
  } catch (error) {
    console.error("Error creando cambio de contrato:", error);
    res.status(500).json({ 
      error: "Error interno del servidor",
      message: error instanceof Error ? error.message : "Error desconocido"
    });
  }
});

// ========== PRESTACIONES SOCIALES ==========

// GET /api/empleados-colombia/:id/prestaciones
router.get("/:id/prestaciones", async (req, res) => {
  try {
    const empleadoId = parseInt(req.params.id);
    const año = req.query.año ? parseInt(req.query.año as string) : undefined;
    
    const prestaciones = await colombiaService.getPrestacionesSociales(empleadoId, año);
    res.json(prestaciones);
  } catch (error) {
    console.error("Error obteniendo prestaciones sociales:", error);
    res.status(500).json({ 
      error: "Error interno del servidor",
      message: error instanceof Error ? error.message : "Error desconocido"
    });
  }
});

// POST /api/empleados-colombia/:id/calcular-prestaciones
router.post("/:id/calcular-prestaciones", async (req, res) => {
  try {
    const empleadoId = parseInt(req.params.id);
    const { año, mes } = req.body;
    
    if (!año || !mes) {
      return res.status(400).json({ error: "Año y mes son requeridos" });
    }
    
    const prestaciones = await colombiaService.calcularPrestaciones(empleadoId, año, mes);
    res.json(prestaciones);
  } catch (error) {
    console.error("Error calculando prestaciones:", error);
    res.status(500).json({ 
      error: "Error interno del servidor",
      message: error instanceof Error ? error.message : "Error desconocido"
    });
  }
});

// ========== NOVEDADES DE NÓMINA ==========

// GET /api/empleados-colombia/:id/novedades
router.get("/:id/novedades", async (req, res) => {
  try {
    const empleadoId = parseInt(req.params.id);
    const novedades = await colombiaService.getNovedades(empleadoId);
    res.json(novedades);
  } catch (error) {
    console.error("Error obteniendo novedades:", error);
    res.status(500).json({ 
      error: "Error interno del servidor",
      message: error instanceof Error ? error.message : "Error desconocido"
    });
  }
});

// POST /api/empleados-colombia/:id/novedades
router.post("/:id/novedades", async (req, res) => {
  try {
    const empleadoId = parseInt(req.params.id);
    const novedad = req.body;
    
    const nuevaNovedad = await colombiaService.createNovedad(empleadoId, novedad);
    res.status(201).json(nuevaNovedad);
  } catch (error) {
    console.error("Error creando novedad:", error);
    res.status(500).json({ 
      error: "Error interno del servidor",
      message: error instanceof Error ? error.message : "Error desconocido"
    });
  }
});

// PATCH /api/empleados-colombia/:id/novedades/:novedadId
router.patch("/:id/novedades/:novedadId", async (req, res) => {
  try {
    const empleadoId = parseInt(req.params.id);
    const novedadId = parseInt(req.params.novedadId);
    const novedad = req.body;
    
    const novedadActualizada = await colombiaService.updateNovedad(empleadoId, novedadId, novedad);
    res.json(novedadActualizada);
  } catch (error) {
    console.error("Error actualizando novedad:", error);
    res.status(500).json({ 
      error: "Error interno del servidor",
      message: error instanceof Error ? error.message : "Error desconocido"
    });
  }
});

// DELETE /api/empleados-colombia/:id/novedades/:novedadId
router.delete("/:id/novedades/:novedadId", async (req, res) => {
  try {
    const empleadoId = parseInt(req.params.id);
    const novedadId = parseInt(req.params.novedadId);
    
    await colombiaService.deleteNovedad(empleadoId, novedadId);
    res.json({ message: "Novedad eliminada correctamente" });
  } catch (error) {
    console.error("Error eliminando novedad:", error);
    res.status(500).json({ 
      error: "Error interno del servidor",
      message: error instanceof Error ? error.message : "Error desconocido"
    });
  }
});

// ========== VALIDACIONES LEGALES ==========

// POST /api/empleados-colombia/validar-salario
router.post("/validar-salario", async (req, res) => {
  try {
    const { tipoContrato, valor, horas } = req.body;
    
    if (!tipoContrato || valor === undefined) {
      return res.status(400).json({ error: "Tipo de contrato y valor son requeridos" });
    }
    
    const validacion = await colombiaService.validarSalarioMinimo(tipoContrato, valor, horas);
    res.json(validacion);
  } catch (error) {
    console.error("Error validando salario:", error);
    res.status(500).json({ 
      error: "Error interno del servidor",
      message: error instanceof Error ? error.message : "Error desconocido"
    });
  }
});

// ========== CÁLCULOS DE NÓMINA ==========

// POST /api/empleados-colombia/:id/calcular-nomina
router.post("/:id/calcular-nomina", async (req, res) => {
  try {
    const empleadoId = parseInt(req.params.id);
    const { periodo } = req.body;
    
    if (!periodo || !periodo.inicio || !periodo.fin) {
      return res.status(400).json({ error: "Período de cálculo es requerido" });
    }
    
    const calculo = await colombiaService.calcularNomina(empleadoId, periodo);
    res.json(calculo);
  } catch (error) {
    console.error("Error calculando nómina:", error);
    res.status(500).json({ 
      error: "Error interno del servidor",
      message: error instanceof Error ? error.message : "Error desconocido"
    });
  }
});

// POST /api/empleados-colombia/:id/simular-nomina
router.post("/:id/simular-nomina", async (req, res) => {
  try {
    const empleadoId = parseInt(req.params.id);
    const { periodo, novedades } = req.body;
    
    if (!periodo || !periodo.inicio || !periodo.fin) {
      return res.status(400).json({ error: "Período de simulación es requerido" });
    }
    
    const simulacion = await colombiaService.simularNomina(empleadoId, periodo, novedades);
    res.json(simulacion);
  } catch (error) {
    console.error("Error simulando nómina:", error);
    res.status(500).json({ 
      error: "Error interno del servidor",
      message: error instanceof Error ? error.message : "Error desconocido"
    });
  }
});

export default router;