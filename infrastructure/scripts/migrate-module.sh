#!/bin/bash

# Script para ayudar en la migración de módulos a la nueva arquitectura

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

if [ -z "$1" ]; then
    echo -e "${RED}Error: Debes especificar el nombre del módulo${NC}"
    echo "Uso: ./scripts/migrate-module.sh <nombre-modulo>"
    echo "Ejemplo: ./scripts/migrate-module.sh empleados"
    exit 1
fi

MODULE_NAME=$1
MODULE_NAME_CAPITALIZED="$(tr '[:lower:]' '[:upper:]' <<< ${MODULE_NAME:0:1})${MODULE_NAME:1}"

echo -e "${GREEN}🔄 Iniciando migración del módulo: ${MODULE_NAME}${NC}"
echo ""

# Backend - Crear estructura hexagonal
echo -e "${YELLOW}📁 Creando estructura de backend...${NC}"

mkdir -p "server/domain/entities"
mkdir -p "server/domain/repositories"
mkdir -p "server/domain/services"
mkdir -p "server/application/use-cases/${MODULE_NAME}"
mkdir -p "server/application/dto"
mkdir -p "server/infrastructure/database/repositories"
mkdir -p "server/interfaces/http/controllers"
mkdir -p "server/interfaces/http/routes"

# Crear archivos base de backend
echo -e "${YELLOW}📝 Creando archivos base de backend...${NC}"

# Entity
cat > "server/domain/entities/${MODULE_NAME}.entity.ts" << EOF
/**
 * Entidad de dominio: ${MODULE_NAME_CAPITALIZED}
 * Contiene la lógica de negocio del ${MODULE_NAME}
 */
export class ${MODULE_NAME_CAPITALIZED} {
  constructor(
    public readonly id: number,
    // TODO: Agregar propiedades del ${MODULE_NAME}
  ) {}

  // TODO: Agregar métodos de negocio
}
EOF

# Repository Interface
cat > "server/domain/repositories/${MODULE_NAME}.repository.ts" << EOF
import { ${MODULE_NAME_CAPITALIZED} } from '../entities/${MODULE_NAME}.entity';

/**
 * Interface de repositorio para ${MODULE_NAME_CAPITALIZED}
 * Define los contratos de persistencia
 */
export interface ${MODULE_NAME_CAPITALIZED}Repository {
  findById(id: number): Promise<${MODULE_NAME_CAPITALIZED} | null>;
  findAll(): Promise<${MODULE_NAME_CAPITALIZED}[]>;
  save(${MODULE_NAME}: ${MODULE_NAME_CAPITALIZED}): Promise<${MODULE_NAME_CAPITALIZED}>;
  update(id: number, ${MODULE_NAME}: Partial<${MODULE_NAME_CAPITALIZED}>): Promise<${MODULE_NAME_CAPITALIZED}>;
  delete(id: number): Promise<void>;
}
EOF

# DTOs
cat > "server/application/dto/${MODULE_NAME}.dto.ts" << EOF
import { ${MODULE_NAME_CAPITALIZED} } from '../../domain/entities/${MODULE_NAME}.entity';

/**
 * DTO para crear ${MODULE_NAME}
 */
export class Create${MODULE_NAME_CAPITALIZED}Dto {
  // TODO: Agregar propiedades necesarias para crear
}

/**
 * DTO para actualizar ${MODULE_NAME}
 */
export class Update${MODULE_NAME_CAPITALIZED}Dto {
  // TODO: Agregar propiedades opcionales para actualizar
}

/**
 * DTO de respuesta para ${MODULE_NAME}
 */
export class ${MODULE_NAME_CAPITALIZED}ResponseDto {
  id: number;
  // TODO: Agregar propiedades de respuesta

  static fromEntity(${MODULE_NAME}: ${MODULE_NAME_CAPITALIZED}): ${MODULE_NAME_CAPITALIZED}ResponseDto {
    return {
      id: ${MODULE_NAME}.id,
      // TODO: Mapear propiedades
    };
  }
}
EOF

