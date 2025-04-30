import { useTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Monitor } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-4">
      <RadioGroup
        value={theme}
        onValueChange={(value) => setTheme(value as "light" | "dark" | "system")}
        className="grid grid-cols-3 gap-4"
      >
        <Card className={`relative cursor-pointer transition-all ${theme === "light" ? "border-primary" : "border-muted hover:border-primary/50"}`}>
          <CardContent className="p-0">
            <RadioGroupItem 
              value="light" 
              id="theme-light" 
              className="sr-only" 
            />
            <Label 
              htmlFor="theme-light" 
              className="flex flex-col items-center justify-between rounded-md p-4 h-full cursor-pointer"
            >
              <Sun className="h-6 w-6 mb-2 text-amber-500" />
              <span>Claro</span>
            </Label>
          </CardContent>
        </Card>

        <Card className={`relative cursor-pointer transition-all ${theme === "dark" ? "border-primary" : "border-muted hover:border-primary/50"}`}>
          <CardContent className="p-0">
            <RadioGroupItem 
              value="dark" 
              id="theme-dark" 
              className="sr-only" 
            />
            <Label 
              htmlFor="theme-dark" 
              className="flex flex-col items-center justify-between rounded-md p-4 h-full cursor-pointer"
            >
              <Moon className="h-6 w-6 mb-2 text-indigo-500" />
              <span>Oscuro</span>
            </Label>
          </CardContent>
        </Card>

        <Card className={`relative cursor-pointer transition-all ${theme === "system" ? "border-primary" : "border-muted hover:border-primary/50"}`}>
          <CardContent className="p-0">
            <RadioGroupItem 
              value="system" 
              id="theme-system" 
              className="sr-only" 
            />
            <Label 
              htmlFor="theme-system" 
              className="flex flex-col items-center justify-between rounded-md p-4 h-full cursor-pointer"
            >
              <Monitor className="h-6 w-6 mb-2 text-green-500" />
              <span>Sistema</span>
            </Label>
          </CardContent>
        </Card>
      </RadioGroup>
    </div>
  );
}