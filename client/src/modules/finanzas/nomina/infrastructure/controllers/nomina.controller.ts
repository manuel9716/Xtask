import { Request, Response } from 'express';
import { NominaRepository } from '../repositories/nomina.pg.repository';
import { 
  ProcesarNominaDTO, 
  MarcarComoPagadaDTO, 
  CambiarEstadoNominaDTO,
  ConsultarNominasDTO,
  EstadoNomina
} from '../../domain/entities/Nomina';
import { NominaPdfGenerator } from '../pdf/nominaPdfGenerator';

/**
 * Controlador para las operaciones de nómina
 */
export class NominaController {
  private repository: NominaRepository;
  private pdfGenerator: NominaPdfGenerator;

  constructor() {
    this.repository = new NominaRepository();
    this.pdfGenerator = new NominaPdfGenerator();
  }

  /**
   * Obtiene todas las nóminas con posibles filtros
   */
  async obtenerNominas(req: Request, res: Response) {
    try {
      const { 
        empleadoId, 
        mes, 
        anio, 
        estado, 
        page = '1', 
        limit = '10' 
      } = req.query;

      // Construir filtros basados en los query params
      const filtros: any = {
        page: parseInt(page as string, 10) || 1,
        limit: parseInt(limit as string, 10) || 10
      };

      if (empleadoId) {
        filtros.empleadoId = parseInt(empleadoId as string, 10);
      }

      // Si se especifican mes y año, crear el rango de fechas
      if (mes && anio) {
        const mesInt = parseInt(mes as string, 10);
        const anioInt = parseInt(anio as string, 10);
        
        if (!isNaN(mesInt) && !isNaN(anioInt) && mesInt >= 1 && mesInt <= 12) {
          // Crear fechas para el primer y último día del mes
          filtros.desde = new Date(anioInt, mesInt - 1, 1);
          filtros.hasta = new Date(anioInt, mesInt, 0); // El día 0 del siguiente mes es el último día del mes actual
        }
      }

      if (estado) {
        filtros.estado = estado;
      }

      // Obtener las nóminas con los filtros especificados
      const { nominas, total } = await this.repository.obtenerNominas(filtros);

      // Versión simplificada sin consultas adicionales a la BD
      const nominasConEmpleados = nominas.map(nomina => ({
        ...nomina,
        nombreEmpleado: `Empleado #${nomina.employeeId}`
      }));

      res.status(200).json({
        nominas: nominasConEmpleados,
        pagination: {
          page: filtros.page,
          limit: filtros.limit,
          total,
          totalPages: Math.ceil(total / filtros.limit)
        }
      });
    } catch (error: any) {
      console.error('Error al obtener nóminas:', error);
      res.status(500).json({ error: error.message || 'Error al obtener nóminas' });
    }
  }

