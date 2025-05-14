/**
 * Formatea una fecha en formato legible
 */
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return 'N/A';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(dateObj);
}

/**
 * Formatea un número como moneda en formato MXN
 */
export function formatCurrency(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined) return '$0.00';
  
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(numericAmount);
}

/**
 * Formatea un número con separadores de miles
 */
export function formatNumber(number: number | string | null | undefined): string {
  if (number === null || number === undefined) return '0';
  
  const numericValue = typeof number === 'string' ? parseFloat(number) : number;
  
  return new Intl.NumberFormat('es-MX').format(numericValue);
}

/**
 * Formatea un porcentaje
 */
export function formatPercent(value: number | string | null | undefined): string {
  if (value === null || value === undefined) return '0%';
  
  const numericValue = typeof value === 'string' ? parseFloat(value) : value;
  
  return `${numericValue.toFixed(1)}%`;
}