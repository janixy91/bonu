# BONU - Sistema de Tarjetas de Fidelización Digital

BONU es una aplicación móvil completa para gestionar tarjetas de fidelización digital con códigos QR. Permite a los usuarios acumular sellos en diferentes comercios y canjear recompensas cuando completan sus tarjetas.

## 🏗️ Estructura del Proyecto

```
bonu-project/
├── backend/          # API Node.js + Express + MongoDB
│   ├── src/
│   │   ├── models/       # Modelos Mongoose
│   │   ├── controllers/  # Controladores de rutas
│   │   ├── routes/       # Definición de rutas
│   │   ├── services/     # Servicios (email, QR)
│   │   ├── middleware/   # Middleware de autenticación
│   │   └── utils/        # Utilidades (JWT, validación)
│   └── package.json
│
└── frontend/         # App React + Ionic + TypeScript
    ├── src/
    │   ├── components/   # Componentes reutilizables
    │   ├── pages/        # Pantallas de la app
    │   ├── services/     # Servicios API
    │   ├── store/        # Estado global (Zustand)
    │   └── utils/        # Utilidades
    └── package.json
```

## 🚀 Tecnologías

### Backend
- **Node.js** + **Express** - Servidor API REST
- **MongoDB** + **Mongoose** - Base de datos
- **JWT** - Autenticación (access + refresh tokens)
- **bcrypt** - Hash de contraseñas
- **Zod** - Validación de datos
- **QRCode** - Generación de códigos QR
- **Nodemailer** - Envío de emails (opcional)

### Frontend
- **React** + **TypeScript** - Framework base
- **Ionic Framework** - UI components móvil
- **Capacitor** - Builds nativos iOS/Android
- **Zustand** - Gestión de estado
- **React Router** - Navegación
- **Vite** - Build tool

## 📋 Requisitos Previos

- Node.js 18+ y npm
- MongoDB (local o MongoDB Atlas)
- Para builds móviles: Xcode (iOS) y Android Studio (Android)

## 🔧 Instalación y Configuración

### Backend

1. **Navegar al directorio del backend:**
```bash
cd bonu-project/backend
```

2. **Instalar dependencias:**
```bash
npm install
```

3. **Configurar variables de entorno:**
```bash
cp .env.example .env
```

