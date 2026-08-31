# 🤖 Guía Completa: Cómo Probar el AI Coach

## ✅ Estado Actual

El AI Coach está **funcionando correctamente**. Hay dos formas de probarlo:

1. **Desde el Frontend** (Interfaz web) - Más fácil y visual
2. **Desde la API** (Terminal/curl) - Para testing técnico

---

## 🌐 Método 1: Probar desde el Frontend (RECOMENDADO)

### Paso 1: Hacer Login

1. Abre tu navegador en: **http://localhost:3000/login**

2. Ingresa las credenciales:
   ```
   Email:    test@alonso49.com
   Password: Test123!
   ```

3. Haz clic en "Iniciar Sesión"

### Paso 2: Acceder al AI Coach

Después del login, deberías estar en el Dashboard. Busca el menú de navegación y haz clic en **"AI Coach"** o navega directamente a:

**http://localhost:3000/ai-coach**

### Paso 3: Conversar con el AI Coach

Una vez en la página del AI Coach, verás una interfaz de chat. Aquí hay **ejemplos de preguntas** que puedes hacer:

#### 📊 Preguntas sobre Rendimiento
```
¿Cómo ha sido mi progreso este mes?
¿En qué debo enfocarme para mejorar?
¿Cuáles son mis puntos débiles?
Muéstrame mis estadísticas de la última semana
```

#### 🎯 Planificación de Entrenamientos
```
Crea un plan de entrenamiento para esta semana
¿Qué ejercicios me recomiendas para mejorar velocidad?
Sugiéreme objetivos realistas para el próximo mes
Dame un plan de 4 semanas para prepararme para una regata
```

#### 🔍 Análisis Técnico
```
Revisa mi último entrenamiento
¿Qué puedo mejorar en mis maniobras?
Dame consejos para navegar con viento flojo
Analiza mi técnica de salida
```

#### 🌊 Estrategia y Táctica
```
Dame consejos para regatear con olas grandes
¿Cómo debo prepararme mentalmente para la competición?
Explícame cómo mejorar mi lectura del viento
¿Qué tácticas recomiendas para viento variable?
```

#### 📈 Comparación y Progreso
```
Compara mi sesión de hoy con la de la semana pasada
¿He mejorado en salidas desde el mes pasado?
Muéstrame mi evolución en velocidad
Compara mi rendimiento con mis objetivos
```

---

## 💻 Método 2: Probar desde la API (Terminal)

Si prefieres probar directamente desde la terminal, aquí están los comandos:

### Paso 1: Obtener Token de Autenticación

```bash
cd /Users/chris/Documents/Projects/chrisAI/Sailvex_AI_Starter_Kit

# Guardar el token en una variable
TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@alonso49.com","password":"Test123!"}' | \
  grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

echo "Token obtenido: $TOKEN"
```

### Paso 2: Hacer una Consulta al AI Coach

```bash
# Consulta básica
curl -X POST http://localhost:3001/api/ai-coach/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "message": "¿Puedes ayudarme a mejorar mi técnica de ceñida?"
  }'
```

### Ejemplos de Consultas por API

#### Ejemplo 1: Crear Plan de Entrenamiento
```bash
curl -X POST http://localhost:3001/api/ai-coach/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "message": "Crea un plan de entrenamiento para esta semana enfocado en velocidad"
  }'
```

#### Ejemplo 2: Análisis de Rendimiento
```bash
curl -X POST http://localhost:3001/api/ai-coach/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "message": "¿Cómo ha sido mi progreso en el último mes?"
  }'
```

#### Ejemplo 3: Consejos Técnicos
```bash
curl -X POST http://localhost:3001/api/ai-coach/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "message": "Dame consejos para mejorar mis salidas en condiciones de viento moderado"
  }'
```

---

## 🛠️ Endpoints Adicionales del AI Coach

El AI Coach tiene varios endpoints especializados:

### 1. Analizar un Video Específico

```bash
curl -X POST http://localhost:3001/api/ai-coach/analyze-video \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "videoId": "ID_DEL_VIDEO",
    "specificQuestion": "¿Qué puedo mejorar en mi técnica de timón?"
  }'
```

### 2. Analizar una Sesión Específica

