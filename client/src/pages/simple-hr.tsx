import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserPlus, GraduationCap, ClipboardCheck, DollarSign, BarChart3 } from "lucide-react";
import { Link } from "wouter";

export default function SimpleHumanResources() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900">Recursos Humanos</h1>
          <p className="text-gray-500">Gestiona los empleados, evaluaciones, capacitaciones y nóminas de tu empresa</p>
        </div>
        <Button className="md:self-start" size="sm" asChild>
          <Link href="/recursos-humanos">
            <Users className="mr-2 h-4 w-4" /> Gestión Completa
          </Link>
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Talento Humano - Nuevo Módulo</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Accede al nuevo módulo de Talento Humano con todas las funcionalidades 
              integradas en un sólo lugar:
            </p>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span>Gestión completa de empleados</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span>Dashboard de métricas y KPIs</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span>Evaluaciones de desempeño</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span>Gestión de capacitaciones</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span>Gestión de nómina integrada</span>
              </div>
            </div>
            
            <div className="mt-6 flex flex-col space-y-2">
              <Button asChild variant="default">
                <Link href="/recursos-humanos">
                  <Users className="mr-2 h-4 w-4" />
                  Acceder al Dashboard Principal
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Acceso Directo a Módulos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              También puedes acceder directamente a cada uno de los módulos específicos de Talento Humano:
            </p>
            
            <div className="grid grid-cols-2 gap-3 mt-6">
              <Button asChild variant="outline" className="justify-start">
                <Link href="/recursos-humanos/empleados">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Empleados
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="justify-start">
                <Link href="/recursos-humanos/evaluaciones">
                  <ClipboardCheck className="mr-2 h-4 w-4" />
                  Evaluaciones
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="justify-start">
                <Link href="/recursos-humanos/capacitaciones">
                  <GraduationCap className="mr-2 h-4 w-4" />
                  Capacitaciones
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="justify-start">
                <Link href="/recursos-humanos/nomina">
                  <DollarSign className="mr-2 h-4 w-4" />
                  Nómina
                </Link>
              </Button>
            </div>
            
            <div className="mt-4">
              <Button asChild variant="secondary" className="w-full">
                <Link href="/recursos-humanos?tab=metricas">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Ver Métricas y KPIs
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="relative">
        <iframe 
          src="/api/static/employee-dashboard-preview.html" 
          className="w-full h-64 border rounded-md shadow-md"
          title="Employee Dashboard Preview"
        ></iframe>
        <div className="absolute inset-0 flex items-center justify-center">
          <Button asChild size="lg" className="bg-primary/90 hover:bg-primary">
            <Link href="/recursos-humanos">
              <Users className="mr-2 h-5 w-5" />
              Explorar Nueva Versión
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}