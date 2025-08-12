import { Router } from "express";
import { EmpleadosController } from "./empleados.controller";

const router = Router();

// Crear nuevo empleado
router.post("/", EmpleadosController.createEmpleado);

// Subir contrato de empleado
router.post("/:id/contrato", EmpleadosController.uploadContrato);

// Listar empleados con filtros
router.get("/", EmpleadosController.getEmpleados);

export { router as empleadosRoutes };