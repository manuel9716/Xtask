import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Briefcase,
  CheckSquare,
  DollarSign,
  Users,
  Receipt,
  PieChart,
  BarChart4,
  ListChecks
} from "lucide-react";
import { useDashboardReports } from "../../application/useDashboardReports";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

// Mapeo de strings a componentes de iconos
const iconComponents: Record<string, any> = {
  Briefcase,
  CheckSquare,
  DollarSign,
  Users,
  Receipt,
  PieChart,
  BarChart4,
  ListChecks,
};

export function ProcessReport() {
  const { data, isLoading } = useDashboardReports();

  if (isLoading) {
    return (
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="p-4 rounded-lg border">
                <Skeleton className="h-8 w-8 rounded-full mb-3" />
                <Skeleton className="h-5 w-20 mb-2" />
                <Skeleton className="h-4 w-12" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-bold tracking-tight">Resumen de Procesos</CardTitle>
        <CardDescription>
          Vista general de todos los procesos en el sistema
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="grid" className="mb-4">
          <TabsList className="mb-4">
            <TabsTrigger value="grid">
              <BarChart4 className="h-4 w-4 mr-2" /> Vista por Módulos
            </TabsTrigger>
            <TabsTrigger value="list">
              <ListChecks className="h-4 w-4 mr-2" /> Lista Completa
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="grid">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.processCounts.map((process) => {
                const Icon = iconComponents[process.icon] || Briefcase;
                return (
                  <div 
                    key={process.module} 
                    className="flex flex-col p-5 rounded-lg border border-gray-100 hover:border-gray-200 hover:shadow-sm"
                  >
                    <div className={`p-2 rounded-md w-fit ${process.color.split(' ')[0]}`}>
                      <Icon className={`h-5 w-5 ${process.color.split(' ')[1]}`} />
                    </div>
                    <h3 className="mt-3 text-lg font-medium">{process.moduleName}</h3>
                    <div className="flex items-end justify-between mt-1">
                      <span className="text-2xl font-bold">{process.count}</span>
                      <Link href={process.route}>
                        <Button variant="link" className="text-xs px-0">
                          Ver detalles →
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>
          
          <TabsContent value="list">
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="py-3 px-4 text-left font-medium text-gray-500 text-sm">Módulo</th>
                    <th className="py-3 px-4 text-left font-medium text-gray-500 text-sm">Cantidad</th>
                    <th className="py-3 px-4 text-right font-medium text-gray-500 text-sm">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {data.processCounts.map((process) => {
                    const Icon = iconComponents[process.icon] || Briefcase;
                    return (
                      <tr key={process.module} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <div className={`p-1.5 rounded mr-3 ${process.color.split(' ')[0]}`}>
                              <Icon className={`h-4 w-4 ${process.color.split(' ')[1]}`} />
                            </div>
                            <span className="font-medium">{process.moduleName}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-medium">{process.count}</span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Link href={process.route}>
                            <Button variant="ghost" size="sm">
                              Ver
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}