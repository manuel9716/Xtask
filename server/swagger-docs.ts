/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check del servidor
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Servidor funcionando correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: healthy
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 service:
 *                   type: string
 *                   example: xtask-platform
 */

/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: admin
 *               password:
 *                 type: string
 *                 example: admin123
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Credenciales inválidas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/logout:
 *   post:
 *     summary: Cerrar sesión
 *     tags: [Authentication]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Logout exitoso
 */

/**
 * @swagger
 * /api/user:
 *   get:
 *     summary: Obtener usuario actual
 *     tags: [Authentication]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Usuario actual
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: No autenticado
 */

/**
 * @swagger
 * /api/register:
 *   post:
 *     summary: Registrar nuevo usuario
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *               - email
 *               - fullName
 *             properties:
 *               username:
 *                 type: string
 *                 example: newuser
 *               password:
 *                 type: string
 *                 example: password123
 *               email:
 *                 type: string
 *                 example: newuser@xtask.com
 *               fullName:
 *                 type: string
 *                 example: New User
 *               role:
 *                 type: string
 *                 enum: [admin, manager, user]
 *                 example: user
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Usuario ya existe
 */

// ============================================
// PROYECTOS
// ============================================

/**
 * @swagger
 * /api/projects:
 *   get:
 *     summary: Obtener todos los proyectos
 *     tags: [Projects]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Lista de proyectos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Project'
 *   post:
 *     summary: Crear nuevo proyecto
 *     tags: [Projects]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - startDate
 *               - budget
 *             properties:
 *               name:
 *                 type: string
 *                 example: Nuevo Proyecto
 *               description:
 *                 type: string
 *                 example: Descripción del proyecto
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *               budget:
 *                 type: number
 *                 example: 1000000
 *               managerId:
 *                 type: integer
 *                 example: 2
 *               status:
 *                 type: string
 *                 example: active
 *               category:
 *                 type: string
 *                 example: Desarrollo
 *     responses:
 *       201:
 *         description: Proyecto creado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 */

/**
 * @swagger
 * /api/projects/{id}:
 *   get:
 *     summary: Obtener proyecto por ID
 *     tags: [Projects]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del proyecto
 *     responses:
 *       200:
 *         description: Proyecto encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       404:
 *         description: Proyecto no encontrado
 *   put:
 *     summary: Actualizar proyecto
 *     tags: [Projects]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *               budget:
 *                 type: number
 *     responses:
 *       200:
 *         description: Proyecto actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *   delete:
 *     summary: Eliminar proyecto
 *     tags: [Projects]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Proyecto eliminado
 *       404:
 *         description: Proyecto no encontrado
 */

// ============================================
// EMPLEADOS
// ============================================

/**
 * @swagger
 * /api/empleados:
 *   get:
 *     summary: Obtener todos los empleados
 *     tags: [Empleados]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Lista de empleados
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Empleado'
 *   post:
 *     summary: Crear nuevo empleado
 *     tags: [Empleados]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - apellido
 *               - identificacion
 *               - depto
 *               - cargo
 *               - fechaIngreso
 *               - tipoContrato
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Juan
 *               apellido:
 *                 type: string
 *                 example: Pérez
 *               identificacion:
 *                 type: string
 *                 example: "1234567890"
 *               depto:
 *                 type: string
 *                 example: Tecnología
 *               cargo:
 *                 type: string
 *                 example: Desarrollador
 *               fechaIngreso:
 *                 type: string
 *                 format: date
 *               tipoContrato:
 *                 type: string
 *                 example: indefinido
 *               salarioBase:
 *                 type: number
 *                 example: 3000000
 *               telefono:
 *                 type: string
 *                 example: "3001234567"
 *     responses:
 *       201:
 *         description: Empleado creado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Empleado'
 */

/**
 * @swagger
 * /api/empleados/{id}:
 *   get:
 *     summary: Obtener empleado por ID
 *     tags: [Empleados]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Empleado encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Empleado'
 *   put:
 *     summary: Actualizar empleado
 *     tags: [Empleados]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               apellido:
 *                 type: string
 *               salarioBase:
 *                 type: number
 *               telefono:
 *                 type: string
 *     responses:
 *       200:
 *         description: Empleado actualizado
 *   delete:
 *     summary: Eliminar empleado (soft delete)
 *     tags: [Empleados]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Empleado eliminado
 */

// ============================================
// NÓMINAS
// ============================================

/**
 * @swagger
 * /api/nominas:
 *   get:
 *     summary: Obtener todas las nóminas
 *     tags: [Nominas]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Lista de nóminas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Nomina'
 *   post:
 *     summary: Crear nueva nómina
 *     tags: [Nominas]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rangoInicio
 *               - rangoFin
 *               - creadoPor
 *             properties:
 *               proyectoId:
 *                 type: integer
 *                 example: 1
 *               rangoInicio:
 *                 type: string
 *                 format: date
 *               rangoFin:
 *                 type: string
 *                 format: date
 *               estado:
 *                 type: string
 *                 example: pendiente
 *               totalBruto:
 *                 type: number
 *                 example: 9000000
 *               totalNeto:
 *                 type: number
 *                 example: 7200000
 *               creadoPor:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       201:
 *         description: Nómina creada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Nomina'
 */

/**
 * @swagger
 * /api/budgets:
 *   get:
 *     summary: Obtener todos los presupuestos
 *     tags: [Budgets]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Lista de presupuestos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Budget'
 */

/**
 * @swagger
 * /api/transactions:
 *   get:
 *     summary: Obtener todas las transacciones
 *     tags: [Transactions]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: projectId
 *         schema:
 *           type: integer
 *         description: Filtrar por ID de proyecto
 *     responses:
 *       200:
 *         description: Lista de transacciones
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Transaction'
 *   post:
 *     summary: Crear nueva transacción
 *     tags: [Transactions]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - type
 *               - category
 *             properties:
 *               projectId:
 *                 type: integer
 *               amount:
 *                 type: number
 *                 example: 1000000
 *               type:
 *                 type: string
 *                 example: expense
 *               category:
 *                 type: string
 *                 example: development
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 example: pending
 *     responses:
 *       201:
 *         description: Transacción creada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Transaction'
 */

// Este archivo solo contiene documentación JSDoc para Swagger
// No exporta nada, solo se usa para generar la documentación
export {};
