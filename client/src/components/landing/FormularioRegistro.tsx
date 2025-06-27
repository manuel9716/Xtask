import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Mail, Building, User, MessageSquare, CheckCircle } from "lucide-react";

export function FormularioRegistro() {
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    empresa: "",
    telefono: "",
    sector: "",
    empleados: "",
    mensaje: "",
    aceptaTerminos: false,
    recibirNoticias: true
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const sectores = [
    "Tecnología",
    "Construcción", 
    "Gobierno",
    "ONG",
    "Salud",
    "Educación",
    "Manufactura",
    "Servicios",
    "Comercio",
    "Otro"
  ];

  const rangosEmpleados = [
    "1-10 empleados",
    "11-50 empleados", 
    "51-200 empleados",
    "201-500 empleados",
    "Más de 500 empleados"
  ];

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.aceptaTerminos) {
      alert("Debes aceptar los términos y condiciones");
      return;
    }

    setIsSubmitting(true);
    
    // Simular envío
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 2000);
  };

  if (isSubmitted) {
    return (
      <section id="registro" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-2xl mx-auto text-center">
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-12">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                ¡Registro exitoso!
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Hemos recibido tu solicitud. Nuestro equipo se pondrá en contacto contigo en las próximas 24 horas para configurar tu cuenta de prueba gratuita.
              </p>
              <div className="bg-white p-4 rounded-lg border border-green-200">
                <h3 className="font-semibold text-gray-900 mb-2">Próximos pasos:</h3>
                <ul className="text-left text-gray-600 space-y-1">
                  <li>✓ Revisaremos tus necesidades específicas</li>
                  <li>✓ Configuraremos tu cuenta personalizada</li>
                  <li>✓ Te enviaremos las credenciales de acceso</li>
                  <li>✓ Programaremos una sesión de capacitación opcional</li>
                </ul>
              </div>
              <p className="text-sm text-gray-500 mt-4">
                Revisa tu email para más información
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <section id="registro" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Información de contacto */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Comienza tu prueba gratuita
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Configura tu cuenta en minutos y descubre cómo XTask puede transformar tu empresa
            </p>
            
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="bg-[#02BDEA]/10 p-3 rounded-full">
                  <CheckCircle className="h-6 w-6 text-[#02BDEA]" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">14 días gratis</h3>
                  <p className="text-gray-600">Sin compromiso, sin tarjeta de crédito</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="bg-[#02BDEA]/10 p-3 rounded-full">
                  <User className="h-6 w-6 text-[#02BDEA]" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Configuración personalizada</h3>
                  <p className="text-gray-600">Adaptamos XTask a tu industria y necesidades</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="bg-[#02BDEA]/10 p-3 rounded-full">
                  <MessageSquare className="h-6 w-6 text-[#02BDEA]" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Soporte incluido</h3>
                  <p className="text-gray-600">Capacitación y acompañamiento durante la implementación</p>
                </div>
              </div>
            </div>
            
            <div className="mt-8 p-6 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3">¿Prefieres una llamada?</h3>
              <p className="text-gray-600 mb-4">
                Nuestro equipo está disponible para una demo personalizada
              </p>
              <Button variant="outline" className="w-full">
                Agendar llamada
              </Button>
            </div>
          </div>

          {/* Formulario */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="h-5 w-5 mr-2 text-[#02BDEA]" />
                Registro rápido
              </CardTitle>
              <CardDescription>
                Completa el formulario y comienza en menos de 5 minutos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nombre">Nombre completo *</Label>
                    <Input
                      id="nombre"
                      value={formData.nombre}
                      onChange={(e) => handleInputChange("nombre", e.target.value)}
                      placeholder="Tu nombre"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email corporativo *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="nombre@empresa.com"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="empresa">Empresa *</Label>
                    <Input
                      id="empresa"
                      value={formData.empresa}
                      onChange={(e) => handleInputChange("empresa", e.target.value)}
                      placeholder="Nombre de tu empresa"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="telefono">Teléfono</Label>
                    <Input
                      id="telefono"
                      type="tel"
                      value={formData.telefono}
                      onChange={(e) => handleInputChange("telefono", e.target.value)}
                      placeholder="+57 300 123 4567"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="sector">Sector *</Label>
                    <Select onValueChange={(value) => handleInputChange("sector", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona tu sector" />
                      </SelectTrigger>
                      <SelectContent>
                        {sectores.map((sector) => (
                          <SelectItem key={sector} value={sector}>
                            {sector}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="empleados">Número de empleados</Label>
                    <Select onValueChange={(value) => handleInputChange("empleados", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Tamaño de empresa" />
                      </SelectTrigger>
                      <SelectContent>
                        {rangosEmpleados.map((rango) => (
                          <SelectItem key={rango} value={rango}>
                            {rango}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="mensaje">Cuéntanos sobre tu empresa (opcional)</Label>
                  <Textarea
                    id="mensaje"
                    value={formData.mensaje}
                    onChange={(e) => handleInputChange("mensaje", e.target.value)}
                    placeholder="¿Qué desafíos estás enfrentando? ¿Qué esperas de XTask?"
                    rows={3}
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="terminos"
                      checked={formData.aceptaTerminos}
                      onCheckedChange={(checked) => handleInputChange("aceptaTerminos", checked as boolean)}
                    />
                    <Label htmlFor="terminos" className="text-sm">
                      Acepto los{" "}
                      <a href="#" className="text-[#02BDEA] hover:underline">
                        términos y condiciones
                      </a>{" "}
                      y la{" "}
                      <a href="#" className="text-[#02BDEA] hover:underline">
                        política de privacidad
                      </a>{" "}
                      *
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="noticias"
                      checked={formData.recibirNoticias}
                      onCheckedChange={(checked) => handleInputChange("recibirNoticias", checked as boolean)}
                    />
                    <Label htmlFor="noticias" className="text-sm">
                      Quiero recibir noticias y actualizaciones de XTask
                    </Label>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#02BDEA] hover:bg-[#0ea5e9] text-white py-3"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Procesando..." : "Crear cuenta gratuita"}
                </Button>

                <div className="text-center">
                  <p className="text-sm text-gray-500">
                    Al registrarte, comenzarás tu prueba gratuita de 14 días
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}