import { useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  ArrowLeft,
  Edit,
  Save,
  X,
  FileDown,
  Loader2,
  AlertCircle,
  Check,
  RefreshCw
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { descargarContratoEmpleado } from '../../api/empleadosApi';
import { useGetEmpleado } from '../../application/useGetEmpleado';
import { useEditarEmpleado } from '../../application/useEditarEmpleado';

export default function EmpleadoDetallePage() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<any>({});
  
  // Obtener datos del empleado
  const { 
    data: empleado, 
    isLoading, 
    isError, 
    error,
    refetch
  } = useGetEmpleado(id ? parseInt(id) : undefined);
  
  // Mutación para editar empleado
  const editarEmpleadoMutation = useEditarEmpleado();
  
  // Inicializar formulario cuando los datos están disponibles
  useState(() => {
    if (empleado && !editMode) {
      setFormData({
        userId: empleado.userId,
        position: empleado.position,
        department: empleado.department,
        hireDate: empleado.hireDate ? format(new Date(empleado.hireDate), 'yyyy-MM-dd') : '',
        salary: empleado.salary,
        phoneNumber: empleado.phoneNumber || '',
        address: empleado.address || '',
        emergencyContact: empleado.emergencyContact || '',
        contractStatus: empleado.contractStatus || 'active',
        contractType: empleado.contractType || 'fulltime',
        identification: empleado.identification,
        baseBenefits: empleado.baseBenefits || '',
        baseDeductions: empleado.baseDeductions || '',
        taxRate: empleado.taxRate || '',
        bankAccount: empleado.bankAccount || '',
        paymentMethod: empleado.paymentMethod || '',
        healthInsurance: empleado.healthInsurance || '',
        vacationDays: empleado.vacationDays || 0,
        tipoPago: empleado.tipoPago || '',
        fechaInicioNomina: empleado.fechaInicioNomina ? format(new Date(empleado.fechaInicioNomina), 'yyyy-MM-dd') : '',
        projectIds: empleado.projectIds || []
      });
    }
  }, [empleado, editMode]);
  
  // Manejar cambios en el formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Guardar cambios
  const handleSaveChanges = async () => {
    if (!id) return;
    
    try {
      await editarEmpleadoMutation.mutateAsync({
        id: parseInt(id),
        data: formData
      });
      
      setEditMode(false);
    } catch (error) {
      console.error('Error al guardar cambios:', error);
    }
  };
  
  // Cancelar edición
  const handleCancelEdit = () => {
    setEditMode(false);
    // Restaurar los datos originales
    if (empleado) {
      setFormData({
        userId: empleado.userId,
        position: empleado.position,
        department: empleado.department,
        hireDate: empleado.hireDate ? format(new Date(empleado.hireDate), 'yyyy-MM-dd') : '',
        salary: empleado.salary,
        phoneNumber: empleado.phoneNumber || '',
        address: empleado.address || '',
        emergencyContact: empleado.emergencyContact || '',
        contractStatus: empleado.contractStatus || 'active',
        contractType: empleado.contractType || 'fulltime',
        identification: empleado.identification,
        baseBenefits: empleado.baseBenefits || '',
        baseDeductions: empleado.baseDeductions || '',
        taxRate: empleado.taxRate || '',
        bankAccount: empleado.bankAccount || '',
        paymentMethod: empleado.paymentMethod || '',
        healthInsurance: empleado.healthInsurance || '',
        vacationDays: empleado.vacationDays || 0,
        tipoPago: empleado.tipoPago || '',
        fechaInicioNomina: empleado.fechaInicioNomina ? format(new Date(empleado.fechaInicioNomina), 'yyyy-MM-dd') : '',
        projectIds: empleado.projectIds || []
      });
    }
  };
  
  // Renderizar estado del contrato
  const renderEstadoContrato = (estado: string) => {
    switch (estado) {
      case 'active':
        return <Badge className="bg-green-500 hover:bg-green-600">Activo</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-500 hover:bg-gray-600">Inactivo</Badge>;
      case 'on_leave':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">En Permiso</Badge>;
      case 'terminated':
        return <Badge className="bg-red-500 hover:bg-red-600">Terminado</Badge>;
      default:
        return <Badge>{estado}</Badge>;
    }
  };
  
  // Renderizar tipo de contrato
  const renderTipoContrato = (tipo: string) => {
    switch (tipo) {
      case 'fulltime':
        return <Badge className="bg-blue-500 hover:bg-blue-600">Tiempo completo</Badge>;
      case 'parttime':
        return <Badge className="bg-indigo-500 hover:bg-indigo-600">Tiempo parcial</Badge>;
      case 'contractor':
        return <Badge className="bg-purple-500 hover:bg-purple-600">Contratista</Badge>;
      default:
        return <Badge>{tipo}</Badge>;
    }
  };
  
  // Si está cargando
  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
            <p className="text-lg text-muted-foreground">Cargando información del empleado...</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Si hay un error
  if (isError) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10 text-center">
            <AlertCircle className="h-10 w-10 text-destructive mb-4" />
            <h3 className="text-xl font-semibold mb-2">Error al cargar los datos</h3>
            <p className="text-muted-foreground mb-6">
              {error?.message || 'No se pudo cargar la información del empleado'}
            </p>
            <div className="flex gap-4">
              <Button onClick={() => refetch()} variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" />
                Reintentar
              </Button>
              <Button onClick={() => setLocation('/admin/finanzas/nomina/empleados')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver a la lista
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Si no hay empleado
  if (!empleado) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10 text-center">
            <AlertCircle className="h-10 w-10 text-destructive mb-4" />
            <h3 className="text-xl font-semibold mb-2">Empleado no encontrado</h3>
            <p className="text-muted-foreground mb-6">
              No se pudo encontrar el empleado con el ID especificado
            </p>
            <Button onClick={() => setLocation('/admin/finanzas/nomina/empleados')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a la lista
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center mb-6">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => setLocation('/admin/finanzas/nomina/empleados')} 
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">
            {(empleado as any).fullName || `Usuario #${empleado.userId}`}
          </h1>
          <p className="text-muted-foreground">
            {empleado.position} - {empleado.department}
          </p>
        </div>
        <div className="ml-auto space-x-2">
          {!editMode ? (
            <Button onClick={() => setEditMode(true)}>
              <Edit className="mr-2 h-4 w-4" />
              Editar información
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={handleCancelEdit}>
                <X className="mr-2 h-4 w-4" />
                Cancelar
              </Button>
              <Button 
                onClick={handleSaveChanges} 
                disabled={editarEmpleadoMutation.isPending}
              >
                {editarEmpleadoMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Guardar cambios
              </Button>
            </>
          )}
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Detalle del Empleado</CardTitle>
          <CardDescription>
            Información completa del empleado en el sistema
          </CardDescription>
        </CardHeader>
        
        <Tabs defaultValue="informacion">
          <CardContent className="pb-0">
            <TabsList className="w-full">
              <TabsTrigger value="informacion" className="flex-1">Información Personal</TabsTrigger>
              <TabsTrigger value="nomina" className="flex-1">Información de Nómina</TabsTrigger>
              <TabsTrigger value="contrato" className="flex-1">Contrato y Estado</TabsTrigger>
            </TabsList>
          </CardContent>
          
          <TabsContent value="informacion" className="pt-4">
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Datos personales */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Datos Personales</h3>
                    <Separator className="mb-4" />
                  </div>
                  
                  {editMode ? (
                    <>
                      <div className="grid gap-2">
                        <Label htmlFor="identification">Identificación</Label>
                        <Input
                          id="identification"
                          name="identification"
                          value={formData.identification}
                          onChange={handleInputChange}
                        />
                      </div>
                      
                      <div className="grid gap-2">
                        <Label htmlFor="phoneNumber">Teléfono</Label>
                        <Input
                          id="phoneNumber"
                          name="phoneNumber"
                          value={formData.phoneNumber}
                          onChange={handleInputChange}
                        />
                      </div>
                      
                      <div className="grid gap-2">
                        <Label htmlFor="address">Dirección</Label>
                        <Input
                          id="address"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                        />
                      </div>
                      
                      <div className="grid gap-2">
                        <Label htmlFor="emergencyContact">Contacto de Emergencia</Label>
                        <Input
                          id="emergencyContact"
                          name="emergencyContact"
                          value={formData.emergencyContact}
                          onChange={handleInputChange}
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="font-medium text-muted-foreground">Identificación:</div>
                        <div>{empleado.identification}</div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div className="font-medium text-muted-foreground">Teléfono:</div>
                        <div>{empleado.phoneNumber || 'No registrado'}</div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div className="font-medium text-muted-foreground">Dirección:</div>
                        <div>{empleado.address || 'No registrada'}</div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div className="font-medium text-muted-foreground">Contacto Emergencia:</div>
                        <div>{empleado.emergencyContact || 'No registrado'}</div>
                      </div>
                    </>
                  )}
                </div>
                
                {/* Datos profesionales */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Datos Profesionales</h3>
                    <Separator className="mb-4" />
                  </div>
                  
                  {editMode ? (
                    <>
                      <div className="grid gap-2">
                        <Label htmlFor="position">Cargo</Label>
                        <Input
                          id="position"
                          name="position"
                          value={formData.position}
                          onChange={handleInputChange}
                        />
                      </div>
                      
                      <div className="grid gap-2">
                        <Label htmlFor="department">Departamento</Label>
                        <Select
                          value={formData.department}
                          onValueChange={(value) => handleSelectChange('department', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un departamento" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Administración">Administración</SelectItem>
                            <SelectItem value="Finanzas">Finanzas</SelectItem>
                            <SelectItem value="Recursos Humanos">Recursos Humanos</SelectItem>
                            <SelectItem value="Tecnología">Tecnología</SelectItem>
                            <SelectItem value="Ventas">Ventas</SelectItem>
                            <SelectItem value="Marketing">Marketing</SelectItem>
                            <SelectItem value="Operaciones">Operaciones</SelectItem>
                            <SelectItem value="Logística">Logística</SelectItem>
                            <SelectItem value="Producción">Producción</SelectItem>
                            <SelectItem value="Legal">Legal</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="grid gap-2">
                        <Label htmlFor="hireDate">Fecha de Ingreso</Label>
                        <Input
                          id="hireDate"
                          name="hireDate"
                          type="date"
                          value={formData.hireDate}
                          onChange={handleInputChange}
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="font-medium text-muted-foreground">Cargo:</div>
                        <div>{empleado.position}</div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div className="font-medium text-muted-foreground">Departamento:</div>
                        <div>{empleado.department}</div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div className="font-medium text-muted-foreground">Fecha de Ingreso:</div>
                        <div>
                          {empleado.hireDate 
                            ? format(new Date(empleado.hireDate), 'dd/MM/yyyy', { locale: es }) 
                            : 'No registrada'
                          }
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div className="font-medium text-muted-foreground">Estado:</div>
                        <div>{renderEstadoContrato(empleado.contractStatus || 'active')}</div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div className="font-medium text-muted-foreground">Tipo de Contrato:</div>
                        <div>{renderTipoContrato(empleado.contractType || 'fulltime')}</div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </TabsContent>
          
          <TabsContent value="nomina" className="pt-4">
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Información salarial */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Información Salarial</h3>
                    <Separator className="mb-4" />
                  </div>
                  
                  {editMode ? (
                    <>
                      <div className="grid gap-2">
                        <Label htmlFor="salary">Salario Base</Label>
                        <Input
                          id="salary"
                          name="salary"
                          value={formData.salary}
                          onChange={handleInputChange}
                        />
                      </div>
                      
                      <div className="grid gap-2">
                        <Label htmlFor="tipoPago">Tipo de Pago</Label>
                        <Select
                          value={formData.tipoPago}
                          onValueChange={(value) => handleSelectChange('tipoPago', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona tipo de pago" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Quincenal">Quincenal</SelectItem>
                            <SelectItem value="Mensual">Mensual</SelectItem>
                            <SelectItem value="Semanal">Semanal</SelectItem>
                            <SelectItem value="Por Proyecto">Por Proyecto</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="grid gap-2">
                        <Label htmlFor="fechaInicioNomina">Fecha Inicio Nómina</Label>
                        <Input
                          id="fechaInicioNomina"
                          name="fechaInicioNomina"
                          type="date"
                          value={formData.fechaInicioNomina}
                          onChange={handleInputChange}
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="font-medium text-muted-foreground">Salario Base:</div>
                        <div>
                          {new Intl.NumberFormat('es-CO', {
                            style: 'currency',
                            currency: 'COP'
                          }).format(Number(empleado.salary) || 0)}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div className="font-medium text-muted-foreground">Tipo de Pago:</div>
                        <div>{empleado.tipoPago || 'No especificado'}</div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div className="font-medium text-muted-foreground">Inicio de Nómina:</div>
                        <div>
                          {empleado.fechaInicioNomina 
                            ? format(new Date(empleado.fechaInicioNomina), 'dd/MM/yyyy', { locale: es }) 
                            : 'No registrada'
                          }
                        </div>
                      </div>
                    </>
                  )}
                </div>
                
                {/* Beneficios y deducciones */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Beneficios y Deducciones</h3>
                    <Separator className="mb-4" />
                  </div>
                  
                  {editMode ? (
                    <>
                      <div className="grid gap-2">
                        <Label htmlFor="baseBenefits">Beneficios Base</Label>
                        <Input
                          id="baseBenefits"
                          name="baseBenefits"
                          value={formData.baseBenefits}
                          onChange={handleInputChange}
                        />
                      </div>
                      
                      <div className="grid gap-2">
                        <Label htmlFor="baseDeductions">Deducciones Base</Label>
                        <Input
                          id="baseDeductions"
                          name="baseDeductions"
                          value={formData.baseDeductions}
                          onChange={handleInputChange}
                        />
                      </div>
                      
                      <div className="grid gap-2">
                        <Label htmlFor="taxRate">Tasa de Impuestos (%)</Label>
                        <Input
                          id="taxRate"
                          name="taxRate"
                          value={formData.taxRate}
                          onChange={handleInputChange}
                        />
                      </div>
                      
                      <div className="grid gap-2">
                        <Label htmlFor="vacationDays">Días de Vacaciones</Label>
                        <Input
                          id="vacationDays"
                          name="vacationDays"
                          type="number"
                          value={formData.vacationDays}
                          onChange={handleInputChange}
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="font-medium text-muted-foreground">Beneficios Base:</div>
                        <div>
                          {empleado.baseBenefits 
                            ? new Intl.NumberFormat('es-CO', {
                                style: 'currency',
                                currency: 'COP'
                              }).format(Number(empleado.baseBenefits) || 0)
                            : 'No especificado'
                          }
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div className="font-medium text-muted-foreground">Deducciones Base:</div>
                        <div>
                          {empleado.baseDeductions 
                            ? new Intl.NumberFormat('es-CO', {
                                style: 'currency',
                                currency: 'COP'
                              }).format(Number(empleado.baseDeductions) || 0)
                            : 'No especificado'
                          }
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div className="font-medium text-muted-foreground">Tasa de Impuestos:</div>
                        <div>{empleado.taxRate ? `${empleado.taxRate}%` : 'No especificada'}</div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div className="font-medium text-muted-foreground">Días de Vacaciones:</div>
                        <div>{empleado.vacationDays || '0'}</div>
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              {/* Información de pago */}
              <div className="mt-8 space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Información de Pago</h3>
                  <Separator className="mb-4" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {editMode ? (
                    <>
                      <div className="grid gap-2">
                        <Label htmlFor="bankAccount">Cuenta Bancaria</Label>
                        <Input
                          id="bankAccount"
                          name="bankAccount"
                          value={formData.bankAccount}
                          onChange={handleInputChange}
                        />
                      </div>
                      
                      <div className="grid gap-2">
                        <Label htmlFor="paymentMethod">Método de Pago</Label>
                        <Select
                          value={formData.paymentMethod}
                          onValueChange={(value) => handleSelectChange('paymentMethod', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona método de pago" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Transferencia Bancaria">Transferencia Bancaria</SelectItem>
                            <SelectItem value="Cheque">Cheque</SelectItem>
                            <SelectItem value="Efectivo">Efectivo</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="grid gap-2">
                        <Label htmlFor="healthInsurance">Seguro de Salud</Label>
                        <Input
                          id="healthInsurance"
                          name="healthInsurance"
                          value={formData.healthInsurance}
                          onChange={handleInputChange}
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="font-medium text-muted-foreground">Cuenta Bancaria:</div>
                          <div>{empleado.bankAccount || 'No registrada'}</div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2">
                          <div className="font-medium text-muted-foreground">Método de Pago:</div>
                          <div>{empleado.paymentMethod || 'No especificado'}</div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="font-medium text-muted-foreground">Seguro de Salud:</div>
                          <div>{empleado.healthInsurance || 'No registrado'}</div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              {/* Historial de nómina */}
              <div className="mt-8 space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Historial de Nómina</h3>
                  <Separator className="mb-4" />
                </div>
                
                {/* Aquí iría el historial de nómina que implementaremos después */}
                <div className="text-center p-8 border rounded-md bg-gray-50">
                  <p className="text-muted-foreground">
                    El historial de nómina se habilitará en la siguiente fase de implementación
                  </p>
                </div>
              </div>
            </CardContent>
          </TabsContent>
          
          <TabsContent value="contrato" className="pt-4">
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Información de contrato */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Información de Contrato</h3>
                    <Separator className="mb-4" />
                  </div>
                  
                  {editMode ? (
                    <>
                      <div className="grid gap-2">
                        <Label htmlFor="contractType">Tipo de Contrato</Label>
                        <Select
                          value={formData.contractType}
                          onValueChange={(value) => handleSelectChange('contractType', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona tipo de contrato" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="fulltime">Tiempo Completo</SelectItem>
                            <SelectItem value="parttime">Tiempo Parcial</SelectItem>
                            <SelectItem value="contractor">Contratista</SelectItem>
                            <SelectItem value="temporary">Temporal</SelectItem>
                            <SelectItem value="internship">Pasantía</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="grid gap-2">
                        <Label htmlFor="contractStatus">Estado del Contrato</Label>
                        <Select
                          value={formData.contractStatus}
                          onValueChange={(value) => handleSelectChange('contractStatus', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona estado" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Activo</SelectItem>
                            <SelectItem value="inactive">Inactivo</SelectItem>
                            <SelectItem value="on_leave">En Permiso</SelectItem>
                            <SelectItem value="terminated">Terminado</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="font-medium text-muted-foreground">Tipo de Contrato:</div>
                        <div>{renderTipoContrato(empleado.contractType || 'fulltime')}</div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div className="font-medium text-muted-foreground">Estado del Contrato:</div>
                        <div>{renderEstadoContrato(empleado.contractStatus || 'active')}</div>
                      </div>
                    </>
                  )}
                </div>
                
                {/* Documento de contrato */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Documento de Contrato</h3>
                    <Separator className="mb-4" />
                  </div>
                  
                  {empleado.contratoUrl ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="font-medium text-muted-foreground">Contrato:</div>
                        <div>Archivo disponible</div>
                      </div>
                      
                      <Button 
                        variant="outline" 
                        onClick={() => descargarContratoEmpleado(empleado.id)}
                        className="w-full"
                      >
                        <FileDown className="mr-2 h-4 w-4" />
                        Descargar contrato
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center p-6 border rounded-md">
                      <p className="text-muted-foreground mb-2">
                        No hay contrato registrado para este empleado
                      </p>
                      {!editMode && (
                        <Button variant="outline" onClick={() => setEditMode(true)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar para subir contrato
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Proyectos asignados */}
              <div className="mt-8 space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Proyectos Asignados</h3>
                  <Separator className="mb-4" />
                </div>
                
                {/* Aquí iría la lista de proyectos que implementaremos después */}
                <div className="text-center p-8 border rounded-md bg-gray-50">
                  <p className="text-muted-foreground">
                    La asignación de proyectos se habilitará en la siguiente fase de implementación
                  </p>
                </div>
              </div>
            </CardContent>
          </TabsContent>
        </Tabs>
        
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={() => setLocation('/admin/finanzas/nomina/empleados')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a la lista
          </Button>
          
          {editarEmpleadoMutation.isSuccess && (
            <div className="flex items-center text-green-600">
              <Check className="mr-2 h-4 w-4" />
              Cambios guardados correctamente
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}