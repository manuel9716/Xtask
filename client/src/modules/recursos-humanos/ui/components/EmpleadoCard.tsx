/**
 * Componente EmpleadoCard
 * Muestra la información de un empleado en formato de tarjeta
 */

import React from "react";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Mail, Phone, Calendar, Building, MapPin, Edit, Trash2 } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Empleado, EstadoEmpleado } from "../../domain/entities/Empleado";

interface EmpleadoCardProps {
  empleado: Empleado;
  onEdit?: (empleado: Empleado) => void;
  onDelete?: (empleado: Empleado) => void;
  modo?: "completo" | "compacto";
}

// Mapeo de estados a colores para las badges
const estadoColores = {
  [EstadoEmpleado.ACTIVO]: "bg-green-500",
  [EstadoEmpleado.INACTIVO]: "bg-red-500",
  [EstadoEmpleado.VACACIONES]: "bg-blue-500",
  [EstadoEmpleado.PERMISO]: "bg-amber-500",
  [EstadoEmpleado.BAJA_MEDICA]: "bg-purple-500"
};

export const EmpleadoCard: React.FC<EmpleadoCardProps> = ({
  empleado,
  onEdit,
  onDelete,
  modo = "completo"
}) => {
  // Obtener iniciales para el avatar fallback
  const obtenerIniciales = () => {
    return `${empleado.nombres.charAt(0)}${empleado.apellidos.charAt(0)}`;
  };

  // Formatear fecha
  const formatearFecha = (fecha?: Date) => {
    if (!fecha) return "N/A";
    return new Intl.DateTimeFormat("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    }).format(fecha);
  };

  // Determinar color de estado
  const colorEstado = estadoColores[empleado.estado] || "bg-gray-500";

  // Renderizar modo compacto
  if (modo === "compacto") {
    return (
      <Card className="overflow-hidden">
        <div className="flex items-center p-4">
          <Avatar className="h-10 w-10 mr-4">
            <AvatarImage src={empleado.fotoUrl} alt={empleado.nombreCompleto} />
            <AvatarFallback>{obtenerIniciales()}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="font-medium">{empleado.nombreCompleto}</div>
            <div className="text-sm text-muted-foreground flex items-center">
              <Building className="h-3 w-3 mr-1" />
              {empleado.cargo}
            </div>
          </div>
          <Badge className={`${colorEstado} hover:${colorEstado}`}>
            {empleado.estado}
          </Badge>
        </div>
      </Card>
    );
  }

  // Renderizar modo completo
  return (
    <Card className="overflow-hidden">
      <CardHeader className="relative pb-2">
        <div className="absolute top-2 right-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit?.(empleado)}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-red-600"
                onClick={() => onDelete?.(empleado)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex items-center">
          <Avatar className="h-14 w-14 mr-4">
            <AvatarImage src={empleado.fotoUrl} alt={empleado.nombreCompleto} />
            <AvatarFallback>{obtenerIniciales()}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle>{empleado.nombreCompleto}</CardTitle>
            <CardDescription className="flex items-center">
              <Building className="h-3 w-3 mr-1" />
              {empleado.cargo}
            </CardDescription>
          </div>
        </div>
        <Badge className={`mt-2 ${colorEstado} hover:${colorEstado}`}>
          {empleado.estado}
        </Badge>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="grid gap-2">
          <div className="flex items-center">
            <Building className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="text-sm">{empleado.departamento}</span>
          </div>
          {empleado.correo && (
            <div className="flex items-center">
              <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-sm">{empleado.correo}</span>
            </div>
          )}
          {empleado.telefono && (
            <div className="flex items-center">
              <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-sm">{empleado.telefono}</span>
            </div>
          )}
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="text-sm">Contratado: {formatearFecha(empleado.fechaContratacion)}</span>
          </div>
          {empleado.direccion && (
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-sm">{empleado.direccion}</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button asChild variant="secondary" size="sm" className="w-full">
                <Link href={`/recursos-humanos/empleados/${empleado.id}`}>
                  Ver detalles
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Ver perfil completo, evaluaciones y capacitaciones
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardFooter>
    </Card>
  );
};