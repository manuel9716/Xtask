import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserPlus } from "lucide-react";
import { Link } from "wouter";

export default function SimpleHumanResources() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900">Human Resources</h1>
          <p className="text-gray-500">Manage your company's employees and HR functions</p>
        </div>
        <Button className="md:self-start" size="sm">
          <UserPlus className="mr-2 h-4 w-4" /> Add Employee
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Módulo de Recursos Humanos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Estamos implementando mejoras al módulo de recursos humanos para ofrecerte una experiencia más 
              completa y adaptada a tus necesidades.
            </p>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span>Gestión básica de empleados</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                <span>Dashboard de métricas (en desarrollo)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                <span>Evaluaciones de desempeño (próximamente)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                <span>Gestión de capacitaciones (próximamente)</span>
              </div>
            </div>
            
            <div className="mt-6 flex flex-col space-y-2">
              <Button asChild variant="default">
                <Link href="/admin/recursos-humanos">
                  <Users className="mr-2 h-4 w-4" />
                  Acceder al Nuevo Módulo
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Versión Clásica</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              También puedes acceder a la versión clásica del módulo de recursos humanos mientras 
              completamos el desarrollo de la nueva versión.
            </p>
            
            <div className="mt-6">
              <iframe 
                src="/api/static/employee-dashboard-preview.html" 
                className="w-full h-40 border rounded-md shadow-sm"
                title="Employee Dashboard Preview"
              ></iframe>
            </div>
            
            <div className="mt-4">
              <Button variant="outline" className="w-full" disabled>
                Acceder a Versión Clásica
              </Button>
              <p className="text-xs text-gray-500 mt-1 text-center">
                Temporalmente no disponible
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}