# XTask API Reference

Este documento contiene la referencia completa de todas las APIs disponibles en la plataforma XTask. La documentación está organizada por módulos funcionales.

## Índice
- [Autenticación](#autenticación)
- [Proyectos](#proyectos)
- [Tareas](#tareas)
- [Empleados](#empleados)
- [Proveedores](#proveedores)
- [Transacciones](#transacciones)
- [Presupuestos](#presupuestos)
- [Nómina](#nómina)
- [Capacitaciones](#capacitaciones)
- [Microlearning](#microlearning)
- [Dashboard](#dashboard)

## Autenticación
| Endpoint | Método | Descripción | Parámetros | Respuesta |
|----------|--------|-------------|------------|-----------|
| `/api/auth/register` | POST | Registra un nuevo usuario | `{ username, password, email, fullName, role }` | Usuario creado con token JWT |
| `/api/auth/login` | POST | Inicia sesión | `{ username, password }` | Token JWT de autenticación |
| `/api/auth/logout` | POST | Cierra sesión | Requiere token | Confirmación de cierre |
| `/api/auth/me` | GET | Obtiene información del usuario actual | Requiere token | Datos del usuario |
| `/api/auth/validate-token` | POST | Valida un token JWT | `{ token }` | Estado de validez |
| `/api/user` | GET | Obtiene información del usuario autenticado | Requiere autenticación | Datos del usuario |

## Proyectos
| Endpoint | Método | Descripción | Parámetros | Respuesta |
|----------|--------|-------------|------------|-----------|
| `/api/projects` | GET | Lista todos los proyectos | - | Array de proyectos |
| `/api/projects` | POST | Crea un nuevo proyecto | `{ name, description, startDate, endDate, status }` | Proyecto creado |
| `/api/projects/:id` | GET | Obtiene un proyecto específico | ID en URL | Detalles del proyecto |
| `/api/proyectos` | GET | Lista todos los proyectos (versión en español) | - | Array de proyectos |
| `/api/proyectos/:id` | GET | Obtiene un proyecto específico (versión en español) | ID en URL | Detalles del proyecto |
| `/api/proyectos/:id` | PATCH | Actualiza un proyecto | ID en URL, datos a actualizar | Proyecto actualizado |
| `/api/proyectos/:id/estado` | PATCH | Actualiza el estado de un proyecto | ID en URL, `{ estado }` | Confirmación |
| `/api/proyectos/:id` | DELETE | Elimina un proyecto | ID en URL | Confirmación |
| `/api/proyectos/indicadores` | GET | Obtiene indicadores de proyectos | - | Datos de indicadores |

## Tareas
| Endpoint | Método | Descripción | Parámetros | Respuesta |
|----------|--------|-------------|------------|-----------|
| `/api/tasks` | GET | Lista todas las tareas | `?projectId=X` (opcional) | Array de tareas |
| `/api/tasks` | POST | Crea una nueva tarea | `{ title, description, status, dueDate, assigneeId, projectId }` | Tarea creada |
| `/api/tasks/:id` | PATCH | Actualiza una tarea | ID en URL, datos a actualizar | Tarea actualizada |

## Empleados
| Endpoint | Método | Descripción | Parámetros | Respuesta |
|----------|--------|-------------|------------|-----------|
| `/api/employees` | GET | Lista todos los empleados | - | Array de empleados |
| `/api/employees` | POST | Registra un nuevo empleado | Datos del empleado | Empleado creado |
| `/api/employee-projects` | Varios | Gestión de asignaciones de empleados a proyectos | Varía según operación | Resultados correspondientes |

## Proveedores
| Endpoint | Método | Descripción | Parámetros | Respuesta |
|----------|--------|-------------|------------|-----------|
| `/api/suppliers` | GET | Lista todos los proveedores | - | Array de proveedores |
| `/api/suppliers` | POST | Registra un nuevo proveedor | Datos del proveedor | Proveedor creado |

## Transacciones
| Endpoint | Método | Descripción | Parámetros | Respuesta |
|----------|--------|-------------|------------|-----------|
| `/api/transactions` | GET | Lista todas las transacciones | `?projectId=X` (opcional) | Array de transacciones |
| `/api/transactions` | POST | Registra una nueva transacción | Datos de la transacción | Transacción creada |
| `/api/transactions/:id/approve` | PATCH | Aprueba una transacción | ID en URL | Transacción actualizada |
| `/api/transactions/:id/reject` | PATCH | Rechaza una transacción | ID en URL | Transacción actualizada |

## Presupuestos
| Endpoint | Método | Descripción | Parámetros | Respuesta |
|----------|--------|-------------|------------|-----------|
| `/api/presupuestos` | GET | Lista todos los presupuestos | `?organizationId=X` (opcional) | Array de presupuestos |
| `/api/presupuestos` | POST | Crea un nuevo presupuesto | Datos del presupuesto | Presupuesto creado |
| `/api/presupuestos/:id` | GET | Obtiene un presupuesto específico | ID en URL | Detalles del presupuesto |
| `/api/presupuestos/:id` | PATCH | Actualiza un presupuesto | ID en URL, datos a actualizar | Presupuesto actualizado |
| `/api/presupuestos/:id/gastos` | POST | Registra un gasto en un presupuesto | ID en URL, `{ monto, ... }` | Confirmación |

## Nómina
| Endpoint | Método | Descripción | Parámetros | Respuesta |
|----------|--------|-------------|------------|-----------|
| `/api/nomina/empleados/listar` | GET | Lista empleados para nómina | - | Listado de empleados |
| `/api/nomina/:id` | GET | Obtiene detalles de una nómina | ID en URL | Detalles de nómina |
| `/api/nomina/generar` | POST | Genera una nueva nómina | Datos de la nómina | Nómina generada |
| `/api/nomina/:id/marcar-pagada` | PATCH | Marca nómina como pagada | ID en URL | Confirmación |
| `/api/nomina/:id/cancelar` | PATCH | Cancela una nómina | ID en URL | Confirmación |
| `/api/nomina/empleado/:id` | GET | Obtiene historial de nómina por empleado | ID empleado en URL | Historial |
| `/api/nomina/desprendible/generar` | POST | Genera recibo de nómina | Datos necesarios | URL del recibo |
| `/api/nomina/:id/desprendible-url` | GET | Obtiene URL de recibo existente | ID en URL | URL del recibo |
| `/api/nomina/v1/dashboard` | GET | Obtiene datos para dashboard de nómina | - | Indicadores de nómina |
| `/api/nomina/v1/listar` | GET | Lista todas las nóminas (nueva versión) | - | Listado de nóminas |
| `/api/nomina/v1/detalle/:id` | GET | Obtiene detalles de nómina (nueva versión) | ID en URL | Detalles completos |
| `/api/nomina/v1/procesarNomina` | POST | Procesa una nueva nómina (nueva versión) | Datos de la nómina | Nómina procesada |

> **Nota:** También existen endpoints legacy en `/api/nomina/legacy/...` que mantienen compatibilidad con versiones anteriores.

## Capacitaciones
| Endpoint | Método | Descripción | Parámetros | Respuesta |
|----------|--------|-------------|------------|-----------|
| `/api/capacitaciones` | GET | Lista todas las capacitaciones | - | Array de capacitaciones |
| `/api/capacitaciones` | POST | Crea una nueva capacitación | Datos de la capacitación | Capacitación creada |
| `/api/capacitaciones/:id` | GET | Obtiene detalles de una capacitación | ID en URL | Detalles completos |
| `/api/capacitaciones/:id` | PATCH | Actualiza una capacitación | ID en URL, datos a actualizar | Capacitación actualizada |
| `/api/capacitaciones/:id` | DELETE | Elimina una capacitación | ID en URL | Confirmación |
| `/api/capacitaciones/:id/estado` | PATCH | Actualiza el estado de una capacitación | ID en URL, `{ estado }` | Confirmación |
| `/api/capacitaciones/estado/programadas` | GET | Lista capacitaciones programadas | - | Listado filtrado |
| `/api/capacitaciones/estado/en-curso` | GET | Lista capacitaciones en curso | - | Listado filtrado |
| `/api/capacitaciones/:id/inscripciones` | GET | Lista inscripciones a una capacitación | ID en URL | Listado de inscritos |
| `/api/capacitaciones/:id/inscripciones` | POST | Inscribe empleados a una capacitación | ID en URL, datos de inscripción | Confirmación |
| `/api/capacitaciones/empleado/:empleadoId` | GET | Obtiene capacitaciones de un empleado | ID empleado en URL | Listado de capacitaciones |
| `/api/capacitaciones/:id/inscripciones/:empleadoId/asistencia` | PATCH | Registra asistencia | IDs en URL, `{ asistio }` | Confirmación |
| `/api/capacitaciones/:id/inscripciones/:empleadoId/completar` | PATCH | Marca capacitación como completada | IDs en URL | Confirmación |
| `/api/capacitaciones/estadisticas/resumen` | GET | Obtiene estadísticas de capacitaciones | - | Datos estadísticos |

## Microlearning
| Endpoint | Método | Descripción | Parámetros | Respuesta |
|----------|--------|-------------|------------|-----------|
| `/api/microlearning/contenidos` | GET | Lista contenidos de microlearning | - | Array de contenidos |
| `/api/microlearning/contenidos/:id` | GET | Obtiene un contenido específico | ID en URL | Detalles del contenido |
| `/api/microlearning/categorias` | GET | Lista categorías de contenidos | - | Lista de categorías |
| `/api/microlearning/recomendaciones` | POST | Obtiene recomendaciones de contenido | Criterios de recomendación | Contenidos recomendados |
| `/api/microlearning/recomendaciones/contextuales` | POST | Recomendaciones basadas en contexto | Datos de contexto | Contenidos recomendados |
| `/api/microlearning/progreso` | POST | Registra progreso en un contenido | Datos de progreso | Confirmación |
| `/api/microlearning/valoracion` | POST | Registra valoración de contenido | Datos de valoración | Confirmación |

## Dashboard
| Endpoint | Método | Descripción | Parámetros | Respuesta |
|----------|--------|-------------|------------|-----------|
| `/api/dashboard/layouts` | GET | Lista layouts de dashboard | - | Array de layouts |
| `/api/dashboard/layouts` | POST | Crea un nuevo layout | Datos del layout | Layout creado |
| `/api/dashboard/layouts/:id` | GET | Obtiene un layout específico | ID en URL | Detalles del layout |
| `/api/dashboard/layouts/:id` | PATCH | Actualiza un layout | ID en URL, datos a actualizar | Layout actualizado |
| `/api/dashboard/layouts/:id` | DELETE | Elimina un layout | ID en URL | Confirmación |
| `/api/dashboard/layouts/default` | GET | Obtiene el layout por defecto | - | Layout por defecto |
| `/api/dashboard/layouts/:id/default` | POST | Establece un layout como predeterminado | ID en URL | Confirmación |
| `/api/dashboard/layouts/:id/positions` | PATCH | Actualiza posiciones de widgets | ID en URL, datos de posiciones | Confirmación |
| `/api/dashboard/layouts/:id/widgets` | POST | Añade un widget a un layout | ID en URL, datos del widget | Widget añadido |
| `/api/dashboard/layouts/:id/widgets/:widgetId` | PATCH | Actualiza un widget | IDs en URL, datos a actualizar | Widget actualizado |
| `/api/dashboard/layouts/:id/widgets/:widgetId` | DELETE | Elimina un widget | IDs en URL | Confirmación |

## Usuarios
| Endpoint | Método | Descripción | Parámetros | Respuesta |
|----------|--------|-------------|------------|-----------|
| `/api/users` | GET | Lista todos los usuarios | - | Array de usuarios |

---

## Notas de uso
- Todas las rutas están protegidas por autenticación excepto `/api/auth/login` y `/api/auth/register`.
- Se requiere incluir el token JWT en el encabezado de la petición: `Authorization: Bearer {token}`.
- Los errores se devuelven con códigos HTTP apropiados (400, 401, 403, 404, 500) y un mensaje descriptivo.
- La paginación está disponible en endpoints que devuelven listas grandes usando los parámetros `?page=X&pageSize=Y`.
- Los timestamps se devuelven en formato ISO 8601.

## Convenciones de formato
- **GET**: Para obtener/listar recursos
- **POST**: Para crear nuevos recursos
- **PATCH**: Para actualizar parcialmente un recurso
- **PUT**: Para reemplazar completamente un recurso
- **DELETE**: Para eliminar recursos

## Códigos de estado HTTP
- **200 OK**: Petición exitosa con respuesta
- **201 Created**: Recurso creado exitosamente
- **204 No Content**: Petición exitosa sin contenido de respuesta
- **400 Bad Request**: Error en la petición del cliente
- **401 Unauthorized**: Autenticación requerida o fallida
- **403 Forbidden**: Cliente autenticado pero sin permisos
- **404 Not Found**: Recurso no encontrado
- **500 Internal Server Error**: Error del servidor