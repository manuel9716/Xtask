import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Star, Zap } from "lucide-react";

const planes = [
  {
    id: "gratuito",
    nombre: "Gratuito",
    precio: "0",
    descripcion: "Perfecto para comenzar y equipos pequeños",
    popular: false,
    caracteristicas: [
      "Hasta 5 usuarios",
      "3 proyectos activos",
      "Gestión básica de tareas",
      "Reportes básicos",
      "Soporte por email",
      "2 GB de almacenamiento"
    ],
    limitaciones: [
      "Sin nómina automatizada",
      "Sin facturación avanzada",
      "Sin integraciones"
    ],
    cta: "Comenzar gratis",
    color: "border-gray-200"
  },
  {
    id: "profesional",
    nombre: "Profesional",
    precio: "49",
    descripcion: "Para empresas en crecimiento que necesitan más funcionalidades",
    popular: true,
    caracteristicas: [
      "Hasta 25 usuarios",
      "Proyectos ilimitados",
      "Nómina automatizada",
      "Facturación avanzada",
      "Gestión de proveedores",
      "Reportes avanzados",
      "KPIs y bonificaciones",
      "Soporte prioritario",
      "50 GB de almacenamiento",
      "Integraciones básicas"
    ],
    cta: "Prueba gratuita 14 días",
    color: "border-[#02BDEA] ring-2 ring-[#02BDEA]/20"
  },
  {
    id: "empresarial",
    nombre: "Empresarial",
    precio: "99",
    descripcion: "Solución completa para grandes organizaciones",
    popular: false,
    caracteristicas: [
      "Usuarios ilimitados",
      "Proyectos ilimitados",
      "Todas las funcionalidades",
      "API personalizada",
      "Integraciones avanzadas",
      "Soporte 24/7",
      "Almacenamiento ilimitado",
      "Backup automático",
      "Capacitación incluida",
      "Gerente de cuenta dedicado",
      "Personalización avanzada",
      "Cumplimiento normativo"
    ],
    cta: "Contactar ventas",
    color: "border-[#251948]"
  }
];

const caracteristicasComparison = [
  {
    categoria: "Usuarios y Proyectos",
    items: [
      { feature: "Número de usuarios", gratuito: "5", profesional: "25", empresarial: "Ilimitado" },
      { feature: "Proyectos activos", gratuito: "3", profesional: "Ilimitado", empresarial: "Ilimitado" },
      { feature: "Almacenamiento", gratuito: "2 GB", profesional: "50 GB", empresarial: "Ilimitado" }
    ]
  },
  {
    categoria: "Funcionalidades Principales",
    items: [
      { feature: "Gestión de tareas", gratuito: true, profesional: true, empresarial: true },
      { feature: "Nómina automatizada", gratuito: false, profesional: true, empresarial: true },
      { feature: "Facturación avanzada", gratuito: false, profesional: true, empresarial: true },
      { feature: "Gestión de proveedores", gratuito: false, profesional: true, empresarial: true },
      { feature: "KPIs y bonificaciones", gratuito: false, profesional: true, empresarial: true }
    ]
  },
  {
    categoria: "Soporte e Integraciones",
    items: [
      { feature: "Soporte por email", gratuito: true, profesional: true, empresarial: true },
      { feature: "Soporte prioritario", gratuito: false, profesional: true, empresarial: true },
      { feature: "Soporte 24/7", gratuito: false, profesional: false, empresarial: true },
      { feature: "API personalizada", gratuito: false, profesional: false, empresarial: true },
      { feature: "Integraciones", gratuito: false, profesional: "Básicas", empresarial: "Avanzadas" }
    ]
  }
];

