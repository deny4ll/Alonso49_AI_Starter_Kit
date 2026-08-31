# 🎯 Guía Completa de Funcionalidades - Sailvex

## ✅ Funcionalidades Implementadas

### 1. **Sistema de Autenticación Completo**

#### Registro de Usuarios
- URL: http://localhost:3000/register
- Campos:
  - Nombre y Apellido
  - Correo electrónico
  - Contraseña (mínimo 6 caracteres)
  - Rol (Atleta, Entrenador, Academia)
- Validación automática
- Creación de token JWT

#### Inicio de Sesión
- URL: http://localhost:3000/login
- Autenticación con email y contraseña
- Sesión persistente con localStorage
- Redirección automática al dashboard

### 2. **Dashboard Principal**
- URL: http://localhost:3000/dashboard
- **Estadísticas en tiempo real**:
  - Total de videos subidos
  - Total de sesiones completadas
  - Cursos activos
  - Score de rendimiento
- **Vistas recientes**:
  - Sesiones recientes con detalles
  - Videos recientes
- **Navegación lateral** con acceso rápido a todas las secciones

### 3. **Gestión de Videos** 📹
- URL: http://localhost:3000/videos

#### Características:
- ✅ Subir videos (por URL)
- ✅ Ver lista de todos los videos
- ✅ Información detallada:
  - Título
  - Descripción
  - Estado (UPLOADING, PROCESSING, READY, FAILED)
  - Miniatura
- ✅ Eliminar videos
- ✅ Diseño tipo galería

#### Cómo usar:
1. Click en "Subir Video"
2. Completa el formulario:
   - Título del video
   - Descripción
   - URL del video (YouTube, Vimeo, etc.)
3. Click en "Subir Video"
4. El video aparecerá en la galería

### 4. **Gestión de Sesiones** 🏄

- URL: http://localhost:3000/sessions

#### Características:
- ✅ Crear sesiones de entrenamiento
- ✅ Programar sesiones futuras
- ✅ Estados de sesión:
  - DRAFT (Borrador)
  - SCHEDULED (Programada)
  - IN_PROGRESS (En progreso)
  - COMPLETED (Completada)
  - CANCELLED (Cancelada)
- ✅ Detalles de sesión:
  - Título y descripción
  - Fecha y hora
  - Ubicación
  - Condiciones de viento
  - Dirección del viento
  - Altura de ola

#### Cómo crear una sesión:
1. Click en "Nueva Sesión"
2. Completa el formulario:
   - Título (ej: "Entrenamiento de tacking")
   - Descripción de objetivos
   - Ubicación (ej: "Bahía de Santander")
   - Fecha y hora programada
3. Click en "Crear Sesión"
4. La sesión aparecerá en el listado

### 5. **Gestión de Equipos** 👥
- URL: http://localhost:3000/teams

#### Características:
- ✅ Crear equipos
- ✅ Ver lista de equipos
- ✅ Estado activo/inactivo
- ✅ Contador de miembros
- ✅ Descripción del equipo

#### Cómo crear un equipo:
1. Click en "Nuevo Equipo"
2. Ingresa:
   - Nombre del equipo
   - Descripción
3. Click en "Crear Equipo"
4. El equipo aparecerá en la galería

### 6. **Sistema de Cursos** 📚
- URL: http://localhost:3000/courses

#### Características:
- ✅ Ver cursos disponibles
- ✅ Información de cada curso:
  - Título y descripción
  - Número de módulos
  - Precio (gratis o de pago)
- ✅ Inscripción a cursos
- ✅ Diseño tipo catálogo

### 7. **Estadísticas y Analytics** 📊
- URL: http://localhost:3000/analytics

#### Métricas disponibles:
- ✅ Total de sesiones
- ✅ Total de videos
- ✅ Indicadores de rendimiento
- ✅ Indicadores de progreso
- ✅ Condiciones de entrenamiento:
  - Viento promedio
  - Ola promedio
- ✅ Gráficos de progreso semanal

## 🎨 Componentes UI Implementados

### Componentes Reutilizables:
- **Button**: Botones con variantes (primary, secondary, outline, danger)
- **Card**: Tarjetas para contenido con título y acciones
- **DashboardLayout**: Layout principal con navegación lateral

### Diseño:
- ✅ Diseño responsivo (mobile, tablet, desktop)
- ✅ Paleta de colores consistente
- ✅ Iconos de Lucide React
- ✅ Transiciones y animaciones suaves
- ✅ Estados de carga
- ✅ Manejo de errores

## 🔐 Roles y Permisos

### ATHLETE (Atleta)
**Puede hacer:**
- ✅ Subir y ver sus videos
- ✅ Crear y ver sus sesiones
- ✅ Ver estadísticas personales
- ✅ Unirse a equipos
- ✅ Inscribirse en cursos

