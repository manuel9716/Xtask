import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TempDashboard() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Módulo de Recursos Humanos</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Estado de Implementación</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">Estamos trabajando en la implementación de este módulo. Pronto tendrá acceso a todas las funcionalidades.</p>
          
          <div className="space-y-2">
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
              <span>Estructura base del módulo - Completado</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
              <span>Dominio y entidades - Completado</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
              <span>Repositorios y servicios - Completado</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-amber-500 mr-2"></div>
              <span>Interfaz de usuario - En progreso</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-slate-300 mr-2"></div>
              <span>Integraciones - Pendiente</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}