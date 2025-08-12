import { db } from "../../db";
import { eq, and } from "drizzle-orm";
import { 
  empleados, 
  empleado_nomina, 
  empleado_proyecto, 
  nominas_nuevas, 
  nomina_items, 
  payments_log,
  projects 
} from "@shared/schema";
// Tipos locales
interface NominaPreview {
  rango_inicio: string;
  rango_fin: string;
  proyecto_id?: number;
  empleados_seleccionados: number[];
}

interface NominaItem {
  empleado_id: number;
  empleado_nombre: string;
  sueldo: number;
  bono: number;
  deduccion: number;
  impuestos: number;
  neto: number;
  selected: boolean;
}

interface NominaCreate {
  rango_inicio: string;
  rango_fin: string;
  proyecto_id?: number;
  items: {
    empleado_id: number;
    sueldo: number;
    bono: number;
    deduccion: number;
    impuestos: number;
    neto: number;
  }[];
}

interface NominaProcess {
  nomina_id: number;
  estado: "pagada" | "parcial";
  monto: number;
  nota?: string;
}

export class NominaService {
  static async previewNomina(data: NominaPreview) {
    // Obtener empleados seleccionados con sus datos de nómina
    const empleadosData = await db
      .select({
        id: empleados.id,
        nombre: empleados.nombre,
        apellido: empleados.apellido,
        sueldo_base: empleado_nomina.sueldo_base,
        bonificacion: empleado_nomina.bonificacion,
        tasa_impuestos: empleado_nomina.tasa_impuestos,
        base_deduccion: empleado_nomina.base_deduccion,
      })
      .from(empleados)
      .innerJoin(empleado_nomina, eq(empleados.id, empleado_nomina.empleado_id))
      .where(eq(empleados.id, data.empleados_seleccionados[0])); // Simplificado para el primer empleado

    const items: NominaItem[] = [];
    let totalSueldos = 0;
    let totalBonos = 0;
    let totalDeducciones = 0;

    for (const empleadoId of data.empleados_seleccionados) {
      // Buscar datos del empleado
      const [empleadoData] = await db
        .select({
          id: empleados.id,
          nombre: empleados.nombre,
          apellido: empleados.apellido,
          sueldo_base: empleado_nomina.sueldo_base,
          bonificacion: empleado_nomina.bonificacion,
          tasa_impuestos: empleado_nomina.tasa_impuestos,
          base_deduccion: empleado_nomina.base_deduccion,
        })
        .from(empleados)
        .innerJoin(empleado_nomina, eq(empleados.id, empleado_nomina.empleado_id))
        .where(eq(empleados.id, empleadoId));

      if (empleadoData) {
        const sueldo = parseFloat(empleadoData.sueldo_base.toString());
        const bono = parseFloat(empleadoData.bonificacion.toString());
        const tasaImpuestos = parseFloat(empleadoData.tasa_impuestos.toString());
        const baseDeduccion = parseFloat(empleadoData.base_deduccion.toString());

        // Calcular impuestos y deducciones
        const impuestos = sueldo * tasaImpuestos;
        const deduccion = baseDeduccion;
        const neto = sueldo + bono - impuestos - deduccion;

        const item: NominaItem = {
          empleado_id: empleadoData.id,
          empleado_nombre: `${empleadoData.nombre} ${empleadoData.apellido}`,
          sueldo,
          bono,
          deduccion,
          impuestos,
          neto,
          selected: true,
        };

        items.push(item);
        totalSueldos += sueldo;
        totalBonos += bono;
        totalDeducciones += impuestos + deduccion;
      }
    }

    return {
      items,
      totales: {
        total_sueldos: totalSueldos,
        total_bonos: totalBonos,
        total_deducciones: totalDeducciones,
        total_neto: totalSueldos + totalBonos - totalDeducciones,
      },
    };
  }

