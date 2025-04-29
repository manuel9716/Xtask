import React from "react";
import { MainLayout } from "@/layouts/main-layout";
import { ListaCapacitaciones } from "@/modules/recursos-humanos/ui/views/ListaCapacitaciones";

export default function CapacitacionesPage() {
  return (
    <MainLayout>
      <ListaCapacitaciones />
    </MainLayout>
  );
}