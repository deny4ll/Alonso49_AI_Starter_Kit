# 🤖 Guía de Prueba - AI Coach con Contexto Rico

## 📋 Prerequisitos

Asegúrate de que los servicios estén corriendo:

```bash
docker-compose ps
# Todos deben estar UP: backend, frontend, postgres
```

## 🧪 Datos de Prueba

### Usuario de Prueba (Atleta)

- **Email:** `atleta@alonso49.com`
- **Password:** `atleta123`
- **Nombre:** Juan Pérez
- **Edad:** 26 años
- **Posición:** Crew (tripulante)
- **Nivel:** Advanced (Avanzado)

### Perfil Completo del Atleta

El atleta de prueba tiene un **perfil completo** con:

✅ **Información Personal**
- Fecha de nacimiento: 15 Mayo 1998
- Nacionalidad: España
- Número de vela: ESP 49
- Peso: 75 kg
- Altura: 180 cm

✅ **Estructura de Coaching**
- Coach asignado: María González
- Equipo: (Por asignar)

✅ **Plan de Entrenamiento**
- **Objetivo de Temporada:** Clasificar para Juegos Olímpicos París 2024 - Top 10 Mundial
- **Microciclo Actual:** Microciclo 3 - Preparación Pre-Competición (Semana 1/4)
- **Objetivos Semanales:**
  1. Mejorar velocidad en ceñida con viento 12-15 nudos
  2. Perfeccionar sincronización en viradas bajo presión
  3. Optimizar trimado de spinnaker en olas medianas
  4. Incrementar resistencia física en sesiones largas (>3h)
- **Objetivo de Hoy:** Trabajar timing en viradas - Reducir pérdida a <0.5 nudos

✅ **KPIs Actuales**
| Métrica | Actual | Target | Unidad |
|---------|--------|--------|--------|
| Velocidad Ceñida | 6.8 | 7.2 | knots |
| Eficiencia Viradas | 82% | 90% | % |
| Velocidad Popa | 11.5 | 12.0 | knots |
| Éxito Giros | 88% | 95% | % |
| Éxito Salidas | 65% | 80% | % |
| Posición Promedio | 8.3 | 5.0 | posición |

✅ **Última Sesión de Entrenamiento**
- **Título:** Sesión de Viradas - Viento Medio
- **Fecha:** 28 Julio 2024
- **Lugar:** Puerto de Valencia - Zona A
- **Condiciones:** Viento NE 13.5 nudos, Ola 0.8m
- **Duración:** 3h 15min
- **Distancia:** 18.5 nm
- **Velocidad Promedio:** 6.7 knots
- **Velocidad Máxima:** 14.2 knots
- **Viradas:** 40 (eficiencia 81.5%)
- **Giros:** 8
- **Puntuación:** 78.5/100

✅ **Último Feedback del Coach**
- Coach: María González
- Puntos Fuertes: Mejora del 8% en efficiency, buena lectura de viento
- Áreas de Mejora: Timing en viradas con ola, trimado post-virada tardío
- Ejercicio Asignado: "Viradas en Escalera" con olas simuladas

✅ **Videos Recientes**
- "Análisis de Viradas - Ángulo de Proa" (3min)
- "Sesión Completa - Vista Lateral" (60min)

✅ **Competición**
- **Próxima Regata:** Campeonato Europeo 49er - Hyères, Francia - 15-22 Agosto 2024

✅ **Configuración del Barco**
```
Configuración actual (viento medio 12-15 nudos):
- Rake de mástil: 25.8 pies
- Tensión de obenques: 480 lbs
- Tensión de estay: 520 lbs
- Traveller de mayor: 3 clicks a barlovento
- Cunningham: Medio
- Vang: Tenso en ceñida, suelto en popa
```

---

## 🚀 Cómo Probar el AI Coach

### 1. Iniciar Sesión

1. Abre http://localhost:3000
2. Haz login con:
   - Email: `atleta@alonso49.com`
   - Password: `atleta123`
3. Deberías ir al Dashboard automáticamente

### 2. Acceder al AI Coach

1. En el menú lateral, haz clic en **"AI Coach"**
2. Verás la interfaz de chat con el entrenador virtual

### 3. Preguntas de Ejemplo para Probar

El AI Coach tiene **acceso completo** al contexto del atleta. Prueba estas preguntas:

#### 📊 Sobre el Rendimiento Actual

```
¿Cómo estuvo mi última sesión de entrenamiento?
```

```
¿Estoy cumpliendo con mis objetivos semanales?
```

```
¿Qué tal van mis KPIs comparados con los targets?
```

#### 🎯 Sobre Objetivos y Planificación

```
¿En qué debería enfocarme hoy según mi plan de entrenamiento?
```

```
¿Cómo me preparo para el Campeonato Europeo en Hyères?
```

```
¿Qué ejercicios me recomiendas para mejorar mi eficiencia en viradas?
```

#### 🔧 Sobre Técnica

```
Mi coach mencionó que pierdo velocidad en viradas con ola. ¿Cómo lo mejoro?
```

```
¿Está bien configurado mi barco para viento de 12-15 nudos?
```

```
¿Qué debo mirar en el video de mi última sesión?
```

#### 📈 Análisis Avanzado

```
Compara mi rendimiento actual con mis objetivos de temporada
```

```
¿Qué métricas debo mejorar prioritariamente antes del Europeo?
```

```
Dame un plan de entrenamiento para la próxima semana
```

