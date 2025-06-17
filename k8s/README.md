# Kubernetes Deployment para XTask Platform

Esta guía te ayudará a desplegar XTask Platform en un cluster de Kubernetes.

## Prerrequisitos

- Cluster de Kubernetes funcionando
- `kubectl` configurado
- Ingress Controller (NGINX recomendado)
- Cert-Manager para certificados SSL (opcional)

## Estructura de Archivos

```
k8s/
├── namespace.yaml          # Namespace para aislar recursos
├── configmap.yaml         # Variables de configuración no sensibles
├── secret.yaml            # Variables sensibles (passwords, tokens)
├── postgres-deployment.yaml # Base de datos PostgreSQL
├── xtask-deployment.yaml  # Aplicación principal
├── ingress.yaml           # Acceso externo
├── hpa.yaml              # Auto-escalado horizontal
├── deploy.sh             # Script de despliegue automático
└── README.md             # Esta documentación
```

## Configuración Inicial

### 1. Actualizar Secrets

Edita `secret.yaml` y configura tus credenciales:

```bash
# Codificar secrets en base64
echo -n "tu-database-url" | base64
echo -n "tu-stripe-secret" | base64
```

### 2. Configurar Dominio

Edita `ingress.yaml` y reemplaza `xtask.yourdomain.com` con tu dominio real.

### 3. Construir y Subir Imagen Docker

```bash
# Construir imagen Docker
docker build -t xtask312/xtask-platform:latest .

# Subir a Docker Hub
docker push xtask312/xtask-platform:latest
```

## Despliegue

### Opción 1: Script Automático

```bash
cd k8s/
./deploy.sh
```

### Opción 2: Manual

```bash
# Aplicar archivos en orden
kubectl apply -f namespace.yaml
kubectl apply -f configmap.yaml
kubectl apply -f secret.yaml
kubectl apply -f postgres-deployment.yaml
kubectl apply -f xtask-deployment.yaml
kubectl apply -f ingress.yaml
kubectl apply -f hpa.yaml
```

## Verificación

```bash
# Ver estado de pods
kubectl get pods -n xtask-platform

# Ver servicios
kubectl get services -n xtask-platform

# Ver logs de la aplicación
kubectl logs -f deployment/xtask-app -n xtask-platform

# Ver estado del ingress
kubectl get ingress -n xtask-platform
```

## Acceso Local

Para desarrollo y pruebas:

```bash
# Port-forward para acceso local
kubectl port-forward service/xtask-service 8080:80 -n xtask-platform
```

Luego accede a `http://localhost:8080`

## Escalado

```bash
# Escalar manualmente
kubectl scale deployment xtask-app --replicas=5 -n xtask-platform

# Ver estado del auto-escalado
kubectl get hpa -n xtask-platform
```

## Monitoreo

```bash
# Recursos utilizados
kubectl top pods -n xtask-platform
kubectl top nodes

# Eventos del cluster
kubectl get events -n xtask-platform --sort-by='.lastTimestamp'
```

## Solución de Problemas

### Pod no inicia
```bash
kubectl describe pod <pod-name> -n xtask-platform
kubectl logs <pod-name> -n xtask-platform
```

### Base de datos no conecta
```bash
kubectl exec -it deployment/xtask-app -n xtask-platform -- env | grep DATABASE
```

### Problemas de red
```bash
kubectl exec -it deployment/xtask-app -n xtask-platform -- nslookup postgres
```

## Actualización

```bash
# Actualizar imagen
kubectl set image deployment/xtask-app xtask-app=xtask312/xtask-platform:v2.0 -n xtask-platform

# Verificar rollout
kubectl rollout status deployment/xtask-app -n xtask-platform
```

## Backup de Base de Datos

```bash
# Crear backup
kubectl exec -it deployment/postgres -n xtask-platform -- pg_dump -U xtask_user xtask > backup.sql

# Restaurar backup
kubectl exec -i deployment/postgres -n xtask-platform -- psql -U xtask_user xtask < backup.sql
```

## Limpieza

```bash
# Eliminar todo el namespace
kubectl delete namespace xtask-platform
```