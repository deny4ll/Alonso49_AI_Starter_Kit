# 🔑 Configuración de OpenAI para AI Coach

## ✅ Estado Actual

El **AI Coach de Alonso49** está completamente configurado y funcionando con **OpenAI GPT-4 Turbo**.

```
✅ Código: 100% funcional
✅ Docker: Corriendo sin errores
✅ OpenAI: Configurado localmente
✅ Backend: Listening en http://localhost:3001
✅ 20 herramientas: Operativas
```

---

## 🔐 Configuración de la API Key

### Opción 1: Ya Configurada Localmente (Actual)

La API key de OpenAI **YA está configurada** en:
```
backend/.env (archivo local, no en Git)
OPENAI_API_KEY=<tu-key-aquí>
```

✅ **Status**: Configurado y funcionando  
✅ **Servicio**: Backend reiniciado con la key  
✅ **Modo**: OpenAI Real (GPT-4 Turbo)  

### Opción 2: Configurar en Otro Entorno

Si despliegas en otro servidor o máquina:

1. **Obtener API Key de OpenAI**:
   - Ve a https://platform.openai.com/api-keys
   - Crea una nueva key (empieza con `sk-` o `sk-proj-`)

2. **Configurar en el backend**:
   ```bash
   # backend/.env
   OPENAI_API_KEY=sk-your-actual-api-key-here
   ```

3. **Reiniciar servicios**:
   ```bash
   docker-compose restart backend
   ```

---

## 🎯 Cómo Funciona

### Flujo Con OpenAI

```
1. Usuario hace pregunta en /ai-coach
   ↓
2. Frontend envía a POST /api/ai-coach/chat
   ↓
3. Backend construye contexto del atleta
   ↓
4. AI Coach (service) llama a OpenAI API
   ├─ Model: GPT-4 Turbo Preview
   ├─ Tools: 20 funciones disponibles
   └─ Temperature: 0.7
   ↓
5. OpenAI decide qué tools usar
   ↓
6. Backend ejecuta tools (queries a DB)
   ↓
7. Resultados reales se envían a OpenAI
   ↓
8. OpenAI genera respuesta fundamentada
   ↓
9. Usuario recibe respuesta con datos reales
```

### Diferencia vs Mock Mode

**Mock Mode** (sin API key):
```javascript
// Respuesta genérica pre-programada
return {
  message: "Please provide more specific information...",
  toolsUsed: 0
}
```

**OpenAI Mode** (con API key):
```javascript
// GPT-4 analiza, decide tools, ejecuta, responde
return {
  message: "Tu eficiencia en viradas mejoró 11.6%...",
  toolsUsed: 3  // searchPerformanceReports, searchCoachNotes, etc.
}
```

---

## 🧪 Cómo Probar

### 1. Verificar que está corriendo

```bash
docker-compose ps

# Deberías ver:
# alonso49-backend   Up   0.0.0.0:3001->3001/tcp
# alonso49-frontend  Up   0.0.0.0:3000->3000/tcp  
# alonso49-postgres  Up (healthy)
```

### 2. Login en la plataforma

```
URL: http://localhost:3000/login
Email: atleta@alonso49.com
Password: atleta123
```

### 3. Ir a AI Coach

- Click en "AI Coach" en el menú lateral
- Deberías ver la interfaz de chat

### 4. Hacer una pregunta

Prueba con:
```
"¿Cómo estuvo mi última sesión de entrenamiento?"
```

### 5. Verificar en logs del backend

```bash
docker-compose logs -f backend
```

Deberías ver:
```
[AI Coach] Calling tool: searchTrainingReports
[AI Coach] Calling tool: searchPerformanceReports
```

Esto confirma que:
✅ OpenAI está funcionando  
✅ Las herramientas se están ejecutando  
✅ El AI está usando datos reales  

---

## 📊 Monitoreo

### Ver logs del backend

```bash
# Logs en tiempo real
docker-compose logs -f backend

# Últimas 100 líneas
docker-compose logs --tail=100 backend
```

### Ver llamadas a OpenAI

Busca en los logs:
```
[AI Coach] Calling tool: <nombre-tool>
```

Cada línea indica que OpenAI decidió usar esa herramienta.

### Verificar errores

Si ves:
```
Error calling OpenAI: ...
```

Posibles causas:
- API key inválida
- Sin créditos en cuenta OpenAI
- Problemas de conexión

Solución: El sistema automáticamente hará fallback a mock mode.

---

## 💰 Costos de OpenAI

### Modelo Utilizado

