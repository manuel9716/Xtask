import { useState } from "react";
import { useProyectos } from "../../application/useCases/listarProyectos";
import { FiltrosProyecto as IFiltrosProyecto } from "../../domain/entities/Proyecto";
import { ProyectoCard } from "../components/ProyectoCard";
import { FiltrosProyecto } from "../components/FiltrosProyecto";
import { Button } from "@/components/ui/button";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Loader2, Plus } from "lucide-react";
import { ModalCrearProyecto } from "../components/ModalCrearProyecto";

export function ListaProyectos() {
  // Estado para la paginación y filtros
  const [pagina, setPagina] = useState(1);
  const [porPagina] = useState(9); // Fijo a 9 proyectos por página
  const [filtros, setFiltros] = useState<IFiltrosProyecto>({});
  const [modalAbierto, setModalAbierto] = useState(false);
  
  // Consultar proyectos con filtros y paginación
  const { 
    data: proyectos = [], 
    isLoading, 
    isError, 
    error 
  } = useProyectos({
    ...filtros,
    page: pagina,
    pageSize: porPagina,
  });
  
  // Calcular valores para paginación
  const total = proyectos.length;
  const totalPaginas = Math.ceil(total / porPagina);
  
  // Manejar cambio de filtros
  const handleFiltrosChange = (nuevosFiltros: IFiltrosProyecto) => {
    setFiltros(nuevosFiltros);
    setPagina(1); // Volver a la primera página cuando se aplican filtros
  };
  
  // Manejar cambio de página
  const handlePageChange = (nuevaPagina: number) => {
    setPagina(nuevaPagina);
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll al inicio
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Proyectos</h1>
        <Button className="gap-2" onClick={() => setModalAbierto(true)}>
          <Plus className="h-4 w-4" />
          Nuevo Proyecto
        </Button>
      </div>
      
      {/* Modal para crear proyecto */}
      <ModalCrearProyecto 
        abierto={modalAbierto} 
        onOpenChange={setModalAbierto} 
      />
      
      {/* Componente de filtros */}
      <FiltrosProyecto 
        onFilterChange={handleFiltrosChange}
        filtrosActivos={filtros}
      />
      
      {/* Estado de carga */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
      
      {/* Estado de error */}
      {isError && (
        <div className="py-8 text-center">
          <p className="text-lg text-destructive">Error al cargar los proyectos</p>
          <p className="text-sm text-muted-foreground mt-2">{error?.toString()}</p>
        </div>
      )}
      
      {/* Sin resultados */}
      {!isLoading && !isError && proyectos.length === 0 && (
        <div className="py-8 text-center">
          <p className="text-lg">No se encontraron proyectos</p>
          <p className="text-sm text-muted-foreground mt-2">
            {Object.keys(filtros).length > 0 
              ? "Prueba con diferentes filtros" 
              : "Crea tu primer proyecto haciendo clic en 'Nuevo Proyecto'"}
          </p>
        </div>
      )}
      
      {/* Grid de proyectos */}
      {!isLoading && !isError && proyectos.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {proyectos.map((proyecto) => (
              <ProyectoCard key={proyecto.id} proyecto={proyecto} />
            ))}
          </div>
          
          {/* Paginación */}
          {totalPaginas > 1 && (
            <Pagination className="mt-8">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      if (pagina > 1) handlePageChange(pagina - 1);
                    }} 
                    className={pagina <= 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                
                {/* Generar items de paginación */}
                {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((num) => (
                  <PaginationItem key={num}>
                    <PaginationLink 
                      href="#" 
                      onClick={(e) => {
                        e.preventDefault();
                        handlePageChange(num);
                      }}
                      isActive={pagina === num}
                    >
                      {num}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                
                <PaginationItem>
                  <PaginationNext 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      if (pagina < totalPaginas) handlePageChange(pagina + 1);
                    }}
                    className={pagina >= totalPaginas ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
          
          {/* Resumen de resultados */}
          <div className="mt-4 text-sm text-muted-foreground">
            Mostrando {((pagina - 1) * porPagina) + 1} - {Math.min(pagina * porPagina, total)} de {total} proyectos
          </div>
        </>
      )}
    </div>
  );
}