import { Router, Request, Response } from 'express';
import { db } from '../db';
import { and, count, eq, like, sql } from 'drizzle-orm';
import { users, employees, projects, tasks, employeeProjects } from '@shared/schema';
import { z } from 'zod';

// Esquema para validar la creación de empleado
const crearEmpleadoSchema = z.object({
  userId: z.number().int().positive(),
  position: z.string().min(1),
  department: z.string().min(1),
  hireDate: z.coerce.date(),
  salary: z.string().min(1),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
  emergencyContact: z.string().optional(),
  contractStatus: z.string().default('active'),
  contractType: z.enum(['fulltime', 'parttime', 'contractor']),
  identification: z.string().min(1),
  baseBenefits: z.string().optional(),
  baseDeductions: z.string().optional(),
  taxRate: z.string().optional(),
  bankAccount: z.string().optional(),
  paymentMethod: z.string().optional(),
  healthInsurance: z.string().optional(),
  vacationDays: z.number().int().optional(),
  projectIds: z.array(z.number().int().positive()).optional(),
  tipoPago: z.string().optional(),
  fechaInicioNomina: z.coerce.date().optional(),
  contratoUrl: z.string().optional(),
  id_employed_proyects: z.number().int().positive().optional()
});

// Esquema para validar la actualización de empleado
const actualizarEmpleadoSchema = crearEmpleadoSchema.partial();

// Esquema para validar el cambio de estado de un empleado
const cambiarEstadoSchema = z.object({
  estado: z.enum(['active', 'inactive', 'on_leave', 'terminated'])
});

const empleadosRouter = Router();

// Crear ruta explícita para listar
empleadosRouter.get('/listar', async (req: Request, res: Response) => {
  try {
    const { page = '1', pageSize = '10', contractStatus, department, search } = req.query;
    const pageNum = parseInt(page as string);
    const pageSizeNum = parseInt(pageSize as string);
    const offset = (pageNum - 1) * pageSizeNum;
    
    // Condiciones para filtros
    const conditions: any[] = [];
    
    if (contractStatus) {
      conditions.push(eq(employees.contractStatus, contractStatus as string));
    }
    
    if (department) {
      conditions.push(eq(employees.department, department as string));
    }
    
    // Consulta para contar el total de registros
    const totalQuery = db.select({ count: count() }).from(employees);
    
    if (conditions.length > 0) {
      totalQuery.where(and(...conditions));
    }
    
    const [totalResult] = await totalQuery;
    const totalItems = Number(totalResult?.count || 0);
    
    // Consulta para obtener los empleados con paginación
    const query = db.select({
      ...employees,
      fullName: users.fullName
    })
    .from(employees)
    .leftJoin(users, eq(employees.userId, users.id));
    
    if (conditions.length > 0) {
      query.where(and(...conditions));
    }
    
    // Si hay búsqueda, aplicarla sobre el nombre o identificación
    if (search) {
      query.where(
        sql`(${users.fullName} ILIKE ${`%${search}%`} OR ${employees.identification} ILIKE ${`%${search}%`})`
      );
    }
    
    const data = await query
      .limit(pageSizeNum)
      .offset(offset)
      .orderBy(employees.id);
    
    // Calcular el total de páginas
    const totalPages = Math.ceil(Number(totalItems) / pageSizeNum);
    
    return res.status(200).json({
      empleados: data,
      pagination: {
        page: pageNum,
        pageSize: pageSizeNum,
        totalItems: Number(totalItems),
        totalPages
      }
    });
  } catch (error) {
    console.error('Error al obtener empleados:', error);
    return res.status(500).json({ error: 'Error al obtener los empleados' });
  }
});

