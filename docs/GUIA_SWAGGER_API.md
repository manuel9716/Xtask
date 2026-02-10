# 📚 Guía de Swagger API - XtaskFlow

**Fecha**: 13 de Octubre, 2025 - 11:00 AM

---

## 🎉 ¡Swagger Configurado Exitosamente!

Ahora puedes **probar todos los endpoints** de la API directamente desde tu navegador.

---

## 🌐 Acceso a Swagger UI

### URL Principal

```
http://localhost:5001/api-docs
```

### Especificación JSON

```
http://localhost:5001/api-docs.json
```

---

## 🚀 Cómo Usar Swagger

### 1. Abrir Swagger UI

1. Abre tu navegador
2. Ve a: `http://localhost:5001/api-docs`
3. Verás la interfaz de Swagger con todos los endpoints documentados

### 2. Autenticación

Para probar endpoints protegidos, primero debes autenticarte:

#### Opción A: Desde Swagger

1. Busca el endpoint **POST /api/login** en la sección "Authentication"
2. Haz clic en "Try it out"
3. Ingresa las credenciales:
   ```json
   {
     "username": "viky",
     "password": "admin123"
   }
   ```
4. Haz clic en "Execute"
5. La cookie de sesión se guardará automáticamente

#### Opción B: Desde la Aplicación

1. Inicia sesión normalmente en `http://localhost:5001`
2. Luego abre Swagger en otra pestaña
3. La sesión se compartirá automáticamente

### 3. Probar Endpoints

1. **Selecciona un endpoint** (ej: GET /api/projects)
2. Haz clic en **"Try it out"**
3. **Completa los parámetros** si es necesario
4. Haz clic en **"Execute"**
5. **Revisa la respuesta** en la sección "Response"

---

## 📋 Endpoints Documentados

### 🔐 Authentication

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/login` | Iniciar sesión |
| POST | `/api/logout` | Cerrar sesión |
| POST | `/api/register` | Registrar usuario |
| GET | `/api/user` | Obtener usuario actual |

### 👥 Users

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/users` | Listar usuarios |
| GET | `/api/users/{id}` | Obtener usuario |
| POST | `/api/users` | Crear usuario |
| PUT | `/api/users/{id}` | Actualizar usuario |
| DELETE | `/api/users/{id}` | Eliminar usuario |

### 📁 Projects

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/projects` | Listar proyectos |
| GET | `/api/projects/{id}` | Obtener proyecto |
| POST | `/api/projects` | Crear proyecto |
| PUT | `/api/projects/{id}` | Actualizar proyecto |
| DELETE | `/api/projects/{id}` | Eliminar proyecto |

### 👨‍💼 Empleados

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/empleados` | Listar empleados |
| GET | `/api/empleados/{id}` | Obtener empleado |
| POST | `/api/empleados` | Crear empleado |
| PUT | `/api/empleados/{id}` | Actualizar empleado |
| DELETE | `/api/empleados/{id}` | Eliminar empleado (soft) |

### 💰 Nóminas

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/nominas` | Listar nóminas |
| GET | `/api/nominas/{id}` | Obtener nómina |
| POST | `/api/nominas` | Crear nómina |
| PUT | `/api/nominas/{id}` | Actualizar nómina |
| GET | `/api/nominas/{id}/items` | Items de nómina |

### 💵 Budgets

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/budgets` | Listar presupuestos |
| GET | `/api/budgets/{id}` | Obtener presupuesto |
| POST | `/api/budgets` | Crear presupuesto |
| GET | `/api/budgets/{id}/expenses` | Gastos del presupuesto |

### 💳 Transactions

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/transactions` | Listar transacciones |
| GET | `/api/transactions?projectId={id}` | Por proyecto |
| POST | `/api/transactions` | Crear transacción |

### 🏥 Health

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/health` | Estado del servidor |

---

## 🎯 Ejemplos de Uso

### Ejemplo 1: Login

```bash
# Request
POST /api/login
Content-Type: application/json

{
  "username": "viky",
  "password": "admin123"
}

# Response 200
{
  "id": 2,
  "username": "viky",
  "email": "mgiraldo3163@gmail.com",
  "fullName": "Victoria Giraldo",
  "role": "admin",
  "isActive": true,
  "createdAt": "2025-10-13T10:00:00.000Z"
}
```

### Ejemplo 2: Crear Proyecto

```bash
# Request
POST /api/projects
Content-Type: application/json
Cookie: connect.sid=...

{
  "name": "Nuevo Proyecto",
  "description": "Descripción del proyecto",
  "startDate": "2025-01-01T00:00:00.000Z",
  "budget": 5000000,
  "status": "active",
  "category": "Desarrollo"
}

# Response 201
{
  "id": 5,
  "name": "Nuevo Proyecto",
  "description": "Descripción del proyecto",
  "startDate": "2025-01-01T00:00:00.000Z",
  "endDate": null,
  "budget": 5000000,
  "remainingBudget": 5000000,
  "managerId": null,
  "status": "active",
  "category": "Desarrollo",
  "createdAt": "2025-10-13T11:00:00.000Z"
}
```

### Ejemplo 3: Listar Empleados

