import { useQuery } from '@tanstack/react-query';
import { Payroll, Employee } from '@shared/schema';

/**
 * Hook para obtener el detalle completo de una nómina
 */
export function useDetalleNomina(nominaId: number | undefined) {
  // Si no hay ID, no hacer la consulta
  const enabled = nominaId !== undefined;
  
  const {
    data,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: [`/api/nomina/${nominaId}`],
    queryFn: async () => {
      // Si no hay ID, no ejecutar la consulta
      if (!nominaId) {
        throw new Error('ID de nómina no especificado');
      }
      
      const response = await fetch(`/api/nomina/${nominaId}`);
      if (!response.ok) {
        throw new Error('Error al obtener el detalle de la nómina');
      }
      return await response.json();
    },
    enabled
  });

  // Función para descargar el desprendible
  const descargarDesprendible = async () => {
    if (!nominaId) {
      throw new Error('ID de nómina no especificado');
    }
    
    try {
      // Realizar la petición para obtener el PDF
      const response = await fetch(`/api/nomina/${nominaId}/desprendible`);
      
      if (!response.ok) {
        throw new Error('Error al descargar el desprendible');
      }
      
      // Crear un blob para descargar el PDF
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      // Crear un enlace temporal y simular un clic para descargar
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `desprendible_${nominaId}.pdf`;
      document.body.appendChild(a);
      a.click();
      
      // Limpiar
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      return true;
    } catch (error) {
      console.error('Error al descargar desprendible:', error);
      throw error;
    }
  };

  // Extracción de datos para facilitar su uso
  const nomina: Payroll | undefined = data;
  const empleado: Employee | undefined = data?.empleado;
  const nombreEmpleado: string = data?.nombreEmpleado || '';
  
  // Información estructurada para facilitar su uso en la UI
  const detallesFormateados = nomina ? {
    id: nomina.id,
    empleado: nombreEmpleado,
    periodo: {
      inicio: nomina.periodStart ? new Date(nomina.periodStart).toLocaleDateString() : '',
      fin: nomina.periodEnd ? new Date(nomina.periodEnd).toLocaleDateString() : '',
    },
    montos: {
      sueldoBruto: parseFloat(nomina.grossSalary),
      sueldoNeto: parseFloat(nomina.netSalary),
      deducciones: parseFloat(nomina.deductions),
      beneficios: parseFloat(nomina.benefits),
      impuestos: parseFloat(nomina.taxes)
    },
    estado: nomina.status,
    pago: nomina.paymentDate ? {
      fecha: new Date(nomina.paymentDate).toLocaleDateString(),
      metodo: nomina.paymentMethod,
      referencia: nomina.paymentReference
    } : null,
    fechaCreacion: nomina.createdAt ? new Date(nomina.createdAt).toLocaleDateString() : '',
    fechaActualizacion: nomina.updatedAt ? new Date(nomina.updatedAt).toLocaleDateString() : ''
  } : undefined;

  return {
    nomina,
    empleado,
    nombreEmpleado,
    detallesFormateados,
    isLoading,
    isError,
    error,
    refetch,
    descargarDesprendible
  };
}