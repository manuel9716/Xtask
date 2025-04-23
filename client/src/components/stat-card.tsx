import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor: string;
  iconBgColor: string;
  change?: {
    value: string | number;
    isPositive: boolean;
    text: string;
  };
  className?: string;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  iconColor,
  iconBgColor,
  change,
  className,
}: StatCardProps) {
  return (
    <div className={cn("bg-white rounded-xl p-5 shadow-sm border border-gray-100", className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium">{title}</p>
          <h3 className="text-2xl font-bold mt-1 text-gray-900">{value}</h3>
        </div>
        <div className={cn("flex items-center justify-center w-10 h-10 rounded-lg", iconBgColor)}>
          <Icon className={cn("text-xl", iconColor)} />
        </div>
      </div>
      {change && (
        <div className="flex items-center mt-3">
          <span className={cn(
            "text-xs font-medium flex items-center",
            change.isPositive ? "text-green-600" : "text-red-600"
          )}>
            {change.isPositive ? "↑" : "↓"} {change.value}
          </span>
          <span className="text-xs text-gray-400 ml-2">{change.text}</span>
        </div>
      )}
    </div>
  );
}
