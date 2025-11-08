# Guía de Migración a Nueva Arquitectura

## Resumen

Este documento describe el proceso de migración del código actual a la nueva arquitectura:
- **Backend**: Arquitectura Hexagonal
- **Frontend**: Arquitectura por Capas
- **Base de Datos**: PostgreSQL (con Docker)

## Estado Actual

### Backend
```
server/
├── auth.ts
├── db.ts
├── index.ts
├── middleware/
├── modules/
│   ├── empleados/
│   └── nomina/
├── routes/
├── routes.ts
├── storage.ts
└── vite.ts
```

### Frontend
```
client/src/
├── App.tsx
├── components/
├── hooks/
├── i18n/
├── layouts/
├── lib/
├── main.tsx
├── modules/
├── pages/
└── utils/
```

## Plan de Migración

### Fase 1: Configuración de Base de Datos ✅

**Completado**:
- ✅ Docker Compose con PostgreSQL
- ✅ Configuración de `.env.example`
- ✅ Actualización de `drizzle.config.ts`
- ✅ Documentación de Azure Data Studio

**Comandos para iniciar**:
```bash
# Copiar archivo de configuración
cp .env.example .env

# Iniciar base de datos
docker-compose up -d postgres

# Ejecutar migraciones
npm run db:push

# Verificar conexión
docker ps | grep postgres
```

### Fase 2: Reorganización del Backend

#### 2.1 Crear Estructura de Carpetas

```bash
# Crear estructura hexagonal
mkdir -p server/domain/{entities,repositories,services,value-objects}
mkdir -p server/application/{use-cases,dto,ports/{input,output}}
mkdir -p server/infrastructure/{database/{repositories,schema,migrations,init},external-services/{email,storage,payment,ai},http/{middleware,validators},config}
mkdir -p server/interfaces/http/{controllers,routes}
mkdir -p server/shared/{types,constants,utils,errors}
```

#### 2.2 Migrar Módulo de Empleados (Ejemplo)

**Paso 1: Crear Entidad de Dominio**
```typescript
// server/domain/entities/empleado.entity.ts
export class Empleado {
  constructor(
    public readonly id: number,
    public nombre: string,
    public email: string,
    public cargo: string,
    public salario: number
  ) {}

  actualizarSalario(nuevoSalario: number): void {
    if (nuevoSalario < 0) {
      throw new Error('El salario no puede ser negativo');
    }
    this.salario = nuevoSalario;
  }
}
```

**Paso 2: Crear Interface de Repositorio**
```typescript
// server/domain/repositories/empleado.repository.ts
export interface EmpleadoRepository {
  findById(id: number): Promise<Empleado | null>;
  findAll(): Promise<Empleado[]>;
  save(empleado: Empleado): Promise<Empleado>;
  update(id: number, empleado: Partial<Empleado>): Promise<Empleado>;
  delete(id: number): Promise<void>;
}
```

**Paso 3: Crear DTOs**
```typescript
// server/application/dto/empleado.dto.ts
export class CreateEmpleadoDto {
  nombre: string;
  email: string;
  cargo: string;
  salario: number;
}

export class UpdateEmpleadoDto {
  nombre?: string;
  email?: string;
  cargo?: string;
  salario?: number;
}

export class EmpleadoResponseDto {
  id: number;
  nombre: string;
  email: string;
  cargo: string;
  salario: number;

  static fromEntity(empleado: Empleado): EmpleadoResponseDto {
    return {
      id: empleado.id,
      nombre: empleado.nombre,
      email: empleado.email,
      cargo: empleado.cargo,
      salario: empleado.salario,
    };
  }
}
```

**Paso 4: Crear Casos de Uso**
```typescript
// server/application/use-cases/empleados/create-empleado.use-case.ts
export class CreateEmpleadoUseCase {
  constructor(
    private readonly empleadoRepository: EmpleadoRepository
  ) {}

  async execute(dto: CreateEmpleadoDto): Promise<EmpleadoResponseDto> {
    const empleado = new Empleado(
      0,
      dto.nombre,
      dto.email,
      dto.cargo,
      dto.salario
    );

    const savedEmpleado = await this.empleadoRepository.save(empleado);
    return EmpleadoResponseDto.fromEntity(savedEmpleado);
  }
}
```

