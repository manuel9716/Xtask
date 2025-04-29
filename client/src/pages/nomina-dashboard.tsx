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
  AlertTriangle,
  Loader2
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
import GestionNominasPage from '@/modules/nomina/ui/pages/GestionNominasPage';
import { NominaFormModal } from '@/modules/nomina/ui/components/NominaFormModal';
import { useCrearNomina } from '@/modules/nomina/application/useCrearNomina';
import { useDashboardNomina } from '@/modules/nomina/application/useDashboardNomina';
import { useListarNominas } from '@/modules/nomina/application/useListarNominas';

export default function NominaDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isCrearEmpleadoOpen, setIsCrearEmpleadoOpen] = useState(false);
  const [showNuevaForma, setShowNuevaForma] = useState(false);
  
  // Hook para crear nómina
  const crearNominaMutation = useCrearNomina();
  
  // Obtener datos reales del dashboard
  const { dashboardData, isLoading, isError } = useDashboardNomina();
  
  // Cargar también datos de nóminas para el tab de gestión
  const { nominas, isLoading: isLoadingNominas } = useListarNominas();
  
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
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Cargando datos del dashboard...</span>
            </div>
          ) : isError ? (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                No se pudieron cargar los datos del dashboard. Por favor, intente nuevamente.
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Total Empleados */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Empleados</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{isLoading ? '...' : dashboardData?.totalEmpleadosActivos || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      {isLoading ? '...' : dashboardData?.nuevosEmpleadosMes || 0} nuevos este mes
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
                    <div className="text-2xl font-bold">€{isLoading ? '...' : (dashboardData?.nominaMensualTotal || 0).toLocaleString('es')}</div>
                    <p className="text-xs text-muted-foreground">
                      {isLoading ? '...' : 
                        (dashboardData?.cambioNomina ? 
                          `${dashboardData.cambioNomina.esIncremento ? '+' : '-'}${dashboardData.cambioNomina.porcentaje}%` : 
                          '0%')} 
                      respecto al mes anterior
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
                    <div className="text-2xl font-bold">{isLoading ? '...' : (dashboardData?.proximoPago?.fecha || 'No programado')}</div>
                    <p className="text-xs text-muted-foreground">
                      Faltan {isLoading ? '...' : (dashboardData?.proximoPago?.diasRestantes || 0)} días
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
                    <div className="text-2xl font-bold">{isLoading ? '...' : (dashboardData?.nominasPendientes || 0)}</div>
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
                      {dashboardData?.nominasRecientes && dashboardData.nominasRecientes.length > 0 ? (
                        dashboardData.nominasRecientes.map((nomina) => (
                          <div key={nomina.id} className="flex items-center justify-between p-4 border rounded-md">
                            <div className="flex items-center space-x-4">
                              <div className="bg-muted rounded-full p-2">
                                <FileText className="h-4 w-4" />
                              </div>
                              <div>
                                <p className="font-medium">{nomina.titulo}</p>
                                <p className="text-sm text-muted-foreground">
                                  Procesada el {nomina.fechaProcesamiento}
                                </p>
                              </div>
                            </div>
                            <Badge variant={nomina.estado === 'PENDIENTE' ? 'default' : 'secondary'}>
                              {nomina.estado === 'PENDIENTE' ? 'Pendiente' : 
                               nomina.estado === 'PAGADO' ? 'Pagada' : nomina.estado}
                            </Badge>
                          </div>
                        ))
                      ) : (
                        <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                          <FileText className="h-10 w-10 mb-2" />
                          <p>No hay nóminas procesadas recientemente</p>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="mt-4"
                            onClick={() => setShowNuevaForma(true)}
                          >
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Crear tu primera nómina
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  {dashboardData?.nominasRecientes && dashboardData.nominasRecientes.length > 0 && (
                    <CardFooter>
                      <Button variant="outline" onClick={() => setActiveTab('nominas')} className="w-full">
                        Ver todas las nóminas
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </CardFooter>
                  )}
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
                      onClick={() => setShowNuevaForma(true)}
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
            </>
          )}
        </TabsContent>
        
        <TabsContent value="empleados">
          <EmpleadosPage />
        </TabsContent>
        
        <TabsContent value="nominas">
          <GestionNominasPage />
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