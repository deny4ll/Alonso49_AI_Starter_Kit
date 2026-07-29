# 🔧 Guía de Solución de Problemas

## Problemas Comunes y Soluciones

### 1. Error al registrarse / Error de Prisma

**Síntoma**: Error al intentar registrar un usuario en http://localhost:3000/register

**Causa**: Las tablas de la base de datos no están creadas o el backend no puede conectarse a PostgreSQL.

**Solución**:
```bash
# Verificar que todos los contenedores estén corriendo
docker-compose ps

# Si el backend no está corriendo, reiniciar
docker-compose restart backend

# Verificar logs del backend
docker-compose logs backend --tail 50

# Recrear las tablas (si es necesario)
docker exec alonso49-backend npx prisma db push --accept-data-loss
```

### 2. Error "libssl.so.1.1: No such file or directory"

**Síntoma**: El backend no inicia y muestra error relacionado con OpenSSL.

**Causa**: Imagen Docker de Alpine sin las dependencias necesarias.

**Solución**: Ya está resuelto en el Dockerfile actual. Si persiste:
```bash
# Reconstruir imágenes
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### 3. Puerto en uso

**Síntoma**: Error "address already in use" al iniciar los contenedores.

**Solución**:
```bash
# Ver qué procesos están usando los puertos
lsof -ti:3000  # Frontend
lsof -ti:3001  # Backend
lsof -ti:5432  # PostgreSQL

# Detener los contenedores actuales
docker-compose down

# Si hay procesos locales usando los puertos, matalos:
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9
lsof -ti:5432 | xargs kill -9

# Reiniciar
docker-compose up -d
```

### 4. Frontend no carga / Página en blanco

**Síntoma**: http://localhost:3000 muestra una página en blanco o error.

**Solución**:
```bash
# Ver logs del frontend
docker-compose logs frontend --tail 50

# Reiniciar frontend
docker-compose restart frontend

# Si persiste, reconstruir:
docker-compose down
docker-compose build frontend
docker-compose up -d
```

### 5. Error de conexión entre frontend y backend

**Síntoma**: El frontend no puede comunicarse con el backend.

**Solución**:
```bash
# Verificar que el backend esté corriendo
curl http://localhost:3001/api/auth/login

# Verificar variable de entorno del frontend
docker exec alonso49-frontend printenv | grep API

# Si está mal configurada, editar frontend/.env:
# NEXT_PUBLIC_API_URL=http://localhost:3001/api

# Reiniciar frontend
docker-compose restart frontend
```

### 6. Base de datos vacía después de reiniciar

**Síntoma**: Los datos desaparecen al reiniciar los contenedores.

**Causa**: Los volúmenes de Docker fueron eliminados.

**Solución**:
```bash
# NUNCA usar este comando si quieres mantener los datos:
# docker-compose down -v  ❌

# Para detener SIN borrar datos:
docker-compose down  ✅

# Para reiniciar manteniendo datos:
docker-compose restart  ✅
```

### 7. Error "spawn ps ENOENT"

**Síntoma**: El backend se crashea con error relacionado con el comando `ps`.

**Causa**: Imagen Docker sin procps instalado.

**Solución**: Ya está resuelto en el Dockerfile actual (incluye `procps`).

### 8. Migraciones de Prisma no se aplican

**Síntoma**: Tablas no existen o están desactualizadas.

**Solución**:
```bash
# Aplicar migraciones manualmente
docker exec alonso49-backend npx prisma db push

# Ver estado de migraciones
docker exec alonso49-backend npx prisma migrate status

# Resetear base de datos (⚠️ BORRA TODOS LOS DATOS)
docker exec alonso49-backend npx prisma migrate reset
```

### 9. Error de permisos en archivos

**Síntoma**: No se pueden editar archivos o hay errores de permisos.

**Solución**:
```bash
# En Mac/Linux, cambiar owner de los archivos
sudo chown -R $USER:$USER .

# Dar permisos de ejecución al script start.sh
chmod +x start.sh
```

### 10. Prisma Studio no inicia

**Síntoma**: Error al ejecutar `npx prisma studio`.

**Solución**:
```bash
# Ejecutar dentro del contenedor
docker exec -it alonso49-backend npx prisma studio

# O desde tu máquina local:
cd backend
npm install
npx prisma studio
```

## Comandos de Diagnóstico

### Ver estado de todos los servicios
```bash
docker-compose ps
```

### Ver logs en tiempo real
```bash
docker-compose logs -f

# Solo backend
docker-compose logs -f backend

# Solo frontend
docker-compose logs -f frontend

# Solo postgres
docker-compose logs -f postgres
```

### Verificar conectividad a la base de datos
```bash
docker exec alonso49-postgres psql -U postgres -d alonso49 -c "SELECT 1;"
```

### Ver tablas en la base de datos
```bash
docker exec alonso49-postgres psql -U postgres -d alonso49 -c "\dt"
```

### Verificar que el backend responde
```bash
curl http://localhost:3001/api/auth/login
```

### Entrar al contenedor para debugging
```bash
# Backend
docker exec -it alonso49-backend sh

# Frontend
docker exec -it alonso49-frontend sh

# PostgreSQL
docker exec -it alonso49-postgres psql -U postgres -d alonso49
```

## Reset Completo (Última opción)

Si nada funciona, puedes hacer un reset completo:

```bash
# ⚠️ ESTO BORRARÁ TODOS LOS DATOS

# 1. Detener y eliminar todo
docker-compose down -v

# 2. Eliminar imágenes
docker rmi alonso49_ai_starter_kit-backend alonso49_ai_starter_kit-frontend

# 3. Limpiar sistema Docker (opcional)
docker system prune -a

# 4. Reconstruir todo
docker-compose build --no-cache

# 5. Iniciar
docker-compose up -d

# 6. Esperar 10 segundos
sleep 10

# 7. Crear tablas
docker exec alonso49-backend npx prisma db push --accept-data-loss
```

## Obtener Ayuda

Si los problemas persisten:

1. Revisa los logs completos: `docker-compose logs > logs.txt`
2. Verifica la versión de Docker: `docker --version`
3. Verifica Docker Compose: `docker-compose --version`
4. Asegúrate de tener recursos suficientes en Docker (RAM, CPU)
5. Consulta el README.md y AGENTS.md para más información

## Contacto y Recursos

- 📚 [README.md](./README.md) - Documentación completa
- 🚀 [QUICK_START.md](./QUICK_START.md) - Guía de inicio rápido
- 🤖 [AGENTS.md](./AGENTS.md) - Guía técnica para desarrollo
