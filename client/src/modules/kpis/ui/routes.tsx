import { Route } from 'wouter';
import { MainLayout } from '@/layouts/main-layout';
import { PanelKpis } from './views/PanelKpis';
import { HistorialKpis } from './views/HistorialKpis';

export function KpisRoutes() {
  return (
    <>
      <Route path="/kpis/panel">
        <MainLayout>
          <PanelKpis />
        </MainLayout>
      </Route>
      
      <Route path="/kpis/historial">
        <MainLayout>
          <HistorialKpis />
        </MainLayout>
      </Route>
    </>
  );
}