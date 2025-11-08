import { Request, Response } from 'express';
import { CreateEmpleadoUseCase } from '../../../application/use-cases/empleados/create-empleados.use-case';
import { GetEmpleadosUseCase } from '../../../application/use-cases/empleados/get-empleados.use-case';
import { GetEmpleadoByIdUseCase } from '../../../application/use-cases/empleados/get-empleado-by-id.use-case';
import { UpdateEmpleadoUseCase } from '../../../application/use-cases/empleados/update-empleado.use-case';
import { DeleteEmpleadoUseCase } from '../../../application/use-cases/empleados/delete-empleado.use-case';
import { EmpleadoFiltros } from '../../../domain/repositories/empleados.repository';

/**
 * Controlador HTTP para empleados
 */
export class EmpleadoController {
  constructor(
    private readonly createEmpleadoUseCase: CreateEmpleadoUseCase,
    private readonly getEmpleadosUseCase: GetEmpleadosUseCase,
    private readonly getEmpleadoByIdUseCase: GetEmpleadoByIdUseCase,
    private readonly updateEmpleadoUseCase: UpdateEmpleadoUseCase,
    private readonly deleteEmpleadoUseCase: DeleteEmpleadoUseCase
  ) {}

  async create(req: Request, res: Response): Promise<void> {
    try {
      const dto = req.body;
      const userId = (req.user as any)?.id; // Obtener userId de la sesión si existe
      const result = await this.createEmpleadoUseCase.execute(dto, userId);
      res.status(201).json(result);
    } catch (error) {
      const message = (error as Error).message;
      if (message.includes('Ya existe')) {
        res.status(409).json({ error: message });
      } else if (message.includes('validación')) {
        res.status(400).json({ error: message });
      } else {
        res.status(500).json({ error: message });
      }
    }
  }

  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const filtros: EmpleadoFiltros = {
        proyectoId: req.query.proyectoId ? parseInt(req.query.proyectoId as string) : undefined,
        q: req.query.q as string,
        estadoContrato: req.query.estadoContrato as any,
        tipoContrato: req.query.tipoContrato as string,
        depto: req.query.depto as string,
      };

      const result = await this.getEmpleadosUseCase.execute(filtros);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ error: 'ID inválido' });
        return;
      }

      const result = await this.getEmpleadoByIdUseCase.execute(id);
      res.status(200).json(result);
    } catch (error) {
      const message = (error as Error).message;
      if (message.includes('no encontrado')) {
        res.status(404).json({ error: message });
      } else {
        res.status(500).json({ error: message });
      }
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ error: 'ID inválido' });
        return;
      }

      const dto = req.body;
      const result = await this.updateEmpleadoUseCase.execute(id, dto);
      res.status(200).json(result);
    } catch (error) {
      const message = (error as Error).message;
      if (message.includes('no encontrado')) {
        res.status(404).json({ error: message });
      } else if (message.includes('Ya existe')) {
        res.status(409).json({ error: message });
      } else if (message.includes('validación')) {
        res.status(400).json({ error: message });
      } else {
        res.status(500).json({ error: message });
      }
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ error: 'ID inválido' });
        return;
      }

      await this.deleteEmpleadoUseCase.execute(id);
      res.status(204).send();
    } catch (error) {
      const message = (error as Error).message;
      if (message.includes('no encontrado')) {
        res.status(404).json({ error: message });
      } else {
        res.status(500).json({ error: message });
      }
    }
  }
}
