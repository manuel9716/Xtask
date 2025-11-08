-- Script para actualizar la contraseña del usuario viky
-- Contraseña: admin123 (misma que admin)
-- Hash bcrypt de "admin123"

USE Xtask_dev;
GO

-- Actualizar contraseña de viky
UPDATE users 
SET [password] = '$2b$10$dXK5L9R17f.jLVTsBJHxI.Sc/L0AD8a8NuNlWrjvavYLYeZ0q7m5m'
WHERE username = 'viky';
GO

-- Verificar
SELECT id, username, email, role 
FROM users 
WHERE username = 'viky';
GO

PRINT '✅ Contraseña de viky actualizada a: admin123';
GO
