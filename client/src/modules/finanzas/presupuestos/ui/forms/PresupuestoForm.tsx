import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { z } from 'zod';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { es, enUS } from 'date-fns/locale';

import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';

import { 
  Presupuesto, 
  PeriodoBudget, 
  CreatePresupuestoDto, 
  UpdatePresupuestoDto 
} from '../../domain/entities/Presupuesto';
import { 
  useCrearPresupuesto, 
  CrearPresupuestoFormData, 
  crearPresupuestoSchema 
} from '../../application/useCrearPresupuesto';
import {
  useActualizarEstadoPresupuesto,
  ActualizarPresupuestoFormData,
  updatePresupuestoSchema
} from '../../application/useActualizarEstadoPresupuesto';

interface PresupuestoFormProps {
  presupuesto?: Presupuesto | null;
  onSuccess?: () => void;
  onCancel?: () => void;
  mode: 'create' | 'edit';
}

/**
 * Formulario para crear o editar presupuestos
 */
export const PresupuestoForm: React.FC<PresupuestoFormProps> = ({
  presupuesto,
  onSuccess,
  onCancel,
  mode
}) => {
  const { t, i18n } = useTranslation();
  const currentLocale = i18n.language === 'es' ? es : enUS;
  
  // Hooks para crear o actualizar presupuesto
  const {
    form: createForm,
    onSubmit: onCreateSubmit,
    isPending: isCreatePending
  } = useCrearPresupuesto();
  
  const {
    form: updateForm,
    onSubmit: onUpdateSubmit,
    resetForm,
    isPending: isUpdatePending
  } = useActualizarEstadoPresupuesto(presupuesto);
  
  // Elegir el formulario correcto según el modo
  const form = mode === 'create' ? createForm : updateForm;
  const onSubmit = mode === 'create' ? onCreateSubmit : onUpdateSubmit;
  const isPending = mode === 'create' ? isCreatePending : isUpdatePending;
  
  // Resetear el formulario de edición cuando cambia el presupuesto seleccionado
  useEffect(() => {
    if (mode === 'edit' && presupuesto) {
      resetForm();
    }
  }, [presupuesto, mode, resetForm]);
  
  // Traducir las opciones de períodos
  const periodOptions = Object.values(PeriodoBudget).map(value => ({
    value,
    label: t(`finances.budgets.periods.${value.toLowerCase()}`)
  }));
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="space-y-4 p-4"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nombre del presupuesto */}
            <FormField
              control={form.control}
              name="nombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('finances.budgets.form.name')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('finances.budgets.form.namePlaceholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Monto */}
            <FormField
              control={form.control}
              name="monto"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('finances.budgets.form.amount')}</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min={0} 
                      step={0.01}
                      placeholder="0.00" 
                      {...field}
                      // Convertir string a número para el input numérico
                      onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormDescription>
                    {t('finances.budgets.form.amountDescription')}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Área (opcional) */}
            <FormField
              control={form.control}
              name="area"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('finances.budgets.form.area')}</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder={t('finances.budgets.form.areaPlaceholder')}
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormDescription>
                    {t('finances.budgets.form.areaDescription')}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Período */}
            {mode === 'create' && (
              <FormField
                control={form.control}
                name="periodo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('finances.budgets.form.period')}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('finances.budgets.form.periodPlaceholder')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {periodOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            {/* Fecha de inicio */}
            <FormField
              control={form.control}
              name="fechaInicio"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>{t('finances.budgets.form.startDate')}</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className="pl-3 text-left font-normal"
                        >
                          {field.value ? (
                            format(field.value, "PPP", { locale: currentLocale })
                          ) : (
                            <span className="text-muted-foreground">
                              {t('finances.budgets.form.pickADate')}
                            </span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date("1900-01-01")}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Fecha de fin */}
            <FormField
              control={form.control}
              name="fechaFin"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>{t('finances.budgets.form.endDate')}</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className="pl-3 text-left font-normal"
                        >
                          {field.value ? (
                            format(field.value, "PPP", { locale: currentLocale })
                          ) : (
                            <span className="text-muted-foreground">
                              {t('finances.budgets.form.pickADate')}
                            </span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date("1900-01-01")}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          {/* Botones de acción */}
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isPending}
            >
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? t('common.saving') : mode === 'create' 
                ? t('finances.budgets.form.createButton') 
                : t('finances.budgets.form.updateButton')
              }
            </Button>
          </div>
        </form>
      </Form>
    </motion.div>
  );
};