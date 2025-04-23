import { FinancialReport, InsertFinancialReport } from "@shared/schema";

/**
 * Interfaz para el repositorio de informes financieros siguiendo el patrón de arquitectura hexagonal.
 * Esta interfaz define los métodos que debe implementar cualquier adaptador de infraestructura
 * que quiera proporcionar acceso a los datos de informes financieros.
 */
export interface FinancialReportRepository {
  /**
   * Obtiene todos los informes financieros.
   * @param filters Filtros opcionales para la consulta.
   * @returns Promise con la lista de informes financieros.
   */
  getAllFinancialReports(filters?: Partial<{
    organizationId?: number;
    departmentId?: number;
    projectId?: number;
    type?: string;
    startDate?: Date;
    endDate?: Date;
    status?: string;
  }>): Promise<FinancialReport[]>;

  /**
   * Obtiene un informe financiero por su ID.
   * @param id ID del informe financiero a obtener.
   * @returns Promise con el informe financiero o undefined si no existe.
   */
  getFinancialReportById(id: number): Promise<FinancialReport | undefined>;

  /**
   * Crea un nuevo informe financiero.
   * @param report Datos del informe financiero a crear.
   * @returns Promise con el informe financiero creado.
   */
  createFinancialReport(report: InsertFinancialReport): Promise<FinancialReport>;

  /**
   * Actualiza un informe financiero existente.
   * @param id ID del informe financiero a actualizar.
   * @param report Datos del informe financiero a actualizar.
   * @returns Promise con el informe financiero actualizado o undefined si no existe.
   */
  updateFinancialReport(id: number, report: Partial<FinancialReport>): Promise<FinancialReport | undefined>;

  /**
   * Actualiza el estado de un informe financiero.
   * @param id ID del informe financiero a actualizar.
   * @param status Nuevo estado (borrador, publicado, archivado).
   * @returns Promise con el informe financiero actualizado o undefined si no existe.
   */
  updateFinancialReportStatus(id: number, status: string): Promise<FinancialReport | undefined>;
  
  /**
   * Genera un balance general.
   * @param parameters Parámetros para generar el balance general.
   * @returns Promise con los datos del balance general.
   */
  generateBalanceSheet(parameters: {
    organizationId: number;
    departmentId?: number;
    projectId?: number;
    asOfDate: Date;
  }): Promise<any>;
  
  /**
   * Genera un estado de resultados.
   * @param parameters Parámetros para generar el estado de resultados.
   * @returns Promise con los datos del estado de resultados.
   */
  generateIncomeStatement(parameters: {
    organizationId: number;
    departmentId?: number;
    projectId?: number;
    startDate: Date;
    endDate: Date;
  }): Promise<any>;
  
  /**
   * Genera un informe de flujo de caja.
   * @param parameters Parámetros para generar el informe de flujo de caja.
   * @returns Promise con los datos del informe de flujo de caja.
   */
  generateCashFlowStatement(parameters: {
    organizationId: number;
    departmentId?: number;
    projectId?: number;
    startDate: Date;
    endDate: Date;
  }): Promise<any>;
  
  /**
   * Genera un PDF del informe financiero.
   * @param id ID del informe financiero.
   * @returns Promise con la URL del archivo PDF generado.
   */
  generateReportPDF(id: number): Promise<string>;
  
  /**
   * Exporta los datos del informe financiero a Excel.
   * @param id ID del informe financiero.
   * @returns Promise con la URL del archivo Excel generado.
   */
  exportReportToExcel(id: number): Promise<string>;
  
  /**
   * Obtiene los datos comparativos de informes financieros.
   * @param parameters Parámetros para obtener los datos comparativos.
   * @returns Promise con los datos comparativos.
   */
  getComparativeReportData(parameters: {
    reportType: string;
    periods: { startDate: Date, endDate: Date }[];
    organizationId: number;
    departmentId?: number;
    projectId?: number;
  }): Promise<any>;
}