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
import { AlertTriangle, CalendarIcon, Download, FilePdf, Send } from 'lucide-react';

export const InvoiceTab: React.FC = () => {
  // En una implementación real, estos datos vendrían de los casos de uso
  const mockInvoices = [
    { 
      id: 1, 
      number: 'FAC-2025-001', 
      client: 'Tecnología Avanzada S.A.', 
      amount: 25000, 
      issueDate: '2025-01-15', 
      dueDate: '2025-02-15', 
      status: 'paid', 
      paymentDate: '2025-02-10' 
    },
    { 
      id: 2, 
      number: 'FAC-2025-002', 
      client: 'Construcciones Modernas', 
      amount: 35000, 
      issueDate: '2025-02-01', 
      dueDate: '2025-03-01', 
      status: 'pending', 
      paymentDate: '' 
    },
    { 
      id: 3, 
      number: 'FAC-2025-003', 
      client: 'Servicios Globales Inc', 
      amount: 18500, 
      issueDate: '2025-02-15', 
      dueDate: '2025-03-15', 
      status: 'overdue', 
      paymentDate: '' 
    },
    { 
      id: 4, 
      number: 'FAC-2025-004', 
      client: 'Consultoría Estratégica', 
      amount: 42000, 
      issueDate: '2025-03-01', 
      dueDate: '2025-04-01', 
      status: 'pending', 
      paymentDate: '' 
    },
  ];

  // Función para renderizar el estado de la factura con un badge
  const renderStatus = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-500">Pagada</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500">Pendiente</Badge>;
      case 'overdue':
        return <Badge className="bg-red-500">Vencida</Badge>;
      default:
        return <Badge>Desconocido</Badge>;
    }
  };

  // Función para calcular si una factura está por vencer pronto (7 días)
  const isDueSoon = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 && diffDays <= 7;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestión de Facturas</h2>
        <div className="flex gap-2">
          <Button variant="outline">Ver Historial</Button>
          <Button>Nueva Factura</Button>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
        <div>
          <h3 className="font-medium text-yellow-700">Facturas por vencer</h3>
          <p className="text-sm text-yellow-600">
            Hay 2 facturas pendientes de pago que vencerán en los próximos 7 días. 
            Total por cobrar: $77,000.00
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableCaption>Lista de facturas recientes</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[150px]">Número</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Emisión</TableHead>
                <TableHead>Vencimiento</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.number}</TableCell>
                  <TableCell>{invoice.client}</TableCell>
                  <TableCell>${invoice.amount.toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground" />
                      {invoice.issueDate}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground" />
                      {invoice.dueDate}
                      {isDueSoon(invoice.dueDate) && invoice.status === 'pending' && (
                        <Badge variant="outline" className="border-yellow-500 text-yellow-600">
                          Pronto
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{renderStatus(invoice.status)}</TableCell>
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
            <h3 className="text-lg font-medium mb-2">Registrar Pago</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Registre pagos recibidos para facturas pendientes
            </p>
            <Button className="w-full">Registrar Pago</Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium mb-2">Generar PDF</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Genere facturas en formato PDF para envío a clientes
            </p>
            <Button className="w-full">Generar PDF</Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium mb-2">Enviar por Email</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Envíe facturas por correo electrónico directamente a los clientes
            </p>
            <Button className="w-full">Enviar Email</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};