import { cn } from "@/lib/utils";
import XTaskLogo from "@/assets/xtask-logo.png";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";

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
    <Link href="/" className="cursor-pointer">
      <div className={cn("flex items-center gap-2", className)}>
        {/* Logo cuadrado con X */}
        <div className="bg-[#251948] flex items-center justify-center p-1 rounded w-8 h-8">
          <div className="text-[#02BDEA] font-bold text-xl">X</div>
        </div>
        
        {showText && (
          <span className={cn("font-bold tracking-tight text-white", textSize[size], textClassName)}>
            Task
          </span>
        )}
      </div>
    </Link>
  );
}
