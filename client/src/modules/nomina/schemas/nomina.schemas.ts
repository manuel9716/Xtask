import { z } from "zod";

export const nominaPreviewSchema = z.object({
  rango_inicio: z.string().min(1, "La fecha de inicio es obligatoria"),
  rango_fin: z.string().min(1, "La fecha de fin es obligatoria"),
  proyecto_id: z.number().optional(),
  empleados_seleccionados: z.array(z.number()).min(1, "Debe seleccionar al menos un empleado"),
  soportes_seguridad_social: z.string().optional(),
});

export const nominaCreateSchema = z.object({
  rango_inicio: z.string().min(1, "La fecha de inicio es obligatoria"),
  rango_fin: z.string().min(1, "La fecha de fin es obligatoria"),
  proyecto_id: z.number().optional(),
  soportes_seguridad_social: z.string().optional(),
  items: z.array(z.object({
    empleado_id: z.number(),
    sueldo: z.number().min(0),
    bono: z.number().min(0).default(0),
    deduccion: z.number().min(0).default(0),
    impuestos: z.number().min(0).default(0),
    neto: z.number().min(0),
  })).min(1, "Debe incluir al menos un empleado"),
});

export const nominaProcessSchema = z.object({
  nomina_id: z.number(),
  estado: z.enum(["pagada", "parcial"]),
  monto: z.number().min(0),
  nota: z.string().optional(),
});

export const nominaItemSchema = z.object({
  empleado_id: z.number(),
  empleado_nombre: z.string(),
  sueldo: z.number(),
  bono: z.number(),
  deduccion: z.number(),
  impuestos: z.number(),
  neto: z.number(),
  selected: z.boolean().default(true),
});

export type NominaPreview = z.infer<typeof nominaPreviewSchema>;
export type NominaCreate = z.infer<typeof nominaCreateSchema>;
export type NominaProcess = z.infer<typeof nominaProcessSchema>;
export type NominaItem = z.infer<typeof nominaItemSchema>;