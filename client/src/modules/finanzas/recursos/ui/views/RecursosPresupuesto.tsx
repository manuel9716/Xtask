import React, { useState } from 'react';
import { useParams } from 'wouter';
import { Button } from '@/components/ui/button';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useListarRecursosPorPresupuesto, useEliminarRecurso } from '../../application/useCases/listarRecursosPorPresupuesto';
import { useCrearRecurso } from '../../application/useCases/crearRecurso';
import { useCalcularCostoMensual } from '../../application/useCases/calcularCostoMensual';
import { RecursoForm } from '../components/RecursoForm';
import { RecursoCard } from '../components/RecursoCard';
import { RecursoResumen } from '../components/RecursoResumen';
import { CrearRecursoDTO, Recurso, calculadoraCostos } from '../../domain/entities/Recurso';
import { 
  PlusCircle, 
  Users, 
  ArrowLeft,
  DollarSign,
  TrendingUp,
  Clock,
  BarChart3,
  Loader2
} from 'lucide-react';

interface RecursosPresupuestoProps {
  presupuestoId: number;
  presupuestoNombre?: string;
  onBack?: () => void;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

export function RecursosPresupuesto({ 
  presupuestoId, 
  presupuestoNombre = 'Presupuesto',
  onBack 
}: RecursosPresupuestoProps) {
  const [openDialog, setOpenDialog] = useState(false);
  const [editingRecurso, setEditingRecurso] = useState<Recurso | null>(null);

  // Hooks para datos
  const {
    data: recursos = [],
    isLoading: isLoadingRecursos,
    error: errorRecursos,
    refetch
  } = useListarRecursosPorPresupuesto(presupuestoId);

  const {
    data: resumen,
    isLoading: isLoadingResumen
  } = useCalcularCostoMensual(presupuestoId);

  // Hooks para mutaciones
  const crearRecursoMutation = useCrearRecurso();
  const eliminarRecursoMutation = useEliminarRecurso();

  // Calcular resumen local si no está disponible del servidor
  const resumenLocal = resumen || calculadoraCostos.calcularResumen(recursos);

  const handleCrearRecurso = async (data: CrearRecursoDTO) => {
    try {
      await crearRecursoMutation.mutateAsync(data);
      setOpenDialog(false);
    } catch (error) {
      console.error('Error al crear recurso:', error);
    }
  };

  const handleEditarRecurso = (recurso: Recurso) => {
    setEditingRecurso(recurso);
    setOpenDialog(true);
  };

  const handleEliminarRecurso = async (id: number) => {
    try {
      await eliminarRecursoMutation.mutateAsync({ id, presupuestoId });
    } catch (error) {
      console.error('Error al eliminar recurso:', error);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingRecurso(null);
  };

  if (isLoadingRecursos) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Cargando recursos...</p>
        </div>
      </div>
    );
  }

  if (errorRecursos) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">Error al cargar los recursos</p>
        <Button onClick={() => refetch()}>Reintentar</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <div>
            <h1 className="text-3xl font-bold">Recursos del Presupuesto</h1>
            <p className="text-gray-600">{presupuestoNombre}</p>
          </div>
        </div>

        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Agregar Recurso
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingRecurso ? 'Editar Recurso' : 'Nuevo Recurso'}
              </DialogTitle>
              <DialogDescription>
                {editingRecurso 
                  ? 'Modifica los datos del recurso técnico'
                  : 'Agrega un nuevo recurso técnico al presupuesto'
                }
              </DialogDescription>
            </DialogHeader>
            <RecursoForm
              presupuestoId={presupuestoId}
              onSubmit={handleCrearRecurso}
              onCancel={handleCloseDialog}
              isLoading={crearRecursoMutation.isPending}
              initialData={editingRecurso ? {
                perfil: editingRecurso.perfil,
                salarioMensual: editingRecurso.salarioMensual,
                valorHora: editingRecurso.valorHora,
                meses: editingRecurso.meses,
                diasAlMes: editingRecurso.diasAlMes,
                horasPorDia: editingRecurso.horasPorDia,
                dedicacionPorcentaje: editingRecurso.dedicacionPorcentaje,
                origen: editingRecurso.origen,
              } : undefined}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Total Presupuestado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(resumenLocal.totalGeneral)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total Recursos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {resumenLocal.totalRecursos}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Recursos Internos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(resumenLocal.totalPorOrigen.INTERNO)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Recursos Externos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(resumenLocal.totalPorOrigen.EXTERNO)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contenido principal */}
      <Tabs defaultValue="lista" className="space-y-4">
        <TabsList>
          <TabsTrigger value="lista">Lista de Recursos</TabsTrigger>
          <TabsTrigger value="resumen">Resumen y Análisis</TabsTrigger>
        </TabsList>

        <TabsContent value="lista" className="space-y-4">
          {recursos.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  No hay recursos asignados
                </h3>
                <p className="text-gray-500 mb-4 text-center max-w-md">
                  Comienza agregando recursos técnicos para calcular los costos del presupuesto
                </p>
                <Button onClick={() => setOpenDialog(true)}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Agregar primer recurso
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recursos.map((recurso) => (
                <RecursoCard
                  key={recurso.id}
                  recurso={recurso}
                  onEdit={handleEditarRecurso}
                  onDelete={handleEliminarRecurso}
                  isDeleting={eliminarRecursoMutation.isPending}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="resumen">
          <RecursoResumen recursos={recursos} resumen={resumenLocal} />
        </TabsContent>
      </Tabs>
    </div>
  );
}