// Obtener todos los empleados (con filtros opcionales) - ruta raíz
empleadosRouter.get('/', async (req: Request, res: Response) => {
  try {
    const { page = '1', pageSize = '10', contractStatus, department, search } = req.query;
    const pageNum = parseInt(page as string);
    const pageSizeNum = parseInt(pageSize as string);
    const offset = (pageNum - 1) * pageSizeNum;
    
    // Construir condiciones de filtro
    const conditions = [];
    
    if (contractStatus) {
      conditions.push(eq(employees.contractStatus, contractStatus as string));
    }
    
    if (department) {
      conditions.push(eq(employees.department, department as string));
    }
    
    // Consulta para contar el total de registros
    const totalQuery = db.select({ count: count() }).from(employees);
    
    if (conditions.length > 0) {
      totalQuery.where(and(...conditions));
    }
    
    const [totalResult] = await totalQuery;
    const totalItems = Number(totalResult?.count || 0);
    
    // Consulta para obtener los empleados con paginación
    const query = db.select({
      ...employees,
      fullName: users.fullName
    })
    .from(employees)
    .leftJoin(users, eq(employees.userId, users.id));
    
    if (conditions.length > 0) {
      query.where(and(...conditions));
    }
    
    // Si hay búsqueda, aplicarla sobre el nombre o identificación
    if (search) {
      query.where(
        sql`(${users.fullName} ILIKE ${`%${search}%`} OR ${employees.identification} ILIKE ${`%${search}%`})`
      );
    }
    
    const data = await query
      .limit(pageSizeNum)
      .offset(offset)
      .orderBy(employees.id);
    
    // Calcular el total de páginas
    const totalPages = Math.ceil(Number(totalItems) / pageSizeNum);
    
    return res.status(200).json({
      empleados: data,
      pagination: {
        page: pageNum,
        pageSize: pageSizeNum,
        totalItems: Number(totalItems),
        totalPages
      }
    });
  } catch (error) {
    console.error('Error al obtener empleados:', error);
    return res.status(500).json({ error: 'Error al obtener los empleados' });
  }
});

// Obtener un empleado por su ID - Se coloca DESPUÉS de la ruta específica de "listar"
empleadosRouter.get('/:id([0-9]+)', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const [empleado] = await db.select({
      ...employees,
      fullName: users.fullName,
      email: users.email
    })
    .from(employees)
    .leftJoin(users, eq(employees.userId, users.id))
    .where(eq(employees.id, parseInt(id)));
    
    if (!empleado) {
      return res.status(404).json({ error: 'Empleado no encontrado' });
    }
    
    return res.status(200).json(empleado);
  } catch (error) {
    console.error(`Error al obtener empleado con ID ${req.params.id}:`, error);
    return res.status(500).json({ error: 'Error al obtener los datos del empleado' });
  }
});

