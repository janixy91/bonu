# Configuración del Servicio de Email

Para que el sistema pueda enviar emails (por ejemplo, cuando se crea un negocio y se genera una contraseña temporal), necesitas configurar las credenciales de email.

## Opción 1: Gmail (Recomendado para desarrollo)

### Paso 1: Habilitar autenticación de dos factores
1. Ve a tu cuenta de Google: https://myaccount.google.com/
2. Ve a "Seguridad"
3. Habilita "Verificación en dos pasos"

### Paso 2: Generar una contraseña de aplicación
1. Ve a: https://myaccount.google.com/apppasswords
2. Selecciona "Correo" y "Otro (nombre personalizado)"
3. Escribe "BONU Backend" y haz clic en "Generar"
4. Copia la contraseña de 16 caracteres que se genera

### Paso 3: Configurar variables de entorno
1. Crea un archivo `.env` en la carpeta `backend/` (copia de `.env.example`)
2. Añade las siguientes variables:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu-email@gmail.com
EMAIL_PASS=la-contraseña-de-16-caracteres-generada
```

### Paso 4: Reiniciar el servidor
Reinicia el servidor backend para que cargue las nuevas variables de entorno.

## Opción 2: Otros proveedores de email

### Outlook/Hotmail
```env
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_USER=tu-email@outlook.com
EMAIL_PASS=tu-contraseña
```

### SendGrid
```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASS=tu-api-key-de-sendgrid
```

### Mailtrap (Para pruebas)
```env
EMAIL_HOST=smtp.mailtrap.io
EMAIL_PORT=2525
EMAIL_USER=tu-usuario-de-mailtrap
EMAIL_PASS=tu-contraseña-de-mailtrap
```

## Verificar que funciona

Después de configurar, cuando crees un negocio desde el panel de admin, deberías ver en la consola del servidor:
- `✅ Email sent successfully to [email]` si funciona correctamente
- `📧 Email service not configured...` si falta configuración
- `❌ Email send error...` si hay un error de autenticación

## Notas importantes

- **Nunca subas el archivo `.env` a Git** (ya debería estar en `.gitignore`)
- Para producción, usa variables de entorno del servidor/hosting
- Gmail tiene límites de envío: máximo 500 emails por día para cuentas gratuitas
- Para producción, considera usar servicios profesionales como SendGrid, Mailgun, o AWS SES

