import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const capturas = [
  {
    id: 1,
    titulo: "Dashboard Principal",
    descripcion: "Vista general de métricas y KPIs en tiempo real",
    imagen: "/api/placeholder/800/450",
    categoria: "Dashboard"
  },
  {
    id: 2,
    titulo: "Gestión de Nómina",
    descripcion: "Control completo de pagos y salarios por proyecto",
    imagen: "/api/placeholder/800/450",
    categoria: "Finanzas"
  },
  {
    id: 3,
    titulo: "Proyectos y Tareas",
    descripcion: "Seguimiento detallado del progreso de proyectos",
    imagen: "/api/placeholder/800/450",
    categoria: "Proyectos"
  },
  {
    id: 4,
    titulo: "Facturación Automática",
    descripcion: "Generación y seguimiento de facturas por proyecto",
    imagen: "/api/placeholder/800/450",
    categoria: "Finanzas"
  },
  {
    id: 5,
    titulo: "Gestión de Proveedores",
    descripcion: "Control de inventario y órdenes de compra",
    imagen: "/api/placeholder/800/450",
    categoria: "Proveedores"
  }
];

export function SliderCapturas() {
  const [capturaActual, setCapturaActual] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  // Auto-play del slider
  useEffect(() => {
    if (!autoPlay) return;
    
    const interval = setInterval(() => {
      setCapturaActual((prev) => (prev + 1) % capturas.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [autoPlay]);

  const siguienteCaptura = () => {
    setCapturaActual((prev) => (prev + 1) % capturas.length);
    setAutoPlay(false);
  };

  const capturaAnterior = () => {
    setCapturaActual((prev) => (prev - 1 + capturas.length) % capturas.length);
    setAutoPlay(false);
  };

  const irACaptura = (index: number) => {
    setCapturaActual(index);
    setAutoPlay(false);
  };

  return (
    <section id="demo" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Encabezado */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Ve XTask en acción
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Explora las principales funcionalidades de nuestra plataforma
          </p>
          
          {/* Botón de video */}
          <Button
            size="lg"
            variant="outline"
            className="mb-12 border-[#251948] text-[#251948] hover:bg-[#251948] hover:text-white"
          >
            <Play className="mr-2 h-5 w-5" />
            Ver video demo (1 min)
          </Button>
        </div>

        {/* Slider principal */}
        <div className="relative">
          <Card className="overflow-hidden shadow-2xl">
            <CardContent className="p-0">
              <div className="relative h-96 md:h-[500px] overflow-hidden">
                {/* Imagen principal */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#251948] to-[#3a2a63] flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Play className="h-12 w-12" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">{capturas[capturaActual].titulo}</h3>
                    <p className="text-lg text-gray-300">{capturas[capturaActual].descripcion}</p>
                    <div className="mt-4 inline-block px-3 py-1 bg-[#02BDEA] text-white text-sm rounded-full">
                      {capturas[capturaActual].categoria}
                    </div>
                  </div>
                </div>

                {/* Controles de navegación */}
                <button
                  onClick={capturaAnterior}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-2 rounded-full transition-all"
                  aria-label="Captura anterior"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                
                <button
                  onClick={siguienteCaptura}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-2 rounded-full transition-all"
                  aria-label="Siguiente captura"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Indicadores */}
          <div className="flex justify-center mt-6 space-x-2">
            {capturas.map((_, index) => (
              <button
                key={index}
                onClick={() => irACaptura(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === capturaActual
                    ? 'bg-[#02BDEA] scale-125'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Ir a captura ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Miniaturas */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-5 gap-4">
          {capturas.map((captura, index) => (
            <Card
              key={captura.id}
              className={`cursor-pointer transition-all duration-300 ${
                index === capturaActual
                  ? 'ring-2 ring-[#02BDEA] shadow-lg scale-105'
                  : 'hover:shadow-md hover:scale-102'
              }`}
              onClick={() => irACaptura(index)}
            >
              <CardContent className="p-3">
                <div className="aspect-video bg-gradient-to-br from-[#251948] to-[#3a2a63] rounded-md mb-2 flex items-center justify-center">
                  <Play className="h-6 w-6 text-white" />
                </div>
                <h4 className="text-sm font-semibold text-gray-900 truncate">
                  {captura.titulo}
                </h4>
                <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                  {captura.descripcion}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-6">
            ¿Quieres ver una demo personalizada para tu empresa?
          </p>
          <Button
            size="lg"
            className="bg-[#02BDEA] hover:bg-[#0ea5e9] text-white px-8 py-3 rounded-lg font-semibold"
            onClick={() => document.getElementById('registro')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Solicitar demo personalizada
          </Button>
        </div>
      </div>
    </section>
  );
}