// Crear un nuevo empleado
empleadosRouter.post('/', async (req: Request, res: Response) => {
  try {
    // Validar los datos recibidos
    const validacionResultado = crearEmpleadoSchema.safeParse(req.body);
    
    if (!validacionResultado.success) {
      return res.status(400).json({ 
        error: 'Datos de empleado inválidos',
        details: validacionResultado.error.format() 
      });
    }
    
    const datosEmpleado = validacionResultado.data;
    
    // Verificar que el usuario existe
    const [usuario] = await db.select()
      .from(users)
      .where(eq(users.id, datosEmpleado.userId));
    
    if (!usuario) {
      return res.status(400).json({ error: `No se encontró el usuario con ID ${datosEmpleado.userId}` });
    }
    
    // Verificar que no exista otro empleado con la misma identificación
    const [empleadoExistente] = await db.select()
      .from(employees)
      .where(eq(employees.identification, datosEmpleado.identification));
    
    if (empleadoExistente) {
      return res.status(400).json({ error: `Ya existe un empleado con la identificación ${datosEmpleado.identification}` });
    }
    
    // Extraemos los projectIds si existen
    const { projectIds, ...datosEmpleadoSinProyectos } = datosEmpleado;
    
    // Preparamos el objeto de datos para inserción
    let datosEmpleadoParaInsertar: any = { ...datosEmpleadoSinProyectos };
    let empleadoCreado;
    
    // Si se especifica un proyecto principal, asignarlo directamente al campo id_employed_proyects
    if (projectIds && projectIds.length > 0) {
      const proyectoPrincipal = projectIds[0]; // Usamos el primer proyecto como el principal
      
      // Verificar que el proyecto existe
      const [proyectoExiste] = await db
        .select()
        .from(projects)
        .where(eq(projects.id, proyectoPrincipal))
        .limit(1);
      
      if (proyectoExiste) {
        // Asignar el ID del proyecto principal directamente
        datosEmpleadoParaInsertar.id_employed_proyects = proyectoPrincipal;
        console.log(`Proyecto principal ${proyectoPrincipal} será asignado al empleado`);
      }
    }
    
    // Insertar el nuevo empleado 
    const [nuevoEmpleado] = await db.insert(employees)
      .values(datosEmpleadoParaInsertar)
      .returning();
    
    empleadoCreado = nuevoEmpleado;
    console.log(`Empleado creado con ID ${nuevoEmpleado.id}`);
    
    // Si se especificaron proyectos, también los asignamos en la tabla de relación
    if (projectIds && projectIds.length > 0) {
      console.log(`Asignando ${projectIds.length} proyectos al empleado ${nuevoEmpleado.id}`);
      
      // Para cada proyecto en projectIds, crear una asignación
      for (const projectId of projectIds) {
        // Verificar que el proyecto existe
        const [proyecto] = await db
          .select()
          .from(projects)
          .where(eq(projects.id, projectId))
          .limit(1);
        
        if (proyecto) {
          // Crear la asignación en la tabla employee_projects
          await db.insert(employeeProjects).values({
            employeeId: nuevoEmpleado.id,
            projectId: projectId,
            role: 'member',
            assignedBy: 1, // Id del usuario administrador por defecto
            isActive: true
          });
          console.log(`Proyecto ${projectId} asignado al empleado ${nuevoEmpleado.id}`);
        } else {
          console.log(`El proyecto ${projectId} no existe, no se puede asignar`);
        }
      }
    }
    
    // Consultar el empleado nuevamente para asegurarnos de tener los datos más actualizados
    const [empleadoActualizado] = await db
      .select()
      .from(employees)
      .where(eq(employees.id, nuevoEmpleado.id));
    
    return res.status(201).json({
      ...empleadoActualizado,
      projectIds: projectIds || []
    });
  } catch (error) {
    console.error('Error al crear empleado:', error);
    return res.status(500).json({ error: 'Error al crear el empleado' });
  }
});

