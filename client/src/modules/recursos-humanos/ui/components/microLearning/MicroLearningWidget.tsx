/**
 * @file Widget de Recomendación de Micro-Learning
 * @description Componente que muestra recomendaciones contextuales de microlearning
 */

import { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Book, 
  Video, 
  FileText, 
  Headphones, 
  CheckCircle,
  Clock,
  ChevronRight,
  ChevronLeft,
  X,
  Star,
  ExternalLink
} from "lucide-react";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { 
  useRecomendacionesContextuales 
} from "../../../application/useCases/microLearning/obtenerRecomendaciones";
import {
  useActualizarProgresoMicroLearning
} from "../../../application/useCases/microLearning/actualizarProgreso";
import { 
  MicroLearningRecomendacion 
} from "../../../domain/entities/MicroLearning";
import {
  CATEGORIA_MICROLEARNING_LABELS,
  TIPO_CONTENIDO_LABELS,
  NIVEL_DIFICULTAD_LABELS,
  TipoContenido
} from "@shared/schema/microlearning";

// Props para el componente
interface MicroLearningWidgetProps {
  empleadoId: number;
  contextoPagina?: string;
  contextoActividad?: string;
  className?: string;
  onClose?: () => void;
  posicion?: 'arriba-derecha' | 'arriba-izquierda' | 'abajo-derecha' | 'abajo-izquierda' | 'flotante';
  mostrarIconosCerrar?: boolean;
  tamano?: 'pequeño' | 'mediano' | 'grande';
  tema?: 'claro' | 'oscuro' | 'sistema';
}

/**
 * Widget de recomendaciones de micro-learning contextual
 */
