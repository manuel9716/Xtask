import React from 'react';
import { Tab, Tabs, TabsList, TabsContent, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BudgetTab } from '../components/budgets/BudgetTab';
import { PayrollTab } from '../components/payroll/PayrollTab';
import { InvoiceTab } from '../components/invoices/InvoiceTab';
import { ReportsTab } from '../components/reports/ReportsTab';

/**
 * Página principal del módulo de finanzas
 * Implementa un sistema de pestañas para navegar entre las diferentes funcionalidades
 */
export const FinancePage: React.FC = () => {
  return (
    <div className="container p-6 mx-auto">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-primary mb-2">Gestión Financiera</h1>
        <p className="text-muted-foreground mb-6">
          Administre presupuestos, nóminas, facturas y reportes financieros
        </p>
      </header>

      <Tabs defaultValue="budgets" className="w-full">
        <TabsList className="grid grid-cols-4 mb-8">
          <TabsTrigger value="budgets">Presupuestos</TabsTrigger>
          <TabsTrigger value="payroll">Nómina</TabsTrigger>
          <TabsTrigger value="invoices">Facturación</TabsTrigger>
          <TabsTrigger value="reports">Informes</TabsTrigger>
        </TabsList>

        <TabsContent value="budgets">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Presupuestos</CardTitle>
              <CardDescription>
                Cree, modifique y haga seguimiento a los presupuestos de su organización
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BudgetTab />
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Exportar Datos</Button>
              <Button>Nuevo Presupuesto</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="payroll">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Nómina</CardTitle>
              <CardDescription>
                Administre pagos de nómina, asignaciones y deducciones
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Se implementará el componente PayrollTab más adelante */}
              <div className="text-center p-6">
                <p className="text-muted-foreground">
                  El módulo de nómina está implementándose utilizando Arquitectura Hexagonal
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Generar Reportes</Button>
              <Button>Procesar Nómina</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="invoices">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Facturación</CardTitle>
              <CardDescription>
                Cree, envíe y realice seguimiento a facturas y pagos
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Se implementará el componente InvoiceTab más adelante */}
              <div className="text-center p-6">
                <p className="text-muted-foreground">
                  El módulo de facturación está implementándose utilizando Arquitectura Hexagonal
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Ver Facturas Pendientes</Button>
              <Button>Nueva Factura</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Informes Financieros</CardTitle>
              <CardDescription>
                Genere y analice informes financieros detallados
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Se implementará el componente ReportsTab más adelante */}
              <div className="text-center p-6">
                <p className="text-muted-foreground">
                  El módulo de informes financieros está implementándose utilizando Arquitectura Hexagonal
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Exportar a Excel</Button>
              <Button>Generar Informe</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-8 p-4 bg-muted rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Sobre la Arquitectura Hexagonal</h2>
        <p className="text-sm text-muted-foreground">
          Este módulo financiero está implementado siguiendo los principios de Arquitectura Hexagonal (Ports & Adapters).
          Esta arquitectura separa claramente las reglas de negocio (dominio) de los detalles técnicos de implementación,
          permitiendo mayor flexibilidad, mantenibilidad y testabilidad del código.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
          <div className="p-3 bg-secondary/20 rounded-lg">
            <h3 className="font-medium">Capa de Dominio</h3>
            <p className="text-xs text-muted-foreground">Entidades de negocio, reglas y lógica central</p>
          </div>
          <div className="p-3 bg-secondary/20 rounded-lg">
            <h3 className="font-medium">Capa de Aplicación</h3>
            <p className="text-xs text-muted-foreground">Casos de uso que orquestan el dominio</p>
          </div>
          <div className="p-3 bg-secondary/20 rounded-lg">
            <h3 className="font-medium">Capa de Infraestructura</h3>
            <p className="text-xs text-muted-foreground">Implementaciones técnicas (API, DB, etc.)</p>
          </div>
          <div className="p-3 bg-secondary/20 rounded-lg">
            <h3 className="font-medium">Capa de Presentación</h3>
            <p className="text-xs text-muted-foreground">Interfaz de usuario (componentes React)</p>
          </div>
        </div>
      </div>
    </div>
  );
};