# 🔧 Solución al Error de Login

## ✅ Diagnóstico Completado

### Estado del Sistema
- ✅ **Backend:** Funcionando correctamente (puerto 3001)
- ✅ **Base de datos:** Conectada y operativa
- ✅ **API de login:** Funciona perfectamente
- ⚠️ **Frontend:** Error de "Fast Refresh" en tiempo de ejecución

### Usuario de Prueba Creado
He creado un usuario de prueba que puedes usar:

```
Email: test@alonso49.com
Password: Test123!
```

---

## 🎯 Solución Inmediata

### Opción 1: Reiniciar el Frontend (Más Rápido)

```bash
cd /Users/chris/Documents/Projects/chrisAI/Sailvex_AI_Starter_Kit
docker-compose restart frontend
```

Espera 10 segundos y luego intenta hacer login nuevamente.

---

### Opción 2: Reiniciar Todo el Sistema (Más Completo)

```bash
cd /Users/chris/Documents/Projects/chrisAI/Sailvex_AI_Starter_Kit
docker-compose down
docker-compose up -d
```

Espera 15-20 segundos para que todo inicie correctamente.

---

### Opción 3: Limpiar Caché del Navegador

1. Abre http://localhost:3000/login
2. Presiona `Cmd + Shift + R` (Mac) o `Ctrl + Shift + R` (Windows/Linux)
3. Esto hará una recarga forzada sin caché
4. Intenta hacer login de nuevo

---

## 🧪 Verificar que Todo Funciona

### 1. Verifica que los servicios estén corriendo

```bash
docker-compose ps
```

Deberías ver todos los servicios como "Up":
- alonso49-backend
- alonso49-frontend  
- alonso49-postgres

### 2. Prueba el backend directamente

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@alonso49.com","password":"Test123!"}'
```

Si ves un JSON con `user` y `accessToken`, el backend funciona correctamente.

### 3. Abre el frontend

Abre en tu navegador: http://localhost:3000/login

Intenta hacer login con:
- Email: `test@alonso49.com`
- Password: `Test123!`

---

## 🔍 Problema Técnico Identificado

El error "Fast Refresh had to perform a full reload due to a runtime error" se debe a que el código está intentando acceder a `localStorage` durante el render del servidor (SSR) en Next.js.

### Archivos Involucrados
- `/frontend/src/stores/auth.ts` - Store de autenticación
- `/frontend/src/lib/api.ts` - Cliente de API
- `/frontend/src/app/login/page.tsx` - Página de login

El código ya tiene protecciones para esto (`typeof window !== 'undefined'`), pero Next.js puede tener problemas con el hydration.

---

## 🛠️ Solución Permanente (Si el problema persiste)

Si después de reiniciar el frontend el problema continúa, aplica este parche:

### Paso 1: Modificar el Layout Principal

```bash
cd /Users/chris/Documents/Projects/chrisAI/Sailvex_AI_Starter_Kit/frontend
```

Crea el archivo `src/app/layout.tsx` si no existe o actualízalo:

```typescript
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Sailvex Platform',
  description: 'High Performance Sailing Training Platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body suppressHydrationWarning={true}>
        {children}
      </body>
    </html>
  )
}
```

### Paso 2: Reiniciar el Frontend

```bash
docker-compose restart frontend
```

---

## 📊 Logs para Debugging

Si necesitas ver qué está pasando en tiempo real:

### Ver logs del frontend:
```bash
docker-compose logs -f frontend
```

### Ver logs del backend:
```bash
docker-compose logs -f backend
```

### Ver logs de todo:
```bash
docker-compose logs -f
```

Para detener los logs, presiona `Ctrl + C`.

---

## ✅ Checklist de Verificación

Después de aplicar la solución, verifica:

- [ ] Los 3 contenedores están corriendo (`docker-compose ps`)
- [ ] Puedes acceder a http://localhost:3000
- [ ] Puedes acceder a http://localhost:3000/login
- [ ] No hay errores en la consola del navegador (F12 → Console)
- [ ] Puedes hacer login con el usuario de prueba
- [ ] Después del login, eres redirigido a `/dashboard`

---

## 🆘 Si Nada Funciona

### Opción de Último Recurso: Rebuild Completo

```bash
cd /Users/chris/Documents/Projects/chrisAI/Sailvex_AI_Starter_Kit

# Detener todo
docker-compose down -v

# Limpiar imágenes
docker-compose build --no-cache frontend

# Iniciar de nuevo
docker-compose up -d

# Ver logs
docker-compose logs -f
```

Esto puede tomar 5-10 minutos pero resolverá cualquier problema de caché o configuración.

---

## 📝 Crear Más Usuarios de Prueba

Si necesitas más usuarios para probar:

### Usuario Coach:
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "coach@alonso49.com",
    "password": "Coach123!",
    "firstName": "Coach",
    "lastName": "Test",
    "role": "COACH"
  }'
```

### Usuario Academy:
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "academy@alonso49.com",
    "password": "Academy123!",
    "firstName": "Academy",
    "lastName": "Admin",
    "role": "ACADEMY"
  }'
```

---

## 🎯 Resumen

**El problema:**  
Error de "Fast Refresh" en el frontend de Next.js relacionado con SSR y localStorage.

**La solución más rápida:**  
```bash
docker-compose restart frontend
```

**Usuario de prueba disponible:**
- Email: test@alonso49.com  
- Password: Test123!

**Si persiste el problema:**  
Aplicar el parche del layout con `suppressHydrationWarning={true}`

---

*Última actualización: 3 Agosto 2026*
