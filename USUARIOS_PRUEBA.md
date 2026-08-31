# 👥 Usuarios de Prueba - Sailvex

## 🎯 Credenciales de Acceso

### 1️⃣ ATLETA

```
Nombre:   Juan Pérez
Email:    atleta@alonso49.com
Password: atleta123
Rol:      ATHLETE
```

**Permisos:**
- ✅ Subir y ver videos
- ✅ Crear sesiones de entrenamiento
- ✅ Ver estadísticas personales
- ✅ Unirse a equipos
- ✅ Inscribirse en cursos

**Flujo de prueba:**
1. Login en http://localhost:3000/login
2. Ir a "Videos" → Subir un video
3. Ir a "Sesiones" → Crear una sesión
4. Ir a "Estadísticas" → Ver tu progreso

---

### 2️⃣ COACH

```
Nombre:   María González
Email:    coach@alonso49.com
Password: coach123
Rol:      COACH
```

**Permisos:**
- ✅ Todo lo de ATHLETE
- ✅ Crear y gestionar equipos
- ✅ Ver sesiones del equipo
- ✅ Dar feedback a atletas
- ✅ Analizar rendimiento del equipo

**Flujo de prueba:**
1. Login en http://localhost:3000/login
2. Ir a "Equipos" → Crear un equipo
3. Agregar miembros al equipo
4. Revisar sesiones del equipo
5. Ver estadísticas del equipo

---

### 3️⃣ ACADEMIA

```
Nombre:   Elite Sailing Academy
Email:    academia@alonso49.com
Password: academia123
Rol:      ACADEMY
```

**Permisos:**
- ✅ Todo lo de COACH
- ✅ Gestionar múltiples equipos
- ✅ Crear cursos
- ✅ Monetizar contenido
- ✅ Dashboard de academia

**Flujo de prueba:**
1. Login en http://localhost:3000/login
2. Ir a "Equipos" → Crear múltiples equipos
3. Ir a "Cursos" → Crear un curso (próximamente)
4. Gestionar equipos de diferentes niveles
5. Ver dashboard completo de la academia

---

## 🔄 Comparación de Roles

| Característica | ATLETA | COACH | ACADEMIA |
|----------------|---------|--------|----------|
| Subir videos | ✅ | ✅ | ✅ |
| Crear sesiones | ✅ | ✅ | ✅ |
| Ver estadísticas propias | ✅ | ✅ | ✅ |
| Crear equipos | ❌ | ✅ | ✅ |
| Gestionar equipos | ❌ | ✅ | ✅ |
| Ver sesiones del equipo | ❌ | ✅ | ✅ |
| Dar feedback | ❌ | ✅ | ✅ |
| Crear cursos | ❌ | ❌ | ✅ |
| Monetización | ❌ | ❌ | ✅ |
| Múltiples equipos | ❌ | Limitado | ✅ |

---

## 🧪 Escenarios de Prueba

### Escenario 1: Ciclo Completo de Entrenamiento
1. **Como ATLETA** (atleta@alonso49.com):
   - Sube un video de entrenamiento
   - Crea una sesión
   - Revisa estadísticas

2. **Como COACH** (coach@alonso49.com):
   - Crea un equipo
   - Revisa el video del atleta
   - Da feedback (próximamente)

### Escenario 2: Gestión de Equipos
1. **Como COACH** (coach@alonso49.com):
   - Crea "Team Alpha"
   - Agrega descripción y objetivos

2. **Como ATLETA** (atleta@alonso49.com):
   - Ve los equipos disponibles
   - Solicita unirse (próximamente)

### Escenario 3: Plataforma Educativa
1. **Como ACADEMIA** (academia@alonso49.com):
   - Crea un curso de alto rendimiento
   - Establece precio
   - Agrega módulos

2. **Como ATLETA** (atleta@alonso49.com):
   - Explora cursos disponibles
   - Se inscribe en el curso
   - Completa módulos

---

## 🚀 Inicio Rápido

### Para probar ATLETA:
```bash
# 1. Ve a http://localhost:3000/login
# 2. Email: atleta@alonso49.com
# 3. Password: atleta123
# 4. Explora: Videos, Sesiones, Estadísticas
```

### Para probar COACH:
```bash
# 1. Ve a http://localhost:3000/login
# 2. Email: coach@alonso49.com
# 3. Password: coach123
# 4. Explora: Equipos, Sesiones, Feedback
```

### Para probar ACADEMIA:
```bash
# 1. Ve a http://localhost:3000/login
# 2. Email: academia@alonso49.com
# 3. Password: academia123
# 4. Explora: Equipos, Cursos, Dashboard
```

---

## 🔧 Recrear Usuarios

Si necesitas recrear los usuarios:

```bash
cd /Users/chris/Documents/Projects/chrisAI/Sailvex_AI_Starter_Kit
./create-test-users.sh
```

---

## 📝 Notas

- Todas las contraseñas son simples para facilitar las pruebas
- En producción se deben usar contraseñas seguras
- Los usuarios pueden cambiar sus datos en la configuración de perfil (próximamente)
- Para crear más usuarios, usa el endpoint `/api/auth/register`

---

**URL de Login**: http://localhost:3000/login  
**API Docs**: http://localhost:3001/api/docs

---

*Última actualización: 29 de Julio, 2026*
