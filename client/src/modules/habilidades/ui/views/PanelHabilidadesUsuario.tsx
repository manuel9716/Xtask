import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Filter, Search, UserPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { AssignSkillDialog } from "@/components/assign-skill-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Habilidad, 
  TipoHabilidad, 
  NivelHabilidad,
  HabilidadesPorTipo,
  getTipoLabel,
  getTipoIcon,
  getTipoColor
} from "../../domain/entities/Habilidad";
import { HabilidadCard } from "../components/HabilidadCard";
import { HabilidadForm } from "../components/HabilidadForm";
import { habilidadApi } from "../../infrastructure/api/habilidadApi";

interface PanelHabilidadesUsuarioProps {
  userId?: number; // Si no se proporciona, mostrará las del usuario actual
}

export function PanelHabilidadesUsuario({ userId }: PanelHabilidadesUsuarioProps) {
  const [showForm, setShowForm] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [editingHabilidad, setEditingHabilidad] = useState<Habilidad | undefined>();
  const [filtroTipo, setFiltroTipo] = useState<string>("todos");
  const [filtroNivel, setFiltroNivel] = useState<string>("todos");
  const [busqueda, setBusqueda] = useState("");

  const currentUserId = userId || 1; // Por ahora usamos 1 como default, en el futuro se obtendrá del contexto de auth

  const { data: habilidades, isLoading, error } = useQuery<HabilidadesPorTipo>({
    queryKey: ['/api/habilidades', userId ? `user-${userId}` : 'mis-habilidades'],
    queryFn: () => userId 
      ? habilidadApi.getHabilidadesByUserId(userId)
      : habilidadApi.getMisHabilidades(),
  });

  const handleEdit = (habilidad: Habilidad) => {
    setEditingHabilidad(habilidad);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingHabilidad(undefined);
  };

  const handleAddNew = () => {
    setEditingHabilidad(undefined);
    setShowForm(true);
  };

  // Filtrar habilidades
  const filtrarHabilidades = (habilidadesLista: Habilidad[]) => {
    return habilidadesLista.filter(habilidad => {
      const coincideTipo = filtroTipo === "todos" || habilidad.tipo === filtroTipo;
      const coincideNivel = filtroNivel === "todos" || habilidad.nivel === filtroNivel;
      const coincideBusqueda = busqueda === "" || 
        habilidad.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        (habilidad.observaciones?.toLowerCase().includes(busqueda.toLowerCase()));
      
      return coincideTipo && coincideNivel && coincideBusqueda;
    });
  };

  // Obtener estadísticas
  const getEstadisticas = () => {
    if (!habilidades) return { total: 0, porTipo: {}, porNivel: {} };
    
    const todasHabilidades = Object.values(habilidades).flat();
    const porTipo: Record<string, number> = {};
    const porNivel: Record<string, number> = {};
    
    todasHabilidades.forEach(habilidad => {
      porTipo[habilidad.tipo] = (porTipo[habilidad.tipo] || 0) + 1;
      porNivel[habilidad.nivel] = (porNivel[habilidad.nivel] || 0) + 1;
    });
    
    return {
      total: todasHabilidades.length,
      porTipo,
      porNivel
    };
  };

  const estadisticas = getEstadisticas();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-red-600">
            Error al cargar las habilidades. Por favor, intenta nuevamente.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Panel de Habilidades</h1>
          <p className="text-muted-foreground">
            Gestiona tus indicadores clave de desempeño y bonificaciones mensuales
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleAddNew}>
            <Plus className="mr-2 h-4 w-4" />
            Agregar Habilidad
          </Button>
          <Button variant="outline" onClick={() => setShowAssignDialog(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Asignar a Usuario
          </Button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Habilidades</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estadisticas.total}</div>
          </CardContent>
        </Card>
        
        {Object.entries(estadisticas.porTipo).map(([tipo, cantidad]) => (
          <Card key={tipo}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-1">
                <span>{getTipoIcon(tipo as TipoHabilidad)}</span>
                {getTipoLabel(tipo as TipoHabilidad)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{cantidad}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar habilidades..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo</label>
              <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los tipos</SelectItem>
                  <SelectItem value={TipoHabilidad.HERRAMIENTA}>🔧 Herramientas</SelectItem>
                  <SelectItem value={TipoHabilidad.HABILIDAD_BLANDA}>💡 Habilidades Blandas</SelectItem>
                  <SelectItem value={TipoHabilidad.CONOCIMIENTO}>📚 Conocimientos</SelectItem>
                  <SelectItem value={TipoHabilidad.IDIOMA}>🌍 Idiomas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Nivel</label>
              <Select value={filtroNivel} onValueChange={setFiltroNivel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los niveles</SelectItem>
                  <SelectItem value={NivelHabilidad.BASICO}>🔴 Básico</SelectItem>
                  <SelectItem value={NivelHabilidad.INTERMEDIO}>🟡 Intermedio</SelectItem>
                  <SelectItem value={NivelHabilidad.AVANZADO}>🔵 Avanzado</SelectItem>
                  <SelectItem value={NivelHabilidad.EXPERTO}>🟢 Experto</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Habilidades por tipo */}
      {Object.entries(TipoHabilidad).map(([key, tipo]) => {
        const habilidadesTipo = habilidades?.[tipo] || [];
        const habilidadesFiltradas = filtrarHabilidades(habilidadesTipo);
        
        if (habilidadesFiltradas.length === 0 && (filtroTipo !== "todos" && filtroTipo !== tipo)) {
          return null;
        }

        return (
          <Card key={tipo}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="text-xl">{getTipoIcon(tipo)}</span>
                  {getTipoLabel(tipo)}
                  <Badge className={getTipoColor(tipo)}>
                    {habilidadesFiltradas.length}
                  </Badge>
                </span>
              </CardTitle>
              {habilidadesFiltradas.length === 0 && (
                <CardDescription>
                  No tienes habilidades de este tipo aún.
                </CardDescription>
              )}
            </CardHeader>
            {habilidadesFiltradas.length > 0 && (
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {habilidadesFiltradas.map((habilidad) => (
                    <HabilidadCard
                      key={habilidad.id}
                      habilidad={habilidad}
                      onEdit={handleEdit}
                    />
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        );
      })}

      {/* Mensaje cuando no hay habilidades */}
      {estadisticas.total === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-lg font-semibold mb-2">No hay habilidades registradas</h3>
            <p className="text-muted-foreground mb-6">
              Comienza agregando tus primeras habilidades para crear tu perfil profesional.
            </p>
            <Button onClick={handleAddNew}>
              <Plus className="mr-2 h-4 w-4" />
              Agregar Primera Habilidad
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Formulario */}
      <HabilidadForm
        open={showForm}
        onOpenChange={handleCloseForm}
        habilidad={editingHabilidad}
        userId={currentUserId}
      />
      
      {/* Diálogo de asignación de habilidades */}
      <AssignSkillDialog
        open={showAssignDialog}
        onOpenChange={setShowAssignDialog}
      />
    </div>
  );
}