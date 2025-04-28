/**
 * Convierte un objeto de filtros en una cadena de consulta para URL
 * @param filtros Objeto con filtros
 * @returns Cadena de consulta URL o cadena vacía si no hay filtros
 */
export function convertirFiltrosAQueryParams(filtros?: Record<string, any>): string {
  if (!filtros) {
    return '';
  }

  const params = new URLSearchParams();

  Object.entries(filtros).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      // Tratamiento especial para fechas - convertir a ISO string
      if (value instanceof Date) {
        params.append(key, value.toISOString());
      } else {
        params.append(key, String(value));
      }
    }
  });

  return params.toString();
}

/**
 * Formatea una fecha a string en formato local (DD/MM/YYYY)
 * @param fecha Fecha a formatear
 * @returns Fecha formateada o cadena vacía si no hay fecha
 */
export function formatearFecha(fecha?: Date | string | null): string {
  if (!fecha) {
    return '';
  }

  const fechaObj = fecha instanceof Date ? fecha : new Date(fecha);
  
  // Validar que es una fecha válida
  if (isNaN(fechaObj.getTime())) {
    return '';
  }

  return fechaObj.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

/**
 * Formatea una fecha y hora a string en formato local (DD/MM/YYYY HH:MM)
 * @param fecha Fecha a formatear
 * @returns Fecha y hora formateada o cadena vacía si no hay fecha
 */
export function formatearFechaHora(fecha?: Date | string | null): string {
  if (!fecha) {
    return '';
  }

  const fechaObj = fecha instanceof Date ? fecha : new Date(fecha);
  
  // Validar que es una fecha válida
  if (isNaN(fechaObj.getTime())) {
    return '';
  }

  return fechaObj.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Formatea un número a moneda (MXN)
 * @param valor Valor a formatear
 * @returns Valor formateado como moneda o cadena vacía si no hay valor
 */
export function formatearMoneda(valor?: number | string | null): string {
  if (valor === undefined || valor === null || valor === '') {
    return '';
  }

  const valorNumerico = typeof valor === 'string' ? parseFloat(valor) : valor;
  
  // Validar que es un número válido
  if (isNaN(valorNumerico)) {
    return '';
  }

  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(valorNumerico);
}

/**
 * Trunca un texto a una longitud máxima y añade puntos suspensivos
 * @param texto Texto a truncar
 * @param longitud Longitud máxima
 * @returns Texto truncado
 */
export function truncarTexto(texto: string, longitud: number = 100): string {
  if (!texto) {
    return '';
  }

  if (texto.length <= longitud) {
    return texto;
  }

  return texto.substring(0, longitud) + '...';
}