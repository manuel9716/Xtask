# Diccionario de Datos - XTask

Este documento describe la estructura de la base de datos utilizada en XTask, detallando cada tabla, sus columnas, tipos de datos, restricciones y relaciones.

## Índice de Tablas

1. [users](#tabla-users) - Usuarios del sistema
2. [employees](#tabla-employees) - Empleados registrados
3. [projects](#tabla-projects) - Proyectos
4. [tasks](#tabla-tasks) - Tareas de proyectos
5. [task_comments](#tabla-task_comments) - Comentarios en tareas
6. [employee_projects](#tabla-employee_projects) - Relación entre empleados y proyectos
7. [transactions](#tabla-transactions) - Transacciones financieras
8. [budgets](#tabla-budgets) - Presupuestos
9. [budget_expenses](#tabla-budget_expenses) - Gastos de presupuestos
10. [suppliers](#tabla-suppliers) - Proveedores
11. [products](#tabla-products) - Productos
12. [purchase_orders](#tabla-purchase_orders) - Órdenes de compra
13. [purchase_order_items](#tabla-purchase_order_items) - Items de órdenes de compra
14. [invoices](#tabla-invoices) - Facturas
15. [invoice_items](#tabla-invoice_items) - Items de facturas
16. [payrolls](#tabla-payrolls) - Nóminas
17. [financial_categories](#tabla-financial_categories) - Categorías financieras
18. [financial_reports](#tabla-financial_reports) - Reportes financieros
19. [financial_audits](#tabla-financial_audits) - Auditorías financieras
20. [settings](#tabla-settings) - Configuraciones

## Definición de Tablas

### Tabla: users

Esta tabla almacena la información básica de los usuarios que acceden al sistema.

| Columna          | Tipo          | Descripción                                           | Restricciones                   |
|------------------|---------------|-------------------------------------------------------|--------------------------------|
| id               | SERIAL        | Identificador único del usuario                       | PRIMARY KEY                     |
| username         | VARCHAR(255)  | Nombre de usuario para acceso al sistema              | NOT NULL, UNIQUE                |
| email            | VARCHAR(255)  | Correo electrónico del usuario                        | NOT NULL, UNIQUE                |
| password         | VARCHAR(255)  | Contraseña encriptada del usuario                     | NOT NULL                        |
| full_name        | VARCHAR(255)  | Nombre completo del usuario                           | NOT NULL                        |
| role             | VARCHAR(50)   | Rol del usuario en el sistema (admin, user, etc.)     | NOT NULL                        |
| created_at       | TIMESTAMP     | Fecha y hora de creación del registro                 | NOT NULL, DEFAULT CURRENT_TIMESTAMP |
| updated_at       | TIMESTAMP     | Fecha y hora de la última actualización               | NULL                            |

### Tabla: employees

Esta tabla almacena la información detallada de los empleados de la empresa.

| Columna              | Tipo          | Descripción                                           | Restricciones                   |
|----------------------|---------------|-------------------------------------------------------|--------------------------------|
| id                   | SERIAL        | Identificador único del empleado                      | PRIMARY KEY                     |
| user_id              | INTEGER       | ID del usuario relacionado                            | FOREIGN KEY (users.id)          |
| first_name           | VARCHAR(100)  | Nombre del empleado                                   | NOT NULL                        |
| last_name            | VARCHAR(100)  | Apellido del empleado                                 | NOT NULL                        |
| position             | VARCHAR(100)  | Cargo o posición en la empresa                        | NOT NULL                        |
| department           | VARCHAR(100)  | Departamento al que pertenece                         | NOT NULL                        |
| hire_date            | DATE          | Fecha de contratación                                 | NOT NULL                        |
| contract_status      | VARCHAR(50)   | Estado del contrato (active, inactive, etc.)          | NOT NULL                        |
| salary               | DECIMAL(12,2) | Salario base del empleado                             | NOT NULL                        |
| address              | TEXT          | Dirección del empleado                                | NULL                            |
| phone                | VARCHAR(20)   | Número telefónico                                     | NULL                            |
| email                | VARCHAR(255)  | Correo electrónico del empleado                       | NULL                            |
| birth_date           | DATE          | Fecha de nacimiento                                   | NULL                            |
| identity_number      | VARCHAR(50)   | Número de identificación (DNI, NIE, etc.)             | NULL                            |
| social_security_number | VARCHAR(50) | Número de seguridad social                            | NULL                            |
| bank_account         | VARCHAR(50)   | Cuenta bancaria para pagos                            | NULL                            |
| emergency_contact    | VARCHAR(255)  | Contacto de emergencia                                | NULL                            |
| emergency_phone      | VARCHAR(20)   | Teléfono de contacto de emergencia                    | NULL                            |
| notes                | TEXT          | Notas adicionales                                     | NULL                            |
| photo_url            | VARCHAR(255)  | URL de la foto de perfil                              | NULL                            |
| id_employed_proyects | INTEGER       | ID del proyecto principal asignado                    | FOREIGN KEY (projects.id), NULL |

### Tabla: projects

Esta tabla almacena la información de los proyectos de la empresa.

| Columna              | Tipo          | Descripción                                           | Restricciones                   |
|----------------------|---------------|-------------------------------------------------------|--------------------------------|
| id                   | SERIAL        | Identificador único del proyecto                      | PRIMARY KEY                     |
| name                 | VARCHAR(100)  | Nombre del proyecto                                   | NOT NULL                        |
| description          | TEXT          | Descripción detallada del proyecto                    | NULL                            |
| status               | VARCHAR(50)   | Estado del proyecto (active, paused, completed, etc.) | NOT NULL                        |
| start_date           | DATE          | Fecha de inicio del proyecto                          | NOT NULL                        |
| end_date             | DATE          | Fecha estimada de finalización                         | NULL                            |
| actual_end_date      | DATE          | Fecha real de finalización                            | NULL                            |
| manager_id           | INTEGER       | ID del empleado responsable del proyecto              | FOREIGN KEY (employees.id), NULL |
| client_name          | VARCHAR(100)  | Nombre del cliente                                    | NULL                            |
| client_contact       | VARCHAR(255)  | Información de contacto del cliente                   | NULL                            |
| budget               | DECIMAL(12,2) | Presupuesto asignado al proyecto                      | NULL                            |
| actual_cost          | DECIMAL(12,2) | Costo real del proyecto                               | NULL                            |
| priority             | VARCHAR(50)   | Prioridad del proyecto (low, medium, high, urgent)    | NULL                            |
| created_at           | TIMESTAMP     | Fecha y hora de creación del registro                 | NOT NULL, DEFAULT CURRENT_TIMESTAMP |
| updated_at           | TIMESTAMP     | Fecha y hora de la última actualización               | NULL                            |

### Tabla: tasks

Esta tabla almacena las tareas asociadas a los proyectos.

| Columna              | Tipo          | Descripción                                           | Restricciones                   |
|----------------------|---------------|-------------------------------------------------------|--------------------------------|
| id                   | SERIAL        | Identificador único de la tarea                       | PRIMARY KEY                     |
| project_id           | INTEGER       | ID del proyecto al que pertenece                      | FOREIGN KEY (projects.id)       |
| title                | VARCHAR(100)  | Título de la tarea                                    | NOT NULL                        |
| description          | TEXT          | Descripción detallada de la tarea                     | NULL                            |
| status               | VARCHAR(50)   | Estado de la tarea (pending, in_progress, completed)  | NOT NULL                        |
| priority             | VARCHAR(50)   | Prioridad de la tarea (low, medium, high, urgent)     | NOT NULL                        |
| assigned_to          | INTEGER       | ID del empleado asignado                              | FOREIGN KEY (employees.id), NULL |
| created_by           | INTEGER       | ID del usuario que creó la tarea                      | FOREIGN KEY (users.id)          |
| start_date           | DATE          | Fecha de inicio programada                            | NULL                            |
| due_date             | DATE          | Fecha límite de entrega                               | NULL                            |
| completed_date       | DATE          | Fecha real de finalización                            | NULL                            |
| estimated_hours      | DECIMAL(6,2)  | Horas estimadas para completar la tarea               | NULL                            |
| actual_hours         | DECIMAL(6,2)  | Horas reales utilizadas                               | NULL                            |
| created_at           | TIMESTAMP     | Fecha y hora de creación del registro                 | NOT NULL, DEFAULT CURRENT_TIMESTAMP |
| updated_at           | TIMESTAMP     | Fecha y hora de la última actualización               | NULL                            |

### Tabla: task_comments

Esta tabla almacena los comentarios asociados a las tareas.

| Columna              | Tipo          | Descripción                                           | Restricciones                   |
|----------------------|---------------|-------------------------------------------------------|--------------------------------|
| id                   | SERIAL        | Identificador único del comentario                    | PRIMARY KEY                     |
| task_id              | INTEGER       | ID de la tarea relacionada                            | FOREIGN KEY (tasks.id)          |
| user_id              | INTEGER       | ID del usuario que hizo el comentario                 | FOREIGN KEY (users.id)          |
| comment              | TEXT          | Contenido del comentario                              | NOT NULL                        |
| created_at           | TIMESTAMP     | Fecha y hora de creación del comentario               | NOT NULL, DEFAULT CURRENT_TIMESTAMP |
| updated_at           | TIMESTAMP     | Fecha y hora de la última actualización               | NULL                            |

### Tabla: employee_projects

Esta tabla establece la relación muchos a muchos entre empleados y proyectos.

| Columna              | Tipo          | Descripción                                           | Restricciones                   |
|----------------------|---------------|-------------------------------------------------------|--------------------------------|
| employee_id          | INTEGER       | ID del empleado                                       | FOREIGN KEY (employees.id)      |
| project_id           | INTEGER       | ID del proyecto                                       | FOREIGN KEY (projects.id)       |
| role                 | VARCHAR(100)  | Rol del empleado en el proyecto                       | NULL                            |
| assigned_date        | DATE          | Fecha de asignación al proyecto                       | NOT NULL                        |
| hours_allocated      | DECIMAL(6,2)  | Horas semanales asignadas                             | NULL                            |
| PRIMARY KEY          | (employee_id, project_id) | Clave primaria compuesta                  |                                |

### Tabla: transactions

Esta tabla almacena las transacciones financieras.

| Columna              | Tipo          | Descripción                                           | Restricciones                   |
|----------------------|---------------|-------------------------------------------------------|--------------------------------|
| id                   | SERIAL        | Identificador único de la transacción                 | PRIMARY KEY                     |
| type                 | VARCHAR(50)   | Tipo de transacción (income, expense)                 | NOT NULL                        |
| amount               | DECIMAL(12,2) | Monto de la transacción                               | NOT NULL                        |
| description          | TEXT          | Descripción detallada                                 | NULL                            |
| category             | VARCHAR(100)  | Categoría de la transacción                           | NULL                            |
| transaction_date     | DATE          | Fecha de la transacción                               | NOT NULL                        |
| project_id           | INTEGER       | ID del proyecto relacionado                           | FOREIGN KEY (projects.id), NULL |
| supplier_id          | INTEGER       | ID del proveedor relacionado                          | FOREIGN KEY (suppliers.id), NULL |
| status               | VARCHAR(50)   | Estado (pending, approved, rejected)                  | NOT NULL                        |
| created_by           | INTEGER       | ID del usuario que creó la transacción                | FOREIGN KEY (users.id)          |
| approved_by          | INTEGER       | ID del usuario que aprobó la transacción              | FOREIGN KEY (users.id), NULL    |
| approval_date        | DATE          | Fecha de aprobación                                   | NULL                            |
| payment_method       | VARCHAR(50)   | Método de pago utilizado                              | NULL                            |
| reference_number     | VARCHAR(100)  | Número de referencia                                  | NULL                            |
| created_at           | TIMESTAMP     | Fecha y hora de creación del registro                 | NOT NULL, DEFAULT CURRENT_TIMESTAMP |
| updated_at           | TIMESTAMP     | Fecha y hora de la última actualización               | NULL                            |

### Tabla: budgets

Esta tabla almacena los presupuestos de la organización.

| Columna              | Tipo          | Descripción                                           | Restricciones                   |
|----------------------|---------------|-------------------------------------------------------|--------------------------------|
| id                   | SERIAL        | Identificador único del presupuesto                   | PRIMARY KEY                     |
| name                 | VARCHAR(100)  | Nombre del presupuesto                                | NOT NULL                        |
| description          | TEXT          | Descripción detallada                                 | NULL                            |
| area                 | VARCHAR(100)  | Área o departamento al que pertenece                  | NOT NULL                        |
| period_start         | DATE          | Fecha de inicio del período presupuestario            | NOT NULL                        |
| period_end           | DATE          | Fecha final del período presupuestario                | NOT NULL                        |
| total_amount         | DECIMAL(12,2) | Monto total asignado                                  | NOT NULL                        |
| status               | VARCHAR(50)   | Estado (draft, active, closed)                        | NOT NULL                        |
| created_by           | INTEGER       | ID del usuario que creó el presupuesto                | FOREIGN KEY (users.id)          |
| approved_by          | INTEGER       | ID del usuario que aprobó el presupuesto              | FOREIGN KEY (users.id), NULL    |
| created_at           | TIMESTAMP     | Fecha y hora de creación del registro                 | NOT NULL, DEFAULT CURRENT_TIMESTAMP |
| updated_at           | TIMESTAMP     | Fecha y hora de la última actualización               | NULL                            |

### Tabla: budget_expenses

Esta tabla almacena los gastos asociados a los presupuestos.

| Columna              | Tipo          | Descripción                                           | Restricciones                   |
|----------------------|---------------|-------------------------------------------------------|--------------------------------|
| id                   | SERIAL        | Identificador único del gasto                         | PRIMARY KEY                     |
| budget_id            | INTEGER       | ID del presupuesto relacionado                        | FOREIGN KEY (budgets.id)        |
| description          | TEXT          | Descripción detallada                                 | NOT NULL                        |
| amount               | DECIMAL(12,2) | Monto del gasto                                       | NOT NULL                        |
| category             | VARCHAR(100)  | Categoría del gasto                                   | NOT NULL                        |
| expense_date         | DATE          | Fecha del gasto                                       | NOT NULL                        |
| created_by           | INTEGER       | ID del usuario que registró el gasto                  | FOREIGN KEY (users.id)          |
| created_at           | TIMESTAMP     | Fecha y hora de creación del registro                 | NOT NULL, DEFAULT CURRENT_TIMESTAMP |
| updated_at           | TIMESTAMP     | Fecha y hora de la última actualización               | NULL                            |

### Tabla: suppliers

Esta tabla almacena la información de los proveedores.

| Columna              | Tipo          | Descripción                                           | Restricciones                   |
|----------------------|---------------|-------------------------------------------------------|--------------------------------|
| id                   | SERIAL        | Identificador único del proveedor                     | PRIMARY KEY                     |
| name                 | VARCHAR(100)  | Nombre del proveedor                                  | NOT NULL                        |
| legal_name           | VARCHAR(255)  | Razón social del proveedor                            | NULL                            |
| tax_id               | VARCHAR(50)   | Identificación fiscal                                 | NULL                            |
| contact_name         | VARCHAR(100)  | Nombre de la persona de contacto                      | NULL                            |
| phone                | VARCHAR(20)   | Número telefónico                                     | NULL                            |
| email                | VARCHAR(255)  | Correo electrónico                                    | NULL                            |
| address              | TEXT          | Dirección                                             | NULL                            |
| website              | VARCHAR(255)  | Sitio web                                             | NULL                            |
| category             | VARCHAR(100)  | Categoría o tipo de proveedor                         | NULL                            |
| status               | VARCHAR(50)   | Estado (active, inactive)                             | NOT NULL                        |
| payment_terms        | VARCHAR(100)  | Términos de pago                                      | NULL                            |
| notes                | TEXT          | Notas adicionales                                     | NULL                            |
| created_at           | TIMESTAMP     | Fecha y hora de creación del registro                 | NOT NULL, DEFAULT CURRENT_TIMESTAMP |
| updated_at           | TIMESTAMP     | Fecha y hora de la última actualización               | NULL                            |

### Tabla: products

Esta tabla almacena la información de los productos ofrecidos por los proveedores.

| Columna              | Tipo          | Descripción                                           | Restricciones                   |
|----------------------|---------------|-------------------------------------------------------|--------------------------------|
| id                   | SERIAL        | Identificador único del producto                      | PRIMARY KEY                     |
| supplier_id          | INTEGER       | ID del proveedor relacionado                          | FOREIGN KEY (suppliers.id)      |
| name                 | VARCHAR(100)  | Nombre del producto                                   | NOT NULL                        |
| description          | TEXT          | Descripción detallada                                 | NULL                            |
| sku                  | VARCHAR(50)   | Código SKU del producto                               | NULL                            |
| unit_price           | DECIMAL(12,2) | Precio unitario                                       | NOT NULL                        |
| unit                 | VARCHAR(50)   | Unidad de medida (unidad, kg, litro, etc.)            | NULL                            |
| category             | VARCHAR(100)  | Categoría del producto                                | NULL                            |
| status               | VARCHAR(50)   | Estado (active, discontinued)                         | NOT NULL                        |
| created_at           | TIMESTAMP     | Fecha y hora de creación del registro                 | NOT NULL, DEFAULT CURRENT_TIMESTAMP |
| updated_at           | TIMESTAMP     | Fecha y hora de la última actualización               | NULL                            |

### Tabla: purchase_orders

Esta tabla almacena las órdenes de compra emitidas a proveedores.

| Columna              | Tipo          | Descripción                                           | Restricciones                   |
|----------------------|---------------|-------------------------------------------------------|--------------------------------|
| id                   | SERIAL        | Identificador único de la orden de compra             | PRIMARY KEY                     |
| order_number         | VARCHAR(50)   | Número de la orden de compra                          | NOT NULL, UNIQUE                |
| supplier_id          | INTEGER       | ID del proveedor                                      | FOREIGN KEY (suppliers.id)      |
| project_id           | INTEGER       | ID del proyecto relacionado                           | FOREIGN KEY (projects.id), NULL |
| order_date           | DATE          | Fecha de emisión                                      | NOT NULL                        |
| expected_delivery    | DATE          | Fecha estimada de entrega                             | NULL                            |
| status               | VARCHAR(50)   | Estado (draft, sent, partial, completed, cancelled)   | NOT NULL                        |
| total_amount         | DECIMAL(12,2) | Monto total                                           | NOT NULL                        |
| shipping_address     | TEXT          | Dirección de entrega                                  | NULL                            |
| billing_address      | TEXT          | Dirección de facturación                              | NULL                            |
| payment_terms        | VARCHAR(100)  | Términos de pago                                      | NULL                            |
| shipping_method      | VARCHAR(100)  | Método de envío                                       | NULL                            |
| notes                | TEXT          | Notas adicionales                                     | NULL                            |
| created_by           | INTEGER       | ID del usuario que creó la orden                      | FOREIGN KEY (users.id)          |
| approved_by          | INTEGER       | ID del usuario que aprobó la orden                    | FOREIGN KEY (users.id), NULL    |
| created_at           | TIMESTAMP     | Fecha y hora de creación del registro                 | NOT NULL, DEFAULT CURRENT_TIMESTAMP |
| updated_at           | TIMESTAMP     | Fecha y hora de la última actualización               | NULL                            |

### Tabla: purchase_order_items

Esta tabla almacena los items incluidos en las órdenes de compra.

| Columna              | Tipo          | Descripción                                           | Restricciones                   |
|----------------------|---------------|-------------------------------------------------------|--------------------------------|
| id                   | SERIAL        | Identificador único del item                          | PRIMARY KEY                     |
| purchase_order_id    | INTEGER       | ID de la orden de compra                              | FOREIGN KEY (purchase_orders.id) |
| product_id           | INTEGER       | ID del producto                                       | FOREIGN KEY (products.id), NULL |
| description          | TEXT          | Descripción del item                                  | NOT NULL                        |
| quantity             | DECIMAL(10,2) | Cantidad                                              | NOT NULL                        |
| unit_price           | DECIMAL(12,2) | Precio unitario                                       | NOT NULL                        |
| amount               | DECIMAL(12,2) | Monto total (quantity * unit_price)                   | NOT NULL                        |
| created_at           | TIMESTAMP     | Fecha y hora de creación del registro                 | NOT NULL, DEFAULT CURRENT_TIMESTAMP |
| updated_at           | TIMESTAMP     | Fecha y hora de la última actualización               | NULL                            |

### Tabla: invoices

Esta tabla almacena las facturas recibidas o emitidas.

| Columna              | Tipo          | Descripción                                           | Restricciones                   |
|----------------------|---------------|-------------------------------------------------------|--------------------------------|
| id                   | SERIAL        | Identificador único de la factura                     | PRIMARY KEY                     |
| invoice_number       | VARCHAR(50)   | Número de factura                                     | NOT NULL, UNIQUE                |
| type                 | VARCHAR(50)   | Tipo (received, issued)                               | NOT NULL                        |
| supplier_id          | INTEGER       | ID del proveedor relacionado                          | FOREIGN KEY (suppliers.id), NULL |
| project_id           | INTEGER       | ID del proyecto relacionado                           | FOREIGN KEY (projects.id), NULL |
| purchase_order_id    | INTEGER       | ID de la orden de compra relacionada                  | FOREIGN KEY (purchase_orders.id), NULL |
| issue_date           | DATE          | Fecha de emisión                                      | NOT NULL                        |
| due_date             | DATE          | Fecha de vencimiento                                  | NOT NULL                        |
| status               | VARCHAR(50)   | Estado (draft, sent, paid, overdue, cancelled)        | NOT NULL                        |
| subtotal             | DECIMAL(12,2) | Subtotal antes de impuestos                           | NOT NULL                        |
| tax_amount           | DECIMAL(12,2) | Monto de impuestos                                    | NOT NULL                        |
| total_amount         | DECIMAL(12,2) | Monto total                                           | NOT NULL                        |
| payment_status       | VARCHAR(50)   | Estado del pago (pending, partial, paid)              | NOT NULL                        |
| payment_date         | DATE          | Fecha de pago                                         | NULL                            |
| payment_method       | VARCHAR(50)   | Método de pago                                        | NULL                            |
| notes                | TEXT          | Notas adicionales                                     | NULL                            |
| created_at           | TIMESTAMP     | Fecha y hora de creación del registro                 | NOT NULL, DEFAULT CURRENT_TIMESTAMP |
| updated_at           | TIMESTAMP     | Fecha y hora de la última actualización               | NULL                            |

### Tabla: invoice_items

Esta tabla almacena los items incluidos en las facturas.

| Columna              | Tipo          | Descripción                                           | Restricciones                   |
|----------------------|---------------|-------------------------------------------------------|--------------------------------|
| id                   | SERIAL        | Identificador único del item                          | PRIMARY KEY                     |
| invoice_id           | INTEGER       | ID de la factura                                      | FOREIGN KEY (invoices.id)       |
| description          | TEXT          | Descripción del item                                  | NOT NULL                        |
| quantity             | DECIMAL(10,2) | Cantidad                                              | NOT NULL                        |
| unit_price           | DECIMAL(12,2) | Precio unitario                                       | NOT NULL                        |
| tax_rate             | DECIMAL(5,2)  | Tasa de impuestos (%)                                 | NOT NULL                        |
| amount               | DECIMAL(12,2) | Monto total antes de impuestos                        | NOT NULL                        |
| created_at           | TIMESTAMP     | Fecha y hora de creación del registro                 | NOT NULL, DEFAULT CURRENT_TIMESTAMP |
| updated_at           | TIMESTAMP     | Fecha y hora de la última actualización               | NULL                            |

### Tabla: payrolls

Esta tabla almacena los registros de nóminas de empleados.

| Columna              | Tipo          | Descripción                                           | Restricciones                   |
|----------------------|---------------|-------------------------------------------------------|--------------------------------|
| id                   | SERIAL        | Identificador único de la nómina                      | PRIMARY KEY                     |
| employee_id          | INTEGER       | ID del empleado                                       | FOREIGN KEY (employees.id)      |
| period_start         | DATE          | Fecha de inicio del período                           | NOT NULL                        |
| period_end           | DATE          | Fecha final del período                               | NOT NULL                        |
| base_salary          | DECIMAL(12,2) | Salario base                                          | NOT NULL                        |
| gross_salary         | DECIMAL(12,2) | Salario bruto (base + complementos)                   | NOT NULL                        |
| tax_withholding      | DECIMAL(12,2) | Retenciones fiscales                                  | NOT NULL                        |
| social_security      | DECIMAL(12,2) | Seguridad social                                      | NOT NULL                        |
| additional_deductions | DECIMAL(12,2) | Otras deducciones                                     | NOT NULL                        |
| net_salary           | DECIMAL(12,2) | Salario neto                                          | NOT NULL                        |
| payment_date         | DATE          | Fecha de pago                                         | NULL                            |
| status               | VARCHAR(50)   | Estado (pending, approved, paid, cancelled)           | NOT NULL                        |
| payment_method       | VARCHAR(50)   | Método de pago                                        | NULL                            |
| comments             | TEXT          | Comentarios                                           | NULL                            |
| created_by           | INTEGER       | ID del usuario que creó el registro                   | FOREIGN KEY (users.id)          |
| approved_by          | INTEGER       | ID del usuario que aprobó el pago                     | FOREIGN KEY (users.id), NULL    |
| created_at           | TIMESTAMP     | Fecha y hora de creación del registro                 | NOT NULL, DEFAULT CURRENT_TIMESTAMP |
| updated_at           | TIMESTAMP     | Fecha y hora de la última actualización               | NULL                            |

### Tabla: financial_categories

Esta tabla almacena las categorías financieras para clasificación.

| Columna              | Tipo          | Descripción                                           | Restricciones                   |
|----------------------|---------------|-------------------------------------------------------|--------------------------------|
| id                   | SERIAL        | Identificador único de la categoría                   | PRIMARY KEY                     |
| name                 | VARCHAR(100)  | Nombre de la categoría                                | NOT NULL                        |
| type                 | VARCHAR(50)   | Tipo (income, expense, asset, liability)              | NOT NULL                        |
| description          | TEXT          | Descripción detallada                                 | NULL                            |
| parent_id            | INTEGER       | ID de la categoría padre (para subcategorías)         | FOREIGN KEY (financial_categories.id), NULL |
| created_at           | TIMESTAMP     | Fecha y hora de creación del registro                 | NOT NULL, DEFAULT CURRENT_TIMESTAMP |
| updated_at           | TIMESTAMP     | Fecha y hora de la última actualización               | NULL                            |

### Tabla: financial_reports

Esta tabla almacena los reportes financieros generados.

| Columna              | Tipo          | Descripción                                           | Restricciones                   |
|----------------------|---------------|-------------------------------------------------------|--------------------------------|
| id                   | SERIAL        | Identificador único del reporte                       | PRIMARY KEY                     |
| name                 | VARCHAR(100)  | Nombre del reporte                                    | NOT NULL                        |
| type                 | VARCHAR(50)   | Tipo de reporte (balance_sheet, income_statement, etc.) | NOT NULL                      |
| period_start         | DATE          | Fecha de inicio del período                           | NOT NULL                        |
| period_end           | DATE          | Fecha final del período                               | NOT NULL                        |
| content              | TEXT          | Contenido del reporte (JSON o estructura serializada) | NULL                            |
| status               | VARCHAR(50)   | Estado (draft, final, archived)                       | NOT NULL                        |
| created_by           | INTEGER       | ID del usuario que creó el reporte                    | FOREIGN KEY (users.id)          |
| approved_by          | INTEGER       | ID del usuario que aprobó el reporte                  | FOREIGN KEY (users.id), NULL    |
| created_at           | TIMESTAMP     | Fecha y hora de creación del registro                 | NOT NULL, DEFAULT CURRENT_TIMESTAMP |
| updated_at           | TIMESTAMP     | Fecha y hora de la última actualización               | NULL                            |

### Tabla: financial_audits

Esta tabla almacena los registros de auditorías financieras.

| Columna              | Tipo          | Descripción                                           | Restricciones                   |
|----------------------|---------------|-------------------------------------------------------|--------------------------------|
| id                   | SERIAL        | Identificador único de la auditoría                   | PRIMARY KEY                     |
| name                 | VARCHAR(100)  | Nombre de la auditoría                                | NOT NULL                        |
| description          | TEXT          | Descripción detallada                                 | NULL                            |
| audit_period_start   | DATE          | Fecha de inicio del período auditado                  | NOT NULL                        |
| audit_period_end     | DATE          | Fecha final del período auditado                      | NOT NULL                        |
| audit_date           | DATE          | Fecha de realización de la auditoría                  | NOT NULL                        |
| findings             | TEXT          | Hallazgos                                             | NULL                            |
| recommendations      | TEXT          | Recomendaciones                                       | NULL                            |
| status               | VARCHAR(50)   | Estado (in_progress, completed, reviewed)             | NOT NULL                        |
| conducted_by         | VARCHAR(100)  | Nombre del auditor o empresa auditora                 | NULL                            |
| created_by           | INTEGER       | ID del usuario que registró la auditoría              | FOREIGN KEY (users.id)          |
| created_at           | TIMESTAMP     | Fecha y hora de creación del registro                 | NOT NULL, DEFAULT CURRENT_TIMESTAMP |
| updated_at           | TIMESTAMP     | Fecha y hora de la última actualización               | NULL                            |

### Tabla: settings

Esta tabla almacena configuraciones generales del sistema.

| Columna              | Tipo          | Descripción                                           | Restricciones                   |
|----------------------|---------------|-------------------------------------------------------|--------------------------------|
| id                   | SERIAL        | Identificador único de la configuración               | PRIMARY KEY                     |
| key                  | VARCHAR(100)  | Clave de la configuración                             | NOT NULL, UNIQUE                |
| value                | TEXT          | Valor de la configuración                             | NULL                            |
| description          | TEXT          | Descripción de la configuración                       | NULL                            |
| created_at           | TIMESTAMP     | Fecha y hora de creación del registro                 | NOT NULL, DEFAULT CURRENT_TIMESTAMP |
| updated_at           | TIMESTAMP     | Fecha y hora de la última actualización               | NULL                            |

## Diagrama de Relaciones

El modelo de datos presenta las siguientes relaciones principales:

1. Un usuario (`users`) puede estar asociado a un empleado (`employees`).
2. Un empleado (`employees`) puede estar asignado a múltiples proyectos (`projects`) a través de la tabla `employee_projects`.
3. Un proyecto (`projects`) tiene un gerente responsable (del equipo de `employees`).
4. Un proyecto (`projects`) puede tener múltiples tareas (`tasks`).
5. Una tarea (`tasks`) puede tener múltiples comentarios (`task_comments`).
6. Una transacción financiera (`transactions`) puede estar asociada a un proyecto o proveedor.
7. Un presupuesto (`budgets`) puede tener múltiples gastos (`budget_expenses`).
8. Un proveedor (`suppliers`) ofrece productos (`products`).
9. Una orden de compra (`purchase_orders`) se realiza a un proveedor y contiene múltiples items (`purchase_order_items`).
10. Una factura (`invoices`) puede estar relacionada con una orden de compra y contiene múltiples items (`invoice_items`).
11. Un empleado (`employees`) tiene registros de nómina (`payrolls`).

Este documento proporciona una visión completa de la estructura de la base de datos de XTask, lo que facilita la comprensión del modelo de datos y las relaciones entre las entidades del sistema.