```bash
curl -X POST http://localhost:3001/api/ai-coach/analyze-session \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "sessionId": "ID_DE_LA_SESION"
  }'
```

### 3. Obtener Plan de Entrenamiento

```bash
curl -X POST http://localhost:3001/api/ai-coach/training-plan \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "goals": "Mejorar velocidad en ceñida y perfeccionar salidas"
  }'
```

### 4. Ver Historial de Conversaciones

```bash
curl -X GET http://localhost:3001/api/ai-coach/history \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🎯 Las 20 Herramientas del AI Coach

El AI Coach puede usar 20 herramientas diferentes automáticamente:

### Herramientas de Consulta (8)
1. **get_athlete_context** - Obtiene tu perfil completo
2. **get_recent_sessions** - Ve tus últimas sesiones
3. **get_session_details** - Analiza una sesión específica
4. **get_athlete_videos** - Accede a tus videos
5. **search_videos** - Busca videos por contenido
6. **get_athlete_performance** - Obtiene tus métricas
7. **get_team_context** - Información de tu equipo
8. **get_training_plan** - Tu plan actual

### Herramientas de Acción (8)
9. **create_session_plan** - Crea planes de sesión
10. **add_session_feedback** - Agrega feedback
11. **suggest_exercises** - Sugiere ejercicios
12. **analyze_technique** - Analiza técnica
13. **create_training_program** - Programa completo
14. **set_performance_goals** - Define objetivos
15. **recommend_videos** - Recomienda videos
16. **generate_report** - Genera reportes

### Herramientas Especializadas (4)
17. **analyze_weather_impact** - Análisis meteorológico
18. **compare_sessions** - Compara entrenamientos
19. **predict_performance** - Predice rendimiento
20. **mental_coaching** - Coaching mental

**El AI Coach decide automáticamente qué herramientas usar según tu pregunta.**

---

## 📝 Ejemplos de Conversaciones Completas

### Ejemplo 1: Atleta Pidiendo Análisis

```
TÚ: "Hola, ¿puedes analizar mi progreso de este mes?"

AI COACH: 
"Basándome en tus sesiones de julio, veo que:

✅ Puntos Positivos:
- Has completado 18 de 20 sesiones programadas (90%)
- Tu velocidad promedio en ceñida mejoró 8%
- Consistencia en entrenamientos: excelente

⚠️ Áreas de Mejora:
- Maniobras bajo presión: 3 errores en regatas
- Salidas: timing puede mejorar 15%

📊 Métricas Clave:
- Velocidad: 6.2 → 6.7 nudos (+8%)
- Tiempo de entrenamiento: 42 horas
- Videos analizados: 15

🎯 Recomendación:
Para agosto, enfócate en:
1. Simulacros de salida (3x semana)
2. Maniobras bajo presión (2x semana)
3. Mantener volumen de entrenamiento

¿Quieres que te cree un plan específico?"
```

### Ejemplo 2: Pidiendo Plan de Entrenamiento

```
TÚ: "Sí, créame un plan para esta semana"

AI COACH:
"Perfecto. Plan de entrenamiento semana del 4-10 Agosto:

📅 LUNES (2 horas)
- Calentamiento: 15 min
- Ejercicio: Simulacros de salida x 10
- Objetivo: Timing perfecto -5s
- Condiciones ideales: 10-15 nudos

📅 MIÉRCOLES (2.5 horas)
- Calentamiento: 15 min
- Ejercicio: Ceñida con cambios frecuentes
- Enfoque: Velocidad en transiciones
- Grabar para análisis

📅 VIERNES (2 horas)
- Técnica de maniobras bajo presión
- Simulación de regata
- Objetivo: 0 errores en maniobras

📅 SÁBADO (3 horas)
- Regata completa simulada
- Aplicar todo lo trabajado
- Video completo para análisis

📅 DOMINGO
- Descanso activo
- Análisis de videos de la semana

Total: 9.5 horas
Objetivos: Mejorar salidas y maniobras

¿Quieres ajustes en algún día?"
```

---

## 🔧 Solución de Problemas

### Problema: "Demo response" en la respuesta

**Causa:** La API key de OpenAI no está configurada o es inválida.

**Solución:**
```bash
# Editar el archivo .env del backend
cd /Users/chris/Documents/Projects/chrisAI/Sailvex_AI_Starter_Kit/backend
nano .env

