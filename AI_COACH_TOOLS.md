# 🛠️ AI Coach - Sistema de Herramientas

## Arquitectura

El AI Coach NO responde directamente a todas las preguntas. En su lugar, usa un **sistema de 20 herramientas (tools)** para acceder a datos reales de la base de datos y ejecutar acciones en la plataforma.

### Flujo de Trabajo

```
Usuario pregunta
    ↓
AI Coach analiza
    ↓
AI decide qué herramientas usar
    ↓
Herramientas ejecutan queries/acciones
    ↓
AI recibe resultados REALES
    ↓
AI formula respuesta basada en DATOS
    ↓
Usuario recibe respuesta fundamentada
```

---

## 📚 Herramientas Disponibles

### 🔍 SEARCH TOOLS (12 herramientas)

Buscan información real de la base de datos.

#### 1. `searchLessons()`
**Propósito:** Buscar lecciones en el catálogo de la Academia

**Parámetros:**
- `query` (requerido): Tema a buscar (ej: "tacking", "starts")
- `skillLevel` (opcional): Filtrar por nivel (beginner, intermediate, advanced, elite)
- `limit` (opcional): Máximo de resultados (default: 5)

**Retorna:**
- Lista de cursos con módulos
- Información de la academia
- Precios y descripción

**Ejemplo de uso por AI:**
```
Usuario: "¿Qué lecciones me recomiendas para mejorar mis viradas?"
AI: Voy a buscar lecciones sobre tacking...
→ searchLessons({ query: "tacking", skillLevel: "advanced" })
```

#### 2. `searchExercises()`
**Propósito:** Buscar ejercicios y drills de la metodología Alonso49

**Parámetros:**
- `query` (requerido): Tipo de ejercicio
- `focus` (opcional): Área de enfoque (boat_handling, speed, tactics, starts)
- `duration` (opcional): Duración (short, medium, long)

**Retorna:**
- Lista de ejercicios
- Objetivos específicos
- Criterios de éxito
- Métricas a medir

**Ejemplo de uso por AI:**
```
Usuario: "Dame ejercicios para mejorar velocidad en ceñida"
AI: → searchExercises({ query: "upwind speed", focus: "speed" })
```

#### 3. `searchVideos()`
**Propósito:** Buscar videos subidos por el atleta

**Parámetros:**
- `query` (requerido): Búsqueda en título/descripción
- `sessionId` (opcional): Filtrar por sesión específica
- `dateFrom` (opcional): Videos desde fecha (YYYY-MM-DD)
- `limit` (opcional): Máximo resultados (default: 5)

**Retorna:**
- Videos con metadata
- Información de sesión asociada
- URLs y duración

#### 4. `searchCoachNotes()`
**Propósito:** Buscar feedback escrito por coaches

**Parámetros:**
- `query` (opcional): Búsqueda en contenido
- `dateFrom` (opcional): Desde fecha
- `coachName` (opcional): Filtrar por coach específico

**Retorna:**
- Feedback de coaches
- Rating y fecha
- Sesión asociada

**Ejemplo de uso por AI:**
```
Usuario: "¿Qué dijo mi coach sobre mis últimas sesiones?"
AI: → searchCoachNotes({ dateFrom: "2024-07-01" })
```

#### 5. `searchBoatSetup()`
**Propósito:** Buscar configuraciones de barco por condiciones

**Parámetros:**
- `windSpeed` (opcional): Velocidad de viento en nudos
- `windCondition` (opcional): light, medium, heavy, storm
- `waveHeight` (opcional): Altura de ola en metros

**Retorna:**
- Configuración completa del barco
- Rake, tensiones, trimado
- Recomendaciones por condición

#### 6. `searchWeather()`
**Propósito:** Obtener pronóstico meteorológico

**Parámetros:**
- `location` (requerido): Ubicación
- `date` (opcional): Fecha del pronóstico

**Retorna:**
- Viento (velocidad, dirección, rachas)
- Temperatura, humedad, visibilidad
- Altura de ola
- Tendencias y recomendaciones

#### 7. `searchTrainingReports()`
**Propósito:** Buscar reportes de sesiones pasadas

**Parámetros:**
- `dateFrom` (opcional): Desde fecha
- `dateTo` (opcional): Hasta fecha
- `status` (opcional): DRAFT, SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED

