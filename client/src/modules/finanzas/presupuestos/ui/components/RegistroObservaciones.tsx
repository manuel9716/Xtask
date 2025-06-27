import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  MessageSquare, 
  Plus, 
  Calendar, 
  User,
  Edit,
  Save,
  X
} from 'lucide-react';

interface RegistroObservacionesProps {
  presupuestoId: number;
}

interface Observacion {
  id: number;
  texto: string;
  fecha: string;
  usuario: string;
  tipo: 'general' | 'importante' | 'alerta';
}

export function RegistroObservaciones({ presupuestoId }: RegistroObservacionesProps) {
  const [nuevaObservacion, setNuevaObservacion] = useState('');
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [textoEditado, setTextoEditado] = useState('');

  // Datos mock para demostración
  const [observaciones, setObservaciones] = useState<Observacion[]>([
    {
      id: 1,
      texto: 'Se aprobó el incremento del presupuesto para la fase 2 del proyecto. Se requiere actualizar los recursos asignados.',
      fecha: '2024-12-20T10:30:00Z',
      usuario: 'María González',
      tipo: 'importante'
    },
    {
      id: 2,
      texto: 'Reunión programada con el proveedor para revisar las facturas pendientes. Verificar documentación antes del 25 de diciembre.',
      fecha: '2024-12-18T14:15:00Z',
      usuario: 'Carlos Ramírez',
      tipo: 'alerta'
    },
    {
      id: 3,
      texto: 'Seguimiento semanal: El presupuesto se encuentra dentro de los parámetros esperados. No hay desviaciones significativas.',
      fecha: '2024-12-15T09:00:00Z',
      usuario: 'Ana López',
      tipo: 'general'
    }
  ]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'importante': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'alerta': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case 'importante': return 'Importante';
      case 'alerta': return 'Alerta';
      default: return 'General';
    }
  };

  const handleAgregarObservacion = () => {
    if (nuevaObservacion.trim()) {
      const nueva: Observacion = {
        id: Date.now(),
        texto: nuevaObservacion,
        fecha: new Date().toISOString(),
        usuario: 'Usuario Actual', // En producción vendría del contexto de autenticación
        tipo: 'general'
      };
      setObservaciones([nueva, ...observaciones]);
      setNuevaObservacion('');
    }
  };

  const handleEditarObservacion = (id: number) => {
    const observacion = observaciones.find(obs => obs.id === id);
    if (observacion) {
      setEditandoId(id);
      setTextoEditado(observacion.texto);
    }
  };

  const handleGuardarEdicion = () => {
    if (editandoId && textoEditado.trim()) {
      setObservaciones(observaciones.map(obs => 
        obs.id === editandoId 
          ? { ...obs, texto: textoEditado }
          : obs
      ));
      setEditandoId(null);
      setTextoEditado('');
    }
  };

  const handleCancelarEdicion = () => {
    setEditandoId(null);
    setTextoEditado('');
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Observaciones y Documentación</h3>
      </div>

      {/* Agregar nueva observación */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nueva Observación
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            placeholder="Escriba una observación sobre el presupuesto..."
            value={nuevaObservacion}
            onChange={(e) => setNuevaObservacion(e.target.value)}
            className="min-h-[100px]"
          />
          <div className="flex justify-end">
            <Button 
              onClick={handleAgregarObservacion}
              disabled={!nuevaObservacion.trim()}
              className="bg-[#02BDEA] hover:bg-[#02BDEA]/90"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Agregar Observación
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de observaciones */}
      <div className="space-y-3">
        {observaciones.map((observacion) => (
          <Card key={observacion.id} className="border-l-4 border-l-[#02BDEA]">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-[#251948] text-white text-xs">
                      {observacion.usuario.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{observacion.usuario}</span>
                      <Badge className={getTipoColor(observacion.tipo)}>
                        {getTipoLabel(observacion.tipo)}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(observacion.fecha)}</span>
                    </div>
                    
                    {editandoId === observacion.id ? (
                      <div className="space-y-2">
                        <Textarea
                          value={textoEditado}
                          onChange={(e) => setTextoEditado(e.target.value)}
                          className="min-h-[80px]"
                        />
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            onClick={handleGuardarEdicion}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Save className="h-3 w-3 mr-1" />
                            Guardar
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={handleCancelarEdicion}
                          >
                            <X className="h-3 w-3 mr-1" />
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {observacion.texto}
                      </p>
                    )}
                  </div>
                </div>
                
                {editandoId !== observacion.id && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleEditarObservacion(observacion.id)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {observaciones.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay observaciones
            </h3>
            <p className="text-gray-600">
              Comience agregando observaciones para documentar el seguimiento del presupuesto.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}