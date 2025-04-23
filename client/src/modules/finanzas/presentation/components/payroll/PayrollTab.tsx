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
import { CalendarIcon, FilePdf, Send } from 'lucide-react';

export const PayrollTab: React.FC = () => {
  // En una implementación real, estos datos vendrían de los casos de uso
  const mockPayrolls = [
    { id: 1, period: 'Enero 2025', totalAmount: 125000, employeeCount: 25, status: 'paid', paymentDate: '2025-01-30' },
    { id: 2, period: 'Febrero 2025', totalAmount: 126500, employeeCount: 26, status: 'paid', paymentDate: '2025-02-28' },
    { id: 3, period: 'Marzo 2025', totalAmount: 128000, employeeCount: 26, status: 'processing', paymentDate: '2025-03-31' },
    { id: 4, period: 'Abril 2025', totalAmount: 130000, employeeCount: 27, status: 'pending', paymentDate: '' },
  ];

  // Función para renderizar el estado de la nómina con un badge
  const renderStatus = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-500">Pagada</Badge>;
      case 'processing':
        return <Badge className="bg-blue-500">En proceso</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500">Pendiente</Badge>;
      default:
        return <Badge>Desconocido</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestión de Nómina</h2>
        <div className="flex gap-2">
          <Button variant="outline">Ver Historial</Button>
          <Button>Generar Nómina</Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableCaption>Historial de nóminas recientes</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Período</TableHead>
                <TableHead>Monto Total</TableHead>
                <TableHead>Empleados</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha de Pago</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockPayrolls.map((payroll) => (
                <TableRow key={payroll.id}>
                  <TableCell className="font-medium">{payroll.period}</TableCell>
                  <TableCell>${payroll.totalAmount.toLocaleString()}</TableCell>
                  <TableCell>{payroll.employeeCount}</TableCell>
                  <TableCell>{renderStatus(payroll.status)}</TableCell>
                  <TableCell>
                    {payroll.paymentDate ? (
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground" />
                        {payroll.paymentDate}
                      </div>
                    ) : (
                      'Pendiente'
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon">
                        <FilePdf className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Send className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">Detalles</Button>
                    </div>
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
            <h3 className="text-lg font-medium mb-2">Calcular Salarios</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Calcule salarios individuales incluyendo beneficios, bonos y deducciones
            </p>
            <Button className="w-full">Calcular</Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium mb-2">Generar Recibos</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Genere recibos de pago individuales en formato PDF para distribución
            </p>
            <Button className="w-full">Generar PDFs</Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium mb-2">Registrar Pagos</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Registre la ejecución de pagos de nómina a empleados
            </p>
            <Button className="w-full">Registrar</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};