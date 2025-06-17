import { apiRequest } from "@/lib/queryClient";
import { 
  Habilidad, 
  CreateHabilidadRequest, 
  UpdateHabilidadRequest, 
  HabilidadesPorTipo 
} from "../../domain/entities/Habilidad";
import { HabilidadRepository } from "../../domain/repositories/HabilidadRepository";

export class HabilidadApi implements HabilidadRepository {
  async getHabilidadesByUserId(userId: number): Promise<HabilidadesPorTipo> {
    const response = await apiRequest("GET", `/api/habilidades/${userId}`);
    return response.json();
  }

  async getMisHabilidades(): Promise<HabilidadesPorTipo> {
    const response = await apiRequest("GET", "/api/habilidades/mis-habilidades");
    return response.json();
  }

  async createHabilidad(habilidad: CreateHabilidadRequest): Promise<Habilidad> {
    const response = await apiRequest("POST", "/api/habilidades", habilidad);
    return response.json();
  }

  async updateHabilidad(id: number, habilidad: UpdateHabilidadRequest): Promise<Habilidad> {
    const response = await apiRequest("PATCH", `/api/habilidades/${id}`, habilidad);
    return response.json();
  }

  async deleteHabilidad(id: number): Promise<void> {
    await apiRequest("DELETE", `/api/habilidades/${id}`);
  }
}

export const habilidadApi = new HabilidadApi();