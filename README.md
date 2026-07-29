# Alonso49 High Performance Platform

Plataforma de entrenamiento de alto rendimiento para vela olímpica clase 49er.

## Objetivo
Sistema completo de entrenamiento con análisis de video, seguimiento de rendimiento, coaching personalizado y gestión de equipos.

## Stack Tecnológico

### Backend
- **NestJS** - Framework backend con TypeScript
- **PostgreSQL + pgvector** - Base de datos con soporte para embeddings
- **Prisma** - ORM con migraciones y type safety
- **JWT** - Autenticación y autorización
- **OpenAPI/Swagger** - Documentación automática de API
- **WebSockets** - Comunicación en tiempo real

### Frontend
- **Next.js 14** - Framework React con App Router
- **TailwindCSS** - Estilos utility-first
- **shadcn/ui** - Componentes UI
- **TanStack Query** - Gestión de estado del servidor
- **Zustand** - Gestión de estado global
- **Axios** - Cliente HTTP

### Infraestructura
- **Docker Compose** - Desarrollo local
- **GitHub Actions** - CI/CD
- **Kubernetes** - Orquestación (producción)
- **Terraform** - Infrastructure as Code

## Características Principales

### Roles de Usuario
- **Atleta** - Subir videos, ver sesiones, recibir feedback
- **Coach** - Revisar sesiones, dar feedback, gestionar equipos
- **Academia** - Administrar equipos, crear cursos
- **Admin** - Gestión completa del sistema

### Funcionalidades
- ✅ Sistema de autenticación con JWT
- ✅ Gestión de usuarios con RBAC
- ✅ Subida y gestión de videos
- ✅ Creación y seguimiento de sesiones
- ✅ Gestión de equipos
- ✅ Sistema de cursos y monetización
- ✅ Análisis y métricas de rendimiento
- ✅ Feedback continuo (Closed Loop Coaching)
- ✅ **AI High Performance Coach** - Asistente inteligente con 20 herramientas
- ✅ Auditoría completa del sistema

## Instalación y Uso

### Requisitos Previos
- Node.js 20+
- Docker y Docker Compose
- npm o yarn

### 1. Configuración del Backend

```bash
cd backend
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate dev
```

### 2. Configuración del Frontend

```bash
cd frontend
cp .env.example .env
npm install
```

### 3. Ejecutar con Docker Compose

```bash
docker-compose up -d
```

La aplicación estará disponible en:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001/api
- API Docs: http://localhost:3001/api/docs

### 4. Desarrollo Local (sin Docker)

Terminal 1 - Backend:
```bash
cd backend
npm run start:dev
```

Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

Terminal 3 - Base de datos:
```bash
docker run -d \
  --name alonso49-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=alonso49 \
  -p 5432:5432 \
  pgvector/pgvector:pg16
```

## Estructura del Proyecto

```
alonso49/
├── backend/
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/         # Autenticación y autorización
│   │   │   ├── users/        # Gestión de usuarios
│   │   │   ├── videos/       # Gestión de videos
│   │   │   ├── sessions/     # Sesiones de entrenamiento
│   │   │   ├── teams/        # Gestión de equipos
│   │   │   ├── courses/      # Cursos y monetización
│   │   │   ├── analytics/    # Análisis y métricas
│   │   │   └── ai-coach/     # AI High Performance Coach (20 tools)
│   │   ├── prisma/           # Cliente Prisma
│   │   └── common/           # Guards, decorators, filters
│   └── prisma/
│       └── schema.prisma     # Esquema de base de datos
├── frontend/
│   └── src/
│       ├── app/              # App Router de Next.js
│       ├── components/       # Componentes reutilizables
│       ├── lib/              # Utilidades y API client
│       ├── hooks/            # Custom hooks
│       └── stores/           # Estado global (Zustand)
├── infrastructure/
│   ├── docker/               # Configuración Docker
│   ├── k8s/                  # Manifiestos Kubernetes
│   └── terraform/            # IaC
└── .github/
    └── workflows/            # CI/CD pipelines

```