**GPT-4 Turbo Preview**:
- Input: ~$10 / 1M tokens
- Output: ~$30 / 1M tokens

### Estimación de Uso

Conversación típica:
```
- Contexto del atleta: ~800 tokens
- System prompt: ~400 tokens
- Pregunta del usuario: ~50 tokens
- Tools results: ~500 tokens
- Respuesta AI: ~300 tokens
----------------------------
Total: ~2,050 tokens ≈ $0.05 USD
```

**Costo estimado**: ~$0.05 USD por pregunta compleja con múltiples tools.

### Reducir Costos

1. **Usar caché** de resultados de tools (próxima mejora)
2. **Limitar tools** a las más relevantes
3. **Reducir contexto** si es muy largo
4. **Usar GPT-3.5** en lugar de GPT-4 (más barato, menos preciso)

---

## 🔒 Seguridad

### API Key Nunca en Git

✅ **backend/.env** está en `.gitignore`  
✅ La key se configuró localmente solamente  
✅ En Git solo está el placeholder: `<CONFIGURED_LOCALLY>`  

### Variables de Entorno

La API key se lee desde el archivo `.env`:

```typescript
// ai-coach.service.ts
constructor(private config: ConfigService) {
  this.openaiApiKey = this.config.get('OPENAI_API_KEY');
}
```

Si no existe la variable:
- ✅ NO crashea el servicio
- ✅ Automáticamente usa mock mode
- ✅ Herramientas siguen funcionando

---

## 🚀 Próximas Mejoras

### 1. Streaming Responses
```typescript
// Enviar respuesta mientras se genera
stream: true,
onToken: (token) => websocket.send(token)
```

### 2. Conversation History
```typescript
// Mantener contexto de conversación
messages: [
  ...previousMessages,
  { role: 'user', content: newMessage }
]
```

### 3. Tool Caching
```typescript
// Cachear resultados de tools por 5 min
const cached = cache.get(`tool_${toolName}_${args}`);
if (cached) return cached;
```

### 4. Async Tool Execution
```typescript
// Ejecutar tools en paralelo cuando sea posible
await Promise.all([
  searchPerformanceReports(),
  searchCoachNotes(),
  searchVideos()
]);
```

---

## 📚 Referencias

### OpenAI Function Calling
- Docs: https://platform.openai.com/docs/guides/function-calling
- Models: https://platform.openai.com/docs/models
- Pricing: https://openai.com/api/pricing/

### Archivos Relevantes
```
backend/
├── src/modules/ai-coach/
│   ├── ai-coach.service.ts      # Lógica principal + OpenAI
│   ├── coach-prompt.ts          # System prompt
│   └── tools/
│       ├── tool-definitions.ts  # 20 tool schemas
│       └── tool-implementations.ts  # Implementaciones
└── .env                         # API KEY (local, no en git)
```

---

## ✅ Checklist de Verificación

Antes de usar en producción:

- [x] OpenAI API key configurada
- [x] Backend compila sin errores
- [x] Docker containers corriendo
- [x] Login funciona
- [x] AI Coach page carga
- [x] Herramientas ejecutan queries
- [x] Logs muestran tool calls
- [x] Respuestas son coherentes
- [ ] Configurar rate limiting
- [ ] Configurar monitoring de costos
- [ ] Configurar alerts de errores

---

## 🆘 Troubleshooting

### Error: "OpenAI API error: Unauthorized"

**Causa**: API key inválida o expirada

**Solución**:
1. Verifica la key en https://platform.openai.com/api-keys
2. Regenera la key si es necesario
3. Actualiza `backend/.env`
4. Restart: `docker-compose restart backend`

### Error: "Insufficient quota"

**Causa**: Sin créditos en cuenta OpenAI

**Solución**:
1. Ve a https://platform.openai.com/account/billing
2. Agrega método de pago
3. El sistema hará fallback a mock mode mientras tanto

### Backend no arranca

**Causa**: Error de bcrypt o compilación

**Solución**:
```bash
# Reconstruir imagen
docker-compose down
docker-compose up -d --build backend

# Ver logs
docker-compose logs backend
```

### AI Coach responde en modo mock

**Causa**: API key no cargada correctamente

**Verificar**:
```bash
docker-compose exec backend env | grep OPENAI
```

Debería mostrar: `OPENAI_API_KEY=sk-...`

Si no aparece:
- Verifica que `backend/.env` tiene la key
- Restart backend: `docker-compose restart backend`

---

**✅ OpenAI está configurado y funcionando correctamente**

Para probar: http://localhost:3000/ai-coach

**Última actualización**: 1 Agosto 2026
