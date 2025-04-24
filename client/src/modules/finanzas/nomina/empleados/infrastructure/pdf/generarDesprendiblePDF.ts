import { ResultadoCalculoNomina } from '../../domain/services/CalculoNominaEmpleado';

/**
 * Genera un desprendible de nómina en formato PDF
 * @param datosNomina Datos calculados de la nómina
 * @returns URL para descargar el PDF generado
 */
export const generarDesprendiblePDF = async (datosNomina: ResultadoCalculoNomina): Promise<string> => {
  try {
    // Enviar datos al servidor para generar el PDF
    const response = await fetch('/api/finanzas/nomina/desprendible/generar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(datosNomina),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al generar el desprendible de nómina');
    }
    
    const data = await response.json();
    return data.pdfUrl;
  } catch (error) {
    console.error('Error al generar el PDF del desprendible:', error);
    throw error;
  }
};

/**
 * Descarga un desprendible de nómina previamente generado
 * @param nominaId ID de la nómina para descargar
 */
export const descargarDesprendiblePDF = (nominaId: number): void => {
  // Abre una nueva ventana para descargar el PDF
  window.open(`/api/finanzas/nomina/desprendible/${nominaId}`, '_blank');
};