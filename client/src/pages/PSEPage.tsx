import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft, 
  Shield, 
  CreditCard, 
  CheckCircle, 
  Clock, 
  Building2,
  Landmark
} from 'lucide-react';

export function PSEPage() {
  const [, setLocation] = useLocation();
  const [paymentStep, setPaymentStep] = useState<'selecting' | 'processing' | 'completed'>('selecting');
  const [selectedBank, setSelectedBank] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutos en segundos

  // Obtener parámetros de la URL
  const urlParams = new URLSearchParams(window.location.search);
  const reference = urlParams.get('ref') || 'N/A';
  const amount = urlParams.get('amount') || '0';
  const concept = urlParams.get('concept') || 'Pago';

  // Lista de bancos participantes en PSE
  const banks = [
    { id: 'bancolombia', name: 'Bancolombia', logo: '🏦' },
    { id: 'banco-bogota', name: 'Banco de Bogotá', logo: '🏛️' },
    { id: 'davivienda', name: 'Davivienda', logo: '💰' },
    { id: 'bbva', name: 'BBVA Colombia', logo: '🔷' },
    { id: 'scotiabank', name: 'Scotiabank Colpatria', logo: '🏢' },
    { id: 'banco-popular', name: 'Banco Popular', logo: '🎯' },
    { id: 'banco-occidente', name: 'Banco de Occidente', logo: '💙' },
    { id: 'av-villas', name: 'Banco AV Villas', logo: '🏠' }
  ];

  const formatCOP = (amount: string) => {
    const numAmount = parseFloat(amount);
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numAmount);
  };

  // Contador regresivo
  useEffect(() => {
    if (paymentStep === 'selecting' && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [paymentStep, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleBankSelect = (bankId: string) => {
    setSelectedBank(bankId);
    setPaymentStep('processing');
    
    // Simular proceso de pago
    setTimeout(() => {
      setPaymentStep('completed');
    }, 3000);
  };

  const handleGoBack = () => {
    setLocation('/nomina/empleados');
  };

  if (paymentStep === 'processing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Clock className="h-8 w-8 text-blue-600 animate-spin" />
            </div>
            <CardTitle className="text-blue-900">Procesando Pago</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              Conectando con {banks.find(b => b.id === selectedBank)?.name}...
            </p>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Referencia:</strong> {reference}
              </p>
              <p className="text-sm text-blue-800">
                <strong>Valor:</strong> {formatCOP(amount)}
              </p>
            </div>
            <p className="text-xs text-gray-500">
              No cierre esta ventana mientras se procesa el pago
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (paymentStep === 'completed') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-green-900">¡Pago Exitoso!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Su pago ha sido procesado correctamente por PSE
              </AlertDescription>
            </Alert>
            
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Referencia PSE:</span>
                <span className="text-sm font-medium">{reference}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Valor pagado:</span>
                <span className="text-sm font-medium">{formatCOP(amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Concepto:</span>
                <span className="text-sm font-medium">{concept}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Banco:</span>
                <span className="text-sm font-medium">
                  {banks.find(b => b.id === selectedBank)?.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Fecha:</span>
                <span className="text-sm font-medium">
                  {new Date().toLocaleDateString('es-CO')} {new Date().toLocaleTimeString('es-CO')}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Button 
                onClick={handleGoBack}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Volver a Nómina
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.print()}
                className="w-full"
              >
                Imprimir Comprobante
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleGoBack}
            className="text-blue-700 hover:text-blue-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-blue-900">PSE - Pagos Seguros en Línea</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Información del pago */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                  Detalles del Pago
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-blue-700">Referencia de pago</p>
                      <p className="font-semibold text-blue-900">{reference}</p>
                    </div>
                    <div>
                      <p className="text-sm text-blue-700">Concepto</p>
                      <p className="font-semibold text-blue-900">{concept}</p>
                    </div>
                  </div>
                  <Separator className="my-3" />
                  <div className="text-center">
                    <p className="text-sm text-blue-700">Valor a pagar</p>
                    <p className="text-3xl font-bold text-blue-900">{formatCOP(amount)}</p>
                  </div>
                </div>

                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    Seleccione su banco para continuar con el pago seguro a través de PSE
                  </AlertDescription>
                </Alert>

                {/* Lista de bancos */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Seleccione su banco:</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {banks.map((bank) => (
                      <Button
                        key={bank.id}
                        variant="outline"
                        className="h-auto p-4 justify-start hover:bg-blue-50 hover:border-blue-300"
                        onClick={() => handleBankSelect(bank.id)}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{bank.logo}</span>
                          <span className="font-medium">{bank.name}</span>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Panel lateral */}
          <div className="space-y-6">
            {/* Tiempo límite */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Tiempo límite
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${timeLeft < 60 ? 'text-red-600' : 'text-blue-600'}`}>
                    {formatTime(timeLeft)}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {timeLeft < 60 ? 'La sesión expirará pronto' : 'para completar el pago'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Información de seguridad */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Seguridad
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    <Shield className="h-3 w-3 mr-1" />
                    SSL
                  </Badge>
                  <span className="text-xs text-gray-600">Conexión segura</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    <Landmark className="h-3 w-3 mr-1" />
                    PSE
                  </Badge>
                  <span className="text-xs text-gray-600">Validado por bancos</span>
                </div>
                <p className="text-xs text-gray-500">
                  Sus datos están protegidos por los más altos estándares de seguridad bancaria
                </p>
              </CardContent>
            </Card>

            {/* Ayuda */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">¿Necesita ayuda?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-gray-600 mb-3">
                  Si tiene problemas con el pago, contacte con soporte
                </p>
                <Button variant="outline" size="sm" className="w-full text-xs">
                  Contactar Soporte
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}