import { ProyectoService } from "../../domain/services/ProyectoService";
import { ProyectoRepository } from "../../domain/repositories/ProyectoRepository";
import { ProyectoApiAdapter } from "../api/ProyectoApiAdapter";

// Crear una instancia del adaptador de API que implementa la interfaz ProyectoRepository
export const proyectosRepository: ProyectoRepository = new ProyectoApiAdapter();

// Crear una instancia del servicio con el repositorio inyectado
export const proyectoService = new ProyectoService(proyectosRepository);