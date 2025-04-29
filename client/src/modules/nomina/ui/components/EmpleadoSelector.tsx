import React, { useEffect, useState } from 'react';
import { Employee } from '@shared/schema';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Button } from '@/components/ui/button';
import { SearchIcon, UserIcon, DollarSign, Briefcase } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface EmpleadoSelectorProps {
  empleados: Employee[];
  selectedIds: number[];
  onChange: (ids: number[]) => void;
  isLoading?: boolean;
}

export function EmpleadoSelector({ 
  empleados, 
  selectedIds, 
  onChange, 
  isLoading = false 
}: EmpleadoSelectorProps) {
  // Estados para filtrado y paginación
  const [filtro, setFiltro] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);
  const itemsPorPagina = 5;

  // Empleados filtrados
  const empleadosFiltrados = empleados.filter(empleado => {
    const nombreCompleto = `${empleado.firstName || ''} ${empleado.lastName || ''}`.toLowerCase();
    const departamento = empleado.department?.toLowerCase() || '';
    const puesto = empleado.position?.toLowerCase() || '';
    
    const terminoBusqueda = filtro.toLowerCase();
    
    return (
      nombreCompleto.includes(terminoBusqueda) ||
      departamento.includes(terminoBusqueda) ||
      puesto.includes(terminoBusqueda)
    );
  });

  // Total de páginas
  const totalPaginas = Math.ceil(empleadosFiltrados.length / itemsPorPagina);
  
  // Empleados paginados
  const empleadosPaginados = empleadosFiltrados.slice(
    (paginaActual - 1) * itemsPorPagina,
    paginaActual * itemsPorPagina
  );

  // Resetear paginación cuando cambia el filtro
  useEffect(() => {
    setPaginaActual(1);
  }, [filtro]);

  // Manejar selección de todos los empleados en la página actual
  const seleccionarTodosEnPagina = () => {
    const todosSeleccionados = empleadosPaginados.every(emp => selectedIds.includes(emp.id));
    
    if (todosSeleccionados) {
      // Desmarcar todos en la página actual
      const nuevosIds = selectedIds.filter(id => 
        !empleadosPaginados.some(emp => emp.id === id)
      );
      onChange(nuevosIds);
    } else {
      // Marcar todos en la página actual
      const idsEnPagina = empleadosPaginados.map(emp => emp.id);
      const nuevosIds = [...new Set([...selectedIds, ...idsEnPagina])];
      onChange(nuevosIds);
    }
  };

  // Manejar selección individual
  const toggleEmpleado = (id: number) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter(selectedId => selectedId !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Buscador */}
      <div className="relative w-full">
        <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre, departamento o puesto..."
          className="pl-9"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
        />
      </div>
      
      {/* Tabla de empleados */}
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox 
                  checked={
                    empleadosPaginados.length > 0 &&
                    empleadosPaginados.every(emp => selectedIds.includes(emp.id))
                  }
                  onCheckedChange={seleccionarTodosEnPagina}
                  aria-label="Seleccionar todos"
                />
              </TableHead>
              <TableHead>Empleado</TableHead>
              <TableHead>Departamento</TableHead>
              <TableHead>Puesto</TableHead>
              <TableHead className="text-right">Salario Base</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {empleadosPaginados.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No se encontraron empleados
                </TableCell>
              </TableRow>
            ) : (
              empleadosPaginados.map((empleado) => (
                <TableRow 
                  key={empleado.id}
                  className={
                    selectedIds.includes(empleado.id) 
                      ? "bg-muted/50" 
                      : undefined
                  }
                >
                  <TableCell>
                    <Checkbox 
                      checked={selectedIds.includes(empleado.id)}
                      onCheckedChange={() => toggleEmpleado(empleado.id)}
                      aria-label={`Seleccionar ${empleado.firstName}`}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-2">
                        <UserIcon className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {empleado.firstName} {empleado.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          ID: {empleado.id}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Briefcase className="h-4 w-4 mr-2 text-muted-foreground" />
                      {empleado.department || 'No asignado'}
                    </div>
                  </TableCell>
                  <TableCell>{empleado.position || 'No asignado'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end font-medium">
                      <DollarSign className="h-4 w-4 mr-1 text-muted-foreground" />
                      {empleado.salary 
                        ? formatCurrency(parseFloat(empleado.salary)) 
                        : 'No definido'}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Paginación */}
      {totalPaginas > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => setPaginaActual(p => Math.max(1, p - 1))}
                disabled={paginaActual === 1}
              />
            </PaginationItem>
            
            {Array.from({ length: totalPaginas }).map((_, index) => (
              <PaginationItem key={index}>
                <PaginationLink
                  isActive={paginaActual === index + 1}
                  onClick={() => setPaginaActual(index + 1)}
                >
                  {index + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            
            <PaginationItem>
              <PaginationNext 
                onClick={() => setPaginaActual(p => Math.min(totalPaginas, p + 1))}
                disabled={paginaActual === totalPaginas}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
      
      {/* Resumen de selección */}
      <div className="text-sm text-muted-foreground">
        {selectedIds.length === 0 ? (
          'No hay empleados seleccionados'
        ) : (
          <>
            <span className="font-medium">{selectedIds.length}</span> {selectedIds.length === 1 ? 'empleado seleccionado' : 'empleados seleccionados'}
          </>
        )}
      </div>
    </div>
  );
}