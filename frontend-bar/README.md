# BONU Local - App para Bares

App ligera y minimalista para que los bares puedan validar códigos de clientes y añadir sellos a sus tarjetas de fidelización.

## Características

- ✅ Login simple con email y contraseña
- ✅ Pantalla de validación de códigos de 5 dígitos
- ✅ Interfaz minimalista y rápida
- ✅ Sin dependencias pesadas (sin Capacitor, sin cámara, sin scanner)

## Instalación

```bash
cd frontend-bar
npm install
```

## Desarrollo

```bash
npm run dev
```

La app estará disponible en `http://localhost:5174`

## Build

```bash
npm run build
```

## Estructura

```
frontend-bar/
├── src/
│   ├── pages/
│   │   ├── Login.tsx          # Pantalla de login
│   │   └── ValidateCode.tsx   # Pantalla principal de validación
│   ├── services/
│   │   └── api.service.ts     # Servicio API (solo endpoints necesarios)
│   ├── store/
│   │   └── authStore.ts       # Store de autenticación
│   ├── App.tsx                # Componente principal
│   └── main.tsx               # Entry point
├── package.json
└── vite.config.ts
```

## Uso

1. El empleado del bar inicia sesión con su email y contraseña
2. El cliente muestra su código de 5 dígitos en la app BONU Cliente
3. El empleado ingresa el código en la app BONU Local
4. El sistema valida el código y añade automáticamente un sello a la tarjeta del cliente

## Variables de Entorno

Crea un archivo `.env` con:

```
VITE_API_URL=http://localhost:3000/api
```

## Notas

- Esta app es independiente de la app del cliente (`frontend`)
- Comparte el mismo backend que la app del cliente
- Diseñada para ser ligera y rápida, ideal para uso en tablets o dispositivos del bar

