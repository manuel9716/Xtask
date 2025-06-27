import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Zap } from "lucide-react";

export function HeroSection() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="bg-gradient-to-br from-[#251948] via-[#3a2a63] to-[#251948] text-white py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium mb-8">
          <Zap className="w-4 h-4 mr-2" />
          Plataforma completa de gestión empresarial
        </div>

        {/* Título principal */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
          Organiza, gestiona y potencia tu empresa con{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#02BDEA] to-[#0ea5e9]">
            XTask
          </span>
        </h1>

        {/* Subtítulo */}
        <p className="text-xl sm:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
          Una plataforma modular para proyectos, finanzas y talento que simplifica la gestión empresarial
        </p>

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
          <Button
            size="lg"
            className="bg-[#02BDEA] hover:bg-[#0ea5e9] text-white px-8 py-4 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            onClick={() => scrollToSection('registro')}
          >
            Probar gratis
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          
          <Button
            variant="outline"
            size="lg"
            className="border-white/30 text-white hover:bg-white/10 px-8 py-4 text-lg font-semibold rounded-lg backdrop-blur-sm"
            onClick={() => scrollToSection('demo')}
          >
            <Play className="mr-2 h-5 w-5" />
            Ver demo interactiva
          </Button>
          
          <Button
            variant="ghost"
            size="lg"
            className="text-white hover:bg-white/10 px-8 py-4 text-lg font-semibold rounded-lg"
            onClick={() => scrollToSection('funcionalidades')}
          >
            Ver funcionalidades
          </Button>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto">
          <div className="text-center">
            <div className="text-3xl font-bold text-[#02BDEA] mb-2">500+</div>
            <div className="text-gray-300">Empresas confían en XTask</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-[#02BDEA] mb-2">98%</div>
            <div className="text-gray-300">Satisfacción del cliente</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-[#02BDEA] mb-2">40%</div>
            <div className="text-gray-300">Aumento en productividad</div>
          </div>
        </div>
      </div>
    </section>
  );
}