**Paso 5: Implementar Repositorio**
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

  async findAll(): Promise<Empleado[]> {
    const results = await this.db.query.empleados.findMany();
    return results.map(r => this.toDomain(r));
  }

  async save(empleado: Empleado): Promise<Empleado> {
    const [result] = await this.db.insert(empleados).values({
      nombre: empleado.nombre,
      email: empleado.email,
      cargo: empleado.cargo,
      salario: empleado.salario,
    }).returning();

    return this.toDomain(result);
  }

  private toDomain(data: any): Empleado {
    return new Empleado(
      data.id,
      data.nombre,
      data.email,
      data.cargo,
      data.salario
    );
  }
}
```

**Paso 6: Crear Controlador**
```typescript
// server/interfaces/http/controllers/empleado.controller.ts
export class EmpleadoController {
  constructor(
    private readonly createEmpleadoUseCase: CreateEmpleadoUseCase,
    private readonly getEmpleadosUseCase: GetEmpleadosUseCase,
    // ... otros casos de uso
  ) {}

  async create(req: Request, res: Response): Promise<void> {
    try {
      const dto = req.body as CreateEmpleadoDto;
      const result = await this.createEmpleadoUseCase.execute(dto);
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.getEmpleadosUseCase.execute();
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}
```

**Paso 7: Configurar Rutas**
```typescript
// server/interfaces/http/routes/empleado.routes.ts
import { Router } from 'express';
import { EmpleadoController } from '../controllers/empleado.controller';

export function createEmpleadoRoutes(controller: EmpleadoController): Router {
  const router = Router();

  router.get('/', (req, res) => controller.getAll(req, res));
  router.get('/:id', (req, res) => controller.getById(req, res));
  router.post('/', (req, res) => controller.create(req, res));
  router.put('/:id', (req, res) => controller.update(req, res));
  router.delete('/:id', (req, res) => controller.delete(req, res));

  return router;
}
```

#### 2.3 Orden de Migración de Módulos

1. **Empleados** (más simple, buen ejemplo)
2. **Proyectos**
3. **Nómina**
4. **Capacitaciones**
5. **Evaluaciones**
6. **KPIs**
7. **Microlearning**
8. **Recursos**

### Fase 3: Reorganización del Frontend

#### 3.1 Crear Estructura de Carpetas

```bash
# Crear estructura por capas
mkdir -p client/src/presentation/{components/{ui,common,features},pages,layouts,hooks}
mkdir -p client/src/application/{services,hooks,state/stores,validators}
mkdir -p client/src/domain/{models,types,enums,interfaces}
mkdir -p client/src/infrastructure/{http/{interceptors,endpoints},storage,websocket,external}
mkdir -p client/src/shared/{utils,constants,config,errors}
```

#### 3.2 Migrar Módulo de Empleados (Ejemplo)

**Paso 1: Crear Modelo de Dominio**
```typescript
// client/src/domain/models/empleado.model.ts
export class Empleado {
  constructor(
    public id: number,
    public nombre: string,
    public email: string,
    public cargo: string,
    public salario: number
  ) {}

  get nombreCompleto(): string {
    return this.nombre.toUpperCase();
  }
}
```

**Paso 2: Crear Endpoints**
```typescript
// client/src/infrastructure/http/endpoints/empleados.endpoints.ts
import { apiClient } from '../api-client';
import { Empleado } from '@/domain/models/empleado.model';

export const empleadosEndpoints = {
  getAll: () => apiClient.get<Empleado[]>('/api/empleados'),
  getById: (id: number) => apiClient.get<Empleado>(`/api/empleados/${id}`),
  create: (data: CreateEmpleadoDto) => 
    apiClient.post<Empleado>('/api/empleados', data),
  update: (id: number, data: UpdateEmpleadoDto) => 
    apiClient.put<Empleado>(`/api/empleados/${id}`, data),
  delete: (id: number) => apiClient.delete(`/api/empleados/${id}`),
};
```

**Paso 3: Crear Servicio**
```typescript
// client/src/application/services/empleado.service.ts
export class EmpleadoService {
  async getEmpleados(): Promise<Empleado[]> {
    const response = await empleadosEndpoints.getAll();
    return response.data;
  }

  async createEmpleado(data: CreateEmpleadoDto): Promise<Empleado> {
    const response = await empleadosEndpoints.create(data);
    return response.data;
  }
}

export const empleadoService = new EmpleadoService();
```

**Paso 4: Crear Hooks**
```typescript
// client/src/application/hooks/empleados/useEmpleados.ts
export function useEmpleados() {
  return useQuery({
    queryKey: ['empleados'],
    queryFn: () => empleadoService.getEmpleados(),
  });
}

// client/src/application/hooks/empleados/useCreateEmpleado.ts
export function useCreateEmpleado() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateEmpleadoDto) => 
      empleadoService.createEmpleado(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['empleados'] });
    },
  });
}
```

**Paso 5: Crear Componentes**
```typescript
// client/src/presentation/components/features/empleados/EmpleadoCard.tsx
export function EmpleadoCard({ empleado }: { empleado: Empleado }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{empleado.nombreCompleto}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{empleado.email}</p>
        <p>{empleado.cargo}</p>
      </CardContent>
    </Card>
  );
}
```

**Paso 6: Crear Página**
```typescript
// client/src/presentation/pages/empleados/EmpleadosPage.tsx
export function EmpleadosPage() {
  const { data: empleados, isLoading } = useEmpleados();

  if (isLoading) return <LoadingSpinner />;

  return (
    <div>
      <h1>Empleados</h1>
      <div className="grid grid-cols-3 gap-4">
        {empleados?.map(emp => (
          <EmpleadoCard key={emp.id} empleado={emp} />
        ))}
      </div>
    </div>
  );
}
```

### Fase 4: Actualización de Imports

Después de mover archivos, actualizar todos los imports:

```bash
# Buscar imports antiguos
grep -r "from '@/components" client/src/
grep -r "from '@/pages" client/src/

