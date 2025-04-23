import { Presupuesto, CreatePresupuestoDto, UpdatePresupuestoDto } from '../entities/Presupuesto';

/**
 * Interfaz que define las operaciones disponibles en el repositorio de presupuestos
 * Siguiendo el patrón de Arquitectura Hexagonal, esta interfaz es un puerto que permite
 * comunicar el dominio con la infraestructura, sin generar dependencias directas
 */
export interface IPresupuestoRepository {
  /**
   * Obtiene todos los presupuestos
   */
  getAll(organizationId: number): Promise<Presupuesto[]>;
  
  /**
   * Obtiene un presupuesto por su id
   */
  getById(id: number): Promise<Presupuesto | null>;
  
  /**
   * Crea un nuevo presupuesto
   */
  create(data: CreatePresupuestoDto): Promise<Presupuesto>;
  
  /**
   * Actualiza un presupuesto existente
   */
  update(id: number, data: UpdatePresupuestoDto): Promise<Presupuesto>;
  
  /**
   * Registra un gasto en un presupuesto específico
   */
  registrarGasto(id: number, monto: number): Promise<Presupuesto>;
  
  /**
   * Importa presupuestos desde un archivo CSV
   */
  importarDesdeCSV(csvData: string, organizationId: number): Promise<Presupuesto[]>;
}