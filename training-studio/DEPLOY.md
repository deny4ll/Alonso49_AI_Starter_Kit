# Publicar el Training Studio en producción

Mismo combo gratuito que la plataforma principal (ver [../DEPLOY.md](../DEPLOY.md)): Neon + Render + Vercel. Es una app independiente — DB, backend, frontend y login propios — que solo se conecta a la plataforma principal a través del script manual `npm run sync:platform`. Nunca hay una llamada API en runtime entre los dos backends ni entre los dos frontends.

Este documento asume que la plataforma principal ya está desplegada siguiendo `../DEPLOY.md` (backend en Render, frontend en Vercel, DB en Neon) y que vas a **reutilizar** su `OPENAI_API_KEY` y su proyecto de Supabase, según lo confirmado con el cliente.

## 1. Base de datos propia (Neon)

El Training Studio necesita su **propia** base de datos — nunca la misma que usa la plataforma para sus tablas (`users`, `sessions`, etc.), aunque sea el mismo proveedor.

1. En el mismo (o en otro) proyecto de Neon, creá una base de datos nueva, ej. `training_studio`.
2. Copiá su connection string. Se ve así:
   `postgresql://user:pass@ep-xxxx.neon.tech/training_studio?sslmode=require`
3. La extensión `vector` se crea sola con `prisma migrate deploy` (igual que en la plataforma principal).

## 2. Backend (Render)

1. En Render: **New > Web Service**, conectá el mismo repo de GitHub.
2. Configuración:
   - **Root Directory:** `training-studio/backend`
   - **Runtime:** Docker (usa `training-studio/backend/Dockerfile`)
   - **Instance Type:** Free
3. Variables de entorno:
   - `DATABASE_URL` = el connection string de Neon del paso 1 (la base **propia** del Training Studio)
   - `JWT_SECRET` = un valor random largo, **distinto** del que usa la plataforma principal (son sistemas de login separados)
   - `JWT_EXPIRATION` = `7d`
   - `PORT` = `3002`
   - `NODE_ENV` = `production`
   - `FRONTEND_URL` = la URL de Vercel del Training Studio (paso 3, la vas a tener después de ese paso — completá esta variable y redeployá al final)
   - `OPENAI_API_KEY` = **la misma key** que ya usa `alonso49-backend` en Render (Render > alonso49-backend > Environment > copiar el valor)
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
