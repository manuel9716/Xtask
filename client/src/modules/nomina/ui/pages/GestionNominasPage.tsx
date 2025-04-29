import { useState } from 'react';
import { useListarNominas } from '@/modules/nomina/application/useListarNominas';
import { EstadoNomina } from '@/modules/nomina/domain/entities/Nomina';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { PlusCircle, AlertTriangle, FileText } from 'lucide-react';

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Loader2 } from 'lucide-react';
import { NominaFormModal } from '../components/NominaFormModal';

export default function GestionNominasPage() {
  const [showNuevaForma, setShowNuevaForma] = useState(false);

  // Obtener datos de nóminas
  const { nominas = [], isLoading, isError, refetch } = useListarNominas();

  // Filtrar nóminas pendientes y recientes
  const nominasPendientes = Array.isArray(nominas) ? nominas.filter(nomina => 
    nomina.estado === EstadoNomina.PENDIENTE || 
    nomina.estado === 'PENDIENTE'
  ) : [];
  
  const nominasRecientes = Array.isArray(nominas) ? nominas.filter(nomina => 
    nomina.estado === EstadoNomina.PAGADO || 
    nomina.estado === EstadoNomina.APROBADO ||
    nomina.estado === 'PAGADO' || 
    nomina.estado === 'APROBADO'
  ) : [];
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Cargando nóminas...</span>
      </div>
    );
  }
  
  if (isError) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          No se pudieron cargar las nóminas. Por favor, intente nuevamente.
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2"
            onClick={() => refetch()}
          >
            Reintentar
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  const formatearFecha = (fecha: string | Date) => {
    if (!fecha) return '';
    const date = typeof fecha === 'string' ? new Date(fecha) : fecha;
    return format(date, "MMMM yyyy", { locale: es });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestión de Nóminas</CardTitle>
        <CardDescription>
          Crear, procesar y revisar nóminas del personal
        </CardDescription>
      </CardHeader>
      <CardContent>
        {nominas?.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
            <FileText className="h-10 w-10 mb-2" />
            <p>No hay nóminas registradas en el sistema</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-4"
              onClick={() => setShowNuevaForma(true)}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Crear tu primera nómina
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Nóminas Pendientes</h3>
              <Separator className="mb-4" />
              
              <div className="space-y-4">
                {nominasPendientes.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No hay nóminas pendientes
                  </p>
                ) : (
                  nominasPendientes.map(nomina => (
                    <div key={nomina.id} className="p-4 border rounded-md">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{nomina.titulo || formatearFecha(nomina.periodoInicio || nomina.fecha_creacion)}</p>
                          <p className="text-sm text-muted-foreground">
                            {nomina.totalEmpleados || nomina.empleados?.length || '?'} empleados
                          </p>
                        </div>
                        <Badge variant="outline">Pendiente</Badge>
                      </div>
                      <div className="mt-4 flex justify-end">
                        <Button variant="outline" size="sm">Ver Detalles</Button>
                        <Button variant="default" size="sm" className="ml-2">Procesar</Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Nóminas Recientes</h3>
              <Separator className="mb-4" />
              
              <div className="space-y-4">
                {nominasRecientes.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No hay nóminas procesadas recientemente
                  </p>
                ) : (
                  nominasRecientes.map(nomina => (
                    <div key={nomina.id} className="p-4 border rounded-md">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{nomina.titulo || formatearFecha(nomina.periodoInicio || nomina.fecha_creacion)}</p>
                          <p className="text-sm text-muted-foreground">
                            {nomina.totalEmpleados || nomina.empleados?.length || '?'} empleados - 
                            €{(Number(nomina.montoTotal) || 0).toLocaleString('es')}
                          </p>
                        </div>
                        <Badge variant="secondary">
                          {nomina.estado === EstadoNomina.PAGADO || nomina.estado === 'PAGADO' ? 'Pagada' : 'Aprobada'}
                        </Badge>
                      </div>
                      <div className="mt-4 flex justify-end">
                        <Button variant="outline" size="sm">Ver Detalles</Button>
                        <Button variant="outline" size="sm" className="ml-2">Descargar</Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" disabled={nominas?.length === 0}>
          Ver Historial Completo
        </Button>
        <Button onClick={() => setShowNuevaForma(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Crear Nueva Nómina
        </Button>
      </CardFooter>

      {/* Modal de creación de nómina */}
      <NominaFormModal 
        open={showNuevaForma}
        onOpenChange={setShowNuevaForma}
      />
    </Card>
  );
}