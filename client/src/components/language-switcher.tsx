import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Globe } from 'lucide-react';
import { cn } from "@/lib/utils";

interface LanguageSwitcherProps {
  className?: string;
}

export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('es');
  
  const languages = [
    { code: 'es', name: 'Español' },
    { code: 'en', name: 'English' },
  ];
  
  const toggleDropdown = () => setIsOpen(!isOpen);
  
  const selectLanguage = (code: string) => {
    setCurrentLanguage(code);
    setIsOpen(false);
    // Aquí implementaríamos el cambio real de idioma
  };
  
  return (
    <div className={cn("relative", className)}>
      <Button
        variant="ghost"
        className="flex items-center space-x-1 text-white"
        onClick={toggleDropdown}
      >
        <Globe className="h-4 w-4" />
        <span className="text-sm">{languages.find(l => l.code === currentLanguage)?.name}</span>
      </Button>
      
      {isOpen && (
        <div className="absolute right-0 mt-1 py-2 w-32 bg-white rounded-md shadow-lg z-50">
          {languages.map((language) => (
            <button
              key={language.code}
              className={`block px-4 py-2 text-sm w-full text-left hover:bg-gray-100 
                ${currentLanguage === language.code ? 'font-semibold text-[#251948]' : 'text-gray-700'}`}
              onClick={() => selectLanguage(language.code)}
            >
              {language.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}