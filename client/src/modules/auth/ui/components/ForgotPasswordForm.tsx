import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { useLocation } from 'wouter';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '../context/AuthContext';
import { ForgotPasswordData } from '../../domain/entities/Usuario';

// Esquema de validación para el formulario
const formSchema = z.object({
  email: z.string()
    .email({ message: 'Ingrese un correo electrónico válido' })
    .min(1, { message: 'El correo electrónico es requerido' }),
});

/**
 * Componente para solicitar restablecimiento de contraseña
 */
export function ForgotPasswordForm() {
  const { forgotPassword, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Configuración del formulario con validación
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
  });

  // Manejar envío del formulario
  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      const message = await forgotPassword(data as ForgotPasswordData);
      setSuccessMessage(message);
      form.reset();
    } catch (error) {
      // Error ya manejado en el contexto
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Recuperar contraseña</CardTitle>
        <CardDescription>
          Ingrese su correo electrónico para recibir un enlace de restablecimiento.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {successMessage ? (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
            <p>{successMessage}</p>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo electrónico</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="correo@ejemplo.com" 
                        {...field} 
                        type="email"
                        autoComplete="email"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  'Enviar instrucciones'
                )}
              </Button>
            </form>
          </Form>
        )}
      </CardContent>
      <CardFooter className="flex justify-center">
        <div className="text-sm text-center">
          <a 
            href="#" 
            onClick={(e) => {
              e.preventDefault();
              setLocation('/auth/login');
            }}
            className="text-[#623BA6] hover:underline"
          >
            Volver a inicio de sesión
          </a>
        </div>
      </CardFooter>
    </Card>
  );
}