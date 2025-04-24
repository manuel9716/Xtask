import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { EmpleadoForm } from '../forms/EmpleadoForm';
import { useGetEmpleado } from '../../application/useGetEmpleado';

export default function EditarEmpleadoPage() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const empleadoId = id ? parseInt(id) : undefined;
  
  // Obtener los datos del empleado
  const { data: empleado, isLoading, isError } = useGetEmpleado(empleadoId);
  
  // Manejar la navegación de regreso después de guardar cambios
  const handleSuccess = () => {
    toast({
      title: "Empleado actualizado",
      description: "Los datos del empleado se han actualizado correctamente.",
    });
    setLocation('/admin/nomina/empleados');
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (isError || !empleado) {
    return (
      <div className="space-y-4">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={() => setLocation('/admin/nomina/empleados')} className="mr-4">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Error</h1>
        </div>
        <Card className="p-6">
          <p>No se pudo cargar la información del empleado. Por favor, intente nuevamente.</p>
          <Button className="mt-4" onClick={() => setLocation('/admin/nomina/empleados')}>
            Volver al listado
          </Button>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <Button variant="ghost" size="icon" onClick={() => setLocation('/admin/nomina/empleados')} className="mr-4">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Editar Empleado</h1>
      </div>
      
      <Card className="p-6">
        <EmpleadoForm 
          onSuccess={handleSuccess} 
          empleadoData={empleado} 
          isEditing={true} 
        />
      </Card>
    </div>
  );
}