Edita el archivo `.env` con tus configuraciones:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/bonu
JWT_SECRET=tu-clave-secreta-super-segura
JWT_REFRESH_SECRET=tu-clave-refresh-secreta
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Email (opcional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu-email@gmail.com
EMAIL_PASS=tu-contraseña-de-aplicación
```

4. **Asegúrate de que MongoDB esté corriendo:**
```bash
# Si usas MongoDB local
mongod

# O usa MongoDB Atlas y actualiza MONGODB_URI en .env
```

5. **Iniciar el servidor:**
```bash
# Modo desarrollo (con nodemon)
npm run dev

# Modo producción
npm start
```

El servidor estará disponible en `http://localhost:3000`

### Frontend

1. **Navegar al directorio del frontend:**
```bash
cd bonu-project/frontend
```

2. **Instalar dependencias:**
```bash
npm install
```

3. **Configurar variables de entorno:**
```bash
cp .env.example .env
```

Edita `.env` si necesitas cambiar la URL del API:
```env
VITE_API_URL=http://localhost:3000/api
```

4. **Iniciar el servidor de desarrollo:**
```bash
npm run dev
```

La app estará disponible en `http://localhost:5173`

## 📱 Builds Móviles con Capacitor

### iOS

1. **Añadir plataforma iOS:**
```bash
npm run cap:add:ios
```

2. **Sincronizar archivos:**
```bash
npm run cap:sync
```

3. **Abrir en Xcode:**
```bash
npm run cap:open:ios
```

4. **En Xcode:**
   - Selecciona tu dispositivo o simulador
   - Haz clic en "Run" para compilar y ejecutar

### Android

1. **Añadir plataforma Android:**
```bash
npm run cap:add:android
```

2. **Sincronizar archivos:**
```bash
npm run cap:sync
```

3. **Abrir en Android Studio:**
```bash
npm run cap:open:android
```

4. **En Android Studio:**
   - Espera a que Gradle sincronice
   - Selecciona tu dispositivo o emulador
   - Haz clic en "Run" para compilar y ejecutar

### Notas importantes para builds:

- **Antes de cada build**, ejecuta:
```bash
npm run build
npm run cap:sync
```

- Los permisos de cámara** están configurados en `capacitor.config.ts`

## 🎨 Características

### Usuarios
- ✅ Registro y login con email + contraseña
- ✅ Visualización de tarjetas de fidelización
- ✅ Ver progreso de sellos acumulados
- ✅ Escanear QR para añadir sellos
- ✅ Canjear recompensas cuando completan la tarjeta
- ✅ Ver historial de canjes
- ✅ Perfil de usuario

### Comercios
- ✅ Registro de comercios (requiere autenticación)
- ✅ Cada comercio tiene su tarjeta BONU configurable
- ✅ Generación de QR único por comercio
- ✅ Gestión de sellos y recompensas

## 📡 Endpoints de la API

### Autenticación
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refrescar access token
- `GET /api/auth/me` - Obtener usuario actual

### Comercios
- `POST /api/business` - Crear comercio (requiere auth)
- `GET /api/business` - Listar comercios
- `GET /api/business/:id` - Obtener comercio
- `PATCH /api/business/:id` - Actualizar comercio (requiere auth)
- `DELETE /api/business/:id` - Eliminar comercio (requiere auth)
- `GET /api/business/:id/qr` - Generar QR del comercio

### Tarjetas
- `POST /api/cards` - Crear tarjeta para un comercio (requiere auth)
- `GET /api/cards/:userId` - Obtener tarjetas del usuario (requiere auth)
- `GET /api/cards/card/:cardId` - Obtener tarjeta específica (requiere auth)
- `PATCH /api/cards/:cardId/stamp` - Añadir sello (requiere auth)
- `POST /api/cards/:cardId/redeem` - Canjear recompensa (requiere auth)

### Historial
- `GET /api/history/:userId` - Obtener historial del usuario (requiere auth)

## 🗄️ Modelos de Base de Datos

### User
- `email` (String, único, requerido)
- `password` (String, hash, requerido)
- `name` (String, requerido)
- `createdAt` (Date, automático)

### Business
- `name` (String, requerido)
- `description` (String, opcional)
- `logoUrl` (String, opcional)
- `totalStamps` (Number, default: 10)
- `rewardText` (String, requerido)
- `ownerId` (ObjectId, referencia a User)
- `createdAt` (Date, automático)

### Card
- `userId` (ObjectId, referencia a User)
- `businessId` (ObjectId, referencia a Business)
- `currentStamps` (Number, default: 0)
- `redeemedRewards` (Array de Date)
- `createdAt` (Date, automático)
- Índice único en `userId` + `businessId`

### StampHistory
- `userId` (ObjectId, referencia a User)
- `cardId` (ObjectId, referencia a Card)
- `businessId` (ObjectId, referencia a Business)
- `action` (String, enum: 'stamp' | 'redeem')
- `createdAt` (Date, automático)

## 🎨 Diseño

La app utiliza una paleta de colores basada en **marrón y verde**:
- **Primario**: `#8B6F47` (Marrón)
- **Secundario**: `#6B8E5A` (Verde)
- **Terciario**: `#A8C090` (Verde claro)

Diseño limpio, moderno y minimalista usando componentes de Ionic.

## 🧪 Pruebas

### Probar el Backend

1. **Registrar un usuario:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456","name":"Test User"}'
```

2. **Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456"}'
```

3. **Crear un comercio (usa el accessToken del login):**
```bash
curl -X POST http://localhost:3000/api/business \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "name":"Mi Comercio",
    "description":"Descripción del comercio",
    "totalStamps":10,
    "rewardText":"Café gratis"
  }'
```

## 📝 Notas de Desarrollo

### Escaneo de QR

El componente `Scanner.tsx` actualmente usa una implementación simplificada. Para producción, deberías integrar una librería de escaneo QR real como:
- `@capacitor/barcode-scanner` (ya incluido en package.json)
- O una librería JavaScript como `html5-qrcode`

### Mejoras Futuras

- [ ] Integrar escaneo QR real con `@capacitor/barcode-scanner`
- [ ] Notificaciones push cuando se añaden sellos
- [ ] Panel de administración para comercios
- [ ] Estadísticas y analytics
- [ ] Compartir tarjetas con otros usuarios
- [ ] Modo offline con sincronización
- [ ] Tests unitarios y de integración

## 📄 Licencia

Este proyecto es un MVP funcional creado como base para desarrollo futuro.

## 🤝 Contribuciones

Este es un proyecto base. Siéntete libre de extenderlo y mejorarlo según tus necesidades.

---

**¡Disfruta construyendo con BONU! 🎉**

