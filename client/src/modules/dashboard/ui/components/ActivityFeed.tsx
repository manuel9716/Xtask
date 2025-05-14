import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";

// Definir la estructura de un registro de actividad
interface ActivityLog {
  id: number;
  userId: number;
  action: string;
  description: string;
  targetId: number | null;
  targetType: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

// Mapeo de acciones a colores
const getActionColor = (action: string) => {
  switch (action.toLowerCase()) {
    case "crear":
      return "bg-green-100 text-green-800";
    case "editar":
      return "bg-blue-100 text-blue-800";
    case "eliminar":
      return "bg-red-100 text-red-800";
    case "ver":
      return "bg-purple-100 text-purple-700";
    case "iniciar sesión":
      return "bg-purple-100 text-purple-700";
    case "cerrar sesión":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

// Obtener las iniciales del usuario
const getUserInitials = (fullName: string) => {
  if (!fullName) return "U";
  
  const names = fullName.split(" ");
  if (names.length >= 2) {
    return `${names[0][0]}${names[1][0]}`.toUpperCase();
  }
  return names[0][0].toUpperCase();
};

export default function ActivityFeed() {
  const { data: activityLogs, isLoading, error } = useQuery<ActivityLog[]>({
    queryKey: ["/api/activity-logs/user-activities"],
    staleTime: 60000, // 1 minuto
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
          <CardDescription>Cargando actividades...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
          <CardDescription>Error al cargar actividades</CardDescription>
        </CardHeader>
        <CardContent>
          <p>No se pudieron cargar las actividades. Inténtalo de nuevo más tarde.</p>
        </CardContent>
      </Card>
    );
  }

  if (!activityLogs || activityLogs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
          <CardDescription>No hay actividades registradas</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Aún no has realizado ninguna actividad en el sistema.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Actividad Reciente</CardTitle>
        <CardDescription>Tus últimas acciones en el sistema</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activityLogs.map((log) => (
            <div key={log.id}>
              <div className="flex items-start space-x-4">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {log.userId === 1 ? "A" : "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">
                      <Badge 
                        className={`font-medium ${getActionColor(log.action)}`}
                      >
                        {log.action}
                      </Badge>
                      <span className="ml-2">{log.description}</span>
                    </p>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(log.createdAt), {
                        addSuffix: true,
                        locale: es,
                      })}
                    </span>
                  </div>
                  {log.targetType && (
                    <p className="text-xs text-muted-foreground">
                      {log.targetType}: {log.targetId || ""}
                    </p>
                  )}
                </div>
              </div>
              <Separator className="my-3" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}