// Actualizar un empleado existente
empleadosRouter.patch('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Validar los datos recibidos
    const validacionResultado = actualizarEmpleadoSchema.safeParse(req.body);
    
    if (!validacionResultado.success) {
      return res.status(400).json({ 
        error: 'Datos de empleado inválidos',
        details: validacionResultado.error.format() 
      });
    }
    
    const datosActualizacion = validacionResultado.data;
    const empleadoId = parseInt(id);
    
    // Verificar que el empleado existe
    const [empleadoExistente] = await db.select()
      .from(employees)
      .where(eq(employees.id, empleadoId));
    
    if (!empleadoExistente) {
      return res.status(404).json({ error: 'Empleado no encontrado' });
    }
    
    // Si se actualiza el userId, verificar que el usuario existe
    if (datosActualizacion.userId) {
      const [usuario] = await db.select()
        .from(users)
        .where(eq(users.id, datosActualizacion.userId));
      
      if (!usuario) {
        return res.status(400).json({ error: `No se encontró el usuario con ID ${datosActualizacion.userId}` });
      }
    }
    
    // Si se actualiza la identificación, verificar que no exista otro empleado con esa identificación
    if (datosActualizacion.identification && 
        datosActualizacion.identification !== empleadoExistente.identification) {
      const [empleadoConIdentificacion] = await db.select()
        .from(employees)
        .where(
          and(
            eq(employees.identification, datosActualizacion.identification),
            sql`${employees.id} != ${empleadoId}`
          )
        );
      
      if (empleadoConIdentificacion) {
        return res.status(400).json({ 
          error: `Ya existe otro empleado con la identificación ${datosActualizacion.identification}` 
        });
      }
    }
    
    // Extraemos los projectIds si existen
    const { projectIds, ...datosEmpleadoSinProyectos } = datosActualizacion;
    
    // Preparamos el objeto de datos para actualización
    let datosEmpleadoParaActualizar: any = { ...datosEmpleadoSinProyectos };
    
    // Si se especifica un proyecto principal, asignarlo directamente al campo id_employed_proyects
    if (projectIds && projectIds.length > 0) {
      const proyectoPrincipal = projectIds[0]; // Usamos el primer proyecto como el principal
      
      // Verificar que el proyecto existe
      const [proyectoExiste] = await db
        .select()
        .from(projects)
        .where(eq(projects.id, proyectoPrincipal))
        .limit(1);
      
      if (proyectoExiste) {
        // Asignar el proyecto principal al campo id_employed_proyects
        datosEmpleadoParaActualizar.id_employed_proyects = proyectoPrincipal;
        console.log(`Actualizando proyecto principal a ${proyectoPrincipal} para el empleado ${empleadoId}`);
      } else {
        console.log(`El proyecto ${proyectoPrincipal} no existe, no se puede asignar como principal`);
      }
    }
    
    // Actualizar el empleado
    const [empleadoActualizado] = await db.update(employees)
      .set(datosEmpleadoParaActualizar)
      .where(eq(employees.id, empleadoId))
      .returning();
    
    // Si se especificaron proyectos, actualizar las asignaciones
    if (projectIds && projectIds.length > 0) {
      console.log(`Actualizando asignaciones de proyectos para el empleado ${empleadoId}`);
      
      // Primero, desactivamos todas las asignaciones existentes
      await db.update(employeeProjects)
        .set({ isActive: false })
        .where(eq(employeeProjects.employeeId, empleadoId));
      
      // Luego, creamos nuevas asignaciones para cada proyecto
      for (const projectId of projectIds) {
        // Verificar que el proyecto existe
        const [proyecto] = await db
          .select()
          .from(projects)
          .where(eq(projects.id, projectId))
          .limit(1);
        
        if (proyecto) {
          // Primero verificamos si ya existe una asignación para este proyecto (incluso inactiva)
          const [asignacionExistente] = await db
            .select()
            .from(employeeProjects)
            .where(and(
              eq(employeeProjects.employeeId, empleadoId),
              eq(employeeProjects.projectId, projectId)
            ))
            .limit(1);
          
          if (asignacionExistente) {
            // Si existe, la reactivamos
            await db.update(employeeProjects)
              .set({ isActive: true })
              .where(eq(employeeProjects.id, asignacionExistente.id));
            console.log(`Reactivada asignación de proyecto ${projectId} para empleado ${empleadoId}`);
          } else {
            // Si no existe, creamos una nueva
            await db.insert(employeeProjects).values({
              employeeId: empleadoId,
              projectId: projectId,
              role: 'member',
              assignedBy: 1, // Id del usuario administrador por defecto
              isActive: true
            });
            console.log(`Nuevo proyecto ${projectId} asignado al empleado ${empleadoId}`);
          }
        } else {
          console.log(`El proyecto ${projectId} no existe, no se puede asignar`);
        }
      }
    }
    
    return res.status(200).json({
      ...empleadoActualizado,
      projectIds: projectIds || []
    });
  } catch (error) {
    console.error(`Error al actualizar empleado con ID ${req.params.id}:`, error);
    return res.status(500).json({ error: 'Error al actualizar los datos del empleado' });
  }
});

// Cambiar el estado de un empleado
empleadosRouter.patch('/:id/estado', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Validar los datos recibidos
    const validacionResultado = cambiarEstadoSchema.safeParse(req.body);
    
    if (!validacionResultado.success) {
      return res.status(400).json({ 
        error: 'Datos de estado inválidos',
        details: validacionResultado.error.format() 
      });
    }
    
    const { estado } = validacionResultado.data;
    
    // Verificar que el empleado existe
    const [empleadoExistente] = await db.select()
      .from(employees)
      .where(eq(employees.id, parseInt(id)));
    
    if (!empleadoExistente) {
      return res.status(404).json({ error: 'Empleado no encontrado' });
    }
    
    // Actualizar el estado del empleado
    const [empleadoActualizado] = await db.update(employees)
      .set({ contractStatus: estado })
      .where(eq(employees.id, parseInt(id)))
      .returning();
    
    return res.status(200).json(empleadoActualizado);
  } catch (error) {
    console.error(`Error al cambiar estado del empleado con ID ${req.params.id}:`, error);
    return res.status(500).json({ error: 'Error al cambiar el estado del empleado' });
  }
});

