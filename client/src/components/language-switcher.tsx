import React from "react";
import { useTranslation } from "react-i18next";
import { Check, Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LanguageSwitcherProps {
  className?: string;
  variant?: "default" | "ghost" | "outline";
}

export function LanguageSwitcher({ className, variant = "outline" }: LanguageSwitcherProps) {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language;

  const languages = [
    { code: "es", label: t("common.spanish") },
    { code: "en", label: t("common.english") },
  ];

  const handleLanguageChange = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
    // Opcional: guarda la preferencia en localStorage
    localStorage.setItem("i18nextLng", languageCode);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size="sm" className={cn("gap-1", className)}>
          <Globe className="h-4 w-4" />
          <span className="hidden md:inline-block">
            {t("common.language")}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className="flex items-center justify-between"
          >
            <span>{language.label}</span>
            {currentLanguage === language.code && (
              <Check className="h-4 w-4 text-primary ml-2" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}