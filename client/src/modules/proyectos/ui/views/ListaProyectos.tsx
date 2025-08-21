import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ModalCrearProyecto } from "../components/ModalCrearProyecto";
import { ProjectsTable } from "@/components/projects-table";

export function ListaProyectos() {
  const [modalAbierto, setModalAbierto] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900">Proyectos</h1>
          <p className="text-gray-500">Administra y supervisa todos los proyectos de tu empresa</p>
        </div>
        <Button className="md:self-start" size="sm" onClick={() => setModalAbierto(true)}>
          <Plus className="mr-2 h-4 w-4" /> Nuevo Proyecto
        </Button>
      </div>
      
      {/* Modal para crear proyecto */}
      <ModalCrearProyecto 
        abierto={modalAbierto} 
        onOpenChange={setModalAbierto} 
      />
      
      {/* Tabla de proyectos con paginación */}
      <ProjectsTable showPagination={true} />
    </div>
  );
}