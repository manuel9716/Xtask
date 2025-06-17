/**
 * Entidad de dominio para las habilidades de usuario
 */

export enum TipoHabilidad {
  HERRAMIENTA = "herramienta",
  HABILIDAD_BLANDA = "habilidad_blanda", 
  CONOCIMIENTO = "conocimiento",
  IDIOMA = "idioma"
}

export enum NivelHabilidad {
  BASICO = "básico",
  INTERMEDIO = "intermedio",
  AVANZADO = "avanzado",
  EXPERTO = "experto"
}

export interface Habilidad {
  id: number;
  userId: number;
  tipo: TipoHabilidad;
  nombre: string;
  nivel: NivelHabilidad;
  observaciones?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateHabilidadRequest {
  userId: number;
  tipo: TipoHabilidad;
  nombre: string;
  nivel: NivelHabilidad;
  observaciones?: string;
}

export interface UpdateHabilidadRequest {
  tipo?: TipoHabilidad;
  nombre?: string;
  nivel?: NivelHabilidad;
  observaciones?: string;
}

export interface HabilidadesPorTipo {
  [TipoHabilidad.HERRAMIENTA]?: Habilidad[];
  [TipoHabilidad.HABILIDAD_BLANDA]?: Habilidad[];
  [TipoHabilidad.CONOCIMIENTO]?: Habilidad[];
  [TipoHabilidad.IDIOMA]?: Habilidad[];
}

// Funciones de utilidad
export function getNivelColor(nivel: NivelHabilidad): string {
  switch (nivel) {
    case NivelHabilidad.BASICO:
      return "bg-red-100 text-red-800";
    case NivelHabilidad.INTERMEDIO:
      return "bg-yellow-100 text-yellow-800";
    case NivelHabilidad.AVANZADO:
      return "bg-blue-100 text-blue-800";
    case NivelHabilidad.EXPERTO:
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export function getTipoColor(tipo: TipoHabilidad): string {
  switch (tipo) {
    case TipoHabilidad.HERRAMIENTA:
      return "bg-purple-100 text-purple-800";
    case TipoHabilidad.HABILIDAD_BLANDA:
      return "bg-pink-100 text-pink-800";
    case TipoHabilidad.CONOCIMIENTO:
      return "bg-indigo-100 text-indigo-800";
    case TipoHabilidad.IDIOMA:
      return "bg-emerald-100 text-emerald-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export function getTipoIcon(tipo: TipoHabilidad): string {
  switch (tipo) {
    case TipoHabilidad.HERRAMIENTA:
      return "🔧";
    case TipoHabilidad.HABILIDAD_BLANDA:
      return "💡";
    case TipoHabilidad.CONOCIMIENTO:
      return "📚";
    case TipoHabilidad.IDIOMA:
      return "🌍";
    default:
      return "📋";
  }
}

export function getTipoLabel(tipo: TipoHabilidad): string {
  switch (tipo) {
    case TipoHabilidad.HERRAMIENTA:
      return "Herramientas";
    case TipoHabilidad.HABILIDAD_BLANDA:
      return "Habilidades Blandas";
    case TipoHabilidad.CONOCIMIENTO:
      return "Conocimientos";
    case TipoHabilidad.IDIOMA:
      return "Idiomas";
    default:
      return "Otros";
  }
}

export function getNivelLabel(nivel: NivelHabilidad): string {
  switch (nivel) {
    case NivelHabilidad.BASICO:
      return "Básico";
    case NivelHabilidad.INTERMEDIO:
      return "Intermedio";
    case NivelHabilidad.AVANZADO:
      return "Avanzado";
    case NivelHabilidad.EXPERTO:
      return "Experto";
    default:
      return "Sin definir";
  }
}