# Actualizar a nuevas rutas
# @/components -> @/presentation/components
# @/pages -> @/presentation/pages
# @/hooks -> @/application/hooks
```

### Fase 5: Testing

1. **Backend**:
```bash
# Iniciar servidor
npm run dev

# Probar endpoints
curl http://localhost:5000/api/empleados
```

2. **Frontend**:
```bash
# Iniciar cliente
npm run dev

# Verificar en navegador
# http://localhost:5173
```

3. **Base de Datos**:
```bash
# Verificar conexión
docker exec -it xtaskflow-postgres psql -U xtaskflow_user -d xtaskflow_db

# Listar tablas
\dt

# Salir
\q
```

## Checklist de Migración

### Backend
- [ ] Crear estructura de carpetas hexagonal
- [ ] Migrar módulo de empleados
- [ ] Migrar módulo de proyectos
- [ ] Migrar módulo de nómina
- [ ] Migrar otros módulos
- [ ] Actualizar imports
- [ ] Probar endpoints

### Frontend
- [ ] Crear estructura de carpetas por capas
- [ ] Migrar componentes UI
- [ ] Migrar páginas
- [ ] Crear servicios
- [ ] Crear hooks personalizados
- [ ] Actualizar imports
- [ ] Probar interfaz

### Base de Datos
- [x] Configurar Docker Compose
- [x] Configurar PostgreSQL
- [ ] Ejecutar migraciones
- [ ] Verificar conexión con Azure Data Studio
- [ ] Seed de datos iniciales

## Comandos Útiles

```bash
# Base de datos
docker-compose up -d postgres
docker-compose logs -f postgres
docker-compose down

# Desarrollo
npm run dev
npm run build
npm run check

# Migraciones
npm run db:push
npm run db:studio
npm run db:generate

# Testing
npm test
npm run test:watch
```

## Próximos Pasos

1. Ejecutar migraciones de base de datos
2. Comenzar migración del módulo de empleados (backend)
3. Comenzar migración del módulo de empleados (frontend)
4. Probar integración completa
5. Continuar con otros módulos
6. Actualizar documentación

## Notas Importantes

- **No eliminar código antiguo** hasta verificar que el nuevo funciona
- **Migrar módulo por módulo** para facilitar debugging
- **Mantener tests actualizados** durante la migración
- **Documentar cambios** en cada fase
- **Hacer commits frecuentes** para poder revertir si es necesario
