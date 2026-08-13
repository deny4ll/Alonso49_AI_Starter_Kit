---
title: "Alonso49 Platform - Documentación Técnica Completa"
subtitle: "Plataforma de Entrenamiento de Alto Rendimiento para Vela Olímpica"
author: "Christian Alonso"
date: "1 Agosto 2026"
version: "1.0.0"
---

\pagebreak

# Tabla de Contenidos

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Módulos del Backend](#módulos-del-backend)
4. [Perfiles de Usuario](#perfiles-de-usuario)
5. [Funcionalidades Principales](#funcionalidades-principales)
6. [AI High Performance Coach](#ai-high-performance-coach)
7. [Base de Datos](#base-de-datos)
8. [API REST](#api-rest)
9. [Frontend - Interfaz de Usuario](#frontend-interfaz-de-usuario)
10. [Guía de Uso](#guía-de-uso)
11. [Seguridad](#seguridad)
12. [Infraestructura](#infraestructura)
13. [Mantenimiento y Monitoreo](#mantenimiento-y-monitoreo)

\pagebreak

# 1. Resumen Ejecutivo

## 1.1 Descripción del Proyecto

**Alonso49** es una plataforma integral de entrenamiento de alto rendimiento diseñada específicamente para la clase olímpica de vela 49er. La plataforma implementa la **Metodología Alonso49** de coaching basado en datos y ciclos cerrados de mejora continua.

### Objetivos Principales

- ✅ Digitalizar y centralizar el proceso de entrenamiento
- ✅ Proporcionar análisis objetivo del rendimiento
- ✅ Facilitar comunicación continua entre atletas y coaches
- ✅ Implementar coaching inteligente con Inteligencia Artificial
- ✅ Gestionar equipos y academias de forma eficiente

### Tecnologías Utilizadas

| Componente | Tecnología | Versión |
|------------|------------|---------|
| **Backend** | NestJS | 10.3.0 |
| **Frontend** | Next.js | 14.x |
| **Base de Datos** | PostgreSQL + pgvector | 16 |
| **AI** | OpenAI GPT-4 Turbo | Latest |
| **ORM** | Prisma | 5.8.0 |
| **Autenticación** | JWT | - |
| **Contenedores** | Docker Compose | - |

### Características Clave

1. **Sistema de Roles Avanzado** (RBAC)
   - Atletas, Coaches, Academias, Administradores

2. **AI High Performance Coach**
   - 20 herramientas de consulta y acción
   - Integración con OpenAI GPT-4 Turbo
   - Coaching basado en datos reales

3. **Gestión Completa de Sesiones**
   - Planificación, ejecución, análisis
   - Analytics automáticos
   - Feedback en tiempo real

4. **Video Management**
   - Subida y almacenamiento de videos
   - Análisis técnico asistido por IA
   - Timestamps y anotaciones

5. **Closed Loop Coaching**
   - Planificar → Ejecutar → Analizar → Retroalimentar → Ajustar

\pagebreak

# 2. Arquitectura del Sistema

## 2.1 Diagrama de Arquitectura General

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js 14)                    │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Landing  │  │  Login   │  │Dashboard │  │ AI Coach │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Videos  │  │ Sessions │  │  Teams   │  │ Courses  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└────────────────────┬─────────────────────────────────────────┘
                     │ HTTP/REST
                     │
┌────────────────────▼─────────────────────────────────────────┐
│                   BACKEND (NestJS)                           │
│                                                              │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌─────────┐  │
│  │  Auth  │ │ Users  │ │ Videos │ │Sessions│ │  Teams  │  │
│  └────────┘ └────────┘ └────────┘ └────────┘ └─────────┘  │
│                                                              │
│  ┌────────┐ ┌────────┐ ┌────────────────────────────────┐  │
│  │Courses │ │Analytics│ │    AI Coach (20 tools)        │  │
│  └────────┘ └────────┘ └────────────────────────────────┘  │
└────────────────────┬─────────────────────────────────────────┘
                     │
        ┌────────────┴──────────────┐
        │                           │
        ▼                           ▼
┌───────────────┐          ┌─────────────────┐
│  PostgreSQL   │          │  OpenAI API     │
│  + pgvector   │          │  GPT-4 Turbo    │
│               │          │                 │
│  - Users      │          │  Function       │
│  - Sessions   │          │  Calling        │
│  - Analytics  │          └─────────────────┘
│  - Videos     │
│  - Feedback   │
└───────────────┘
```

## 2.2 Flujo de Datos

### Autenticación
```
1. Usuario → Frontend (email/password)
2. Frontend → Backend /api/auth/login
3. Backend → Valida credenciales → Genera JWT
4. JWT → Frontend → Almacena en localStorage
5. Todas las requests subsecuentes incluyen JWT en headers
```

### Sesión de Entrenamiento
```
1. Atleta crea sesión → POST /api/sessions
2. Sube video → POST /api/videos
3. Sistema genera analytics → POST /api/analytics/sessions/:id
4. Coach revisa → GET /api/sessions/:id
5. Coach da feedback → POST /api/feedback (vía sessions)
6. AI Coach analiza → POST /api/ai-coach/analyze-session
```

### AI Coach Interaction
```
1. Usuario pregunta → POST /api/ai-coach/chat
2. Backend construye contexto (perfil + sesiones + feedback)
3. OpenAI analiza + decide tools a usar
4. Backend ejecuta tools (queries a DB)
5. Resultados → OpenAI
6. OpenAI genera respuesta fundamentada
7. Respuesta → Usuario
```

\pagebreak

# 3. Módulos del Backend

## 3.1 Auth Module

### Responsabilidades
- Registro de usuarios
- Login y logout
- Generación y validación de JWT tokens
- Guards de autenticación
- Decoradores de roles

### Endpoints

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| POST | `/api/auth/register` | Registrar nuevo usuario | No |
| POST | `/api/auth/login` | Iniciar sesión | No |
| GET | `/api/auth/me` | Obtener usuario actual | Sí |

### DTOs

**RegisterDto**
```typescript
{
  email: string;          // Email único
  password: string;       // Mínimo 8 caracteres
  firstName: string;      // Nombre
  lastName: string;       // Apellido
  role: UserRole;         // ATHLETE | COACH | ACADEMY | ADMIN
}
```

**LoginDto**
```typescript
{
  email: string;
  password: string;
}
```

**Response**
```typescript
{
  access_token: string;   // JWT token
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
  }
}
```

## 3.2 Users Module

### Responsabilidades
- Gestión de perfiles de usuario
- CRUD de usuarios
- Perfiles específicos por rol (Atleta, Coach, Academia)
- Actualización de información

### Endpoints

| Método | Ruta | Descripción | Roles |
|--------|------|-------------|-------|
| GET | `/api/users` | Listar usuarios | ADMIN |
| GET | `/api/users/:id` | Obtener usuario | Todos |
| PATCH | `/api/users/:id` | Actualizar usuario | Owner, ADMIN |
| DELETE | `/api/users/:id` | Eliminar usuario | ADMIN |

### Modelos de Perfil

**AthleteProfile**
```typescript
{
  birthDate: Date;
  nationality: string;
  position: string;          // Helm, Crew
  experienceLevel: string;   // Beginner, Intermediate, Advanced, Elite
  weight: number;
  height: number;
  sailNumber: string;
  assignedCoach: string;
  seasonGoal: string;
  currentMicrocycle: string;
  weeklyObjectives: string;
  todayObjective: string;
  kpis: Json;                // KPIs actuales vs targets
  nextEvent: string;
  boatSetup: string;
  teamId: string;
}
```

**CoachProfile**
```typescript
{
  certification: string;
  yearsExperience: number;
  specialties: string[];
}
```

**AcademyProfile**
```typescript
{
  name: string;
  country: string;
  website: string;
}
```

## 3.3 Videos Module

### Responsabilidades
- Subida de videos de entrenamiento
- Almacenamiento de metadata
- Asociación con sesiones
- Búsqueda y filtrado
- Soft delete

### Endpoints

| Método | Ruta | Descripción | Roles |
|--------|------|-------------|-------|
| POST | `/api/videos` | Subir video | ATHLETE, COACH |
| GET | `/api/videos` | Listar videos | Todos |
| GET | `/api/videos/:id` | Obtener video | Todos |
| PATCH | `/api/videos/:id` | Actualizar metadata | Owner |
| DELETE | `/api/videos/:id` | Eliminar video | Owner, ADMIN |

### Modelo Video

```typescript
{
  id: string;
  title: string;
  description: string;
  url: string;              // URL del video almacenado
  thumbnailUrl: string;
  duration: number;         // En segundos
  size: number;             // En bytes
  format: string;           // mp4, mov, etc.
  status: VideoStatus;      // UPLOADING, PROCESSING, READY, FAILED
  uploadedById: string;
  sessionId: string;
  metadata: Json;           // Metadata adicional
  embedding: vector;        // pgvector para búsqueda semántica
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}
```

## 3.4 Sessions Module

### Responsabilidades
- Creación y gestión de sesiones de entrenamiento
- Planificación de entrenamientos
- Estados de sesión (DRAFT, SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED)
- Asociación con videos y feedback
- Condiciones meteorológicas

### Endpoints

| Método | Ruta | Descripción | Roles |
|--------|------|-------------|-------|
| POST | `/api/sessions` | Crear sesión | ATHLETE, COACH |
| GET | `/api/sessions` | Listar sesiones | Todos |
| GET | `/api/sessions/:id` | Obtener sesión | Todos |
| PATCH | `/api/sessions/:id` | Actualizar sesión | Owner, COACH |
| DELETE | `/api/sessions/:id` | Eliminar sesión | Owner, ADMIN |

### Modelo Session

```typescript
{
  id: string;
  title: string;
  description: string;
  status: SessionStatus;    // DRAFT, SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED
  scheduledAt: Date;
  startedAt: Date;
  completedAt: Date;
  location: string;
  weatherConditions: Json;
  windSpeed: number;        // En nudos
  windDirection: string;    // N, NE, E, SE, S, SW, W, NW
  waveHeight: number;       // En metros
  createdById: string;
  teamId: string;
  coachId: string;
  videos: Video[];
  feedback: Feedback[];
  analytics: SessionAnalytics;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}
```

## 3.5 Teams Module

### Responsabilidades
- Gestión de equipos de entrenamiento
- Asignación de atletas a equipos
- Asignación de coaches
- Membresías de equipo

### Endpoints

| Método | Ruta | Descripción | Roles |
|--------|------|-------------|-------|
| POST | `/api/teams` | Crear equipo | COACH, ACADEMY |
| GET | `/api/teams` | Listar equipos | Todos |
| GET | `/api/teams/:id` | Obtener equipo | Todos |
| PATCH | `/api/teams/:id` | Actualizar equipo | COACH, ACADEMY |
| POST | `/api/teams/:id/members` | Agregar miembro | COACH, ACADEMY |

### Modelo Team

```typescript
{
  id: string;
  name: string;
  description: string;
  coachId: string;
  coach: CoachProfile;
  academyId: string;
  academy: AcademyProfile;
  isActive: boolean;
  members: TeamMember[];
  athletes: AthleteProfile[];
  sessions: Session[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}
```

## 3.6 Courses Module

### Responsabilidades
- Gestión de cursos de la Academia
- Módulos de aprendizaje
- Inscripciones
- Seguimiento de progreso
- Monetización

### Endpoints

| Método | Ruta | Descripción | Roles |
|--------|------|-------------|-------|
| POST | `/api/courses` | Crear curso | ACADEMY |
| GET | `/api/courses` | Listar cursos | Todos |
| GET | `/api/courses/:id` | Obtener curso | Todos |
| POST | `/api/courses/:id/enroll` | Inscribirse | ATHLETE |

### Modelo Course

```typescript
{
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  isPublished: boolean;
  academyId: string;
  academy: AcademyProfile;
  modules: CourseModule[];
  enrollments: CourseEnrollment[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}
```

## 3.7 Analytics Module

### Responsabilidades
- Generación de métricas de rendimiento
- Análisis de sesiones
- Cálculo de KPIs
- Estadísticas de progreso
- Reportes

### Endpoints

| Método | Ruta | Descripción | Roles |
|--------|------|-------------|-------|
| GET | `/api/analytics/sessions/:id` | Analytics de sesión | Todos |
| POST | `/api/analytics/sessions/:id` | Crear analytics | COACH, SYSTEM |
| GET | `/api/analytics/users/me/stats` | Estadísticas del usuario | Owner |

### Modelo SessionAnalytics

```typescript
{
  id: string;
  sessionId: string;
  session: Session;
  totalDistance: number;      // Millas náuticas
  averageSpeed: number;       // Nudos
  maxSpeed: number;           // Nudos
  tackingEfficiency: number;  // Porcentaje
  gybeCount: number;
  tackCount: number;
  performanceScore: number;   // 0-100
  insights: Json;             // { strengths, weaknesses, recommendations }
  createdAt: Date;
  updatedAt: Date;
}
```

### KPIs Calculados

1. **Performance Score** (0-100)
   - Basado en velocidad promedio, eficiencia, consistencia

2. **Tacking Efficiency** (%)
   - Pérdida de velocidad en viradas vs benchmark

3. **Speed Metrics**
   - Velocidad promedio por punto de navegación
   - VMG (Velocity Made Good)

4. **Maneuver Analysis**
   - Cantidad y calidad de viradas/giros
   - Timing de maniobras

## 3.8 AI Coach Module

### Responsabilidades
- Coaching inteligente basado en GPT-4 Turbo
- 20 herramientas de consulta y acción
- Análisis de rendimiento
- Recomendaciones personalizadas
- Generación de planes de entrenamiento

### Endpoints

| Método | Ruta | Descripción | Roles |
|--------|------|-------------|-------|
| POST | `/api/ai-coach/chat` | Chat con el coach | Todos |
| POST | `/api/ai-coach/analyze-video` | Analizar video | Todos |
| POST | `/api/ai-coach/analyze-session` | Analizar sesión | Todos |
| POST | `/api/ai-coach/training-plan` | Generar plan | Todos |
| GET | `/api/ai-coach/history` | Historial conversaciones | Owner |

### Herramientas Disponibles (20)

**Search Tools (12)**
1. `searchLessons()` - Buscar lecciones en Academy
2. `searchExercises()` - Buscar drills de metodología
3. `searchVideos()` - Buscar videos del atleta
4. `searchCoachNotes()` - Buscar feedback de coaches
5. `searchBoatSetup()` - Configuraciones de barco
6. `searchWeather()` - Pronósticos meteorológicos
7. `searchTrainingReports()` - Reportes de sesiones
8. `searchPerformanceReports()` - Analytics y métricas
9. `searchGPS()` - Datos GPS tracking
10. `searchVideoAnalysis()` - Análisis ML de videos
11. `searchCompetitionHistory()` - Resultados de regatas
12. `searchKnowledgeBase()` - RAG vector search

**Generate Tools (3)**
13. `generateTrainingPlan()` - Planes personalizados
14. `generateBriefing()` - Briefings pre-sesión
15. `generateDebriefing()` - Debriefings post-sesión

**Action Tools (5)**
16. `createGoal()` - Crear objetivos
17. `scheduleTraining()` - Programar sesiones
18. `comparePerformance()` - Comparar 2 sesiones
19. `recommendBoatSetup()` - Recomendar configuración
20. `recommendExercises()` - Recomendar drills

### Arquitectura AI Coach

```
Usuario → Frontend → Backend AI Coach Service
                           ↓
                    Construir Contexto
                    (perfil + sesiones + feedback + KPIs)
                           ↓
                    OpenAI GPT-4 Turbo
                    + 20 tools disponibles
                           ↓
                    AI decide tools a usar
                           ↓
                    Backend ejecuta tools
                    (queries a PostgreSQL)
                           ↓
                    Resultados REALES → OpenAI
                           ↓
                    Respuesta fundamentada
                           ↓
                    Usuario
```

\pagebreak

# 4. Perfiles de Usuario

## 4.1 ATHLETE (Atleta)

### Descripción
Deportistas que utilizan la plataforma para registrar entrenamientos, recibir feedback y mejorar su rendimiento.

### Capacidades

**Videos**
- ✅ Subir videos de entrenamiento
- ✅ Ver sus propios videos
- ✅ Asociar videos a sesiones
- ❌ Ver videos de otros atletas (privacidad)

**Sesiones**
- ✅ Crear sesiones de entrenamiento
- ✅ Ver sus propias sesiones
- ✅ Registrar condiciones meteorológicas
- ✅ Ver analytics de sus sesiones
- ❌ Modificar sesiones pasadas completadas

**Teams**
- ✅ Ver equipos a los que pertenece
- ✅ Ver compañeros de equipo
- ❌ Crear equipos
- ❌ Gestionar membresías

**Courses**
- ✅ Ver catálogo de cursos
- ✅ Inscribirse en cursos
- ✅ Acceder a contenido de cursos inscritos
- ✅ Seguir progreso de aprendizaje

**AI Coach**
- ✅ Hacer preguntas al coach
- ✅ Recibir análisis de rendimiento
- ✅ Solicitar recomendaciones
- ✅ Generar planes de entrenamiento

**Analytics**
- ✅ Ver sus propias estadísticas
- ✅ Seguir progreso vs objetivos
- ✅ Ver tendencias de mejora
- ❌ Ver estadísticas de otros atletas

### Flujo Típico

```
1. Login → Dashboard
2. Crear Nueva Sesión
3. Registrar condiciones (viento, olas, etc.)
4. Realizar entrenamiento
5. Subir videos de la sesión
6. Revisar analytics generados automáticamente
7. Recibir feedback del coach
8. Consultar AI Coach para recomendaciones
9. Ajustar objetivos y planificación
```

## 4.2 COACH (Entrenador)

### Descripción
Entrenadores que supervisan el progreso de atletas, dan feedback y gestionan equipos.

### Capacidades

**Videos**
- ✅ Ver videos de sus atletas
- ✅ Analizar videos con herramientas
- ✅ Dejar comentarios en videos
- ✅ Marcar timestamps importantes

**Sesiones**
- ✅ Crear sesiones para atletas/equipos
- ✅ Revisar sesiones de sus atletas
- ✅ Crear analytics de sesiones
- ✅ Dar feedback detallado
- ✅ Asignar ejercicios

**Teams**
- ✅ Crear y gestionar equipos
- ✅ Agregar/remover atletas
- ✅ Planificar sesiones de equipo
- ✅ Ver estadísticas de equipo

**Feedback**
- ✅ Crear feedback para sesiones
- ✅ Rating de rendimiento (1-5)
- ✅ Recomendaciones específicas
- ✅ Seguimiento de mejoras

**AI Coach**
- ✅ Usar como herramienta de análisis
- ✅ Generar reportes
- ✅ Comparar atletas
- ✅ Planificar entrenamientos

**Analytics**
- ✅ Ver estadísticas de todos sus atletas
- ✅ Comparar rendimientos
- ✅ Generar reportes de progreso
- ✅ Identificar áreas de mejora

### Flujo Típico

```
1. Login → Dashboard de Coach
2. Revisar sesiones recientes de atletas
3. Ver videos subidos
4. Analizar con AI Coach
5. Crear feedback detallado
6. Asignar ejercicios específicos
7. Planificar próximas sesiones
8. Seguir progreso vs objetivos del equipo
```

## 4.3 ACADEMY (Academia)

### Descripción
Instituciones educativas que gestionan múltiples equipos, coaches y ofrecen cursos.

### Capacidades

**Teams**
- ✅ Crear múltiples equipos
- ✅ Asignar coaches a equipos
- ✅ Ver todos los equipos de la academia
- ✅ Gestionar membresías

**Courses**
- ✅ Crear cursos
- ✅ Crear módulos de aprendizaje
- ✅ Publicar/despublicar cursos
- ✅ Configurar precios
- ✅ Ver inscripciones
- ✅ Seguir progreso de estudiantes

**Users**
- ✅ Ver atletas y coaches de la academia
- ✅ Invitar nuevos usuarios
- ✅ Gestionar permisos

**Analytics**
- ✅ Estadísticas globales de la academia
- ✅ Rendimiento por equipo
- ✅ Métricas de cursos
- ✅ Reportes de ingresos

### Monetización

- Cursos de pago
- Suscripciones premium
- Coaching personalizado
- Análisis avanzados

### Flujo Típico

```
1. Login → Dashboard de Academia
2. Ver resumen de todos los equipos
3. Revisar métricas globales
4. Crear nuevo curso
5. Publicar módulos de aprendizaje
6. Gestionar inscripciones
7. Asignar coaches a equipos
8. Generar reportes de rendimiento
```

## 4.4 ADMIN (Administrador)

### Descripción
Administradores del sistema con acceso completo a todas las funcionalidades.

### Capacidades

**Users**
- ✅ CRUD completo de usuarios
- ✅ Cambiar roles
- ✅ Activar/desactivar cuentas
- ✅ Ver audit logs

**System**
- ✅ Acceso a todas las sesiones
- ✅ Gestión de contenido
- ✅ Moderación
- ✅ Configuración del sistema

**Analytics**
- ✅ Métricas globales de la plataforma
- ✅ Uso por módulo
- ✅ Reportes de actividad

**Audit**
- ✅ Ver todos los audit logs
- ✅ Seguimiento de acciones
- ✅ Detección de anomalías

\pagebreak

# 5. Funcionalidades Principales

## 5.1 Sistema de Autenticación

### Características
- JWT-based authentication
- Tokens con expiración de 7 días
- Refresh tokens
- Logout con invalidación de token
- Password hashing con bcrypt

### Seguridad
- Rate limiting en endpoints de auth
- Validación de emails
- Contraseñas mínimo 8 caracteres
- Prevención de fuerza bruta

## 5.2 Gestión de Videos

### Upload Flow

```
1. Usuario selecciona video → Frontend
2. Video se sube a almacenamiento (Cloudflare R2)
3. Metadata se guarda en DB
4. Status: UPLOADING → PROCESSING
5. Extracción de thumbnail
6. Generación de embedding (pgvector)
7. Status: READY
8. Usuario notificado
```

### Características
- Formatos soportados: MP4, MOV, AVI
- Tamaño máximo: 500MB
- Streaming adaptativo
- Thumbnails automáticos
- Búsqueda semántica con pgvector

## 5.3 Analytics Automáticos

### Cálculo de Métricas

**Performance Score** (0-100)
```javascript
performanceScore = (
  speedScore * 0.4 +        // 40% peso
  efficiencyScore * 0.3 +   // 30% peso
  consistencyScore * 0.2 +  // 20% peso
  maneuverScore * 0.1       // 10% peso
)
```

**Tacking Efficiency** (%)
```javascript
tackingEfficiency = (
  (1 - averageSpeedLoss / preVelSpeed) * 100
)
```

**Tendencias**
- Mejora vs sesión anterior
- Mejora vs promedio último mes
- Progreso vs objetivos

## 5.4 Closed Loop Coaching

### Ciclo Completo

```
PLANIFICAR
├─ Definir objetivos
├─ Crear plan de sesión
├─ Asignar ejercicios
└─ Configurar KPIs
    ↓
EJECUTAR
├─ Realizar entrenamiento
├─ Grabar video
├─ Registrar datos
└─ Subir a plataforma
    ↓
ANALIZAR
├─ Revisar video
├─ Calcular analytics
├─ Comparar vs benchmark
└─ Identificar mejoras
    ↓
RETROALIMENTAR
├─ Coach da feedback
├─ AI Coach analiza
├─ Discutir resultados
└─ Definir action items
    ↓
AJUSTAR
├─ Modificar objetivos
├─ Actualizar plan
└─ Repetir ciclo
```

## 5.5 AI Coach - Ejemplos de Uso

### Caso 1: Análisis de Rendimiento

**Usuario pregunta:**
> "¿Cómo ha sido mi rendimiento en viradas en el último mes?"

**AI Coach ejecuta:**
1. `searchPerformanceReports({ metric: "tacking efficiency", dateFrom: "2024-07-01" })`
2. `searchCoachNotes({ query: "viradas" })`

**Respuesta:**
```
## Assessment

Tu eficiencia en viradas ha mejorado 11.6% en el último mes, 
pasando de 73% a 81.5%.

## Why

Este progreso es resultado de tu trabajo constante en los 
drills de velocidad. Tus sesiones del 15 y 22 de julio 
muestran mejoras significativas en timing.

## Recommendation

Estás a solo 8.5 puntos de tu objetivo (90%). Según tu coach 
María, necesitas trabajar el timing en rachas.

## Training

Te recomiendo el drill "Viradas en Escalera":
- 20 viradas en 10 minutos
- Focus en timing y sincronización
- Objetivo: <0.8 nudos de pérdida

## Success Criteria

- Eficiencia viradas: >85% (actualmente 81.5%)
- Consistencia: <5% varianza
```

### Caso 2: Planificación de Entrenamiento

**Usuario pregunta:**
> "Necesito un plan de 4 semanas para el Europeo"

**AI Coach ejecuta:**
1. `searchPerformanceReports()` - Estado actual
2. `searchCoachNotes()` - Feedback reciente
3. `generateTrainingPlan({ duration: 4, targetEvent: "Europeo Hyères" })`

**Respuesta:**
```
# Plan de 4 Semanas - Campeonato Europeo

## Microciclo 1 (Semana 1): Técnica Fundamental
- Lunes: Viradas en condiciones variables
- Miércoles: Velocidad en ceñida
- Viernes: Mark roundings
- Sábado: Race simulation

## Microciclo 2 (Semana 2): Intensidad
- ... [plan detallado]

## Microciclo 3 (Semana 3): Pre-competición
- ... [plan detallado]

## Microciclo 4 (Semana 4): Taper
- ... [plan detallado]

## KPIs a alcanzar
- Tacking efficiency: >88%
- Start line success: >80%
- Average position: Top 5
```

\pagebreak

# 6. Base de Datos

## 6.1 Esquema General

### Tablas Principales (15)

1. **users** - Usuarios del sistema
2. **athlete_profiles** - Perfiles de atletas
3. **coach_profiles** - Perfiles de coaches
4. **academy_profiles** - Perfiles de academias
5. **teams** - Equipos
6. **team_members** - Membresías de equipos
7. **sessions** - Sesiones de entrenamiento
8. **videos** - Videos subidos
9. **feedback** - Feedback de coaches
10. **session_analytics** - Analytics de sesiones
11. **courses** - Cursos de la academia
12. **course_modules** - Módulos de cursos
13. **course_enrollments** - Inscripciones
14. **audit_logs** - Logs de auditoría
15. **knowledge_base** (futuro) - Base de conocimiento

## 6.2 Relaciones Clave

```
User (1) ──────── (0..1) AthleteProfile
User (1) ──────── (0..1) CoachProfile
User (1) ──────── (0..1) AcademyProfile

User (1) ──────── (N) Session
User (1) ──────── (N) Video
User (1) ──────── (N) Feedback

Session (1) ──── (N) Video
Session (1) ──── (N) Feedback
Session (1) ──── (0..1) SessionAnalytics

Team (1) ──────── (N) TeamMember
Team (1) ──────── (N) Session
Team (1) ──────── (N) AthleteProfile

Course (1) ────── (N) CourseModule
Course (1) ────── (N) CourseEnrollment
```

## 6.3 Características Especiales

### Soft Delete
Todas las tablas principales tienen `deletedAt`:
- Permite recuperación de datos
- Auditoría completa
- No se pierden relaciones

### Audit Logs
Todas las acciones críticas se registran:
```typescript
{
  userId: string;
  action: string;         // CREATE_SESSION, UPDATE_PROFILE, etc.
  entity: string;         // session, video, feedback
  entityId: string;
  changes: Json;          // Qué cambió
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
}
```

### pgvector Integration
Búsqueda semántica en:
- Videos (embeddings de contenido)
- Knowledge base (RAG)
- Sesiones (búsqueda por descripción)

### Índices Optimizados
```sql
-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Sessions
CREATE INDEX idx_sessions_created_by ON sessions(created_by_id);
CREATE INDEX idx_sessions_status ON sessions(status);
CREATE INDEX idx_sessions_scheduled_at ON sessions(scheduled_at);

-- Videos
CREATE INDEX idx_videos_session_id ON videos(session_id);
CREATE INDEX idx_videos_uploaded_by ON videos(uploaded_by_id);

-- Feedback
CREATE INDEX idx_feedback_session_id ON feedback(session_id);
CREATE INDEX idx_feedback_coach_id ON feedback(coach_id);
```

\pagebreak

# 7. API REST

## 7.1 Estructura General

### Base URL
```
http://localhost:3001/api
```

### Headers Requeridos
```
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>
```

### Respuestas Estándar

**Success (200/201)**
```json
{
  "statusCode": 200,
  "data": { ... },
  "message": "Success"
}
```

**Error (4xx/5xx)**
```json
{
  "statusCode": 400,
  "message": "Error description",
  "error": "Bad Request"
}
```

## 7.2 Endpoints por Módulo

### Auth

```http
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

### Users

```http
GET    /api/users
GET    /api/users/:id
PATCH  /api/users/:id
DELETE /api/users/:id
```

### Videos

```http
POST   /api/videos
GET    /api/videos?sessionId=&limit=
GET    /api/videos/:id
PATCH  /api/videos/:id
DELETE /api/videos/:id
```

### Sessions

```http
POST   /api/sessions
GET    /api/sessions?status=&teamId=
GET    /api/sessions/:id
PATCH  /api/sessions/:id
DELETE /api/sessions/:id
```

### Teams

```http
POST   /api/teams
GET    /api/teams
GET    /api/teams/:id
PATCH  /api/teams/:id
POST   /api/teams/:id/members
```

### Courses

```http
POST   /api/courses
GET    /api/courses?published=true
GET    /api/courses/:id
POST   /api/courses/:id/enroll
```

### Analytics

```http
GET    /api/analytics/sessions/:id
POST   /api/analytics/sessions/:id
GET    /api/analytics/users/me/stats
```

### AI Coach

```http
POST   /api/ai-coach/chat
POST   /api/ai-coach/analyze-video
POST   /api/ai-coach/analyze-session
POST   /api/ai-coach/training-plan
GET    /api/ai-coach/history
```

## 7.3 Ejemplos de Requests

### Crear Sesión

```http
POST /api/auth/login
Content-Type: application/json

{
  "title": "Sesión de Viradas - Viento Medio",
  "description": "Trabajo en eficiencia de viradas",
  "status": "SCHEDULED",
  "scheduledAt": "2024-08-05T09:00:00Z",
  "location": "Puerto de Valencia",
  "windSpeed": 12,
  "windDirection": "NE",
  "waveHeight": 0.5
}
```

### Subir Video

```http
POST /api/videos
Content-Type: application/json
Authorization: Bearer <token>

{
  "title": "Viradas - Vista de Proa",
  "description": "Análisis técnico de viradas",
  "url": "https://storage.cloudflare.com/...",
  "sessionId": "uuid-sesion",
  "duration": 180,
  "format": "mp4"
}
```

### Chat con AI Coach

```http
POST /api/ai-coach/chat
Content-Type: application/json
Authorization: Bearer <token>

{
  "message": "¿Cómo puedo mejorar mi eficiencia en viradas?"
}
```

\pagebreak

# 8. Frontend - Interfaz de Usuario

## 8.1 Tecnologías

- **Framework:** Next.js 14 (App Router)
- **UI Components:** shadcn/ui
- **Styling:** TailwindCSS
- **State Management:** Zustand
- **Server State:** TanStack Query
- **HTTP Client:** Axios
- **Forms:** React Hook Form + Zod

## 8.2 Páginas Principales

### 1. Landing Page (`/`)
**Descripción:** Página de inicio pública

**Contenido:**
- Hero section con CTA
- Características principales
- Testimonios
- Precios
- Footer con links

**Screenshot:** ![Landing Page](screenshots/01-landing-page.png)

---

### 2. Login (`/login`)
**Descripción:** Página de autenticación

**Campos:**
- Email
- Password
- "Recordarme" checkbox
- Link a registro

**Validaciones:**
- Email válido
- Password mínimo 8 caracteres

**Screenshot:** ![Login](screenshots/02-login.png)

---

### 3. Register (`/register`)
**Descripción:** Registro de nuevos usuarios

**Campos:**
- Nombre
- Apellido
- Email
- Password
- Confirmar Password
- Rol (dropdown)

**Screenshot:** ![Register](screenshots/03-register.png)

---

### 4. Dashboard (`/dashboard`)
**Descripción:** Panel principal del usuario

**Secciones:**
- Resumen de actividad reciente
- KPIs principales
- Próximas sesiones
- Notificaciones
- Quick actions

**Layout:**
- Sidebar con navegación
- Header con perfil y logout
- Main content area

**Screenshot:** ![Dashboard](screenshots/04-dashboard.png)

---

### 5. Videos (`/videos`)
**Descripción:** Galería de videos

**Características:**
- Grid de videos con thumbnails
- Filtros: por sesión, fecha, estado
- Search bar
- Botón "Upload Video"
- Vista detalle de video

**Screenshot:** ![Videos](screenshots/05-videos.png)

---

### 6. Sessions (`/sessions`)
**Descripción:** Listado de sesiones

**Tabla con columnas:**
- Título
- Fecha
- Ubicación
- Condiciones (viento/olas)
- Estado
- Performance Score
- Acciones

**Filtros:**
- Por estado
- Por fecha
- Por equipo

**Screenshot:** ![Sessions](screenshots/06-sessions.png)

---

### 7. Session Detail (`/sessions/:id`)
**Descripción:** Detalle de una sesión

**Tabs:**
1. **Overview**
   - Información general
   - Condiciones meteorológicas
   - Duración

2. **Videos**
   - Videos asociados
   - Player integrado

3. **Analytics**
   - Métricas de rendimiento
   - Gráficos de velocidad
   - Comparación vs benchmark

4. **Feedback**
   - Comentarios del coach
   - Rating
   - Recomendaciones

**Screenshot:** ![Session Detail](screenshots/07-session-detail.png)

---

### 8. Teams (`/teams`)
**Descripción:** Gestión de equipos

**Vista Coach/Academy:**
- Lista de equipos
- Crear nuevo equipo
- Agregar miembros

**Vista Atleta:**
- Equipos a los que pertenece
- Compañeros de equipo
- Sesiones de equipo

**Screenshot:** ![Teams](screenshots/08-teams.png)

---

### 9. Courses (`/courses`)
**Descripción:** Catálogo de cursos

**Características:**
- Grid de cursos
- Filtros por categoría, precio
- Preview de contenido
- Botón de inscripción
- Progreso (si inscrito)

**Screenshot:** ![Courses](screenshots/09-courses.png)

---

### 10. AI Coach (`/ai-coach`)
**Descripción:** Interface de chat con AI Coach

**Layout:**
- Chat messages area
- Input box
- Quick questions (sugerencias)
- Tools used indicator
- Message history

**Características:**
- Real-time messaging
- Markdown formatting
- Code blocks support
- Loading states
- Error handling

**Screenshot:** ![AI Coach](screenshots/10-ai-coach.png)

---

### 11. Analytics (`/analytics`)
**Descripción:** Dashboard de analytics

**Secciones:**
- Performance trends (gráfico de línea)
- KPIs dashboard
- Comparación temporal
- Heatmaps de mejora
- Export reports

**Screenshot:** ![Analytics](screenshots/11-analytics.png)

---

## 8.3 Componentes Reutilizables

### Navigation
- **Sidebar** - Menú principal
- **Header** - Top bar con perfil
- **Breadcrumbs** - Navegación contextual

### Data Display
- **DataTable** - Tablas con sort/filter
- **StatCard** - Tarjetas de estadísticas
- **Chart** - Gráficos (Chart.js)

### Forms
- **Input** - Campo de texto
- **Select** - Dropdown
- **DatePicker** - Selector de fecha
- **FileUpload** - Subida de archivos

### Feedback
- **Toast** - Notificaciones
- **Modal** - Diálogos
- **Alert** - Alertas
- **Loading** - Spinners

\pagebreak

# 9. Guía de Uso

## 9.1 Para Atletas

### Primer Uso

1. **Registro**
   - Ir a `/register`
   - Completar formulario
   - Seleccionar rol "ATHLETE"
   - Confirmar email

2. **Completar Perfil**
   - Edad, nacionalidad, posición
   - Peso, altura
   - Número de vela
   - Objetivos de temporada

3. **Primera Sesión**
   - Dashboard → "Nueva Sesión"
   - Título: "Primera sesión de entrenamiento"
   - Programar fecha
   - Registrar condiciones
   - Guardar

### Flujo de Entrenamiento

1. **Antes del entrenamiento**
   - Crear sesión en la plataforma
   - Revisar objetivos del día
   - Consultar weather forecast
   - Revisar plan del coach

2. **Durante el entrenamiento**
   - Grabar videos (cámara waterproof)
   - Seguir ejercicios planificados
   - Registrar observaciones mentales

3. **Después del entrenamiento**
   - Subir videos a la plataforma
   - Asociar videos a la sesión
   - Esperar analytics automáticos
   - Revisar métricas

4. **Revisión con Coach**
   - Recibir feedback
   - Discutir resultados
   - Consultar AI Coach
   - Ajustar plan

## 9.2 Para Coaches

### Setup Inicial

1. **Crear Equipo**
   - Teams → "Nuevo Equipo"
   - Nombre: "Equipo Nacional Junior"
   - Descripción
   - Guardar

2. **Agregar Atletas**
   - Team Detail → "Agregar Miembro"
   - Buscar por email
   - Asignar rol: "member"
   - Confirmar

3. **Planificar Sesiones**
   - Sessions → "Nueva Sesión"
   - Asignar a equipo
   - Definir objetivos
   - Programar fecha

### Flujo de Coaching

1. **Planificación Semanal**
   - Revisar progreso de atletas
   - Definir objetivos semanales
   - Crear sesiones
   - Asignar ejercicios

2. **Revisión de Sesiones**
   - Ver sesiones completadas
   - Revisar videos
   - Analizar con AI Coach
   - Identificar mejoras

3. **Dar Feedback**
   - Session Detail → Tab "Feedback"
   - Escribir observaciones
   - Rating (1-5)
   - Recomendar ejercicios
   - Guardar

4. **Seguimiento**
   - Analytics dashboard
   - Comparar atletas
   - Identificar tendencias
   - Ajustar planificación

## 9.3 Para Academias

### Configuración

1. **Crear Academia**
   - Completar perfil
   - Nombre, país, website
   - Logo
   - Descripción

2. **Crear Cursos**
   - Courses → "Nuevo Curso"
   - Título y descripción
   - Precio (si aplica)
   - Crear módulos

3. **Gestionar Equipos**
   - Crear múltiples equipos
   - Asignar coaches
   - Monitorear actividad

### Monetización

1. **Cursos de Pago**
   - Configurar precio
   - Payment gateway
   - Publicar curso

2. **Suscripciones**
   - Planes mensuales/anuales
   - Features premium
   - Facturación automática

\pagebreak

# 10. Seguridad

## 10.1 Autenticación

### JWT Tokens
- Algorithm: HS256
- Expiration: 7 días
- Secret: Variable de entorno
- Refresh tokens disponibles

### Password Security
- Hashing: bcrypt (10 rounds)
- Mínimo 8 caracteres
- No passwords comunes
- No se almacenan en logs

## 10.2 Autorización

### Role-Based Access Control (RBAC)

```typescript
@Roles(UserRole.COACH, UserRole.ADMIN)
@UseGuards(JwtAuthGuard, RolesGuard)
async updateSession(@Param('id') id: string) {
  // Solo coaches y admins
}
```

### Resource Ownership

```typescript
// Verificar que el usuario es dueño del recurso
if (session.createdById !== user.id && user.role !== 'ADMIN') {
  throw new ForbiddenException();
}
```

## 10.3 Validación de Datos

### DTOs con Class Validator

```typescript
export class CreateSessionDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(SessionStatus)
  status: SessionStatus;

  @IsDate()
  @Type(() => Date)
  scheduledAt: Date;
}
```

## 10.4 Rate Limiting

```typescript
// 10 requests por minuto en endpoints de auth
@Throttle(10, 60)
@Post('login')
async login() { ... }
```

## 10.5 SQL Injection Prevention

- ✅ Prisma ORM con prepared statements
- ✅ Validación de inputs
- ✅ Type safety con TypeScript

## 10.6 XSS Prevention

- ✅ Content Security Policy headers
- ✅ Sanitización de inputs
- ✅ HTML encoding en frontend

## 10.7 CORS Configuration

```typescript
app.enableCors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
});
```

## 10.8 Audit Logging

Todas las acciones críticas se registran:

```typescript
await this.auditLog.create({
  userId: user.id,
  action: 'DELETE_VIDEO',
  entity: 'video',
  entityId: video.id,
  ipAddress: req.ip,
  userAgent: req.headers['user-agent'],
});
```

\pagebreak

# 11. Infraestructura

## 11.1 Docker Compose

### Servicios

```yaml
services:
  postgres:
    image: pgvector/pgvector:pg16
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: alonso49
    healthcheck:
      test: ["CMD-SHELL", "pg_isready"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build: ./backend
    ports:
      - "3001:3001"
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/alonso49
      JWT_SECRET: ${JWT_SECRET}
      OPENAI_API_KEY: ${OPENAI_API_KEY}

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:3001/api
```

## 11.2 Variables de Entorno

### Backend (.env)
```bash
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/alonso49
JWT_SECRET=<strong-secret-key>
JWT_EXPIRATION=7d
PORT=3001
NODE_ENV=production

# OpenAI
OPENAI_API_KEY=sk-...

# Cloudflare R2
CLOUDFLARE_ACCOUNT_ID=...
CLOUDFLARE_API_TOKEN=...
```

### Frontend (.env)
```bash
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## 11.3 Despliegue

### Comandos

```bash
# Desarrollo
docker-compose up -d

# Producción
docker-compose -f docker-compose.prod.yml up -d

# Rebuild
docker-compose up -d --build

# Logs
docker-compose logs -f backend

# Stop
docker-compose down
```

### Health Checks

```bash
# Backend health
curl http://localhost:3001/api/health

# Database health
docker-compose exec postgres pg_isready
```

## 11.4 Backup y Restauración

### Backup de Base de Datos

```bash
# Backup
docker-compose exec postgres pg_dump -U postgres alonso49 > backup.sql

# Restore
docker-compose exec -T postgres psql -U postgres alonso49 < backup.sql
```

### Backup de Videos

```bash
# Sincronizar con bucket
rclone sync ./storage cloudflare:alonso49-videos
```

\pagebreak

# 12. Mantenimiento y Monitoreo

## 12.1 Métricas Clave

### Performance
- Response time promedio: <200ms
- Uptime: >99.9%
- Error rate: <1%

### Base de Datos
- Query time promedio: <50ms
- Conexiones activas: <100
- Tamaño DB: monitoreado

### AI Coach
- OpenAI calls/día: monitoreado
- Costo promedio/conversación: ~$0.05
- Tools execution time: <2s

## 12.2 Logs

### Estructura de Logs

```json
{
  "timestamp": "2024-08-01T12:00:00Z",
  "level": "info",
  "context": "SessionsController",
  "message": "Session created",
  "userId": "uuid",
  "sessionId": "uuid"
}
```

### Niveles de Log
- **ERROR** - Errores que requieren atención
- **WARN** - Advertencias
- **INFO** - Información general
- **DEBUG** - Debugging (solo desarrollo)

## 12.3 Alertas

### Configurar Alertas

1. **Alta tasa de errores**
   - Threshold: >5% error rate
   - Action: Notificar equipo técnico

2. **Base de datos lenta**
   - Threshold: >500ms query time
   - Action: Revisar queries

3. **Costos OpenAI**
   - Threshold: >$100/día
   - Action: Revisar uso

## 12.4 Mantenimiento Regular

### Diario
- Revisar logs de errores
- Monitorear métricas de performance
- Backup automático de DB

### Semanal
- Revisar analytics de uso
- Optimizar queries lentas
- Actualizar dependencias menores

### Mensual
- Backup completo del sistema
- Revisar costos de infraestructura
- Actualizar dependencias mayores
- Security audit

\pagebreak

# 13. Anexos

## 13.1 Glosario

**49er** - Clase olímpica de vela de alto rendimiento

**VMG** - Velocity Made Good - Velocidad efectiva hacia el objetivo

**Ceñida** - Navegación contra el viento (upwind)

**Popa** - Navegación con el viento (downwind)

**Virada** - Tack - Cambio de dirección por proa

**Giro** - Gybe - Cambio de dirección por popa

**KPI** - Key Performance Indicator - Indicador clave de rendimiento

**Microciclo** - Período de entrenamiento de 1-4 semanas

**RAG** - Retrieval Augmented Generation - IA con búsqueda de documentos

**pgvector** - Extensión de PostgreSQL para vectores de embeddings

## 13.2 Contacto y Soporte

**Email:** soporte@alonso49.com  
**Website:** https://alonso49.com  
**Documentación:** https://docs.alonso49.com  

## 13.3 Changelog

### Versión 1.0.0 (Agosto 2026)
- ✅ Implementación completa de 8 módulos backend
- ✅ Frontend con 10 páginas operativas
- ✅ AI Coach con 20 herramientas
- ✅ Integración OpenAI GPT-4 Turbo
- ✅ Sistema completo de analytics
- ✅ Closed loop coaching funcional

### Próximas Features (Roadmap)

**v1.1.0 - Septiembre 2026**
- Video upload directo (no solo URLs)
- WebSocket para notificaciones real-time
- Export de reportes PDF
- Mobile app (React Native)

**v1.2.0 - Octubre 2026**
- RAG implementation con knowledge base
- GPS tracking integration
- Wearables integration (Garmin, Apple Watch)
- Predicción de rendimiento con ML

**v2.0.0 - Q4 2026**
- Multi-idioma (English, Spanish, French)
- Kubernetes deployment
- Advanced analytics con ML
- Marketplace de coaches/academias

\pagebreak

---

**Fin del Documento**

*Documentación generada el 1 de Agosto de 2026*  
*Versión 1.0.0*  
*Alonso49 Platform - High Performance Sailing Training*

---
