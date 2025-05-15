/**
 * Script para generar registros de actividad para un usuario de prueba.
 * Ejecutar con: node scripts/seed-activity-logs.js
 */

import fetch from 'node-fetch';

const API_URL = 'http://localhost:5000';

// ID del usuario para el que se generarán los logs (actualizar según tu sistema)
const USER_ID = 2; // Ajusta este valor al ID del usuario que deseas utilizar

// Ejemplos de acciones que un usuario puede realizar
const SAMPLE_ACTIONS = [
  {
    action: "Iniciar sesión",
    description: "Has iniciado sesión en el sistema"
  },
  {
    action: "Ver",
    description: "Has consultado el listado de proyectos"
  },
  {
    action: "Crear",
    description: "Has creado un nuevo proyecto: Sistema de Ventas Online",
    targetType: "proyecto",
    targetId: 1
  },
  {
    action: "Editar",
    description: "Has actualizado el estado del proyecto: Sistema de Ventas Online",
    targetType: "proyecto",
    targetId: 1
  },
  {
    action: "Asignar",
    description: "Has asignado a María García como responsable del proyecto",
    targetType: "proyecto",
    targetId: 1
  },
  {
    action: "Crear",
    description: "Has creado una nueva tarea: Diseñar interfaz de usuario",
    targetType: "tarea",
    targetId: 3
  },
  {
    action: "Cambiar estado",
    description: "Has marcado como completada la tarea: Implementar autenticación",
    targetType: "tarea",
    targetId: 2
  },
  {
    action: "Comentar",
    description: "Has añadido un comentario a la tarea: Diseñar interfaz de usuario",
    targetType: "tarea",
    targetId: 3
  },
  {
    action: "Aprobar",
    description: "Has aprobado la solicitud de presupuesto: Marketing Digital Q3",
    targetType: "presupuesto",
    targetId: 5
  },
  {
    action: "Generar",
    description: "Has generado un reporte financiero del segundo trimestre",
    targetType: "reporte",
    targetId: 2
  },
  {
    action: "Subir",
    description: "Has subido un documento al proyecto: Sistema de Ventas Online",
    targetType: "documento",
    targetId: 7
  },
  {
    action: "Descargar",
    description: "Has descargado el informe mensual de ventas",
    targetType: "reporte",
    targetId: 3
  },
  {
    action: "Cerrar sesión",
    description: "Has cerrado sesión en el sistema"
  }
];

// Función para crear un registro de actividad
async function createActivityLog(logData) {
  try {
    const response = await fetch(`${API_URL}/api/activity-logs/temp-log-activity`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(logData),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`✅ Creado registro de actividad: ${logData.action} - ${logData.description}`);
    return data;
  } catch (error) {
    console.error(`❌ Error al crear registro de actividad: ${error.message}`);
    return null;
  }
}

// Función principal para crear registros aleatorios
async function seedActivityLogs(count = 20) {
  console.log(`Generando ${count} registros de actividad para el usuario ID: ${USER_ID}...`);
  
  for (let i = 0; i < count; i++) {
    // Seleccionar una acción aleatoria
    const randomAction = SAMPLE_ACTIONS[Math.floor(Math.random() * SAMPLE_ACTIONS.length)];
    
    // Crear el objeto de registro
    const logData = {
      userId: USER_ID,
      action: randomAction.action,
      description: randomAction.description,
      targetType: randomAction.targetType || null,
      targetId: randomAction.targetId || null,
      ipAddress: "127.0.0.1",
      userAgent: "Script de prueba"
    };
    
    // Crear el registro
    await createActivityLog(logData);
    
    // Pequeña pausa para evitar sobrecarga
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  console.log("¡Generación de registros completada!");
}

// Ejecutar el script
seedActivityLogs(15);