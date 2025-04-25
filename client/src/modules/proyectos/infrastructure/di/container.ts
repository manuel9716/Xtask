import { ProyectoService } from '../../domain/services/ProyectoService';
import { ProyectoApiAdapter } from '../api/ProyectoApiAdapter';

/**
 * Contenedor de dependencias para el módulo de proyectos
 * Implementa el patrón singleton para servicios compartidos
 */

// Repositorios
const proyectoRepository = new ProyectoApiAdapter();

// Servicios de dominio
export const proyectoService = new ProyectoService(proyectoRepository);