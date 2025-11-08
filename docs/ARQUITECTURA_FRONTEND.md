# Arquitectura por Capas - Frontend

## Estructura de Carpetas

```
client/
├── src/
│   ├── presentation/              # Capa de Presentación (UI)
│   │   ├── components/           # Componentes reutilizables
│   │   │   ├── ui/              # Componentes base (shadcn/ui)
│   │   │   │   ├── button.tsx
│   │   │   │   ├── input.tsx
│   │   │   │   ├── card.tsx
│   │   │   │   └── ...
│   │   │   ├── common/          # Componentes comunes
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── Footer.tsx
│   │   │   │   └── ...
│   │   │   └── features/        # Componentes específicos por feature
│   │   │       ├── empleados/
│   │   │       │   ├── EmpleadoCard.tsx
│   │   │       │   ├── EmpleadoForm.tsx
│   │   │       │   └── EmpleadoList.tsx
│   │   │       ├── proyectos/
│   │   │       ├── nomina/
│   │   │       └── ...
│   │   │
│   │   ├── pages/               # Páginas/Vistas
│   │   │   ├── empleados/
│   │   │   │   ├── EmpleadosPage.tsx
│   │   │   │   ├── EmpleadoDetailPage.tsx
│   │   │   │   └── CreateEmpleadoPage.tsx
│   │   │   ├── proyectos/
│   │   │   ├── nomina/
│   │   │   ├── dashboard/
│   │   │   ├── auth/
│   │   │   │   ├── LoginPage.tsx
│   │   │   │   └── RegisterPage.tsx
│   │   │   └── ...
│   │   │
│   │   ├── layouts/             # Layouts de página
│   │   │   ├── MainLayout.tsx
│   │   │   ├── AuthLayout.tsx
│   │   │   └── DashboardLayout.tsx
│   │   │
│   │   └── hooks/               # Custom Hooks de UI
│   │       ├── useTheme.ts
│   │       ├── useMediaQuery.ts
│   │       └── ...
│   │
│   ├── application/              # Capa de Aplicación (Lógica de Negocio)
│   │   ├── services/            # Servicios de aplicación
│   │   │   ├── empleado.service.ts
│   │   │   ├── proyecto.service.ts
│   │   │   ├── nomina.service.ts
│   │   │   └── ...
│   │   │
│   │   ├── hooks/               # Custom Hooks de negocio
│   │   │   ├── empleados/
│   │   │   │   ├── useEmpleados.ts
│   │   │   │   ├── useCreateEmpleado.ts
│   │   │   │   ├── useUpdateEmpleado.ts
│   │   │   │   └── useDeleteEmpleado.ts
│   │   │   ├── proyectos/
│   │   │   ├── nomina/
│   │   │   └── ...
│   │   │
│   │   ├── state/               # Estado global (Zustand)
│   │   │   ├── stores/
│   │   │   │   ├── auth.store.ts
│   │   │   │   ├── empleado.store.ts
│   │   │   │   ├── proyecto.store.ts
│   │   │   │   └── ui.store.ts
│   │   │   └── index.ts
│   │   │
│   │   └── validators/          # Validaciones (Zod)
│   │       ├── empleado.validator.ts
│   │       ├── proyecto.validator.ts
│   │       └── ...
│   │
│   ├── domain/                   # Capa de Dominio (Modelos y Tipos)
│   │   ├── models/              # Modelos de dominio
│   │   │   ├── empleado.model.ts
│   │   │   ├── proyecto.model.ts
│   │   │   ├── nomina.model.ts
│   │   │   └── ...
│   │   │
│   │   ├── types/               # Tipos TypeScript
│   │   │   ├── empleado.types.ts
│   │   │   ├── proyecto.types.ts
│   │   │   └── ...
│   │   │
│   │   ├── enums/               # Enumeraciones
│   │   │   ├── estado-proyecto.enum.ts
│   │   │   ├── estado-nomina.enum.ts
│   │   │   └── ...
│   │   │
│   │   └── interfaces/          # Interfaces de dominio
│   │       ├── empleado.interface.ts
│   │       └── ...
│   │
│   ├── infrastructure/           # Capa de Infraestructura (Servicios Externos)
│   │   ├── http/                # Cliente HTTP
│   │   │   ├── api-client.ts
│   │   │   ├── interceptors/
│   │   │   │   ├── auth.interceptor.ts
│   │   │   │   └── error.interceptor.ts
│   │   │   └── endpoints/
│   │   │       ├── empleados.endpoints.ts
│   │   │       ├── proyectos.endpoints.ts
│   │   │       └── ...
│   │   │
│   │   ├── storage/             # Almacenamiento local
│   │   │   ├── local-storage.service.ts
│   │   │   └── session-storage.service.ts
│   │   │
│   │   ├── websocket/           # WebSocket client
│   │   │   └── ws-client.ts
│   │   │
│   │   └── external/            # Servicios externos
│   │       ├── analytics.service.ts
│   │       └── ...
│   │
│   ├── shared/                   # Código compartido
│   │   ├── utils/               # Utilidades
│   │   │   ├── format.utils.ts
│   │   │   ├── date.utils.ts
│   │   │   ├── validation.utils.ts
│   │   │   └── ...
│   │   │
│   │   ├── constants/           # Constantes
│   │   │   ├── routes.constants.ts
│   │   │   ├── api.constants.ts
│   │   │   └── ...
│   │   │
│   │   ├── config/              # Configuraciones
│   │   │   ├── app.config.ts
│   │   │   └── theme.config.ts
│   │   │
│   │   └── errors/              # Manejo de errores
│   │       ├── app.error.ts
│   │       └── error-handler.ts
│   │
│   ├── i18n/                     # Internacionalización
│   │   ├── locales/
│   │   │   ├── es/
│   │   │   │   ├── common.json
│   │   │   │   ├── empleados.json
│   │   │   │   └── ...
│   │   │   └── en/
│   │   └── config.ts
│   │
│   ├── assets/                   # Recursos estáticos
│   │   ├── images/
│   │   ├── icons/
│   │   └── fonts/
│   │
│   ├── App.tsx                   # Componente raíz
│   ├── main.tsx                  # Punto de entrada
│   └── index.css                 # Estilos globales
│
├── index.html
└── package.json
```