# Use Case
cat > "server/application/use-cases/${MODULE_NAME}/create-${MODULE_NAME}.use-case.ts" << EOF
import { ${MODULE_NAME_CAPITALIZED}Repository } from '../../../domain/repositories/${MODULE_NAME}.repository';
import { ${MODULE_NAME_CAPITALIZED} } from '../../../domain/entities/${MODULE_NAME}.entity';
import { Create${MODULE_NAME_CAPITALIZED}Dto, ${MODULE_NAME_CAPITALIZED}ResponseDto } from '../../dto/${MODULE_NAME}.dto';

/**
 * Caso de uso: Crear ${MODULE_NAME}
 */
export class Create${MODULE_NAME_CAPITALIZED}UseCase {
  constructor(
    private readonly ${MODULE_NAME}Repository: ${MODULE_NAME_CAPITALIZED}Repository
  ) {}

  async execute(dto: Create${MODULE_NAME_CAPITALIZED}Dto): Promise<${MODULE_NAME_CAPITALIZED}ResponseDto> {
    // TODO: Implementar lógica de creación
    const ${MODULE_NAME} = new ${MODULE_NAME_CAPITALIZED}(
      0,
      // TODO: Pasar propiedades del DTO
    );

    const saved${MODULE_NAME_CAPITALIZED} = await this.${MODULE_NAME}Repository.save(${MODULE_NAME});
    return ${MODULE_NAME_CAPITALIZED}ResponseDto.fromEntity(saved${MODULE_NAME_CAPITALIZED});
  }
}
EOF

# Repository Implementation
cat > "server/infrastructure/database/repositories/${MODULE_NAME}.repository.impl.ts" << EOF
import { ${MODULE_NAME_CAPITALIZED}Repository } from '../../../domain/repositories/${MODULE_NAME}.repository';
import { ${MODULE_NAME_CAPITALIZED} } from '../../../domain/entities/${MODULE_NAME}.entity';
import { db } from '../../db';

/**
 * Implementación del repositorio de ${MODULE_NAME}
 */
export class ${MODULE_NAME_CAPITALIZED}RepositoryImpl implements ${MODULE_NAME_CAPITALIZED}Repository {
  async findById(id: number): Promise<${MODULE_NAME_CAPITALIZED} | null> {
    // TODO: Implementar consulta a base de datos
    throw new Error('Not implemented');
  }

  async findAll(): Promise<${MODULE_NAME_CAPITALIZED}[]> {
    // TODO: Implementar consulta a base de datos
    throw new Error('Not implemented');
  }

  async save(${MODULE_NAME}: ${MODULE_NAME_CAPITALIZED}): Promise<${MODULE_NAME_CAPITALIZED}> {
    // TODO: Implementar inserción en base de datos
    throw new Error('Not implemented');
  }

  async update(id: number, ${MODULE_NAME}: Partial<${MODULE_NAME_CAPITALIZED}>): Promise<${MODULE_NAME_CAPITALIZED}> {
    // TODO: Implementar actualización en base de datos
    throw new Error('Not implemented');
  }

  async delete(id: number): Promise<void> {
    // TODO: Implementar eliminación en base de datos
    throw new Error('Not implemented');
  }

  private toDomain(data: any): ${MODULE_NAME_CAPITALIZED} {
    return new ${MODULE_NAME_CAPITALIZED}(
      data.id,
      // TODO: Mapear propiedades de base de datos a entidad
    );
  }
}
EOF

# Controller
cat > "server/interfaces/http/controllers/${MODULE_NAME}.controller.ts" << EOF
import { Request, Response } from 'express';
import { Create${MODULE_NAME_CAPITALIZED}UseCase } from '../../../application/use-cases/${MODULE_NAME}/create-${MODULE_NAME}.use-case';

/**
 * Controlador HTTP para ${MODULE_NAME}
 */
export class ${MODULE_NAME_CAPITALIZED}Controller {
  constructor(
    private readonly create${MODULE_NAME_CAPITALIZED}UseCase: Create${MODULE_NAME_CAPITALIZED}UseCase,
    // TODO: Agregar otros casos de uso
  ) {}

