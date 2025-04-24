import { useState } from 'react';
import { format, endOfMonth, startOfMonth, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  CalendarIcon, 
  Loader2, 
  FileDown, 
  CheckCircle2 
} from 'lucide-react';
import { Employee } from '@shared/schema';
import { CalculoNominaService, ParametrosCalculoNomina, ConceptoNomina } from '../../domain/services/CalculoNominaEmpleado';
import { generarDesprendiblePDF } from '../../infrastructure/pdf/generarDesprendiblePDF';

interface DesprendibleNominaModalProps {
  empleado: Employee;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function DesprendibleNominaModal({ 
  empleado, 
  open, 
  onOpenChange,
  onSuccess
}: DesprendibleNominaModalProps) {
  const { toast } = useToast();
  const calculoService = new CalculoNominaService();
  
  // Estado para el formulario de nómina
  const [fechaInicio, setFechaInicio] = useState<Date>(startOfMonth(new Date()));
  const [fechaFin, setFechaFin] = useState<Date>(endOfMonth(new Date()));
  const [diasTrabajados, setDiasTrabajados] = useState<number>(30);
  const [horasExtras, setHorasExtras] = useState<number>(0);
  const [tipoPeriodo, setTipoPeriodo] = useState<string>('actual');
  const [bonificaciones, setBonificaciones] = useState<ConceptoNomina[]>([]);
  const [deducciones, setDeducciones] = useState<ConceptoNomina[]>([]);
  
  // Para nuevas bonificaciones/deducciones
  const [nuevaBonificacion, setNuevaBonificacion] = useState<{nombre: string, valor: string}>({
    nombre: '',
    valor: ''
  });
  const [nuevaDeduccion, setNuevaDeduccion] = useState<{nombre: string, valor: string}>({
    nombre: '',
    valor: ''
  });
  
  // Mutación para generar el desprendible de nómina
  const generarDesprendibleMutation = useMutation({
    mutationFn: async () => {
      // 1. Calcular la nómina con el servicio
      const parametros: ParametrosCalculoNomina = {
        empleado,
        fechaInicio,
        fechaFin,
        diasTrabajados,
        horasExtras,
        bonificaciones,
        deducciones
      };
      
      const resultado = calculoService.calcularNomina(parametros);
      
      // 2. Enviar a la API para generar el PDF
      const pdfUrl = await generarDesprendiblePDF(resultado);
      
      return { pdfUrl, resultado };
    },
    onSuccess: (data) => {
      toast({
        title: 'Desprendible generado',
        description: 'El desprendible de nómina ha sido generado exitosamente',
      });
      
      // Descargar automáticamente el PDF
      window.open(data.pdfUrl, '_blank');
      
      if (onSuccess) {
        onSuccess();
      }
      
      // Cerrar el modal
      setTimeout(() => {
        onOpenChange(false);
      }, 2000);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Error al generar el desprendible: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
  
  // Cambiar periodo según selección
  const handleCambioPeriodo = (tipoPeriodo: string) => {
    setTipoPeriodo(tipoPeriodo);
    
    const hoy = new Date();
    
    switch (tipoPeriodo) {
      case 'actual':
        setFechaInicio(startOfMonth(hoy));
        setFechaFin(endOfMonth(hoy));
        break;
      case 'anterior':
        const mesAnterior = subMonths(hoy, 1);
        setFechaInicio(startOfMonth(mesAnterior));
        setFechaFin(endOfMonth(mesAnterior));
        break;
      case 'personalizado':
        // Mantener las fechas actuales
        break;
    }
  };
  
  // Agregar bonificación
  const agregarBonificacion = () => {
    if (nuevaBonificacion.nombre && nuevaBonificacion.valor) {
      const valor = parseFloat(nuevaBonificacion.valor);
      
      if (!isNaN(valor) && valor > 0) {
        setBonificaciones(prev => [
          ...prev, 
          {
            nombre: nuevaBonificacion.nombre,
            valor,
            esDeduccion: false
          }
        ]);
        
        // Limpiar el formulario
        setNuevaBonificacion({ nombre: '', valor: '' });
      }
    }
  };
  
  // Agregar deducción
  const agregarDeduccion = () => {
    if (nuevaDeduccion.nombre && nuevaDeduccion.valor) {
      const valor = parseFloat(nuevaDeduccion.valor);
      
      if (!isNaN(valor) && valor > 0) {
        setDeducciones(prev => [
          ...prev, 
          {
            nombre: nuevaDeduccion.nombre,
            valor,
            esDeduccion: true
          }
        ]);
        
        // Limpiar el formulario
        setNuevaDeduccion({ nombre: '', valor: '' });
      }
    }
  };
  
  // Eliminar bonificación
  const eliminarBonificacion = (index: number) => {
    setBonificaciones(prev => prev.filter((_, i) => i !== index));
  };
  
  // Eliminar deducción
  const eliminarDeduccion = (index: number) => {
    setDeducciones(prev => prev.filter((_, i) => i !== index));
  };
  
  // Manejar generación de desprendible
  const handleGenerarDesprendible = () => {
    generarDesprendibleMutation.mutate();
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Generar Desprendible de Nómina</DialogTitle>
          <DialogDescription>
            Complete los detalles para generar el desprendible de pago para {(empleado as any).fullName || `Usuario #${empleado.userId}`}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          {/* Periodo de nómina */}
          <div className="space-y-4">
            <div className="font-medium">Periodo de nómina</div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Select
                  value={tipoPeriodo}
                  onValueChange={handleCambioPeriodo}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar periodo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="actual">Mes actual</SelectItem>
                    <SelectItem value="anterior">Mes anterior</SelectItem>
                    <SelectItem value="personalizado">Personalizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="fechaInicio">Fecha de inicio</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                      disabled={tipoPeriodo !== 'personalizado'}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {fechaInicio ? format(fechaInicio, 'PP', { locale: es }) : 'Seleccionar fecha'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={fechaInicio}
                      onSelect={(date) => date && setFechaInicio(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="fechaFin">Fecha de fin</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                      disabled={tipoPeriodo !== 'personalizado'}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {fechaFin ? format(fechaFin, 'PP', { locale: es }) : 'Seleccionar fecha'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={fechaFin}
                      onSelect={(date) => date && setFechaFin(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
          
          {/* Cálculos adicionales */}
          <div className="space-y-4">
            <div className="font-medium">Días y horas trabajadas</div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="diasTrabajados">Días trabajados</Label>
                <Input
                  id="diasTrabajados"
                  type="number"
                  value={diasTrabajados}
                  onChange={(e) => setDiasTrabajados(Number(e.target.value))}
                  min={0}
                  max={31}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="horasExtras">Horas extras</Label>
                <Input
                  id="horasExtras"
                  type="number"
                  value={horasExtras}
                  onChange={(e) => setHorasExtras(Number(e.target.value))}
                  min={0}
                />
              </div>
            </div>
          </div>
          
          {/* Bonificaciones */}
          <div className="space-y-4">
            <div className="font-medium">Bonificaciones adicionales</div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bonificacionNombre">Descripción</Label>
                <Input
                  id="bonificacionNombre"
                  value={nuevaBonificacion.nombre}
                  onChange={(e) => setNuevaBonificacion({...nuevaBonificacion, nombre: e.target.value})}
                  placeholder="Ej: Bono de desempeño"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bonificacionValor">Valor</Label>
                <div className="flex space-x-2">
                  <Input
                    id="bonificacionValor"
                    value={nuevaBonificacion.valor}
                    onChange={(e) => setNuevaBonificacion({...nuevaBonificacion, valor: e.target.value})}
                    placeholder="Ej: 100000"
                    type="number"
                    min={0}
                  />
                  <Button
                    type="button"
                    onClick={agregarBonificacion}
                    disabled={!nuevaBonificacion.nombre || !nuevaBonificacion.valor}
                  >
                    Agregar
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Lista de bonificaciones */}
            {bonificaciones.length > 0 && (
              <div className="border rounded-md p-4 space-y-2">
                <div className="font-medium">Bonificaciones agregadas:</div>
                <ul className="space-y-2">
                  {bonificaciones.map((bonificacion, index) => (
                    <li key={index} className="flex justify-between items-center">
                      <span>{bonificacion.nombre}</span>
                      <div className="flex items-center space-x-2">
                        <span>
                          {new Intl.NumberFormat('es-CO', { 
                            style: 'currency', 
                            currency: 'COP' 
                          }).format(bonificacion.valor)}
                        </span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => eliminarBonificacion(index)}
                        >
                          ×
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          {/* Deducciones */}
          <div className="space-y-4">
            <div className="font-medium">Deducciones adicionales</div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="deduccionNombre">Descripción</Label>
                <Input
                  id="deduccionNombre"
                  value={nuevaDeduccion.nombre}
                  onChange={(e) => setNuevaDeduccion({...nuevaDeduccion, nombre: e.target.value})}
                  placeholder="Ej: Adelanto de salario"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="deduccionValor">Valor</Label>
                <div className="flex space-x-2">
                  <Input
                    id="deduccionValor"
                    value={nuevaDeduccion.valor}
                    onChange={(e) => setNuevaDeduccion({...nuevaDeduccion, valor: e.target.value})}
                    placeholder="Ej: 50000"
                    type="number"
                    min={0}
                  />
                  <Button
                    type="button"
                    onClick={agregarDeduccion}
                    disabled={!nuevaDeduccion.nombre || !nuevaDeduccion.valor}
                  >
                    Agregar
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Lista de deducciones */}
            {deducciones.length > 0 && (
              <div className="border rounded-md p-4 space-y-2">
                <div className="font-medium">Deducciones agregadas:</div>
                <ul className="space-y-2">
                  {deducciones.map((deduccion, index) => (
                    <li key={index} className="flex justify-between items-center">
                      <span>{deduccion.nombre}</span>
                      <div className="flex items-center space-x-2">
                        <span>
                          {new Intl.NumberFormat('es-CO', { 
                            style: 'currency', 
                            currency: 'COP' 
                          }).format(deduccion.valor)}
                        </span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => eliminarDeduccion(index)}
                        >
                          ×
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={generarDesprendibleMutation.isPending}
          >
            Cancelar
          </Button>
          
          <Button 
            onClick={handleGenerarDesprendible}
            disabled={generarDesprendibleMutation.isPending}
          >
            {generarDesprendibleMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generando...
              </>
            ) : generarDesprendibleMutation.isSuccess ? (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                ¡Generado!
              </>
            ) : (
              <>
                <FileDown className="mr-2 h-4 w-4" />
                Generar Desprendible
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}