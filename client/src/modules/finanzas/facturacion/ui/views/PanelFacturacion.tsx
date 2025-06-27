import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { FacturacionProyecto } from './FacturacionProyecto';

interface Proyecto {
  id: number;
  name: string;
  budget: string;
  description: string;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

export function PanelFacturacion() {
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState<number | null>(null);

  // Obtener proyectos disponibles
  const { data: proyectos = [] } = useQuery<Proyecto[]>({
    queryKey: ['/api/projects'],
    queryFn: async () => {
      const response = await fetch('/api/projects');
      if (!response.ok) throw new Error('Error al cargar proyectos');
      return response.json();
    }
  });

  // Filtrar proyectos con presupuesto
  const proyectosConPresupuesto = proyectos.filter(proyecto => 
    proyecto.budget && parseFloat(proyecto.budget) > 0
  );

  const handleProyectoChange = (value: string) => {
    setProyectoSeleccionado(value === 'none' ? null : parseInt(value));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Facturación</h2>
          <p className="text-gray-600">Gestión de facturas por proyecto</p>
        </div>
      </div>

      {/* Selector de Proyecto */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Seleccionar Proyecto
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select 
            value={proyectoSeleccionado?.toString() || 'none'} 
            onValueChange={handleProyectoChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecciona un proyecto con presupuesto activo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">-- Seleccionar proyecto --</SelectItem>
              {proyectosConPresupuesto.map((proyecto) => (
                <SelectItem key={proyecto.id} value={proyecto.id.toString()}>
                  <div className="flex items-center justify-between w-full">
                    <span>{proyecto.name}</span>
                    <span className="text-sm text-gray-500 ml-4">
                      {formatCurrency(parseFloat(proyecto.budget))}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Componente principal de facturación */}
      <FacturacionProyecto 
        proyectoSeleccionado={proyectoSeleccionado}
        userId={10} // TODO: Obtener del contexto de autenticación
      />
    </div>
  );
}