/**
 * Caso de uso: Listar Nóminas
 * Permite recuperar una lista de nóminas con filtros y paginación
 */

import { Nomina, NominaFiltros } from "../../../domain/entities/Nomina";
import { NominasApi } from "../../../infrastructure/api/nominasApi";

export interface ListarNominasResult {
  nominas: Nomina[];
  total: number;
  pagina: number;
  totalPaginas: number;
}

export class ListarNominasUseCase {
  /**
   * Ejecuta el caso de uso para listar nóminas
   * @param filtros Filtros opcionales para la consulta
   * @returns Resultado paginado con las nóminas
   */
  async execute(filtros?: NominaFiltros): Promise<ListarNominasResult> {
    try {
      // Se aplican filtros por defecto si no se especifican
      const filtrosDefault: NominaFiltros = {
        pagina: 1,
        porPagina: 10,
        ordenarPor: 'createdAt',
        direccion: 'DESC',
        ...filtros
      };
      
      // Se llama a la API para obtener los datos
      const resultado = await NominasApi.obtenerNominas(filtrosDefault);
      
      return {
        nominas: resultado.nominas,
        total: resultado.total,
        pagina: resultado.pagina,
        totalPaginas: resultado.totalPaginas
      };
    } catch (error) {
      console.error("Error al listar nóminas:", error);
      throw error;
    }
  }
}