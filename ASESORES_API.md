# Integración de Asesores con API

## Descripción

La página principal (`principal.html`) ahora carga dinámicamente la sección "Asesores populares" desde la API REST.

## Endpoints Utilizados

### GET `/api/usuarios/asesores`

Obtiene todos los asesores ordenados por calificación y número de sesiones.

**Ejemplo de respuesta:**

```json
[
  {
    "id_usuario": 1,
    "nombre_completo": "Juan Pérez García",
    "nombre_carrera": "Ingeniería en Computación",
    "numero_sesiones": 48,
    "puntuacion_promedio": 4.8,
    "descripcion": "Especialista en estructuras de datos...",
    "correo_contacto": "juan.perez@utleon.edu.mx",
    "disponibilidades": [
      {
        "id_disponibilidad": 1,
        "fecha_inicio": "2025-11-14T10:00:00.000Z",
        "fecha_fin": "2025-11-14T12:00:00.000Z",
        "modalidad": "virtual",
        "tipo_sesion": "individual",
        "nombre_tema": "Estructuras de datos",
        "nombre_area": "Programación",
        "precio": 100.0,
        "capacidad": 1,
        "es_disponible": 1,
        "inscritos": 0
      }
    ]
  }
]
```

## Funcionalidad Implementada

### 1. Carga Dinámica de Asesores

- Al cargar la página, se hace una petición `fetch` a la API
- Se muestran los 5 mejores asesores (ordenados por calificación)
- Las imágenes se reutilizan del directorio `imagenes/` (adviser1.jpg - adviser5.jpg)

### 2. Formateo de Datos

- **Nombre**: Se muestra nombre y apellido solamente
- **Carrera**: Se abrevia "Ingeniería" → "Ing." y "Licenciatura" → "Lic."
- **Sesiones**: Se muestra en rangos (10+, 50+, 100+)
- **Calificación**: Se generan estrellas dinámicamente basadas en la puntuación
- **Disponibilidad**: Se calcula automáticamente (Hoy, Mañana, o días de la semana)

### 3. Manejo de Errores

- Si la API no responde, se muestra un mensaje de error
- Si no hay asesores, se muestra un mensaje informativo
- Errores se registran en la consola para debugging

## Archivos Modificados

### `principal.html`

- Se limpiaron las cards hardcodeadas
- Se dejó un mensaje de "Cargando..." mientras se obtienen los datos

### `principal.js`

- Se agregó función `cargarAsesoresPopulares()` para hacer fetch a la API
- Se agregó función `crearAsesorCard()` para generar el HTML de cada card
- Se agregó función `formatDisponibilidad()` para calcular días disponibles
- Se agregó función `generarEstrellas()` para crear el rating visual
- Se agregó evento `DOMContentLoaded` para cargar automáticamente

### `services/asesorService.js` (Nuevo)

- Servicio reutilizable con funciones para:
  - `obtenerAsesores()`: GET todos los asesores
  - `obtenerAsesorPorId(id)`: GET un asesor específico
  - `generarAsesoresDummy()`: POST crear datos de prueba

## Cómo Probar

### 1. Iniciar el servidor API

```bash
cd api
npm install
npm start
```

### 2. Generar datos dummy (si no hay asesores)

```bash
# Usando curl
curl -X POST http://localhost:3000/api/usuarios/asesores/dummy

# O usando el navegador
# Abre la consola y ejecuta:
fetch('http://localhost:3000/api/usuarios/asesores/dummy', { method: 'POST' })
```

### 3. Abrir la página principal

```
Abre: UTMentor/html/principal.html
```

La página debería cargar automáticamente los asesores desde la API.

## Notas Importantes

### CORS

Si ves errores de CORS en la consola, asegúrate de que el servidor API tenga configurado:

```javascript
app.use(cors());
```

### URL de la API

La URL está hardcodeada en `principal.js`:

```javascript
const API_URL = "http://localhost:3000/api/usuarios/asesores";
```

Para producción, considera usar variables de entorno o un archivo de configuración.

### Imágenes de Perfil

Actualmente se reutilizan 5 imágenes predefinidas. Para el futuro:

- Agregar campo `ruta_foto` en la tabla `usuarios`
- Modificar el endpoint para incluir la URL de la foto
- Actualizar `crearAsesorCard()` para usar la foto real

## Próximos Pasos

1. ✅ Integración completada para página principal
2. ⏳ Integrar en página `explorar.html`
3. ⏳ Agregar filtros (por tema, carrera, disponibilidad)
4. ⏳ Implementar paginación para muchos asesores
5. ⏳ Agregar sistema de carga de imágenes de perfil
