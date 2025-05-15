import { useState } from 'react';
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
import { Loader2, FileEdit, Eye } from "lucide-react";
import { useEmpleadosNomina } from "../../../nomina/application/useEmpleadosNomina";

export default function EmpleadosNominaTable() {
  const [filtros, setFiltros] = useState({
    page: 1,
    pageSize: 10
  });
  
  const { data, isLoading, isError } = useEmpleadosNomina(filtros);
  
  // Renderizar estado del contrato como badge
  const renderEstadoContrato = (estado: string) => {
    switch (estado) {
      case 'active':
        return <Badge className="bg-green-500 hover:bg-green-600">Activo</Badge>;
      case 'on_leave':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Licencia</Badge>;
      case 'suspended':
        return <Badge className="bg-orange-500 hover:bg-orange-600">Suspendido</Badge>;
      case 'terminated':
        return <Badge className="bg-red-500 hover:bg-red-600">Terminado</Badge>;
      default:
        return <Badge>{estado}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg text-muted-foreground">Cargando empleados...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <h3 className="text-lg font-semibold">Error al cargar los empleados</h3>
        <p className="text-muted-foreground mb-4">
          No se pudieron cargar los datos. Por favor, inténtelo de nuevo.
        </p>
        <Button onClick={() => window.location.reload()} variant="outline">
          Reintentar
        </Button>
      </div>
    );
  }

  if (!data || data.data.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No hay empleados registrados.</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Puesto</TableHead>
            <TableHead>Departamento</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.data.map((empleado) => (
            <TableRow key={empleado.id}>
              <TableCell className="font-medium">
                {empleado.firstName} {empleado.lastName}
              </TableCell>
              <TableCell>{empleado.position || 'No definido'}</TableCell>
              <TableCell>{empleado.department || 'No asignado'}</TableCell>
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
  );
}