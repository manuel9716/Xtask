import { useState, useCallback } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Check, Calendar, CreditCard, DownloadCloud, Loader2 } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter, 
  DialogTrigger
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarPicker } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { 
  CalculoNominaService, 
  ConfiguracionNomina, 
  ResultadoCalculoNomina 
} from '../../domain/services/CalculoNominaEmpleado';
import { Employee } from '@shared/schema';

interface DesprendibleNominaModalProps {
  empleado: Employee;
  trigger?: React.ReactNode;
  onNominaGenerada?: (nominaId: number) => void;
}

export default function DesprendibleNominaModal({ 
  empleado, 
  trigger, 
  onNominaGenerada 
}: DesprendibleNominaModalProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [fechaInicio, setFechaInicio] = useState<Date>(new Date());
  const [fechaFin, setFechaFin] = useState<Date>(new Date());
  const [configuracion, setConfiguracion] = useState<ConfiguracionNomina>(
    CalculoNominaService.obtenerConfiguracionPorDefecto()
  );
  const [resultadoCalculo, setResultadoCalculo] = useState<ResultadoCalculoNomina | null>(null);
  const [paso, setPaso] = useState<'configuracion' | 'vista_previa' | 'finalizado'>('configuracion');
  
  // Función para calcular la nómina
  const calcularNomina = useCallback(() => {
    try {
      const resultado = CalculoNominaService.calcularNomina(
        empleado,
        configuracion,
        fechaInicio,
        fechaFin
      );
      
      setResultadoCalculo(resultado);
      setPaso('vista_previa');
    } catch (error) {
      toast({
        title: 'Error al calcular la nómina',
        description: error instanceof Error ? error.message : 'Error desconocido',
        variant: 'destructive'
      });
    }
  }, [empleado, configuracion, fechaInicio, fechaFin, toast]);
  
  // Mutación para generar el desprendible PDF
  const { mutate: generarDesprendible, isPending: isGenerandoPDF } = useMutation({
    mutationFn: async (datos: ResultadoCalculoNomina) => {
      const response = await apiRequest('POST', '/api/finanzas/nomina/desprendible/generar', datos);
      return response.json();
    },
    onSuccess: (data) => {
      if (data.pdfUrl) {
        toast({
          title: 'Desprendible generado con éxito',
          description: 'Puedes descargar el PDF desde el botón de descarga.',
          variant: 'default'
        });
        
        setPaso('finalizado');
        
        // Si hay un handler de nómina generada, lo llamamos
        if (onNominaGenerada && data.id) {
          onNominaGenerada(data.id);
        }
      } else {
        toast({
          title: 'Error al generar el desprendible',
          description: 'No se pudo obtener la URL del PDF.',
          variant: 'destructive'
        });
      }
    },
    onError: (error) => {
      toast({
        title: 'Error al generar el desprendible',
        description: error instanceof Error ? error.message : 'Error de comunicación con el servidor',
        variant: 'destructive'
      });
    }
  });
  
  // Formatear valores monetarios
  const formatMoneda = (valor: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(valor);
  };
  
  // Formatear fecha para mostrar
  const formatFecha = (fecha: Date) => {
    return format(fecha, "dd 'de' MMMM 'de' yyyy", { locale: es });
  };
  
  // Resetear formulario al cerrar
  const handleClose = () => {
    if (!isGenerandoPDF) {
      setOpen(false);
      setTimeout(() => {
        setPaso('configuracion');
        setResultadoCalculo(null);
        setConfiguracion(CalculoNominaService.obtenerConfiguracionPorDefecto());
      }, 300);
    }
  };
  
  // Actualizar configuración para switch
  const handleSwitchChange = (field: keyof ConfiguracionNomina, value: boolean) => {
    setConfiguracion(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Actualizar configuración para valores numéricos
  const handleNumberChange = (field: keyof ConfiguracionNomina, value: string) => {
    const numericValue = value === '' ? 0 : parseFloat(value);
    
    if (!isNaN(numericValue)) {
      setConfiguracion(prev => ({
        ...prev,
        [field]: numericValue
      }));
    }
  };
  
  // Actualizar configuración de horas extra
  const handleHorasExtraChange = (field: 'cantidad' | 'valorHora', value: string) => {
    const numericValue = value === '' ? 0 : parseFloat(value);
    
    if (!isNaN(numericValue)) {
      setConfiguracion(prev => ({
        ...prev,
        aplicarHorasExtra: {
          ...(prev.aplicarHorasExtra || { cantidad: 0, valorHora: 0 }),
          [field]: numericValue
        }
      }));
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <CreditCard className="mr-2 h-4 w-4" />
            Generar Desprendible
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {paso === 'configuracion' && 'Generar Desprendible de Nómina'}
            {paso === 'vista_previa' && 'Vista Previa del Desprendible'}
            {paso === 'finalizado' && 'Desprendible Generado con Éxito'}
          </DialogTitle>
          <DialogDescription>
            {paso === 'configuracion' && 'Configura los parámetros para el cálculo de la nómina.'}
            {paso === 'vista_previa' && 'Revisa la información calculada antes de generar el desprendible.'}
            {paso === 'finalizado' && 'El desprendible ha sido generado y está listo para descargar.'}
          </DialogDescription>
        </DialogHeader>
        
        {paso === 'configuracion' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fechaInicio">Fecha de inicio del período</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {formatFecha(fechaInicio)}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarPicker
                      mode="single"
                      selected={fechaInicio}
                      onSelect={(date) => date && setFechaInicio(date)}
                      disabled={(date) => date > new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="fechaFin">Fecha de fin del período</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {formatFecha(fechaFin)}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarPicker
                      mode="single"
                      selected={fechaFin}
                      onSelect={(date) => date && setFechaFin(date)}
                      disabled={(date) => date > new Date() || date < fechaInicio}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Deducciones de Ley</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="porcentajeSalud">Porcentaje de Salud (%)</Label>
                  <Input
                    id="porcentajeSalud"
                    type="number"
                    value={configuracion.porcentajeSalud}
                    onChange={(e) => handleNumberChange('porcentajeSalud', e.target.value)}
                    min="0"
                    max="100"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="porcentajePension">Porcentaje de Pensión (%)</Label>
                  <Input
                    id="porcentajePension"
                    type="number"
                    value={configuracion.porcentajePension}
                    onChange={(e) => handleNumberChange('porcentajePension', e.target.value)}
                    min="0"
                    max="100"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="porcentajeRetencion">Retención en la Fuente (%)</Label>
                  <Input
                    id="porcentajeRetencion"
                    type="number"
                    value={configuracion.porcentajeRetencion || 0}
                    onChange={(e) => handleNumberChange('porcentajeRetencion', e.target.value)}
                    min="0"
                    max="100"
                  />
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Bonificaciones y Adicionales</h3>
              
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="aplicarBonificacion">Aplicar Bonificación (10% del salario base)</Label>
                <Switch
                  id="aplicarBonificacion"
                  checked={configuracion.aplicarBonificacion || false}
                  onCheckedChange={(checked) => handleSwitchChange('aplicarBonificacion', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="aplicarPrimaServicios">Aplicar Prima de Servicios</Label>
                <Switch
                  id="aplicarPrimaServicios"
                  checked={configuracion.aplicarPrimaServicios || false}
                  onCheckedChange={(checked) => handleSwitchChange('aplicarPrimaServicios', checked)}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="aplicarHorasExtra">Incluir Horas Extra</Label>
                  <Switch
                    id="aplicarHorasExtra"
                    checked={!!configuracion.aplicarHorasExtra}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        handleSwitchChange('aplicarHorasExtra', true);
                        if (!configuracion.aplicarHorasExtra) {
                          setConfiguracion(prev => ({
                            ...prev,
                            aplicarHorasExtra: { cantidad: 0, valorHora: 0 }
                          }));
                        }
                      } else {
                        setConfiguracion(prev => {
                          const { aplicarHorasExtra, ...rest } = prev;
                          return rest;
                        });
                      }
                    }}
                  />
                </div>
                
                {configuracion.aplicarHorasExtra && (
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div className="space-y-2">
                      <Label htmlFor="cantidadHoras">Cantidad de Horas</Label>
                      <Input
                        id="cantidadHoras"
                        type="number"
                        value={configuracion.aplicarHorasExtra.cantidad}
                        onChange={(e) => handleHorasExtraChange('cantidad', e.target.value)}
                        min="0"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="valorHora">Valor por Hora</Label>
                      <Input
                        id="valorHora"
                        type="number"
                        value={configuracion.aplicarHorasExtra.valorHora}
                        onChange={(e) => handleHorasExtraChange('valorHora', e.target.value)}
                        min="0"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {paso === 'vista_previa' && resultadoCalculo && (
          <div className="space-y-6">
            <div className="bg-slate-50 p-4 rounded-md">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Empleado</p>
                  <p className="font-medium">{resultadoCalculo.nombreEmpleado}</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Período</p>
                  <p className="font-medium">
                    {resultadoCalculo.periodo.fechaInicio} al {resultadoCalculo.periodo.fechaFin}
                  </p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Salario Base</p>
                  <p className="font-medium">{formatMoneda(resultadoCalculo.salarioBase)}</p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-3">Ingresos</h3>
                <ul className="space-y-2">
                  {resultadoCalculo.ingresos.map((ingreso, index) => (
                    <li key={index} className="flex justify-between items-center py-1 border-b">
                      <span>{ingreso.nombre}</span>
                      <span className="font-medium text-green-600">
                        {formatMoneda(ingreso.valor)}
                      </span>
                    </li>
                  ))}
                  <li className="flex justify-between items-center py-2 font-medium">
                    <span>Total Ingresos</span>
                    <span className="text-green-600">
                      {formatMoneda(resultadoCalculo.totalIngresos)}
                    </span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-3">Deducciones</h3>
                <ul className="space-y-2">
                  {resultadoCalculo.deducciones.map((deduccion, index) => (
                    <li key={index} className="flex justify-between items-center py-1 border-b">
                      <span>{deduccion.nombre}</span>
                      <span className="font-medium text-red-600">
                        {formatMoneda(deduccion.valor)}
                      </span>
                    </li>
                  ))}
                  <li className="flex justify-between items-center py-2 font-medium">
                    <span>Total Deducciones</span>
                    <span className="text-red-600">
                      {formatMoneda(resultadoCalculo.totalDeducciones)}
                    </span>
                  </li>
                </ul>
              </div>
            </div>
            
            <Separator />
            
            <div className="flex justify-between items-center py-2 font-bold text-lg">
              <span>Neto a Pagar</span>
              <span className="text-primary">
                {formatMoneda(resultadoCalculo.salarioNeto)}
              </span>
            </div>
          </div>
        )}
        
        {paso === 'finalizado' && (
          <div className="flex flex-col items-center justify-center py-6">
            <div className="bg-green-50 p-4 rounded-full mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Desprendible Generado</h3>
            <p className="text-center text-muted-foreground mb-6">
              El desprendible ha sido generado correctamente y está listo para ser descargado o compartido.
            </p>
            <Button className="w-full md:w-auto">
              <DownloadCloud className="mr-2 h-4 w-4" />
              Descargar PDF
            </Button>
          </div>
        )}
        
        <DialogFooter>
          {paso === 'configuracion' && (
            <Button onClick={calcularNomina}>
              Calcular Nómina
            </Button>
          )}
          
          {paso === 'vista_previa' && (
            <>
              <Button variant="outline" onClick={() => setPaso('configuracion')}>
                Volver a Configuración
              </Button>
              <Button 
                onClick={() => resultadoCalculo && generarDesprendible(resultadoCalculo)}
                disabled={isGenerandoPDF}
              >
                {isGenerandoPDF && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Generar Desprendible PDF
              </Button>
            </>
          )}
          
          {paso === 'finalizado' && (
            <Button variant="outline" onClick={handleClose}>
              Cerrar
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}