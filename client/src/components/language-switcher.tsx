import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Globe } from 'lucide-react';
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface LanguageSwitcherProps {
  className?: string;
}

export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { i18n } = useTranslation();
  
  // Inicializar con el idioma actual
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language || 'es');
  
  const languages = [
    { code: 'es', name: 'Español' },
    { code: 'en', name: 'English' },
  ];
  
  // Actualizar cuando cambia el idioma externamente
  useEffect(() => {
    setCurrentLanguage(i18n.language);
  }, [i18n.language]);
  
  const toggleDropdown = () => setIsOpen(!isOpen);
  
  const selectLanguage = (code: string) => {
    i18n.changeLanguage(code);
    setCurrentLanguage(code);
    setIsOpen(false);
  };
  
  return (
    <div className={cn("relative", className)}>
      <Button
        variant="ghost"
        className="flex items-center space-x-1 text-gray-600"
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