```bash
# Request
GET /api/empleados
Cookie: connect.sid=...

# Response 200
[
  {
    "id": 1,
    "userId": 4,
    "nombre": "Manuel",
    "apellido": "Rodríguez",
    "identificacion": "1115193230",
    "depto": "Tecnología",
    "cargo": "Arquitecto de Software",
    "fechaIngreso": "2021-03-15",
    "salarioBase": 4500000,
    "telefono": "3166684650",
    "activo": true
  },
  {
    "id": 2,
    "userId": 2,
    "nombre": "Victoria",
    "apellido": "Giraldo",
    "identificacion": "43123456",
    "depto": "Administración",
    "cargo": "Gerente General",
    "fechaIngreso": "2020-01-10",
    "salarioBase": 8000000,
    "telefono": "3001234567",
    "activo": true
  }
]
```

---

## 🔧 Características de Swagger

### ✅ Funcionalidades Disponibles

1. **Try it out**: Probar endpoints directamente
2. **Request samples**: Ver ejemplos de requests
3. **Response samples**: Ver ejemplos de responses
4. **Schemas**: Ver modelos de datos
5. **Authentication**: Autenticación con cookies
6. **Download spec**: Descargar especificación OpenAPI

### 📊 Información Mostrada

Para cada endpoint verás:

- **Método HTTP** (GET, POST, PUT, DELETE)
- **URL del endpoint**
- **Descripción** del endpoint
- **Parámetros** requeridos y opcionales
- **Request body** con schema y ejemplo
- **Responses** posibles con códigos de estado
- **Schemas** de los modelos de datos

---

## 🎨 Personalización

### Cambiar Puerto

Si el servidor corre en otro puerto, actualiza en `server/swagger.ts`:

```typescript
servers: [
  {
    url: 'http://localhost:TU_PUERTO',
    description: 'Servidor de Desarrollo',
  },
]
```

### Agregar Más Endpoints

Para documentar nuevos endpoints, agrega comentarios JSDoc en `server/swagger-docs.ts`:

```typescript
/**
 * @swagger
 * /api/tu-endpoint:
 *   get:
 *     summary: Descripción
 *     tags: [TuTag]
 *     responses:
 *       200:
 *         description: Respuesta exitosa
 */
```

### Agregar Nuevos Schemas

En `server/swagger.ts`, sección `components.schemas`:

```typescript
TuModelo: {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    name: { type: 'string' },
  },
}
```

---

## 🐛 Solución de Problemas

### Swagger no carga

**Causa**: Servidor no está corriendo

**Solución**:
```bash
npm run dev
```

### Endpoints no aparecen

**Causa**: Documentación no está en los archivos escaneados

**Solución**: Verifica que los comentarios JSDoc estén en archivos `.ts` dentro de `server/`

### Autenticación no funciona

**Causa**: Cookie no se está enviando

**Solución**: 
1. Haz login desde `/api/login` en Swagger
2. O inicia sesión en la app primero

### Error 401 en endpoints

**Causa**: No estás autenticado

**Solución**: Ejecuta POST `/api/login` primero

---

## 📚 Recursos Adicionales

### Documentación Oficial

- **Swagger UI**: https://swagger.io/tools/swagger-ui/
- **OpenAPI Spec**: https://swagger.io/specification/
- **swagger-jsdoc**: https://github.com/Surnet/swagger-jsdoc

### Archivos del Proyecto

| Archivo | Descripción |
|---------|-------------|
| `server/swagger.ts` | Configuración principal |
| `server/swagger-docs.ts` | Documentación de endpoints |
| `server/index.ts` | Integración con Express |

---

## 🎯 Casos de Uso

### 1. Testing de API

Usa Swagger para probar endpoints sin necesidad de Postman:

1. Abre Swagger UI
2. Haz login
3. Prueba cualquier endpoint
4. Verifica respuestas

### 2. Documentación para Frontend

El equipo de frontend puede ver:
- Endpoints disponibles
- Parámetros requeridos
- Formato de respuestas
- Ejemplos de uso

### 3. Generación de Clientes

Descarga el spec JSON y genera clientes automáticamente:

```bash
# Descargar spec
curl http://localhost:5001/api-docs.json > openapi.json

# Generar cliente TypeScript
npx @openapitools/openapi-generator-cli generate \
  -i openapi.json \
  -g typescript-axios \
  -o ./generated-client
```

### 4. Testing Automatizado

Usa el spec para testing:

```bash
npm install --save-dev jest-openapi
```

---

## ✅ Checklist de Uso

- [ ] Servidor corriendo en puerto 5001
- [ ] Swagger UI accesible en `/api-docs`
- [ ] Login exitoso desde Swagger
- [ ] Endpoints de proyectos funcionando
- [ ] Endpoints de empleados funcionando
- [ ] Endpoints de nóminas funcionando
- [ ] Respuestas correctas en todos los endpoints

---

## 🎉 Resumen

### URLs Importantes

```
🌐 Aplicación: http://localhost:5001
📚 Swagger UI: http://localhost:5001/api-docs
📄 OpenAPI JSON: http://localhost:5001/api-docs.json
```

### Credenciales de Prueba

```
Usuario: viky
Contraseña: admin123
```

### Endpoints Documentados

- ✅ Authentication (4 endpoints)
- ✅ Projects (5 endpoints)
- ✅ Empleados (5 endpoints)
- ✅ Nóminas (5+ endpoints)
- ✅ Budgets (3+ endpoints)
- ✅ Transactions (2+ endpoints)
- ✅ Health (1 endpoint)

---

**¡Swagger está listo para usar! 🚀**

Abre `http://localhost:5001/api-docs` y comienza a probar los endpoints.

---

**Última actualización**: 13 de Octubre, 2025 - 11:00 AM