## API Endpoints

### Autenticación
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/me` - Usuario actual

### Usuarios
- `GET /api/users` - Listar usuarios
- `GET /api/users/:id` - Obtener usuario

### Videos
- `POST /api/videos` - Subir video
- `GET /api/videos` - Listar videos
- `GET /api/videos/:id` - Obtener video
- `PATCH /api/videos/:id` - Actualizar video
- `DELETE /api/videos/:id` - Eliminar video

### Sesiones
- `POST /api/sessions` - Crear sesión
- `GET /api/sessions` - Listar sesiones
- `GET /api/sessions/:id` - Obtener sesión
- `PATCH /api/sessions/:id` - Actualizar sesión
- `DELETE /api/sessions/:id` - Eliminar sesión

### Equipos
- `POST /api/teams` - Crear equipo
- `GET /api/teams` - Listar equipos
- `GET /api/teams/:id` - Obtener equipo
- `POST /api/teams/:id/members` - Agregar miembro

### Cursos
- `POST /api/courses` - Crear curso
- `GET /api/courses` - Listar cursos
- `GET /api/courses/:id` - Obtener curso
- `POST /api/courses/:id/enroll` - Inscribirse

### Analytics
- `GET /api/analytics/sessions/:id` - Análisis de sesión
- `POST /api/analytics/sessions/:id` - Crear análisis
- `GET /api/analytics/users/me/stats` - Estadísticas del usuario

### AI Coach (20 herramientas integradas)
- `POST /api/ai-coach/chat` - Chat con el coach (usa herramientas automáticamente)
- `POST /api/ai-coach/analyze-video` - Análisis de video con IA
- `POST /api/ai-coach/analyze-session` - Análisis de sesión completa
- `POST /api/ai-coach/training-plan` - Generar plan de entrenamiento

**Herramientas disponibles internamente:**
- 12 Search tools (lessons, exercises, videos, notes, weather, GPS, etc.)
- 3 Generate tools (training plans, briefings, debriefings)
- 5 Action tools (create goals, schedule, compare performance, recommend)

Ver documentación completa en: [`AI_COACH_TOOLS.md`](./AI_COACH_TOOLS.md)

## Scripts Disponibles

### Backend
```bash
npm run start:dev      # Modo desarrollo
npm run build          # Compilar
npm run start:prod     # Modo producción
npm run test           # Tests
npm run lint           # Linter
npm run prisma:generate # Generar cliente Prisma
npm run prisma:migrate  # Ejecutar migraciones
npm run prisma:studio   # Interfaz gráfica de DB
```

### Frontend
```bash
npm run dev            # Modo desarrollo
npm run build          # Compilar
npm run start          # Modo producción
npm run lint           # Linter
```

## Seguridad

- ✅ Autenticación JWT
- ✅ RBAC (Role-Based Access Control)
- ✅ Rate limiting
- ✅ Audit logs
- ✅ Soft delete
- ✅ Validación de datos
- ✅ CORS configurado
- ✅ Variables de entorno para secretos

## Metodología Alonso49

La plataforma implementa la metodología de entrenamiento basada en:
- **Planificación objetiva** - Establecer metas claras y medibles
- **Closed Loop Coaching** - Feedback continuo entre atleta y coach
- **Ejercicios analíticos** - Análisis detallado de cada sesión
- **Feedback continuo** - Comunicación constante
- **Medición del rendimiento** - Métricas y KPIs en tiempo real

## 🤖 AI High Performance Coach

El AI Coach es un **asistente inteligente** que usa un sistema de **20 herramientas** para acceder a datos reales y ejecutar acciones en la plataforma.

### Arquitectura Tool-Based

A diferencia de chatbots tradicionales que pueden "alucinar" información, el AI Coach:

✅ **Usa herramientas reales** para buscar datos en la base de datos  
✅ **Nunca inventa información** - solo responde con datos verificados  
✅ **Ejecuta acciones** - puede crear objetivos, programar sesiones, comparar rendimiento  
✅ **Trazabilidad completa** - registra qué herramientas usó en cada respuesta  

### Categorías de Herramientas

**🔍 Search Tools (12)** - Buscan información real:
- `searchLessons()` - Lecciones de la Academia
- `searchExercises()` - Drills de entrenamiento
- `searchVideos()` - Videos subidos
- `searchCoachNotes()` - Feedback de coaches
- `searchPerformanceReports()` - Analytics y métricas
- `searchKnowledgeBase()` - Metodología Alonso49
- Y 6 más...

**📝 Generate Tools (3)** - Crean documentos:
- `generateTrainingPlan()` - Planes de entrenamiento personalizados
- `generateBriefing()` - Briefings pre-sesión
- `generateDebriefing()` - Debriefings post-sesión

**⚡ Action Tools (5)** - Ejecutan acciones:
- `createGoal()` - Crear objetivos
- `scheduleTraining()` - Programar sesiones
- `comparePerformance()` - Comparar sesiones
- `recommendBoatSetup()` - Recomendar configuración
- Y 1 más...

### Ejemplo de Uso

```
Usuario: "¿He mejorado mi eficiencia en viradas?"

