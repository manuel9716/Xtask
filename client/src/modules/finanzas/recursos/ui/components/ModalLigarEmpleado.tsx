import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { UserPlus, User, Mail, Phone, Building2 } from 'lucide-react';

interface Empleado {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  position: string;
  department: string;
  contractStatus: string;
}

interface ModalLigarEmpleadoProps {
  isOpen: boolean;
  onClose: () => void;
  recursoId: number | null;
  onConfirmar: (empleadoId: number) => void;
  isLoading?: boolean;
}

export function ModalLigarEmpleado({ 
  isOpen, 
  onClose, 
  recursoId, 
  onConfirmar, 
  isLoading = false 
}: ModalLigarEmpleadoProps) {
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState<number | null>(null);

  // Obtener lista de empleados activos
  const { data: empleados, isLoading: cargandoEmpleados } = useQuery({
    queryKey: ['empleados', 'activos'],
    queryFn: async () => {
      const response = await fetch('/api/nomina/empleados/listar?contractStatus=active');
      if (!response.ok) {
        throw new Error('Error al obtener empleados');
      }
      return response.json();
    },
    enabled: isOpen,
  });

  const empleadoInfo = empleados?.find((emp: Empleado) => emp.id === empleadoSeleccionado);

  const handleConfirmar = () => {
    if (empleadoSeleccionado) {
      onConfirmar(empleadoSeleccionado);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-[#02BDEA]" />
            Ligar Recurso a Empleado
          </DialogTitle>
          <DialogDescription>
            Selecciona un empleado activo para vincular con este recurso del presupuesto
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Selector de empleado */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Empleado</label>
            {cargandoEmpleados ? (
              <div className="h-10 bg-gray-100 rounded animate-pulse" />
            ) : (
              <Select
                value={empleadoSeleccionado?.toString() || ''}
                onValueChange={(value) => setEmpleadoSeleccionado(Number(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar empleado..." />
                </SelectTrigger>
                <SelectContent>
                  {empleados?.map((empleado: Empleado) => (
                    <SelectItem key={empleado.id} value={empleado.id.toString()}>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">
                            {empleado.firstName[0]}{empleado.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <span>{empleado.firstName} {empleado.lastName}</span>
                        <Badge variant="outline" className="ml-auto">
                          {empleado.position}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Información del empleado seleccionado */}
          {empleadoInfo && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-[#02BDEA] text-white">
                      {empleadoInfo.firstName[0]}{empleadoInfo.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <div>
                      <h4 className="font-semibold text-[#251948]">
                        {empleadoInfo.firstName} {empleadoInfo.lastName}
                      </h4>
                      <Badge className="bg-[#02BDEA] text-white">
                        {empleadoInfo.contractStatus === 'active' ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span>{empleadoInfo.position}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-gray-500" />
                        <span>{empleadoInfo.department}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span>{empleadoInfo.email}</span>
                      </div>
                      {empleadoInfo.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-500" />
                          <span>{empleadoInfo.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Nota informativa */}
          <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-800">
              <strong>Nota:</strong> Una vez ligado, este empleado quedará asociado al recurso del presupuesto 
              para efectos de nómina y seguimiento de costos.
            </p>
          </div>
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmar}
            disabled={!empleadoSeleccionado || isLoading}
            className="bg-[#02BDEA] hover:bg-[#02BDEA]/90 text-white"
          >
            {isLoading ? 'Ligando...' : 'Ligar Empleado'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}