### 4. Comportamiento Esperado del AI Coach

El AI Coach debe:

✅ **NUNCA preguntar** por información ya disponible:
- ❌ "¿Cuál es tu objetivo de temporada?"
- ❌ "¿Qué condiciones tuviste en tu última sesión?"
- ❌ "¿Cuándo es tu próxima regata?"

✅ **USAR el contexto** en sus respuestas:
- ✅ "Vi que en tu última sesión del 28 de julio..."
- ✅ "Según tu objetivo de mejorar velocidad en ceñida a 7.2 nudos..."
- ✅ "Considerando que el Europeo es en 3 semanas..."

✅ **Seguir el formato estructurado**:
1. Assessment (evaluación)
2. Why (explicación técnica)
3. Recommendation (recomendación)
4. Training (ejercicios)
5. Lessons (lecciones)
6. Success Criteria (criterios de éxito)

✅ **Ser específico y técnico**:
- Usar datos reales (velocidades, eficiencias, fechas)
- Referenciar condiciones específicas
- Citar feedback del coach
- Relacionar con objetivos y KPIs

---

## 🔧 Configuración Avanzada

### Usar OpenAI Real (Opcional)

Por defecto, el AI Coach usa **respuestas mock** para desarrollo.

Para usar **OpenAI real**:

1. Obtén una API key de OpenAI: https://platform.openai.com/api-keys

2. Configura la variable de entorno en el backend:

```bash
# backend/.env
OPENAI_API_KEY=sk-your-actual-api-key-here
```

3. Reinicia el backend:

```bash
docker-compose restart backend
```

4. Ahora el AI Coach usará GPT-4 Turbo para respuestas reales

### Verificar el Contexto que Recibe el AI

Para ver exactamente qué contexto está recibiendo el AI Coach:

1. Abre las Developer Tools del navegador (F12)
2. Ve a la pestaña "Network"
3. Haz una pregunta al AI Coach
4. Busca la request a `/api/ai-coach/chat`
5. En "Payload" verás el mensaje que se envía
6. El backend construye el contexto completo del atleta automáticamente

---

## 📝 Notas Importantes

### Contexto Dinámico

El contexto del atleta se construye **dinámicamente** en cada conversación:
- Se consulta la base de datos en tiempo real
- Incluye última sesión, videos recientes, feedback
- Se actualiza automáticamente cuando hay nuevos datos

### Persistencia de Conversaciones

Las conversaciones se guardan en `audit_logs`:
- Cada interacción se registra
- Incluye mensaje del usuario + respuesta del AI
- Se puede consultar el historial (endpoint pendiente de implementar)

### Limitaciones Actuales

⚠️ El AI Coach **NO puede**:
- Ver videos realmente (solo analiza metadata y datos de sesión)
- Ejecutar cálculos complejos en tiempo real
- Acceder a GPS tracking detallado (solo analytics agregados)
- Modificar datos (solo consulta)

✅ El AI Coach **SÍ puede**:
- Analizar rendimiento basado en métricas
- Recomendar ejercicios y drills
- Crear planes de entrenamiento
- Interpretar feedback del coach
- Responder preguntas técnicas sobre vela

---

## 🎓 Metodología Sailvex

El AI Coach está programado para seguir la **Metodología Sailvex**:

1. **Planificación Objetiva** - Objetivos SMART y medibles
2. **Closed Loop Coaching** - Ciclo continuo de feedback
3. **Ejercicios Analíticos** - Cada drill tiene objetivo específico
4. **Feedback Continuo** - Retroalimentación inmediata
5. **Medición del Rendimiento** - Todo se mide y analiza

Todas las respuestas del AI Coach deben reforzar esta metodología.

---

## 🐛 Troubleshooting

### El AI Coach no responde

1. Verifica que el backend esté corriendo:
   ```bash
   docker-compose ps backend
   ```

2. Revisa los logs:
   ```bash
   docker-compose logs -f backend
   ```

3. Verifica que el usuario tenga perfil de atleta:
   ```bash
   cd backend
   npm run seed:athletes
   ```

### Respuestas genéricas / No usa contexto

- Si usas OpenAI mock: es normal, las respuestas son genéricas
- Si usas OpenAI real: verifica que el OPENAI_API_KEY esté configurado
- Revisa que el usuario tenga datos en su perfil

### Error en la conexión

- Verifica que frontend esté configurado con `NEXT_PUBLIC_API_URL=http://localhost:3001/api`
- Verifica que el puerto 3001 esté disponible
- Revisa CORS en el backend si usas otro dominio

---

## ✅ Checklist de Prueba

- [ ] Login como atleta funciona
- [ ] AI Coach page carga correctamente
- [ ] Puedo enviar un mensaje
- [ ] Recibo una respuesta del AI Coach
- [ ] La respuesta menciona datos específicos del atleta
- [ ] La respuesta sigue el formato estructurado
- [ ] El AI no pregunta por información ya disponible
- [ ] Puedo ver el historial de mensajes
- [ ] Los mensajes tienen timestamps
- [ ] Las "quick questions" funcionan

---

## 📚 Recursos Adicionales

- **API Docs:** http://localhost:3001/api/docs
- **Prisma Studio:** `npm run prisma:studio` (ver datos en DB)
- **Logs Backend:** `docker-compose logs -f backend`
- **Logs Frontend:** `docker-compose logs -f frontend`

---

**¡Disfruta probando el AI High Performance Coach!** 🚀⛵
