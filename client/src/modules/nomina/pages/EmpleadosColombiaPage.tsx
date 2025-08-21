import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Edit, Trash2, Eye, Calculator, FileText, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { EmpleadosColombiaApi } from "../services/empleados.api";
import { EmpleadoColombiaSimple } from "../components/EmpleadoColombiaSimple";
import type { Employee } from "@shared/schema";

export function EmpleadosColombiaPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filterContrato, setFilterContrato] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEmpleado, setSelectedEmpleado] = useState<Employee | null>(null);

  // Consultar empleados
  const { data: empleados = [], isLoading } = useQuery({
    queryKey: ["/api/empleados-colombia"],
    queryFn: () => EmpleadosColombiaApi.getAllEmpleados(),
  });

  // Consultar parámetros legales
  const { data: parametrosLegales } = useQuery({
    queryKey: ["/api/parametros-legales"],
    queryFn: () => EmpleadosColombiaApi.getParametrosLegales(),
  });

  // Mutación para crear empleado
  const createEmpleado = useMutation({
    mutationFn: (data: any) => EmpleadosColombiaApi.createEmpleado(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/empleados-colombia"] });
      setIsCreateModalOpen(false);
      toast({
        title: "Empleado creado",
        description: "El empleado ha sido creado exitosamente",
      });
    },
    onError: (error) => {
      toast({
        title: "Error al crear empleado",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive",
      });
    },
  });

  // Mutación para actualizar empleado
  const updateEmpleado = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      EmpleadosColombiaApi.updateEmpleado(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/empleados-colombia"] });
      setIsEditModalOpen(false);
      setSelectedEmpleado(null);
      toast({
        title: "Empleado actualizado",
        description: "Los datos del empleado han sido actualizados exitosamente",
      });
    },
    onError: (error) => {
      toast({
        title: "Error al actualizar empleado",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive",
      });
    },
  });

  // Mutación para eliminar empleado
  const deleteEmpleado = useMutation({
    mutationFn: (id: number) => EmpleadosColombiaApi.deleteEmpleado(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/empleados-colombia"] });
      toast({
        title: "Empleado eliminado",
        description: "El empleado ha sido dado de baja exitosamente",
      });
    },
    onError: (error) => {
      toast({
        title: "Error al eliminar empleado",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive",
      });
    },
  });

  const handleCreateEmpleado = (data: any) => {
    createEmpleado.mutate(data);
  };

  const handleUpdateEmpleado = (data: any) => {
    if (selectedEmpleado) {
      updateEmpleado.mutate({ id: selectedEmpleado.id, data });
    }
  };

  const handleDeleteEmpleado = (id: number) => {
    if (confirm("¿Estás seguro de que deseas dar de baja a este empleado?")) {
      deleteEmpleado.mutate(id);
    }
  };

  const handleEditEmpleado = (empleado: Employee) => {
    setSelectedEmpleado(empleado);
    setIsEditModalOpen(true);
  };

  // Filtrar empleados
  const empleadosFiltrados = empleados.filter((empleado: Employee) => {
    const matchesSearch = 
      empleado.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      empleado.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      empleado.identification?.includes(searchTerm) ||
      empleado.position?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesContrato = !filterContrato || empleado.tipoContrato === filterContrato;
    
    return matchesSearch && matchesContrato;
  });

  const getTipoContratoLabel = (tipo: string) => {
    const labels = {
      indefinido: "Indefinido",
      fijo: "Fijo",
      prestacion_servicios: "Prestación Servicios",
      por_horas: "Por Horas"
    };
    return labels[tipo as keyof typeof labels] || tipo;
  };

  const getTipoContratoColor = (tipo: string) => {
    const colors = {
      indefinido: "bg-green-100 text-green-800",
      fijo: "bg-blue-100 text-blue-800",
      prestacion_servicios: "bg-purple-100 text-purple-800",
      por_horas: "bg-orange-100 text-orange-800"
    };
    return colors[tipo as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const formatCurrency = (amount: string | null) => {
    if (!amount) return "N/A";
    return `$${Number(amount).toLocaleString('es-CO')}`;
  };

  // Estadísticas
  const stats = {
    total: empleados.length,
    indefinidos: empleados.filter((e: Employee) => e.tipoContrato === "indefinido").length,
    fijos: empleados.filter((e: Employee) => e.tipoContrato === "fijo").length,
    servicios: empleados.filter((e: Employee) => e.tipoContrato === "prestacion_servicios").length,
    horas: empleados.filter((e: Employee) => e.tipoContrato === "por_horas").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Empleados - Marco Legal Colombiano</h1>
          <p className="text-muted-foreground">
            Gestión completa de empleados con cumplimiento legal colombiano
          </p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Empleado
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Empleado</DialogTitle>
              <DialogDescription>
                Complete la información del empleado según el marco legal colombiano
              </DialogDescription>
            </DialogHeader>
            <EmpleadoColombiaSimple
              onSubmit={handleCreateEmpleado}
              onCancel={() => setIsCreateModalOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Empleados</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Indefinidos</CardTitle>
            <Badge className="bg-green-100 text-green-800">{stats.indefinidos}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.indefinidos}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fijos</CardTitle>
            <Badge className="bg-blue-100 text-blue-800">{stats.fijos}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.fijos}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prestación Servicios</CardTitle>
            <Badge className="bg-purple-100 text-purple-800">{stats.servicios}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.servicios}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Por Horas</CardTitle>
            <Badge className="bg-orange-100 text-orange-800">{stats.horas}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.horas}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, identificación o cargo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          <Select value={filterContrato} onValueChange={setFilterContrato}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Tipo de contrato" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos los contratos</SelectItem>
              <SelectItem value="indefinido">Indefinido</SelectItem>
              <SelectItem value="fijo">Fijo</SelectItem>
              <SelectItem value="prestacion_servicios">Prestación Servicios</SelectItem>
              <SelectItem value="por_horas">Por Horas</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Lista de Empleados */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Empleados</CardTitle>
          <CardDescription>
            {empleadosFiltrados.length} empleado(s) encontrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="text-muted-foreground">Cargando empleados...</div>
            </div>
          ) : empleadosFiltrados.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-muted-foreground">No se encontraron empleados</div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Identificación</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Tipo Contrato</TableHead>
                  <TableHead>Salario/Honorarios</TableHead>
                  <TableHead>ARL</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {empleadosFiltrados.map((empleado: Employee) => (
                  <TableRow key={empleado.id}>
                    <TableCell className="font-medium">
                      {empleado.firstName} {empleado.lastName}
                    </TableCell>
                    <TableCell>{empleado.identification}</TableCell>
                    <TableCell>{empleado.position}</TableCell>
                    <TableCell>
                      <Badge className={getTipoContratoColor(empleado.tipoContrato!)}>
                        {getTipoContratoLabel(empleado.tipoContrato!)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {empleado.tipoContrato === "prestacion_servicios" 
                        ? formatCurrency(empleado.honorarios)
                        : empleado.tipoContrato === "por_horas"
                        ? `${formatCurrency(empleado.salarioPorHora)}/hora`
                        : formatCurrency(empleado.salary)
                      }
                    </TableCell>
                    <TableCell>Clase {empleado.claseRiesgoARL}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditEmpleado(empleado)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteEmpleado(empleado.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Modal de Edición */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Empleado</DialogTitle>
            <DialogDescription>
              Actualizar información del empleado
            </DialogDescription>
          </DialogHeader>
          {selectedEmpleado && (
            <EmpleadoColombiaSimple
              empleado={selectedEmpleado}
              onSubmit={handleUpdateEmpleado}
              onCancel={() => {
                setIsEditModalOpen(false);
                setSelectedEmpleado(null);
              }}
              isEditing={true}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}