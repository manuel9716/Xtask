# Arquitectura Hexagonal - Backend

## Estructura de Carpetas

```
server/
├── domain/                      # Capa de Dominio (Núcleo)
│   ├── entities/               # Entidades de negocio
│   │   ├── empleado.entity.ts
│   │   ├── proyecto.entity.ts
│   │   ├── nomina.entity.ts
│   │   └── ...
│   ├── repositories/           # Interfaces de repositorios (Puertos)
│   │   ├── empleado.repository.ts
│   │   ├── proyecto.repository.ts
│   │   └── ...
│   ├── services/               # Servicios de dominio
│   │   ├── empleado.domain-service.ts
│   │   └── ...
│   └── value-objects/          # Objetos de valor
│       ├── email.vo.ts
│       ├── money.vo.ts
│       └── ...
│
├── application/                 # Capa de Aplicación (Casos de Uso)
│   ├── use-cases/              # Casos de uso
│   │   ├── empleados/
│   │   │   ├── create-empleado.use-case.ts
│   │   │   ├── update-empleado.use-case.ts
│   │   │   ├── delete-empleado.use-case.ts
│   │   │   └── get-empleado.use-case.ts
│   │   ├── proyectos/
│   │   ├── nomina/
│   │   └── ...
│   ├── dto/                    # Data Transfer Objects
│   │   ├── empleado.dto.ts
│   │   ├── proyecto.dto.ts
│   │   └── ...
│   └── ports/                  # Puertos de aplicación
│       ├── input/              # Puertos de entrada (interfaces de casos de uso)
│       └── output/             # Puertos de salida (interfaces de servicios externos)
│
├── infrastructure/              # Capa de Infraestructura (Adaptadores)
│   ├── database/               # Adaptadores de base de datos
│   │   ├── repositories/       # Implementaciones de repositorios
│   │   │   ├── empleado.repository.impl.ts
│   │   │   ├── proyecto.repository.impl.ts
│   │   │   └── ...
│   │   ├── schema/             # Esquemas de base de datos (Drizzle)
│   │   │   └── index.ts
│   │   ├── migrations/         # Migraciones
│   │   ├── init/               # Scripts de inicialización
│   │   └── db.config.ts        # Configuración de base de datos
│   ├── external-services/      # Servicios externos
│   │   ├── email/
│   │   │   └── sendgrid.service.ts
│   │   ├── storage/
│   │   │   └── google-cloud.service.ts
│   │   ├── payment/
│   │   │   └── stripe.service.ts
│   │   └── ai/
│   │       └── openai.service.ts
│   ├── http/                   # Adaptadores HTTP
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts
│   │   │   ├── error-handler.middleware.ts
│   │   │   └── validation.middleware.ts
│   │   └── validators/
│   │       └── ...
│   └── config/                 # Configuraciones
│       ├── env.config.ts
│       └── ...
│
├── interfaces/                  # Capa de Interfaces (Controladores)
│   ├── http/                   # Controladores HTTP
│   │   ├── controllers/
│   │   │   ├── empleado.controller.ts
│   │   │   ├── proyecto.controller.ts
│   │   │   ├── nomina.controller.ts
│   │   │   └── ...
│   │   └── routes/
│   │       ├── empleado.routes.ts
│   │       ├── proyecto.routes.ts
│   │       ├── nomina.routes.ts
│   │       ├── auth.routes.ts
│   │       └── index.ts
│   └── websocket/              # Controladores WebSocket (si aplica)
│       └── ...
│
├── shared/                      # Código compartido
│   ├── types/
│   ├── constants/
│   ├── utils/
│   └── errors/
│       ├── domain.error.ts
│       ├── application.error.ts
│       └── infrastructure.error.ts
│
└── index.ts                     # Punto de entrada de la aplicación
```

## Principios de Arquitectura Hexagonal

### 1. **Capa de Dominio (Núcleo)**
- **Responsabilidad**: Contiene la lógica de negocio pura
- **Independencia**: No depende de ninguna otra capa
- **Componentes**:
  - **Entidades**: Objetos con identidad única
  - **Value Objects**: Objetos inmutables sin identidad
  - **Servicios de Dominio**: Lógica que no pertenece a una entidad específica
  - **Interfaces de Repositorio**: Contratos para persistencia

### 2. **Capa de Aplicación (Casos de Uso)**
- **Responsabilidad**: Orquesta el flujo de datos entre capas
- **Componentes**:
  - **Casos de Uso**: Implementan las operaciones del sistema
  - **DTOs**: Objetos para transferir datos entre capas
  - **Puertos**: Interfaces que definen contratos

