# Guía para ejecutar la app en tu iPhone

## Pasos para ejecutar en tu iPhone:

### 1. Abrir Xcode
Xcode debería haberse abierto automáticamente. Si no, ejecuta:
```bash
cd frontend
npx cap open ios
```

### 2. Configurar tu cuenta de desarrollador en Xcode

1. En Xcode, selecciona el proyecto **App** en el navegador izquierdo
2. Selecciona el target **App** 
3. Ve a la pestaña **Signing & Capabilities**
4. Marca **"Automatically manage signing"**
5. Selecciona tu **Team** (tu cuenta de Apple Developer)
   - Si no tienes una cuenta, puedes usar tu Apple ID personal (gratis)

### 3. Conectar tu iPhone

1. Conecta tu iPhone al Mac con un cable USB
2. Desbloquea tu iPhone y confía en el ordenador si te lo pide
3. En Xcode, en la barra superior, selecciona tu iPhone como dispositivo de destino (junto al botón de Play)

### 4. Ejecutar la app

1. Haz clic en el botón **▶️ Play** (o presiona `Cmd + R`)
2. La primera vez, Xcode puede pedirte que confíes en el desarrollador en tu iPhone:
   - Ve a **Ajustes > General > Gestión de VPN y dispositivos**
   - Toca tu certificado de desarrollador
   - Toca **Confiar en [tu nombre]**

### 5. Probar el deep link NFC

Una vez que la app esté ejecutándose en tu iPhone:

1. Abre **Safari** en tu iPhone
2. Escribe en la barra de direcciones: `bonu://tap?tapIntentId=TEST123`
3. Debería abrirse automáticamente la app BONU y mostrar la pantalla de confirmación

### 6. Probar el flujo completo NFC

1. En tu Mac, abre el navegador y ve a:
   ```
   http://localhost:5175/tap?local=6951898fee519a5b20e6b596
   ```
   (Asegúrate de que el servidor del admin esté corriendo)

2. Esta página intentará abrir `bonu://tap?tapIntentId=XXX`
3. Si la app está instalada en tu iPhone, se abrirá automáticamente

## Notas importantes:

- **Primera vez**: La primera vez que ejecutes la app, puede tardar unos minutos en compilar
- **Certificado**: Si tienes problemas con el certificado, asegúrate de tener tu Apple ID configurado en Xcode
- **Deep links**: Los deep links solo funcionan cuando la app está instalada desde Xcode o TestFlight, no desde el navegador

## Troubleshooting:

- **Error de certificado**: Ve a Xcode > Preferences > Accounts y añade tu Apple ID
- **No se abre la app**: Asegúrate de que el Bundle Identifier sea único (`com.bonu.app`)
- **Deep link no funciona**: Verifica que el URL Scheme `bonu` esté configurado en Info.plist (ya está configurado)

