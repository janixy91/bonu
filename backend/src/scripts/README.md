# Scripts de Seed

## Generar Códigos de Ejemplo

Este script genera códigos de ejemplo para todos los negocios existentes en la base de datos.

### Uso

```bash
npm run seed:codes
```

O directamente:

```bash
node src/scripts/seedCodes.js
```

### Funcionamiento

- Genera 5 códigos únicos por cada negocio existente
- Cada código tiene una fecha de expiración de 30 días desde la fecha de creación
- Los códigos tienen diferentes nombres de beneficios (rotando entre varias opciones)
- Los códigos se generan con longitud aleatoria entre 6-10 caracteres alfanuméricos

### Requisitos Previos

- Debe haber al menos un negocio (Business) creado en la base de datos
- La base de datos debe estar configurada y accesible

### Nota

Por defecto, el script NO elimina los códigos existentes. Si deseas limpiar los códigos antes de generar nuevos, descomenta la línea en el script:

```javascript
// await Code.deleteMany({});
```

