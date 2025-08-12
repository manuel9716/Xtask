import { Request, Response } from "express";
import multer from "multer";
import path from "path";
import { EmpleadosService } from "./empleados.service";
import { z } from "zod";

// Esquemas locales para validación
const empleadoSchema = z.object({
  nombre: z.string().min(2),
  apellido: z.string().min(2),
  identificacion: z.string().min(5),
  depto: z.string().min(1),
  cargo: z.string().min(1),
  fecha_ingreso: z.string().min(1),
  estado_contrato: z.enum(["activo", "inactivo", "suspendido"]),
  tipo_contrato: z.enum(["indefinido", "fijo", "obra_labor", "prestacion_servicios"]),
  telefono: z.string().optional(),
  direccion: z.string().optional(),
  contacto_emergencia: z.string().optional(),
});

const empleadoNominaSchema = z.object({
  sueldo_base: z.number().min(0),
  bonificacion: z.number().min(0).default(0),
  tasa_impuestos: z.number().min(0).max(1).default(0.19),
  base_deduccion: z.number().min(0).default(0),
  beneficios_base: z.number().min(0).default(0),
  metodo_pago: z.enum(["transferencia", "efectivo", "cheque"]),
  cuenta_bancaria: z.string().optional(),
  seguro_salud: z.string().optional(),
  dias_vacaciones: z.number().min(0).default(15),
  frecuencia_pago: z.enum(["quincenal", "mensual"]),
  fecha_inicio_nomina: z.string().min(1),
});

const empleadoProyectoSchema = z.object({
  proyecto_id: z.number().min(1),
});

const newEmpleadoSchema = z.object({
  empleado: empleadoSchema,
  nomina: empleadoNominaSchema,
  proyecto: empleadoProyectoSchema,
});

// Configuración de Multer para subir archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/contratos/');
  },
  filename: (req, file, cb) => {
    const empleadoId = req.params.id;
    const extension = path.extname(file.originalname);
    cb(null, `contrato-${empleadoId}-${Date.now()}${extension}`);
  }
});

const fileFilter = (req: any, file: any, cb: any) => {
  const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no permitido. Solo PDF, DOC y DOCX.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

export class EmpleadosController {
  static async createEmpleado(req: Request, res: Response) {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ error: "No autenticado" });
      }

      const validatedData = newEmpleadoSchema.parse(req.body);
      const empleado = await EmpleadosService.createEmpleado(validatedData, req.user.id);
      
      res.status(201).json(empleado);
    } catch (error: any) {
      console.error("Error creating empleado:", error);
      res.status(400).json({ 
        error: error.message || "Error al crear empleado" 
      });
    }
  }

  static uploadContrato = [
    upload.single('contrato'),
    async (req: Request, res: Response) => {
      try {
        const empleadoId = parseInt(req.params.id);
        
        if (!req.file) {
          return res.status(400).json({ error: "No se proporcionó archivo" });
        }

        const contratoData = {
          empleado_id: empleadoId,
          filename: req.file.originalname,
          mime_type: req.file.mimetype,
          size: req.file.size,
          url: `/uploads/contratos/${req.file.filename}`,
        };

        const contrato = await EmpleadosService.uploadContrato(contratoData);
        
        res.json({
          url: contrato.url,
          filename: contrato.filename
        });
      } catch (error: any) {
        console.error("Error uploading contrato:", error);
        res.status(400).json({ 
          error: error.message || "Error al subir contrato" 
        });
      }
    }
  ];

  static async getEmpleados(req: Request, res: Response) {
    try {
      const { proyectoId, q } = req.query;
      
      const filtros = {
        proyectoId: proyectoId ? parseInt(proyectoId as string) : undefined,
        q: q as string
      };

      const empleados = await EmpleadosService.getEmpleados(filtros);
      res.json(empleados);
    } catch (error: any) {
      console.error("Error getting empleados:", error);
      res.status(500).json({ 
        error: error.message || "Error al obtener empleados" 
      });
    }
  }
}