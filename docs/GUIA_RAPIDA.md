# ALONSO49 - Guía Rápida de Referencia

## 🎯 Acceso Rápido a Funcionalidades

### Como ATLETA 🏃‍♂️

#### Acciones Principales
```
1. Subir Video de Entrenamiento
   Dashboard → Videos → "Subir Video" → Seleccionar archivo → Agregar descripción

2. Crear Nueva Sesión
   Dashboard → Sesiones → "Nueva Sesión" → Completar formulario
   - Tipo de sesión (Entrenamiento, Competición, Recovery)
   - Objetivos
   - Fecha y duración

3. Consultar AI Coach
   Dashboard → AI Coach → Escribir pregunta
   Ejemplos:
   - "¿Cómo puedo mejorar mi técnica de maniobra?"
   - "Analiza mi última sesión"
   - "Sugiere ejercicios para mejorar velocidad"

4. Ver Mi Progreso
   Dashboard → Analytics → Ver gráficas y métricas
   - Rendimiento histórico
   - Comparación con objetivos
   - Áreas de mejora
```

---

### Como COACH 👨‍🏫

#### Acciones Principales
```
1. Revisar Sesiones de Atletas
   Dashboard → Mis Atletas → Seleccionar atleta → Ver sesiones

2. Dar Feedback
   Sesión específica → Tab "Feedback" → Escribir comentarios
   - Técnica
   - Táctica
   - Mental
   - Físico

3. Gestionar Equipo
   Dashboard → Equipos → "Crear Equipo"
   - Agregar atletas
   - Asignar roles
   - Configurar objetivos

4. Ver Analytics del Equipo
   Dashboard → Analytics → Vista de equipo
   - Rendimiento grupal
   - Comparativas
   - Progreso hacia objetivos
```

---

### Como ACADEMY 🏢

#### Acciones Principales
```
1. Crear Curso
   Dashboard → Cursos → "Crear Curso"
   - Título y descripción
   - Precio
   - Contenido (módulos)
   - Videos y recursos

2. Gestionar Múltiples Equipos
   Dashboard → Equipos → Vista general
   - Crear equipos
   - Asignar coaches
   - Ver métricas globales

3. Administrar Coaches
   Dashboard → Personal → Coaches
   - Invitar nuevos coaches
   - Asignar a equipos
   - Ver desempeño

4. Monetización
   Dashboard → Finanzas
   - Ver ingresos por cursos
   - Gestionar inscripciones
   - Reportes financieros
```

---

### Como ADMIN ⚙️

#### Acciones Principales
```
1. Gestión de Usuarios
   Panel Admin → Usuarios
   - CRUD completo
   - Cambiar roles
   - Activar/desactivar cuentas

2. Configuración del Sistema
   Panel Admin → Configuración
   - Variables globales
   - Límites y quotas
   - Integraciones

3. Audit Logs
   Panel Admin → Logs
   - Ver todas las acciones
   - Filtrar por usuario/fecha
   - Exportar reportes

4. Monitoreo
   Panel Admin → Monitoreo
   - Estado del sistema
   - Uso de recursos
   - Alertas
```

---

## 🔑 Endpoints API Más Usados

### Autenticación
```http
POST   /api/auth/register          # Registrar usuario
POST   /api/auth/login             # Login
POST   /api/auth/refresh           # Refrescar token
```

### Sesiones
```http
GET    /api/sessions               # Listar sesiones
POST   /api/sessions               # Crear sesión
GET    /api/sessions/:id           # Ver sesión
PUT    /api/sessions/:id           # Actualizar sesión
DELETE /api/sessions/:id           # Eliminar sesión
```

### Videos
```http
GET    /api/videos                 # Listar videos
POST   /api/videos/upload          # Subir video
GET    /api/videos/:id             # Ver video
POST   /api/videos/search          # Búsqueda semántica
```

### AI Coach
```http
POST   /api/ai-coach/chat          # Chat con AI
GET    /api/ai-coach/tools         # Listar herramientas
POST   /api/ai-coach/analyze       # Análisis personalizado
```

### Analytics
```http
GET    /api/analytics/athlete/:id  # Métricas de atleta
GET    /api/analytics/team/:id     # Métricas de equipo
GET    /api/analytics/session/:id  # Métricas de sesión
```

---

## 🛠️ Comandos de Desarrollo

### Backend (NestJS)
```bash
# Directorio: /backend

# Desarrollo
npm run start:dev

# Build
npm run build

# Tests
npm run test
npm run test:e2e
npm run test:cov

# Prisma
npx prisma migrate dev
npx prisma studio
npx prisma generate
```

### Frontend (Next.js)
```bash
# Directorio: /frontend

# Desarrollo
npm run dev

# Build
npm run build
npm run start

# Linting
npm run lint
```

### Docker
```bash
# Iniciar todo
docker-compose up -d

# Ver logs
docker-compose logs -f

# Rebuild
docker-compose up -d --build

# Stop
docker-compose down

# Reset completo
docker-compose down -v
```

---

## 📊 Variables de Entorno Clave

