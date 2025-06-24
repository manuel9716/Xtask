import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  useProyectosConRecursos, 
  useRecursosPorProyecto, 
  useResumenNominaProyecto,
  useRegistrarPago,
  useMetricasNomina
} from '../../application/useCases/listarNominaPorProyecto';
import { NominaCard } from '../components/NominaCard';
import { DetallePagoModal } from '../components/DetallePagoModal';
import { NominaConDetalles, FiltrosNomina } from '../../domain/entities/Nomina';
import { 
  Building2, 
  Users, 
  DollarSign, 
  Calendar,
  Filter,
  TrendingUp,
  AlertCircle,
  Search
} from 'lucide-react';

export function PanelNomina() {
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState<number | null>(null);
  const [filtros, setFiltros] = useState<FiltrosNomina>({});
  const [nominaSeleccionada, setNominaSeleccionada] = useState<NominaConDetalles | null>(null);
  const [mostrarModalPago, setMostrarModalPago] = useState(false);

  // Queries
  const { data: proyectos, isLoading: cargandoProyectos } = useProyectosConRecursos();
  const { data: recursos, isLoading: cargandoRecursos } = useRecursosPorProyecto(proyectoSeleccionado, filtros);
  const { data: resumen } = useResumenNominaProyecto(proyectoSeleccionado, filtros.mes);
  const { data: metricas } = useMetricasNomina(proyectoSeleccionado || undefined);

  // Mutations
  const registrarPagoMutation = useRegistrarPago();

  // Función para formatear números en pesos colombianos
  const formatCOP = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleSeleccionarProyecto = (proyectoId: string) => {
    setProyectoSeleccionado(Number(proyectoId));
    setFiltros({});
  };

  const handleFiltroChange = (key: keyof FiltrosNomina, value: string) => {
    setFiltros(prev => ({
      ...prev,
      [key]: value === 'all' ? undefined : value
    }));
  };

  const handleRegistrarPago = (nomina: NominaConDetalles) => {
    setNominaSeleccionada(nomina);
    setMostrarModalPago(true);
  };

  const handleConfirmarPago = (data: any) => {
    if (nominaSeleccionada && proyectoSeleccionado) {
      registrarPagoMutation.mutate({
        proyectoId: proyectoSeleccionado,
        data: {
          ...data,
          recursoId: nominaSeleccionada.recursoId
        }
      }, {
        onSuccess: () => {
          setMostrarModalPago(false);
          setNominaSeleccionada(null);
        }
      });
    }
  };

  const handleVerDetalle = (nomina: NominaConDetalles) => {
    setNominaSeleccionada(nomina);
    setMostrarModalPago(true);
  };

  const handleVerHistorial = (recursoId: number) => {
    // TODO: Implementar modal de historial
    console.log('Ver historial del recurso:', recursoId);
  };

  const proyectoActual = proyectos?.find(p => p.id === proyectoSeleccionado);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#251948]">Gestión de Nómina</h2>
          <p className="text-gray-600">
            Administra los pagos de recursos asignados por proyecto
          </p>
        </div>
      </div>

      {/* Métricas generales */}
      {metricas && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-[#02BDEA]" />
                <div>
                  <p className="text-sm text-gray-600">Total Mensual</p>
                  <p className="text-lg font-bold text-[#251948]">
                    {formatCOP(metricas.totalMensual)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-[#FFA41B]" />
                <div>
                  <p className="text-sm text-gray-600">Pendiente Pago</p>
                  <p className="text-lg font-bold text-[#FFA41B]">
                    {formatCOP(metricas.pendientePago)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-[#623BA6]" />
                <div>
                  <p className="text-sm text-gray-600">Pagado Este Mes</p>
                  <p className="text-lg font-bold text-[#623BA6]">
                    {formatCOP(metricas.pagadoMes)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-[#251948]" />
                <div>
                  <p className="text-sm text-gray-600">Recursos Activos</p>
                  <p className="text-lg font-bold text-[#251948]">
                    {metricas.recursosActivos}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Selector de proyecto */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Seleccionar Proyecto
          </CardTitle>
          <CardDescription>
            Elige un proyecto para gestionar la nómina de sus recursos asignados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {cargandoProyectos ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <Select onValueChange={handleSeleccionarProyecto}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un proyecto con recursos..." />
              </SelectTrigger>
              <SelectContent>
                {proyectos?.map((proyecto) => (
                  <SelectItem key={proyecto.id} value={proyecto.id.toString()}>
                    <div className="flex items-center justify-between w-full">
                      <span>{proyecto.nombre}</span>
                      <Badge variant="outline" className="ml-2">
                        {proyecto.totalRecursos} recursos
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </CardContent>
      </Card>

      {/* Filtros y contenido del proyecto seleccionado */}
      {proyectoSeleccionado && (
        <>
          {/* Información del proyecto y filtros */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-[#251948]" />
                    {proyectoActual?.nombre}
                  </CardTitle>
                  <CardDescription>
                    Presupuesto: {proyectoActual?.monto ? formatCOP(proyectoActual.monto) : 'No definido'}
                  </CardDescription>
                </div>
                {resumen && (
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Costo mensual del proyecto</p>
                    <p className="text-xl font-bold text-[#02BDEA]">
                      {formatCOP(resumen.costoMensualTotal)}
                    </p>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">Filtros:</span>
                </div>
                
                <Select onValueChange={(value) => handleFiltroChange('mes', value)}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filtrar por mes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los meses</SelectItem>
                    <SelectItem value="2025-06">Junio 2025</SelectItem>
                    <SelectItem value="2025-05">Mayo 2025</SelectItem>
                    <SelectItem value="2025-04">Abril 2025</SelectItem>
                  </SelectContent>
                </Select>

                <Select onValueChange={(value) => handleFiltroChange('estado', value)}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filtrar por estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="pendiente">Pendiente</SelectItem>
                    <SelectItem value="aprobado">Aprobado</SelectItem>
                    <SelectItem value="pagado">Pagado</SelectItem>
                  </SelectContent>
                </Select>

                <Select onValueChange={(value) => handleFiltroChange('perfil', value)}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filtrar por perfil" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los perfiles</SelectItem>
                    <SelectItem value="ARQUITECTO">Arquitecto</SelectItem>
                    <SelectItem value="DESARROLLADOR_SENIOR">Desarrollador Senior</SelectItem>
                    <SelectItem value="DESARROLLADOR_JUNIOR">Desarrollador Junior</SelectItem>
                    <SelectItem value="SCRUM_MASTER">Scrum Master</SelectItem>
                    <SelectItem value="UX_DESIGNER">UX Designer</SelectItem>
                    <SelectItem value="QA_TESTER">QA Tester</SelectItem>
                    <SelectItem value="DEVOPS_ENGINEER">DevOps Engineer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Lista de recursos/nómina */}
          {cargandoRecursos ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-64" />
              ))}
            </div>
          ) : recursos && recursos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recursos.map((nomina) => (
                <NominaCard
                  key={`${nomina.recursoId}-${nomina.mes}`}
                  nomina={nomina}
                  onRegistrarPago={handleRegistrarPago}
                  onVerDetalle={handleVerDetalle}
                  onVerHistorial={handleVerHistorial}
                />
              ))}
            </div>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No se encontraron recursos para este proyecto con los filtros aplicados.
                {!filtros.mes && !filtros.estado && !filtros.perfil && 
                  " Asegúrate de que el proyecto tenga recursos registrados en el módulo Recursos."
                }
              </AlertDescription>
            </Alert>
          )}
        </>
      )}

      {/* Modal de detalle de pago */}
      <DetallePagoModal
        isOpen={mostrarModalPago}
        onClose={() => {
          setMostrarModalPago(false);
          setNominaSeleccionada(null);
        }}
        nomina={nominaSeleccionada}
        onConfirmar={handleConfirmarPago}
        isLoading={registrarPagoMutation.isPending}
      />
    </div>
  );
}