import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { useLocation } from 'wouter';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAuth } from '../context/AuthContext';
import { ResetPasswordData } from '../../domain/entities/Usuario';

// Esquema de validación para el formulario
const formSchema = z.object({
  password: z.string()
    .min(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
    .regex(/[A-Z]/, { message: 'La contraseña debe contener al menos una letra mayúscula' })
    .regex(/[0-9]/, { message: 'La contraseña debe contener al menos un número' }),
  confirmPassword: z.string()
    .min(1, { message: 'Confirme su contraseña' }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

interface ResetPasswordFormProps {
  token: string;
}

/**
 * Componente para restablecer contraseña con token
 */
export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const { resetPassword, validateResetToken, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [tokenError, setTokenError] = useState<string | null>(null);

  // Validar token al cargar el componente
  useEffect(() => {
    const checkToken = async () => {
      try {
        const response = await validateResetToken(token);
        setTokenValid(response.valid);
        if (!response.valid) {
          setTokenError(response.message);
        }
      } catch (error) {
        setTokenValid(false);
        setTokenError('No se pudo validar el token. Por favor solicite un nuevo enlace.');
      }
    };

    checkToken();
  }, [token, validateResetToken]);

  // Configuración del formulario con validación
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  // Manejar envío del formulario
  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      const resetData: ResetPasswordData = {
        token,
        newPassword: data.password
      };
      
      const message = await resetPassword(resetData);
      setSuccessMessage(message);
      form.reset();
      
      // Redireccionar al login después de 3 segundos
      setTimeout(() => {
        setLocation('/auth/login');
      }, 3000);
    } catch (error) {
      // Error ya manejado en el contexto
    }
  };

  // Renderizar mensaje de error si el token no es válido
  if (tokenValid === false) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Enlace inválido</CardTitle>
          <CardDescription>
            El enlace para restablecer contraseña no es válido o ha expirado.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {tokenError || 'Por favor solicite un nuevo enlace de restablecimiento.'}
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button
            onClick={() => setLocation('/auth/forgot-password')}
          >
            Solicitar nuevo enlace
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // Renderizar spinner mientras se valida el token
  if (tokenValid === null) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Verificando enlace</CardTitle>
          <CardDescription>
            Estamos verificando la validez del enlace de restablecimiento.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Crear nueva contraseña</CardTitle>
        <CardDescription>
          Ingrese y confirme su nueva contraseña para continuar.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {successMessage ? (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
            <p>{successMessage}</p>
            <p className="text-sm mt-2">Redirigiendo al inicio de sesión...</p>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nueva contraseña</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="password" 
                        autoComplete="new-password"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmar contraseña</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="password" 
                        autoComplete="new-password"
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
                    Procesando...
                  </>
                ) : (
                  'Restablecer contraseña'
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