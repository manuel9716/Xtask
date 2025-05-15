import { Router } from "express";
import { storage } from "../storage";
import { authRequired } from "../middlewares/auth";

const router = Router();

// Obtener actividades del usuario logueado
router.get("/user-activities", authRequired, async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Usuario no autenticado" });
    }
    
    const userId = req.user.id;
    const activities = await storage.getUserActivityLogs(userId);
    
    res.status(200).json(activities);
  } catch (error) {
    console.error("Error al obtener actividades del usuario:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
});

// Endpoint temporal sin autenticación para pruebas
router.get("/temp-user-activities/:userId", async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: "ID de usuario inválido" });
    }
    
    const activities = await storage.getUserActivityLogs(userId);
    
    res.status(200).json(activities);
  } catch (error) {
    console.error("Error al obtener actividades del usuario:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
});

// Este endpoint es para registrar actividad del usuario
router.post("/log-activity", authRequired, async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Usuario no autenticado" });
    }
    
    const { action, description, targetId, targetType, ipAddress, userAgent } = req.body;
    
    // Validación básica
    if (!action || !description) {
      return res.status(400).json({ message: "Acción y descripción son obligatorios" });
    }
    
    const activityLog = await storage.createActivityLog({
      userId: req.user.id,
      action,
      description,
      targetId,
      targetType,
      ipAddress,
      userAgent
    });
    
    res.status(201).json(activityLog);
  } catch (error) {
    console.error("Error al registrar actividad:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
});

// Endpoint temporal sin autenticación para pruebas
router.post("/temp-log-activity", async (req, res) => {
  try {
    const { userId, action, description, targetId, targetType, ipAddress, userAgent } = req.body;
    
    // Validación básica
    if (!userId || !action || !description) {
      return res.status(400).json({ message: "UserId, acción y descripción son obligatorios" });
    }
    
    const activityLog = await storage.createActivityLog({
      userId,
      action,
      description,
      targetId,
      targetType,
      ipAddress,
      userAgent
    });
    
    res.status(201).json(activityLog);
  } catch (error) {
    console.error("Error al registrar actividad:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
});

export default router;