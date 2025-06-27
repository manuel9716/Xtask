import { Header } from '@/components/landing/Header';
import { HeroSection } from '@/components/landing/HeroSection';
import { FuncionesPrincipales } from '@/components/landing/FuncionesPrincipales';
import { BeneficiosGenerales } from '@/components/landing/BeneficiosGenerales';
import { SliderCapturas } from '@/components/landing/SliderCapturas';
import { TestimoniosClientes } from '@/components/landing/TestimoniosClientes';
import { PlanesYPrecios } from '@/components/landing/PlanesYPrecios';
import { FormularioRegistro } from '@/components/landing/FormularioRegistro';
import { Footer } from '@/components/landing/Footer';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <HeroSection />
      
      {/* Funcionalidades Principales */}
      <FuncionesPrincipales />
      
      {/* Beneficios Generales */}
      <BeneficiosGenerales />
      
      {/* Demo y Capturas */}
      <SliderCapturas />
      
      {/* Testimonios */}
      <TestimoniosClientes />
      
      {/* Planes y Precios */}
      <PlanesYPrecios />
      
      {/* Formulario de Registro */}
      <FormularioRegistro />
      
      {/* Footer */}
      <Footer />
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