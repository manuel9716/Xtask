import { Link } from 'wouter';
import { 
  Users, 
  ClipboardList, 
  GraduationCap,
  BarChart3,
  Plus,
  Search,
  ClipboardCheck,
  BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RRHHDashboard } from '../components/RRHHDashboard';

export default function RRHHDashboardPage() {
  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Recursos Humanos</h1>
        </div>
      </div>

      {/* Módulos de acceso rápido */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-600/20 to-violet-600/5 z-0" />
          <CardHeader className="relative z-10">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Gestión de Empleados
            </CardTitle>
            <CardDescription>
              Administra la información de todos los empleados de la empresa
            </CardDescription>
          </CardHeader>
          <CardContent className="relative z-10">
            <p className="text-sm text-muted-foreground mb-4">
              Crea, edita y gestiona los perfiles de empleados, sus datos personales y profesionales.
            </p>
          </CardContent>
          <CardFooter className="flex gap-2 relative z-10">
            <Button asChild variant="default" size="sm">
              <Link href="/admin/recursos-humanos/empleados">
                <Users className="h-4 w-4 mr-2" />
                Ver Empleados
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/recursos-humanos/empleados/nuevo">
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Empleado
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/20 to-cyan-600/5 z-0" />
          <CardHeader className="relative z-10">
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              Evaluaciones de Desempeño
            </CardTitle>
            <CardDescription>
              Gestiona el proceso de evaluación del personal
            </CardDescription>
          </CardHeader>
          <CardContent className="relative z-10">
            <p className="text-sm text-muted-foreground mb-4">
              Crea y asigna evaluaciones, revisa resultados y haz seguimiento del rendimiento.
            </p>
          </CardContent>
          <CardFooter className="flex gap-2 relative z-10">
            <Button asChild variant="default" size="sm">
              <Link href="/admin/recursos-humanos/evaluaciones">
                <ClipboardCheck className="h-4 w-4 mr-2" />
                Ver Evaluaciones
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/recursos-humanos/evaluaciones/nueva">
                <Plus className="h-4 w-4 mr-2" />
                Nueva Evaluación
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-600/20 to-amber-600/5 z-0" />
          <CardHeader className="relative z-10">
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Capacitaciones
            </CardTitle>
            <CardDescription>
              Coordina y gestiona programas de capacitación
            </CardDescription>
          </CardHeader>
          <CardContent className="relative z-10">
            <p className="text-sm text-muted-foreground mb-4">
              Organiza sesiones de formación, controla asistencia y distribuye materiales.
            </p>
          </CardContent>
          <CardFooter className="flex gap-2 relative z-10">
            <Button asChild variant="default" size="sm">
              <Link href="/admin/recursos-humanos/capacitaciones">
                <BookOpen className="h-4 w-4 mr-2" />
                Ver Capacitaciones
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/recursos-humanos/capacitaciones/nueva">
                <Plus className="h-4 w-4 mr-2" />
                Nueva Capacitación
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Dashboard con estadísticas */}
      <Card>
        <CardHeader>
          <CardTitle>Dashboard de Recursos Humanos</CardTitle>
          <CardDescription>
            Principales indicadores y métricas del departamento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RRHHDashboard />
        </CardContent>
      </Card>

      {/* Sección de actividad reciente (placeholder) */}
      <Card>
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
          <CardDescription>
            Últimas acciones y actividades en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-4">
              <div className="bg-primary/10 rounded-full p-2">
                <Users className="h-4 w-4 text-primary" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Nuevo empleado registrado</p>
                <p className="text-xs text-muted-foreground">
                  Se ha creado el registro de un nuevo empleado en el departamento de Tecnología.
                </p>
                <p className="text-xs font-medium text-muted-foreground">Hace 2 horas</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="bg-primary/10 rounded-full p-2">
                <ClipboardCheck className="h-4 w-4 text-primary" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Evaluación completada</p>
                <p className="text-xs text-muted-foreground">
                  Se ha finalizado una evaluación de desempeño en el departamento de Marketing.
                </p>
                <p className="text-xs font-medium text-muted-foreground">Hace 4 horas</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="bg-primary/10 rounded-full p-2">
                <GraduationCap className="h-4 w-4 text-primary" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Nueva capacitación programada</p>
                <p className="text-xs text-muted-foreground">
                  Se ha creado una nueva capacitación: "Desarrollo de habilidades de liderazgo".
                </p>
                <p className="text-xs font-medium text-muted-foreground">Hace 1 día</p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full">Ver todo el historial de actividad</Button>
        </CardFooter>
      </Card>
    </div>
  );
}