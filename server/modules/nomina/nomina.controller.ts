import { Request, Response } from "express";
import { NominaService } from "./nomina.service";
import { z } from "zod";

// Esquemas locales para validación
const nominaPreviewSchema = z.object({
  rango_inicio: z.string().min(1),
  rango_fin: z.string().min(1),
  proyecto_id: z.number().optional(),
  empleados_seleccionados: z.array(z.number()).optional(),
});

const nominaCreateSchema = z.object({
  rango_inicio: z.string().min(1),
  rango_fin: z.string().min(1),
  proyecto_id: z.number().optional(),
  items: z.array(z.object({
    empleado_id: z.number(),
    sueldo: z.number().min(0),
    bono: z.number().min(0).default(0),
    deduccion: z.number().min(0).default(0),
    impuestos: z.number().min(0).default(0),
    neto: z.number().min(0),
  })).min(1),
});

const nominaProcessSchema = z.object({
  nomina_id: z.number(),
  estado: z.enum(["pagada", "parcial"]),
  monto: z.number().min(0),
  nota: z.string().optional(),
});

export class NominaController {
  static async previewNomina(req: Request, res: Response) {
    try {
      // Permitir preview sin autenticación en desarrollo
      if (!req.user && process.env.NODE_ENV !== 'development') {
        return res.status(401).json({ error: "No autenticado" });
      }

      const validatedData = nominaPreviewSchema.parse(req.body);
      const preview = await NominaService.previewNomina(validatedData);
      
      res.json(preview);
    } catch (error: any) {
      console.error("Error previewing nomina:", error);
      res.status(400).json({ 
        error: error.message || "Error al generar vista previa de nómina" 
      });
    }
  }

  static async createNomina(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "No autenticado" });
      }

      const validatedData = nominaCreateSchema.parse(req.body);
      const nomina = await NominaService.createNomina(validatedData, req.user.id);
      
      res.status(201).json({
        id: nomina.id,
        message: "Nómina creada exitosamente"
      });
    } catch (error: any) {
      console.error("Error creating nomina:", error);
      res.status(400).json({ 
        error: error.message || "Error al crear nómina" 
      });
    }
  }

  static async processNomina(req: Request, res: Response) {
    try {
      const nominaId = parseInt(req.params.id);
      const processData = {
        ...req.body,
        nomina_id: nominaId
      };
      
      const validatedData = nominaProcessSchema.parse(processData);
      await NominaService.processNomina(validatedData);
      
      res.json({ message: "Nómina procesada exitosamente" });
    } catch (error: any) {
      console.error("Error processing nomina:", error);
      res.status(400).json({ 
        error: error.message || "Error al procesar nómina" 
      });
    }
  }

  static async getNominaDetail(req: Request, res: Response) {
    try {
      const nominaId = parseInt(req.params.id);
      const detail = await NominaService.getNominaDetail(nominaId);
      
      if (!detail) {
        return res.status(404).json({ error: "Nómina no encontrada" });
      }
      
      res.json(detail);
    } catch (error: any) {
      console.error("Error getting nomina detail:", error);
      res.status(500).json({ 
        error: error.message || "Error al obtener detalle de nómina" 
      });
    }
  }

  static async exportNomina(req: Request, res: Response) {
    try {
      const nominaId = parseInt(req.params.id);
      const format = req.query.format as 'pdf' | 'xlsx';
      
      if (!['pdf', 'xlsx'].includes(format)) {
        return res.status(400).json({ error: "Formato no válido" });
      }

      const exportData = await NominaService.exportNomina(nominaId, format);
      
      res.setHeader('Content-Type', format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=nomina-${nominaId}.${format}`);
      res.send(exportData);
    } catch (error: any) {
      console.error("Error exporting nomina:", error);
      res.status(500).json({ 
        error: error.message || "Error al exportar nómina" 
      });
    }
  }
}