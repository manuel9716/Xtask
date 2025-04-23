import express, { Request, Response } from 'express';
import { z } from 'zod';
import { CreatePresupuestoDto, PeriodoBudget, UpdatePresupuestoDto } from '../../domain/entities/Presupuesto';
import { CalculoEjecucionService } from '../../domain/services/CalculoEjecucion';
import { storage } from '../../../../../../server/storage';

const router = express.Router();
const calculoService = new CalculoEjecucionService();

// Esquema de validación para creación de presupuesto
const createPresupuestoSchema = z.object({
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  monto: z.number().positive('El monto debe ser mayor a cero'),
  area: z.string().optional(),
  periodo: z.nativeEnum(PeriodoBudget),
  fechaInicio: z.coerce.date(),
  fechaFin: z.coerce.date(),
  organizationId: z.number().default(1),
}).refine(data => data.fechaFin > data.fechaInicio, {
  message: 'La fecha de fin debe ser posterior a la fecha de inicio',
  path: ['fechaFin']
});

// Esquema de validación para actualización de presupuesto
const updatePresupuestoSchema = z.object({
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').optional(),
  monto: z.number().positive('El monto debe ser mayor a cero').optional(),
  area: z.string().optional(),
  fechaInicio: z.coerce.date().optional(),
  fechaFin: z.coerce.date().optional(),
}).refine(data => {
  if (data.fechaInicio && data.fechaFin) {
    return data.fechaFin > data.fechaInicio;
  }
  return true;
}, {
  message: 'La fecha de fin debe ser posterior a la fecha de inicio',
  path: ['fechaFin']
});

// Obtener todos los presupuestos
router.get('/', async (req: Request, res: Response) => {
  try {
    const organizationId = Number(req.query.organizationId) || 1;
    const presupuestos = await storage.getAllBudgets(organizationId);
    
    // Transformar y añadir datos calculados
    const result = presupuestos.map(presupuesto => {
      const porcentajeEjecucion = calculoService.calcularPorcentajeEjecucion(
        presupuesto.gastado, 
        presupuesto.monto
      );
      const estado = calculoService.determinarEstado(porcentajeEjecucion);
      
      return {
        ...presupuesto,
        porcentajeEjecucion,
        estado
      };
    });
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener presupuestos' });
  }
});

// Obtener un presupuesto por ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const presupuesto = await storage.getBudget(id);
    
    if (!presupuesto) {
      return res.status(404).json({ error: 'Presupuesto no encontrado' });
    }
    
    const porcentajeEjecucion = calculoService.calcularPorcentajeEjecucion(
      presupuesto.gastado, 
      presupuesto.monto
    );
    const estado = calculoService.determinarEstado(porcentajeEjecucion);
    
    res.json({
      ...presupuesto,
      porcentajeEjecucion,
      estado
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el presupuesto' });
  }
});

