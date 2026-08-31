#!/bin/bash

echo "🚀 Iniciando Sailvex Platform..."
echo ""

if ! command -v docker &> /dev/null; then
    echo "❌ Docker no está instalado. Por favor, instala Docker primero."
    exit 1
fi

if ! docker compose version &> /dev/null && ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose no está instalado. Por favor, instala Docker Compose primero."
    exit 1
fi

COMPOSE_CMD="docker compose"
if ! docker compose version &> /dev/null; then
    COMPOSE_CMD="docker-compose"
fi

echo "📦 Verificando archivos .env..."

if [ ! -f backend/.env ]; then
    echo "Creando backend/.env desde .env.example..."
    cp backend/.env.example backend/.env
fi

if [ ! -f frontend/.env ]; then
    echo "Creando frontend/.env desde .env.example..."
    cp frontend/.env.example frontend/.env
fi

echo ""
echo "🐳 Iniciando contenedores Docker..."
$COMPOSE_CMD up -d

echo ""
echo "⏳ Esperando que los servicios estén listos..."
sleep 10

echo ""
echo "🔄 Verificando base de datos..."
docker exec alonso49-backend npx prisma db push --accept-data-loss > /dev/null 2>&1

echo ""
echo "✅ ¡Plataforma Sailvex iniciada correctamente!"
echo ""
echo "📍 URLs disponibles:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:3001/api"
echo "   API Docs: http://localhost:3001/api/docs"
echo ""
echo "🔑 Credenciales de prueba:"
echo "   Usuario de prueba creado en el primer registro"
echo ""
echo "📝 Comandos útiles:"
echo "   Ver logs: $COMPOSE_CMD logs -f"
echo "   Ver logs backend: $COMPOSE_CMD logs -f backend"
echo "   Ver logs frontend: $COMPOSE_CMD logs -f frontend"
echo "   Detener: $COMPOSE_CMD down"
echo "   Reiniciar: $COMPOSE_CMD restart"
echo ""
