import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PanelKpis } from "@/modules/kpis/ui/views/PanelKpis";
import { HistorialKpis } from "@/modules/kpis/ui/views/HistorialKpis";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { Link } from "wouter";

export default function KpisDashboard() {
  const [activeTab, setActiveTab] = useState("panel");

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-primary">Panel de KPIs</h1>
          <p className="text-muted-foreground">
            Gestiona tus indicadores clave de desempeño y bonificaciones
          </p>
        </div>
        <Link href="/kpis/panel/nuevo">
          <Button className="bg-primary hover:bg-primary/90">
            <PlusIcon className="mr-2 h-4 w-4" /> Nuevo KPI
          </Button>
        </Link>
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