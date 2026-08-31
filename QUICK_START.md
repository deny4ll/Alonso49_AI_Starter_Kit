# 🚀 Guía de Inicio Rápido - Sailvex

## Inicio Rápido con Docker (Recomendado)

### 1. Clonar y Configurar

```bash
cd /Users/chris/Documents/Projects/chrisAI/Sailvex_AI_Starter_Kit

cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

### 2. Iniciar la Plataforma

```bash
./start.sh
```

Este script hará:
- ✅ Verificar Docker
- ✅ Crear archivos .env
- ✅ Iniciar contenedores
- ✅ Ejecutar migraciones de base de datos

### 3. Acceder a la Aplicación

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001/api
- **API Docs (Swagger)**: http://localhost:3001/api/docs
- **Prisma Studio**: `cd backend && npx prisma studio`

## Desarrollo Local (sin Docker)

### Requisitos
- Node.js 20+
- PostgreSQL 16 con pgvector
- npm

### 1. Base de Datos

Opción A - Docker solo para PostgreSQL:
```bash
docker run -d \
  --name alonso49-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=alonso49 \
  -p 5432:5432 \
  pgvector/pgvector:pg16
```

Opción B - PostgreSQL local:
```bash
psql postgres
CREATE DATABASE alonso49;
CREATE EXTENSION vector;
```

### 2. Backend

```bash
cd backend

npm install

npx prisma generate
npx prisma migrate dev

npm run start:dev
```

Backend corriendo en http://localhost:3001

### 3. Frontend

```bash
cd frontend

npm install

npm run dev
```

Frontend corriendo en http://localhost:3000

## Primeros Pasos

### 1. Crear Usuario

Ve a http://localhost:3000/register y crea una cuenta:
- Nombre y Apellido
- Email
- Contraseña (mín. 6 caracteres)
- Rol: Atleta, Entrenador o Academia

### 2. Iniciar Sesión

http://localhost:3000/login

### 3. Explorar Dashboard

http://localhost:3000/dashboard

### 4. Explorar API

http://localhost:3001/api/docs

## Roles y Permisos

### ATHLETE (Atleta)
- ✅ Subir videos
- ✅ Ver sesiones propias
- ✅ Recibir feedback
- ✅ Ver estadísticas personales

### COACH (Entrenador)
- ✅ Todo lo de ATHLETE
- ✅ Revisar sesiones del equipo
- ✅ Dar feedback
- ✅ Gestionar equipo
- ✅ Ver análisis detallados

### ACADEMY (Academia)
- ✅ Todo lo de COACH
- ✅ Administrar múltiples equipos
- ✅ Crear cursos
- ✅ Monetización
- ✅ Dashboard de academia

### ADMIN (Administrador)
- ✅ Acceso completo al sistema
- ✅ Gestión de usuarios
- ✅ Configuración global
- ✅ Auditoría

## Comandos Útiles

### Docker
```bash
docker-compose up -d              # Iniciar
docker-compose down               # Detener
docker-compose logs -f            # Ver logs
docker-compose restart backend    # Reiniciar backend
docker-compose restart frontend   # Reiniciar frontend
```

### Base de Datos
```bash
cd backend

npx prisma studio                 # UI gráfica
npx prisma migrate dev            # Nueva migración
npx prisma migrate reset          # Reset completo (⚠️ Borra datos)
npx prisma generate               # Regenerar cliente
npx prisma db seed                # Seed data (futuro)
```

### Tests
```bash
cd backend
npm test                          # Unit tests
npm run test:watch                # Test watch mode
npm run test:cov                  # Coverage

cd frontend
npm run lint                      # ESLint
npm run build                     # Build production
```

## Troubleshooting

### Error: Puerto en uso
```bash
docker-compose down
lsof -ti:3000 | xargs kill -9    # Mata proceso en puerto 3000
lsof -ti:3001 | xargs kill -9    # Mata proceso en puerto 3001
```

### Error: Prisma Client no generado
```bash
cd backend
npx prisma generate
```

### Error: Conexión a base de datos
```bash
docker-compose down
docker-compose up -d postgres
sleep 10
docker-compose up -d backend frontend
```

### Reset completo
```bash
docker-compose down -v            # Borra volúmenes
rm -rf backend/node_modules frontend/node_modules
docker-compose up -d
```

## Próximos Pasos

1. **Agregar datos de prueba**: Crear equipos, sesiones y videos de ejemplo
2. **Configurar Cloudflare R2**: Para almacenamiento de videos
3. **Integrar OpenAI**: Para análisis de videos con IA
4. **Configurar WebSockets**: Para notificaciones en tiempo real
5. **Desplegar en producción**: Kubernetes + Terraform

## Estructura del Proyecto

```
alonso49/
├── backend/              # API NestJS
│   ├── src/
│   │   ├── modules/      # Módulos funcionales
│   │   ├── prisma/       # Cliente Prisma
│   │   └── common/       # Utilidades compartidas
│   └── prisma/
│       └── schema.prisma # Esquema de DB
│
├── frontend/             # App Next.js
│   └── src/
│       ├── app/          # Páginas (App Router)
│       ├── components/   # Componentes
│       ├── lib/          # Utilidades
│       └── stores/       # Estado global
│
├── infrastructure/       # IaC y configs
│   ├── docker/
│   ├── k8s/
│   └── terraform/
│
└── .github/
    └── workflows/        # CI/CD
```

## API Endpoints Principales

### Autenticación
- `POST /api/auth/register` - Registrar
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Usuario actual

### Gestión
- `GET /api/sessions` - Listar sesiones
- `POST /api/sessions` - Crear sesión
- `GET /api/videos` - Listar videos
- `POST /api/videos` - Subir video
- `GET /api/teams` - Listar equipos
- `GET /api/courses` - Listar cursos

Ver documentación completa en: http://localhost:3001/api/docs

## Recursos Adicionales

- 📚 [README.md](./README.md) - Documentación completa
- 🤖 [AGENTS.md](./AGENTS.md) - Guía para agentes de IA
- 📋 [docs/](./docs/) - Visión y metodología
- 📐 [specs/](./specs/) - Especificaciones técnicas

## Soporte

Para problemas o preguntas:
1. Consulta AGENTS.md para guías técnicas
2. Revisa los logs: `docker-compose logs -f`
3. Verifica las variables de entorno en archivos `.env`

---

**¡Bienvenido a Sailvex! 🎉**
