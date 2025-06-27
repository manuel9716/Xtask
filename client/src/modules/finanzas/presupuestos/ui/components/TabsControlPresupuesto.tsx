import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Plus,
  Receipt,
  FileText,
  Package,
  MessageSquare,
  BarChart3,
  Calendar,
  DollarSign,
  User,
  Building2,
  Download
} from 'lucide-react';
import { RegistroPagoModal } from './RegistroPagoModal';
import { RegistroFacturaModal } from './RegistroFacturaModal';
import { RegistroActivoModal } from './RegistroActivoModal';
import { RegistroObservaciones } from './RegistroObservaciones';

interface TabsControlPresupuestoProps {
  presupuestoId: number;
}

export function TabsControlPresupuesto({ presupuestoId }: TabsControlPresupuestoProps) {
  const [modalPagoOpen, setModalPagoOpen] = useState(false);
  const [modalFacturaOpen, setModalFacturaOpen] = useState(false);
  const [modalActivoOpen, setModalActivoOpen] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO');
  };

  // Datos mock para demostración
  const pagos = [
    {
      id: 1,
      fecha: '2024-12-15',
      monto: 500000,
      concepto: 'Compra de materiales',
      area: 'Desarrollo',
      comprobante: 'recibo_001.pdf'
    },
    {
      id: 2,
      fecha: '2024-12-10',
      monto: 300000,
      concepto: 'Servicios externos',
      area: 'Marketing',
      comprobante: 'recibo_002.pdf'
    }
  ];

  const facturas = [
    {
      id: 1,
      proveedor: 'Tech Solutions SAS',
      numeroFactura: 'FC-2024-001',
      valor: 1200000,
      concepto: 'Licencias de software',
      fecha: '2024-12-20',
      archivo: 'factura_001.pdf'
    }
  ];

  const activos = [
    {
      id: 1,
      descripcion: 'Laptop Dell XPS 15',
      valor: 4500000,
      responsable: 'Juan Pérez',
      ubicacion: 'Oficina Principal',
      estado: 'Operativo'
    },
    {
      id: 2,
      descripcion: 'Monitor 4K Samsung',
      valor: 800000,
      responsable: 'Ana García',
      ubicacion: 'Sala de Juntas',
      estado: 'En préstamo'
    }
  ];

  return (
    <div className="h-full">
      <Tabs defaultValue="pagos" className="h-full flex flex-col">
        <TabsList className="grid w-full grid-cols-6 mx-6 mt-4">
          <TabsTrigger value="pagos" className="flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            Pagos
          </TabsTrigger>
          <TabsTrigger value="facturas" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Facturas
          </TabsTrigger>
          <TabsTrigger value="activos" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Activos
          </TabsTrigger>
          <TabsTrigger value="observaciones" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Observaciones
          </TabsTrigger>
          <TabsTrigger value="reportes" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Reportes
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {/* Tab de Pagos */}
          <TabsContent value="pagos" className="space-y-4 mt-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Registro de Pagos</h3>
              <Button 
                onClick={() => setModalPagoOpen(true)}
                className="bg-[#02BDEA] hover:bg-[#02BDEA]/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Registrar Pago
              </Button>
            </div>

            <div className="grid gap-4">
              {pagos.map((pago) => (
                <Card key={pago.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600">{formatDate(pago.fecha)}</span>
                        </div>
                        <h4 className="font-medium">{pago.concepto}</h4>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4 text-green-600" />
                            <span className="font-semibold text-green-600">
                              {formatCurrency(pago.monto)}
                            </span>
                          </div>
                          <Badge variant="outline">{pago.area}</Badge>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-1" />
                        Ver Comprobante
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Tab de Facturas */}
          <TabsContent value="facturas" className="space-y-4 mt-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Facturación</h3>
              <Button 
                onClick={() => setModalFacturaOpen(true)}
                className="bg-[#02BDEA] hover:bg-[#02BDEA]/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Registrar Factura
              </Button>
            </div>

            <div className="grid gap-4">
              {facturas.map((factura) => (
                <Card key={factura.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">{factura.proveedor}</span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Factura: {factura.numeroFactura}
                        </p>
                        <p className="text-sm">{factura.concepto}</p>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4 text-red-600" />
                            <span className="font-semibold text-red-600">
                              {formatCurrency(factura.valor)}
                            </span>
                          </div>
                          <span className="text-sm text-gray-500">
                            {formatDate(factura.fecha)}
                          </span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-1" />
                        Ver PDF
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Tab de Activos */}
          <TabsContent value="activos" className="space-y-4 mt-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Control de Activos</h3>
              <Button 
                onClick={() => setModalActivoOpen(true)}
                className="bg-[#02BDEA] hover:bg-[#02BDEA]/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Registrar Activo
              </Button>
            </div>

            <div className="grid gap-4">
              {activos.map((activo) => (
                <Card key={activo.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <h4 className="font-medium">{activo.descripcion}</h4>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4 text-blue-600" />
                            <span className="font-semibold text-blue-600">
                              {formatCurrency(activo.valor)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">{activo.responsable}</span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">{activo.ubicacion}</p>
                      </div>
                      <Badge 
                        className={
                          activo.estado === 'Operativo' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }
                      >
                        {activo.estado}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Tab de Observaciones */}
          <TabsContent value="observaciones" className="mt-4">
            <RegistroObservaciones presupuestoId={presupuestoId} />
          </TabsContent>

          {/* Tab de Reportes */}
          <TabsContent value="reportes" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Generar Reportes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button variant="outline" className="h-20 flex flex-col gap-2">
                    <FileText className="h-6 w-6" />
                    <span>Reporte General PDF</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col gap-2">
                    <BarChart3 className="h-6 w-6" />
                    <span>Reporte de Pagos Excel</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col gap-2">
                    <Receipt className="h-6 w-6" />
                    <span>Reporte de Facturas PDF</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col gap-2">
                    <Package className="h-6 w-6" />
                    <span>Reporte de Activos Excel</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>

      {/* Modales */}
      <RegistroPagoModal 
        isOpen={modalPagoOpen}
        onClose={() => setModalPagoOpen(false)}
        presupuestoId={presupuestoId}
      />
      
      <RegistroFacturaModal 
        isOpen={modalFacturaOpen}
        onClose={() => setModalFacturaOpen(false)}
        presupuestoId={presupuestoId}
      />
      
      <RegistroActivoModal 
        isOpen={modalActivoOpen}
        onClose={() => setModalActivoOpen(false)}
        presupuestoId={presupuestoId}
      />
    </div>
  );
}