import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';

export const BudgetTab: React.FC = () => {
  // En una implementación real, estos datos vendrían de los casos de uso
  const mockBudgets = [
    { id: 1, name: 'Presupuesto Q1 2025', amount: 250000, spent: 120000, status: 'active' },
    { id: 2, name: 'Presupuesto Marketing', amount: 75000, spent: 65000, status: 'warning' },
    { id: 3, name: 'Presupuesto Desarrollo', amount: 150000, spent: 30000, status: 'active' },
    { id: 4, name: 'Presupuesto RR.HH.', amount: 50000, spent: 48000, status: 'critical' },
  ];

  // Función para renderizar el estado del presupuesto con un badge
  const renderStatus = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">Activo</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-500">En riesgo</Badge>;
      case 'critical':
        return <Badge className="bg-red-500">Crítico</Badge>;
      default:
        return <Badge>Desconocido</Badge>;
    }
  };

  // Función para calcular el porcentaje de ejecución
  const calculatePercentage = (spent: number, total: number) => {
    return ((spent / total) * 100).toFixed(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Presupuestos</h2>
        <div className="flex gap-2">
          <Button variant="outline">Importar</Button>
          <Button>Crear Presupuesto</Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableCaption>Lista de presupuestos activos</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Nombre</TableHead>
                <TableHead>Presupuesto</TableHead>
                <TableHead>Gastado</TableHead>
                <TableHead>Ejecución</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockBudgets.map((budget) => (
                <TableRow key={budget.id}>
                  <TableCell className="font-medium">{budget.name}</TableCell>
                  <TableCell>${budget.amount.toLocaleString()}</TableCell>
                  <TableCell>${budget.spent.toLocaleString()}</TableCell>
                  <TableCell>{calculatePercentage(budget.spent, budget.amount)}%</TableCell>
                  <TableCell>{renderStatus(budget.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">Detalles</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium mb-2">Ejecutar Validación</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Valide si un gasto propuesto está dentro del presupuesto asignado
            </p>
            <Button className="w-full">Validar Gasto</Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium mb-2">Calcular Ejecución</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Calcule la ejecución presupuestaria actual y genere proyecciones
            </p>
            <Button className="w-full">Calcular</Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium mb-2">Ajustar Presupuesto</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Realice ajustes de emergencia a presupuestos existentes
            </p>
            <Button className="w-full">Ajustar</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};