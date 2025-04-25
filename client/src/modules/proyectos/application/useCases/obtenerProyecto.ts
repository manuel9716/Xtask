import { useQuery } from '@tanstack/react-query';
import { Proyecto } from '../../domain/entities/Proyecto';
import { ProyectoService } from '../../domain/services/ProyectoService';
import { proyectosRepository } from '../../infrastructure/di/container';

// Instancia del servicio con el repositorio inyectado
const proyectoService = new ProyectoService(proyectosRepository);

/**
 * Hook para obtener un proyecto por ID con cálculos adicionales
 */
export function useProyecto(id: number) {
  const queryResult = useQuery<Proyecto, Error>({
    queryKey: ['/api/proyectos', id],
    queryFn: () => proyectoService.obtenerProyecto(id),
    enabled: !!id, // Solo ejecuta la consulta si id es truthy
  });

  const { data: proyecto } = queryResult;

  // Información adicional calculada si existe el proyecto
  const proyectoConCalculos = proyecto
    ? {
        ...proyecto,
        // Cálculos de negocio adicionales que enriquecen el modelo para la UI
        progreso: proyectoService.calcularProgreso(proyecto),
        retrasado: proyectoService.estaRetrasado(proyecto),
        diasRestantes: calcularDiasRestantes(proyecto),
      }
    : null;

  return {
    ...queryResult,
    proyecto: proyectoConCalculos,
  };
}

// Función auxiliar para calcular días restantes
function calcularDiasRestantes(proyecto: Proyecto): number | null {
  if (!proyecto.fechaFinPrevista) return null;
  
  const ahora = new Date();
  const fechaFin = new Date(proyecto.fechaFinPrevista);
  
  // Si el proyecto ya debería haber terminado
  if (ahora > fechaFin) return 0;
  
  // Calcular diferencia en días
  const diffTime = fechaFin.getTime() - ahora.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}