# Cómo probar el flujo NFC con app instalada

## Opción 1: Probar en navegador (desarrollo)

1. **Abre la app en el navegador** (ej: `http://localhost:5173`)

2. **Simula el deep link** abriendo la consola del navegador y ejecuta:
   ```javascript
   // Simula que se abre bonu://tap?tapIntentId=TEST123
   window.location.href = '/tap?tapIntentId=TEST123';
   ```

3. O directamente navega a:
   ```
   http://localhost:5173/tap?tapIntentId=TEST123
   ```

## Opción 2: Probar con app móvil (iOS/Android)

### iOS (Simulador o dispositivo físico)

1. **Configurar el deep link en Xcode:**
   - Abre el proyecto iOS: `cd frontend && npm run cap:open:ios`
   - En Xcode, ve a `App` target → `Info` → `URL Types`
   - Añade un nuevo URL Type:
     - **Identifier**: `com.bonu.app`
     - **URL Schemes**: `bonu`
     - **Role**: `Editor`

2. **Probar el deep link:**
   - En el simulador/dispositivo, abre Safari
   - Escribe en la barra de direcciones: `bonu://tap?tapIntentId=TEST123`
   - Debería abrirse la app automáticamente

### Android (Emulador o dispositivo físico)

1. **El deep link se configura automáticamente** al hacer `cap sync`

2. **Probar el deep link:**
   - En el emulador/dispositivo, abre Chrome
   - Escribe en la barra de direcciones: `bonu://tap?tapIntentId=TEST123`
   - O usa ADB:
     ```bash
     adb shell am start -W -a android.intent.action.VIEW -d "bonu://tap?tapIntentId=TEST123" com.bonu.app
     ```

## Opción 3: Flujo completo (desde URL web)

1. **Abre la landing page** en el navegador:
   ```
   http://localhost:5175/tap?local=6951898fee519a5b20e6b596
   ```

2. **La página intentará abrir la app** con el deep link `bonu://tap?tapIntentId=XXX`

3. **Si la app está instalada**, se abrirá automáticamente

4. **Si no está instalada**, verás la página de fallback

## Notas

- En desarrollo, puedes usar `localhost` para probar
- En producción, la URL debe ser pública (ej: `https://bonu.app/tap?barId=XXX`)
- El `tapIntentId` debe ser válido (creado por el backend)
- El TapIntent expira después de 2 minutos

