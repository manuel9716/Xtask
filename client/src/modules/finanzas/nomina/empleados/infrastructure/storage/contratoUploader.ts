/**
 * Servicio para manejar la subida de contratos de empleados
 */

/**
 * Valida que el archivo tenga un formato correcto (PDF o DOCX)
 * @param file Archivo a validar
 * @returns True si el archivo es válido, false en caso contrario
 */
export const validarFormatoContrato = (file: File): boolean => {
  const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  return allowedTypes.includes(file.type);
};

/**
 * Verifica que el tamaño del archivo no exceda el límite
 * @param file Archivo a validar
 * @param maxSizeMB Tamaño máximo en MB (por defecto 5MB)
 * @returns True si el archivo tiene un tamaño válido, false en caso contrario
 */
export const validarTamanoContrato = (file: File, maxSizeMB = 5): boolean => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024; // Convertir MB a bytes
  return file.size <= maxSizeBytes;
};

/**
 * Sube un contrato al servidor
 * @param empleadoId ID del empleado
 * @param file Archivo a subir
 * @returns Promise con la respuesta de la API
 */
export const subirContrato = async (file: File, empleadoId?: number): Promise<string> => {
  try {
    // Validaciones
    if (!validarFormatoContrato(file)) {
      throw new Error('El formato del archivo no es válido. Por favor, suba un archivo PDF o DOCX.');
    }
    
    if (!validarTamanoContrato(file)) {
      throw new Error('El archivo excede el tamaño máximo permitido (5MB).');
    }
    
    // Crear FormData para enviar el archivo
    const formData = new FormData();
    formData.append('contrato', file);
    
    if (empleadoId) {
      formData.append('empleadoId', empleadoId.toString());
    }
    
    // Enviar el archivo al servidor
    const response = await fetch('/api/finanzas/nomina/empleados/contrato', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al subir el contrato');
    }
    
    const data = await response.json();
    return data.fileUrl;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Error desconocido al subir el contrato');
  }
};