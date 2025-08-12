import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, MapPin, Calendar, DollarSign, Eye } from 'lucide-react';
import { Link } from 'wouter';

interface Empleado {
  id: number;
  nombre: string;
  apellido: string;
  identificacion: string;
  depto: string;
  cargo: string;
  fecha_ingreso: string;
  estado_contrato: string;
  tipo_contrato: string;
  telefono?: string;
  direccion?: string;
  contacto_emergencia?: string;
  nomina?: {
    sueldo_base: number;
    frecuencia_pago: string;
    metodo_pago: string;
  };
  proyectos?: Array<{
    id: number;
    nombre: string;
    descripcion: string;
  }>;
}

interface EmpleadosListProps {
  empleados: Empleado[];
  isLoading?: boolean;
}

export function EmpleadosList({ empleados, isLoading }: EmpleadosListProps) {
  const getEstadoBadgeVariant = (estado: string) => {
    switch (estado) {
      case 'activo': return 'default';
      case 'inactivo': return 'secondary';
      case 'suspendido': return 'destructive';
      default: return 'secondary';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getInitials = (nombre: string, apellido: string) => {
    return `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase();
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="mr-2 h-5 w-5" />
            Empleados Registrados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
                <div className="h-12 w-12 bg-muted rounded-full animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                  <div className="h-3 w-24 bg-muted rounded animate-pulse" />
                </div>
                <div className="h-6 w-16 bg-muted rounded animate-pulse" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!empleados || empleados.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="mr-2 h-5 w-5" />
            Empleados Registrados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <User className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">No hay empleados registrados</p>
            <p className="text-sm text-muted-foreground">
              Agrega empleados para comenzar a gestionar nóminas
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <User className="mr-2 h-5 w-5" />
            Empleados Registrados
          </div>
          <span className="text-sm text-muted-foreground">
            {empleados.length} empleado{empleados.length !== 1 ? 's' : ''}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {empleados.map((empleado) => (
            <div
              key={empleado.id}
              className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-primary/10 text-primary">
                  {getInitials(empleado.nombre, empleado.apellido)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-1">
                <div className="flex items-center space-x-2">
                  <h4 className="font-semibold text-sm">
                    {empleado.nombre} {empleado.apellido}
                  </h4>
                  <Badge variant={getEstadoBadgeVariant(empleado.estado_contrato)} className="text-xs">
                    {empleado.estado_contrato}
                  </Badge>
                </div>
                
                <p className="text-sm text-muted-foreground">
                  {empleado.cargo} - {empleado.depto}
                </p>
                
                <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                  <div className="flex items-center">
                    <Calendar className="mr-1 h-3 w-3" />
                    {new Date(empleado.fecha_ingreso).toLocaleDateString()}
                  </div>
                  
                  {empleado.nomina?.sueldo_base && (
                    <div className="flex items-center">
                      <DollarSign className="mr-1 h-3 w-3" />
                      {formatCurrency(Number(empleado.nomina.sueldo_base))}
                    </div>
                  )}
                  
                  {empleado.proyectos && empleado.proyectos.length > 0 && (
                    <div className="flex items-center">
                      <MapPin className="mr-1 h-3 w-3" />
                      {empleado.proyectos.length} proyecto{empleado.proyectos.length !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              </div>
              
              <Button variant="outline" size="sm" asChild>
                <Link href={`/nomina/empleados/${empleado.id}`}>
                  <Eye className="h-4 w-4 mr-2" />
                  Ver detalles
                </Link>
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}