## Principios de Arquitectura por Capas

### 1. **Capa de Presentación (UI)**
- **Responsabilidad**: Renderizar la interfaz de usuario
- **Componentes**:
  - **Componentes UI**: Elementos visuales reutilizables
  - **Páginas**: Vistas completas de la aplicación
  - **Layouts**: Estructuras de página
  - **Hooks de UI**: Lógica de presentación

**Reglas**:
- Solo se preocupa de cómo se ven las cosas
- No contiene lógica de negocio
- Usa hooks de aplicación para obtener datos

### 2. **Capa de Aplicación (Lógica de Negocio)**
- **Responsabilidad**: Orquestar la lógica de la aplicación
- **Componentes**:
  - **Servicios**: Coordinan operaciones complejas
  - **Hooks de Negocio**: Encapsulan lógica reutilizable
  - **Estado Global**: Manejo de estado con Zustand
  - **Validadores**: Validación de datos con Zod

**Reglas**:
- Contiene la lógica de negocio del frontend
- Coordina entre presentación e infraestructura
- Maneja el estado de la aplicación

### 3. **Capa de Dominio (Modelos)**
- **Responsabilidad**: Definir los modelos de datos
- **Componentes**:
  - **Modelos**: Clases con lógica de dominio
  - **Tipos**: Definiciones TypeScript
  - **Enums**: Valores constantes
  - **Interfaces**: Contratos de datos

**Reglas**:
- Define la estructura de datos
- Independiente de frameworks
- No depende de otras capas

### 4. **Capa de Infraestructura (Servicios Externos)**
- **Responsabilidad**: Comunicación con servicios externos
- **Componentes**:
  - **HTTP Client**: Comunicación con API
  - **Storage**: Persistencia local
  - **WebSocket**: Comunicación en tiempo real
  - **Servicios Externos**: Integraciones

