#!/bin/bash

# Script para desplegar XTask en Kubernetes

echo "🚀 Iniciando despliegue de XTask Platform en Kubernetes..."

# Crear namespace
echo "📦 Creando namespace..."
kubectl apply -f namespace.yaml

# Aplicar configuraciones
echo "⚙️ Aplicando configuraciones..."
kubectl apply -f configmap.yaml
kubectl apply -f secret.yaml

# Desplegar PostgreSQL
echo "🗄️ Desplegando PostgreSQL..."
kubectl apply -f postgres-deployment.yaml

# Esperar a que PostgreSQL esté listo
echo "⏳ Esperando que PostgreSQL esté listo..."
kubectl wait --for=condition=available --timeout=300s deployment/postgres -n xtask-platform

# Desplegar aplicación XTask
echo "🌐 Desplegando XTask Application..."
kubectl apply -f xtask-deployment.yaml

# Esperar a que la aplicación esté lista
echo "⏳ Esperando que XTask esté listo..."
kubectl wait --for=condition=available --timeout=300s deployment/xtask-app -n xtask-platform

# Aplicar Ingress
echo "🌍 Configurando Ingress..."
kubectl apply -f ingress.yaml

# Aplicar HPA
echo "📊 Configurando Auto Scaling..."
kubectl apply -f hpa.yaml

echo "✅ Despliegue completado!"
echo ""
echo "📋 Estado del despliegue:"
kubectl get pods -n xtask-platform
echo ""
echo "🔗 Servicios:"
kubectl get services -n xtask-platform
echo ""
echo "🚪 Para acceder localmente:"
echo "kubectl port-forward service/xtask-service 8080:80 -n xtask-platform"