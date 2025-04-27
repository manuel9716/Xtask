import { 
  MoreVertical, 
  Mail, 
  Phone, 
  Building2, 
  Briefcase,
  UserCircle2,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { useLocation } from 'wouter';
import { EmpleadoResumenRRHH, EstadoEmpleado } from '../../domain/entities/Empleado';
import { eliminarEmpleado } from '../../infrastructure/api/empleadosApi';
import { queryClient } from '@/lib/queryClient';
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface EmpleadoCardProps {
  empleado: EmpleadoResumenRRHH;
  onSelect?: () => void;
}

export function EmpleadoCard({ empleado, onSelect }: EmpleadoCardProps) {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Función para manejar la eliminación del empleado
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const success = await eliminarEmpleado(empleado.id);
      if (success) {
        toast({
          title: 'Empleado eliminado',
          description: 'El empleado ha sido desactivado correctamente.',
        });
        // Invalidar la consulta para refrescar la lista
        queryClient.invalidateQueries({ queryKey: ['/api/recursos-humanos/empleados'] });
      } else {
        toast({
          title: 'Error',
          description: 'No se pudo eliminar el empleado. Inténtalo de nuevo.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Ocurrió un error al eliminar el empleado.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      setConfirmDelete(false);
    }
  };

  // Función para renderizar el badge de estado
  const renderEstadoBadge = () => {
    switch (empleado.estado) {
      case EstadoEmpleado.ACTIVO:
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Activo</Badge>;
      case EstadoEmpleado.INACTIVO:
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Inactivo</Badge>;
      case EstadoEmpleado.VACACIONES:
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Vacaciones</Badge>;
      case EstadoEmpleado.PERMISO:
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">Permiso</Badge>;
      case EstadoEmpleado.BAJA_MEDICA:
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">Baja médica</Badge>;
      default:
        return <Badge>{empleado.estado}</Badge>;
    }
  };

  // Generar iniciales para el avatar
  const getInitials = () => {
    const firstInitial = empleado.nombre.charAt(0);
    const lastInitial = empleado.apellido.charAt(0);
    return `${firstInitial}${lastInitial}`;
  };

  return (
    <>
      <Card className="overflow-hidden hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarImage src={empleado.fotoPerfil} alt={`${empleado.nombre} ${empleado.apellido}`} />
                <AvatarFallback>{getInitials()}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-lg">{`${empleado.nombre} ${empleado.apellido}`}</CardTitle>
                <CardDescription>{empleado.posicion}</CardDescription>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">Abrir menú</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                <DropdownMenuItem onClick={onSelect}>
                  <Eye className="h-4 w-4 mr-2" />
                  Ver detalles
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setLocation(`/admin/recursos-humanos/empleados/${empleado.id}/editar`)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => setConfirmDelete(true)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="pb-3">
          <div className="space-y-2">
            <div className="flex items-center text-sm">
              <Building2 className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{empleado.departamento}</span>
            </div>
            {renderEstadoBadge()}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between pt-2">
          <Button variant="ghost" size="sm" onClick={onSelect}>
            <Eye className="h-4 w-4 mr-2" />
            Ver perfil
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLocation(`/admin/recursos-humanos/empleados/${empleado.id}/editar`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
        </CardFooter>
      </Card>

      {/* Diálogo de confirmación para eliminar */}
      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción desactivará al empleado <strong>{`${empleado.nombre} ${empleado.apellido}`}</strong>. 
              El empleado pasará a estado "Inactivo" pero sus datos se conservarán en el sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}