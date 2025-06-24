import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Recurso, calculadoraCostos } from '../../domain/entities/Recurso';
import { 
  Edit2, 
  Trash2, 
  Clock, 
  DollarSign, 
  User, 
  CalendarDays,
  TrendingUp 
} from 'lucide-react';

interface RecursoCardProps {
  recurso: Recurso;
  onEdit: (recurso: Recurso) => void;
  onDelete: (id: number) => void;
  isDeleting?: boolean;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

const PERFIL_LABELS: Record<string, string> = {
  'ARQUITECTO': 'Arquitecto',
  'DESARROLLADOR_SENIOR': 'Dev Senior',
  'DESARROLLADOR_JUNIOR': 'Dev Junior',
  'QA_SENIOR': 'QA Senior',
  'QA_JUNIOR': 'QA Junior',
  'DEVOPS': 'DevOps',
  'SCRUM_MASTER': 'Scrum Master',
  'PRODUCT_OWNER': 'Product Owner',
  'DISEÑADOR_UX': 'UX Designer',
  'ANALISTA_DATOS': 'Analista Datos',
  'CONSULTOR': 'Consultor',
  'OTRO': 'Otro'
};

export function RecursoCard({ recurso, onEdit, onDelete, isDeleting = false }: RecursoCardProps) {
  const costoMensual = calculadoraCostos.costoMensual(recurso);
  const costoPorHora = calculadoraCostos.costoPorHora(recurso);

  const getOrigenColor = (origen: string) => {
    return origen === 'INTERNO' 
      ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
      : 'bg-orange-100 text-orange-800 hover:bg-orange-200';
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5" />
            {PERFIL_LABELS[recurso.perfil] || recurso.perfil}
          </CardTitle>
          <Badge className={getOrigenColor(recurso.origen)}>
            {recurso.origen}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Información principal */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <DollarSign className="h-4 w-4" />
              <span>Salario Mensual</span>
            </div>
            <p className="font-semibold">{formatCurrency(recurso.salarioMensual)}</p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              <span>Valor/Hora</span>
            </div>
            <p className="font-semibold">{formatCurrency(recurso.valorHora)}</p>
          </div>
        </div>

        {/* Tiempo y dedicación */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-2 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600">Meses</p>
            <p className="font-bold">{recurso.meses}</p>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600">Dedicación</p>
            <p className="font-bold">{recurso.dedicacionPorcentaje}%</p>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600">Horas Tot</p>
            <p className="font-bold">{recurso.totalHoras.toLocaleString()}</p>
          </div>
        </div>

        {/* Cálculos */}
        <div className="space-y-2 pt-2 border-t">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Costo Mensual:</span>
            <span className="font-semibold">{formatCurrency(costoMensual)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Costo/Hora Real:</span>
            <span className="font-semibold">{formatCurrency(costoPorHora)}</span>
          </div>
          <div className="flex justify-between items-center text-lg font-bold text-green-700 pt-2 border-t">
            <span>Total Estimado:</span>
            <span>{formatCurrency(recurso.totalEstimado)}</span>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex gap-2 pt-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(recurso)}
            className="flex-1"
          >
            <Edit2 className="h-4 w-4 mr-2" />
            Editar
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                disabled={isDeleting}
                className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Eliminar recurso?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción no se puede deshacer. Se eliminará permanentemente el recurso{" "}
                  <strong>{PERFIL_LABELS[recurso.perfil]}</strong> del presupuesto.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDelete(recurso.id)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Eliminar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}