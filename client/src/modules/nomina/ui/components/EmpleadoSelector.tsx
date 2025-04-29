import React, { useState, useEffect } from 'react';
import { Employee } from '@shared/schema';
import { formatCurrency } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Users, Filter, ArrowUpDown } from 'lucide-react';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [department, setDepartment] = useState('');
  const [page, setPage] = useState(1);
  const [selectedAll, setSelectedAll] = useState(false);
  const pageSize = 5;
  
  // Lista de departamentos únicos
  const departments = [...new Set(empleados.map(e => e.department))].sort();
  
  // Filtrar empleados por búsqueda y departamento
  const filteredEmpleados = empleados.filter(empleado => {
    const matchesSearch = searchTerm === '' || 
      (empleado.firstName && empleado.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (empleado.lastName && empleado.lastName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (empleado.position && empleado.position.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesDepartment = department === '' || empleado.department === department;
    
    return matchesSearch && matchesDepartment;
  });
  
  // Paginación
  const totalPages = Math.ceil(filteredEmpleados.length / pageSize);
  const startIndex = (page - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, filteredEmpleados.length);
  const paginatedEmpleados = filteredEmpleados.slice(startIndex, endIndex);
  
  // Actualizar el estado cuando cambia la selección de "Seleccionar todos"
  useEffect(() => {
    if (selectedAll) {
      const newSelectedIds = [...selectedIds];
      paginatedEmpleados.forEach(empleado => {
        if (!newSelectedIds.includes(empleado.id)) {
          newSelectedIds.push(empleado.id);
        }
      });
      onChange(newSelectedIds);
    }
  }, [selectedAll, page]);
  
  // Comprobar si todos los empleados de la página actual están seleccionados
  useEffect(() => {
    const allSelected = paginatedEmpleados.length > 0 && 
      paginatedEmpleados.every(empleado => selectedIds.includes(empleado.id));
    setSelectedAll(allSelected);
  }, [selectedIds, page, paginatedEmpleados]);
  
  // Limpiar selección
  const handleClearSelection = () => {
    onChange([]);
    setSelectedAll(false);
  };
  
  // Seleccionar/deseleccionar todo en la página actual
  const handleSelectAllInPage = () => {
    const newSelectedAll = !selectedAll;
    setSelectedAll(newSelectedAll);
    
    if (newSelectedAll) {
      // Añadir todos los de la página actual
      const newSelectedIds = [...selectedIds];
      paginatedEmpleados.forEach(empleado => {
        if (!newSelectedIds.includes(empleado.id)) {
          newSelectedIds.push(empleado.id);
        }
      });
      onChange(newSelectedIds);
    } else {
      // Quitar los de la página actual
      const newSelectedIds = selectedIds.filter(id => 
        !paginatedEmpleados.some(empleado => empleado.id === id)
      );
      onChange(newSelectedIds);
    }
  };
  
  // Cambiar la página
  const handlePageChange = (newPage: number) => {
    setPage(Math.max(1, Math.min(newPage, totalPages)));
  };
  
  // Texto para la selección actual
  const selectionText = selectedIds.length === 0 
    ? 'Ningún empleado seleccionado' 
    : `${selectedIds.length} ${selectedIds.length === 1 ? 'empleado seleccionado' : 'empleados seleccionados'}`;
  
  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <Users className="h-5 w-5 mr-1" />
          Seleccionar Empleados
        </CardTitle>
        <CardDescription>
          Seleccione los empleados a incluir en esta nómina.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Filtros */}
        <div className="flex flex-col md:flex-row gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar empleado..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1); // Resetear a primera página al cambiar la búsqueda
              }}
            />
          </div>
          
          <div className="w-full md:w-[200px]">
            <Select
              value={department}
              onValueChange={(value) => {
                setDepartment(value);
                setPage(1); // Resetear a primera página al cambiar el departamento
              }}
            >
              <SelectTrigger>
                <div className="flex items-center">
                  <Filter className="h-4 w-4 mr-1" />
                  <SelectValue placeholder="Departamento" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept || 'sin-departamento'}>
                    {dept || 'Sin departamento'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Botones para gestionar la selección */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearSelection}
              disabled={selectedIds.length === 0}
              className="whitespace-nowrap"
            >
              Limpiar selección
            </Button>
          </div>
        </div>
        
        {/* Badge con el número de empleados seleccionados */}
        <div className="mb-2 flex items-center">
          <Badge variant="outline" className="mr-2">
            {selectionText}
          </Badge>
        </div>
        
        {/* Tabla de empleados */}
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]">
                  <Checkbox 
                    checked={selectedAll}
                    onCheckedChange={handleSelectAllInPage}
                  />
                </TableHead>
                <TableHead className="w-[200px]">
                  <div className="flex items-center">
                    Nombre <ArrowUpDown className="ml-1 h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead>Departamento</TableHead>
                <TableHead>Cargo</TableHead>
                <TableHead className="text-right">Salario Base</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground">Cargando empleados...</div>
                  </TableCell>
                </TableRow>
              ) : paginatedEmpleados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <p className="text-muted-foreground">No se encontraron empleados</p>
                    {(searchTerm || department) && (
                      <p className="text-sm mt-1">Prueba con otros filtros</p>
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedEmpleados.map((empleado) => (
                  <TableRow key={empleado.id}>
                    <TableCell>
                      <Checkbox 
                        checked={selectedIds.includes(empleado.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            onChange([...selectedIds, empleado.id]);
                          } else {
                            onChange(selectedIds.filter(id => id !== empleado.id));
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {empleado.firstName} {empleado.lastName}
                    </TableCell>
                    <TableCell>{empleado.department}</TableCell>
                    <TableCell>{empleado.position}</TableCell>
                    <TableCell className="text-right">
                      {empleado.salary ? formatCurrency(parseFloat(empleado.salary)) : '-'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        
        {/* Paginación */}
        {totalPages > 1 && (
          <div className="mt-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <Button variant="ghost" size="icon" onClick={() => handlePageChange(page - 1)} 
                    className={page <= 1 ? "opacity-50 cursor-not-allowed" : ""}>
                    <PaginationPrevious />
                  </Button>
                </PaginationItem>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => Math.abs(p - page) < 2 || p === 1 || p === totalPages)
                  .map((p) => (
                    <React.Fragment key={p}>
                      {p !== 1 && p !== totalPages && Math.abs(p - page) >= 2 && p === page + 1 && (
                        <PaginationItem>
                          <PaginationLink>...</PaginationLink>
                        </PaginationItem>
                      )}
                      
                      <PaginationItem>
                        <Button 
                          variant={p === page ? "default" : "ghost"} 
                          size="icon"
                          onClick={() => handlePageChange(p)}
                        >
                          <PaginationLink>{p}</PaginationLink>
                        </Button>
                      </PaginationItem>
                      
                      {p !== 1 && p !== totalPages && Math.abs(p - page) >= 2 && p === page - 1 && (
                        <PaginationItem>
                          <PaginationLink>...</PaginationLink>
                        </PaginationItem>
                      )}
                    </React.Fragment>
                  ))}
                
                <PaginationItem>
                  <Button variant="ghost" size="icon" onClick={() => handlePageChange(page + 1)}
                    className={page >= totalPages ? "opacity-50 cursor-not-allowed" : ""}>
                    <PaginationNext />
                  </Button>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </CardContent>
    </Card>
  );
}