**Retorna:**
- Lista de sesiones
- Condiciones de entrenamiento
- Analytics de cada sesión
- Cantidad de feedback

#### 8. `searchPerformanceReports()`
**Propósito:** Analizar métricas de rendimiento

**Parámetros:**
- `metric` (opcional): Métrica específica a analizar
- `dateFrom` (opcional): Desde fecha
- `dateTo` (opcional): Hasta fecha

**Retorna:**
- Estadísticas agregadas
- Promedios de métricas
- Tendencias y mejoras
- Comparación temporal

**Ejemplo de uso por AI:**
```
Usuario: "¿He mejorado mi eficiencia en viradas?"
AI: → searchPerformanceReports({ metric: "tacking efficiency", dateFrom: "2024-06-01" })
```

#### 9. `searchGPS()`
**Propósito:** Obtener datos de GPS tracking

**Parámetros:**
- `sessionId` (opcional): ID de sesión específica
- `maneuverType` (opcional): tack, gybe, mark_rounding, start

**Retorna:**
- Resumen de track GPS
- Puntos totales, duración
- Velocidades
- Maniobras registradas

#### 10. `searchVideoAnalysis()`
**Propósito:** Obtener análisis de video con AI/ML

**Parámetros:**
- `videoId` (requerido): ID del video
- `analysisType` (opcional): technique, boat_handling, crew_movement, speed_analysis

**Retorna:**
- Timestamps clave
- Fortalezas identificadas
- Debilidades encontradas
- Recomendaciones específicas

#### 11. `searchCompetitionHistory()`
**Propósito:** Buscar resultados de regatas

**Parámetros:**
- `eventName` (opcional): Nombre del evento
- `year` (opcional): Año
- `dateFrom` (opcional): Desde fecha

**Retorna:**
- Resultados de competiciones
- Posiciones y rankings
- Estadísticas por regata

#### 12. `searchKnowledgeBase()`
**Propósito:** Buscar en base de conocimiento con RAG (vector search)

**Parámetros:**
- `query` (requerido): Consulta en lenguaje natural
- `category` (opcional): methodology, technique, tactics, boat_setup, physical_prep, mental_prep
- `limit` (opcional): Máximo resultados (default: 3)

**Retorna:**
- Artículos relevantes
- Score de relevancia
- Contenido de metodología

**Ejemplo de uso por AI:**
```
Usuario: "¿Cuál es la mejor técnica para virar en olas?"
AI: → searchKnowledgeBase({ query: "tacking in waves technique", category: "technique" })
```

---

### 📝 GENERATE TOOLS (3 herramientas)

Generan documentos y planes estructurados.

#### 13. `generateTrainingPlan()`
**Propósito:** Crear plan de entrenamiento personalizado

**Parámetros:**
- `duration` (requerido): Duración en semanas (4, 8, 12)
- `focus` (opcional): Enfoque principal
- `targetEvent` (opcional): Competición objetivo

**Retorna:**
- Plan estructurado
- Microciclos
- Sesiones por semana
- Estructura semanal

#### 14. `generateBriefing()`
**Propósito:** Generar briefing pre-sesión o pre-regata

**Parámetros:**
- `sessionType` (requerido): training, race, practice_race
- `objectives` (opcional): Objetivos principales
- `conditions` (opcional): Condiciones esperadas

**Retorna:**
- Briefing completo
- Objetivos
- Safety briefing
- Puntos clave

#### 15. `generateDebriefing()`
**Propósito:** Generar debriefing post-sesión

**Parámetros:**
- `sessionId` (requerido): ID de la sesión
- `whatWorked` (opcional): Qué funcionó
- `whatDidntWork` (opcional): Qué no funcionó

**Retorna:**
- Debriefing estructurado
- Performance score
- Key learnings
- Action items

---

### ⚡ ACTION TOOLS (5 herramientas)

Ejecutan acciones en la plataforma.

#### 16. `createGoal()`
**Propósito:** Crear nuevo objetivo de entrenamiento

**Parámetros:**
- `title` (requerido): Título del objetivo
- `description` (requerido): Descripción detallada
- `targetDate` (opcional): Fecha objetivo
- `successCriteria` (opcional): Criterios medibles

**Retorna:**
- Objetivo creado
- Status activo
- Fecha de creación

