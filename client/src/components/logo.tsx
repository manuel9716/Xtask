import { cn } from "@/lib/utils";
import XTaskLogo from "@/assets/xtask-logo.png";
import { useTranslation } from "react-i18next";

interface LogoProps {
  className?: string;
  textClassName?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export function Logo({ className, textClassName, size = "md", showText = true }: LogoProps) {
  const { t } = useTranslation();
  
  const sizeClasses = {
    sm: "h-8",
    md: "h-10",
    lg: "h-12",
  };
  
  const textSize = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <img 
        src={XTaskLogo} 
        alt={t("common.appName")} 
        className={cn(sizeClasses[size], "w-auto rounded")} 
      />
      {showText && (
        <span className={cn("font-bold tracking-tight", textSize[size], textClassName)}>
          {t("common.appName")}
        </span>
      )}
    </div>
  );
}
