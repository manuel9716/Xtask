import { cn } from "@/lib/utils";
import LogoSvg from "@/assets/xtask-logo.svg";

interface LogoProps {
  className?: string;
  textClassName?: string;
  size?: "sm" | "md" | "lg";
}

export function Logo({ className, textClassName, size = "md" }: LogoProps) {
  const sizeClasses = {
    sm: "h-8",
    md: "h-10",
    lg: "h-12",
  };

  return (
    <div className={cn("flex items-center", className)}>
      <img 
        src={LogoSvg} 
        alt="XTask Logo" 
        className={cn(sizeClasses[size], "w-auto")} 
      />
    </div>
  );
}