export function PlanesYPrecios() {
  const renderFeatureValue = (value: boolean | string) => {
    if (typeof value === 'boolean') {
      return value ? (
        <Check className="h-5 w-5 text-green-600" />
      ) : (
        <span className="text-gray-400">-</span>
      );
    }
    return <span className="text-gray-700">{value}</span>;
  };

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Encabezado */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Planes y precios
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Elige el plan que mejor se adapte a las necesidades de tu empresa
          </p>
        </div>

        {/* Cards de planes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {planes.map((plan) => (
            <Card key={plan.id} className={`relative ${plan.color} ${plan.popular ? 'scale-105' : ''}`}>
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-[#02BDEA] text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center">
                    <Star className="h-4 w-4 mr-1" />
                    Más popular
                  </div>
                </div>
              )}
              
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-2xl font-bold text-gray-900">{plan.nombre}</CardTitle>
                <CardDescription className="text-gray-600">{plan.descripcion}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">${plan.precio}</span>
                  <span className="text-gray-600">/mes</span>
                </div>
              </CardHeader>
              
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.caracteristicas.map((caracteristica, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{caracteristica}</span>
                    </li>
                  ))}
                </ul>
                
                {plan.limitaciones && (
                  <div className="mb-6">
                    <p className="text-sm text-gray-500 mb-2">No incluye:</p>
                    <ul className="space-y-1">
                      {plan.limitaciones.map((limitacion, index) => (
                        <li key={index} className="flex items-start text-sm text-gray-500">
                          <span className="mr-2">•</span>
                          <span>{limitacion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <Button 
                  className={`w-full ${
                    plan.popular 
                      ? 'bg-[#02BDEA] hover:bg-[#0ea5e9] text-white' 
                      : 'bg-[#251948] hover:bg-[#3a2a63] text-white'
                  }`}
                  onClick={() => document.getElementById('registro')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  {plan.cta}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabla de comparación */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-[#251948] text-white p-6 text-center">
            <h3 className="text-2xl font-bold mb-2">Comparación detallada</h3>
            <p className="text-gray-300">Todas las funcionalidades lado a lado</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Funcionalidad</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Gratuito</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                    <div className="flex items-center justify-center">
                      <Zap className="h-4 w-4 text-[#02BDEA] mr-1" />
                      Profesional
                    </div>
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Empresarial</th>
                </tr>
              </thead>
              <tbody>
                {caracteristicasComparison.map((categoria, catIndex) => (
                  <>
                    <tr key={`cat-${catIndex}`} className="bg-gray-100">
                      <td colSpan={4} className="px-6 py-3 text-sm font-semibold text-gray-700">
                        {categoria.categoria}
                      </td>
                    </tr>
                    {categoria.items.map((item, itemIndex) => (
                      <tr key={`item-${catIndex}-${itemIndex}`} className="border-b border-gray-200">
                        <td className="px-6 py-4 text-sm text-gray-900">{item.feature}</td>
                        <td className="px-6 py-4 text-center">
                          {renderFeatureValue(item.gratuito)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {renderFeatureValue(item.profesional)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {renderFeatureValue(item.empresarial)}
                        </td>
                      </tr>
                    ))}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ rápido */}
        <div className="mt-12 text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Preguntas frecuentes</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="text-left">
              <h4 className="font-semibold text-gray-900 mb-2">¿Puedo cambiar de plan en cualquier momento?</h4>
              <p className="text-gray-600 text-sm">Sí, puedes actualizar o reducir tu plan cuando lo necesites.</p>
            </div>
            <div className="text-left">
              <h4 className="font-semibold text-gray-900 mb-2">¿Hay compromiso de permanencia?</h4>
              <p className="text-gray-600 text-sm">No, puedes cancelar tu suscripción en cualquier momento.</p>
            </div>
            <div className="text-left">
              <h4 className="font-semibold text-gray-900 mb-2">¿Incluye soporte técnico?</h4>
              <p className="text-gray-600 text-sm">Todos los planes incluyen soporte, con diferentes niveles de atención.</p>
            </div>
            <div className="text-left">
              <h4 className="font-semibold text-gray-900 mb-2">¿Los datos están seguros?</h4>
              <p className="text-gray-600 text-sm">Sí, utilizamos encriptación de nivel bancario y backups automáticos.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}