### Backend (.env)
```env
# Base de Datos
DATABASE_URL=postgresql://user:pass@localhost:5432/alonso49

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# OpenAI
OPENAI_API_KEY=sk-...

# Cloudflare R2
R2_ACCOUNT_ID=your-account
R2_ACCESS_KEY_ID=your-key
R2_SECRET_ACCESS_KEY=your-secret
R2_BUCKET_NAME=alonso49-videos

# CORS
CORS_ORIGIN=http://localhost:3000
```

### Frontend (.env.local)
```env
# API
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# Auth
NEXT_PUBLIC_JWT_SECRET=your-secret-key
```

---

## 🔍 Troubleshooting Común

### Problema: No puedo hacer login
**Solución:**
1. Verificar que el backend esté corriendo (`http://localhost:3001`)
2. Comprobar credenciales en la base de datos
3. Ver logs: `docker-compose logs backend`

### Problema: Videos no se suben
**Solución:**
1. Verificar configuración de R2 en `.env`
2. Comprobar límites de tamaño de archivo
3. Ver logs del backend para errores específicos

### Problema: AI Coach no responde
**Solución:**
1. Verificar `OPENAI_API_KEY` en `.env`
2. Comprobar saldo de OpenAI
3. Ver logs: buscar errores de API de OpenAI

### Problema: Datos no se guardan
**Solución:**
1. Verificar conexión a base de datos
2. Ejecutar migraciones: `npx prisma migrate dev`
3. Verificar permisos de usuario en PostgreSQL

---

## 📈 Métricas de Rendimiento

### KPIs por Perfil

#### Atleta
- Número de sesiones completadas
- Progreso hacia objetivos
- Mejora en métricas técnicas
- Videos analizados

#### Coach
- Atletas activos bajo supervisión
- Feedback proporcionado
- Tasa de mejora de atletas
- Engagement del equipo

#### Academy
- Cursos publicados
- Inscripciones totales
- Ingresos por cursos
- Satisfacción de usuarios

---

## 🚦 Estado del Sistema

### Healthcheck Endpoints
```http
GET /api/health           # Estado general
GET /api/health/db        # Estado de base de datos
GET /api/health/ai        # Estado de OpenAI
GET /api/health/storage   # Estado de R2
```

### Respuesta Esperada
```json
{
  "status": "ok",
  "timestamp": "2026-08-01T21:00:00.000Z",
  "services": {
    "database": "connected",
    "ai": "available",
    "storage": "operational"
  }
}
```

---

## 🎓 Recursos de Aprendizaje

### Documentación Técnica
- **Completa:** `ALONSO49_DOCUMENTACION_PROFESIONAL.pdf`
- **Web:** `ALONSO49_DOCUMENTACION_PROFESIONAL.html`
- **Markdown:** `DOCUMENTACION_CLIENTE.md`

### Por Área
- **Backend:** Sección 3 del PDF
- **Frontend:** Sección 8 del PDF
- **API:** Sección 7 del PDF
- **Base de Datos:** Sección 6 del PDF
- **AI Coach:** Sección 5.6 del PDF

---

## 📞 Soporte Rápido

### Preguntas Frecuentes

**P: ¿Cómo cambio mi contraseña?**
R: Dashboard → Perfil → Seguridad → "Cambiar Contraseña"

**P: ¿Puedo subir varios videos a la vez?**
R: Actualmente se sube un video por vez. Funcionalidad de batch upload en roadmap.

**P: ¿El AI Coach aprende de mis datos?**
R: Sí, usa tus sesiones, videos y métricas para personalizar respuestas.

**P: ¿Cómo agrego atletas a mi equipo?**
R: Dashboard → Equipos → "Agregar Miembro" → Ingresar email del atleta

**P: ¿Puedo exportar mis datos?**
R: Sí, Dashboard → Configuración → "Exportar Datos" (formato JSON)

---

## ⚡ Tips y Trucos

### Para Atletas
- 📹 Subir videos regularmente mejora las recomendaciones del AI
- 📊 Usar tags en sesiones para facilitar búsqueda posterior
- 🎯 Establecer objetivos SMART para mejor tracking

### Para Coaches
- 💬 Feedback específico y medible es más efectivo
- 👥 Crear templates de sesión para ahorrar tiempo
- 📈 Revisar analytics semanalmente para detectar tendencias

### Para Academias
- 💰 Cursos con videos y recursos tienen mejor engagement
- 📢 Comunicar objetivos claros a coaches y atletas
- 🔄 Hacer reviews trimestrales de desempeño del equipo

---

## 🔐 Seguridad - Best Practices

### Para Todos
- ✅ Usar contraseñas fuertes (min 8 caracteres, mayúsculas, números)
- ✅ No compartir credenciales
- ✅ Logout después de cada sesión en dispositivos compartidos
- ✅ Revisar actividad de cuenta regularmente

### Para Admins
- ✅ Revisar audit logs semanalmente
- ✅ Aplicar principio de mínimo privilegio
- ✅ Hacer backups regulares de base de datos
- ✅ Mantener variables de entorno seguras

---

**Última actualización:** 1 Agosto 2026  
**Versión de la plataforma:** 1.0.0