### 3. **Capa de Infraestructura (Adaptadores)**
- **Responsabilidad**: Implementa detalles técnicos
- **Componentes**:
  - **Repositorios**: Implementan persistencia de datos
  - **Servicios Externos**: Integraciones con APIs externas
  - **Configuraciones**: Manejo de variables de entorno

### 4. **Capa de Interfaces (Controladores)**
- **Responsabilidad**: Maneja la comunicación con el exterior
- **Componentes**:
  - **Controladores HTTP**: Manejan requests/responses
  - **Rutas**: Definen endpoints de la API
  - **Middleware**: Interceptores de requests

## Flujo de Datos

```
Request → Controller → Use Case → Domain Service → Repository → Database
                                        ↓
                                   Domain Entity
                                        ↓
Response ← Controller ← DTO ← Use Case ← Domain Service
```

## Ejemplo de Implementación

### Domain Entity
```typescript
// server/domain/entities/empleado.entity.ts
export class Empleado {
  constructor(
    public readonly id: number,
    public nombre: string,
    public email: Email, // Value Object
    public salario: Money, // Value Object
  ) {}

  actualizarSalario(nuevoSalario: Money): void {
    if (nuevoSalario.amount < 0) {
      throw new DomainError('El salario no puede ser negativo');
    }
    this.salario = nuevoSalario;
  }
}
```

### Repository Interface (Port)
```typescript
// server/domain/repositories/empleado.repository.ts
export interface EmpleadoRepository {
  findById(id: number): Promise<Empleado | null>;
  findAll(): Promise<Empleado[]>;
  save(empleado: Empleado): Promise<Empleado>;
  delete(id: number): Promise<void>;
}
```

### Use Case
```typescript
// server/application/use-cases/empleados/create-empleado.use-case.ts
export class CreateEmpleadoUseCase {
  constructor(
    private readonly empleadoRepository: EmpleadoRepository
  ) {}

  async execute(dto: CreateEmpleadoDto): Promise<EmpleadoDto> {
    const empleado = new Empleado(
      0,
      dto.nombre,
      new Email(dto.email),
      new Money(dto.salario)
    );

    const savedEmpleado = await this.empleadoRepository.save(empleado);
    return EmpleadoDto.fromEntity(savedEmpleado);
  }
}
```

### Repository Implementation (Adapter)
```typescript
// server/infrastructure/database/repositories/empleado.repository.impl.ts
export class EmpleadoRepositoryImpl implements EmpleadoRepository {
  constructor(private readonly db: Database) {}

  async findById(id: number): Promise<Empleado | null> {
    const result = await this.db.query.empleados.findFirst({
      where: eq(empleados.id, id)
    });
    
    return result ? this.toDomain(result) : null;
  }

  private toDomain(data: any): Empleado {
    return new Empleado(
      data.id,
      data.nombre,
      new Email(data.email),
      new Money(data.salario)
    );
  }
}
```

### Controller
```typescript
// server/interfaces/http/controllers/empleado.controller.ts
export class EmpleadoController {
  constructor(
    private readonly createEmpleadoUseCase: CreateEmpleadoUseCase
  ) {}

  async create(req: Request, res: Response): Promise<void> {
    try {
      const dto = CreateEmpleadoDto.fromRequest(req.body);
      const result = await this.createEmpleadoUseCase.execute(dto);
      res.status(201).json(result);
    } catch (error) {
      // Error handling
    }
  }
}
```

## Ventajas de esta Arquitectura

1. **Testabilidad**: Fácil de testear cada capa de forma aislada
2. **Mantenibilidad**: Cambios en una capa no afectan a otras
3. **Escalabilidad**: Fácil agregar nuevas funcionalidades
4. **Independencia de Frameworks**: El dominio no depende de tecnologías específicas
5. **Flexibilidad**: Fácil cambiar implementaciones (ej: cambiar de base de datos)

## Reglas de Dependencia

1. **Domain** no depende de nadie
2. **Application** solo depende de **Domain**
3. **Infrastructure** depende de **Domain** y **Application**
4. **Interfaces** depende de **Application** e **Infrastructure**

## Migración Gradual

Para migrar el código existente:

1. Identificar módulos actuales (empleados, proyectos, nómina, etc.)
2. Crear estructura de carpetas para cada módulo
3. Extraer lógica de negocio a entidades de dominio
4. Crear casos de uso a partir de rutas existentes
5. Implementar repositorios
6. Actualizar controladores
7. Actualizar imports y referencias