**Reglas**:
- Maneja detalles técnicos de comunicación
- Implementa adaptadores para servicios externos
- No contiene lógica de negocio

## Flujo de Datos

```
User Interaction → Component → Hook → Service → HTTP Client → API
                                  ↓
                              Store (Zustand)
                                  ↓
                              Component Update
```

## Ejemplo de Implementación

### Domain Model
```typescript
// src/domain/models/empleado.model.ts
export class Empleado {
  constructor(
    public id: number,
    public nombre: string,
    public email: string,
    public salario: number,
    public fechaIngreso: Date
  ) {}

  get nombreCompleto(): string {
    return this.nombre.toUpperCase();
  }

  esSalarioValido(): boolean {
    return this.salario > 0;
  }
}
```

### Infrastructure (HTTP Client)
```typescript
// src/infrastructure/http/endpoints/empleados.endpoints.ts
export const empleadosEndpoints = {
  getAll: () => apiClient.get<Empleado[]>('/api/empleados'),
  getById: (id: number) => apiClient.get<Empleado>(`/api/empleados/${id}`),
  create: (data: CreateEmpleadoDto) => apiClient.post<Empleado>('/api/empleados', data),
  update: (id: number, data: UpdateEmpleadoDto) => 
    apiClient.put<Empleado>(`/api/empleados/${id}`, data),
  delete: (id: number) => apiClient.delete(`/api/empleados/${id}`),
};
```

### Application Service
```typescript
// src/application/services/empleado.service.ts
export class EmpleadoService {
  async getEmpleados(): Promise<Empleado[]> {
    const response = await empleadosEndpoints.getAll();
    return response.data.map(data => new Empleado(
      data.id,
      data.nombre,
      data.email,
      data.salario,
      new Date(data.fechaIngreso)
    ));
  }

  async createEmpleado(data: CreateEmpleadoDto): Promise<Empleado> {
    const response = await empleadosEndpoints.create(data);
    return new Empleado(
      response.data.id,
      response.data.nombre,
      response.data.email,
      response.data.salario,
      new Date(response.data.fechaIngreso)
    );
  }
}
```

### Application Hook
```typescript
// src/application/hooks/empleados/useEmpleados.ts
export function useEmpleados() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['empleados'],
    queryFn: () => empleadoService.getEmpleados(),
  });

  return {
    empleados: data ?? [],
    isLoading,
    error,
  };
}
```

### Presentation Component
```typescript
// src/presentation/pages/empleados/EmpleadosPage.tsx
export function EmpleadosPage() {
  const { empleados, isLoading, error } = useEmpleados();

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div>
      <h1>Empleados</h1>
      <EmpleadoList empleados={empleados} />
    </div>
  );
}
```

## Ventajas de esta Arquitectura

1. **Separación de Responsabilidades**: Cada capa tiene un propósito claro
2. **Testabilidad**: Fácil testear cada capa de forma independiente
3. **Mantenibilidad**: Cambios en una capa no afectan a otras
4. **Reutilización**: Componentes y hooks reutilizables
5. **Escalabilidad**: Fácil agregar nuevas funcionalidades

## Reglas de Dependencia

1. **Presentation** depende de **Application**
2. **Application** depende de **Domain** e **Infrastructure**
3. **Infrastructure** depende de **Domain**
4. **Domain** no depende de nadie

## Integración con React Query

```typescript
// src/application/hooks/empleados/useCreateEmpleado.ts
export function useCreateEmpleado() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateEmpleadoDto) => 
      empleadoService.createEmpleado(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['empleados'] });
      toast.success('Empleado creado exitosamente');
    },
    onError: (error) => {
      toast.error('Error al crear empleado');
    },
  });
}
```

## Migración Gradual

Para migrar el código existente:

1. Crear estructura de carpetas por capas
2. Mover componentes UI a `presentation/components`
3. Mover páginas a `presentation/pages`
4. Extraer lógica de negocio a servicios en `application/services`
5. Crear hooks personalizados en `application/hooks`
6. Definir modelos en `domain/models`
7. Mover llamadas API a `infrastructure/http`
8. Actualizar imports en todos los archivos
