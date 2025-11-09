// Rutas del módulo de Nómina
import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
// import { NominaService } from './application/services/NominaService';
// import { PostgresNominaRepository } from './infrastructure/PostgresNominaRepository';
import { insertEmpleadoNominaSchema, insertEmpleadoNominaDataSchema, filtrosNominaSchema } from '@shared/schema';
// import { db } from '../../db';
// import { eq } from 'drizzle-orm';

const router = Router();
// const nominaRepository = new PostgresNominaRepository();
// const nominaService = new NominaService(nominaRepository);

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
    const { getSqlServerPool } = require('../../db');
    const pool = await getSqlServerPool();
    
    // Obtener empleados activos
    const empleadosResult = await pool.request().query(`
      SELECT 
        id,
        first_name,
        last_name,
        position,
        department,
        identification,
        hire_date,
        contract_status,
        contract_type,
        salary,
        phone_number,
        address,
        emergency_contact
      FROM employees
      WHERE contract_status = 'activo'
      ORDER BY first_name, last_name
    `);

    const empleados = empleadosResult.recordset.map((emp: any) => ({
      id: emp.id,
      nombre: emp.first_name,
      apellido: emp.last_name,
      identificacion: emp.identification,
      depto: emp.department,
      cargo: emp.position,
      fecha_ingreso: emp.hire_date,
      estado_contrato: emp.contract_status,
      tipo_contrato: emp.contract_type,
      telefono: emp.phone_number,
      direccion: emp.address,
      contacto_emergencia: emp.emergency_contact,
      nomina: {
        sueldo_base: emp.salary || 0,
        frecuencia_pago: 'Mensual',
        metodo_pago: 'Transferencia Bancaria'
      },
      proyectos: []
    }));

    const totalNominaMensual = empleados.reduce((sum: number, emp: any) => sum + (emp.nomina?.sueldo_base || 0), 0);

    const data = {
      kpis: {
        empleadosActivos: empleados.length,
        nominaMensual: totalNominaMensual,
        bonificacionesMes: 0,
        porcentajePagadas: 0,
        proximaFechaPago: null
      },
      timeline: [],
      charts: {
        gastoPorProyecto: [],
        sueldosVsBonos: [
          { name: 'Sueldos', value: totalNominaMensual },
          { name: 'Bonos', value: 0 }
        ],
        historico6Meses: []
      },
      calendar: [],
      nominasRecientes: [],
      empleados: empleados
    };

    res.json(data);
  } catch (error) {
    console.error('Error en dashboard de nómina:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Obtener empleados
router.get('/empleados', async (req, res) => {
  try {
    const { getSqlServerPool } = require('../../db');
    const pool = await getSqlServerPool();
    
    // Obtener empleados activos directamente con SQL Server
    const result = await pool.request().query(`
      SELECT id, first_name, last_name, position, department 
      FROM employees 
      WHERE contract_status = 'activo'
    `);
    
    // Mapear resultado a formato esperado
    const empleados = result.recordset.map((row: any) => ({
      id: row.id,
      nombre: row.first_name,
      apellido: row.last_name,
      cargo: row.position,
      depto: row.department
    }));
    
    res.json(empleados);
  } catch (error) {
    console.error('Error obteniendo empleados:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// TODO: Implementar estos endpoints con SQL Server
// Crear empleado
// router.post('/empleados', async (req, res) => { ... });
// Crear datos de nómina para empleado
// router.post('/empleados/:id/nomina', async (req, res) => { ... });
// Subir contrato de empleado
// router.post('/empleados/:id/contrato', upload.single('contrato'), async (req, res) => { ... });
// KPIs del dashboard
// router.get('/kpis', async (req, res) => { ... });
// Timeline de eventos
// router.get('/timeline', async (req, res) => { ... });
// Datos de gráficos
// router.get('/charts', async (req, res) => { ... });

export default router;