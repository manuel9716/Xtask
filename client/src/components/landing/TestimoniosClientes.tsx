import { Card, CardContent } from "@/components/ui/card";
import { Star, Quote } from "lucide-react";

const testimonios = [
  {
    id: 1,
    nombre: "María González",
    cargo: "Directora de Operaciones",
    empresa: "TechStart Solutions",
    testimonio: "XTask transformó completamente nuestra gestión empresarial. Redujimos 60% el tiempo administrativo y aumentamos la productividad del equipo significativamente.",
    rating: 5,
    sector: "Tecnología",
    avatar: "MG"
  },
  {
    id: 2,
    nombre: "Carlos Rodríguez",
    cargo: "Gerente General",
    empresa: "Constructora Andina",
    testimonio: "La gestión de nómina por proyectos es excelente. Ahora podemos controlar costos laborales en tiempo real y tomar decisiones más informadas.",
    rating: 5,
    sector: "Construcción",
    avatar: "CR"
  },
  {
    id: 3,
    nombre: "Ana Martínez",
    cargo: "Coordinadora Administrativa",
    empresa: "ONG Desarrollo Social",
    testimonio: "Perfecto para organizaciones sin fines de lucro. El control de presupuestos por proyecto nos ayuda a ser más transparentes con los donantes.",
    rating: 5,
    sector: "ONG",
    avatar: "AM"
  },
  {
    id: 4,
    nombre: "Roberto Silva",
    cargo: "Jefe de Finanzas",
    empresa: "MediCorp LTDA",
    testimonio: "La automatización de facturación nos ahorró horas semanales. Los reportes financieros son claros y nos dan insights valiosos para el negocio.",
    rating: 5,
    sector: "Salud",
    avatar: "RS"
  },
  {
    id: 5,
    nombre: "Laura Vásquez",
    cargo: "Secretaria de Hacienda",
    empresa: "Alcaldía Municipal",
    testimonio: "Excelente para el sector público. La trazabilidad de gastos y la gestión de proveedores cumple con todos los requisitos normativos.",
    rating: 5,
    sector: "Gobierno",
    avatar: "LV"
  },
  {
    id: 6,
    nombre: "Diego Hernández",
    cargo: "CEO",
    empresa: "PyME Textil",
    testimonio: "Como empresa pequeña, necesitábamos una solución completa y asequible. XTask nos dio todas las herramientas que necesitamos para crecer.",
    rating: 5,
    sector: "Manufactura",
    avatar: "DH"
  }
];

const sectores = [
  { nombre: "Tecnología", count: 150, icono: "💻" },
  { nombre: "Construcción", count: 85, icono: "🏗️" },
  { nombre: "Gobierno", count: 45, icono: "🏛️" },
  { nombre: "ONG", count: 67, icono: "🤝" },
  { nombre: "Salud", count: 92, icono: "🏥" },
  { nombre: "Educación", count: 38, icono: "🎓" },
  { nombre: "Manufactura", count: 76, icono: "🏭" },
  { nombre: "Servicios", count: 112, icono: "🛠️" }
];

export function TestimoniosClientes() {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Encabezado */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Lo que dicen nuestros clientes
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Más de 500 empresas ya confían en XTask para su gestión empresarial
          </p>
        </div>

        {/* Grid de testimonios */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {testimonios.map((testimonio) => (
            <Card key={testimonio.id} className="hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                {/* Quote icon */}
                <Quote className="h-8 w-8 text-[#02BDEA] mb-4" />
                
                {/* Rating */}
                <div className="flex items-center mb-4">
                  {renderStars(testimonio.rating)}
                </div>
                
                {/* Testimonio */}
                <p className="text-gray-700 mb-6 italic leading-relaxed">
                  "{testimonio.testimonio}"
                </p>
                
                {/* Autor */}
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-[#251948] text-white rounded-full flex items-center justify-center font-semibold mr-4">
                    {testimonio.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonio.nombre}</div>
                    <div className="text-sm text-gray-600">{testimonio.cargo}</div>
                    <div className="text-sm text-[#02BDEA] font-medium">{testimonio.empresa}</div>
                  </div>
                </div>
                
                {/* Sector badge */}
                <div className="mt-4">
                  <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                    {testimonio.sector}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Sectores que usan XTask */}
        <div className="bg-gray-50 rounded-2xl p-8 md:p-12">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Sectores que confían en XTask
            </h3>
            <p className="text-gray-600">
              Nuestra plataforma se adapta a las necesidades específicas de cada industria
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {sectores.map((sector, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl mb-2">{sector.icono}</div>
                <div className="font-semibold text-gray-900">{sector.nombre}</div>
                <div className="text-2xl font-bold text-[#02BDEA]">{sector.count}+</div>
                <div className="text-sm text-gray-600">empresas</div>
              </div>
            ))}
          </div>
        </div>

        {/* Llamada a la acción */}
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-6">
            ¿Quieres ser parte de estas empresas exitosas?
          </p>
          <button
            onClick={() => document.getElementById('registro')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-[#251948] hover:bg-[#3a2a63] text-white px-8 py-3 rounded-lg font-semibold transition-colors"
          >
            Únete a XTask hoy
          </button>
        </div>
      </div>
    </section>
  );
}