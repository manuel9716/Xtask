import { EmpleadoRepository, EmpleadoFiltros } from '../../../domain/repositories/empleados.repository';
import { Empleado } from '../../../domain/entities/empleados.entity';
import { db } from '../../../db';
import { empleados, empleado_proyecto } from '@shared/schema';
import { eq, and, or, ilike, isNull } from 'drizzle-orm';

/**
 * Implementación del repositorio de empleados
 */
export class EmpleadoRepositoryImpl implements EmpleadoRepository {
  async findById(id: number): Promise<Empleado | null> {
    const result = await db.query.empleados.findFirst({
      where: and(
        eq(empleados.id, id),
        isNull(empleados.deleted_at)
      )
    });
    
    return result ? this.toDomain(result) : null;
  }

  async findAll(filtros?: EmpleadoFiltros): Promise<Empleado[]> {
    let query = db
      .select()
      .from(empleados)
      .where(and(
        eq(empleados.activo, true),
        isNull(empleados.deleted_at)
      ));

    // Aplicar filtros
    const conditions = [
      eq(empleados.activo, true),
      isNull(empleados.deleted_at)
    ];

    if (filtros?.estadoContrato) {
      conditions.push(eq(empleados.estado_contrato, filtros.estadoContrato));
    }

    if (filtros?.tipoContrato) {
      conditions.push(eq(empleados.tipo_contrato, filtros.tipoContrato));
    }

    if (filtros?.depto) {
      conditions.push(eq(empleados.depto, filtros.depto));
    }

    if (filtros?.q) {
      const searchTerm = `%${filtros.q}%`;
      conditions.push(
        or(
          ilike(empleados.nombre, searchTerm),
          ilike(empleados.apellido, searchTerm),
          ilike(empleados.identificacion, searchTerm),
          ilike(empleados.cargo, searchTerm)
        )!
      );
    }

    // Si hay filtro por proyecto, hacer join
    if (filtros?.proyectoId) {
      const results = await db
        .select({
          empleado: empleados
        })
        .from(empleados)
        .innerJoin(empleado_proyecto, eq(empleados.id, empleado_proyecto.empleado_id))
        .where(and(
          ...conditions,
          eq(empleado_proyecto.proyecto_id, filtros.proyectoId),
          eq(empleado_proyecto.activo, true)
        ));

      return results.map(r => this.toDomain(r.empleado));
    }

    const results = await db
      .select()
      .from(empleados)
      .where(and(...conditions));

    return results.map(r => this.toDomain(r));
  }

  async findByIdentificacion(identificacion: string): Promise<Empleado | null> {
    const result = await db.query.empleados.findFirst({
      where: and(
        eq(empleados.identificacion, identificacion),
        isNull(empleados.deleted_at)
      )
    });
    
    return result ? this.toDomain(result) : null;
  }

  async save(empleado: Empleado): Promise<Empleado> {
    const [result] = await db
      .insert(empleados)
      .values({
        user_id: empleado.userId,
        nombre: empleado.nombre,
        apellido: empleado.apellido,
        identificacion: empleado.identificacion,
        depto: empleado.depto,
        cargo: empleado.cargo,
        fecha_ingreso: empleado.fechaIngreso.toISOString().split('T')[0],
        estado_contrato: empleado.estadoContrato,
        tipo_contrato: empleado.tipoContrato,
        telefono: empleado.telefono,
        direccion: empleado.direccion,
        contacto_emergencia: empleado.contactoEmergencia,
        fecha_fin_contrato: empleado.fechaFinContrato?.toISOString().split('T')[0],
        clase_riesgo_arl: empleado.claseRiesgoArl,
        horas_por_semana: empleado.horasPorSemana,
        salario_por_hora: empleado.salarioPorHora?.toString(),
        honorarios: empleado.honorarios?.toString(),
        salario_base: empleado.salarioBase?.toString(),
        bonificaciones: empleado.bonificaciones?.toString(),
        auxilio_transporte: empleado.auxilioTransporte,
        requiere_seguridad_social: empleado.requiereSeguridadSocial,
        activo: empleado.activo,
      })
      .returning();

    return this.toDomain(result);
  }

