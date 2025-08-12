import { Router } from "express";
import { NominaController } from "./nomina.controller";

const router = Router();

// Vista previa de nómina (cálculos sin persistir)
router.post("/preview", NominaController.previewNomina);

// Crear nómina
router.post("/", NominaController.createNomina);

// Procesar nómina (marcar como pagada)
router.post("/:id/procesar", NominaController.processNomina);

// Obtener detalle de nómina
router.get("/:id", NominaController.getNominaDetail);

// Exportar nómina
router.get("/:id/export", NominaController.exportNomina);

export { router as nominaRoutes };