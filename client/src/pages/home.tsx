import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { ChevronRight } from 'lucide-react';
import { useLocation } from 'wouter';
import { HomeHeader } from '@/components/home-header';

interface SelectedModule {
  nombre: string;
  seccion: string;
  ruta: string;
  icono: string;
}

// Datos de los módulos
const modulesData = [
  {
    seccion: "financiero",
    items: [
      { nombre: "Facturación", icono: "receipt", ruta: "/finances" },
      { nombre: "Contabilidad", icono: "bar-chart-3", ruta: "/finances" },
      { nombre: "Nómina", icono: "credit-card", ruta: "/nomina" },
      { nombre: "Presupuestos", icono: "calculator", ruta: "/finances" },
      { nombre: "Reportes", icono: "file-text", ruta: "/finances" },
    ]
  },
  {
    seccion: "proyectos",
    items: [
      { nombre: "Gestión de Proyectos", icono: "briefcase", ruta: "/projects" },
      { nombre: "Seguimiento de Tareas", icono: "check-square", ruta: "/tasks" },
      { nombre: "Calendario", icono: "calendar", ruta: "/projects" },
      { nombre: "Equipo", icono: "users", ruta: "/projects" },
    ]
  },
  {
    seccion: "proveedores",
    items: [
      { nombre: "Catálogo", icono: "package", ruta: "/suppliers" },
      { nombre: "Órdenes de Compra", icono: "shopping-cart", ruta: "/suppliers" },
      { nombre: "Inventario", icono: "layers", ruta: "/suppliers" },
    ]
  },
  {
    seccion: "administracion",
    items: [
      { nombre: "Usuarios", icono: "users", ruta: "/user-management" },
      { nombre: "Configuración", icono: "settings", ruta: "/settings" },
    ]
  }
];