  async create(req: Request, res: Response): Promise<void> {
    try {
      const dto = req.body;
      const result = await this.create${MODULE_NAME_CAPITALIZED}UseCase.execute(dto);
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  async getAll(req: Request, res: Response): Promise<void> {
    // TODO: Implementar
    res.status(501).json({ message: 'Not implemented' });
  }

  async getById(req: Request, res: Response): Promise<void> {
    // TODO: Implementar
    res.status(501).json({ message: 'Not implemented' });
  }

  async update(req: Request, res: Response): Promise<void> {
    // TODO: Implementar
    res.status(501).json({ message: 'Not implemented' });
  }

  async delete(req: Request, res: Response): Promise<void> {
    // TODO: Implementar
    res.status(501).json({ message: 'Not implemented' });
  }
}
EOF

# Routes
cat > "server/interfaces/http/routes/${MODULE_NAME}.routes.ts" << EOF
import { Router } from 'express';
import { ${MODULE_NAME_CAPITALIZED}Controller } from '../controllers/${MODULE_NAME}.controller';

/**
 * Rutas para ${MODULE_NAME}
 */
export function create${MODULE_NAME_CAPITALIZED}Routes(controller: ${MODULE_NAME_CAPITALIZED}Controller): Router {
  const router = Router();

  router.get('/', (req, res) => controller.getAll(req, res));
  router.get('/:id', (req, res) => controller.getById(req, res));
  router.post('/', (req, res) => controller.create(req, res));
  router.put('/:id', (req, res) => controller.update(req, res));
  router.delete('/:id', (req, res) => controller.delete(req, res));

  return router;
}
EOF

echo -e "${GREEN}✅ Estructura de backend creada${NC}"
echo ""

# Frontend - Crear estructura por capas
echo -e "${YELLOW}📁 Creando estructura de frontend...${NC}"

mkdir -p "client/src/domain/models"
mkdir -p "client/src/domain/types"
mkdir -p "client/src/infrastructure/http/endpoints"
mkdir -p "client/src/application/services"
mkdir -p "client/src/application/hooks/${MODULE_NAME}"
mkdir -p "client/src/presentation/components/features/${MODULE_NAME}"
mkdir -p "client/src/presentation/pages/${MODULE_NAME}"

# Crear archivos base de frontend
echo -e "${YELLOW}📝 Creando archivos base de frontend...${NC}"

# Model
cat > "client/src/domain/models/${MODULE_NAME}.model.ts" << EOF
/**
 * Modelo de dominio: ${MODULE_NAME_CAPITALIZED}
 */
export class ${MODULE_NAME_CAPITALIZED} {
  constructor(
    public id: number,
    // TODO: Agregar propiedades
  ) {}

  // TODO: Agregar métodos de dominio
}
EOF

# Types
cat > "client/src/domain/types/${MODULE_NAME}.types.ts" << EOF
/**
 * Tipos para ${MODULE_NAME}
 */
export interface Create${MODULE_NAME_CAPITALIZED}Data {
  // TODO: Agregar propiedades
}

export interface Update${MODULE_NAME_CAPITALIZED}Data {
  // TODO: Agregar propiedades opcionales
}
EOF

# Endpoints
cat > "client/src/infrastructure/http/endpoints/${MODULE_NAME}.endpoints.ts" << EOF
import { apiClient } from '../api-client';
import { ${MODULE_NAME_CAPITALIZED} } from '@/domain/models/${MODULE_NAME}.model';
import { Create${MODULE_NAME_CAPITALIZED}Data, Update${MODULE_NAME_CAPITALIZED}Data } from '@/domain/types/${MODULE_NAME}.types';

/**
 * Endpoints para ${MODULE_NAME}
 */
export const ${MODULE_NAME}Endpoints = {
  getAll: () => apiClient.get<${MODULE_NAME_CAPITALIZED}[]>('/api/${MODULE_NAME}'),
  getById: (id: number) => apiClient.get<${MODULE_NAME_CAPITALIZED}>(\`/api/${MODULE_NAME}/\${id}\`),
  create: (data: Create${MODULE_NAME_CAPITALIZED}Data) => 
    apiClient.post<${MODULE_NAME_CAPITALIZED}>('/api/${MODULE_NAME}', data),
  update: (id: number, data: Update${MODULE_NAME_CAPITALIZED}Data) => 
    apiClient.put<${MODULE_NAME_CAPITALIZED}>(\`/api/${MODULE_NAME}/\${id}\`, data),
  delete: (id: number) => apiClient.delete(\`/api/${MODULE_NAME}/\${id}\`),
};
EOF

# Service
cat > "client/src/application/services/${MODULE_NAME}.service.ts" << EOF
import { ${MODULE_NAME}Endpoints } from '@/infrastructure/http/endpoints/${MODULE_NAME}.endpoints';
import { ${MODULE_NAME_CAPITALIZED} } from '@/domain/models/${MODULE_NAME}.model';
import { Create${MODULE_NAME_CAPITALIZED}Data, Update${MODULE_NAME_CAPITALIZED}Data } from '@/domain/types/${MODULE_NAME}.types';

/**
 * Servicio de aplicación para ${MODULE_NAME}
 */
export class ${MODULE_NAME_CAPITALIZED}Service {
  async get${MODULE_NAME_CAPITALIZED}s(): Promise<${MODULE_NAME_CAPITALIZED}[]> {
    const response = await ${MODULE_NAME}Endpoints.getAll();
    return response.data;
  }

  async get${MODULE_NAME_CAPITALIZED}ById(id: number): Promise<${MODULE_NAME_CAPITALIZED}> {
    const response = await ${MODULE_NAME}Endpoints.getById(id);
    return response.data;
  }

  async create${MODULE_NAME_CAPITALIZED}(data: Create${MODULE_NAME_CAPITALIZED}Data): Promise<${MODULE_NAME_CAPITALIZED}> {
    const response = await ${MODULE_NAME}Endpoints.create(data);
    return response.data;
  }

  async update${MODULE_NAME_CAPITALIZED}(id: number, data: Update${MODULE_NAME_CAPITALIZED}Data): Promise<${MODULE_NAME_CAPITALIZED}> {
    const response = await ${MODULE_NAME}Endpoints.update(id, data);
    return response.data;
  }

  async delete${MODULE_NAME_CAPITALIZED}(id: number): Promise<void> {
    await ${MODULE_NAME}Endpoints.delete(id);
  }
}

export const ${MODULE_NAME}Service = new ${MODULE_NAME_CAPITALIZED}Service();
EOF

# Hooks
cat > "client/src/application/hooks/${MODULE_NAME}/use${MODULE_NAME_CAPITALIZED}s.ts" << EOF
import { useQuery } from '@tanstack/react-query';
import { ${MODULE_NAME}Service } from '@/application/services/${MODULE_NAME}.service';

/**
 * Hook para obtener lista de ${MODULE_NAME}
 */
export function use${MODULE_NAME_CAPITALIZED}s() {
  return useQuery({
    queryKey: ['${MODULE_NAME}'],
    queryFn: () => ${MODULE_NAME}Service.get${MODULE_NAME_CAPITALIZED}s(),
  });
}
EOF

cat > "client/src/application/hooks/${MODULE_NAME}/useCreate${MODULE_NAME_CAPITALIZED}.ts" << EOF
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ${MODULE_NAME}Service } from '@/application/services/${MODULE_NAME}.service';
import { Create${MODULE_NAME_CAPITALIZED}Data } from '@/domain/types/${MODULE_NAME}.types';

/**
 * Hook para crear ${MODULE_NAME}
 */
export function useCreate${MODULE_NAME_CAPITALIZED}() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Create${MODULE_NAME_CAPITALIZED}Data) => 
      ${MODULE_NAME}Service.create${MODULE_NAME_CAPITALIZED}(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['${MODULE_NAME}'] });
    },
  });
}
EOF

# Component
cat > "client/src/presentation/components/features/${MODULE_NAME}/${MODULE_NAME_CAPITALIZED}List.tsx" << EOF
import { ${MODULE_NAME_CAPITALIZED} } from '@/domain/models/${MODULE_NAME}.model';

interface ${MODULE_NAME_CAPITALIZED}ListProps {
  ${MODULE_NAME}s: ${MODULE_NAME_CAPITALIZED}[];
}

/**
 * Componente para mostrar lista de ${MODULE_NAME}
 */
export function ${MODULE_NAME_CAPITALIZED}List({ ${MODULE_NAME}s }: ${MODULE_NAME_CAPITALIZED}ListProps) {
  return (
    <div>
      <h2>Lista de ${MODULE_NAME_CAPITALIZED}</h2>
      {/* TODO: Implementar visualización de lista */}
      <ul>
        {${MODULE_NAME}s.map((item) => (
          <li key={item.id}>{JSON.stringify(item)}</li>
        ))}
      </ul>
    </div>
  );
}
EOF

# Page
cat > "client/src/presentation/pages/${MODULE_NAME}/${MODULE_NAME_CAPITALIZED}Page.tsx" << EOF
import { use${MODULE_NAME_CAPITALIZED}s } from '@/application/hooks/${MODULE_NAME}/use${MODULE_NAME_CAPITALIZED}s';
import { ${MODULE_NAME_CAPITALIZED}List } from '@/presentation/components/features/${MODULE_NAME}/${MODULE_NAME_CAPITALIZED}List';

/**
 * Página principal de ${MODULE_NAME}
 */
export function ${MODULE_NAME_CAPITALIZED}Page() {
  const { data: ${MODULE_NAME}s, isLoading, error } = use${MODULE_NAME_CAPITALIZED}s();

  if (isLoading) return <div>Cargando...</div>;
  if (error) return <div>Error: {(error as Error).message}</div>;

  return (
    <div>
      <h1>${MODULE_NAME_CAPITALIZED}</h1>
      <${MODULE_NAME_CAPITALIZED}List ${MODULE_NAME}s={${MODULE_NAME}s || []} />
    </div>
  );
}
EOF

echo -e "${GREEN}✅ Estructura de frontend creada${NC}"
echo ""

echo -e "${GREEN}🎉 ¡Migración del módulo ${MODULE_NAME} iniciada!${NC}"
echo ""
echo -e "${YELLOW}📋 Próximos pasos:${NC}"
echo "1. Implementar la lógica en los archivos creados (busca TODOs)"
echo "2. Actualizar el schema de base de datos si es necesario"
echo "3. Probar los endpoints del backend"
echo "4. Probar la interfaz del frontend"
echo "5. Actualizar las rutas en server/index.ts y App.tsx"
echo ""
echo -e "${YELLOW}📁 Archivos creados:${NC}"
echo "Backend:"
echo "  - server/domain/entities/${MODULE_NAME}.entity.ts"
echo "  - server/domain/repositories/${MODULE_NAME}.repository.ts"
echo "  - server/application/dto/${MODULE_NAME}.dto.ts"
echo "  - server/application/use-cases/${MODULE_NAME}/create-${MODULE_NAME}.use-case.ts"
echo "  - server/infrastructure/database/repositories/${MODULE_NAME}.repository.impl.ts"
echo "  - server/interfaces/http/controllers/${MODULE_NAME}.controller.ts"
echo "  - server/interfaces/http/routes/${MODULE_NAME}.routes.ts"
echo ""
echo "Frontend:"
echo "  - client/src/domain/models/${MODULE_NAME}.model.ts"
echo "  - client/src/domain/types/${MODULE_NAME}.types.ts"
echo "  - client/src/infrastructure/http/endpoints/${MODULE_NAME}.endpoints.ts"
echo "  - client/src/application/services/${MODULE_NAME}.service.ts"
echo "  - client/src/application/hooks/${MODULE_NAME}/use${MODULE_NAME_CAPITALIZED}s.ts"
echo "  - client/src/application/hooks/${MODULE_NAME}/useCreate${MODULE_NAME_CAPITALIZED}.ts"
echo "  - client/src/presentation/components/features/${MODULE_NAME}/${MODULE_NAME_CAPITALIZED}List.tsx"
echo "  - client/src/presentation/pages/${MODULE_NAME}/${MODULE_NAME_CAPITALIZED}Page.tsx"
echo ""
