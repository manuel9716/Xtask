// Rutas del módulo de Nómina
import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { NominaService } from './application/services/NominaService';
import { PostgresNominaRepository } from './infrastructure/PostgresNominaRepository';
import { insertEmpleadoNominaSchema, insertEmpleadoNominaDataSchema, filtrosNominaSchema } from '@shared/schema';

const router = Router();
const nominaRepository = new PostgresNominaRepository();
const nominaService = new NominaService(nominaRepository);

// Configuración de multer para subida de contratos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = path.join(process.cwd(), 'uploads', 'contratos');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`;
    cb(null, filename);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos PDF, DOC y DOCX'));
    }
  }
});

// Dashboard principal
router.get('/dashboard', async (req, res) => {
  try {
    const filtros = filtrosNominaSchema.parse({
      proyectoId: req.query.proyectoId ? Number(req.query.proyectoId) : undefined,
      empleadoId: req.query.empleadoId ? Number(req.query.empleadoId) : undefined,
      from: req.query.from ? new Date(req.query.from as string) : undefined,
      to: req.query.to ? new Date(req.query.to as string) : undefined
    });

    const data = await nominaService.getDashboardData(filtros);
    res.json(data);
  } catch (error) {
    console.error('Error en dashboard de nómina:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Obtener empleados
router.get('/empleados', async (req, res) => {
  try {
    const query = req.query.q as string;
    const empleados = await nominaService.getEmpleados(query);
    res.json(empleados);
  } catch (error) {
    console.error('Error obteniendo empleados:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Crear empleado
router.post('/empleados', async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'No autorizado' });
    }

    const empleadoData = insertEmpleadoNominaSchema.parse(req.body);
    const empleado = await nominaService.createEmpleado(empleadoData);
    res.status(201).json(empleado);
  } catch (error) {
    console.error('Error creando empleado:', error);
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }
});

// Crear datos de nómina para empleado
router.post('/empleados/:id/nomina', async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'No autorizado' });
    }

    const empleadoId = parseInt(req.params.id);
    const nominaData = insertEmpleadoNominaDataSchema.parse({
      ...req.body,
      empleadoId
    });

    const data = await nominaService.createEmpleadoNominaData(nominaData);
    res.status(201).json(data);
  } catch (error) {
    console.error('Error creando datos de nómina:', error);
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }
});

// Subir contrato de empleado
router.post('/empleados/:id/contrato', upload.single('contrato'), async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'No autorizado' });
    }

    const empleadoId = parseInt(req.params.id);
    if (!req.file) {
      return res.status(400).json({ message: 'No se ha subido ningún archivo' });
    }

    await nominaService.uploadContrato(empleadoId, req.file, req.user!.id);
    res.status(201).json({ message: 'Contrato subido exitosamente' });
  } catch (error) {
    console.error('Error subiendo contrato:', error);
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }
});

// KPIs del dashboard
router.get('/kpis', async (req, res) => {
  try {
    const filtros = filtrosNominaSchema.parse({
      proyectoId: req.query.proyectoId ? Number(req.query.proyectoId) : undefined,
      empleadoId: req.query.empleadoId ? Number(req.query.empleadoId) : undefined,
      from: req.query.from ? new Date(req.query.from as string) : undefined,
      to: req.query.to ? new Date(req.query.to as string) : undefined
    });

    const kpis = await nominaService.calculateKPIs(filtros);
    res.json(kpis);
  } catch (error) {
    console.error('Error obteniendo KPIs:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Timeline de eventos
router.get('/timeline', async (req, res) => {
  try {
    const filtros = filtrosNominaSchema.parse({
      proyectoId: req.query.proyectoId ? Number(req.query.proyectoId) : undefined,
      empleadoId: req.query.empleadoId ? Number(req.query.empleadoId) : undefined,
      from: req.query.from ? new Date(req.query.from as string) : undefined,
      to: req.query.to ? new Date(req.query.to as string) : undefined
    });

    const timeline = await nominaService.getTimeline(filtros);
    res.json(timeline);
  } catch (error) {
    console.error('Error obteniendo timeline:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Datos de gráficos
router.get('/charts', async (req, res) => {
  try {
    const filtros = filtrosNominaSchema.parse({
      proyectoId: req.query.proyectoId ? Number(req.query.proyectoId) : undefined,
      empleadoId: req.query.empleadoId ? Number(req.query.empleadoId) : undefined,
      from: req.query.from ? new Date(req.query.from as string) : undefined,
      to: req.query.to ? new Date(req.query.to as string) : undefined
    });

    const charts = await nominaService.getChartsData(filtros);
    res.json(charts);
  } catch (error) {
    console.error('Error obteniendo datos de gráficos:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

export default router;