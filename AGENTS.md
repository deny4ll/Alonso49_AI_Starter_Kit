# Sailvex - Guía para Agentes de IA

Este documento contiene instrucciones específicas para agentes de IA que trabajen en este proyecto.

## Arquitectura del Proyecto

### Backend (NestJS)
- **Ubicación**: `/backend`
- **Puerto**: 3001
- **Estructura modular**: Cada feature tiene su propio módulo en `/backend/src/modules/`
- **Base de datos**: PostgreSQL con Prisma ORM
- **Autenticación**: JWT con PassportJS
- **Documentación**: Swagger automático en `/api/docs`

### Frontend (Next.js 14)
- **Ubicación**: `/frontend`
- **Puerto**: 3000
- **App Router**: Usar `/src/app` para rutas
- **Estilos**: TailwindCSS
- **Estado**: TanStack Query para servidor, Zustand para cliente
- **API Client**: Axios en `/src/lib/api.ts`

### Base de Datos
- **PostgreSQL 16** con extensión **pgvector**
- **ORM**: Prisma
- **Esquema**: `/backend/prisma/schema.prisma`
- **Migraciones**: Ejecutar `npx prisma migrate dev` después de cambios al schema

## Convenciones de Código

### Backend
1. **Módulos NestJS**: Cada feature debe tener:
   - `*.module.ts` - Configuración del módulo
   - `*.service.ts` - Lógica de negocio
   - `*.controller.ts` - Endpoints HTTP
   - `/dto` - Data Transfer Objects con validación

2. **DTOs**: Usar `class-validator` y `class-transformer`
   ```typescript
   import { IsString, IsEmail } from 'class-validator';
   import { ApiProperty } from '@nestjs/swagger';
   ```

3. **Prisma**: 
   - Soft delete: Usar campo `deletedAt`
   - Relaciones: Siempre incluir `include` o `select`
   - Índices: Agregar `@@index` para queries frecuentes

4. **Guards**: Usar `JwtAuthGuard` para rutas protegidas
   ```typescript
   @UseGuards(JwtAuthGuard)
   @ApiBearerAuth()
   ```

### Frontend
1. **Componentes**: 
   - Server Components por defecto
   - Client Components: agregar `'use client'` solo cuando sea necesario
   - Ubicación: `/src/components` para reutilizables

2. **Páginas**:
   - `/src/app/[ruta]/page.tsx` para rutas
   - `/src/app/[ruta]/layout.tsx` para layouts
   - Usar TypeScript siempre

3. **Estilos**: 
   - Usar clases de TailwindCSS
   - No CSS modules ni styled-components

4. **API Calls**:
   - Usar TanStack Query para fetching
   - Client en `/src/lib/api.ts`
   ```typescript
   import { useQuery } from '@tanstack/react-query';
   import { sessionsApi } from '@/lib/api';
   ```

## Flujos Principales

### 1. Agregar Nueva Entidad

**Backend**:
```bash
# 1. Agregar modelo en prisma/schema.prisma
# 2. Generar migración
cd backend
npx prisma migrate dev --name add_entity_name

# 3. Crear módulo
nest g module modules/entity-name
nest g service modules/entity-name
nest g controller modules/entity-name
```

**Frontend**:
```bash
# 1. Crear página en src/app/entity-name/page.tsx
# 2. Agregar API client en src/lib/api.ts
# 3. Crear types en src/types/entity.ts
```

### 2. Agregar Endpoint

1. Crear DTO en `*.dto.ts`
2. Agregar método en `*.service.ts`
3. Agregar ruta en `*.controller.ts`
4. Documentar con decoradores Swagger
5. Actualizar cliente API en frontend

### 3. Agregar Página

1. Crear archivo en `/frontend/src/app/[ruta]/page.tsx`
2. Agregar navegación si es necesario
3. Usar componentes existentes de `/components`
4. Conectar con API usando TanStack Query

## Testing

### Backend
```bash
cd backend
npm test                 # Unit tests
npm run test:e2e        # E2E tests
npm run test:cov        # Coverage
```

### Frontend
```bash
cd frontend
npm run build           # Verificar build
npm run lint            # Linting
```

## Variables de Entorno

### Backend (.env)
- `DATABASE_URL` - Conexión PostgreSQL
- `JWT_SECRET` - Secret para JWT (cambiar en producción)
- `JWT_EXPIRATION` - Expiración del token
- `PORT` - Puerto del servidor
- `NODE_ENV` - development | production

### Frontend (.env)
- `NEXT_PUBLIC_API_URL` - URL del backend API

## Comandos Útiles

### Desarrollo
```bash
./start.sh                    # Iniciar todo con Docker
docker-compose up -d          # Iniciar contenedores
docker-compose down           # Detener contenedores
docker-compose logs -f        # Ver logs
```

### Base de Datos
```bash
cd backend
npx prisma studio             # UI para ver datos
npx prisma migrate dev        # Nueva migración
npx prisma migrate reset      # Reset DB (desarrollo)
npx prisma generate           # Generar cliente
```

### Docker
```bash
docker-compose exec backend npm run prisma:migrate
docker-compose exec backend npm run start:dev
docker-compose exec postgres psql -U postgres -d alonso49
```

## Estructura de Roles (RBAC)

- **ATHLETE**: Subir videos, ver sesiones propias
- **COACH**: Revisar sesiones, dar feedback, gestionar equipo
- **ACADEMY**: Administrar equipos, crear cursos
- **ADMIN**: Acceso total

Usar decoradores personalizados para verificar roles:
```typescript
@Roles('COACH', 'ADMIN')
```

## Seguridad

1. **Nunca** commitear archivos `.env`
2. Usar `JWT_SECRET` fuerte en producción
3. Validar inputs con DTOs
4. Sanitizar outputs
5. Usar HTTPS en producción
6. Rate limiting configurado en producción

## Performance

1. **Prisma**: Usar `select` en lugar de `include` cuando sea posible
2. **Frontend**: Code splitting automático con Next.js
3. **Imágenes**: Usar `next/image` para optimización
4. **Caché**: TanStack Query maneja caché automáticamente

## Troubleshooting

### Error: Prisma Client not generated
```bash
cd backend
npx prisma generate
```

### Error: Database connection
```bash
docker-compose down
docker-compose up -d postgres
# Esperar 10 segundos
docker-compose up -d backend
```

### Error: Port already in use
```bash
# Cambiar puerto en docker-compose.yml o:
docker-compose down
lsof -ti:3000 | xargs kill -9  # Frontend
lsof -ti:3001 | xargs kill -9  # Backend
```

## Próximas Mejoras

- [ ] Integración con Cloudflare R2 para videos
- [ ] WebSockets para notificaciones en tiempo real
- [ ] Análisis de video con IA (OpenAI)
- [ ] Búsqueda semántica con pgvector
- [ ] PWA para uso offline
- [ ] Kubernetes deployment
- [ ] Terraform para infraestructura

## Notas Importantes

1. Este proyecto usa **App Router** de Next.js 14, no Pages Router
2. La base de datos requiere extensión **pgvector** para embeddings
3. Todos los endpoints requieren autenticación excepto `/auth/login` y `/auth/register`
4. Usar soft delete (`deletedAt`) para mantener auditoría
5. Los videos se almacenarán en Cloudflare R2 (futuro)

---

Para más información, consulta el README.md principal.
