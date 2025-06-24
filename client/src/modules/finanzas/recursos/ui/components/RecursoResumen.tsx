import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Recurso, ResumenCostos } from '../../domain/entities/Recurso';
import { calculadoraCostos } from '../../application/useCases/calcularCostoMensual';
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  Clock,
  PieChart,
  BarChart3
} from 'lucide-react';

interface RecursoResumenProps {
  recursos: Recurso[];
  resumen: ResumenCostos;
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

export function RecursoResumen({ recursos, resumen }: RecursoResumenProps) {
  const porcentajeInterno = resumen.totalGeneral > 0 
    ? (resumen.totalPorOrigen.INTERNO / resumen.totalGeneral) * 100 
    : 0;

  const porcentajeExterno = resumen.totalGeneral > 0 
    ? (resumen.totalPorOrigen.EXTERNO / resumen.totalGeneral) * 100 
    : 0;

  return (
    <div className="space-y-6">
      {/* Estadísticas generales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Total General
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(resumen.totalGeneral)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Costo total de recursos
            </p>
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
              {resumen.totalRecursos}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Perfiles asignados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Promedio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {formatCurrency(resumen.promedioPorRecurso)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Por recurso
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Horas Totales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {recursos.reduce((sum, r) => sum + r.totalHoras, 0).toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Horas de trabajo
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Distribución por origen */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Distribución por Origen
            </CardTitle>
            <CardDescription>
              Costos internos vs externos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-medium">Interno</span>
                </div>
                <div className="text-right">
                  <div className="font-bold">{formatCurrency(resumen.totalPorOrigen.INTERNO)}</div>
                  <div className="text-xs text-gray-500">{porcentajeInterno.toFixed(1)}%</div>
                </div>
              </div>
              <Progress value={porcentajeInterno} className="h-2" />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span className="text-sm font-medium">Externo</span>
                </div>
                <div className="text-right">
                  <div className="font-bold">{formatCurrency(resumen.totalPorOrigen.EXTERNO)}</div>
                  <div className="text-xs text-gray-500">{porcentajeExterno.toFixed(1)}%</div>
                </div>
              </div>
              <Progress value={porcentajeExterno} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Top Perfiles por Costo
            </CardTitle>
            <CardDescription>
              Perfiles con mayor inversión
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(resumen.totalPorPerfil)
                .filter(([_, valor]) => valor > 0)
                .sort(([_, a], [__, b]) => b - a)
                .slice(0, 5)
                .map(([perfil, valor]) => {
                  const porcentaje = resumen.totalGeneral > 0 ? (valor / resumen.totalGeneral) * 100 : 0;
                  return (
                    <div key={perfil} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">
                          {PERFIL_LABELS[perfil] || perfil}
                        </span>
                        <div className="text-right">
                          <div className="font-bold text-sm">{formatCurrency(valor)}</div>
                          <div className="text-xs text-gray-500">{porcentaje.toFixed(1)}%</div>
                        </div>
                      </div>
                      <Progress value={porcentaje} className="h-1.5" />
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla detallada estilo Excel */}
      <Card>
        <CardHeader>
          <CardTitle>Detalle de Recursos</CardTitle>
          <CardDescription>
            Vista completa de todos los recursos asignados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="py-3 px-4 text-left font-semibold">Perfil</th>
                  <th className="py-3 px-4 text-right font-semibold">Origen</th>
                  <th className="py-3 px-4 text-right font-semibold">Dedicación %</th>
                  <th className="py-3 px-4 text-right font-semibold">Horas Totales</th>
                  <th className="py-3 px-4 text-right font-semibold">Valor/Hora</th>
                  <th className="py-3 px-4 text-right font-semibold">Meses</th>
                  <th className="py-3 px-4 text-right font-semibold">Total Estimado</th>
                </tr>
              </thead>
              <tbody>
                {recursos.map((recurso) => (
                  <tr key={recurso.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">
                      {PERFIL_LABELS[recurso.perfil] || recurso.perfil}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Badge 
                        variant="outline" 
                        className={recurso.origen === 'INTERNO' ? 'border-blue-200 text-blue-700' : 'border-orange-200 text-orange-700'}
                      >
                        {recurso.origen}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right font-medium">
                      {recurso.dedicacionPorcentaje}%
                    </td>
                    <td className="py-3 px-4 text-right">
                      {recurso.totalHoras.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {formatCurrency(recurso.valorHora)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {recurso.meses}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-green-600">
                      {formatCurrency(recurso.totalEstimado)}
                    </td>
                  </tr>
                ))}
                {recursos.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-500">
                      No hay recursos asignados a este presupuesto
                    </td>
                  </tr>
                )}
              </tbody>
              {recursos.length > 0 && (
                <tfoot>
                  <tr className="border-t-2 bg-gray-100 font-bold">
                    <td className="py-3 px-4">TOTAL</td>
                    <td className="py-3 px-4 text-right">-</td>
                    <td className="py-3 px-4 text-right">-</td>
                    <td className="py-3 px-4 text-right">
                      {recursos.reduce((sum, r) => sum + r.totalHoras, 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right">-</td>
                    <td className="py-3 px-4 text-right">-</td>
                    <td className="py-3 px-4 text-right text-green-600 text-lg">
                      {formatCurrency(resumen.totalGeneral)}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}