  async update(id: number, empleado: Partial<Empleado>): Promise<Empleado> {
    const updateData: any = {};

    if (empleado.nombre !== undefined) updateData.nombre = empleado.nombre;
    if (empleado.apellido !== undefined) updateData.apellido = empleado.apellido;
    if (empleado.identificacion !== undefined) updateData.identificacion = empleado.identificacion;
    if (empleado.depto !== undefined) updateData.depto = empleado.depto;
    if (empleado.cargo !== undefined) updateData.cargo = empleado.cargo;
    if (empleado.fechaIngreso !== undefined) updateData.fecha_ingreso = empleado.fechaIngreso.toISOString().split('T')[0];
    if (empleado.estadoContrato !== undefined) updateData.estado_contrato = empleado.estadoContrato;
    if (empleado.tipoContrato !== undefined) updateData.tipo_contrato = empleado.tipoContrato;
    if (empleado.telefono !== undefined) updateData.telefono = empleado.telefono;
    if (empleado.direccion !== undefined) updateData.direccion = empleado.direccion;
    if (empleado.contactoEmergencia !== undefined) updateData.contacto_emergencia = empleado.contactoEmergencia;
    if (empleado.fechaFinContrato !== undefined) updateData.fecha_fin_contrato = empleado.fechaFinContrato?.toISOString().split('T')[0];
    if (empleado.claseRiesgoArl !== undefined) updateData.clase_riesgo_arl = empleado.claseRiesgoArl;
    if (empleado.horasPorSemana !== undefined) updateData.horas_por_semana = empleado.horasPorSemana;
    if (empleado.salarioPorHora !== undefined) updateData.salario_por_hora = empleado.salarioPorHora?.toString();
    if (empleado.honorarios !== undefined) updateData.honorarios = empleado.honorarios?.toString();
    if (empleado.salarioBase !== undefined) updateData.salario_base = empleado.salarioBase?.toString();
    if (empleado.bonificaciones !== undefined) updateData.bonificaciones = empleado.bonificaciones?.toString();
    if (empleado.auxilioTransporte !== undefined) updateData.auxilio_transporte = empleado.auxilioTransporte;
    if (empleado.requiereSeguridadSocial !== undefined) updateData.requiere_seguridad_social = empleado.requiereSeguridadSocial;
    if (empleado.activo !== undefined) updateData.activo = empleado.activo;

    const [result] = await db
      .update(empleados)
      .set(updateData)
      .where(eq(empleados.id, id))
      .returning();

    return this.toDomain(result);
  }

  async delete(id: number): Promise<void> {
    await db
      .delete(empleados)
      .where(eq(empleados.id, id));
  }

  async softDelete(id: number): Promise<void> {
    await db
      .update(empleados)
      .set({
        activo: false,
        estado_contrato: 'inactivo',
        deleted_at: new Date()
      })
      .where(eq(empleados.id, id));
  }

  async existeIdentificacion(identificacion: string, excludeId?: number): Promise<boolean> {
    const conditions = [
      eq(empleados.identificacion, identificacion),
      isNull(empleados.deleted_at)
    ];

    if (excludeId) {
      conditions.push(eq(empleados.id, excludeId));
    }

    const result = await db.query.empleados.findFirst({
      where: excludeId 
        ? and(
            eq(empleados.identificacion, identificacion),
            isNull(empleados.deleted_at),
            // NOT equal to excludeId (usando una subconsulta o lógica inversa)
          )
        : and(
            eq(empleados.identificacion, identificacion),
            isNull(empleados.deleted_at)
          )
    });

    // Si excludeId está presente, verificamos que el resultado no sea el mismo empleado
    if (excludeId && result) {
      return result.id !== excludeId;
    }

    return !!result;
  }

  private toDomain(data: any): Empleado {
    return new Empleado(
      data.id,
      data.nombre,
      data.apellido,
      data.identificacion,
      data.depto,
      data.cargo,
      new Date(data.fecha_ingreso),
      data.estado_contrato,
      data.tipo_contrato,
      data.telefono,
      data.direccion,
      data.contacto_emergencia,
      data.fecha_fin_contrato ? new Date(data.fecha_fin_contrato) : undefined,
      data.clase_riesgo_arl,
      data.horas_por_semana,
      data.salario_por_hora ? parseFloat(data.salario_por_hora) : undefined,
      data.honorarios ? parseFloat(data.honorarios) : undefined,
      data.salario_base ? parseFloat(data.salario_base) : undefined,
      data.bonificaciones ? parseFloat(data.bonificaciones) : undefined,
      data.auxilio_transporte,
      data.requiere_seguridad_social,
      data.activo,
      data.user_id,
      data.deleted_at ? new Date(data.deleted_at) : undefined,
      data.created_at ? new Date(data.created_at) : undefined
    );
  }
}
