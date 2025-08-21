import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Calculator, FileText, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { EmpleadosColombiaApi } from "../services/empleados.api";

interface EmpleadoData {
  firstName: string;
  lastName: string;
  identification: string;
  phoneNumber: string;
  position: string;
  department: string;
  tipoContrato: string;
  salary?: number;
  salarioPorHora?: number;
  horasPorSemana?: number;
  honorarios?: number;
  claseRiesgoARL: string;
  auxilioTransporte: boolean;
  eps: string;
  pensiones: string;
  arl: string;
  cajaCompensacion: string;
  retencionFuente?: number;
  baseBenefits?: number;
}

interface EmpleadoColombiaSimpleProps {
  empleado?: EmpleadoData;
  onSubmit: (data: EmpleadoData) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

export function EmpleadoColombiaSimple({ empleado, onSubmit, onCancel, isEditing = false }: EmpleadoColombiaSimpleProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<EmpleadoData>({
    firstName: empleado?.firstName || "",
    lastName: empleado?.lastName || "",
    identification: empleado?.identification || "",
    phoneNumber: empleado?.phoneNumber || "",
    position: empleado?.position || "",
    department: empleado?.department || "",
    tipoContrato: empleado?.tipoContrato || "indefinido",
    claseRiesgoARL: empleado?.claseRiesgoARL || "1",
    auxilioTransporte: empleado?.auxilioTransporte || false,
    eps: empleado?.eps || "",
    pensiones: empleado?.pensiones || "",
    arl: empleado?.arl || "",
    cajaCompensacion: empleado?.cajaCompensacion || "",
    ...empleado
  });

  const [validacionSalario, setValidacionSalario] = useState<any>(null);
  const [calculandoValidacion, setCalculandoValidacion] = useState(false);

  const handleInputChange = (field: keyof EmpleadoData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Validar salario si es un campo relevante
    if (['tipoContrato', 'salary', 'salarioPorHora', 'horasPorSemana', 'honorarios'].includes(field)) {
      validarSalario({ ...formData, [field]: value });
    }
  };

  const validarSalario = async (data: EmpleadoData) => {
    if (!data.tipoContrato) return;
    
    let valor = 0;
    switch (data.tipoContrato) {
      case "indefinido":
      case "fijo":
        valor = Number(data.salary || 0);
        break;
      case "por_horas":
        valor = Number(data.salarioPorHora || 0);
        break;
      case "prestacion_servicios":
        valor = Number(data.honorarios || 0);
        break;
    }

    if (valor > 0) {
      setCalculandoValidacion(true);
      try {
        const resultado = await EmpleadosColombiaApi.validarSalarioMinimo(
          data.tipoContrato, 
          valor, 
          data.horasPorSemana
        );
        setValidacionSalario(resultado);
      } catch (error) {
        console.error("Error validando salario:", error);
      } finally {
        setCalculandoValidacion(false);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones básicas
    if (!formData.firstName || !formData.lastName || !formData.identification) {
      toast({
        title: "Error de validación",
        description: "Nombre, apellido e identificación son requeridos",
        variant: "destructive"
      });
      return;
    }

    if (!formData.position || !formData.department) {
      toast({
        title: "Error de validación", 
        description: "Cargo y departamento son requeridos",
        variant: "destructive"
      });
      return;
    }

    // Validar según tipo de contrato
    switch (formData.tipoContrato) {
      case "indefinido":
      case "fijo":
        if (!formData.salary) {
          toast({
            title: "Error de validación",
            description: "El salario base es requerido para contratos indefinidos/fijos",
            variant: "destructive"
          });
          return;
        }
        break;
      case "por_horas":
        if (!formData.salarioPorHora || !formData.horasPorSemana) {
          toast({
            title: "Error de validación",
            description: "Salario por hora y horas por semana son requeridos",
            variant: "destructive"
          });
          return;
        }
        break;
      case "prestacion_servicios":
        if (!formData.honorarios) {
          toast({
            title: "Error de validación",
            description: "Los honorarios son requeridos para prestación de servicios",
            variant: "destructive"
          });
          return;
        }
        break;
    }

    onSubmit(formData);
  };

  const renderCamposSalario = () => {
    switch (formData.tipoContrato) {
      case "indefinido":
      case "fijo":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="salary">Salario Base *</Label>
              <Input
                id="salary"
                type="number"
                placeholder="1300000"
                value={formData.salary || ""}
                onChange={(e) => handleInputChange("salary", e.target.value ? Number(e.target.value) : undefined)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bonificaciones">Bonificaciones</Label>
              <Input
                id="bonificaciones"
                type="number"
                placeholder="100000"
                value={formData.baseBenefits || ""}
                onChange={(e) => handleInputChange("baseBenefits", e.target.value ? Number(e.target.value) : undefined)}
              />
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <Label>Auxilio de Transporte</Label>
                <p className="text-sm text-muted-foreground">$162,000 (2024)</p>
              </div>
              <Switch
                checked={formData.auxilioTransporte}
                onCheckedChange={(value) => handleInputChange("auxilioTransporte", value)}
              />
            </div>
          </>
        );

      case "por_horas":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="salarioPorHora">Salario por Hora *</Label>
              <Input
                id="salarioPorHora"
                type="number"
                placeholder="5500"
                value={formData.salarioPorHora || ""}
                onChange={(e) => handleInputChange("salarioPorHora", e.target.value ? Number(e.target.value) : undefined)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="horasPorSemana">Horas por Semana * (máx. 48)</Label>
              <Input
                id="horasPorSemana"
                type="number"
                max="48"
                placeholder="40"
                value={formData.horasPorSemana || ""}
                onChange={(e) => handleInputChange("horasPorSemana", e.target.value ? Number(e.target.value) : undefined)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bonificacionesProporcionales">Bonificaciones Proporcionales</Label>
              <Input
                id="bonificacionesProporcionales"
                type="number"
                placeholder="50000"
                value={formData.baseBenefits || ""}
                onChange={(e) => handleInputChange("baseBenefits", e.target.value ? Number(e.target.value) : undefined)}
              />
            </div>
          </>
        );

      case "prestacion_servicios":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="honorarios">Honorarios *</Label>
              <Input
                id="honorarios"
                type="number"
                placeholder="2000000"
                value={formData.honorarios || ""}
                onChange={(e) => handleInputChange("honorarios", e.target.value ? Number(e.target.value) : undefined)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="retencionFuente">Retención en la Fuente (%)</Label>
              <Input
                id="retencionFuente"
                type="number"
                step="0.1"
                max="100"
                placeholder="10"
                value={formData.retencionFuente || ""}
                onChange={(e) => handleInputChange("retencionFuente", e.target.value ? Number(e.target.value) : undefined)}
              />
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Información Personal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Información Personal
          </CardTitle>
          <CardDescription>Datos básicos del empleado</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">Nombre *</Label>
            <Input
              id="firstName"
              placeholder="Juan"
              value={formData.firstName}
              onChange={(e) => handleInputChange("firstName", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Apellido *</Label>
            <Input
              id="lastName"
              placeholder="Pérez"
              value={formData.lastName}
              onChange={(e) => handleInputChange("lastName", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="identification">Identificación *</Label>
            <Input
              id="identification"
              placeholder="12345678"
              value={formData.identification}
              onChange={(e) => handleInputChange("identification", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Teléfono</Label>
            <Input
              id="phoneNumber"
              placeholder="3001234567"
              value={formData.phoneNumber}
              onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="position">Cargo *</Label>
            <Input
              id="position"
              placeholder="Desarrollador"
              value={formData.position}
              onChange={(e) => handleInputChange("position", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="department">Departamento *</Label>
            <Input
              id="department"
              placeholder="Desarrollo"
              value={formData.department}
              onChange={(e) => handleInputChange("department", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Información Contractual */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Información Contractual
          </CardTitle>
          <CardDescription>Tipo de contrato y configuración salarial</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tipoContrato">Tipo de Contrato *</Label>
            <Select value={formData.tipoContrato} onValueChange={(value) => handleInputChange("tipoContrato", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona el tipo de contrato" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="indefinido">Indefinido</SelectItem>
                <SelectItem value="fijo">Fijo por obra o labor</SelectItem>
                <SelectItem value="prestacion_servicios">Prestación de servicios</SelectItem>
                <SelectItem value="por_horas">Por horas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {renderCamposSalario()}

          <div className="space-y-2">
            <Label htmlFor="claseRiesgoARL">Clase de Riesgo ARL *</Label>
            <Select value={formData.claseRiesgoARL} onValueChange={(value) => handleInputChange("claseRiesgoARL", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona la clase de riesgo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Clase I - Riesgo Mínimo</SelectItem>
                <SelectItem value="2">Clase II - Riesgo Bajo</SelectItem>
                <SelectItem value="3">Clase III - Riesgo Medio</SelectItem>
                <SelectItem value="4">Clase IV - Riesgo Alto</SelectItem>
                <SelectItem value="5">Clase V - Riesgo Máximo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Seguridad Social */}
      <Card>
        <CardHeader>
          <CardTitle>Seguridad Social</CardTitle>
          <CardDescription>Información de EPS, fondo de pensiones y ARL</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="eps">EPS</Label>
            <Input
              id="eps"
              placeholder="Sura EPS"
              value={formData.eps}
              onChange={(e) => handleInputChange("eps", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pensiones">Fondo de Pensiones</Label>
            <Input
              id="pensiones"
              placeholder="Porvenir"
              value={formData.pensiones}
              onChange={(e) => handleInputChange("pensiones", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="arl">ARL</Label>
            <Input
              id="arl"
              placeholder="Sura ARL"
              value={formData.arl}
              onChange={(e) => handleInputChange("arl", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cajaCompensacion">Caja de Compensación</Label>
            <Input
              id="cajaCompensacion"
              placeholder="Compensar"
              value={formData.cajaCompensacion}
              onChange={(e) => handleInputChange("cajaCompensacion", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Validación de Salario */}
      {validacionSalario && (
        <Card className={validacionSalario.valido ? "border-green-200" : "border-red-200"}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              <div className="space-y-1">
                <div className="font-medium">
                  {validacionSalario.valido ? "✅ Salario válido" : "⚠️ Validación de salario"}
                </div>
                <div className="text-sm">{validacionSalario.mensaje}</div>
                {!validacionSalario.valido && (
                  <div className="text-sm text-muted-foreground">
                    Salario mínimo legal: ${validacionSalario.salarioMinimo?.toLocaleString('es-CO')}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Botones de Acción */}
      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={calculandoValidacion}>
          {isEditing ? "Actualizar Empleado" : "Crear Empleado"}
        </Button>
      </div>
    </form>
  );
}