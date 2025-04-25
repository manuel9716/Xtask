import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { SearchIcon, XCircleIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { EstadoProyecto, FiltrosProyecto as FiltrosProyectoType } from '../../domain/entities/Proyecto';
import { useIndicadoresProyectos } from '../../application/useCases/obtenerIndicadores';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface FiltrosProyectoProps {
  onFilterChange: (filtros: FiltrosProyectoType) => void;
  filtrosActivos: FiltrosProyectoType;
}

export function FiltrosProyecto({ onFilterChange, filtrosActivos }: FiltrosProyectoProps) {
  // Obtener indicadores para mostrar contadores
  const { data: indicadores, isLoading: cargandoIndicadores } = useIndicadoresProyectos();
  
  // Estado local para los filtros
  const [busqueda, setBusqueda] = useState(filtrosActivos.busqueda || '');
  const [estado, setEstado] = useState<EstadoProyecto | 'todos'>(
    filtrosActivos.estado as EstadoProyecto || 'todos'
  );
  
  // Aplicar filtros
  const aplicarFiltros = () => {
    const nuevosFiltros: FiltrosProyectoType = {};
    
    if (busqueda) nuevosFiltros.busqueda = busqueda;
    if (estado && estado !== 'todos') nuevosFiltros.estado = estado;
    
    onFilterChange(nuevosFiltros);
  };
  
  // Limpiar filtros
  const limpiarFiltros = () => {
    setBusqueda('');
    setEstado('todos');
    onFilterChange({});
  };
  
  // Contar filtros activos
  const contarFiltrosActivos = () => {
    let count = 0;
    if (filtrosActivos.busqueda) count++;
    if (filtrosActivos.estado) count++;
    return count;
  };
  
  // Manejar cambio de pestaña
  const handleTabChange = (value: string) => {
    let nuevosFiltros: FiltrosProyectoType = { ...filtrosActivos };
    
    // Eliminar filtro de estado anterior si existe
    if ('estado' in nuevosFiltros) {
      delete nuevosFiltros.estado;
    }
    
    // Si no es "todos", agregar el nuevo filtro
    if (value !== 'todos') {
      nuevosFiltros.estado = value as EstadoProyecto;
    }
    
    // Actualizar estado local y aplicar filtros
    setEstado(value as EstadoProyecto | 'todos');
    onFilterChange(nuevosFiltros);
  };
  
  // Obtener valor actual de la pestaña
  const getCurrentTab = () => {
    return filtrosActivos.estado || 'todos';
  };
  
  return (
    <div className="space-y-4">
      {/* Pestañas de filtro rápido por estado */}
      <Tabs defaultValue={getCurrentTab()} onValueChange={handleTabChange} value={getCurrentTab()}>
        <TabsList className="w-full justify-start">
          <TabsTrigger value="todos" className="relative">
            Todos
            {!cargandoIndicadores && indicadores?.totalProyectos !== undefined && (
              <Badge variant="secondary" className="ml-2">{indicadores.totalProyectos}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value={EstadoProyecto.ACTIVO} className="relative">
            Activos
            {!cargandoIndicadores && indicadores?.proyectosActivos !== undefined && (
              <Badge variant="secondary" className="ml-2">{indicadores.proyectosActivos}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value={EstadoProyecto.PAUSADO} className="relative">
            Pausados
            {!cargandoIndicadores && indicadores?.proyectosPausados !== undefined && (
              <Badge variant="secondary" className="ml-2">{indicadores.proyectosPausados}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value={EstadoProyecto.FINALIZADO} className="relative">
            Completados
            {!cargandoIndicadores && indicadores?.proyectosFinalizados !== undefined && (
              <Badge variant="secondary" className="ml-2">{indicadores.proyectosFinalizados}</Badge>
            )}
          </TabsTrigger>
        </TabsList>
      </Tabs>
      
      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            <div className="flex flex-col space-y-2">
              <Label htmlFor="busqueda">Buscar por nombre o descripción</Label>
              <div className="flex space-x-2">
                <div className="relative flex-grow">
                  <SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="busqueda"
                    placeholder="Buscar proyectos..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="pl-8"
                    onKeyDown={(e) => e.key === 'Enter' && aplicarFiltros()}
                  />
                </div>
                <Button onClick={aplicarFiltros}>Buscar</Button>
              </div>
            </div>
            
            <div className="flex flex-col space-y-2">
              <Label htmlFor="estado">Estado</Label>
              <Select
                value={estado}
                onValueChange={(value) => {
                  setEstado(value as EstadoProyecto | 'todos');
                  // Aplicar filtro automáticamente al cambiar estado
                  const nuevosFiltros = { ...filtrosActivos };
                  if (value === 'todos') {
                    delete nuevosFiltros.estado;
                  } else {
                    nuevosFiltros.estado = value as EstadoProyecto;
                  }
                  onFilterChange(nuevosFiltros);
                }}
              >
                <SelectTrigger id="estado">
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los estados</SelectItem>
                  <SelectItem value={EstadoProyecto.ACTIVO}>
                    <div className="flex items-center justify-between w-full">
                      <span>Activos</span>
                      {!cargandoIndicadores && indicadores?.proyectosActivos !== undefined && (
                        <Badge variant="secondary" className="ml-2">{indicadores.proyectosActivos}</Badge>
                      )}
                    </div>
                  </SelectItem>
                  <SelectItem value={EstadoProyecto.PAUSADO}>
                    <div className="flex items-center justify-between w-full">
                      <span>Pausados</span>
                      {!cargandoIndicadores && indicadores?.proyectosPausados !== undefined && (
                        <Badge variant="secondary" className="ml-2">{indicadores.proyectosPausados}</Badge>
                      )}
                    </div>
                  </SelectItem>
                  <SelectItem value={EstadoProyecto.FINALIZADO}>
                    <div className="flex items-center justify-between w-full">
                      <span>Finalizados</span>
                      {!cargandoIndicadores && indicadores?.proyectosFinalizados !== undefined && (
                        <Badge variant="secondary" className="ml-2">{indicadores.proyectosFinalizados}</Badge>
                      )}
                    </div>
                  </SelectItem>
                  <SelectItem value="CANCELADO">Cancelados</SelectItem>
                  <SelectItem value="ARCHIVADO">Archivados</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {contarFiltrosActivos() > 0 && (
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="px-1.5 py-0.5">
                    {contarFiltrosActivos()} {contarFiltrosActivos() === 1 ? 'filtro' : 'filtros'} activo{contarFiltrosActivos() !== 1 ? 's' : ''}
                  </Badge>
                  
                  {filtrosActivos.busqueda && (
                    <Badge variant="outline" className="flex items-center gap-1 px-2">
                      <span>"{filtrosActivos.busqueda}"</span>
                      <XCircleIcon 
                        className="h-3.5 w-3.5 cursor-pointer text-muted-foreground hover:text-foreground" 
                        onClick={() => {
                          const { busqueda, ...rest } = filtrosActivos;
                          setBusqueda('');
                          onFilterChange(rest);
                        }}
                      />
                    </Badge>
                  )}
                  
                  {filtrosActivos.estado && (
                    <Badge variant="outline" className="flex items-center gap-1 px-2">
                      <span>{filtrosActivos.estado}</span>
                      <XCircleIcon 
                        className="h-3.5 w-3.5 cursor-pointer text-muted-foreground hover:text-foreground" 
                        onClick={() => {
                          const { estado, ...rest } = filtrosActivos;
                          setEstado('todos');
                          onFilterChange(rest);
                        }}
                      />
                    </Badge>
                  )}
                </div>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={limpiarFiltros}
                  className="h-8"
                >
                  Limpiar
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}