### COACH (Entrenador)
**Puede hacer:**
- ✅ Todo lo de ATHLETE
- ✅ Crear y gestionar equipos
- ✅ Ver sesiones de su equipo
- ✅ Dar feedback (próximamente)
- ✅ Analizar rendimiento del equipo

### ACADEMY (Academia)
**Puede hacer:**
- ✅ Todo lo de COACH
- ✅ Gestionar múltiples equipos
- ✅ Crear cursos
- ✅ Monetizar contenido
- ✅ Dashboard de academia (próximamente)

### ADMIN (Administrador)
**Puede hacer:**
- ✅ Acceso completo al sistema
- ✅ Gestión de todos los usuarios
- ✅ Configuración global
- ✅ Auditoría completa

## 📱 Navegación

### Menú Principal (Sidebar):
1. **Dashboard** - Vista general y estadísticas
2. **Videos** - Gestión de videos
3. **Sesiones** - Planificación y seguimiento
4. **Equipos** - Gestión de equipos
5. **Cursos** - Catálogo educativo
6. **Estadísticas** - Analytics y métricas

### Barra Superior:
- Logo y nombre de la plataforma
- Información del usuario (nombre y rol)
- Botón de cerrar sesión

## 🚀 Flujo de Uso Completo

### Para un Atleta:

1. **Registro**
   - Ir a http://localhost:3000/register
   - Completar formulario con rol "Atleta"
   - Automáticamente iniciar sesión

2. **Subir un Video**
   - Ir a "Videos" en el menú lateral
   - Click en "Subir Video"
   - Completar título, descripción y URL
   - Ver el video en la galería

3. **Crear una Sesión**
   - Ir a "Sesiones"
   - Click en "Nueva Sesión"
   - Programar entrenamiento con fecha/hora
   - Ver en el listado de sesiones

4. **Unirse a un Equipo**
   - Ir a "Equipos"
   - Ver equipos disponibles
   - (Próximamente: solicitar unirse)

5. **Ver Estadísticas**
   - Ir a "Estadísticas"
   - Ver progreso personal
   - Analizar métricas de rendimiento

### Para un Entrenador:

1. **Crear Equipo**
   - Ir a "Equipos"
   - Click en "Nuevo Equipo"
   - Configurar nombre y descripción

2. **Gestionar Sesiones del Equipo**
   - Ir a "Sesiones"
   - Crear sesiones para el equipo
   - Programar entrenamientos

3. **Revisar Videos**
   - Ir a "Videos"
   - Ver videos del equipo
   - (Próximamente: dar feedback)

### Para una Academia:

1. **Crear Múltiples Equipos**
   - Ir a "Equipos"
   - Crear equipos para diferentes niveles

2. **Crear Cursos**
   - Ir a "Cursos"
   - (Próximamente: crear cursos)
   - Configurar precio y módulos

## 🎯 Casos de Uso Reales

### Caso 1: Preparación para Competencia
```
1. El atleta sube video de práctica
2. El coach crea sesión de análisis
3. Se revisa el video en la sesión
4. Se dan puntos de mejora
5. Se programa siguiente sesión
6. Se mide progreso en estadísticas
```

### Caso 2: Entrenamiento en Equipo
```
1. El coach crea un equipo
2. Los atletas se unen al equipo
3. Se programa sesión grupal
4. Cada atleta sube su video
5. Se hace revisión conjunta
6. Se comparan métricas entre atletas
```

### Caso 3: Curso de Alto Rendimiento
```
1. La academia crea curso
2. Los atletas se inscriben
3. Completan módulos teóricos
4. Aplican en sesiones prácticas
5. Suben videos de ejercicios
6. Reciben certificación
```

## 🔄 Próximas Funcionalidades

- [ ] Sistema de feedback en tiempo real
- [ ] Chat entre coach y atleta
- [ ] Notificaciones push
- [ ] Análisis de video con IA
- [ ] Integración con Cloudflare R2 para almacenamiento
- [ ] Búsqueda semántica de videos con pgvector
- [ ] WebSockets para actualizaciones en tiempo real
- [ ] Aplicación móvil (PWA)
- [ ] Exportación de reportes en PDF
- [ ] Comparación de sesiones
- [ ] Leaderboards y rankings

## 💡 Tips de Uso

1. **Organización**: Usa nombres descriptivos para sesiones y videos
2. **Programación**: Programa sesiones con antelación
3. **Análisis**: Revisa estadísticas regularmente
4. **Equipos**: Crea equipos por nivel de experiencia
5. **Videos**: Incluye descripción detallada de condiciones

## 🆘 Ayuda

Si tienes problemas:
1. Consulta [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
2. Revisa [README.md](./README.md)
3. Consulta [QUICK_START.md](./QUICK_START.md)

---

**¡Disfruta de Sailvex! 🏆⛵**
