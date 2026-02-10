# XtaskFlow

Sistema de gestión de proyectos y recursos humanos con arquitectura hexagonal.

## Estructura del Proyecto

```
XtaskFlow/
├── src/                          # Código fuente principal (arquitectura hexagonal)
│   ├── domain/                   # Capa de Dominio
│   ├── application/              # Capa de Aplicación  
│   ├── infrastructure/           # Capa de Infraestructura
│   ├── interfaces/               # Capa de Interfaces
│   └── shared/                   # Código compartido
├── client/                       # Aplicación cliente (React)
├── config/                       # Archivos de configuración
│   ├── environment/              # Variables de entorno
│   └── build/                    # Configuración de build
├── docs/                         # Documentación completa
├── resources/                    # Recursos del proyecto
├── scripts/                      # Scripts utilitarios
├── logs/                         # Archivos de log
├── temp/                         # Archivos temporales
└── infrastructure/               # Configuración de despliegue
```

## Documentación

- [Arquitectura del Sistema](docs/README_ARCHITECTURE.md)
- [Guía de Configuración](docs/SETUP_LOCAL.md)
- [Documentación de API](docs/API_REFERENCES.md)
- [Guías Técnicas](docs/)

## Inicio Rápido

1. Copiar variables de entorno:
   ```bash
   cp config/environment/.env.example config/environment/.env
   ```

2. Instalar dependencias:
   ```bash
   npm install
   ```

3. Iniciar desarrollo:
   ```bash
   npm run dev
   ```

## Scripts Disponibles

- `npm run dev` - Iniciar servidor de desarrollo
- `npm run build` - Compilar para producción
- `npm run start` - Iniciar servidor de producción
- `npm run db:push` - Sincronizar base de datos
- `npm run db:studio` - Abrir Drizzle Studio

## Arquitectura

El proyecto implementa una arquitectura hexagonal (Clean Architecture) con clara separación de responsabilidades:

- **Domain**: Lógica de negocio pura
- **Application**: Casos de uso y orquestación
- **Infrastructure**: Implementaciones técnicas
- **Interfaces**: Comunicación con el exterior

Para más detalles ver [README_ARCHITECTURE.md](docs/README_ARCHITECTURE.md)