// Crear un nuevo presupuesto
router.post('/', async (req: Request, res: Response) => {
  try {
    const validatedData = createPresupuestoSchema.parse(req.body);
    
    const presupuesto = await storage.createBudget({
      ...validatedData,
      gastado: 0
    });
    
    const porcentajeEjecucion = 0; // Nuevo presupuesto, 0% de ejecución
    const estado = calculoService.determinarEstado(porcentajeEjecucion);
    
    res.status(201).json({
      ...presupuesto,
      porcentajeEjecucion,
      estado
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    res.status(500).json({ error: 'Error al crear el presupuesto' });
  }
});

// Actualizar un presupuesto
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const presupuesto = await storage.getBudget(id);
    
    if (!presupuesto) {
      return res.status(404).json({ error: 'Presupuesto no encontrado' });
    }
    
    // Verificar si el presupuesto está en un estado que permite edición
    const porcentajeEjecucion = calculoService.calcularPorcentajeEjecucion(
      presupuesto.gastado, 
      presupuesto.monto
    );
    const estado = calculoService.determinarEstado(porcentajeEjecucion);
    
    if (estado !== 'ACTIVO') {
      return res.status(400).json({ 
        error: 'No se puede editar un presupuesto que no está en estado ACTIVO' 
      });
    }
    
    const validatedData = updatePresupuestoSchema.parse(req.body);
    
    const updatedPresupuesto = await storage.updateBudget(id, validatedData);
    
    // Recalcular con los nuevos valores
    const newPorcentajeEjecucion = calculoService.calcularPorcentajeEjecucion(
      updatedPresupuesto.gastado, 
      updatedPresupuesto.monto
    );
    const newEstado = calculoService.determinarEstado(newPorcentajeEjecucion);
    
    res.json({
      ...updatedPresupuesto,
      porcentajeEjecucion: newPorcentajeEjecucion,
      estado: newEstado
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    res.status(500).json({ error: 'Error al actualizar el presupuesto' });
  }
});

// Registrar un gasto en un presupuesto
router.post('/:id/gastos', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { monto } = req.body;
    
    if (typeof monto !== 'number' || monto <= 0) {
      return res.status(400).json({ error: 'El monto debe ser un número positivo' });
    }
    
    const presupuesto = await storage.getBudget(id);
    
    if (!presupuesto) {
      return res.status(404).json({ error: 'Presupuesto no encontrado' });
    }
    
    // Validar el gasto
    const validacion = calculoService.validarGasto(monto, presupuesto.gastado, presupuesto.monto);
    if (!validacion.valido) {
      return res.status(400).json({ error: validacion.mensaje });
    }
    
    // Actualizar el gasto
    const nuevoGastado = presupuesto.gastado + monto;
    const updatedPresupuesto = await storage.updateBudget(id, { gastado: nuevoGastado });
    
    const porcentajeEjecucion = calculoService.calcularPorcentajeEjecucion(
      updatedPresupuesto.gastado, 
      updatedPresupuesto.monto
    );
    const estado = calculoService.determinarEstado(porcentajeEjecucion);
    
    res.json({
      ...updatedPresupuesto,
      porcentajeEjecucion,
      estado
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar el gasto' });
  }
});

// Importar presupuestos desde CSV
router.post('/importar', async (req: Request, res: Response) => {
  try {
    const { csvData, organizationId = 1 } = req.body;
    
    if (!csvData) {
      return res.status(400).json({ error: 'No se proporcionaron datos CSV' });
    }
    
    // Procesamiento del CSV (implementación simplificada)
    const lines = csvData.trim().split('\n');
    const headers = lines[0].split(',');
    
    // Validar cabeceras mínimas requeridas
    const requiredHeaders = ['nombre', 'monto', 'periodo', 'fechaInicio', 'fechaFin'];
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    
    if (missingHeaders.length > 0) {
      return res.status(400).json({ 
        error: `El CSV no contiene las cabeceras requeridas: ${missingHeaders.join(', ')}` 
      });
    }
    
    const presupuestosCreados = [];
    
    // Procesar cada línea, saltando las cabeceras
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',');
      const presupuestoData: any = {};
      
      // Mapear valores a propiedades
      headers.forEach((header, index) => {
        let value = values[index]?.trim();
        
        if (header === 'monto') {
          value = parseFloat(value);
          if (isNaN(value)) {
            throw new Error(`Monto inválido en la línea ${i + 1}`);
          }
        }
        
        presupuestoData[header] = value;
      });
      
      // Añadir valores por defecto
      presupuestoData.gastado = 0;
      presupuestoData.organizationId = organizationId;
      
      try {
        // Validar y crear el presupuesto
        const validatedData = createPresupuestoSchema.parse(presupuestoData);
        const presupuesto = await storage.createBudget(validatedData);
        presupuestosCreados.push(presupuesto);
      } catch (validationError) {
        throw new Error(`Error en la línea ${i + 1}: ${validationError.toString()}`);
      }
    }
    
    res.status(201).json(presupuestosCreados);
  } catch (error) {
    res.status(500).json({ error: `Error al importar presupuestos: ${error.message}` });
  }
});

export const presupuestosController = router;