**Ejemplo de uso por AI:**
```
Usuario: "Ayúdame a crear un objetivo para mejorar mis salidas"
AI: → createGoal({ 
  title: "Mejorar timing en salidas",
  description: "Reducir error de timing a <2 segundos",
  targetDate: "2024-08-15",
  successCriteria: "80% de salidas en top 3 de línea"
})
```

#### 17. `scheduleTraining()`
**Propósito:** Programar nueva sesión de entrenamiento

**Parámetros:**
- `title` (requerido): Título de la sesión
- `scheduledAt` (requerido): Fecha/hora (ISO 8601)
- `location` (opcional): Ubicación
- `objectives` (opcional): Objetivos de la sesión

**Retorna:**
- Sesión creada
- ID de sesión
- Status: SCHEDULED

#### 18. `comparePerformance()`
**Propósito:** Comparar métricas entre dos sesiones

**Parámetros:**
- `session1Id` (requerido): Primera sesión
- `session2Id` (requerido): Segunda sesión
- `metrics` (opcional): Métricas específicas a comparar

**Retorna:**
- Comparación detallada
- Datos de ambas sesiones
- Porcentaje de mejora
- Análisis de progreso

#### 19. `recommendBoatSetup()`
**Propósito:** Recomendar configuración de barco

**Parámetros:**
- `windSpeed` (requerido): Viento esperado
- `waveHeight` (opcional): Altura de ola
- `crewWeight` (opcional): Peso de tripulación

**Retorna:**
- Setup personalizado
- Todas las configuraciones
- Justificación técnica

#### 20. `recommendExercises()`
**Propósito:** Recomendar ejercicios personalizados

**Parámetros:**
- `weakness` (requerido): Debilidad a trabajar
- `availableTime` (opcional): Tiempo disponible
- `conditions` (opcional): Condiciones esperadas

**Retorna:**
- Ejercicios recomendados
- Priorización
- Plan de ejecución

---

## 🎯 Ejemplos de Uso Completo

### Ejemplo 1: Pregunta sobre Rendimiento

**Usuario:**
> "¿Cómo ha evolucionado mi velocidad en ceñida en el último mes?"

**AI Coach internamente:**
```javascript
1. searchPerformanceReports({
     metric: "upwind speed",
     dateFrom: "2024-06-29",
     dateTo: "2024-07-29"
   })
   
2. Recibe datos reales:
   - Junio: 6.5 knots promedio
   - Julio: 6.8 knots promedio
   - Mejora: +4.6%
   
3. Genera respuesta basada en DATOS REALES
```

**Respuesta al usuario:**
```
## Assessment

Tu velocidad en ceñida ha mejorado un 4.6% en el último mes, pasando de 
6.5 a 6.8 knots de promedio.

## Why

Este progreso es resultado de tu trabajo constante en los drills de 
velocidad. Las sesiones del 15 y 22 de julio muestran mejoras 
significativas en VMG.

## Recommendation

Estás a solo 0.4 knots de tu target (7.2 knots). Continúa con los 
ejercicios de ángulo óptimo.

## Training

[Ejercicios recomendados basados en searchExercises()]

## Success Criteria

Target final: 7.2 knots promedio en condiciones de 12-15 nudos.
```

---

### Ejemplo 2: Creación de Plan

**Usuario:**
> "Necesito un plan de 4 semanas para prepararme para el Europeo"

**AI Coach internamente:**
```javascript
1. searchPerformanceReports() // Ver estado actual
2. searchCoachNotes() // Ver feedback reciente
3. generateTrainingPlan({
     duration: 4,
     focus: "pre-competition preparation",
     targetEvent: "European Championship - Hyères"
   })
4. recommendExercises({ weakness: "tacking in waves" })
```

**Respuesta:**
- Plan completo de 4 semanas
- Ejercicios específicos
- Progresión gradual
- Taper pre-competición

---

### Ejemplo 3: Análisis de Video

**Usuario:**
> "Revisa mi video de ayer y dame feedback"

**AI Coach internamente:**
```javascript
1. searchVideos({ 
     dateFrom: "2024-07-28",
     limit: 1
   })
   
2. searchVideoAnalysis({
     videoId: "abc123",
     analysisType: "technique"
   })
   
3. searchCoachNotes({ 
     query: "video",
     dateFrom: "2024-07-28"
   })
```

