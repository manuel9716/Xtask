# XtaskFlow - Arquitectura Hexagonal (Clean Architecture)

## Estructura del Proyecto

El proyecto sigue una arquitectura hexagonal (también conocida como Clean Architecture) con una clara separación de responsabilidades y dependencias.

```
XtaskFlow/
├── src/                          # Código fuente principal
│   ├── domain/                   # Capa de Dominio (Core)
│   │   ├── entities/            # Entidades del dominio
│   │   ├── repositories/        # Interfaces de repositorios
│   │   ├── services/            # Servicios del dominio
│   │   └── value-objects/       # Objetos de valor
│   ├── application/             # Capa de Aplicación
│   │   ├── use-cases/           # Casos de uso
│   │   ├── dto/                 # Data Transfer Objects
│   │   └── services/            # Servicios de aplicación
│   ├── infrastructure/          # Capa de Infraestructura
│   │   ├── persistence/         # Implementación de repositorios
│   │   ├── external/            # Servicios externos
│   │   └── messaging/           # Mensajería
│   ├── interfaces/              # Capa de Interfaces
│   │   ├── http/                # Controladores y rutas HTTP
│   │   ├── cli/                 # Interfaces de línea de comandos
│   │   └── events/              # Manejadores de eventos
│   └── shared/                  # Código compartido
│       ├── types/               # Tipos TypeScript
│       ├── utils/               # Utilidades
│       ├── constants/           # Constantes
│       └── errors/              # Definición de errores
├── client/                      # Aplicación cliente (React)
├── resources/                   # Recursos y documentación
│   ├── docs/                    # Documentación
│   │   ├── architecture/        # Documentación de arquitectura
│   │   ├── api/                 # Documentación de API
│   │   ├── guides/              # Guías
│   │   └── deployment/          # Guías de despliegue
│   ├── assets/                  # Archivos estáticos
│   ├── templates/               # Plantillas
│   └── scripts/                 # Scripts utilitarios
├── config/                      # Configuración
│   ├── database/                # Configuración de base de datos
│   ├── auth/                    # Configuración de autenticación
│   └── server/                  # Configuración del servidor
└── infrastructure/              # Infraestructura de despliegue
    ├── docker/                  # Configuración Docker
    ├── k8s/                     # Configuración Kubernetes
    └── scripts/                 # Scripts de infraestructura
```

## Principios de la Arquitectura Hexagonal

### 1. Capa de Dominio (Domain)
- **Propósito**: Contener la lógica de negocio pura
- **Dependencias**: Sin dependencias externas
- **Componentes**:
  - **Entities**: Objetos con identidad y lógica de negocio
  - **Repositories**: Interfaces para persistencia
  - **Services**: Servicios del dominio con lógica compleja
  - **Value Objects**: Objetos sin identidad pero con valor

### 2. Capa de Aplicación (Application)
- **Propósito**: Orquestar casos de uso y flujo de la aplicación
- **Dependencias**: Solo depende del dominio
- **Componentes**:
  - **Use Cases**: Implementación de casos de uso específicos
  - **DTOs**: Objetos para transferencia de datos
  - **Services**: Servicios de aplicación

### 3. Capa de Infraestructura (Infrastructure)
- **Propósito**: Implementar detalles técnicos
- **Dependencias**: Implementa interfaces del dominio
- **Componentes**:
  - **Persistence**: Implementación de repositorios
  - **External**: Integración con servicios externos
  - **Messaging**: Sistema de mensajería

### 4. Capa de Interfaces (Interfaces)
- **Propósito**: Comunicación con el mundo exterior
- **Dependencias**: Usa la capa de aplicación
- **Componentes**:
  - **HTTP**: Controladores y rutas REST
  - **CLI**: Comandos de línea de comandos
  - **Events**: Manejadores de eventos

## Flujo de Dependencias

Las dependencias fluyen hacia adentro:
```
Interfaces → Application → Domain ← Infrastructure
```

- **Interfaces** depende de **Application**
- **Application** depende de **Domain**
- **Infrastructure** implementa interfaces de **Domain**
- **Domain** no depende de nadie

## Beneficios

1. **Aislamiento**: La lógica de negocio está aislada de detalles técnicos
2. **Testabilidad**: Cada capa puede ser probada independientemente
3. **Flexibilidad**: Fácil cambiar tecnologías externas
4. **Mantenibilidad**: Código organizado y con responsabilidades claras
5. **Escalabilidad**: El sistema puede crecer de manera ordenada

## Convenciones

- **Importaciones**: Solo importar de capas internas
- **Nomenclatura**: Usar sufijos como `.entity.ts`, `.dto.ts`, `.use-case.ts`
- **Exportaciones**: Exportar solo lo necesario desde cada módulo
- **Tipado**: Usar TypeScript para toda la aplicación

## Migración

La estructura anterior ha sido migrada a esta nueva organización siguiendo los principios de arquitectura hexagonal. Todos los archivos han sido reorganizados en sus respectivas capas manteniendo la funcionalidad existente.
