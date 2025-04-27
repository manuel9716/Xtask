/**
 * Componente KpiCard
 * Muestra un indicador clave de rendimiento (KPI) con título, valor y tendencia
 */

import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUp, ArrowDown, Minus, TrendingUp, Users, DollarSign, Calendar, Briefcase } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string | number;
  description?: string;
  trend?: number;
  icon?: "users" | "money" | "calendar" | "briefcase" | "custom";
  customIcon?: React.ReactNode;
  color?: "default" | "primary" | "success" | "warning" | "danger" | "info";
  loading?: boolean;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  description,
  trend,
  icon = "users",
  customIcon,
  color = "default",
  loading = false
}) => {
  // Determinar icono a mostrar
  const getIcon = () => {
    switch (icon) {
      case "users":
        return <Users className="h-5 w-5" />;
      case "money":
        return <DollarSign className="h-5 w-5" />;
      case "calendar":
        return <Calendar className="h-5 w-5" />;
      case "briefcase":
        return <Briefcase className="h-5 w-5" />;
      case "custom":
        return customIcon || <TrendingUp className="h-5 w-5" />;
      default:
        return <TrendingUp className="h-5 w-5" />;
    }
  };

  // Determinar color de fondo
  const getBgColor = () => {
    switch (color) {
      case "primary":
        return "bg-primary text-primary-foreground";
      case "success":
        return "bg-green-500 text-white";
      case "warning":
        return "bg-amber-500 text-white";
      case "danger":
        return "bg-red-500 text-white";
      case "info":
        return "bg-blue-500 text-white";
      default:
        return "bg-card";
    }
  };

  // Determinar icono y color de tendencia
  const getTrendIcon = () => {
    if (!trend) return <Minus className="h-4 w-4 text-muted-foreground" />;
    
    if (trend > 0) {
      return <ArrowUp className="h-4 w-4 text-green-500" />;
    } else if (trend < 0) {
      return <ArrowDown className="h-4 w-4 text-red-500" />;
    } else {
      return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  // Formatear valor de tendencia
  const formatTrend = () => {
    if (!trend) return "0%";
    
    const sign = trend > 0 ? "+" : "";
    return `${sign}${trend}%`;
  };

  // Estado de carga
  if (loading) {
    return (
      <Card className="min-h-[160px] flex flex-col">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            <div className="h-4 w-20 animate-pulse bg-muted rounded"></div>
          </CardTitle>
        </CardHeader>
        <CardContent className="py-2 flex-1">
          <div className="h-8 w-16 animate-pulse bg-muted rounded"></div>
          <div className="h-4 w-32 animate-pulse bg-muted rounded mt-2"></div>
        </CardContent>
        <CardFooter className="pt-2">
          <div className="h-4 w-12 animate-pulse bg-muted rounded"></div>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className={`${color !== "default" ? getBgColor() : ""}${color !== "default" ? " border-none" : ""}`}>
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className={`text-sm font-medium ${color !== "default" ? "text-white" : ""}`}>{title}</CardTitle>
        <div className={`p-1 rounded-full ${color !== "default" ? "bg-white/20" : "bg-muted"}`}>
          {getIcon()}
        </div>
      </CardHeader>
      <CardContent className="py-2">
        <div className={`text-2xl font-bold ${color !== "default" ? "text-white" : ""}`}>
          {value}
        </div>
        {description && (
          <CardDescription className={`${color !== "default" ? "text-white/80" : ""}`}>
            {description}
          </CardDescription>
        )}
      </CardContent>
      {trend !== undefined && (
        <CardFooter className="pt-2">
          <div className="flex items-center gap-1">
            {getTrendIcon()}
            <span className={`text-xs ${trend > 0 ? "text-green-500" : trend < 0 ? "text-red-500" : "text-muted-foreground"} ${color !== "default" ? "text-white/80" : ""}`}>
              {formatTrend()} respecto al periodo anterior
            </span>
          </div>
        </CardFooter>
      )}
    </Card>
  );
};