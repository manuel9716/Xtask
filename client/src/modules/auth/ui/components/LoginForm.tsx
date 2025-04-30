import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

import { LoginCredentials } from '../../domain/entities/Usuario';
import { LoginUsuarioUseCase } from '../../application/useCases/loginUsuario';
import { AuthApiRepository } from '../../infrastructure/api/authApi';

// Esquema de validación para el formulario
const loginSchema = z.object({
  identifier: z
    .string()
    .min(1, 'El usuario o correo es requerido'),
  password: z
    .string()
    .min(1, 'La contraseña es requerida'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Inicializamos el caso de uso con el repositorio
  const authRepository = new AuthApiRepository();
  const loginUseCase = new LoginUsuarioUseCase(authRepository);

  // Configuramos el formulario con validación
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: '',
      password: '',
    },
  });

  // Manejador de envío del formulario
  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    
    try {
      // Convertimos los valores a las credenciales esperadas
      const credentials: LoginCredentials = {
        identifier: values.identifier,
        password: values.password,
      };
      
      // Ejecutamos el caso de uso
      const response = await loginUseCase.execute(credentials);
      
      // Notificamos el éxito
      toast({
        title: '¡Bienvenido!',
        description: `Inicio de sesión exitoso. Hola, ${response.user.fullName}`,
      });
      
      // Redirigimos al dashboard
      setTimeout(() => {
        setLocation('/dashboard');
      }, 1000);
    } catch (error) {
      // Manejamos los errores
      toast({
        variant: 'destructive',
        title: 'Error de autenticación',
        description: error instanceof Error ? error.message : 'Error al iniciar sesión',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Alternador de visibilidad de contraseña
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Iniciar Sesión</CardTitle>
        <CardDescription className="text-center">
          Ingresa tus credenciales para acceder a tu cuenta
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="identifier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Usuario o Correo Electrónico</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="usuario@ejemplo.com"
                      autoComplete="username"
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contraseña</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        autoComplete="current-password"
                        disabled={isLoading}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 text-gray-400"
                        onClick={togglePasswordVisibility}
                        disabled={isLoading}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                        <span className="sr-only">
                          {showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                        </span>
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button
              type="submit"
              className="w-full bg-[#251948] hover:bg-[#372963]"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                "Iniciar Sesión"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      
      <CardFooter className="flex flex-col space-y-4">
        <div className="text-sm text-center text-muted-foreground">
          <a
            href="#"
            className="underline underline-offset-4 hover:text-primary"
            onClick={(e) => {
              e.preventDefault();
              // Aquí iría la navegación a recuperar contraseña
              toast({
                title: "Función no disponible",
                description: "La recuperación de contraseña aún no está implementada.",
              });
            }}
          >
            ¿Olvidaste tu contraseña?
          </a>
        </div>
      </CardFooter>
    </Card>
  );
}