import { useDashboardReports } from "../../application/useDashboardReports";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// Colores para el gráfico de torta
const COLORS = ['#251948', '#02BDEA', '#623BA6', '#FFA41B', '#10B981'];

export function ProcessChart() {
  const { data, isLoading } = useDashboardReports();

  if (isLoading) {
    return (
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <Skeleton className="h-6 w-1/2 mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full rounded" />
        </CardContent>
      </Card>
    );
  }

  // Preparar datos para el gráfico
  const chartData = data.processCounts.map(process => ({
    name: process.moduleName,
    count: process.count,
  }));

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-bold tracking-tight">Distribución de Procesos</CardTitle>
        <CardDescription>
          Visualización de los procesos en el sistema
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Gráfico de barras */}
          <div className="h-80">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total por módulo</h3>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip 
                  formatter={(value) => [`${value} registros`, 'Total']}
                  labelStyle={{ color: '#111827' }}
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.375rem'
                  }}
                />
                <Bar 
                  dataKey="count" 
                  fill="#251948" 
                  radius={[4, 4, 0, 0]}
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfico de torta */}
          <div className="h-80">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Proporción de procesos</h3>
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  innerRadius={40}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="name"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`${value} registros`, 'Total']}
                  labelStyle={{ color: '#111827' }}
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.375rem'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}