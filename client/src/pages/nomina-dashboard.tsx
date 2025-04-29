import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  ArrowRight,
  Calendar,
  CheckCircle,
  ClipboardList,
  DollarSign,
  FileText,
  PlusCircle,
  RefreshCw,
  UserPlus,
  Users,
  AlertTriangle
} from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { EmpleadoForm } from '@/modules/nomina/empleados/ui/forms/EmpleadoForm';
import EmpleadosPage from '@/modules/nomina/empleados/ui/pages/EmpleadosPage';
import { NominaFormModal } from '@/modules/nomina/ui/components/NominaFormModal';
import { useCrearNomina } from '@/modules/nomina/application/useCrearNomina';

export default function NominaDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isCrearEmpleadoOpen, setIsCrearEmpleadoOpen] = useState(false);
  const [showNuevaForma, setShowNuevaForma] = useState(false);
  
  // Hook para crear nómina
  const crearNominaMutation = useCrearNomina();
  
  // Datos de ejemplo para el dashboard
  const dashboardData = {
    totalEmpleados: 45,
    nuevosEmpleadosMes: 3,
    nominaMensual: '€102,450',
    cambioNomina: '+5.3%',
    proximoPago: '25 Mayo',
    diasRestantes: 12,
    nominasPendientes: 3
  };
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sistema de Nómina</h1>
          <p className="text-muted-foreground">
            Gestión de empleados, procesamiento de nóminas y reportes
          </p>
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => window.location.reload()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Actualizar
          </Button>
          
          <Dialog open={isCrearEmpleadoOpen} onOpenChange={setIsCrearEmpleadoOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Nuevo Empleado
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Crear Nuevo Empleado</DialogTitle>
                <DialogDescription>
                  Complete el formulario para registrar un nuevo empleado en el sistema
                </DialogDescription>
              </DialogHeader>
              <EmpleadoForm onSuccess={() => {
                setIsCrearEmpleadoOpen(false);
              }} />
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <Tabs defaultValue="dashboard" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="empleados">Empleados</TabsTrigger>
          <TabsTrigger value="nominas">Gestión de Nóminas</TabsTrigger>
          <TabsTrigger value="configuracion">Configuración</TabsTrigger>
          <TabsTrigger value="reportes">Reportes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Total Empleados */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Empleados</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.totalEmpleados}</div>
                <p className="text-xs text-muted-foreground">
                  {dashboardData.nuevosEmpleadosMes} nuevos este mes
                </p>
              </CardContent>
            </Card>
            
            {/* Nómina Mensual */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Nómina Mensual</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.nominaMensual}</div>
                <p className="text-xs text-muted-foreground">
                  {dashboardData.cambioNomina} respecto al mes anterior
                </p>
              </CardContent>
            </Card>
            
            {/* Próximo Pago */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Próximo Pago</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.proximoPago}</div>
                <p className="text-xs text-muted-foreground">
                  Faltan {dashboardData.diasRestantes} días
                </p>
              </CardContent>
            </Card>
            
            {/* Nóminas Pendientes */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Nóminas Pendientes</CardTitle>
                <ClipboardList className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.nominasPendientes}</div>
                <p className="text-xs text-muted-foreground">
                  Requieren revisión
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Nóminas Recientes</CardTitle>
                <CardDescription>
                  Las últimas nóminas procesadas en el sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-md">
                    <div className="flex items-center space-x-4">
                      <div className="bg-muted rounded-full p-2">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium">Nómina Abril 2025</p>
                        <p className="text-sm text-muted-foreground">Procesada el 15 de Abril</p>
                      </div>
                    </div>
                    <Badge>Pendiente</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-md">
                    <div className="flex items-center space-x-4">
                      <div className="bg-muted rounded-full p-2">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium">Nómina Marzo 2025</p>
                        <p className="text-sm text-muted-foreground">Procesada el 15 de Marzo</p>
                      </div>
                    </div>
                    <Badge variant="secondary">Pagada</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-md">
                    <div className="flex items-center space-x-4">
                      <div className="bg-muted rounded-full p-2">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium">Nómina Febrero 2025</p>
                        <p className="text-sm text-muted-foreground">Procesada el 15 de Febrero</p>
                      </div>
                    </div>
                    <Badge variant="secondary">Pagada</Badge>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" onClick={() => setActiveTab('nominas')} className="w-full">
                  Ver todas las nóminas
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Acciones Rápidas</CardTitle>
                <CardDescription>
                  Acceda rápidamente a las funciones más utilizadas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start" 
                  onClick={() => setIsCrearEmpleadoOpen(true)}
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Registrar Nuevo Empleado
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setActiveTab('nominas')}
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Crear Nómina
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setActiveTab('nominas')}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Procesar Pagos Pendientes
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setActiveTab('reportes')}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Generar Reporte
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="empleados">
          <EmpleadosPage />
        </TabsContent>
        
        <TabsContent value="nominas">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Nóminas</CardTitle>
              <CardDescription>
                Crear, procesar y revisar nóminas del personal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert className="mb-6">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Atención</AlertTitle>
                <AlertDescription>
                  Estamos trabajando en esta sección. Pronto estará disponible la gestión completa de nóminas.
                </AlertDescription>
              </Alert>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Nóminas Pendientes</h3>
                  <Separator className="mb-4" />
                  
                  <div className="space-y-4">
                    <div className="p-4 border rounded-md">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">Abril 2025</p>
                          <p className="text-sm text-muted-foreground">Para 45 empleados</p>
                        </div>
                        <Badge variant="outline">Pendiente</Badge>
                      </div>
                      <div className="mt-4 flex justify-end">
                        <Button variant="outline" size="sm">Ver Detalles</Button>
                        <Button variant="default" size="sm" className="ml-2">Procesar</Button>
                      </div>
                    </div>
                    
                    <div className="p-4 border rounded-md">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">Extra - Bonos Q1</p>
                          <p className="text-sm text-muted-foreground">Para 12 empleados</p>
                        </div>
                        <Badge variant="outline">Pendiente</Badge>
                      </div>
                      <div className="mt-4 flex justify-end">
                        <Button variant="outline" size="sm">Ver Detalles</Button>
                        <Button variant="default" size="sm" className="ml-2">Procesar</Button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Nóminas Recientes</h3>
                  <Separator className="mb-4" />
                  
                  <div className="space-y-4">
                    <div className="p-4 border rounded-md">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">Marzo 2025</p>
                          <p className="text-sm text-muted-foreground">43 empleados - €98,250</p>
                        </div>
                        <Badge variant="secondary">Pagada</Badge>
                      </div>
                      <div className="mt-4 flex justify-end">
                        <Button variant="outline" size="sm">Ver Detalles</Button>
                        <Button variant="outline" size="sm" className="ml-2">Descargar</Button>
                      </div>
                    </div>
                    
                    <div className="p-4 border rounded-md">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">Febrero 2025</p>
                          <p className="text-sm text-muted-foreground">43 empleados - €97,800</p>
                        </div>
                        <Badge variant="secondary">Pagada</Badge>
                      </div>
                      <div className="mt-4 flex justify-end">
                        <Button variant="outline" size="sm">Ver Detalles</Button>
                        <Button variant="outline" size="sm" className="ml-2">Descargar</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Ver Historial Completo</Button>
              <Button onClick={() => setShowNuevaForma(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Crear Nueva Nómina
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="configuracion">
          <Card>
            <CardHeader>
              <CardTitle>Configuración del Sistema de Nómina</CardTitle>
              <CardDescription>
                Gestione los parámetros y ajustes del sistema de nómina
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert className="mb-6">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Atención</AlertTitle>
                <AlertDescription>
                  Estamos trabajando en esta sección. Pronto estará disponible la configuración completa del sistema.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="reportes">
          <Card>
            <CardHeader>
              <CardTitle>Reportes de Nómina</CardTitle>
              <CardDescription>
                Genere informes y análisis del sistema de nómina
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert className="mb-6">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Atención</AlertTitle>
                <AlertDescription>
                  Estamos trabajando en esta sección. Pronto estarán disponibles los reportes completos.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Modal de creación de nómina */}
      <NominaFormModal 
        open={showNuevaForma}
        onOpenChange={setShowNuevaForma}
      />
    </div>
  );
}