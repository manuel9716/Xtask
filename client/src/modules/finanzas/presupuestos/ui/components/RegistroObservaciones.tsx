import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  MessageCircle, 
  AlertTriangle, 
  Info, 
  CheckCircle,
  User,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const observacionSchema = z.object({
  titulo: z.string().min(1, 'El título es requerido'),
  contenido: z.string().min(1, 'El contenido es requerido'),
  tipo: z.enum(['NOTA', 'ALERTA', 'IMPORTANTE', 'COMPLETADO'], {
    required_error: 'Seleccione un tipo',
  }),
  etiquetas: z.string().optional(),
});

type ObservacionForm = z.infer<typeof observacionSchema>;

interface Observacion {
  id: number;
  titulo: string;
  contenido: string;
  tipo: 'NOTA' | 'ALERTA' | 'IMPORTANTE' | 'COMPLETADO';
  etiquetas: string[];
  fechaCreacion: Date;
  autor: string;
}

interface RegistroObservacionesProps {
  presupuestoId: number | null;
  observaciones?: Observacion[];
  onAddObservacion?: (data: ObservacionForm) => void;
}

export const RegistroObservaciones: React.FC<RegistroObservacionesProps> = ({
  presupuestoId,
  observaciones = [],
  onAddObservacion,
}) => {
  const [showForm, setShowForm] = useState(false);

  const form = useForm<ObservacionForm>({
    resolver: zodResolver(observacionSchema),
    defaultValues: {
      titulo: '',
      contenido: '',
      tipo: 'NOTA',
      etiquetas: '',
    },
  });

  const handleSubmit = (data: ObservacionForm) => {
    if (onAddObservacion) {
      onAddObservacion(data);
    }
    form.reset();
    setShowForm(false);
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'ALERTA':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'IMPORTANTE':
        return <Info className="h-4 w-4 text-blue-500" />;
      case 'COMPLETADO':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <MessageCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTipoBadgeColor = (tipo: string) => {
    switch (tipo) {
      case 'ALERTA':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'IMPORTANTE':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'COMPLETADO':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  // Datos de ejemplo para mostrar funcionalidad
  const observacionesEjemplo: Observacion[] = [
    {
      id: 1,
      titulo: 'Inicio de proyecto',
      contenido: 'Se ha iniciado oficialmente el proyecto SISVAE 2.0. El presupuesto ha sido aprobado por la dirección.',
      tipo: 'IMPORTANTE',
      etiquetas: ['inicio', 'aprobación'],
      fechaCreacion: new Date('2025-01-15'),
      autor: 'David Valencia'
    },
    {
      id: 2,
      titulo: 'Revisión de gastos Q1',
      contenido: 'Se requiere una revisión detallada de los gastos del primer trimestre antes de proceder con las siguientes fases.',
      tipo: 'ALERTA',
      etiquetas: ['revisión', 'gastos'],
      fechaCreacion: new Date('2025-03-01'),
      autor: 'Ana García'
    },
    {
      id: 3,
      titulo: 'Adquisición de equipos',
      contenido: 'Se han adquirido todos los equipos necesarios para el desarrollo del proyecto según las especificaciones técnicas.',
      tipo: 'COMPLETADO',
      etiquetas: ['equipos', 'compras'],
      fechaCreacion: new Date('2025-06-15'),
      autor: 'Carlos Rodríguez'
    }
  ];

  const todasLasObservaciones = observaciones.length > 0 ? observaciones : observacionesEjemplo;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Observaciones del Presupuesto</h3>
        <Button 
          onClick={() => setShowForm(!showForm)}
          variant={showForm ? "outline" : "default"}
          size="sm"
        >
          {showForm ? 'Cancelar' : 'Nueva Observación'}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Agregar Nueva Observación</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="titulo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Título de la observación"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tipo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccione tipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="NOTA">Nota</SelectItem>
                            <SelectItem value="ALERTA">Alerta</SelectItem>
                            <SelectItem value="IMPORTANTE">Importante</SelectItem>
                            <SelectItem value="COMPLETADO">Completado</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="contenido"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contenido</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Descripción detallada de la observación..."
                          className="resize-none"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="etiquetas"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Etiquetas</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Etiquetas separadas por comas (ej: urgente, revisión, compras)"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    Guardar Observación
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {todasLasObservaciones.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No hay observaciones registradas para este presupuesto.</p>
              <p className="text-sm">Agregue una observación para documentar el progreso del proyecto.</p>
            </CardContent>
          </Card>
        ) : (
          todasLasObservaciones.map((observacion) => (
            <Card key={observacion.id} className="transition-shadow hover:shadow-md">
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  {getTipoIcon(observacion.tipo)}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{observacion.titulo}</h4>
                      <Badge className={getTipoBadgeColor(observacion.tipo)}>
                        {observacion.tipo}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {observacion.contenido}
                    </p>
                    
                    {observacion.etiquetas.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {observacion.etiquetas.map((etiqueta, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {etiqueta}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    <Separator className="my-2" />
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>{observacion.autor}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{format(observacion.fechaCreacion, 'PPp', { locale: es })}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};