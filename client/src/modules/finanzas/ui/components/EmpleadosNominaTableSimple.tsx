import React, { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Loader2, 
  FileEdit, 
  Eye
} from "lucide-react";
import { formatCurrency } from '@/lib/utils';

// Componente simplificado para depurar problemas
export default function EmpleadosNominaTableSimple() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [empleados, setEmpleados] = useState<any[]>([]);
  
  // Cargar los datos directamente
  useEffect(() => {
    const fetchEmpleados = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/nomina/empleados/listar?page=1&pageSize=100');
        
        if (!response.ok) {
          throw new Error('Error al cargar empleados');
        }
        
        const data = await response.json();
        console.log('Datos cargados directamente:', data);
        
        // Estructura estándar - datos en data.data
        if (data && data.data && Array.isArray(data.data)) {
          setEmpleados(data.data);
        } 
        // Estructura alternativa - datos directamente en un array
        else if (Array.isArray(data)) {
          setEmpleados(data);
        }
        // Formato empleados y pagination
        else if (data && data.empleados && Array.isArray(data.empleados)) {
          setEmpleados(data.empleados);
        }
        // Si no se detecta ningún formato válido
        else {
          setEmpleados([]);
          console.error('Formato de datos no reconocido:', data);
        }
        
      } catch (err: any) {
        console.error('Error al cargar empleados:', err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEmpleados();
  }, []);
  
  // Función para renderizar el estado del contrato
  const renderEstadoContrato = (estado: string) => {
    switch (estado.toLowerCase()) {
      case 'active':
        return <Badge className="bg-green-500">Activo</Badge>;
      case 'inactive':
        return <Badge className="bg-red-500">Inactivo</Badge>;
      case 'suspended':
        return <Badge className="bg-yellow-500">Suspendido</Badge>;
      default:
        return <Badge className="bg-gray-500">{estado}</Badge>;
    }
  };
  
  // Si está cargando, mostrar un indicador de carga
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  // Si hay un error, mostrar un mensaje de error
  if (error) {
    return (
      <div className="text-center py-8 border rounded-md">
        <p className="text-destructive">Ocurrió un error al cargar los datos. Intente nuevamente.</p>
        <p className="text-xs text-muted-foreground mt-2">{error.message}</p>
      </div>
    );
  }
  
  // Si no hay empleados, mostrar mensaje
  if (!empleados || empleados.length === 0) {
    return (
      <div className="text-center py-8 border rounded-md">
        <p className="text-muted-foreground">No se encontraron empleados.</p>
      </div>
    );
  }

  // Si llegamos aquí es porque tenemos empleados para mostrar
  return (
    <div>
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Empleados ({empleados.length})</h3>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Puesto</TableHead>
              <TableHead>Departamento</TableHead>
              <TableHead>Salario</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {empleados.map((empleado) => (
              <TableRow key={empleado.id}>
                <TableCell className="font-medium">
                  {empleado.firstName} {empleado.lastName}
                </TableCell>
                <TableCell>{empleado.position || 'No definido'}</TableCell>
                <TableCell>{empleado.department || 'No asignado'}</TableCell>
                <TableCell>{formatCurrency(Number(empleado.salary) || 0)}</TableCell>
                <TableCell>{renderEstadoContrato(empleado.contractStatus || 'active')}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="ghost" title="Ver detalles" onClick={() => window.location.href = `/nomina/empleados/${empleado.id}`}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" title="Editar" onClick={() => window.location.href = `/nomina/empleados/editar/${empleado.id}`}>
                      <FileEdit className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}