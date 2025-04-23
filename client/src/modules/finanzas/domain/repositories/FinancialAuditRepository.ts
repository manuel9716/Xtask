import { FinancialAudit, InsertFinancialAudit } from "@shared/schema";

/**
 * Interfaz para el repositorio de auditoría financiera siguiendo el patrón de arquitectura hexagonal.
 * Esta interfaz define los métodos que debe implementar cualquier adaptador de infraestructura
 * que quiera proporcionar acceso a los datos de auditoría financiera.
 */
export interface FinancialAuditRepository {
  /**
   * Obtiene todos los registros de auditoría financiera.
   * @param filters Filtros opcionales para la consulta.
   * @returns Promise con la lista de registros de auditoría.
   */
  getAllAuditRecords(filters?: Partial<{
    entityType?: string;
    entityId?: number;
    action?: string;
    performedBy?: number;
    startDate?: Date;
    endDate?: Date;
  }>): Promise<FinancialAudit[]>;

  /**
   * Obtiene un registro de auditoría por su ID.
   * @param id ID del registro de auditoría a obtener.
   * @returns Promise con el registro de auditoría o undefined si no existe.
   */
  getAuditRecordById(id: number): Promise<FinancialAudit | undefined>;

  /**
   * Registra una acción en la auditoría financiera.
   * @param auditRecord Datos del registro de auditoría a crear.
   * @returns Promise con el registro de auditoría creado.
   */
  logAuditRecord(auditRecord: InsertFinancialAudit): Promise<FinancialAudit>;

  /**
   * Obtiene el historial de cambios de una entidad.
   * @param entityType Tipo de entidad (transacción, factura, nómina, presupuesto).
   * @param entityId ID de la entidad.
   * @returns Promise con la lista de registros de auditoría para esa entidad.
   */
  getEntityChangeHistory(entityType: string, entityId: number): Promise<FinancialAudit[]>;

  /**
   * Detecta posibles irregularidades en las transacciones financieras.
   * @param parameters Parámetros para la detección de irregularidades.
   * @returns Promise con la lista de irregularidades detectadas.
   */
  detectIrregularities(parameters: {
    startDate: Date;
    endDate: Date;
    thresholds?: {
      amount?: number;
      frequency?: number;
      timeWindow?: number;
    };
  }): Promise<Array<{
    type: string;
    entityType: string;
    entityId: number;
    description: string;
    severity: 'low' | 'medium' | 'high';
    detectedAt: Date;
  }>>;
  
  /**
   * Verifica si una transacción cumple con las políticas financieras.
   * @param transactionId ID de la transacción a verificar.
   * @returns Promise con el resultado de la verificación.
   */
  verifyTransactionCompliance(transactionId: number): Promise<{
    compliant: boolean;
    issues: string[];
  }>;
  
  /**
   * Genera un reporte de auditoría.
   * @param parameters Parámetros para generar el reporte.
   * @returns Promise con la URL del reporte generado.
   */
  generateAuditReport(parameters: {
    startDate: Date;
    endDate: Date;
    entityType?: string;
    entityId?: number;
    performedBy?: number;
    action?: string;
    format: 'pdf' | 'excel';
  }): Promise<string>;
  
  /**
   * Verifica la integridad de los datos financieros.
   * @param parameters Parámetros para la verificación de integridad.
   * @returns Promise con el resultado de la verificación.
   */
  verifyDataIntegrity(parameters: {
    startDate: Date;
    endDate: Date;
    entities?: string[];
  }): Promise<{
    valid: boolean;
    issues: Array<{
      entityType: string;
      entityId: number;
      description: string;
      severity: 'low' | 'medium' | 'high';
    }>;
  }>;
}