import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PanelKpis } from "@/modules/kpis/ui/views/PanelKpis";
import { HistorialKpis } from "@/modules/kpis/ui/views/HistorialKpis";

export default function KpisDashboard() {
  const [activeTab, setActiveTab] = useState("panel");

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-primary">Panel de KPIs</h1>
        <p className="text-muted-foreground">
          Gestiona tus indicadores clave de desempeño y bonificaciones
        </p>
      </div>

      <Tabs defaultValue="panel" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="panel">Panel de KPIs</TabsTrigger>
          <TabsTrigger value="historial">Historial de Bonificaciones</TabsTrigger>
        </TabsList>
        <TabsContent value="panel" className="mt-6">
          <PanelKpis />
        </TabsContent>
        <TabsContent value="historial" className="mt-6">
          <HistorialKpis />
        </TabsContent>
      </Tabs>
    </div>
  );
}