AI Coach internamente:
  1. → searchPerformanceReports({ metric: "tacking efficiency" })
  2. ← Recibe: Julio 81.5% (vs Junio 73%)
  3. Genera respuesta con DATOS REALES

Respuesta: "Sí, has mejorado un 11.6% en el último mes, 
pasando de 73% a 81.5% de eficiencia. Estás a solo 8.5 puntos 
de tu objetivo de 90%..."
```

### Configuración

El AI Coach funciona en dos modos:

**1. Modo Mock (por defecto)** - Sin OpenAI API key
- Respuestas genéricas pero funcionales
- Herramientas funcionan normalmente
- Ideal para desarrollo y testing

**2. Modo OpenAI (recomendado)** - Con API key
- Respuestas inteligentes con GPT-4
- Uso completo de herramientas
- Coaching real y personalizado

```bash
# backend/.env
OPENAI_API_KEY=sk-your-api-key-here
```

Ver documentación completa: **[AI_COACH_TOOLS.md](./AI_COACH_TOOLS.md)**

## Documentación Adicional

### Guías Completas
- 📘 **[AGENTS.md](./AGENTS.md)** - Guía técnica para desarrollo
- 📗 **[FEATURES.md](./FEATURES.md)** - Funcionalidades detalladas
- 📕 **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - Solución de problemas
- 📙 **[QUICK_START.md](./QUICK_START.md)** - Inicio rápido

### Guías de AI Coach
- 🤖 **[AI_COACH_TOOLS.md](./AI_COACH_TOOLS.md)** - Sistema de herramientas del AI Coach (20 tools)
- 🧪 **[TEST_AI_COACH.md](./TEST_AI_COACH.md)** - Guía de pruebas del AI Coach
- 🔐 **[USUARIOS_PRUEBA.md](./USUARIOS_PRUEBA.md)** - Usuarios de prueba

### Guías de Implementación
- ✅ **[IMPLEMENTACION_COMPLETA.md](./IMPLEMENTACION_COMPLETA.md)** - Estado de implementación
- 🐛 **[FIX_LOGIN_LOOP.md](./FIX_LOGIN_LOOP.md)** - Solución del login loop
- 🔍 **[DIAGNOSTIC.md](./DIAGNOSTIC.md)** - Herramientas de diagnóstico

## Contribuir

1. Fork el proyecto
2. Crea una rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Todos los derechos reservados © 2024 Alonso49

## Contacto

Para más información o soporte, contacta al equipo de desarrollo.
