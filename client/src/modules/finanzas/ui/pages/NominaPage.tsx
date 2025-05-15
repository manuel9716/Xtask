import React from 'react';
import { useLocation } from 'wouter';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  UserPlus, 
  CalendarDays, 
  DollarSign,
  Clock
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import ListadoNominaPage from '@/modules/nomina/ui/pages/ListadoNominaPage';
import EmpleadosDebug from '../components/EmpleadosDebug';
import EmpleadosDirecto from '../components/EmpleadosDirecto';

export function NominaPage() {
  const [, navigate] = useLocation();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Gestión de Nómina</h2>
          <p className="text-muted-foreground">
            Administre la nómina de los empleados, procese pagos y genere reportes
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate('/nomina/empleados')}>
            <UserPlus className="mr-2 h-4 w-4" />
            Nuevo Empleado
          </Button>
        </div>
      </div>
      
      <Separator />
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Empleados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <UserPlus className="h-5 w-5 text-primary mr-2" />
              <span className="text-2xl font-bold">45</span>
            </div>
          </CardContent>
          <CardFooter className="pt-0">
            <p className="text-xs text-gray-500">
              3 nuevos este mes
            </p>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Nómina Mensual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <DollarSign className="h-5 w-5 text-primary mr-2" />
              <span className="text-2xl font-bold">€102,450</span>
            </div>
          </CardContent>
          <CardFooter className="pt-0">
            <p className="text-xs text-gray-500">
              +5.3% respecto al mes anterior
            </p>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Próximo Pago</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <CalendarDays className="h-5 w-5 text-primary mr-2" />
              <span className="text-2xl font-bold">25 Mayo</span>
            </div>
          </CardContent>
          <CardFooter className="pt-0">
            <p className="text-xs text-gray-500">
              Faltan 12 días
            </p>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Nóminas Pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-primary mr-2" />
              <span className="text-2xl font-bold">3</span>
            </div>
          </CardContent>
          <CardFooter className="pt-0">
            <p className="text-xs text-gray-500">
              Requieren revisión
            </p>
          </CardFooter>
        </Card>
      </div>
      
      <Tabs defaultValue="nominas" className="w-full">
        <TabsList className="grid w-full md:w-auto grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="nominas">Gestión de Nóminas</TabsTrigger>
          <TabsTrigger value="empleados">Empleados</TabsTrigger>
          <TabsTrigger value="configuracion">Configuración</TabsTrigger>
          <TabsTrigger value="reportes">Reportes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="nominas" className="space-y-4 mt-6">
          <ListadoNominaPage />
        </TabsContent>
        
        <TabsContent value="empleados" className="space-y-4 mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle>Gestión de Empleados</CardTitle>
                <CardDescription>
                  Administre los datos de los empleados para la nómina
                </CardDescription>
              </div>
              <Button onClick={() => window.location.href = '/nomina/empleados'}>
                <UserPlus className="mr-2 h-4 w-4" />
                Nuevo Empleado
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <EmpleadosDebug />
                <EmpleadosDirecto />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="configuracion" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Nómina</CardTitle>
              <CardDescription>
                Configure los parámetros generales de la nómina
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center py-8">
              <div className="text-center">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">Sección en desarrollo</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Esta funcionalidad estará disponible próximamente.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="reportes" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Reportes de Nómina</CardTitle>
              <CardDescription>
                Genere reportes y estadísticas de nómina
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center py-8">
              <div className="text-center">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">Sección en desarrollo</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Esta funcionalidad estará disponible próximamente.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}