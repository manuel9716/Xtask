/**
 * @file Página de Capacitaciones
 * @description Implementa la página principal del módulo de capacitaciones con widget de micro-learning
 */

import { useState, useEffect } from "react";
import { PageLayout } from "@/components/ui/page-layout";
import { MicroLearningWidget } from "../components/microLearning";

/**
 * Página principal del módulo de capacitaciones
 */
export function CapacitacionesPage() {
  // Estado para el ID del empleado actual (normalmente vendría de un contexto de autenticación)
  const [empleadoId, setEmpleadoId] = useState<number>(3); // Empleado de ejemplo
  
  // Estado para activar/desactivar el widget
  const [mostrarWidget, setMostrarWidget] = useState(true);
  
  // Datos de contexto para el widget
  const paginaActual = "/recursos-humanos/capacitaciones";
  const actividadActual = "visualizacion_capacitaciones";

  return (
    <PageLayout
      title="Capacitaciones"
      subtitle="Gestión y seguimiento de capacitaciones"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {/* Contenido principal - ocupa 3/4 del espacio en pantallas grandes */}
        <div className="md:col-span-2 lg:col-span-3 space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Capacitaciones Próximas</h2>
            <p className="text-gray-500 dark:text-gray-400">
              Contenido de ejemplo para la página de capacitaciones.
              Aquí se mostraría el listado de capacitaciones programadas.
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Capacitaciones en Curso</h2>
            <p className="text-gray-500 dark:text-gray-400">
              Contenido de ejemplo para capacitaciones actualmente en curso.
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Capacitaciones Finalizadas</h2>
            <p className="text-gray-500 dark:text-gray-400">
              Contenido de ejemplo para capacitaciones completadas.
            </p>
          </div>
        </div>
        
        {/* Panel lateral - ocupa 1/4 del espacio en pantallas grandes */}
        <div className="space-y-6">
          {/* Widget de Micro-Learning integrado en la página */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h3 className="text-lg font-medium mb-3">Aprendizaje Contextual</h3>
            
            {mostrarWidget ? (
              <MicroLearningWidget 
                empleadoId={empleadoId}
                contextoPagina={paginaActual}
                contextoActividad={actividadActual}
                posicion="abajo-derecha"
                mostrarIconosCerrar={true}
                tamano="pequeño"
                onClose={() => setMostrarWidget(false)}
                className="w-full mx-auto"
              />
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500 mb-2">Widget cerrado</p>
                <button 
                  onClick={() => setMostrarWidget(true)}
                  className="text-sm text-blue-500 hover:text-blue-700"
                >
                  Mostrar recomendaciones
                </button>
              </div>
            )}
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h3 className="text-lg font-medium mb-3">Filtros de Capacitaciones</h3>
            <p className="text-sm text-gray-500">
              Aquí irían filtros para las capacitaciones (área, tipo, estado, etc.)
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h3 className="text-lg font-medium mb-3">Estadísticas</h3>
            <p className="text-sm text-gray-500">
              Resumen de estadísticas de capacitaciones y participación
            </p>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}