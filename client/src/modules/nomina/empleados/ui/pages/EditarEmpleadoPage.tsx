import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { EmpleadoForm } from '../forms/EmpleadoForm';
import { useGetEmpleado } from '../../application/useGetEmpleado';

export default function EditarEmpleadoPage() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Extraer el ID del objeto params y verificar que existe
  const id = params?.id;
  const empleadoId = id ? parseInt(id) : undefined;
  
  // Log para depuración
  console.log("Parámetros:", params, "ID del empleado:", id, "empleadoId:", empleadoId);
  
  // Intentar obtener los datos directamente mediante fetch
  const [empleadoDirect, setEmpleadoDirect] = useState(null);
  const [loadingDirect, setLoadingDirect] = useState(true);
  const [errorDirect, setErrorDirect] = useState(false);
  
  useEffect(() => {
    // Solo hacer el fetch si tenemos un ID válido
    if (empleadoId) {
      console.log("Intentando fetch directo a:", `/api/nomina/empleados/${empleadoId}`);
      
      fetch(`/api/nomina/empleados/${empleadoId}`)
        .then(response => {
          console.log("Respuesta status:", response.status);
          if (!response.ok) {
            throw new Error(`Error en la respuesta: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          console.log("Datos obtenidos directamente:", data);
          setEmpleadoDirect(data);
          setLoadingDirect(false);
        })
        .catch(error => {
          console.error("Error en fetch directo:", error);
          setErrorDirect(true);
          setLoadingDirect(false);
        });
    }
  }, [empleadoId]);
  
  // Obtener los datos del empleado usando el hook
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
  
  // Si tenemos datos directos pero hubo un error con el hook, usamos los datos directos
  if ((isError || !empleado) && empleadoDirect) {
    console.log("Usando datos directos porque el hook falló");
    // Continúa con el renderizado usando empleadoDirect
  }
  // Si ambos métodos fallaron, mostrar error
  else if ((isError || !empleado) && (errorDirect || !empleadoDirect)) {
    console.log("Ambos métodos de carga fallaron");
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
          <p className="text-sm text-destructive mt-2">Detalles: {errorDirect ? "Error en la solicitud directa" : "Error en el hook"}</p>
          <Button className="mt-4" onClick={() => setLocation('/admin/nomina/empleados')}>
            Volver al listado
          </Button>
        </Card>
      </div>
    );
  }
  
  // Determinar qué datos vamos a usar (del hook o directos)
  const empleadoData = empleado || empleadoDirect;
    
  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <Button variant="ghost" size="icon" onClick={() => setLocation('/admin/nomina/empleados')} className="mr-4">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Editar Empleado</h1>
      </div>
      
      <Card className="p-6">
        {empleadoData ? (
          <EmpleadoForm 
            onSuccess={handleSuccess} 
            empleadoData={empleadoData} 
            isEditing={true} 
          />
        ) : (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Cargando datos del empleado...</p>
          </div>
        )}
      </Card>
    </div>
  );
}