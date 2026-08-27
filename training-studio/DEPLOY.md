# Publicar el Training Studio en producción

Mismo combo gratuito que la plataforma principal (ver [../DEPLOY.md](../DEPLOY.md)): Neon + Render + Vercel. Es una app independiente — DB, backend, frontend y login propios — que solo se conecta a la plataforma principal a través del script manual `npm run sync:platform`. Nunca hay una llamada API en runtime entre los dos backends ni entre los dos frontends.

Este documento asume que la plataforma principal ya está desplegada siguiendo `../DEPLOY.md` (backend en Render, frontend en Vercel, DB en Neon) y que vas a **reutilizar** su `OPENAI_API_KEY` y su proyecto de Supabase, según lo confirmado con el cliente.

## Estado actual (ya hecho)

- ✅ DB propia en Neon (proyecto `training-studio`, separado del proyecto de la plataforma), migrada.
- ✅ Frontend en Vercel: [training-studio-amber.vercel.app](https://training-studio-amber.vercel.app), conectado a GitHub (auto-deploy en cada push a `main`, Root Directory `training-studio/frontend`).
- ✅ Link "Training Studio" ya en el menú de la plataforma principal (`NEXT_PUBLIC_TRAINING_STUDIO_URL` seteada en Vercel).
- ✅ `render.yaml` en la raíz del repo, listo para el paso 2.
- ⬜ Backend en Render — único paso manual que falta, ver abajo.
- ⬜ `FRONTEND_URL` del backend de Render → una vez creado, actualizarla con `https://training-studio-amber.vercel.app`.

## 1. Base de datos propia (Neon) — ya hecha

El connection string real de producción quedó guardado en `training-studio/backend/.env` (`DATABASE_URL`, gitignored) — no hace falta crear una nueva a mano.

## 2. Backend (Render)

Usá el Blueprint en vez de crearlo a mano — está pensado para no tocar el `alonso49-backend` existente (nombre de servicio distinto):

1. Render dashboard → **New > Blueprint**.
2. Conectá este repo de GitHub. Render detecta `render.yaml` automáticamente y muestra un solo servicio nuevo: `training-studio-backend`.
3. Antes de aplicar, va a pedir los valores marcados `sync: false` en `render.yaml`:
   - `DATABASE_URL` = el que está en `training-studio/backend/.env` de este repo (correlo local: `grep DATABASE_URL training-studio/backend/.env`)
   - `FRONTEND_URL` = `https://training-studio-amber.vercel.app`
   - `OPENAI_API_KEY` = la misma que ya usa `alonso49-backend` (Render → alonso49-backend → Environment → copiar)
   - `SUPABASE_URL` = la misma que ya usa `alonso49-backend`
   - `SUPABASE_SERVICE_ROLE_KEY` = la misma que ya usa `alonso49-backend`
   - (`JWT_SECRET` se genera solo, no hace falta tocarlo)
4. Apply. Anotá la URL final, ej. `https://training-studio-backend.onrender.com`.
5. Si no coincide con `https://training-studio-backend.onrender.com` (Render agrega un sufijo si el nombre ya existe), actualizá `NEXT_PUBLIC_API_URL` en el proyecto Vercel `training-studio` con la URL real, y redeployá (`vercel deploy --prod` desde `training-studio/frontend`).
   - `SUPABASE_URL` = **la misma** que usa `alonso49-backend`
   - `SUPABASE_SERVICE_ROLE_KEY` = **la misma** que usa `alonso49-backend`
   - `SUPABASE_STORAGE_BUCKET` = `training-documents` (bucket **nuevo**, crealo en el mismo proyecto de Supabase, Storage > New bucket, público)
4. Deploy. Anotá la URL, ej. `https://training-studio-backend.onrender.com`.

⚠️ Mismo comportamiento free-tier que la plataforma principal: el servicio duerme tras ~15 min sin tráfico.

## 3. Frontend (Vercel)

1. En Vercel: **Add New > Project**, importá el mismo repo.
2. **Root Directory:** `training-studio/frontend`
3. Variable de entorno:
   - `NEXT_PUBLIC_API_URL` = `https://training-studio-backend.onrender.com/api`
4. Deploy. Vercel te da una URL, ej. `https://training-studio.vercel.app`.
5. Volvé a Render (`training-studio-backend`) y actualizá `FRONTEND_URL` con esa URL exacta, después redeploy del backend (CORS).

## 4. Primer entrenador ADMIN

El Training Studio no tiene auto-registro público. Corré el seed una vez, apuntando `DATABASE_URL` a la Neon del Training Studio (no a la de la plataforma):

```bash
DATABASE_URL="postgresql://...training_studio..." \
ADMIN_EMAIL="tu-email@alonso49.com" \
ADMIN_PASSWORD="una-contraseña-larga" \
ADMIN_FIRST_NAME="Nombre" \
ADMIN_LAST_NAME="Apellido" \
npm --prefix training-studio/backend run seed:admin
```

Con esa cuenta entrás a `https://training-studio.vercel.app` y desde ahí (`POST /auth/register`, solo ADMIN) das de alta al resto de los entrenadores.

## 5. Enlace desde la plataforma principal

El menú lateral de la plataforma (rol ADMIN/COACH) ya tiene un ítem "Training Studio" que abre esta URL en una pestaña nueva (`frontend/src/components/layout/DashboardLayout.tsx`). Para que apunte a producción:

1. En Vercel, proyecto de la **plataforma principal** (`alonso49` / frontend), agregá la variable:
   - `NEXT_PUBLIC_TRAINING_STUDIO_URL` = `https://training-studio.vercel.app`
2. Redeploy del frontend principal.

## 6. Sincronizar contenido aprobado hacia la Knowledge Base real

`npm run sync:platform` es un script manual — nunca corre solo. Se ejecuta desde tu máquina (o desde donde prefieras), apuntando **a la vez** a las dos bases:

```bash
DATABASE_URL="postgresql://...training_studio..." \
PLATFORM_DATABASE_URL="postgresql://...alonso49-en-neon-de-produccion..." \
PLATFORM_SYNC_USER_ID="<id de un User real de la plataforma>" \
OPENAI_API_KEY="la-misma-key" \
npm --prefix training-studio/backend run sync:platform
```

- `PLATFORM_DATABASE_URL` = **el mismo** connection string que ya está seteado como `DATABASE_URL` en Render para `alonso49-backend` (Render > alonso49-backend > Environment > copiar). Esto es intencional: el script escribe de verdad en la Knowledge Base que usan los atletas/coaches en producción.
- `PLATFORM_SYNC_USER_ID` = el `id` de un `User` existente en esa base (por ejemplo un ADMIN), al que se le atribuyen los documentos sincronizados. Conseguilo corriendo esta consulta contra la DB de producción (Neon tiene un SQL editor, o usá `psql "$PLATFORM_DATABASE_URL"`):
  ```sql
  SELECT id, email, role FROM users WHERE role IN ('ADMIN','COACH') LIMIT 5;
  ```

Corré este comando cada vez que quieras publicar lo aprobado. El script vuelve a validar que no haya información sensible sin confirmar antes de exportar cada entrada, y nunca sincroniza dos veces la misma (`syncedAt`).

## Resumen de URLs finales

- Training Studio (entrenadores entran acá): `https://training-studio.vercel.app`
- API: `https://training-studio-backend.onrender.com/api`
- Docs Swagger: `https://training-studio-backend.onrender.com/api/docs`
- Acceso desde la plataforma: menú lateral (ADMIN/COACH) > "Training Studio"
