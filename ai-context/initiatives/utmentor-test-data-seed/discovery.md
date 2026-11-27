# Discovery: datos de prueba para UTMentor

## Problema

La base inicial contiene pocos perfiles completos y todas sus disponibilidades
son de noviembre y diciembre de 2025. Los endpoints de reservación solo
devuelven horarios cuyo fin es posterior a `NOW()`, por lo que no había sesiones
reservables en el entorno actual.

También se encontraron usuarios con rol de asesor sin registro asociado en
`perfiles_asesores` y rutas de fotografías que no existen en el frontend.

## Funcionalidades que requieren cobertura

- Búsqueda de asesores por nombre, carrera, tema, área, día y rango horario.
- Paginación de resultados y visualización del perfil público.
- Horarios individuales y grupales, con distintas modalidades, precios y cupos.
- Panel del asesorado con sesiones pendientes, completadas y canceladas.
- Calificaciones pendientes y registradas, favoritos y cancelaciones.
- Cambio entre roles para usuarios que son asesor y asesorado.

## Decisión

Mantener el volcado original y agregar un seed de desarrollo separado,
determinista e idempotente. Las cuentas demo se reconocen por el dominio
`@utmentor.local`, permitiendo regenerarlas sin afectar cuentas creadas por el
equipo.
