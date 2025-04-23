import { Presupuesto } from '../../domain/entities/Presupuesto';

/**
 * Utilidad para generar PDFs de presupuestos
 * 
 * Nota: Esta es una implementación simulada. En un entorno real, 
 * usaríamos una biblioteca como jsPDF para generar PDFs reales.
 */
export class PresupuestoPdfGenerator {
  /**
   * Genera un PDF con el detalle de un presupuesto
   * 
   * @param presupuesto Presupuesto a exportar
   * @returns Una URL de objeto para el archivo PDF generado
   */
  generatePresupuestoPdf(presupuesto: Presupuesto): string {
    // En un entorno real, aquí generaríamos el PDF utilizando jsPDF o una biblioteca similar
    // Este es un ejemplo simplificado que devuelve una simulación
    
    console.log('Generando PDF para presupuesto:', presupuesto.nombre);
    
    // Creamos un objeto que representa el PDF (simulado)
    const pdfContent = {
      title: `Presupuesto: ${presupuesto.nombre}`,
      content: [
        { text: 'Detalles del Presupuesto', style: 'header' },
        { 
          table: {
            body: [
              ['Nombre', presupuesto.nombre],
              ['Monto Asignado', `$${presupuesto.monto.toFixed(2)}`],
              ['Monto Gastado', `$${presupuesto.gastado.toFixed(2)}`],
              ['Ejecución', `${presupuesto.porcentajeEjecucion.toFixed(2)}%`],
              ['Estado', presupuesto.estado],
              ['Área', presupuesto.area || 'No especificada'],
              ['Periodo', presupuesto.periodo],
              ['Fecha Inicio', presupuesto.fechaInicio.toLocaleDateString()],
              ['Fecha Fin', presupuesto.fechaFin.toLocaleDateString()]
            ]
          }
        },
        { text: 'Generado el ' + new Date().toLocaleDateString(), style: 'footer' }
      ]
    };
    
    // Convertir a JSON y codificar en base64 (simulando un PDF)
    const jsonString = JSON.stringify(pdfContent);
    const base64 = btoa(jsonString);
    
    // Crear una URL de objeto (simulando el archivo PDF)
    return `data:application/pdf;base64,${base64}`;
  }
  
  /**
   * Genera un PDF con un listado de presupuestos
   * 
   * @param presupuestos Lista de presupuestos a incluir en el reporte
   * @returns Una URL de objeto para el archivo PDF generado
   */
  generatePresupuestosListPdf(presupuestos: Presupuesto[]): string {
    console.log('Generando PDF para lista de presupuestos, cantidad:', presupuestos.length);
    
    // Creamos la tabla con los presupuestos
    const tableRows = presupuestos.map(p => [
      p.nombre,
      `$${p.monto.toFixed(2)}`,
      `$${p.gastado.toFixed(2)}`,
      `${p.porcentajeEjecucion.toFixed(2)}%`,
      p.estado,
      p.area || 'N/A'
    ]);
    
    // Agregamos encabezados
    tableRows.unshift(['Nombre', 'Monto', 'Gastado', 'Ejecución', 'Estado', 'Área']);
    
    // Creamos el objeto que representa el PDF (simulado)
    const pdfContent = {
      title: 'Reporte de Presupuestos',
      content: [
        { text: 'Listado de Presupuestos', style: 'header' },
        { 
          table: {
            headerRows: 1,
            body: tableRows
          }
        },
        { text: 'Generado el ' + new Date().toLocaleDateString(), style: 'footer' }
      ]
    };
    
    // Convertir a JSON y codificar en base64 (simulando un PDF)
    const jsonString = JSON.stringify(pdfContent);
    const base64 = btoa(jsonString);
    
    // Crear una URL de objeto (simulando el archivo PDF)
    return `data:application/pdf;base64,${base64}`;
  }
}