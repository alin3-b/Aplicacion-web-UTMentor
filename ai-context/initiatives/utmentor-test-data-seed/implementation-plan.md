# Implementation plan: datos de prueba para UTMentor

## Implementación

1. Completar los temas faltantes por área mediante `INSERT IGNORE`.
2. Crear cuentas demo con correos identificables y una contraseña bcrypt común.
3. Asignar roles, perfiles y cuatro especialidades a cada asesor.
4. Generar disponibilidades futuras e históricas distribuidas por día, hora,
   modalidad, tipo, precio y capacidad.
5. Crear inscripciones en los tres estados admitidos y cerrar los horarios
   individuales ya ocupados.
6. Crear reseñas, cancelaciones y favoritos, y sincronizar métricas de perfiles.
7. Ejecutar el seed automáticamente en bases nuevas y ofrecer un comando manual
   para bases existentes.

## Verificación

- Ejecutar dos veces el seed y confirmar que las cantidades demo no se duplican.
- Verificar integridad referencial y ausencia de disponibilidades futuras
  individuales ocupadas marcadas como disponibles.
- Probar inicio de sesión con cuentas de ambos roles.
- Consultar asesores sin filtros y con combinaciones de carrera, tema, área, día
  y horario.
- Abrir perfiles públicos y comprobar agenda, cupos, calificaciones y sesiones.
- Revisar los paneles de asesor y asesorado, favoritos y cancelaciones.

## Entrega

La implementación se realiza en una rama basada en `Dev` y se entrega mediante
un pull request dirigido a `Dev`.
