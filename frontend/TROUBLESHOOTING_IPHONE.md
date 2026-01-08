# Solución: iPhone no aparece en Xcode

## Pasos para solucionar:

### 1. Verificar conexión física
- ✅ Conecta el iPhone al Mac con un **cable USB** (no inalámbrico)
- ✅ Asegúrate de que el cable **transfiere datos** (no solo carga)
- ✅ Prueba con otro cable si es necesario

### 2. Desbloquear y confiar
- ✅ **Desbloquea tu iPhone** con Face ID/Touch ID o código
- ✅ Cuando conectes el cable, debería aparecer un mensaje: **"¿Confiar en este ordenador?"**
- ✅ Toca **"Confiar"** e introduce tu código del iPhone

### 3. Verificar en Finder
- Abre **Finder** en tu Mac
- En la barra lateral izquierda, debería aparecer tu **iPhone**
- Si aparece, significa que está conectado correctamente

### 4. Verificar en Xcode
- En Xcode, ve a **Window > Devices and Simulators** (o `Cmd + Shift + 2`)
- Deberías ver tu iPhone en la lista de la izquierda
- Si aparece pero dice "Unpaired", haz clic en **"Use for Development"**

### 5. Habilitar modo desarrollador (iOS 16+)
Si tienes iOS 16 o superior:
- Ve a **Ajustes > Privacidad y Seguridad**
- Desplázate hasta abajo y busca **"Modo Desarrollador"**
- Actívalo si está disponible
- Reinicia el iPhone

### 6. Verificar permisos de Xcode
- Ve a **Preferencias del Sistema > Privacidad y Seguridad**
- Asegúrate de que Xcode tenga permisos de acceso

### 7. Reiniciar servicios
```bash
# Cierra Xcode completamente
# Luego ejecuta:
sudo killall -9 com.apple.CoreSimulator.CoreSimulatorService
sudo killall -9 com.apple.AMPDevicesAgent
```

### 8. Verificar versión de Xcode
- Asegúrate de tener una versión **reciente de Xcode**
- Ve a **Xcode > About Xcode** para ver la versión
- Si es muy antigua, actualiza desde la App Store

### 9. Probar con otro dispositivo
- Si tienes otro iPhone/iPad, prueba conectarlo
- Esto ayuda a determinar si es problema del dispositivo o del Mac

### 10. Verificar en Terminal
Abre Terminal y ejecuta:
```bash
xcrun xctrace list devices
```
Deberías ver tu iPhone en la lista.

## Si nada funciona:

1. **Reinicia el iPhone** (mantén presionado botón de encendido + volumen)
2. **Reinicia el Mac**
3. **Actualiza iOS** a la última versión
4. **Actualiza macOS** a la última versión
5. **Reinstala Xcode** si es necesario

## Alternativa: Usar Simulador

Si no puedes conectar tu iPhone físico, puedes usar el simulador de iOS:
- En Xcode, en la barra superior, selecciona un **iPhone Simulator** (ej: "iPhone 15 Pro")
- Haz clic en Play (▶️)
- La app se ejecutará en el simulador

**Nota**: El simulador no puede probar NFC real, pero puedes probar el deep link escribiendo `bonu://tap?tapIntentId=TEST123` en Safari del simulador.

