# BONU Admin - Panel de Administración

Panel de administración para gestionar negocios y configuraciones del sistema BONU.

## Características

### Para Administradores:
- ✅ Ver lista de todos los negocios registrados
- ✅ Registrar nuevos negocios
- ✅ Ver detalles de negocios
- ✅ Eliminar negocios

### Para Dueños de Negocios:
- ✅ Ver configuración de su negocio
- ✅ Editar nombre, descripción, logo
- ✅ Configurar número de sellos necesarios
- ✅ Configurar texto de recompensa

## Instalación

```bash
cd frontend-admin
npm install
```

## Desarrollo

```bash
npm run dev
```

La app estará disponible en `http://localhost:5175`

## Variables de Entorno

Crea un archivo `.env` con:

```
VITE_API_URL=http://localhost:3000/api
```

## Roles

- **admin**: Acceso completo al panel, puede gestionar todos los negocios
- **business_owner**: Solo puede ver y editar su propio negocio

## Uso

1. Inicia sesión con credenciales de admin o business_owner
2. Según tu rol, verás:
   - **Admin**: Dashboard con lista de negocios y opción de crear nuevos
   - **Business Owner**: Panel de configuración de tu negocio

