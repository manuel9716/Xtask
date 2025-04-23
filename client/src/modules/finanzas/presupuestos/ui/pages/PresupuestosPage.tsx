import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlusCircle, 
  Search, 
  Filter, 
  FileUp, 
  Download,
  X,
  Loader2
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

import { EstadoPresupuesto, PeriodoBudget, Presupuesto } from '../../domain/entities/Presupuesto';
import { useListarPresupuestos } from '../../application/useListarPresupuestos';
import { PresupuestoTable } from '../components/PresupuestoTable';
import { PresupuestoForm } from '../forms/PresupuestoForm';
import { PresupuestoPdfGenerator } from '../../infrastructure/utils/pdfGenerator';

/**
 * Página principal del submódulo de Presupuestos
 */
export const PresupuestosPage: React.FC = () => {
  const { t } = useTranslation();
  const pdfGenerator = new PresupuestoPdfGenerator();
  
  // Estados para la UI
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArea, setSelectedArea] = useState<string>('');
  const [selectedPeriodo, setSelectedPeriodo] = useState<string>('');
  const [selectedEstado, setSelectedEstado] = useState<string>('');
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [csvContent, setCsvContent] = useState('');
  const [selectedPresupuesto, setSelectedPresupuesto] = useState<Presupuesto | null>(null);
  
  // Obtener presupuestos con React Query
  const { 
    presupuestos, 
    isLoading, 
    isError,
    error,
    refetch,
    getUniqueAreas
  } = useListarPresupuestos(1, {
    search: searchTerm,
    area: selectedArea,
    periodo: selectedPeriodo,
    estado: selectedEstado
  });
  
  // Áreas únicas para el filtro
  const uniqueAreas = getUniqueAreas();
  
  // Resetear todos los filtros
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedArea('');
    setSelectedPeriodo('');
    setSelectedEstado('');
  };
  
  // Manejadores de eventos
  const handleEdit = (presupuesto: Presupuesto) => {
    setSelectedPresupuesto(presupuesto);
    setShowEdit(true);
  };
  
  const handleView = (presupuesto: Presupuesto) => {
    setSelectedPresupuesto(presupuesto);
    setShowDetail(true);
  };
  
  const handleExport = (presupuesto: Presupuesto) => {
    const pdfUrl = pdfGenerator.generatePresupuestoPdf(presupuesto);
    
    // Crear un enlace temporal para descargar el PDF
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `Presupuesto_${presupuesto.nombre}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleExportAll = () => {
    const pdfUrl = pdfGenerator.generatePresupuestosListPdf(presupuestos);
    
    // Crear un enlace temporal para descargar el PDF
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = 'Listado_Presupuestos.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setCsvContent(content);
    };
    reader.readAsText(file);
  };
  
  const handleImport = () => {
    // Implementar la importación de CSV
    // En un caso real, haríamos:
    // presupuestoRepository.importarDesdeCSV(csvContent, 1);
    setShowImport(false);
    setCsvContent('');
  };
  
  return (
    <div className="container space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t('finances.budgets.title')}
          </h1>
          <p className="text-muted-foreground">
            {t('finances.budgets.subtitle')}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={() => setShowCreate(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            {t('finances.budgets.actions.create')}
          </Button>
          
          <Button variant="outline" onClick={() => setShowImport(true)}>
            <FileUp className="mr-2 h-4 w-4" />
            {t('finances.budgets.actions.import')}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleExportAll}
            disabled={presupuestos.length === 0}
          >
            <Download className="mr-2 h-4 w-4" />
            {t('finances.budgets.actions.export')}
          </Button>
        </div>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-4 items-end"
      >
        {/* Búsqueda */}
        <div className="flex-1">
          <Input
            placeholder={t('finances.budgets.search')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
            icon={<Search className="mr-2 h-4 w-4" />}
          />
        </div>
        
        {/* Filtros */}
        <div className="flex flex-wrap gap-2">
          {/* Filtro por Área */}
          <Select value={selectedArea} onValueChange={setSelectedArea}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t('finances.budgets.filters.area')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">{t('finances.budgets.filters.allAreas')}</SelectItem>
              {uniqueAreas.map(area => (
                <SelectItem key={area} value={area}>{area}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {/* Filtro por Periodo */}
          <Select value={selectedPeriodo} onValueChange={setSelectedPeriodo}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t('finances.budgets.filters.period')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">{t('finances.budgets.filters.allPeriods')}</SelectItem>
              {Object.values(PeriodoBudget).map(periodo => (
                <SelectItem key={periodo} value={periodo}>
                  {t(`finances.budgets.periods.${periodo.toLowerCase()}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {/* Filtro por Estado */}
          <Select value={selectedEstado} onValueChange={setSelectedEstado}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t('finances.budgets.filters.status')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">{t('finances.budgets.filters.allStatuses')}</SelectItem>
              {Object.values(EstadoPresupuesto).map(estado => (
                <SelectItem key={estado} value={estado}>
                  {t(`finances.budgets.status.${estado === EstadoPresupuesto.ACTIVO ? 'active' : estado === EstadoPresupuesto.EN_RIESGO ? 'risk' : 'critical'}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {/* Botón para limpiar filtros */}
          {(searchTerm || selectedArea || selectedPeriodo || selectedEstado) && (
            <Button variant="ghost" size="icon" onClick={resetFilters}>
              <X className="h-4 w-4" />
              <span className="sr-only">{t('finances.budgets.filters.clear')}</span>
            </Button>
          )}
        </div>
      </motion.div>
      
      {/* Mostrar error si existe */}
      {isError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t('common.error')}</AlertTitle>
          <AlertDescription>
            {error?.message || t('finances.budgets.errors.loadingFailed')}
          </AlertDescription>
        </Alert>
      )}
      
      {/* Tabla de presupuestos */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <PresupuestoTable
          presupuestos={presupuestos}
          onEdit={handleEdit}
          onView={handleView}
          onExport={handleExport}
          isLoading={isLoading}
        />
      </motion.div>
      
      {/* Diálogo para crear presupuesto */}
      <Sheet open={showCreate} onOpenChange={setShowCreate}>
        <SheetContent className="sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>{t('finances.budgets.create.title')}</SheetTitle>
            <SheetDescription>
              {t('finances.budgets.create.description')}
            </SheetDescription>
          </SheetHeader>
          <div className="py-4">
            <PresupuestoForm 
              mode="create"
              onSuccess={() => {
                setShowCreate(false);
                refetch();
              }}
              onCancel={() => setShowCreate(false)}
            />
          </div>
        </SheetContent>
      </Sheet>
      
      {/* Diálogo para editar presupuesto */}
      <Sheet open={showEdit} onOpenChange={setShowEdit}>
        <SheetContent className="sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>{t('finances.budgets.edit.title')}</SheetTitle>
            <SheetDescription>
              {t('finances.budgets.edit.description')}
            </SheetDescription>
          </SheetHeader>
          <div className="py-4">
            {selectedPresupuesto && (
              <PresupuestoForm 
                mode="edit"
                presupuesto={selectedPresupuesto}
                onSuccess={() => {
                  setShowEdit(false);
                  refetch();
                }}
                onCancel={() => setShowEdit(false)}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>
      
      {/* Diálogo para ver detalles del presupuesto */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t('finances.budgets.details.title')}</DialogTitle>
            <DialogDescription>
              {t('finances.budgets.details.description')}
            </DialogDescription>
          </DialogHeader>
          
          {selectedPresupuesto && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t('finances.budgets.table.name')}</Label>
                  <p className="text-sm font-medium">{selectedPresupuesto.nombre}</p>
                </div>
                <div>
                  <Label>{t('finances.budgets.form.area')}</Label>
                  <p className="text-sm font-medium">{selectedPresupuesto.area || t('common.notSpecified')}</p>
                </div>
                <div>
                  <Label>{t('finances.budgets.table.budget')}</Label>
                  <p className="text-sm font-medium">
                    {new Intl.NumberFormat('es-ES', {
                      style: 'currency',
                      currency: 'EUR'
                    }).format(selectedPresupuesto.monto)}
                  </p>
                </div>
                <div>
                  <Label>{t('finances.budgets.table.spent')}</Label>
                  <p className="text-sm font-medium">
                    {new Intl.NumberFormat('es-ES', {
                      style: 'currency',
                      currency: 'EUR'
                    }).format(selectedPresupuesto.gastado)}
                  </p>
                </div>
                <div>
                  <Label>{t('finances.budgets.form.period')}</Label>
                  <p className="text-sm font-medium">
                    {t(`finances.budgets.periods.${selectedPresupuesto.periodo.toLowerCase()}`)}
                  </p>
                </div>
                <div>
                  <Label>{t('finances.budgets.table.execution')}</Label>
                  <p className="text-sm font-medium">
                    {selectedPresupuesto.porcentajeEjecucion.toFixed(1)}%
                  </p>
                </div>
                <div>
                  <Label>{t('finances.budgets.form.startDate')}</Label>
                  <p className="text-sm font-medium">
                    {selectedPresupuesto.fechaInicio.toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <Label>{t('finances.budgets.form.endDate')}</Label>
                  <p className="text-sm font-medium">
                    {selectedPresupuesto.fechaFin.toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <Separator />
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowDetail(false)}>
                  {t('common.close')}
                </Button>
                <Button onClick={() => handleExport(selectedPresupuesto)}>
                  <Download className="mr-2 h-4 w-4" />
                  {t('finances.budgets.actions.export')}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Diálogo para importar presupuestos */}
      <Dialog open={showImport} onOpenChange={setShowImport}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t('finances.budgets.import.title')}</DialogTitle>
            <DialogDescription>
              {t('finances.budgets.import.description')}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="border-2 border-dashed rounded-lg p-6 text-center">
              <Input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
                id="csv-upload"
              />
              <Label htmlFor="csv-upload" className="cursor-pointer block">
                <FileUp className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm font-medium mb-1">
                  {t('finances.budgets.import.dragAndDrop')}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t('finances.budgets.import.fileFormat')}
                </p>
              </Label>
            </div>
            
            {csvContent && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>{t('finances.budgets.import.fileUploaded')}</AlertTitle>
                <AlertDescription>
                  {t('finances.budgets.import.fileReady')}
                </AlertDescription>
              </Alert>
            )}
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowImport(false)}>
                {t('common.cancel')}
              </Button>
              <Button 
                onClick={handleImport} 
                disabled={!csvContent}
              >
                {t('finances.budgets.import.importButton')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};