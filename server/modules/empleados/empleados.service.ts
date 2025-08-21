import { db } from "../../db";
import { eq, and, or, ilike } from "drizzle-orm";
import { empleados, empleado_nomina, empleado_proyecto, empleado_contratos, projects } from "@shared/schema";
// Tipos locales
interface NewEmpleado {
  empleado: {
    nombre: string;
    apellido: string;
    identificacion: string;
    depto: string;
    cargo: string;
    fecha_ingreso: string;
    estado_contrato: "activo" | "inactivo" | "suspendido";
    tipo_contrato: "indefinido" | "fijo" | "obra_labor" | "prestacion_servicios";
    telefono?: string;
    direccion?: string;
    contacto_emergencia?: string;
  };
  nomina: {
    sueldo_base: number;
    bonificacion: number;
    tasa_impuestos: number;
    base_deduccion: number;
    beneficios_base: number;
    metodo_pago: "transferencia" | "efectivo" | "cheque";
    cuenta_bancaria?: string;
    seguro_salud?: string;
    dias_vacaciones: number;
    frecuencia_pago: "quincenal" | "mensual";
    fecha_inicio_nomina: string;
  };
  proyecto: {
    proyecto_id: number;
  };
}

export class EmpleadosService {
  static async createEmpleado(data: NewEmpleado, userId: number) {
    return await db.transaction(async (tx) => {
      // 1. Verificar si existe un empleado activo con la misma identificación
      const empleadosExistentes = await tx
        .select()
        .from(empleados)
        .where(and(
          eq(empleados.identificacion, data.empleado.identificacion),
          isNull(empleados.deleted_at)
        ));

      if (empleadosExistentes.length > 0) {
        throw new Error(`Ya existe un empleado activo con la identificación ${data.empleado.identificacion}`);
      }

      // 2. Crear el empleado
      const [empleado] = await tx
        .insert(empleados)
        .values({
          ...data.empleado,
          user_id: userId,
        })
        .returning();

      // 3. Crear los datos de nómina
      await tx
        .insert(empleado_nomina)
        .values({
          empleado_id: empleado.id,
          sueldo_base: data.nomina.sueldo_base.toString(),
          bonificacion: data.nomina.bonificacion.toString(),
          tasa_impuestos: data.nomina.tasa_impuestos.toString(),
          base_deduccion: data.nomina.base_deduccion.toString(),
          beneficios_base: data.nomina.beneficios_base.toString(),
          metodo_pago: data.nomina.metodo_pago,
          cuenta_bancaria: data.nomina.cuenta_bancaria,
          seguro_salud: data.nomina.seguro_salud,
          dias_vacaciones: data.nomina.dias_vacaciones,
          frecuencia_pago: data.nomina.frecuencia_pago,
          fecha_inicio_nomina: data.nomina.fecha_inicio_nomina,
        });

      // 4. Asignar al proyecto
      await tx
        .insert(empleado_proyecto)
        .values({
          empleado_id: empleado.id,
          proyecto_id: data.proyecto.proyecto_id,
        });

      return empleado;
    });
  }

  static async uploadContrato(contratoData: {
    empleado_id: number;
    filename: string;
    mime_type: string;
    size: number;
    url: string;
  }) {
    const [contrato] = await db
      .insert(empleado_contratos)
      .values(contratoData)
      .returning();

    return contrato;
  }

  static async getEmpleados(filtros: { proyectoId?: number; q?: string }) {
    let query = db
      .select({
        id: empleados.id,
        nombre: empleados.nombre,
        apellido: empleados.apellido,
        identificacion: empleados.identificacion,
        depto: empleados.depto,
        cargo: empleados.cargo,
        fecha_ingreso: empleados.fecha_ingreso,
        estado_contrato: empleados.estado_contrato,
        tipo_contrato: empleados.tipo_contrato,
        telefono: empleados.telefono,
        direccion: empleados.direccion,
        contacto_emergencia: empleados.contacto_emergencia,
      })
      .from(empleados);

    // Filtro por proyecto
    if (filtros.proyectoId) {
      query = query
        .innerJoin(empleado_proyecto, eq(empleados.id, empleado_proyecto.empleado_id))
        .where(eq(empleado_proyecto.proyecto_id, filtros.proyectoId));
    }

    // Filtro por búsqueda de texto
    if (filtros.q) {
      const searchTerm = `%${filtros.q}%`;
      query = query.where(
        or(
          ilike(empleados.nombre, searchTerm),
          ilike(empleados.apellido, searchTerm),
          ilike(empleados.identificacion, searchTerm),
          ilike(empleados.cargo, searchTerm)
        )
      );
    }

    return await query;
  }

  static async getProyectos() {
    return await db
      .select({
        id: projects.id,
        nombre: projects.name,
      })
      .from(projects);
  }

  static async getUsuarios(query?: string) {
    // Esta función debería implementarse cuando se necesite
    // Por ahora retorna un array vacío
    return [];
  }
}