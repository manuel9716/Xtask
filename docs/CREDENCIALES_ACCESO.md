# 🔐 Credenciales de Acceso - XtaskFlow

**Fecha**: 13 de Octubre, 2025 - 10:56 AM

---

## 🌐 URL de Acceso

```
http://localhost:5001
```

---

## 👥 Usuarios Disponibles

### Usuario 1: Admin

```
Usuario: admin
Contraseña: admin123
Email: admin@xtask.com
Rol: admin
```

### Usuario 2: Viky (Victoria Giraldo)

```
Usuario: viky
Contraseña: admin123
Email: mgiraldo3163@gmail.com
Rol: admin
```

### Usuario 3: jperez

```
Usuario: jperez
Contraseña: [Necesita actualización]
Email: jperez@xtask.com
Rol: manager
```

### Usuario 4: mrodriguez

```
Usuario: mrodriguez
Contraseña: [Necesita actualización]
Email: mrodriguez@xtask.com
Rol: user
```

---

## 🔧 Actualizar Contraseñas

Si necesitas actualizar la contraseña de otros usuarios, ejecuta:

```bash
npx tsx infrastructure/scripts/update-user-password.ts
```

Y modifica el script para cambiar el usuario deseado.

---

## ✅ Usuarios Funcionales

| Usuario | Contraseña | Estado |
|---------|------------|--------|
| `admin` | `admin123` | ✅ Funcional |
| `viky` | `admin123` | ✅ Funcional |
| `jperez` | - | ⚠️ Requiere actualización |
| `mrodriguez` | - | ⚠️ Requiere actualización |

---

## 🚀 Cómo Iniciar Sesión

1. Abre tu navegador
2. Ve a: `http://localhost:5001`
3. Ingresa las credenciales:
   - **Usuario**: `viky` o `admin`
   - **Contraseña**: `admin123`
4. Haz clic en "Iniciar sesión"

---

## 🔐 Seguridad

### Contraseñas Hasheadas

Todas las contraseñas están hasheadas con **bcrypt**:

```
admin123 → $2b$10$dXK5L9R17f.jLVTsBJHxI.Sc/L0AD8a8NuNlWrjvavYLYeZ0q7m5m
```

### Cambiar Contraseña en Producción

⚠️ **IMPORTANTE**: En producción, cambia estas contraseñas por defecto.

Para cambiar una contraseña:

1. Genera un nuevo hash bcrypt
2. Actualiza en la base de datos:

```sql
UPDATE users 
SET [password] = 'nuevo_hash_bcrypt'
WHERE username = 'usuario';
```

---

## 📝 Notas

- Todos los usuarios con rol `admin` tienen acceso completo
- Los usuarios con rol `manager` tienen permisos limitados
- Los usuarios con rol `user` tienen acceso básico

---

## 🐛 Solución de Problemas

### Error: "Invalid credentials"

**Causa**: Usuario o contraseña incorrectos

**Solución**:
1. Verifica que estés usando `viky` o `admin`
2. Verifica que la contraseña sea exactamente `admin123`
3. No debe haber espacios extra

### Error: 500 Internal Server Error

**Causa**: Problema en el servidor

**Solución**:
1. Verifica que el servidor esté corriendo: `lsof -ti:5001`
2. Revisa los logs en la terminal
3. Reinicia el servidor: `npm run dev`

### Usuario no encontrado

**Causa**: El usuario no existe en la base de datos

**Solución**:
1. Verifica que el usuario exista:
   ```sql
   SELECT * FROM users WHERE username = 'tu_usuario';
   ```
2. Si no existe, créalo desde la aplicación o con SQL

---

## 📚 Scripts Útiles

### Actualizar Contraseña de Usuario

```bash
npx tsx infrastructure/scripts/update-user-password.ts
```

### Ver Todos los Usuarios

```sql
SELECT id, username, email, role, is_active 
FROM users 
ORDER BY id;
```

### Crear Nuevo Usuario

```sql
INSERT INTO users (username, [password], email, full_name, [role], is_active)
VALUES (
    'nuevo_usuario',
    '$2b$10$dXK5L9R17f.jLVTsBJHxI.Sc/L0AD8a8NuNlWrjvavYLYeZ0q7m5m', -- admin123
    'nuevo@xtask.com',
    'Nuevo Usuario',
    'user',
    1
);
```

---

## ✅ Resumen

**Usuarios listos para usar**:
- ✅ `admin` / `admin123`
- ✅ `viky` / `admin123`

**Servidor**:
- ✅ Corriendo en `http://localhost:5001`

**Estado**:
- ✅ Login funcionando correctamente
- ✅ Autenticación operativa
- ✅ Sesiones funcionando

---

**¡Ya puedes iniciar sesión! 🎉**

Usa:
- Usuario: `viky`
- Contraseña: `admin123`

---

**Última actualización**: 13 de Octubre, 2025 - 10:56 AM
