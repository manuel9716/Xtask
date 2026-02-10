import { Router } from 'express';
import { EmpleadoController } from '../controllers/empleados.controller';
import { EmpleadoRepositoryImpl } from '../../../infrastructure/persistence/repositories/empleados.repository.impl';
import { CreateEmpleadoUseCase } from '../../../application/use-cases/create-empleados.use-case';
import { GetEmpleadosUseCase } from '../../../application/use-cases/get-empleados.use-case';
import { GetEmpleadoByIdUseCase } from '../../../application/use-cases/get-empleado-by-id.use-case';
import { UpdateEmpleadoUseCase } from '../../../application/use-cases/update-empleado.use-case';
import { DeleteEmpleadoUseCase } from '../../../application/use-cases/delete-empleado.use-case';

/**
 * Configuración de inyección de dependencias y rutas para empleados
 */
export function createEmpleadoRoutes(): Router {
  const router = Router();

  // Inyección de dependencias
  const empleadoRepository = new EmpleadoRepositoryImpl();
  
  const createEmpleadoUseCase = new CreateEmpleadoUseCase(empleadoRepository);
  const getEmpleadosUseCase = new GetEmpleadosUseCase(empleadoRepository);
  const getEmpleadoByIdUseCase = new GetEmpleadoByIdUseCase(empleadoRepository);
  const updateEmpleadoUseCase = new UpdateEmpleadoUseCase(empleadoRepository);
  const deleteEmpleadoUseCase = new DeleteEmpleadoUseCase(empleadoRepository);

  const controller = new EmpleadoController(
    createEmpleadoUseCase,
    getEmpleadosUseCase,
    getEmpleadoByIdUseCase,
    updateEmpleadoUseCase,
    deleteEmpleadoUseCase
  );

  // Rutas
  router.get('/', (req, res) => controller.getAll(req, res));
  router.get('/:id', (req, res) => controller.getById(req, res));
  router.post('/', (req, res) => controller.create(req, res));
  router.put('/:id', (req, res) => controller.update(req, res));
  router.delete('/:id', (req, res) => controller.delete(req, res));

  return router;
}