// Obtener los proyectos asignados a un empleado
empleadosRouter.get('/:id/proyectos', async (req: Request, res: Response) => {
  try {
    const empleadoId = parseInt(req.params.id);
    
    // Verificar que el empleado existe
    const [empleado] = await db.select()
      .from(employees)
      .where(eq(employees.id, empleadoId));
    
    if (!empleado) {
      return res.status(404).json({ error: 'Empleado no encontrado' });
    }
    
    const proyectos = [];
    
    // Primero verificamos si hay un proyecto principal asignado en id_employed_proyects
    if (empleado.id_employed_proyects) {
      const [proyectoPrincipal] = await db
        .select({
          id: projects.id,
          name: projects.name,
          description: projects.description,
          status: projects.status,
          startDate: projects.startDate,
          endDate: projects.endDate,
          category: projects.category,
          isPrincipal: sql`true`.as('isPrincipal')
        })
        .from(projects)
        .where(eq(projects.id, empleado.id_employed_proyects))
        .limit(1);
      
      if (proyectoPrincipal) {
        proyectos.push(proyectoPrincipal);
      }
    }
    
    // Consulta de asignaciones activas en la tabla employee_projects
    const asignaciones = await db
      .select({
        employeeProjectId: employeeProjects.id,
        projectId: employeeProjects.projectId,
        role: employeeProjects.role
      })
      .from(employeeProjects)
      .where(and(
        eq(employeeProjects.employeeId, empleadoId),
        eq(employeeProjects.isActive, true)
      ));
    
    if (asignaciones.length === 0 && proyectos.length === 0) {
      return res.status(200).json({
        empleadoId: empleadoId,
        cantidadProyectos: 0,
        proyectos: []
      });
    }
    
    // Obtener los proyectos correspondientes a las asignaciones
    for (const asignacion of asignaciones) {
      // Verificar que no sea el mismo que el proyecto principal
      if (empleado.id_employed_proyects && empleado.id_employed_proyects === asignacion.projectId) {
        continue; // Saltamos este proyecto ya que es el principal y ya se incluyó
      }
      
      const [proyecto] = await db
        .select({
          id: projects.id,
          name: projects.name,
          description: projects.description,
          status: projects.status,
          startDate: projects.startDate,
          endDate: projects.endDate,
          category: projects.category,
          isPrincipal: sql`false`.as('isPrincipal')
        })
        .from(projects)
        .where(eq(projects.id, asignacion.projectId))
        .limit(1);
      
      if (proyecto) {
        proyectos.push(proyecto);
      }
    }
    
    return res.status(200).json({
      empleadoId: empleadoId,
      cantidadProyectos: proyectos.length,
      proyectos: proyectos
    });
  } catch (error) {
    console.error(`Error al obtener proyectos del empleado con ID ${req.params.id}:`, error);
    return res.status(500).json({ error: 'Error al obtener los proyectos del empleado' });
  }
});

// Eliminar un empleado (desactivar)
empleadosRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Verificar que el empleado existe
    const [empleadoExistente] = await db.select()
      .from(employees)
      .where(eq(employees.id, parseInt(id)));
    
    if (!empleadoExistente) {
      return res.status(404).json({ error: 'Empleado no encontrado' });
    }
    
    // En lugar de eliminar, cambiamos el estado a inactivo
    const [empleadoDesactivado] = await db.update(employees)
      .set({ contractStatus: 'terminated' })
      .where(eq(employees.id, parseInt(id)))
      .returning();
    
    return res.status(200).json({
      message: 'Empleado eliminado correctamente',
      empleado: empleadoDesactivado
    });
  } catch (error) {
    console.error(`Error al eliminar empleado con ID ${req.params.id}:`, error);
    return res.status(500).json({ error: 'Error al eliminar el empleado' });
  }
});

export default empleadosRouter;