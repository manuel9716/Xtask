import { ResultadoCalculoNomina } from '../../domain/services/CalculoNominaEmpleado';
import { apiRequest } from '@/lib/queryClient';

/**
 * Interfaz para el resultado de la generación de un PDF
 */
export interface ResultadoGeneracionPDF {
  success: boolean;
  pdfUrl?: string;
  message?: string;
  error?: string;
}

/**
 * Genera un PDF de desprendible de nómina a partir de datos calculados
 * @param datosNomina Datos calculados de la nómina
 * @returns Promesa con el resultado de la generación del PDF
 */
export async function generarDesprendiblePDF(datosNomina: ResultadoCalculoNomina): Promise<ResultadoGeneracionPDF> {
  try {
    // Llamar al endpoint de generación de desprendibles
    const response = await apiRequest(
      'POST',
      '/api/finanzas/nomina/desprendible/generar',
      datosNomina
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        error: errorData.error || 'Error al generar el desprendible de nómina'
      };
    }
    
    const data = await response.json();
    
    if (!data.pdfUrl) {
      return {
        success: false,
        error: 'No se pudo obtener la URL del desprendible generado'
      };
    }
    
    return {
      success: true,
      pdfUrl: data.pdfUrl,
      message: data.message || 'Desprendible generado correctamente'
    };
  } catch (error) {
    console.error('Error al generar el desprendible de nómina:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido al generar el desprendible'
    };
  }
}

/**
 * Abre un PDF de desprendible de nómina en una nueva ventana
 * @param pdfUrl URL del PDF a abrir
 */
export function abrirDesprendiblePDF(pdfUrl: string): void {
  window.open(pdfUrl, '_blank');
}

/**
 * Fuerza la descarga de un PDF de desprendible de nómina
 * @param nominaId ID de la nómina cuyo desprendible se descargará
 * @param nombreEmpleado Nombre del empleado para incluir en el nombre del archivo
 */
export async function descargarDesprendiblePDF(nominaId: number, nombreEmpleado?: string): Promise<void> {
  try {
    // Configurar nombre del archivo
    const nombreArchivo = nombreEmpleado 
      ? `desprendible_${nombreEmpleado.replace(/\s+/g, '_').toLowerCase()}_${nominaId}.pdf`
      : `desprendible_${nominaId}.pdf`;

    // Crear un elemento <a> temporal
    const link = document.createElement('a');
    link.href = `/api/finanzas/nomina/${nominaId}/desprendible`;
    link.setAttribute('download', nombreArchivo);
    
    // Anexar a la página, hacer clic y remover
    document.body.appendChild(link);
    link.click();
    
    // Limpiar el DOM
    setTimeout(() => {
      document.body.removeChild(link);
    }, 100);
  } catch (error) {
    console.error('Error al descargar el desprendible de nómina:', error);
    throw error;
  }
}