export function MicroLearningWidget({
  empleadoId,
  contextoPagina,
  contextoActividad,
  className = "",
  onClose,
  posicion = 'abajo-derecha',
  mostrarIconosCerrar = true,
  tamano = 'mediano',
  tema = 'sistema'
}: MicroLearningWidgetProps) {
  // Estados
  const [indiceActual, setIndiceActual] = useState(0);
  const [contenidoExpandido, setContenidoExpandido] = useState(false);
  const [oculto, setOculto] = useState(false);

  // Obtener recomendaciones contextuales
  const {
    recomendaciones,
    isLoading,
    isError,
    refetch
  } = useRecomendacionesContextuales(empleadoId, contextoPagina, contextoActividad);

  // Hooks para actualizar progreso
  const {
    marcarComoVisto,
    marcarComoCompletado,
    valorarContenido,
    isLoading: isLoadingAction
  } = useActualizarProgresoMicroLearning();

  // Recomendación actual
  const recomendacionActual = recomendaciones[indiceActual];

  // Actualizar índice si hay cambios en recomendaciones
  useEffect(() => {
    setIndiceActual(0);
  }, [recomendaciones]);

  // Marcar como visto al mostrar
  useEffect(() => {
    if (recomendacionActual && !recomendacionActual.visto) {
      marcarComoVisto(empleadoId, recomendacionActual.contenidoId);
    }
  }, [recomendacionActual, empleadoId]);

  // Funciones de navegación
  const irAnterior = () => {
    if (indiceActual > 0) {
      setIndiceActual(indiceActual - 1);
    }
  };

  const irSiguiente = () => {
    if (indiceActual < recomendaciones.length - 1) {
      setIndiceActual(indiceActual + 1);
    }
  };

  // Manejar cierre
  const handleClose = () => {
    setOculto(true);
    if (onClose) onClose();
  };

  // Si no hay recomendaciones o está oculto, no mostrar nada
  if (isError || recomendaciones.length === 0 || oculto) {
    return null;
  }

  // Obtener ícono según tipo de contenido
  const getIconoTipoContenido = (tipo: TipoContenido) => {
    switch (tipo) {
      case TipoContenido.VIDEO:
        return <Video className="w-5 h-5" />;
      case TipoContenido.ARTICULO:
        return <FileText className="w-5 h-5" />;
      case TipoContenido.PODCAST:
        return <Headphones className="w-5 h-5" />;
      case TipoContenido.QUIZ:
      case TipoContenido.CURSO_CORTO:
        return <Book className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  // Clases para tamaño
  const tamanoClasses = {
    pequeño: "w-72 max-w-xs",
    mediano: "w-80 max-w-sm",
    grande: "w-96 max-w-md"
  };

  // Clases para posición
  const posicionClasses = {
    'arriba-derecha': "top-4 right-4",
    'arriba-izquierda': "top-4 left-4",
    'abajo-derecha': "bottom-4 right-4",
    'abajo-izquierda': "bottom-4 left-4",
    'flotante': "bottom-24 right-4"
  };

  // Determinar si el widget debe ser flotante
  const esFlotante = posicion === 'flotante';
  const posicionClass = esFlotante ? "fixed z-50 " + posicionClasses[posicion] : "";

  return (
    <Card className={`${tamanoClasses[tamano]} ${posicionClass} shadow-lg border-primary/20 overflow-hidden ${className}`}>
      <CardHeader className="py-3 px-4 bg-primary/10">
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Book className="w-4 h-4" />
            Micro-Aprendizaje Recomendado
          </CardTitle>
          {mostrarIconosCerrar && (
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <CardDescription className="text-xs">
          Contenido personalizado para reforzar tus conocimientos
        </CardDescription>
      </CardHeader>

      {isLoading ? (
        <CardContent className="py-6 px-4 flex justify-center items-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </CardContent>
      ) : recomendacionActual ? (
        <>
          <CardContent className="py-3 px-4">
            <div className="flex items-start gap-3">
              <Avatar className="h-12 w-12 rounded-md">
                {recomendacionActual.contenido?.imagenUrl ? (
                  <AvatarImage src={recomendacionActual.contenido.imagenUrl} alt={recomendacionActual.contenido.titulo} />
                ) : (
                  <AvatarFallback className="rounded-md bg-secondary">
                    {getIconoTipoContenido(recomendacionActual.contenido?.tipoContenido as TipoContenido)}
                  </AvatarFallback>
                )}
              </Avatar>
              
              <div className="flex-1">
                <h4 className="font-medium text-sm line-clamp-2">{recomendacionActual.contenido?.titulo}</h4>
                
                <div className="flex flex-wrap gap-1 mt-1">
                  <Badge variant="outline" className="text-[10px] py-0 h-5">
                    {recomendacionActual.contenido?.tipoContenido && 
                      TIPO_CONTENIDO_LABELS[recomendacionActual.contenido.tipoContenido as TipoContenido]}
                  </Badge>
                  
                  <Badge variant="outline" className="text-[10px] py-0 h-5">
                    {recomendacionActual.contenido?.duracionMinutos} min
                  </Badge>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge variant="secondary" className="text-[10px] py-0 h-5">
                          relevancia: {recomendacionActual.relevancia}%
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">Relevancia para tu contexto actual</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                
                {contenidoExpandido && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    <p className="mb-1">{recomendacionActual.contenido?.descripcion}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      <Badge variant="secondary" className="text-[10px] py-0 h-5">
                        {recomendacionActual.contenido?.categoria && 
                          CATEGORIA_MICROLEARNING_LABELS[recomendacionActual.contenido.categoria]}
                      </Badge>
                      <Badge variant="secondary" className="text-[10px] py-0 h-5">
                        {recomendacionActual.contenido?.nivel && 
                          NIVEL_DIFICULTAD_LABELS[recomendacionActual.contenido.nivel]}
                      </Badge>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <Button 
              variant="link" 
              className="text-xs p-0 h-auto mt-1" 
              onClick={() => setContenidoExpandido(!contenidoExpandido)}
            >
              {contenidoExpandido ? "Ver menos" : "Ver más"}
            </Button>
          </CardContent>
          
          <Separator />
          
          <CardFooter className="px-4 py-2 flex justify-between">
            <div className="flex gap-1 items-center">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7" 
                onClick={irAnterior}
                disabled={indiceActual === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <span className="text-xs text-muted-foreground">
                {indiceActual + 1} / {recomendaciones.length}
              </span>
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7" 
                onClick={irSiguiente}
                disabled={indiceActual === recomendaciones.length - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex gap-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-7"
                      disabled={isLoadingAction || recomendacionActual.completado}
                      onClick={() => marcarComoCompletado(empleadoId, recomendacionActual.contenidoId)}
                    >
                      {recomendacionActual.completado ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <Clock className="h-4 w-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">
                      {recomendacionActual.completado 
                        ? "Ya completaste este contenido" 
                        : "Marcar como completado"}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <Button 
                variant="default" 
                size="sm" 
                className="h-7"
                onClick={() => window.open(recomendacionActual.contenido?.url, '_blank')}
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                Abrir
              </Button>
            </div>
          </CardFooter>
        </>
      ) : (
        <CardContent className="py-4 px-4 text-center">
          <p className="text-sm text-muted-foreground">No hay recomendaciones disponibles</p>
        </CardContent>
      )}
    </Card>
  );
}