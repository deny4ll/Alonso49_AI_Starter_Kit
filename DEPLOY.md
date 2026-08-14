# Publicar Alonso49 gratis (demo para cliente)

Stack: Next.js (frontend) + NestJS/Prisma (backend) + Postgres con pgvector.

Combo recomendado, todo con capa gratuita:

- **DB** → [Neon](https://neon.tech) (Postgres serverless, soporta la extensión `vector`)
- **Backend** → [Render](https://render.com) (Web Service con Docker)
- **Frontend** → [Vercel](https://vercel.com)

## 1. Base de datos (Neon)

1. Crea una cuenta y un proyecto en Neon.
2. Copia el **connection string** (botón "Connect"). Se ve así:
   `postgresql://user:pass@ep-xxxx.neon.tech/alonso49?sslmode=require`
3. Guárdalo, lo vas a usar como `DATABASE_URL` en Render.

No hace falta crear la extensión `vector` a mano: la migración de Prisma la crea sola (`extensions = [vector]` en [schema.prisma](backend/prisma/schema.prisma)) al correr `prisma migrate deploy`.

## 2. Backend (Render)

1. Sube el repo a GitHub si todavía no está.
2. En Render: **New > Web Service**, conecta el repo.
3. Configuración:
   - **Root Directory:** `backend`
   - **Runtime:** Docker (usa [backend/Dockerfile](backend/Dockerfile), ya ajustado para producción: compila y corre `prisma migrate deploy` antes de levantar el server)
   - **Instance Type:** Free
4. Variables de entorno (Render > Environment):
   - `DATABASE_URL` = el connection string de Neon
   - `JWT_SECRET` = un valor random largo (no uses el de desarrollo)
   - `JWT_EXPIRATION` = `7d`
   - `NODE_ENV` = `production`
   - `PORT` = `3001`
   - `FRONTEND_URL` = la URL de Vercel del paso 3 (para que el CORS deje pasar al frontend)
   - `OPENAI_API_KEY` = tu key (opcional; sin ella el AI Coach responde con un mensaje de demo en vez de fallar)
5. Deploy. Anota la URL que te da Render, ej. `https://alonso49-backend.onrender.com`.

⚠️ En el free tier, el servicio "duerme" tras ~15 min sin tráfico y la primera petición tras eso tarda 20-30s. Para la demo, entra tú primero unos minutos antes para "despertarlo".

## 3. Frontend (Vercel)

1. En Vercel: **Add New > Project**, importa el repo.
2. **Root Directory:** `frontend`
3. Variable de entorno:
   - `NEXT_PUBLIC_API_URL` = `https://alonso49-backend.onrender.com/api` (la URL de Render + `/api`)
4. Deploy. Vercel te da una URL tipo `https://alonso49.vercel.app`.
5. Vuelve a Render y actualiza `FRONTEND_URL` con esa URL exacta de Vercel, luego redeploy del backend (para que el CORS la acepte).

## 4. Gate de acceso (MVP, no público)

Mientras esté en fase de demo, la plataforma queda cerrada detrás de un usuario/contraseña compartido: al abrir el sitio, el navegador pide login (HTTP Basic Auth) antes de mostrar nada, y la misma credencial protege la API del backend contra quien la encuentre directo.

1. **Render** (`alonso49-backend`) → Environment, agregá:
   - `GATE_USER` = el usuario que elijas
   - `GATE_PASSWORD` = una contraseña random larga (generá una con `openssl rand -base64 18`, por ejemplo)
2. **Vercel** → Settings > Environment Variables, agregá las **cuatro** con el mismo par de valores del paso anterior:
   - `GATE_USER`
   - `GATE_PASSWORD`
   - `NEXT_PUBLIC_GATE_USER`
   - `NEXT_PUBLIC_GATE_PASSWORD`

   (Las dos primeras protegen la pantalla de login del navegador; las `NEXT_PUBLIC_` van embebidas en el JS para que el frontend pueda seguir llamando a la API una vez adentro. Usá el mismo valor en las cuatro.)
3. Redeploy de ambos servicios.
4. Compartile a tu cliente esa misma credencial para que pueda entrar.

Si estas variables no están seteadas (por ejemplo en desarrollo local), el gate queda desactivado automáticamente — no hace falta nada especial para `docker-compose`.

## 5. Datos de prueba (opcional)

Si querés que el cliente vea contenido real y no una app vacía, corré los seeds contra la DB de Neon antes de la demo, apuntando `DATABASE_URL` local a Neon:

```bash
DATABASE_URL="postgresql://...neon..." npm --prefix backend run seed:youth-pro
```

## Resumen de URLs finales

- App (cliente entra acá): `https://alonso49.vercel.app`
- API: `https://alonso49-backend.onrender.com/api`
- Docs Swagger: `https://alonso49-backend.onrender.com/api/docs`
