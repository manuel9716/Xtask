# Configuración de Azure Data Studio para XtaskFlow

## Requisitos Previos
- Docker Desktop instalado y ejecutándose
- Azure Data Studio instalado ([Descargar aquí](https://docs.microsoft.com/en-us/sql/azure-data-studio/download))

## Iniciar SQL Server 2019

```bash
# Desde la raíz del proyecto
docker-compose up -d sqlserver
```

## Conectar Azure Data Studio

### Parámetros de Conexión

1. Abrir Azure Data Studio
2. Click en "New Connection" o presionar `Ctrl+N` (Windows/Linux) / `Cmd+N` (Mac)
3. Configurar los siguientes parámetros:

```
Connection Type: Microsoft SQL Server
Server: localhost,1433
Authentication Type: SQL Login
User name: sa
Password: XtaskFlow2024!
Database: <default> (o XtaskFlowDB después de crear la base de datos)
Server group: <None>
Name (optional): XtaskFlow Local
```

4. Click en "Connect"

## Crear Base de Datos Inicial

Después de conectar, ejecutar el siguiente script en una nueva query:

```sql
-- Crear la base de datos principal
CREATE DATABASE XtaskFlowDB;
GO

-- Usar la base de datos
USE XtaskFlowDB;
GO

-- Verificar la creación
SELECT name, database_id, create_date 
FROM sys.databases 
WHERE name = 'XtaskFlowDB';
GO
```

## Verificar Conexión

```bash
# Verificar que el contenedor está corriendo
docker ps | grep sqlserver

# Ver logs del contenedor
docker logs xtaskflow-sqlserver

# Conectar desde línea de comandos (opcional)
docker exec -it xtaskflow-sqlserver /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "XtaskFlow2024!"
```

## Comandos Útiles

### Detener SQL Server
```bash
docker-compose stop sqlserver
```

### Iniciar SQL Server
```bash
docker-compose start sqlserver
```

### Reiniciar SQL Server
```bash
docker-compose restart sqlserver
```

### Ver logs en tiempo real
```bash
docker-compose logs -f sqlserver
```

### Eliminar datos y reiniciar limpio
```bash
docker-compose down -v
docker-compose up -d sqlserver
```

## Configuración de Drizzle ORM con SQL Server

El proyecto usa Drizzle ORM. Para trabajar con SQL Server:

1. La cadena de conexión en `.env` debe ser:
```
DATABASE_URL=mssql://sa:XtaskFlow2024!@localhost:1433/XtaskFlowDB
```

2. Ejecutar migraciones:
```bash
npm run db:push
```

3. Abrir Drizzle Studio (opcional):
```bash
npm run db:studio
```

## Troubleshooting

### Error: "Login failed for user 'sa'"
- Verificar que la contraseña sea exactamente: `XtaskFlow2024!`
- Asegurarse de que el contenedor esté completamente iniciado (esperar 30 segundos)

### Error: "Cannot connect to localhost,1433"
- Verificar que Docker Desktop esté ejecutándose
- Verificar que el puerto 1433 no esté siendo usado por otra aplicación
- Ejecutar: `docker ps` para confirmar que el contenedor está corriendo

### El contenedor se detiene inmediatamente
- Verificar logs: `docker logs xtaskflow-sqlserver`
- Asegurarse de que la contraseña cumple con los requisitos de complejidad de SQL Server

## Alternativa: Adminer (Interfaz Web)

Si prefieres una interfaz web en lugar de Azure Data Studio:

```bash
docker-compose up -d adminer
```

Luego abre en el navegador: http://localhost:8081

Parámetros de conexión:
- System: MS SQL (beta)
- Server: sqlserver
- Username: sa
- Password: XtaskFlow2024!
- Database: XtaskFlowDB
