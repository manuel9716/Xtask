import { Payroll, Employee } from '@shared/schema';

/**
 * Generador de PDF simulado para desprendibles de nómina
 * Solución temporal para evitar problemas de importación
 */
export class NominaPdfGeneratorMock {
  /**
   * Genera un PDF con el desprendible de nómina (simulado)
   */
  async generarDesprendible(
    nomina: Payroll,
    empleado: Employee,
    nombreEmpleado: string
  ): Promise<Buffer> {
    // Simular la generación de un PDF simple con texto plano
    console.log('Generando desprendible de nómina simulado para:', {
      nomina,
      empleado,
      nombreEmpleado
    });
    
    // Devolver un buffer vacío simulado (sería el contenido del PDF)
    return Buffer.from(
      `DESPRENDIBLE DE NÓMINA
      
ID Nómina: ${nomina.id}
Empleado: ${nombreEmpleado} (ID: ${empleado.id})
Período: ${nomina.periodStart.toLocaleDateString()} - ${nomina.periodEnd.toLocaleDateString()}
      
=== DETALLE ===
Salario Bruto: ${nomina.grossSalary}
Deducciones: ${nomina.deductions}
Beneficios: ${nomina.benefits}
Impuestos: ${nomina.taxes}
Salario Neto: ${nomina.netSalary}
      
Estado: ${nomina.status}
      
Generado el: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}
      
Este es un desprendible simulado para fines de desarrollo.
`
    );
  }
}