import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Users } from 'lucide-react';
import { useLocation } from 'wouter';

export default function SimpleListaEmpleados() {
  const [, setLocation] = useLocation();
  
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Users className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Empleados</h1>
        </div>
        
        <Button 
          onClick={() => setLocation('/admin/recursos-humanos/empleados/nuevo')}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          <span>Nuevo Empleado</span>
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Lista de Empleados</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            Estamos trabajando en esta funcionalidad. Pronto podrá ver la lista completa de empleados.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            {/* Tarjetas de empleado de muestra */}
            {[1, 2, 3, 4, 5, 6].map((index) => (
              <Card key={index} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Empleado de muestra</CardTitle>
                </CardHeader>
                <CardContent className="pb-3 text-sm text-muted-foreground">
                  <p>Departamento: Marketing</p>
                  <div className="mt-2 inline-block">
                    <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                      Activo
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}