# Agregar tu clave real de OpenAI:
OPENAI_API_KEY=sk-tu-clave-real-aqui

# Reiniciar el backend
cd ..
docker-compose restart backend
```

### Problema: Error 401 Unauthorized

**Causa:** Token de autenticación expirado o inválido.

**Solución:**
```bash
# Obtener un nuevo token
TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@alonso49.com","password":"Test123!"}' | \
  grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
```

### Problema: No hay datos de sesiones/videos

**Causa:** El usuario recién creado no tiene datos de entrenamiento.

**Solución:** Crea sesiones y sube videos primero, o el AI Coach te dirá que no hay datos suficientes (comportamiento esperado).

---

## 📊 Verificar el Estado del AI Coach

### Check completo:

```bash
# 1. Verificar que el backend esté corriendo
docker-compose ps backend

# 2. Verificar la configuración de OpenAI
cd backend && grep OPENAI_API_KEY .env

# 3. Probar el endpoint
TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@alonso49.com","password":"Test123!"}' | \
  grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

curl -X POST http://localhost:3001/api/ai-coach/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"message":"Hola"}' | jq .

# 4. Ver logs del backend
docker-compose logs backend | grep -i "ai-coach\|openai"
```

---

## 🎓 Mejores Prácticas

### Para Obtener Mejores Respuestas:

1. **Sé específico:** En lugar de "ayúdame", di "ayúdame a mejorar velocidad en ceñida"
2. **Proporciona contexto:** "En mi última sesión con viento de 15 nudos..."
3. **Haz preguntas medibles:** "¿Cómo mejorar mi tiempo de maniobra de 8s a 6s?"
4. **Usa datos:** El AI Coach es mejor cuando tienes sesiones y videos registrados

### Preguntas que Funcionan Bien:
✅ "Analiza mi sesión del 2 de agosto"
✅ "Crea un plan para mejorar salidas en 4 semanas"
✅ "Compara mi velocidad de julio vs junio"
✅ "¿Qué ejercicios hacer con viento flojo?"

### Preguntas Muy Generales:
⚠️ "Ayúdame" (demasiado vago)
⚠️ "¿Cómo mejorar?" (no específico)
⚠️ "Cuéntame sobre vela" (no personalizado)

---

## 📈 Siguiente Nivel

### Para aprovechar al máximo el AI Coach:

1. **Registra sesiones regularmente** - Más datos = mejor coaching
2. **Sube videos** - El AI puede analizar técnica visual
3. **Establece objetivos** - El AI te ayudará a alcanzarlos
4. **Usa feedback del coach humano** - El AI lo considera en sus recomendaciones

---

## 🚀 Script de Prueba Rápida

Copia y pega este script completo para hacer una prueba rápida:

```bash
#!/bin/bash

cd /Users/chris/Documents/Projects/chrisAI/Sailvex_AI_Starter_Kit

echo "🤖 Prueba Rápida del AI Coach"
echo "=============================="
echo ""

# 1. Login
echo "1️⃣ Obteniendo token de autenticación..."
TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@alonso49.com","password":"Test123!"}' | \
  grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Error: No se pudo obtener el token"
  exit 1
fi

echo "✅ Token obtenido"
echo ""

# 2. Consulta simple
echo "2️⃣ Haciendo consulta al AI Coach..."
echo ""

RESPONSE=$(curl -s -X POST http://localhost:3001/api/ai-coach/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "message": "Dame 3 consejos rápidos para mejorar en vela olímpica 49er"
  }')

echo "$RESPONSE" | jq -r '.message'
echo ""
echo "=============================="
echo "✅ Prueba completada"
```

Guarda este script como `test-ai-coach.sh` y ejecútalo:

```bash
chmod +x test-ai-coach.sh
./test-ai-coach.sh
```

---

## 📞 Ayuda Adicional

Si tienes problemas:

1. **Revisa los logs:** `docker-compose logs -f backend`
2. **Verifica el estado:** `docker-compose ps`
3. **Lee la documentación:** `docs/SAILVEX_GUIA_CLIENTE.pdf`

---

**¡El AI Coach está listo para ayudarte! 🚀⛵**

*Última actualización: 3 Agosto 2026*
