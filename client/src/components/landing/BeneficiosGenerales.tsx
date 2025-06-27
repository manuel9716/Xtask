import { Card, CardContent } from "@/components/ui/card";
import { 
  TrendingUp, 
  Clock, 
  Zap, 
  Target,
  Shield,
  BarChart3,
  Users2,
  CheckCircle
} from "lucide-react";

const beneficios = [
  {
    icono: TrendingUp,
    titulo: "Aumenta la eficiencia de tu equipo",
    descripcion: "Automatiza procesos repetitivos y optimiza flujos de trabajo para incrementar la productividad hasta un 40%",
    color: "text-green-600",
    bgColor: "bg-green-100"
  },
  {
    icono: BarChart3,
    titulo: "Control total del presupuesto en tiempo real",
    descripcion: "Monitorea gastos, ingresos y proyecciones financieras con dashboards actualizados al instante",
    color: "text-blue-600",
    bgColor: "bg-blue-100"
  },
  {
    icono: Zap,
    titulo: "Automatización de tareas repetitivas",
    descripcion: "Elimina trabajo manual con automatizaciones inteligentes para nómina, facturación y reportes",
    color: "text-yellow-600",
    bgColor: "bg-yellow-100"
  },
  {
    icono: Target,
    titulo: "Bonificaciones, KPIs y evaluaciones conectadas",
    descripcion: "Sistema integrado de incentivos y métricas de desempeño que motiva y retiene talento",
    color: "text-purple-600",
    bgColor: "bg-purple-100"
  },
  {
    icono: Shield,
    titulo: "Seguridad y cumplimiento garantizado",
    descripcion: "Protección de datos empresariales con estándares de seguridad internacionales",
    color: "text-red-600",
    bgColor: "bg-red-100"
  },
  {
    icono: Users2,
    titulo: "Colaboración mejorada",
    descripcion: "Herramientas de trabajo en equipo que facilitan la comunicación y coordinación",
    color: "text-indigo-600",
    bgColor: "bg-indigo-100"
  },
  {
    icono: Clock,
    titulo: "Ahorro de tiempo significativo",
    descripcion: "Reduce hasta 60% el tiempo dedicado a tareas administrativas y operativas",
    color: "text-orange-600",
    bgColor: "bg-orange-100"
  },
  {
    icono: CheckCircle,
    titulo: "Toma de decisiones basada en datos",
    descripcion: "Reportes y analytics que proporcionan insights valiosos para decisiones estratégicas",
    color: "text-emerald-600",
    bgColor: "bg-emerald-100"
  }
];

export function BeneficiosGenerales() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Encabezado */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Beneficios clave para tu empresa
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Transforma la manera en que tu empresa opera y crece con XTask
          </p>
        </div>

        {/* Grid de beneficios */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {beneficios.map((beneficio, index) => (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <CardContent className="p-6 text-center">
                <div className={`inline-flex items-center justify-center w-16 h-16 ${beneficio.bgColor} rounded-full mb-4`}>
                  <beneficio.icono className={`h-8 w-8 ${beneficio.color}`} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {beneficio.titulo}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {beneficio.descripcion}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Sección de resultados */}
        <div className="mt-20 bg-gradient-to-r from-[#251948] to-[#3a2a63] rounded-2xl p-8 md:p-12 text-white">
          <div className="text-center">
            <h3 className="text-2xl md:text-3xl font-bold mb-8">
              Resultados comprobados por nuestros clientes
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-[#02BDEA] mb-2">40%</div>
                <div className="text-lg">Aumento en productividad</div>
                <div className="text-sm text-gray-300 mt-1">Promedio en los primeros 6 meses</div>
              </div>
              
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-[#02BDEA] mb-2">60%</div>
                <div className="text-lg">Reducción de tiempo administrativo</div>
                <div className="text-sm text-gray-300 mt-1">Automatización de procesos manuales</div>
              </div>
              
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-[#02BDEA] mb-2">25%</div>
                <div className="text-lg">Reducción de costos operativos</div>
                <div className="text-sm text-gray-300 mt-1">Optimización de recursos y procesos</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}