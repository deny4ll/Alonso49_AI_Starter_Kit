#!/bin/bash

echo "👥 Creando usuarios de prueba para Alonso49..."
echo ""

API_URL="http://localhost:3001/api"

echo "1️⃣  Creando ATLETA..."
ATHLETE_RESPONSE=$(curl -s -X POST $API_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "atleta@alonso49.com",
    "password": "atleta123",
    "firstName": "Juan",
    "lastName": "Pérez",
    "role": "ATHLETE"
  }')

if echo "$ATHLETE_RESPONSE" | grep -q "accessToken"; then
  echo "   ✅ Atleta creado exitosamente"
else
  echo "   ⚠️  El atleta ya existe o hubo un error"
fi

echo ""
echo "2️⃣  Creando COACH..."
COACH_RESPONSE=$(curl -s -X POST $API_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "coach@alonso49.com",
    "password": "coach123",
    "firstName": "María",
    "lastName": "González",
    "role": "COACH"
  }')

if echo "$COACH_RESPONSE" | grep -q "accessToken"; then
  echo "   ✅ Coach creado exitosamente"
else
  echo "   ⚠️  El coach ya existe o hubo un error"
fi

echo ""
echo "3️⃣  Creando ACADEMIA..."
ACADEMY_RESPONSE=$(curl -s -X POST $API_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "academia@alonso49.com",
    "password": "academia123",
    "firstName": "Elite",
    "lastName": "Sailing Academy",
    "role": "ACADEMY"
  }')

if echo "$ACADEMY_RESPONSE" | grep -q "accessToken"; then
  echo "   ✅ Academia creada exitosamente"
else
  echo "   ⚠️  La academia ya existe o hubo un error"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ USUARIOS DE PRUEBA CREADOS"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🏃 ATLETA (Juan Pérez)"
echo "   📧 Email:    atleta@alonso49.com"
echo "   🔑 Password: atleta123"
echo "   🎯 Rol:      ATHLETE"
echo "   💡 Puede:    Subir videos, crear sesiones, ver estadísticas"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "👨‍🏫 COACH (María González)"
echo "   📧 Email:    coach@alonso49.com"
echo "   🔑 Password: coach123"
echo "   🎯 Rol:      COACH"
echo "   💡 Puede:    Gestionar equipos, revisar sesiones, dar feedback"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🏫 ACADEMIA (Elite Sailing Academy)"
echo "   📧 Email:    academia@alonso49.com"
echo "   🔑 Password: academia123"
echo "   🎯 Rol:      ACADEMY"
echo "   💡 Puede:    Crear cursos, gestionar múltiples equipos, monetización"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🌐 Accede a la plataforma en: http://localhost:3000/login"
echo ""
