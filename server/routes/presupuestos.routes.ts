import { Router } from 'express';
import { Request, Response } from 'express';

const router = Router();

// Endpoint para obtener detalles completos de un presupuesto
router.get('/:id/detalle', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Mock data para demostración - en producción vendría de la base de datos
    const presupuestoDetalle = {
      id: parseInt(id),
      nombre: id === '3' ? 'El FAG' : id === '4' ? 'SISVAE 2.0' : `Presupuesto ${id}`,
      monto: id === '3' ? 60000000 : id === '4' ? 420000000 : 15000000,
      gastado: id === '3' ? 18000000 : id === '4' ? 84000000 : 3000000,
      porcentajeEjecucion: id === '3' ? 30 : id === '4' ? 20 : 20,
      fechaInicio: '2025-01-01',
      fechaFin: '2025-12-31',
      area: 'General',
      estado: 'Activo',
      descripcion: `Descripción del presupuesto ${id}`
    };

    res.json(presupuestoDetalle);
  } catch (error) {
    console.error('Error al obtener detalles del presupuesto:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Endpoint para registrar pagos
router.post('/:id/pagos', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const pagoData = req.body;
    
    console.log(`Registrando pago para presupuesto ${id}:`, pagoData);
    
    // Aquí se guardaría en la base de datos
    const nuevoPago = {
      id: Date.now(),
      presupuestoId: parseInt(id),
      ...pagoData,
      fechaCreacion: new Date().toISOString()
    };

    res.status(201).json(nuevoPago);
  } catch (error) {
    console.error('Error al registrar pago:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Endpoint para registrar facturas
router.post('/:id/facturas', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const facturaData = req.body;
    
    console.log(`Registrando factura para presupuesto ${id}:`, facturaData);
    
    // Aquí se guardaría en la base de datos
    const nuevaFactura = {
      id: Date.now(),
      presupuestoId: parseInt(id),
      ...facturaData,
      fechaCreacion: new Date().toISOString()
    };

    res.status(201).json(nuevaFactura);
  } catch (error) {
    console.error('Error al registrar factura:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Endpoint para registrar activos
router.post('/:id/activos', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const activoData = req.body;
    
    console.log(`Registrando activo para presupuesto ${id}:`, activoData);
    
    // Aquí se guardaría en la base de datos
    const nuevoActivo = {
      id: Date.now(),
      presupuestoId: parseInt(id),
      ...activoData,
      fechaCreacion: new Date().toISOString()
    };

    res.status(201).json(nuevoActivo);
  } catch (error) {
    console.error('Error al registrar activo:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Endpoint para obtener pagos de un presupuesto
router.get('/:id/pagos', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Mock data - en producción vendría de la base de datos
    const pagos = [
      {
        id: 1,
        presupuestoId: parseInt(id),
        fecha: '2024-12-15',
        monto: 500000,
        concepto: 'Compra de materiales',
        area: 'Desarrollo',
        metodoPago: 'Transferencia Bancaria',
        comprobante: 'recibo_001.pdf'
      }
    ];

    res.json(pagos);
  } catch (error) {
    console.error('Error al obtener pagos:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Endpoint para obtener facturas de un presupuesto
router.get('/:id/facturas', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Mock data - en producción vendría de la base de datos
    const facturas = [
      {
        id: 1,
        presupuestoId: parseInt(id),
        proveedor: 'Tech Solutions SAS',
        numeroFactura: 'FC-2024-001',
        valor: 1200000,
        concepto: 'Licencias de software',
        fecha: '2024-12-20',
        archivo: 'factura_001.pdf'
      }
    ];

    res.json(facturas);
  } catch (error) {
    console.error('Error al obtener facturas:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Endpoint para obtener activos de un presupuesto
router.get('/:id/activos', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Mock data - en producción vendría de la base de datos
    const activos = [
      {
        id: 1,
        presupuestoId: parseInt(id),
        descripcion: 'Laptop Dell XPS 15',
        valor: 4500000,
        responsable: 'Juan Pérez',
        ubicacion: 'Oficina Principal',
        estado: 'Operativo',
        categoria: 'Equipos de cómputo',
        fechaAdquisicion: '2024-12-01'
      }
    ];

    res.json(activos);
  } catch (error) {
    console.error('Error al obtener activos:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Endpoint para generar reportes
router.get('/:id/reportes', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { tipo } = req.query;
    
    console.log(`Generando reporte ${tipo} para presupuesto ${id}`);
    
    // Aquí se generaría el reporte según el tipo
    const reporte = {
      presupuestoId: parseInt(id),
      tipo,
      fechaGeneracion: new Date().toISOString(),
      url: `/reportes/presupuesto_${id}_${tipo}_${Date.now()}.pdf`
    };

    res.json(reporte);
  } catch (error) {
    console.error('Error al generar reporte:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

export default router;