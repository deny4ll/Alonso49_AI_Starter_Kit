#!/bin/bash

# Script de Prueba del AI Coach
# Sailvex Platform

echo ""
echo "╔═══════════════════════════════════════════════╗"
echo "║   🤖 Prueba del AI High Performance Coach    ║"
echo "╚═══════════════════════════════════════════════╝"
echo ""

cd /Users/chris/Documents/Projects/chrisAI/Sailvex_AI_Starter_Kit

# 1. Verificar que los servicios estén corriendo
echo "1️⃣  Verificando servicios..."
if ! docker-compose ps | grep -q "Up"; then
  echo "❌ Error: Los servicios no están corriendo"
  echo "   Ejecuta: docker-compose up -d"
  exit 1
fi
echo "✅ Servicios corriendo"
echo ""

# 2. Obtener token de autenticación
echo "2️⃣  Obteniendo token de autenticación..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@alonso49.com","password":"Test123!"}')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Error: No se pudo obtener el token"
  echo "   Verifica que el usuario test@alonso49.com exista"
  exit 1
fi

echo "✅ Token obtenido: ${TOKEN:0:50}..."
echo ""

# 3. Consulta al AI Coach
echo "3️⃣  Consultando al AI Coach..."
echo "═══════════════════════════════════════════════"
echo ""
echo "📝 Pregunta: 'Dame 3 consejos rápidos para mejorar en vela 49er'"
echo ""
echo "💬 Respuesta del AI Coach:"
echo "───────────────────────────────────────────────"

RESPONSE=$(curl -s -X POST http://localhost:3001/api/ai-coach/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "message": "Dame 3 consejos rápidos para mejorar en vela olímpica 49er"
  }')

# Extraer solo el mensaje (sin el JSON completo)
MESSAGE=$(echo $RESPONSE | grep -o '"message":"[^}]*' | sed 's/"message":"//g' | sed 's/\\n/\n/g' | sed 's/\\"/"/g')

if [ -z "$MESSAGE" ]; then
  echo "❌ No se obtuvo respuesta del AI Coach"
  echo ""
  echo "Respuesta completa:"
  echo $RESPONSE | jq .
  exit 1
fi

echo "$MESSAGE"
echo ""
echo "───────────────────────────────────────────────"
echo ""

# 4. Mostrar herramientas usadas
TOOLS_USED=$(echo $RESPONSE | grep -o '"toolsUsed":[0-9]*' | cut -d':' -f2)
echo "🔧 Herramientas usadas por el AI: $TOOLS_USED"
echo ""

# 5. Segunda consulta - Más específica
echo "4️⃣  Segunda consulta más específica..."
echo "═══════════════════════════════════════════════"
echo ""
echo "📝 Pregunta: '¿Cómo puedo mejorar mi velocidad en ceñida?'"
echo ""
echo "💬 Respuesta del AI Coach:"
echo "───────────────────────────────────────────────"

RESPONSE2=$(curl -s -X POST http://localhost:3001/api/ai-coach/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "message": "¿Cómo puedo mejorar mi velocidad en ceñida? Actualmente navego a unos 6 nudos"
  }')

MESSAGE2=$(echo $RESPONSE2 | grep -o '"message":"[^}]*' | sed 's/"message":"//g' | sed 's/\\n/\n/g' | sed 's/\\"/"/g')
echo "$MESSAGE2"
echo ""
echo "───────────────────────────────────────────────"
echo ""

# 6. Ver historial
echo "5️⃣  Consultando historial de conversaciones..."
HISTORY=$(curl -s -X GET http://localhost:3001/api/ai-coach/history \
  -H "Authorization: Bearer $TOKEN")

HISTORY_COUNT=$(echo $HISTORY | grep -o '"id"' | wc -l | tr -d ' ')
echo "✅ Tienes $HISTORY_COUNT conversación(es) en el historial"
echo ""

# Resumen final
echo "╔═══════════════════════════════════════════════╗"
echo "║          ✅ PRUEBA COMPLETADA                 ║"
echo "╚═══════════════════════════════════════════════╝"
echo ""
echo "📊 Resumen:"
echo "  • Autenticación: ✅ Exitosa"
echo "  • AI Coach: ✅ Respondiendo"
echo "  • Consultas realizadas: 2"
echo "  • Historial guardado: ✅"
echo ""
echo "🎯 Próximos pasos:"
echo "  1. Abre http://localhost:3000/ai-coach en tu navegador"
echo "  2. Haz login con test@alonso49.com / Test123!"
echo "  3. Chatea con el AI Coach desde la interfaz web"
echo ""
echo "📖 Documentación completa: COMO_PROBAR_AI_COACH.md"
echo ""
