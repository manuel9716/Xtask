import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Calculator, 
  CheckCircle, 
  Ban, 
  Clock,
  CalendarClock
} from "lucide-react";
import { Bonificacion, EstadoBonificacion } from "../../domain/entities/Bonificacion";
import { KpiApi } from "../../infrastructure/api/kpiApi";

/**
 * Vista del historial de bonificaciones por KPIs
 */
export const HistorialKpis: React.FC = () => {
  // Estado para filtrado por año
  const [selectedYear, setSelectedYear] = useState<string>("todos");

  // Consulta de bonificaciones históricas
  const { data: bonificaciones, isLoading } = useQuery<Bonificacion[]>({
    queryKey: ['/api/kpis/bonificaciones/historial'],
    queryFn: async () => {
      const kpiRepository = new KpiApi();
      return kpiRepository.getBonificacionesHistory(0);
    },
  });

  // Formatear fecha para mostrar
  const formatearFecha = (fecha: Date | string | undefined) => {
    if (!fecha) return "-";
    const date = typeof fecha === 'string' ? parseISO(fecha) : fecha;
    return format(date, 'dd MMM yyyy, HH:mm', { locale: es });
  };

  // Formatear número como cantidad monetaria
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Formatear mes para mostrar
  const formatearMes = (mes: string) => {
    const [year, month] = mes.split('-');
    const fecha = new Date(parseInt(year), parseInt(month) - 1, 1);
    return format(fecha, 'MMMM yyyy', { locale: es });
  };

  // Determinar estilo de badge según el estado
  const getBadgeDetails = (estado: EstadoBonificacion) => {
    switch (estado) {
      case EstadoBonificacion.CALCULADA:
        return { 
          color: "bg-blue-100 text-blue-800 hover:bg-blue-100", 
          icon: <Calculator className="h-4 w-4 mr-1" /> 
        };
      case EstadoBonificacion.APROBADA:
        return { 
          color: "bg-green-100 text-green-800 hover:bg-green-100", 
          icon: <CheckCircle className="h-4 w-4 mr-1" /> 
        };
      case EstadoBonificacion.RECHAZADA:
        return { 
          color: "bg-red-100 text-red-800 hover:bg-red-100", 
          icon: <Ban className="h-4 w-4 mr-1" /> 
        };
      case EstadoBonificacion.PAGADA:
        return { 
          color: "bg-indigo-100 text-indigo-800 hover:bg-indigo-100", 
          icon: <CheckCircle className="h-4 w-4 mr-1" /> 
        };
      default:
        return { 
          color: "bg-amber-100 text-amber-800 hover:bg-amber-100", 
          icon: <Clock className="h-4 w-4 mr-1" /> 
        };
    }
  };

  // Formatear texto de estado
  const getEstadoText = (estado: EstadoBonificacion) => {
    switch (estado) {
      case EstadoBonificacion.CALCULADA:
        return "Calculado";
      case EstadoBonificacion.APROBADA:
        return "Aprobado";
      case EstadoBonificacion.RECHAZADA:
        return "Rechazado";
      case EstadoBonificacion.PAGADA:
        return "Pagado";
      default:
        return "Desconocido";
    }
  };

  // Obtener años disponibles para filtrado
  const getYearsOptions = () => {
    if (!bonificaciones || bonificaciones.length === 0) {
      return [];
    }
    
    const years = new Set<string>();
    bonificaciones.forEach(b => {
      const year = b.mes.split('-')[0];
      years.add(year);
    });
    
    return Array.from(years).sort((a, b) => b.localeCompare(a)); // Ordenar descendente
  };

  // Filtrar bonificaciones por año seleccionado
  const bonificacionesFiltradas = bonificaciones?.filter(b => {
    if (selectedYear === "todos") return true;
    return b.mes.startsWith(selectedYear);
  }).sort((a, b) => b.mes.localeCompare(a.mes)); // Ordenar por mes, más reciente primero

  return (
    <div className="container py-6 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Historial de Bonificaciones</h1>
          <p className="text-muted-foreground">
            Histórico de bonificaciones por cumplimiento de KPIs
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <CalendarClock className="h-5 w-5 text-muted-foreground" />
          <Select
            value={selectedYear}
            onValueChange={setSelectedYear}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filtrar por año" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los años</SelectItem>
              {getYearsOptions().map(year => (
                <SelectItem key={year} value={year}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Bonificaciones por periodo</CardTitle>
          <CardDescription>
            Historial de bonificaciones calculadas y su estado actual
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin w-12 h-12 border-t-2 border-b-2 border-primary rounded-full"></div>
            </div>
          ) : !bonificaciones || bonificaciones.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-muted-foreground">
                No hay bonificaciones registradas en el historial.
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Periodo</TableHead>
                    <TableHead>Cumplimiento</TableHead>
                    <TableHead>Bonificación</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="hidden md:table-cell">Fecha cálculo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bonificacionesFiltradas?.map((bonificacion) => {
                    const { color, icon } = getBadgeDetails(bonificacion.estado);
                    return (
                      <TableRow key={bonificacion.id}>
                        <TableCell className="font-medium">
                          {formatearMes(bonificacion.mes)}
                        </TableCell>
                        <TableCell>
                          <span className={bonificacion.porcentajeCumplimientoGlobal >= 100 ? 'text-green-600' : 'text-amber-600'}>
                            {bonificacion.porcentajeCumplimientoGlobal}%
                          </span>
                        </TableCell>
                        <TableCell>
                          {formatCurrency(bonificacion.bonificacionTotal)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={color}>
                            <span className="flex items-center">
                              {icon}
                              <span>{getEstadoText(bonificacion.estado)}</span>
                            </span>
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground">
                          {formatearFecha(bonificacion.createdAt)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};