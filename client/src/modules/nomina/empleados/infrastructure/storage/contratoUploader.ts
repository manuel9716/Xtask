/**
 * Servicio para manejar la subida de contratos de empleados
 */

/**
 * Valida que el archivo tenga un formato correcto (PDF o DOCX)
 * @param file Archivo a validar
 * @returns True si el archivo es válido, false en caso contrario
 */
export const validarFormatoContrato = (file: File): boolean => {
  // Validamos por extensión y tipo MIME
  const allowedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
    'application/msword' // DOC
  ];
  
  // Si el tipo MIME es válido, aceptar el archivo
  if (allowedTypes.includes(file.type)) {
    return true;
  }
  
  // También validar por extensión por si el tipo MIME no es confiable
  const fileName = file.name.toLowerCase();
  return fileName.endsWith('.pdf') || fileName.endsWith('.docx') || fileName.endsWith('.doc');
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
    formData.append('file', file);
    
    if (empleadoId) {
      formData.append('empleadoId', empleadoId.toString());
    }
    
    // Enviar el archivo al servidor
    const response = await fetch('/api/nomina/empleados/contrato', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      try {
        const error = await response.json();
        throw new Error(error.message || error.error || 'Error al subir el contrato');
      } catch (jsonError) {
        // Si la respuesta no es JSON, usar el texto de la respuesta
        const errorText = await response.text();
        throw new Error(errorText || `Error ${response.status}: ${response.statusText}`);
      }
    }
    
    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      console.error("Error al parsear respuesta como JSON:", jsonError);
      // Si no podemos parsear como JSON, usar texto
      const text = await response.text();
      data = { fileUrl: text };
    }
    console.log("Respuesta al subir contrato:", data); // Para depuración
    // Verificamos todas las posibles propiedades donde podría venir la URL
    return data.fileUrl || data.url || (typeof data === 'string' ? data : '');
  } catch (error) {
    console.error("Error en la subida del contrato:", error);
    if (error instanceof Error) {
      throw error;
    }
    if (typeof error === 'string') {
      throw new Error(error);
    }
    throw new Error('Error desconocido al subir el contrato');
  }
};