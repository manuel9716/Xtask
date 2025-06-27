import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Calculator, 
  CreditCard, 
  Receipt, 
  BarChart3, 
  FileText,
  Briefcase,
  CheckSquare,
  Calendar,
  Users,
  Package,
  ShoppingCart,
  Layers,
  Settings,
  UserCheck
} from "lucide-react";

const funcionesData = [
  {
    categoria: "Gestión Financiera",
    color: "from-blue-500 to-blue-600",
    icono: Calculator,
    modulos: [
      { nombre: "Presupuestos", descripcion: "Control completo de presupuestos por proyecto", icono: Calculator },
      { nombre: "Nómina", descripcion: "Gestión automatizada de pagos y salarios", icono: CreditCard },
      { nombre: "Facturación", descripcion: "Emisión y seguimiento de facturas", icono: Receipt },
      { nombre: "Contabilidad", descripcion: "Registro contable y reportes financieros", icono: BarChart3 },
      { nombre: "Reportes", descripcion: "Análisis financiero en tiempo real", icono: FileText }
    ]
  },
  {
    categoria: "Proyectos",
    color: "from-purple-500 to-purple-600",
    icono: Briefcase,
    modulos: [
      { nombre: "Planificación", descripcion: "Gestión completa del ciclo de vida del proyecto", icono: Briefcase },
      { nombre: "Tareas", descripcion: "Seguimiento detallado de actividades", icono: CheckSquare },
      { nombre: "Calendario", descripcion: "Programación y cronograma de actividades", icono: Calendar },
      { nombre: "Equipo", descripcion: "Colaboración y asignación de recursos", icono: Users }
    ]
  },
  {
    categoria: "Proveedores",
    color: "from-green-500 to-green-600",
    icono: Package,
    modulos: [
      { nombre: "Inventario", descripcion: "Control de stock y productos", icono: Layers },
      { nombre: "Compras", descripcion: "Gestión de órdenes y adquisiciones", icono: ShoppingCart },
      { nombre: "Catálogo", descripcion: "Base de datos de productos y servicios", icono: Package }
    ]
  },
  {
    categoria: "Administración",
    color: "from-gray-500 to-gray-600",
    icono: Settings,
    modulos: [
      { nombre: "Roles", descripcion: "Control de acceso y permisos", icono: UserCheck },
      { nombre: "Usuarios", descripcion: "Gestión de cuentas y perfiles", icono: Users },
      { nombre: "Configuración", descripcion: "Personalización del sistema", icono: Settings }
    ]
  }
];

export function FuncionesPrincipales() {
  return (
    <section id="funcionalidades" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Encabezado */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Funcionalidades principales
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Una suite completa de herramientas para cada área de tu empresa
          </p>
        </div>

        {/* Grid de categorías */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {funcionesData.map((categoria, index) => (
            <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <CardHeader className={`bg-gradient-to-r ${categoria.color} text-white`}>
                <div className="flex items-center space-x-3">
                  <categoria.icono className="h-8 w-8" />
                  <div>
                    <CardTitle className="text-2xl font-bold">{categoria.categoria}</CardTitle>
                    <CardDescription className="text-white/80">
                      {categoria.modulos.length} módulos disponibles
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid gap-4">
                  {categoria.modulos.map((modulo, moduloIndex) => (
                    <div key={moduloIndex} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex-shrink-0">
                        <modulo.icono className="h-5 w-5 text-gray-600 mt-0.5" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{modulo.nombre}</h4>
                        <p className="text-sm text-gray-600">{modulo.descripcion}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA inferior */}
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-6">
            ¿Necesitas una funcionalidad específica? Nuestro sistema es completamente modular
          </p>
          <button 
            onClick={() => document.getElementById('registro')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-[#251948] hover:bg-[#3a2a63] text-white px-8 py-3 rounded-lg font-semibold transition-colors"
          >
            Solicita una demo personalizada
          </button>
        </div>
      </div>
    </section>
  );
}