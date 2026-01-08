# Sistema MVP de Check-in + Puntos - BONU

## Resumen del Cambio

BONU ha evolucionado de un sistema de tarjetas de sellos a un **sistema de check-in + puntos** enfocado en bares.

## Modelos de Datos Creados

### 1. CheckIn
- Registra cada check-in de un cliente en un bar
- Campos: `userId`, `businessId`, `points`, `method` (nfc/code/manual), `bonusReason`, `customerAlias`
- Rate limiting: máximo 1 check-in cada 5 minutos por bar

### 2. UserPoints
- Mantiene puntos acumulados por cliente en cada bar
- Campos: `userId`, `businessId`, `totalPoints`, `checkInCount`, `lastCheckIn`
- Índice único para evitar duplicados

### 3. Reward
- Recompensas configurables por puntos
- Campos: `businessId`, `name`, `description`, `pointsRequired`, `active`, `maxRedemptions`
- Cada bar define sus propias recompensas

### 4. BonusHours
- Horarios con puntos extra
- Campos: `businessId`, `daysOfWeek`, `startTime`, `endTime`, `bonusPoints`, `active`
- Permite configurar días/horas donde los check-ins dan más puntos

### 5. RewardRedemption
- Registra canjes de recompensas
- Campos: `userId`, `businessId`, `rewardId`, `pointsUsed`, `customerAlias`
- Respeta privacidad: solo almacena alias

## Endpoints API

### Check-in
- `POST /api/checkin` - Registrar check-in (NFC o código)
- `POST /api/checkin/manual` - Añadir puntos manualmente (bar)
- `GET /api/checkin/history` - Historial de check-ins del usuario

### Puntos
- `GET /api/points` - Obtener puntos del usuario (todos los bares o uno específico)

### Recompensas
- `GET /api/rewards?businessId=XXX` - Obtener recompensas disponibles
- `POST /api/rewards/redeem` - Canjear una recompensa

### Estadísticas del Bar
- `GET /api/business/:id/stats` - Estadísticas del bar (solo dueños)
  - Total de clientes
  - Total de check-ins
  - Check-ins recientes (30 días)
  - Top clientes (por puntos, solo alias)
  - Check-ins por día (últimos 7 días)

### NFC (Adaptado)
- `GET /api/tap?barId=XXX` - Crear TapIntent (público)
- `GET /api/tap/:tapIntentId` - Obtener TapIntent (público)
- `POST /api/stamps/from-tap` - Validar TapIntent y hacer check-in (ahora hace check-in, no añade sellos)

## Privacidad

- El bar **NO** ve datos personales sensibles
- Solo se almacena `customerAlias` (primer nombre del cliente)
- Las estadísticas muestran solo alias, no emails ni IDs reales
- El bar no puede escribir directamente a clientes individuales

## Próximos Pasos (Frontend)

1. Simplificar pantalla de check-in (eliminar tarjetas de sellos)
2. Crear pantalla de puntos acumulados
3. Crear pantalla de recompensas disponibles
4. Crear pantalla de canje de recompensas
5. Adaptar pantalla NFC para hacer check-in en lugar de añadir sellos
6. Panel del bar: configuración de horarios bonus y recompensas
7. Panel del bar: estadísticas básicas

## Notas

- Este es un MVP, no el producto final
- Enfocado en simplicidad y rapidez
- Solo para bares (no otros tipos de negocios)
- Sin gamificación compleja ni social

