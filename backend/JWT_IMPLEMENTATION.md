# Implementación JWT Simplificada para MVP

## Resumen

Sistema de autenticación JWT simplificado diseñado para MVP con enfoque en UX y simplicidad.

**Objetivo principal**: Que el usuario no tenga que hacer login frecuentemente.

## Características

### 1. JWT Largo (UX First)
- **Un único JWT** (sin refresh tokens)
- **Expiración larga**: 90 días por defecto (`JWT_EXPIRES_IN=90d`)
- No fuerza logout frecuente

### 2. Payload del JWT

```javascript
{
  userId: string,      // ID del usuario
  role: string,        // "customer" | "business_owner" | "admin"
  barId: string | null, // ID del negocio si es business_owner
  deviceId?: string,   // UUID del dispositivo (opcional, solo para tracking)
  iat: number,         // Issued at (automático)
  exp: number          // Expiration (automático)
}
```

### 3. deviceId (Opcional)

- Se puede enviar en login/register para tracking
- Se incluye en el payload del JWT si se proporciona
- **NO se valida** en cada request (solo tracking)
- Opcional: el cliente puede enviarlo o no

### 4. Middleware de Autenticación

El middleware `authenticateToken` valida:

1. ✅ Token JWT válido
2. ✅ Usuario existe y está activo
3. ✅ Inyecta `req.user` con información completa

**Simple y rápido** - solo 2 validaciones básicas.

### 5. Logout

- Logout es solo del lado del cliente
- El token sigue siendo válido hasta que expire (90 días)
- El cliente simplemente elimina el token del almacenamiento

## Estructura de Archivos

```
backend/src/
├── services/
│   └── token.service.js          # Generar y verificar tokens
├── middleware/
│   └── auth.middleware.js        # Middleware de autenticación
├── controllers/
│   └── auth.controller.js        # Login, register, logout
└── routes/
    └── auth.routes.js            # Rutas de autenticación
```

## Variables de Entorno

```env
JWT_SECRET=<secreto-seguro-64-caracteres-minimo>
JWT_EXPIRES_IN=90d
```

## Uso en el Cliente

### Login

```javascript
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123',
    deviceId: 'uuid-opcional' // Opcional, solo para tracking
  })
});

const { token, user } = await response.json();

// Guardar token
localStorage.setItem('token', token);
```

### Requests Autenticadas

```javascript
const token = localStorage.getItem('token');

const response = await fetch('/api/protected-endpoint', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### Logout

```javascript
// Simplemente eliminar el token del cliente
localStorage.removeItem('token');
// Redirigir a login si es necesario
window.location.href = '/login';
```

## Ventajas de este Sistema

✅ **Simple**: Solo JWT básico, sin complejidad innecesaria  
✅ **UX mejorada**: Usuario no tiene que hacer login frecuentemente  
✅ **Rápido**: Middleware hace solo 2 validaciones  
✅ **Sin overhead**: No consultas extra a BD en cada request  
✅ **Escalable**: Fácil de entender y mantener  

## Notas de Seguridad

⚠️ **Este sistema está diseñado para MVP, no para máxima seguridad bancaria**

- Tokens largos (90 días) mejoran UX pero reducen seguridad
- No hay revocación inmediata de tokens (solo expiración)
- Para producción avanzada, considerar:
  - Tokens más cortos con refresh tokens
  - Sistema de revocación si es necesario
  - Rate limiting más estricto
