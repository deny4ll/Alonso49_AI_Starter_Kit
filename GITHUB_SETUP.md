# 🚀 Subir a GitHub - Guía Paso a Paso

## ✅ Paso 1: El commit ya está hecho
```bash
✓ git commit completado (95 archivos, 5665 líneas)
```

## 📝 Paso 2: Crear el repositorio en GitHub

1. Ve a GitHub: https://github.com/new

2. Configura el repositorio:
   - **Nombre**: `Sailvex_AI_Starter_Kit` (o el que prefieras)
   - **Descripción**: `Plataforma de entrenamiento de alto rendimiento para vela olímpica clase 49er`
   - **Visibilidad**: Privado o Público (tú eliges)
   - ⚠️ **NO** marques ninguna opción (README, .gitignore, license)
   - El repositorio debe estar completamente vacío

3. Click en "Create repository"

## 🔗 Paso 3: Conectar y subir

Después de crear el repo en GitHub, ejecuta estos comandos:

### Si usas SSH (recomendado):
```bash
cd /Users/chris/Documents/Projects/chrisAI/Sailvex_AI_Starter_Kit

# Agregar el remote (cambia TU_USUARIO por tu username de GitHub)
git remote add origin git@github.com:TU_USUARIO/Sailvex_AI_Starter_Kit.git

# Renombrar la rama a main
git branch -M main

# Push inicial
git push -u origin main
```

### Si usas HTTPS:
```bash
cd /Users/chris/Documents/Projects/chrisAI/Sailvex_AI_Starter_Kit

# Agregar el remote (cambia TU_USUARIO por tu username de GitHub)
git remote add origin https://github.com/TU_USUARIO/Sailvex_AI_Starter_Kit.git

# Renombrar la rama a main
git branch -M main

# Push inicial
git push -u origin main
```

## ✨ Paso 4: Verificar

Ve a tu repositorio en GitHub y verifica que todos los archivos estén ahí.

---

## 🔑 Si no tienes SSH configurado

1. Genera una llave SSH:
```bash
ssh-keygen -t ed25519 -C "tu_email@example.com"
```

2. Agrega la llave a GitHub:
   - Copia la llave pública: `cat ~/.ssh/id_ed25519.pub`
   - Ve a GitHub → Settings → SSH and GPG keys → New SSH key
   - Pega la llave y guarda

3. Prueba la conexión:
```bash
ssh -T git@github.com
```

---

## 📋 Comandos rápidos de referencia

```bash
# Ver status
git status

# Ver remotes configurados
git remote -v

# Ver historial de commits
git log --oneline

# Push de cambios futuros
git add .
git commit -m "tu mensaje"
git push
```

---

**¡Listo! Tu código estará en GitHub** 🎉
