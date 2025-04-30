import { useState } from 'react';
import { useLocation } from 'wouter';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { LoginData } from '../../domain/entities/Usuario';

// Esquema de validación para el formulario de login
const loginSchema = z.object({
  identifier: z.string().min(3, {
    message: 'El usuario o email debe tener al menos 3 caracteres'
  }),
  password: z.string().min(5, {
    message: 'La contraseña debe tener al menos 5 caracteres'
  })
});

export function LoginForm() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { login, isLoading } = useAuth();
  const [, navigate] = useLocation();

  // Configurar formulario con react-hook-form y zod
  const form = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: '',
      password: ''
    }
  });

  // Manejar envío del formulario
  const onSubmit = async (values: LoginData) => {
    setErrorMessage(null);
    
    try {
      const success = await login(values);
      
      if (success) {
        // Navegar al dashboard tras inicio de sesión exitoso
        navigate('/dashboard');
      }
    } catch (error: any) {
      setErrorMessage(error.message || 'Error al iniciar sesión');
    }
  };

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Iniciar sesión</CardTitle>
        <CardDescription>Introduce tus credenciales para acceder a la plataforma</CardDescription>
      </CardHeader>
      <CardContent>
        {errorMessage && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="identifier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Usuario o Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="admin@xtask.com"
                      {...field}
                      disabled={isLoading}
                      autoComplete="username"
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
                    <Input
                      type="password"
                      placeholder="••••••••"
                      {...field}
                      disabled={isLoading}
                      autoComplete="current-password"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="submit" className="w-full bg-[#251948] hover:bg-[#372865]" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                'Iniciar sesión'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <div className="text-sm text-center text-gray-500">
          ¿No tienes una cuenta?{' '}
          <Button 
            variant="link" 
            className="p-0 h-auto text-[#02BDEA] hover:text-[#02a6ce]"
            onClick={() => navigate('/auth/register')}
            disabled={isLoading}
          >
            Regístrate aquí
          </Button>
        </div>
        <div className="text-xs text-center text-gray-400">
          &copy; {new Date().getFullYear()} XTask. Todos los derechos reservados.
        </div>
      </CardFooter>
    </Card>
  );
}