  static async createNomina(data: NominaCreate, userId: number) {
    return await db.transaction(async (tx) => {
      // Verificar si ya existe una nómina para el mismo periodo y proyecto
      const existing = await tx
        .select()
        .from(nominas_nuevas)
        .where(
          and(
            eq(nominas_nuevas.rango_inicio, data.rango_inicio),
            eq(nominas_nuevas.rango_fin, data.rango_fin),
            data.proyecto_id 
              ? eq(nominas_nuevas.proyecto_id, data.proyecto_id)
              : eq(nominas_nuevas.proyecto_id, null)
          )
        );

      if (existing.length > 0) {
        throw new Error("Ya existe una nómina para este periodo y proyecto");
      }

      // Calcular totales
      const totalSueldos = data.items.reduce((sum, item) => sum + item.sueldo, 0);
      const totalBonos = data.items.reduce((sum, item) => sum + item.bono, 0);
      const totalDeducciones = data.items.reduce((sum, item) => sum + item.deduccion + item.impuestos, 0);

      // Crear la nómina
      const [nomina] = await tx
        .insert(nominas_nuevas)
        .values({
          rango_inicio: data.rango_inicio,
          rango_fin: data.rango_fin,
          proyecto_id: data.proyecto_id || null,
          total_sueldos: totalSueldos.toString(),
          total_bonos: totalBonos.toString(),
          total_deducciones: totalDeducciones.toString(),
          creado_por: userId,
        })
        .returning();

      // Crear los items de nómina
      for (const item of data.items) {
        await tx
          .insert(nomina_items)
          .values({
            nomina_id: nomina.id,
            empleado_id: item.empleado_id,
            sueldo: item.sueldo.toString(),
            bono: item.bono.toString(),
            deduccion: item.deduccion.toString(),
            impuestos: item.impuestos.toString(),
            neto: item.neto.toString(),
          });
      }

      return nomina;
    });
  }

  static async processNomina(data: NominaProcess) {
    return await db.transaction(async (tx) => {
      // Actualizar el estado de la nómina
      await tx
        .update(nominas_nuevas)
        .set({ estado: data.estado })
        .where(eq(nominas_nuevas.id, data.nomina_id));

      // Registrar el pago
      await tx
        .insert(payments_log)
        .values({
          nomina_id: data.nomina_id,
          fecha_pago: new Date(),
          monto: data.monto.toString(),
          estado: data.estado,
          nota: data.nota,
        });
    });
  }

  static async getNominaDetail(nominaId: number) {
    // Obtener datos de la nómina
    const [nomina] = await db
      .select()
      .from(nominas_nuevas)
      .where(eq(nominas_nuevas.id, nominaId));

    if (!nomina) {
      return null;
    }

    // Obtener los items con datos de empleados
    const items = await db
      .select({
        empleado_id: nomina_items.empleado_id,
        empleado_nombre: empleados.nombre,
        empleado_apellido: empleados.apellido,
        sueldo: nomina_items.sueldo,
        bono: nomina_items.bono,
        deduccion: nomina_items.deduccion,
        impuestos: nomina_items.impuestos,
        neto: nomina_items.neto,
      })
      .from(nomina_items)
      .innerJoin(empleados, eq(nomina_items.empleado_id, empleados.id))
      .where(eq(nomina_items.nomina_id, nominaId));

    return {
      ...nomina,
      items: items.map(item => ({
        empleado_id: item.empleado_id,
        empleado_nombre: `${item.empleado_nombre} ${item.empleado_apellido}`,
        sueldo: parseFloat(item.sueldo.toString()),
        bono: parseFloat(item.bono.toString()),
        deduccion: parseFloat(item.deduccion.toString()),
        impuestos: parseFloat(item.impuestos.toString()),
        neto: parseFloat(item.neto.toString()),
        selected: true,
      })),
    };
  }

  static async exportNomina(nominaId: number, format: 'pdf' | 'xlsx') {
    // Implementación básica - en un caso real se usaría una librería como jsPDF o exceljs
    const detail = await this.getNominaDetail(nominaId);
    
    if (format === 'pdf') {
      // Retornar un buffer simulado para PDF
      return Buffer.from(`Nómina ${nominaId} - Exportación PDF`);
    } else {
      // Retornar un buffer simulado para Excel
      return Buffer.from(`Nómina ${nominaId} - Exportación Excel`);
    }
  }
}