#!/bin/bash

echo "🌱 Creando datos de demostración para Alonso49..."
echo ""

API_URL="http://localhost:3001/api"

echo "1️⃣  Registrando usuarios de prueba..."

echo "   - Atleta: carlos@example.com"
ATHLETE_TOKEN=$(curl -s -X POST $API_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "carlos@example.com",
    "password": "password123",
    "firstName": "Carlos",
    "lastName": "Martínez",
    "role": "ATHLETE"
  }' | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

echo "   - Coach: ana@example.com"
COACH_TOKEN=$(curl -s -X POST $API_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "ana@example.com",
    "password": "password123",
    "firstName": "Ana",
    "lastName": "García",
    "role": "COACH"
  }' | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

echo "   - Academia: academy@example.com"
ACADEMY_TOKEN=$(curl -s -X POST $API_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "academy@example.com",
    "password": "password123",
    "firstName": "Sailing",
    "lastName": "Academy",
    "role": "ACADEMY"
  }' | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

echo ""
echo "2️⃣  Creando equipos..."

curl -s -X POST $API_URL/teams \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $COACH_TOKEN" \
  -d '{
    "name": "Team Alpha",
    "description": "Equipo de alto rendimiento enfocado en regatas nacionales"
  }' > /dev/null

curl -s -X POST $API_URL/teams \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $COACH_TOKEN" \
  -d '{
    "name": "Team Beta",
    "description": "Equipo junior en desarrollo"
  }' > /dev/null

echo "   ✅ Equipos creados"

echo ""
echo "3️⃣  Creando sesiones de entrenamiento..."

curl -s -X POST $API_URL/sessions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ATHLETE_TOKEN" \
  -d '{
    "title": "Entrenamiento de Tacking",
    "description": "Práctica de viradas rápidas en condiciones de viento medio",
    "location": "Bahía de Santander",
    "status": "COMPLETED",
    "windSpeed": 12,
    "windDirection": "NE"
  }' > /dev/null

curl -s -X POST $API_URL/sessions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ATHLETE_TOKEN" \
  -d '{
    "title": "Práctica de Salida",
    "description": "Simulación de salidas de regata con diferentes escenarios",
    "location": "Puerto de Vela",
    "status": "SCHEDULED",
    "scheduledAt": "2026-08-01T09:00:00Z"
  }' > /dev/null

curl -s -X POST $API_URL/sessions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ATHLETE_TOKEN" \
  -d '{
    "title": "Downwind Training",
    "description": "Técnicas de navegación en popa con spinnaker",
    "location": "Mar Abierto",
    "status": "IN_PROGRESS",
    "windSpeed": 15,
    "windDirection": "SW"
  }' > /dev/null

echo "   ✅ Sesiones creadas"

echo ""
echo "4️⃣  Subiendo videos de entrenamiento..."

curl -s -X POST $API_URL/videos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ATHLETE_TOKEN" \
  -d '{
    "title": "Sesión de Tacking - 28 Julio 2026",
    "description": "Análisis de viradas en condiciones de viento moderado. Se observan mejoras en la velocidad de ejecución.",
    "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "status": "READY"
  }' > /dev/null

curl -s -X POST $API_URL/videos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ATHLETE_TOKEN" \
  -d '{
    "title": "Práctica Spinnaker - Día 1",
    "description": "Primera sesión con spinnaker asimétrico. Trabajo en coordinación de tripulación.",
    "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "status": "READY"
  }' > /dev/null

curl -s -X POST $API_URL/videos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ATHLETE_TOKEN" \
  -d '{
    "title": "Análisis Táctica Regata",
    "description": "Revisión de decisiones tácticas durante la última regata clasificatoria.",
    "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "status": "PROCESSING"
  }' > /dev/null

echo "   ✅ Videos subidos"

echo ""
echo "✅ ¡Datos de demostración creados exitosamente!"
echo ""
echo "📝 Credenciales de acceso:"
echo ""
echo "   Atleta:"
echo "     Email: carlos@example.com"
echo "     Password: password123"
echo ""
echo "   Coach:"
echo "     Email: ana@example.com"
echo "     Password: password123"
echo ""
echo "   Academia:"
echo "     Email: academy@example.com"
echo "     Password: password123"
echo ""
echo "🌐 Accede a la plataforma en: http://localhost:3000"
echo ""
