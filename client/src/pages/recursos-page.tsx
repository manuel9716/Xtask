import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useListarPresupuestos } from '@/modules/finanzas/presupuestos/application/useListarPresupuestos';
import { RecursosPresupuesto } from '@/modules/finanzas/recursos/ui/views/RecursosPresupuesto';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Users, DollarSign, Briefcase, ChevronRight } from 'lucide-react';
import { Loader2 } from 'lucide-react';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

export default function RecursosPage() {
  const [, navigate] = useLocation();
  const [selectedPresupuestoId, setSelectedPresupuestoId] = useState<number | null>(null);
  const [selectedPresupuestoNombre, setSelectedPresupuestoNombre] = useState<string>('');

  const {
    presupuestos,
    isLoading,
    error
  } = useListarPresupuestos();

  const handleBackToFinanzas = () => {
    navigate('/finanzas');
  };

  const handleBackToList = () => {
    setSelectedPresupuestoId(null);
    setSelectedPresupuestoNombre('');
  };

  const handleSelectPresupuesto = (presupuesto: any) => {
    setSelectedPresupuestoId(presupuesto.id);
    setSelectedPresupuestoNombre(presupuesto.nombre);
  };

  // Si se selecciona un presupuesto específico, mostrar la vista de recursos
  if (selectedPresupuestoId) {
    return (
      <RecursosPresupuesto
        presupuestoId={selectedPresupuestoId}
        presupuestoNombre={selectedPresupuestoNombre}
        onBack={handleBackToList}
      />
    );
  }

  // Vista de lista de presupuestos para seleccionar
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Cargando presupuestos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">Error al cargar los presupuestos</p>
          <Button onClick={() => window.location.reload()}>Reintentar</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={handleBackToFinanzas}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Gestión de Recursos</h1>
            <p className="text-gray-600">Administra los recursos técnicos de tus presupuestos</p>
          </div>
        </div>
      </div>

      {/* Información general */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Total Presupuestos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {presupuestos.length}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Presupuestos disponibles
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Monto Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(presupuestos.reduce((sum, p) => sum + p.monto, 0))}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Suma de todos los presupuestos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Recursos por Asignar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {presupuestos.filter(p => p.estado === 'ACTIVO').length}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Presupuestos activos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de presupuestos */}
      <Card>
        <CardHeader>
          <CardTitle>Seleccionar Presupuesto</CardTitle>
          <CardDescription>
            Elige un presupuesto para gestionar sus recursos técnicos
          </CardDescription>
        </CardHeader>
        <CardContent>
          {presupuestos.length === 0 ? (
            <div className="text-center py-8">
              <Briefcase className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                No hay presupuestos disponibles
              </h3>
              <p className="text-gray-500 mb-4">
                Crea un presupuesto primero para poder gestionar recursos
              </p>
              <Button onClick={handleBackToFinanzas}>
                Ir a Finanzas
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {presupuestos.map((presupuesto) => (
                <div
                  key={presupuesto.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer"
                  onClick={() => handleSelectPresupuesto(presupuesto)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{presupuesto.nombre}</h3>
                      <Badge 
                        variant="outline"
                        className={
                          presupuesto.estado === 'ACTIVO' 
                            ? 'border-green-200 text-green-700 bg-green-50'
                            : presupuesto.estado === 'ALERTA'
                            ? 'border-yellow-200 text-yellow-700 bg-yellow-50'
                            : 'border-red-200 text-red-700 bg-red-50'
                        }
                      >
                        {presupuesto.estado}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Monto:</span>
                        <div className="font-semibold text-green-600">
                          {formatCurrency(presupuesto.monto)}
                        </div>
                      </div>
                      <div>
                        <span className="font-medium">Área:</span>
                        <div>{presupuesto.area}</div>
                      </div>
                      <div>
                        <span className="font-medium">Inicio:</span>
                        <div>{new Date(presupuesto.fechaInicio).toLocaleDateString()}</div>
                      </div>
                      <div>
                        <span className="font-medium">Fin:</span>
                        <div>{new Date(presupuesto.fechaFin).toLocaleDateString()}</div>
                      </div>
                    </div>
                  </div>
                  <div className="ml-4">
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}