**Respuesta:**
- Análisis del video con timestamps
- Comparación con feedback del coach
- Recomendaciones específicas
- Ejercicios para corregir issues

---

## 🔄 Flujo de Herramientas Múltiples

El AI Coach puede usar **múltiples herramientas** en una sola consulta:

**Usuario:**
> "Ayúdame a prepararme para mi sesión de mañana en Valencia"

**AI Coach ejecuta:**
1. `searchWeather({ location: "Valencia", date: "2024-07-30" })`
   → Viento 15 knots, ola 1.2m
   
2. `recommendBoatSetup({ windSpeed: 15, waveHeight: 1.2 })`
   → Setup para viento medio-fuerte
   
3. `searchExercises({ query: "waves", duration: "medium" })`
   → Drills específicos para olas
   
4. `generateBriefing({ sessionType: "training", conditions: "15kt, 1.2m waves" })`
   → Briefing completo

**Respuesta integrada:**
- Pronóstico detallado
- Setup de barco recomendado
- Plan de sesión
- Ejercicios apropiados
- Safety considerations

---

## 🚀 Ventajas del Sistema de Herramientas

### 1. **Datos Reales vs Alucinaciones**

❌ **Sin herramientas:**
```
AI: "Tu velocidad promedio es aproximadamente 6.5 knots"
     (Inventado / Alucinación)
```

✅ **Con herramientas:**
```
AI ejecuta: searchPerformanceReports()
AI: "Según tus últimas 10 sesiones, tu velocidad promedio es 6.78 knots"
     (Dato real de la base de datos)
```

### 2. **Acciones Ejecutables**

❌ **Sin herramientas:**
```
AI: "Deberías crear un objetivo para mejorar tus salidas"
     (Solo sugerencia)
```

✅ **Con herramientas:**
```
AI ejecuta: createGoal(...)
AI: "He creado el objetivo 'Mejorar timing en salidas' con fecha target 
     15 de agosto. Puedes verlo en tu panel de objetivos."
     (Acción ejecutada)
```

### 3. **Contexto Completo**

El AI puede combinar:
- Perfil del atleta (contexto inicial)
- Datos de sesiones (searchTrainingReports)
- Feedback de coaches (searchCoachNotes)
- Condiciones meteorológicas (searchWeather)
- Videos (searchVideos)
- Analytics (searchPerformanceReports)

Todo en una sola respuesta fundamentada.

---

## 📊 Monitoreo de Uso de Herramientas

Cada conversación registra:
- Qué herramientas se usaron
- Argumentos pasados
- Resultados obtenidos
- Tiempo de ejecución

Esto permite:
- Debugging
- Optimización
- Analytics de uso
- Mejora continua

---

## 🛠️ Implementación Técnica

### Archivo: `tool-definitions.ts`
Define las 20 herramientas en formato OpenAI Function Calling:
- Nombre
- Descripción
- Parámetros (tipo, required, descripción)

### Archivo: `tool-implementations.ts`
Implementa cada herramienta:
- Queries a Prisma
- Lógica de búsqueda
- Formateo de resultados
- Manejo de errores

### Archivo: `ai-coach.service.ts`
Loop de ejecución:
1. Envía mensaje + herramientas a OpenAI
2. OpenAI decide qué herramientas usar
3. Ejecuta herramientas
4. Envía resultados a OpenAI
5. OpenAI genera respuesta final
6. Retorna al usuario

---

## 🔒 Seguridad

- Todas las herramientas validan `userId`
- Solo acceden a datos del usuario autenticado
- No pueden modificar datos de otros usuarios
- Herramientas de acción requieren confirmación implícita

---

## 📈 Roadmap

### Futuras Herramientas

- `uploadVideo()` - Subir video desde chat
- `bookCoachSession()` - Agendar sesión con coach humano
- `joinTeam()` - Unirse a equipo
- `enrollCourse()` - Inscribirse en curso
- `exportReport()` - Exportar reporte PDF
- `shareSession()` - Compartir sesión con coach

### Mejoras Planeadas

- Cache de resultados de herramientas
- Paralelización de herramientas independientes
- Métricas de performance por herramienta
- Sugerencias proactivas de herramientas

---

**¡El AI Coach ahora trabaja con DATOS REALES, no inventa información!** 🎯
