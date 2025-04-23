import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';

export const ReportsTab: React.FC = () => {
  // Datos de ejemplo para los gráficos
  const monthlyFinanceData = [
    { name: 'Ene', ingresos: 40000, gastos: 35000, balance: 5000 },
    { name: 'Feb', ingresos: 45000, gastos: 38000, balance: 7000 },
    { name: 'Mar', ingresos: 42000, gastos: 40000, balance: 2000 },
    { name: 'Abr', ingresos: 50000, gastos: 42000, balance: 8000 },
    { name: 'May', ingresos: 54000, gastos: 45000, balance: 9000 },
    { name: 'Jun', ingresos: 56000, gastos: 48000, balance: 8000 },
  ];

  const expensesByCategory = [
    { name: 'Salarios', value: 45000 },
    { name: 'Marketing', value: 15000 },
    { name: 'Operaciones', value: 20000 },
    { name: 'Tecnología', value: 25000 },
    { name: 'Otros', value: 10000 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const cashFlowProjection = [
    { name: 'Jul', value: 12000 },
    { name: 'Ago', value: 14000 },
    { name: 'Sep', value: 16000 },
    { name: 'Oct', value: 18000 },
    { name: 'Nov', value: 20000 },
    { name: 'Dic', value: 22000 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Informes Financieros</h2>
        <div className="flex gap-2">
          <Button variant="outline">Exportar Datos</Button>
          <Button>Generar Informe</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Balance Mensual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+$39,000</div>
            <p className="text-xs text-muted-foreground">
              +20.1% respecto al mes anterior
            </p>
            <div className="h-[200px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={monthlyFinanceData}
                  margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="balance" stroke="#8884d8" activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Ingresos vs Gastos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={monthlyFinanceData}
                  margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="ingresos" fill="#0088FE" />
                  <Bar dataKey="gastos" fill="#FF8042" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Distribución de Gastos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expensesByCategory}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {expensesByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Generar Informe Personalizado</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="report-type">Tipo de Informe</Label>
              <Select>
                <SelectTrigger id="report-type">
                  <SelectValue placeholder="Seleccione tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="financial">Estado Financiero</SelectItem>
                  <SelectItem value="cash-flow">Flujo de Caja</SelectItem>
                  <SelectItem value="budget">Ejecución Presupuestaria</SelectItem>
                  <SelectItem value="taxes">Informe Fiscal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date-from">Fecha Desde</Label>
              <Input id="date-from" type="date" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date-to">Fecha Hasta</Label>
              <Input id="date-to" type="date" />
            </div>

            <div className="md:col-span-3 flex justify-end">
              <Button>Generar Informe</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Proyección de Flujo de Caja</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={cashFlowProjection}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="value" stroke="#82ca9d" activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informes Disponibles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <div>
                  <h3 className="font-medium">Informe Mensual - Marzo 2025</h3>
                  <p className="text-sm text-muted-foreground">Generado: 01/04/2025</p>
                </div>
                <Button variant="outline" size="sm">Descargar</Button>
              </div>

              <div className="flex items-center justify-between border-b pb-2">
                <div>
                  <h3 className="font-medium">Informe Fiscal - Q1 2025</h3>
                  <p className="text-sm text-muted-foreground">Generado: 10/04/2025</p>
                </div>
                <Button variant="outline" size="sm">Descargar</Button>
              </div>

              <div className="flex items-center justify-between border-b pb-2">
                <div>
                  <h3 className="font-medium">Análisis de Gastos - Q1 2025</h3>
                  <p className="text-sm text-muted-foreground">Generado: 05/04/2025</p>
                </div>
                <Button variant="outline" size="sm">Descargar</Button>
              </div>

              <div className="flex items-center justify-between pb-2">
                <div>
                  <h3 className="font-medium">Proyección Anual 2025</h3>
                  <p className="text-sm text-muted-foreground">Generado: 15/01/2025</p>
                </div>
                <Button variant="outline" size="sm">Descargar</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};