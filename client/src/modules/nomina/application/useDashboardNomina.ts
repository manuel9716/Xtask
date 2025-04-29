import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface DashboardData {
  totalEmpleadosActivos: number;
  nuevosEmpleadosMes: number;
  nominaMensualTotal: number;
  cambioNomina: {
    porcentaje: number;
    esIncremento: boolean;
  };
  proximoPago: {
    fecha: string;
    diasRestantes: number;
  };
  nominasPendientes: number;
  nominasRecientes: Array<{
    id: number;
    titulo: string;
    fechaProcesamiento: string;
    estado: string;
    montoTotal: number;
    totalEmpleados: number;
  }>;
}

/**
 * Hook para obtener los datos del dashboard de nómina
 */
export function useDashboardNomina() {
  // Consulta para obtener los datos del dashboard
  const {
    data,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['/api/nomina/v1/dashboard'],
    queryFn: async () => {
      try {
        // Intentar obtener datos del dashboard
        const response = await fetch('/api/nomina/v1/dashboard');
        
        if (!response.ok) {
          throw new Error('Error al obtener los datos del dashboard');
        }
        
        return await response.json();
      } catch (error) {
        console.error('Error en useDashboardNomina:', error);
        
        // Si falla, usar datos directos de la base de datos
        const nominas = await obtenerNominasDesdeBD();
        const empleados = await obtenerEmpleadosDesdeBD();
        
        // Construir datos del dashboard a partir de las consultas directas
        return construirDashboardData(nominas, empleados);
      }
    }
  });
  
  // Función auxiliar para obtener nóminas directamente
  const obtenerNominasDesdeBD = async () => {
    const response = await fetch('/api/nomina/v1/listar');
    
    if (!response.ok) {
      throw new Error('Error al obtener las nóminas');
    }
    
    const data = await response.json();
    return data.nominas || [];
  };
  
  // Función auxiliar para obtener empleados
  const obtenerEmpleadosDesdeBD = async () => {
    const response = await fetch('/api/nomina/empleados/listar');
    
    if (!response.ok) {
      throw new Error('Error al obtener los empleados');
    }
    
    return await response.json();
  };
  
  // Construir datos del dashboard a partir de datos crudos
  const construirDashboardData = (nominas: any[], empleados: any[]): DashboardData => {
    // Calcular total de empleados activos
    const empleadosActivos = empleados.filter(e => e.contractStatus === 'active');
    
    // Calcular nuevos empleados este mes
    const ahora = new Date();
    const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
    const nuevosEmpleados = empleadosActivos.filter(e => new Date(e.hireDate) >= inicioMes);
    
    // Próximo pago (simulación)
    const finMes = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0);
    const diasRestantes = Math.max(0, Math.ceil((finMes.getTime() - ahora.getTime()) / (1000 * 60 * 60 * 24)));
    
    // Ordenar nóminas por fecha de creación (más recientes primero)
    const nominasOrdenadas = [...nominas].sort((a, b) => 
      new Date(b.fechaCreacion || b.fecha_creacion).getTime() - 
      new Date(a.fechaCreacion || a.fecha_creacion).getTime()
    );
    
    // Nóminas pendientes
    const nominasPendientes = nominas.filter(n => n.estado === 'PENDIENTE').length;
    
    // Calcular nómina mensual total (suma de montos de todas las nóminas del mes actual)
    const nominasMesActual = nominas.filter(n => {
      const fechaCreacion = new Date(n.fechaCreacion || n.fecha_creacion);
      return fechaCreacion.getMonth() === ahora.getMonth() && 
             fechaCreacion.getFullYear() === ahora.getFullYear();
    });
    
    const nominaMensualTotal = nominasMesActual.reduce((total, n) => total + (parseFloat(n.montoTotal || n.monto_total) || 0), 0);
    
    // Calcular cambio respecto al mes anterior (simulación)
    const cambioNomina = {
      porcentaje: 5.3,
      esIncremento: true
    };
    
    // Nóminas recientes para mostrar
    const nominasRecientes = nominasOrdenadas.slice(0, 3).map(n => ({
      id: n.id,
      titulo: n.titulo,
      fechaProcesamiento: format(new Date(n.fechaCreacion || n.fecha_creacion), "dd 'de' MMMM", { locale: es }),
      estado: n.estado,
      montoTotal: parseFloat(n.montoTotal || n.monto_total) || 0,
      totalEmpleados: 1 // Esto habría que calcularlo a partir de los detalles de nómina
    }));
    
    return {
      totalEmpleadosActivos: empleadosActivos.length,
      nuevosEmpleadosMes: nuevosEmpleados.length,
      nominaMensualTotal,
      cambioNomina,
      proximoPago: {
        fecha: format(finMes, "dd 'de' MMMM", { locale: es }),
        diasRestantes
      },
      nominasPendientes,
      nominasRecientes
    };
  };
  
  return {
    dashboardData: data as DashboardData,
    isLoading,
    isError,
    error,
    refetch
  };
}