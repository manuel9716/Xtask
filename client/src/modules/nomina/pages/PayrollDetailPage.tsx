import { useState } from 'react';
import { useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Download, FileText, ToggleLeft, ToggleRight } from 'lucide-react';
import { Link } from 'wouter';
import { nominaApi } from '../services/nomina.api';
import { useToast } from '@/hooks/use-toast';

export default function PayrollDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  const { data: nomina, isLoading, refetch } = useQuery({
    queryKey: ['/api/nominas', id],
    queryFn: () => nominaApi.getNomina(parseInt(id!)),
    enabled: !!id,
  });

  const handleChangeEstado = async (nuevoEstado: string) => {
    try {
      await nominaApi.setNominaEstado(parseInt(id!), nuevoEstado);
      refetch();
      toast({
        title: "Estado actualizado",
        description: `La nómina ha sido marcada como ${nuevoEstado}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al actualizar estado",
        variant: "destructive",
      });
    }
  };

  const handleExport = async (format: 'pdf' | 'xlsx') => {
    try {
      setIsExporting(true);
      const blob = await nominaApi.exportNomina(parseInt(id!), format);
      
      // Crear URL temporal para descargar
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nomina_${id}_${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Exportación exitosa",
        description: `La nómina ha sido exportada en formato ${format.toUpperCase()}`,
      });
    } catch (error: any) {
      toast({
        title: "Error al exportar",
        description: error.message || "Error al exportar nómina",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!nomina) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Nómina no encontrada</h2>
              <p className="text-muted-foreground mb-4">La nómina solicitada no existe</p>
              <Button asChild>
                <Link href="/finanzas/nomina">Volver al dashboard</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getEstadoBadgeVariant = (estado: string) => {
    switch (estado) {
      case 'pagada': return 'default';
      case 'pendiente': return 'secondary';
      case 'procesando': return 'outline';
      case 'cancelada': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/finanzas/nomina">Nómina</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>
              Nómina {new Date(nomina.rango_inicio).toLocaleDateString()}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/finanzas/nomina">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              Nómina - {new Date(nomina.rango_inicio).toLocaleDateString()} al {new Date(nomina.rango_fin).toLocaleDateString()}
            </h1>
            <p className="text-muted-foreground">
              Proyecto: {nomina.proyecto_nombre || 'Sin proyecto asignado'}
            </p>
          </div>
          <Badge variant={getEstadoBadgeVariant(nomina.estado)}>
            {nomina.estado.toUpperCase()}
          </Badge>
        </div>
        <div className="flex gap-2">
          {nomina.estado === 'pendiente' ? (
            <Button onClick={() => handleChangeEstado('pagada')}>
              <ToggleRight className="h-4 w-4 mr-2" />
              Marcar como Pagada
            </Button>
          ) : nomina.estado === 'pagada' ? (
            <Button variant="outline" onClick={() => handleChangeEstado('pendiente')}>
              <ToggleLeft className="h-4 w-4 mr-2" />
              Marcar como Pendiente
            </Button>
          ) : null}
        </div>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sueldos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${Number(nomina.total_sueldos).toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bonos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              ${Number(nomina.total_bonos).toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Deducciones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ${Number(nomina.total_deducciones).toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Neto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              ${Number(nomina.total_neto).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detalle por empleado */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Detalle por Empleado</CardTitle>
            <CardDescription>
              Desglose de pagos individuales para cada empleado
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => handleExport('pdf')}
              disabled={isExporting}
            >
              <FileText className="h-4 w-4 mr-2" />
              Exportar PDF
            </Button>
            <Button
              variant="outline"
              onClick={() => handleExport('xlsx')}
              disabled={isExporting}
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar XLSX
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {nomina.items && nomina.items.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empleado</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead className="text-right">Sueldo Base</TableHead>
                  <TableHead className="text-right">Bonos</TableHead>
                  <TableHead className="text-right">Deducciones</TableHead>
                  <TableHead className="text-right">Impuestos</TableHead>
                  <TableHead className="text-right font-medium">Total Neto</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {nomina.items.map((item) => (
                  <TableRow key={item.empleado_id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{item.empleado_nombre}</p>
                        <p className="text-sm text-muted-foreground">ID: {item.empleado_identificacion}</p>
                      </div>
                    </TableCell>
                    <TableCell>{item.empleado_cargo}</TableCell>
                    <TableCell className="text-right">
                      ${Number(item.sueldo).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right text-blue-600">
                      ${Number(item.bono).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right text-red-600">
                      ${Number(item.deduccion).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right text-orange-600">
                      ${Number(item.impuestos).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-medium text-green-600">
                      ${Number(item.neto).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="border-t-2">
                  <TableCell colSpan={2} className="font-medium">TOTALES</TableCell>
                  <TableCell className="text-right font-bold">
                    ${Number(nomina.total_sueldos).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-bold text-blue-600">
                    ${Number(nomina.total_bonos).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-bold text-red-600">
                    ${Number(nomina.total_deducciones).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-bold text-orange-600">
                    ${Number(nomina.total_impuestos || 0).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-bold text-green-600">
                    ${Number(nomina.total_neto).toLocaleString()}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No hay empleados en esta nómina</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Información adicional */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Información de Creación</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Creado por</label>
              <p className="text-sm">{nomina.creado_por_nombre || 'Sistema'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Fecha de creación</label>
              <p className="text-sm">{new Date(nomina.creado_at).toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resumen Financiero</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Empleados incluidos:</span>
              <span className="text-sm font-medium">{nomina.items?.length || 0}</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Sueldos base:</span>
              <span className="text-sm">${Number(nomina.total_sueldos).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Bonificaciones:</span>
              <span className="text-sm text-blue-600">${Number(nomina.total_bonos).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Deducciones:</span>
              <span className="text-sm text-red-600">-${Number(nomina.total_deducciones).toLocaleString()}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-medium">
              <span className="text-sm">Total a pagar:</span>
              <span className="text-sm text-green-600">${Number(nomina.total_neto).toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}