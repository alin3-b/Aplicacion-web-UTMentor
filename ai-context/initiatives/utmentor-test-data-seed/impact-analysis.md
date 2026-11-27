# Impact analysis: datos de prueba para UTMentor

## Base de datos

- Agrega 30 asesores y 50 asesorados ficticios.
- Agrega 11 temas para dar cobertura a las 12 áreas de conocimiento.
- Genera 180 disponibilidades futuras y 90 históricas.
- Genera inscripciones completadas, pendientes y canceladas.
- Genera calificaciones, historial de cancelaciones y favoritos.
- Recalcula el conteo y promedio de cada perfil demo.

No se modifica el esquema ni se eliminan usuarios reales. Al repetirse, el seed
borra exclusivamente usuarios con los prefijos `demo.asesor.` y
`demo.asesorado.` bajo `@utmentor.local`; las llaves foráneas eliminan sus
relaciones dependientes.

## Aplicación e infraestructura

- Las instalaciones nuevas reciben los datos después de `mysql/init.sql`.
- Una instalación existente puede regenerarlos con `npm run seed:dev`.
- Las fotografías usan recursos que ya existen en `UTMentor/imagenes` o el
  fallback actual de la interfaz.

## Riesgos y mitigaciones

- Los identificadores autoincrementales cambian en cada regeneración. Las
  pruebas deben localizar cuentas por correo, no por ID fijo.
- El seed es exclusivo para desarrollo; sus credenciales comunes no deben
  utilizarse en producción.
- Las fechas se calculan con la zona `-06:00` y respecto a `CURRENT_DATE` para
  conservar horarios futuros útiles.