  /**
   * Obtiene una nómina específica por su ID
   */
  async obtenerNominaPorId(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const nominaId = parseInt(id, 10);

      if (isNaN(nominaId)) {
        return res.status(400).json({ error: 'ID de nómina inválido' });
      }

      const nomina = await this.repository.obtenerNominaPorId(nominaId);

      if (!nomina) {
        return res.status(404).json({ error: 'Nómina no encontrada' });
      }

      // Obtener información del empleado
      const empleado = await this.repository.obtenerEmpleadoPorId(nomina.employeeId);
      
      // Simplificado para evitar consultas a la BD
      const nombreEmpleado = `Empleado #${nomina.employeeId}`;

      res.status(200).json({
        ...nomina,
        empleado,
        nombreEmpleado
      });
    } catch (error: any) {
      console.error(`Error al obtener nómina por ID:`, error);
      res.status(500).json({ error: error.message || 'Error al obtener la nómina' });
    }
  }

  /**
   * Procesa la nómina para un periodo específico
   */
  async procesarNomina(req: Request, res: Response) {
    try {
      // Validar los datos recibidos
      const validacionResult = ProcesarNominaDTO.safeParse(req.body);
      
      if (!validacionResult.success) {
        return res.status(400).json({ 
          error: 'Datos inválidos para procesar nómina',
          detalles: validacionResult.error.format() 
        });
      }

      // Comprobar que el usuario tiene permisos
      if (!this.tienePermisoFinanzas(req)) {
        return res.status(403).json({ 
          error: 'No tiene permisos para procesar nóminas' 
        });
      }

      // Procesar la nómina
      const params = validacionResult.data;
      const nominasProcesadas = await this.repository.procesarNomina({
        ...params,
        usuarioId: req.user?.id || params.usuarioId
      });

      res.status(201).json({
        mensaje: `Se procesaron ${nominasProcesadas.length} nóminas exitosamente`,
        nominas: nominasProcesadas
      });
    } catch (error: any) {
      console.error('Error al procesar nómina:', error);
      res.status(500).json({ error: error.message || 'Error al procesar la nómina' });
    }
  }

  /**
   * Marca una nómina como pagada
   */
  async marcarComoPagada(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const nominaId = parseInt(id, 10);

      if (isNaN(nominaId)) {
        return res.status(400).json({ error: 'ID de nómina inválido' });
      }

      // Validar los datos recibidos
      const validacionResult = MarcarComoPagadaDTO.safeParse({
        ...req.body,
        nominaId,
        usuarioId: req.user?.id || req.body.usuarioId
      });
      
      if (!validacionResult.success) {
        return res.status(400).json({ 
          error: 'Datos inválidos para marcar como pagada',
          detalles: validacionResult.error.format() 
        });
      }

      // Comprobar que el usuario tiene permisos
      if (!this.tienePermisoFinanzas(req)) {
        return res.status(403).json({ 
          error: 'No tiene permisos para marcar nóminas como pagadas' 
        });
      }

      // Marcar la nómina como pagada
      const nominaActualizada = await this.repository.marcarComoPagada(validacionResult.data);

      res.status(200).json({
        mensaje: 'Nómina marcada como pagada exitosamente',
        nomina: nominaActualizada
      });
    } catch (error: any) {
      console.error('Error al marcar nómina como pagada:', error);
      res.status(500).json({ error: error.message || 'Error al marcar la nómina como pagada' });
    }
  }

  /**
   * Cambia el estado de una nómina
   */
  async cambiarEstadoNomina(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const nominaId = parseInt(id, 10);

      if (isNaN(nominaId)) {
        return res.status(400).json({ error: 'ID de nómina inválido' });
      }

      // Validar los datos recibidos
      const validacionResult = CambiarEstadoNominaDTO.safeParse({
        ...req.body,
        nominaId,
        usuarioId: req.user?.id || req.body.usuarioId
      });
      
      if (!validacionResult.success) {
        return res.status(400).json({ 
          error: 'Datos inválidos para cambiar estado',
          detalles: validacionResult.error.format() 
        });
      }

      // Comprobar que el usuario tiene permisos
      if (!this.tienePermisoFinanzas(req)) {
        return res.status(403).json({ 
          error: 'No tiene permisos para cambiar el estado de nóminas' 
        });
      }

      // Cambiar el estado de la nómina
      const nominaActualizada = await this.repository.cambiarEstadoNomina(validacionResult.data);

      res.status(200).json({
        mensaje: `Estado de nómina actualizado a ${validacionResult.data.nuevoEstado}`,
        nomina: nominaActualizada
      });
    } catch (error: any) {
      console.error('Error al cambiar estado de nómina:', error);
      res.status(500).json({ error: error.message || 'Error al cambiar el estado de la nómina' });
    }
  }

  /**
   * Genera y devuelve un PDF con el desprendible de nómina
   */
  async generarDesprendible(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const nominaId = parseInt(id, 10);

      if (isNaN(nominaId)) {
        return res.status(400).json({ error: 'ID de nómina inválido' });
      }

      // Obtener la nómina
      const nomina = await this.repository.obtenerNominaPorId(nominaId);

      if (!nomina) {
        return res.status(404).json({ error: 'Nómina no encontrada' });
      }

      // Obtener el empleado
      const empleado = await this.repository.obtenerEmpleadoPorId(nomina.employeeId);

      if (!empleado) {
        return res.status(404).json({ error: 'Empleado no encontrado' });
      }

      // Simplificado para evitar consultas a la BD
      const nombreEmpleado = `Empleado #${empleado.id}`;

      // Generar el PDF
      const pdfBuffer = await this.pdfGenerator.generarDesprendible(nomina, empleado, nombreEmpleado);

      // Enviar el PDF como respuesta
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=desprendible_${nomina.id}.pdf`);
      res.send(pdfBuffer);
    } catch (error: any) {
      console.error('Error al generar desprendible de nómina:', error);
      res.status(500).json({ error: error.message || 'Error al generar el desprendible de nómina' });
    }
  }

  /**
   * Obtiene los empleados disponibles para procesar nómina
   */
  async obtenerEmpleados(req: Request, res: Response) {
    try {
      // Obtener todos los empleados
      const empleados = await this.repository.obtenerEmpleados();

      // Obtener información adicional de los usuarios (nombres)
      const empleadosConNombres = await Promise.all(
        empleados.map(async (empleado) => {
          let nombre = `Empleado #${empleado.id}`;
          
          if (empleado.userId) {
            const [usuario] = await db.select({ fullName: users.fullName })
              .from(users)
              .where(eq(users.id, empleado.userId));
            
            if (usuario) {
              nombre = usuario.fullName;
            }
          }
          
          return {
            ...empleado,
            nombre
          };
        })
      );

      res.status(200).json(empleadosConNombres);
    } catch (error: any) {
      console.error('Error al obtener empleados:', error);
      res.status(500).json({ error: error.message || 'Error al obtener empleados' });
    }
  }

  /**
   * Verifica si el usuario tiene permisos de finanzas
   */
  private tienePermisoFinanzas(req: Request): boolean {
    // Verificar si el usuario está autenticado
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      return false;
    }

    // Verificar el rol del usuario (admin o admin_finanzas tienen acceso)
    const roles = ['admin', 'admin_finanzas'];
    return roles.includes(req.user?.role || '');
  }
}