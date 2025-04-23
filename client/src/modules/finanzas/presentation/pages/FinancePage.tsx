import React from 'react';
import { Tabs, TabsList, TabsContent, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BudgetTab } from '../components/budgets/BudgetTab';
import { PayrollTab } from '../components/payroll/PayrollTab';
import { InvoiceTab } from '../components/invoices/InvoiceTab';
import { ReportsTab } from '../components/reports/ReportsTab';
import { useTranslation } from 'react-i18next';

/**
 * Página principal del módulo de finanzas
 * Implementa un sistema de pestañas para navegar entre las diferentes funcionalidades
 */
export const FinancePage: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <div className="container p-6 mx-auto">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-primary mb-2">{t('finances.title')}</h1>
        <p className="text-muted-foreground mb-6">
          {t('finances.subtitle')}
        </p>
      </header>

      <Tabs defaultValue="budgets" className="w-full">
        <TabsList className="grid grid-cols-4 mb-8">
          <TabsTrigger value="budgets">{t('finances.budgets')}</TabsTrigger>
          <TabsTrigger value="payroll">{t('finances.payroll')}</TabsTrigger>
          <TabsTrigger value="invoices">{t('finances.invoices')}</TabsTrigger>
          <TabsTrigger value="reports">{t('finances.reports')}</TabsTrigger>
        </TabsList>

        <TabsContent value="budgets">
          <Card>
            <CardHeader>
              <CardTitle>{t('finances.budgetManagement.title')}</CardTitle>
              <CardDescription>
                {t('finances.budgetManagement.subtitle')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BudgetTab />
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">{t('finances.exportData')}</Button>
              <Button>{t('finances.newBudget')}</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="payroll">
          <Card>
            <CardHeader>
              <CardTitle>{t('finances.payrollManagement.title')}</CardTitle>
              <CardDescription>
                {t('finances.payrollManagement.subtitle')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PayrollTab />
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">{t('finances.generateReports')}</Button>
              <Button>{t('finances.processPayroll')}</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="invoices">
          <Card>
            <CardHeader>
              <CardTitle>{t('finances.invoiceManagement.title')}</CardTitle>
              <CardDescription>
                {t('finances.invoiceManagement.subtitle')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InvoiceTab />
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">{t('finances.pendingInvoices')}</Button>
              <Button>{t('finances.newInvoice')}</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>{t('finances.reportsManagement.title')}</CardTitle>
              <CardDescription>
                {t('finances.reportsManagement.subtitle')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ReportsTab />
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">{t('finances.exportToExcel')}</Button>
              <Button>{t('finances.generateReport')}</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-8 p-4 bg-muted rounded-lg">
        <h2 className="text-xl font-semibold mb-2">{t('architecture.title')}</h2>
        <p className="text-sm text-muted-foreground">
          {t('architecture.description')}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
          <div className="p-3 bg-secondary/20 rounded-lg">
            <h3 className="font-medium">{t('architecture.domainLayer')}</h3>
            <p className="text-xs text-muted-foreground">{t('architecture.domainDescription')}</p>
          </div>
          <div className="p-3 bg-secondary/20 rounded-lg">
            <h3 className="font-medium">{t('architecture.applicationLayer')}</h3>
            <p className="text-xs text-muted-foreground">{t('architecture.applicationDescription')}</p>
          </div>
          <div className="p-3 bg-secondary/20 rounded-lg">
            <h3 className="font-medium">{t('architecture.infrastructureLayer')}</h3>
            <p className="text-xs text-muted-foreground">{t('architecture.infrastructureDescription')}</p>
          </div>
          <div className="p-3 bg-secondary/20 rounded-lg">
            <h3 className="font-medium">{t('architecture.presentationLayer')}</h3>
            <p className="text-xs text-muted-foreground">{t('architecture.presentationDescription')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};