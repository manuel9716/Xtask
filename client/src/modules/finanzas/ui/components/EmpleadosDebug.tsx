import React, { useEffect, useState } from 'react';

// Componente extremadamente simple para depurar problemas
export default function EmpleadosDebug() {
  const [loading, setLoading] = useState(true);
  const [empleados, setEmpleados] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const response = await fetch('/api/nomina/empleados/listar');
        const data = await response.json();
        
        console.log('DATOS RECIBIDOS DIRECTAMENTE:', data);
        
        if (data && data.data) {
          setEmpleados(data.data);
        } else {
          setError('No se encontró la estructura de datos esperada');
        }
      } catch (err: any) {
        console.error('Error en depuración:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);

  if (loading) {
    return <div className="p-4">Cargando...</div>;
  }

  if (error) {
    return <div className="p-4">Error: {error}</div>;
  }

  // Un div con información básica
  return (
    <div className="p-4 border">
      <h2 className="text-xl font-bold mb-4">Datos de empleados:</h2>
      
      <div className="mb-4">
        <p><strong>Número de empleados encontrados:</strong> {empleados.length}</p>
      </div>
      
      <div className="space-y-4">
        {empleados.map(emp => (
          <div key={emp.id} className="p-2 border rounded">
            <p><strong>ID:</strong> {emp.id}</p>
            <p><strong>Nombre:</strong> {emp.firstName} {emp.lastName}</p>
            <p><strong>Puesto:</strong> {emp.position}</p>
            <p><strong>Salario:</strong> {emp.salary}</p>
          </div>
        ))}
      </div>
    </div>
  );
}