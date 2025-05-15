// Componente mínimo para mostrar empleados
import React, { useEffect, useState } from 'react';

export default function EmpleadosDirecto() {
  const [empleados, setEmpleados] = useState<any[]>([]);
  
  useEffect(() => {
    fetch('/api/nomina/empleados/listar?page=1&pageSize=10')
      .then(res => res.json())
      .then(data => {
        console.log('Datos directos:', data);
        if (data && data.data) {
          setEmpleados(data.data);
        }
      })
      .catch(err => console.error('Error fetch directo:', err));
  }, []);
  
  return (
    <div className="space-y-2 border p-4">
      <h1 className="text-xl font-bold">Empleados ({empleados.length})</h1>
      
      {empleados.length === 0 ? (
        <div>No hay empleados para mostrar</div>
      ) : (
        <div>
          {empleados.map(emp => (
            <div key={emp.id} className="border p-2 mb-2">
              {emp.firstName} {emp.lastName} - {emp.department}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}