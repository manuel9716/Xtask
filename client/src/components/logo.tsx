import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  textClassName?: string;
  size?: "sm" | "md" | "lg";
}

export function Logo({ className, textClassName, size = "md" }: LogoProps) {
  const sizeClasses = {
    sm: {
      container: "w-6 h-6",
      text: "text-sm",
    },
    md: {
      container: "w-8 h-8",
      text: "text-lg",
    },
    lg: {
      container: "w-10 h-10",
      text: "text-xl",
    },
  };

  return (
    <div className="flex items-center space-x-2">
      <div
        className={cn(
          "bg-primary-600 rounded-md flex items-center justify-center",
          sizeClasses[size].container,
          className
        )}
      >
        <span className="text-white font-heading font-bold">X</span>
      </div>
      <h1 className={cn("font-heading font-bold text-white", sizeClasses[size].text, textClassName)}>
        XTask
      </h1>
    </div>
  );
}