export default function HomePage() {
  const [selectedModules, setSelectedModules] = useState<SelectedModule[]>([]);
  const [, setLocation] = useLocation();

  // Manejar la selección de un módulo
  const handleSelectModule = (module: { nombre: string, icono: string, ruta: string }, selected: boolean, seccion: string) => {
    if (selected) {
      // Comprobamos si ya existe en las selecciones para evitar duplicados
      if (!selectedModules.some(m => m.nombre === module.nombre && m.seccion === seccion)) {
        setSelectedModules(prev => [...prev, { ...module, seccion }]);
      }
    } else {
      // Eliminamos el módulo de la selección
      setSelectedModules(prev => prev.filter(m => !(m.nombre === module.nombre && m.seccion === seccion)));
    }
  };

  // Limpiar todas las selecciones
  const handleClearAllSelections = () => {
    setSelectedModules([]);
  };

  // Comprobar si un módulo está seleccionado
  const isModuleSelected = (nombre: string, seccion: string) => {
    return selectedModules.some(m => m.nombre === nombre && m.seccion === seccion);
  };

  // Navegar a la primera selección o dashboard
  const handleContinue = () => {
    if (selectedModules.length > 0) {
      setLocation(selectedModules[0].ruta);
    } else {
      setLocation('/');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <HomeHeader />
      
      {/* Banner */}
      <div className="text-center py-16 bg-[#251948] w-full text-white">
        <h1 className="text-4xl mb-3 font-bold">XTask</h1>
        <p className="text-xl">Plataforma de Gestión Empresarial</p>
        <p className="mt-6 max-w-3xl mx-auto text-gray-300">
          Una solución integral para la gestión de tu empresa. Selecciona los módulos que necesitas y comienza a utilizar la plataforma de inmediato.
        </p>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Panel de Módulos Seleccionados - Fijo a la derecha */}
        {selectedModules.length > 0 && (
          <div className="fixed right-10 top-32 bg-white rounded-lg shadow-xl p-5 w-60 z-10">
            {/* Botón de cerrar */}
            <button 
              onClick={handleClearAllSelections}
              className="absolute -top-3 -right-3 bg-[#251948] text-white rounded-full w-7 h-7 flex items-center justify-center hover:bg-[#3a2a63] transition-colors"
              aria-label="Cerrar"
            >
              <span className="sr-only">Cerrar</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>

            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg uppercase text-[#251948] flex items-center">
                <span className="text-xl mr-2">{selectedModules.length}</span>
                <span>Módulos</span>
              </h3>
            </div>

            <ul className="mb-4 space-y-2 max-h-48 overflow-y-auto">
              {selectedModules.map((module, index) => (
                <li key={`selected-${index}-${module.nombre}`} className="flex items-center text-sm">
                  <span className="w-2 h-2 bg-[#251948] mr-2 rounded-full"></span>
                  <span className="font-medium">{module.nombre}</span>
                  <span className="text-gray-500 text-xs ml-1">({module.seccion})</span>
                </li>
              ))}
            </ul>

            <div className="bg-[#e6f8fb] p-3 rounded-md text-sm text-[#01727e] mb-4">
              Selecciona los módulos que deseas utilizar en tu plataforma. Puedes comenzar con un plan gratuito.
            </div>

            <Button 
              className="w-full bg-[#02BDEA] hover:bg-[#01a0c8] text-white flex items-center justify-center"
              onClick={handleContinue}
            >
              Continuar <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Módulos por sección */}
        {modulesData.map((moduleSection) => (
          <div key={moduleSection.seccion} className="mb-12">
            <h2 className="text-xl mb-6 text-[#251948] border-b pb-2 border-[#02BDEA]/20 font-bold uppercase">
              {moduleSection.seccion === "financiero" && "Gestión Financiera"}
              {moduleSection.seccion === "proyectos" && "Gestión de Proyectos"}
              {moduleSection.seccion === "proveedores" && "Gestión de Proveedores"}
              {moduleSection.seccion === "administracion" && "Administración"}
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {moduleSection.items.map((item) => (
                <ModuleCard 
                  key={`${moduleSection.seccion}-${item.nombre}`} 
                  nombre={item.nombre} 
                  icono={item.icono}
                  ruta={item.ruta}
                  onSelect={(module, selected) => handleSelectModule(module, selected, moduleSection.seccion)}
                  selected={isModuleSelected(item.nombre, moduleSection.seccion)}
                />
              ))}
            </div>
          </div>
        ))}

        {/* Botón para comenzar - Solo visible si no hay selecciones */}
        {selectedModules.length === 0 && (
          <div className="mt-16 flex justify-center">
            <Button 
              className="bg-[#02BDEA] hover:bg-[#01a0c8] text-white px-8 py-6 text-lg rounded-lg shadow-lg"
              onClick={() => setLocation('/dashboard')}
            >
              Ir al Dashboard <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-[#251948] text-white py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-6 md:mb-0">
              <h3 className="text-xl font-bold mb-2">XTask</h3>
              <p className="text-gray-300">Plataforma integral de gestión empresarial</p>
            </div>
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
              <div>
                <h4 className="text-sm font-semibold mb-3 uppercase">Empresa</h4>
                <ul className="space-y-2 text-sm">
                  <li><a href="#" className="text-gray-300 hover:text-white">Sobre nosotros</a></li>
                  <li><a href="#" className="text-gray-300 hover:text-white">Clientes</a></li>
                  <li><a href="#" className="text-gray-300 hover:text-white">Testimonios</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-semibold mb-3 uppercase">Recursos</h4>
                <ul className="space-y-2 text-sm">
                  <li><a href="#" className="text-gray-300 hover:text-white">Centro de ayuda</a></li>
                  <li><a href="#" className="text-gray-300 hover:text-white">Documentación</a></li>
                  <li><a href="#" className="text-gray-300 hover:text-white">Tutoriales</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-semibold mb-3 uppercase">Legal</h4>
                <ul className="space-y-2 text-sm">
                  <li><a href="#" className="text-gray-300 hover:text-white">Política de privacidad</a></li>
                  <li><a href="#" className="text-gray-300 hover:text-white">Términos de servicio</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-gray-700 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-400">© 2025 XTask. Todos los derechos reservados.</p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white">
                <span className="sr-only">Twitter</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <span className="sr-only">LinkedIn</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd"></path>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Componente ModuleCard
interface ModuleCardProps {
  nombre: string;
  icono: string;
  ruta: string;
  onSelect?: (module: { nombre: string, icono: string, ruta: string }, selected: boolean) => void;
  selected?: boolean;
}

function ModuleCard({ nombre, icono, ruta, onSelect, selected = false }: ModuleCardProps) {
  const [isSelected, setIsSelected] = useState(selected);
  
  // Actualizar el estado cuando cambia la prop selected
  useEffect(() => {
    setIsSelected(selected);
  }, [selected]);
  
  // Función para obtener el componente de icono correcto
  const getIcon = () => {
    switch (icono) {
      case 'receipt':
        return <ReceiptIcon className="h-5 w-5 stroke-[#02BDEA]" />;
      case 'bar-chart-3':
        return <BarChart3Icon className="h-5 w-5 stroke-[#02BDEA]" />;
      case 'credit-card':
        return <CreditCardIcon className="h-5 w-5 stroke-[#02BDEA]" />;
      case 'calculator':
        return <CalculatorIcon className="h-5 w-5 stroke-[#02BDEA]" />;
      case 'file-text':
        return <FileTextIcon className="h-5 w-5 stroke-[#02BDEA]" />;
      case 'briefcase':
        return <BriefcaseIcon className="h-5 w-5 stroke-[#02BDEA]" />;
      case 'check-square':
        return <CheckSquareIcon className="h-5 w-5 stroke-[#02BDEA]" />;
      case 'calendar':
        return <CalendarIcon className="h-5 w-5 stroke-[#02BDEA]" />;
      case 'users':
        return <UsersIcon className="h-5 w-5 stroke-[#02BDEA]" />;
      case 'package':
        return <PackageIcon className="h-5 w-5 stroke-[#02BDEA]" />;
      case 'shopping-cart':
        return <ShoppingCartIcon className="h-5 w-5 stroke-[#02BDEA]" />;
      case 'layers':
        return <LayersIcon className="h-5 w-5 stroke-[#02BDEA]" />;
      case 'settings':
        return <SettingsIcon className="h-5 w-5 stroke-[#02BDEA]" />;
      default:
        return <PackageIcon className="h-5 w-5 stroke-[#02BDEA]" />;
    }
  };
  
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newState = e.target.checked;
    setIsSelected(newState);
    if (onSelect) {
      onSelect({ nombre, icono, ruta }, newState);
    }
  };
  
  const handleClick = (e: React.MouseEvent) => {
    // Evitar que el clic en el checkbox propague al div contenedor
    if ((e.target as HTMLElement).closest('input[type="checkbox"]')) {
      return;
    }
    
    // Si no hay callback de selección, navegar directamente
    if (!onSelect) {
      window.location.href = ruta;
    } else {
      // Si hay callback, alternar la selección
      const newSelectedState = !isSelected;
      setIsSelected(newSelectedState);
      onSelect({ nombre, icono, ruta }, newSelectedState);
    }
  };
  
  return (
    <div 
      onClick={handleClick}
      className={`bg-white p-3 rounded-lg shadow-sm hover:shadow transition-all cursor-pointer border relative flex items-center w-full h-[60px]
      ${isSelected ? 'border-[#02BDEA] ring-1 ring-[#02BDEA]/20' : 'border-gray-200 hover:border-[#02BDEA]/30'}`}
    >
      {/* Checkbox en la esquina derecha */}
      <div className="absolute right-3 z-10">
        <input 
          type="checkbox"
          checked={isSelected}
          onChange={handleCheckboxChange}
          className="h-4 w-4 text-[#02BDEA] border-gray-300 rounded focus:ring-[#02BDEA]"
        />
      </div>
      
      <div className="flex items-center gap-3 py-1">
        <div className="bg-[#251948] p-2 rounded-lg flex items-center justify-center shadow-inner" style={{ width: '40px', height: '40px' }}>
          {getIcon()}
        </div>
        <span className="font-medium text-gray-800 text-left text-sm leading-tight">{nombre}</span>
      </div>
    </div>
  );
}

// Iconos
import {
  Receipt as ReceiptIcon,
  BarChart3 as BarChart3Icon,
  CreditCard as CreditCardIcon,
  Calculator as CalculatorIcon,
  FileText as FileTextIcon,
  Briefcase as BriefcaseIcon,
  CheckSquare as CheckSquareIcon,
  Calendar as CalendarIcon,
  Users as UsersIcon,
  Package as PackageIcon,
  ShoppingCart as ShoppingCartIcon,
  Layers as LayersIcon,
  Settings as SettingsIcon
} from 'lucide-react';