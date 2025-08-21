import { Building2, Smartphone, Database, PresentationIcon, MoreHorizontal, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { Project, EstadoProyecto } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ProyectoEstadoBadge } from "@/modules/proyectos/ui/components/ProyectoEstadoBadge";
import { MenuAccionesProyecto } from "@/modules/proyectos/ui/components/MenuAccionesProyecto";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

const iconMap: Record<string, any> = {
  "Tech": Building2,
  "Mobile": Smartphone,
  "Infrastructure": Database,
  "HR": PresentationIcon,
};

const statusColorMap: Record<string, any> = {
  "On Track": "bg-green-100 text-green-800",
  "At Risk": "bg-amber-100 text-amber-800",
  "Delayed": "bg-red-100 text-red-800",
  "Completed": "bg-blue-100 text-blue-800",
  "On Hold": "bg-gray-100 text-gray-800",
};

interface ProjectsTableProps {
  limit?: number;
  className?: string;
  showPagination?: boolean;
}

export function ProjectsTable({ limit, className, showPagination = false }: ProjectsTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const projectsPerPage = 10;
  const queryClient = useQueryClient();
  
  const { data: projects, isLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const projectCount = projects?.length || 0;
  const totalPages = Math.ceil(projectCount / projectsPerPage);
  
  // Calcular proyectos para mostrar
  let displayProjects: Project[] = [];
  if (projects) {
    if (showPagination) {
      const startIndex = (currentPage - 1) * projectsPerPage;
      const endIndex = startIndex + projectsPerPage;
      displayProjects = projects.slice(startIndex, endIndex);
    } else if (limit) {
      displayProjects = projects.slice(0, limit);
    } else {
      displayProjects = projects;
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden ${className}`}>
      <div className="flex justify-between items-center p-5 border-b border-gray-100">
        <h2 className="font-heading font-semibold text-lg text-gray-900">Proyectos Activos</h2>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="font-medium">Nombre del Proyecto</TableHead>
              <TableHead className="font-medium">Presupuesto</TableHead>
              <TableHead className="font-medium">Cronograma</TableHead>
              <TableHead className="font-medium">Estado</TableHead>
              <TableHead className="font-medium">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Skeleton className="h-8 w-8 rounded" />
                      <div>
                        <Skeleton className="h-4 w-32 mb-1" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20 mb-2" />
                    <Skeleton className="h-2 w-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24 mb-1" />
                    <Skeleton className="h-3 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-8 rounded-full ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : displayProjects?.length ? (
              displayProjects.map((project) => {
                const IconComponent = iconMap[project.category || "Tech"] || Building2;
                const bgColor = project.category === "Tech" ? "bg-primary-100" : 
                                project.category === "Mobile" ? "bg-orange-100" : 
                                project.category === "Infrastructure" ? "bg-indigo-100" : 
                                "bg-emerald-100";
                
                const textColor = project.category === "Tech" ? "text-primary-700" : 
                                 project.category === "Mobile" ? "text-orange-700" : 
                                 project.category === "Infrastructure" ? "text-indigo-700" : 
                                 "text-emerald-700";
                
                // Calculate remaining days
                const today = new Date();
                const endDate = project.endDate ? new Date(project.endDate) : null;
                const daysLeft = endDate ? Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : null;
                
                // Format dates
                const startDateFormatted = new Date(project.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                const endDateFormatted = endDate ? endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Ongoing';
                
                // Calculate budget percentage used
                const budgetValue = parseFloat(project.budget.toString());
                const remainingBudgetValue = parseFloat(project.remainingBudget.toString());
                const percentUsed = budgetValue > 0 ? Math.round(((budgetValue - remainingBudgetValue) / budgetValue) * 100) : 0;
                
                return (
                  <TableRow key={project.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className={`flex-shrink-0 w-8 h-8 rounded ${bgColor} flex items-center justify-center ${textColor}`}>
                          <IconComponent className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{project.name}</p>
                          <p className="text-xs text-gray-500">{project.category || 'Sin categoría'}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-800">${parseFloat(project.budget.toString()).toLocaleString()}</p>
                        <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1.5">
                          <div 
                            className="bg-primary-500 h-1.5 rounded-full" 
                            style={{ width: `${percentUsed}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{percentUsed}% utilizado</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-gray-800">{startDateFormatted} - {endDateFormatted}</p>
                      <p className="text-xs text-gray-500">{daysLeft ? `${daysLeft} días restantes` : 'Sin fecha límite'}</p>
                    </TableCell>
                    <TableCell>
                      {/* Mapear los estados en inglés a los estados en español del enum */}
                      {(() => {
                        let estadoProyecto: EstadoProyecto;
                        
                        switch (project.status) {
                          case 'active':
                            estadoProyecto = EstadoProyecto.ACTIVO;
                            break;
                          case 'paused':
                            estadoProyecto = EstadoProyecto.PAUSADO;
                            break;
                          case 'delayed':
                            estadoProyecto = EstadoProyecto.RETRASADO;
                            break;
                          case 'completed':
                            estadoProyecto = EstadoProyecto.FINALIZADO;
                            break;
                          case 'cancelled':
                          case 'canceled':
                            estadoProyecto = EstadoProyecto.CANCELADO;
                            break;
                          case 'archived':
                            estadoProyecto = EstadoProyecto.ARCHIVADO;
                            break;
                          default:
                            estadoProyecto = EstadoProyecto.ACTIVO;
                        }
                        
                        return <ProyectoEstadoBadge estado={estadoProyecto} />;
                      })()}
                    </TableCell>
                    <TableCell className="text-right">
                      <MenuAccionesProyecto 
                        proyectoId={project.id}
                        estadoActual={(() => {
                          switch (project.status) {
                            case 'active':
                              return EstadoProyecto.ACTIVO;
                            case 'paused':
                              return EstadoProyecto.PAUSADO;
                            case 'delayed':
                              return EstadoProyecto.RETRASADO;
                            case 'completed':
                              return EstadoProyecto.FINALIZADO;
                            case 'cancelled':
                            case 'canceled':
                              return EstadoProyecto.CANCELADO;
                            case 'archived':
                              return EstadoProyecto.ARCHIVADO;
                            default:
                              return EstadoProyecto.ACTIVO;
                          }
                        })()} 
                        onEstadoCambiado={() => {
                          // Invalidar la caché para refrescar la tabla inmediatamente
                          queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
                          queryClient.refetchQueries({ queryKey: ["/api/projects"] });
                        }}
                      />
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-gray-500">
                  No se encontraron proyectos. Crea tu primer proyecto.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {showPagination && totalPages > 1 && projects && (
        <div className="px-6 py-3 border-t border-gray-100 bg-white">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Mostrando {((currentPage - 1) * projectsPerPage) + 1} - {Math.min(currentPage * projectsPerPage, projectCount)} de {projectCount} proyectos
            </p>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(page)}
                    className="w-8 h-8 p-0"
                  >
                    {page}
                  </Button>
                ))}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1"
              >
                Siguiente
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {limit && !showPagination && projects && projects.length > limit && (
        <div className="px-6 py-3 border-t border-gray-100 bg-white">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">Mostrando {limit} de {projectCount} proyectos</p>
            <Button variant="link" className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1">
              Ver Todos <span className="ml-1">→</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
