-- Datos ficticios para desarrollo y pruebas manuales de UTMentor.
-- Compatible con MySQL 8.4. Puede ejecutarse varias veces sin duplicar datos demo.

SET NAMES utf8mb4;
SET time_zone = '-06:00';

START TRANSACTION;

-- Limpiar únicamente registros creados por este seed. Las relaciones dependientes
-- se eliminan mediante las llaves foráneas con ON DELETE CASCADE.
DELETE FROM usuarios
WHERE correo LIKE 'demo.asesor.%@utmentor.local'
   OR correo LIKE 'demo.asesorado.%@utmentor.local';

-- Completar el catálogo para que todas las áreas tengan temas filtrables.
INSERT IGNORE INTO temas (nombre_tema, fk_area) VALUES
  ('Estadística Aplicada', 3),
  ('Química Orgánica', 6),
  ('Balance de Materia', 6),
  ('Genética Molecular', 7),
  ('Microbiología', 7),
  ('Metodología de la Investigación', 8),
  ('Comunicación Académica', 8),
  ('Finanzas Básicas', 9),
  ('Ilustración Digital', 10),
  ('Filosofía de la Tecnología', 11),
  ('Energías Renovables', 12);

DROP TEMPORARY TABLE IF EXISTS seed_digits;
DROP TEMPORARY TABLE IF EXISTS seed_tens;
DROP TEMPORARY TABLE IF EXISTS seed_hundreds;
DROP TEMPORARY TABLE IF EXISTS seed_numbers;

CREATE TEMPORARY TABLE seed_digits (
  n INT NOT NULL PRIMARY KEY
);

INSERT INTO seed_digits (n) VALUES
  (0), (1), (2), (3), (4), (5), (6), (7), (8), (9);

CREATE TEMPORARY TABLE seed_tens AS
SELECT n FROM seed_digits;

CREATE TEMPORARY TABLE seed_hundreds AS
SELECT n FROM seed_digits;

CREATE TEMPORARY TABLE seed_numbers (
  n INT NOT NULL PRIMARY KEY
);

INSERT INTO seed_numbers (n)
SELECT unidades.n + decenas.n * 10 + centenas.n * 100 + 1
FROM seed_digits unidades
CROSS JOIN seed_tens decenas
CROSS JOIN seed_hundreds centenas
WHERE unidades.n + decenas.n * 10 + centenas.n * 100 < 300;

-- La contraseña de todas las cuentas demo es: UTMentor2026!
SET @demo_password_hash = '$2y$10$bQ5CFqj63AS/2X6qOdUen.gvzLBDQib7B0bjC3C5siASuNrcyJQ2u';

-- 30 asesores con nombres, carreras, semestres y fotografías variadas.
INSERT INTO usuarios (
  nombre_completo,
  fk_carrera,
  semestre,
  correo,
  password_hash,
  ruta_foto,
  fecha_registro,
  es_activo,
  fecha_creacion,
  fecha_modificacion
)
SELECT
  CONCAT(
    ELT(MOD(n - 1, 10) + 1,
      'Valeria', 'Daniel', 'Fernanda', 'Santiago', 'Renata',
      'Emiliano', 'Mariana', 'Alejandro', 'Natalia', 'Sebastián'),
    ' ',
    ELT(MOD(n * 3 - 1, 13) + 1,
      'Aguilar', 'Bautista', 'Cervantes', 'Delgado', 'Escobar',
      'Flores', 'Galindo', 'Hernández', 'Ibarra', 'Juárez',
      'Luna', 'Mendoza', 'Navarro'),
    ' ',
    ELT(MOD(n * 7 - 1, 11) + 1,
      'Ortega', 'Paredes', 'Quintero', 'Ramírez', 'Salas',
      'Torres', 'Urbina', 'Vega', 'Zamora', 'Cruz', 'Reyes')
  ),
  MOD(n - 1, 13) + 1,
  MOD(n - 1, 6) + 5,
  CONCAT('demo.asesor.', LPAD(n, 2, '0'), '@utmentor.local'),
  @demo_password_hash,
  CASE MOD(n, 3)
    WHEN 0 THEN '/imagenes/adviser.jpg'
    WHEN 1 THEN '/imagenes/profilepicture.jpg'
    ELSE NULL
  END,
  DATE_SUB(CURRENT_TIMESTAMP, INTERVAL n DAY),
  1,
  DATE_SUB(CURRENT_TIMESTAMP, INTERVAL n DAY),
  CURRENT_TIMESTAMP
FROM seed_numbers
WHERE n <= 30;

-- 50 asesorados distribuidos entre las trece carreras y los diez semestres.
INSERT INTO usuarios (
  nombre_completo,
  fk_carrera,
  semestre,
  correo,
  password_hash,
  ruta_foto,
  fecha_registro,
  es_activo,
  fecha_creacion,
  fecha_modificacion
)
SELECT
  CONCAT(
    ELT(MOD(n + 2, 10) + 1,
      'Andrea', 'Bruno', 'Carolina', 'Diego', 'Elisa',
      'Fabián', 'Gabriela', 'Hugo', 'Ivana', 'Jorge'),
    ' ',
    ELT(MOD(n * 5 - 1, 13) + 1,
      'Acosta', 'Bravo', 'Campos', 'Domínguez', 'Espinosa',
      'Fuentes', 'Guzmán', 'Herrera', 'Jiménez', 'Lozano',
      'Márquez', 'Núñez', 'Ochoa'),
    ' ',
    ELT(MOD(n * 9 - 1, 11) + 1,
      'Pérez', 'Ríos', 'Sánchez', 'Tapia', 'Valdés',
      'Yáñez', 'Zúñiga', 'Morales', 'Castillo', 'Rivera', 'Soto')
  ),
  MOD(n * 3 - 1, 13) + 1,
  MOD(n - 1, 10) + 1,
  CONCAT('demo.asesorado.', LPAD(n, 2, '0'), '@utmentor.local'),
  @demo_password_hash,
  CASE MOD(n, 4)
    WHEN 0 THEN '/imagenes/student.jpg'
    WHEN 1 THEN '/imagenes/profilepicture.jpg'
    ELSE NULL
  END,
  DATE_SUB(CURRENT_TIMESTAMP, INTERVAL MOD(n, 45) DAY),
  1,
  DATE_SUB(CURRENT_TIMESTAMP, INTERVAL MOD(n, 45) DAY),
  CURRENT_TIMESTAMP
FROM seed_numbers
WHERE n <= 50;

-- Roles: cinco asesores también pueden entrar al panel de asesorado.
INSERT INTO usuario_rol (fk_usuario, fk_rol)
SELECT id_usuario, 1
FROM usuarios
WHERE correo LIKE 'demo.asesor.%@utmentor.local';

INSERT INTO usuario_rol (fk_usuario, fk_rol)
SELECT id_usuario, 2
FROM usuarios
WHERE correo LIKE 'demo.asesorado.%@utmentor.local'
   OR (
     correo LIKE 'demo.asesor.%@utmentor.local'
     AND CAST(SUBSTRING_INDEX(SUBSTRING_INDEX(correo, '@', 1), '.', -1) AS UNSIGNED) <= 5
   );

INSERT INTO perfiles_asesores (id_asesor, conteo_asesorias, calificacion_promedio)
SELECT id_usuario, 0, 0.0
FROM usuarios
WHERE correo LIKE 'demo.asesor.%@utmentor.local';

DROP TEMPORARY TABLE IF EXISTS seed_advisors;
DROP TEMPORARY TABLE IF EXISTS seed_students;

CREATE TEMPORARY TABLE seed_advisors AS
SELECT
  id_usuario,
  CAST(SUBSTRING_INDEX(SUBSTRING_INDEX(correo, '@', 1), '.', -1) AS UNSIGNED) AS demo_no
FROM usuarios
WHERE correo LIKE 'demo.asesor.%@utmentor.local';

ALTER TABLE seed_advisors
  ADD PRIMARY KEY (id_usuario),
  ADD UNIQUE KEY uk_seed_advisor_no (demo_no);

CREATE TEMPORARY TABLE seed_students AS
SELECT
  id_usuario,
  CAST(SUBSTRING_INDEX(SUBSTRING_INDEX(correo, '@', 1), '.', -1) AS UNSIGNED) AS demo_no
FROM usuarios
WHERE correo LIKE 'demo.asesorado.%@utmentor.local';

ALTER TABLE seed_students
  ADD PRIMARY KEY (id_usuario),
  ADD UNIQUE KEY uk_seed_student_no (demo_no);

-- Cuatro especialidades por asesor, repartidas por todo el catálogo de temas.
INSERT IGNORE INTO asesores_temas (fk_asesor, fk_tema)
SELECT
  a.id_usuario,
  catalogo.id_tema
FROM seed_advisors a
CROSS JOIN seed_numbers posicion
INNER JOIN (
  SELECT
    id_tema,
    ROW_NUMBER() OVER (ORDER BY id_tema) AS fila,
    COUNT(*) OVER () AS total_temas
  FROM temas
) catalogo
  ON catalogo.fila = MOD(a.demo_no * 4 + posicion.n * 5, catalogo.total_temas) + 1
WHERE posicion.n <= 4;

-- Seis horarios futuros por asesor: 180 opciones reservables en ocho semanas.
INSERT INTO disponibilidades (
  fk_asesor,
  fecha_inicio,
  fecha_fin,
  modalidad,
  tipo_sesion,
  fk_tema,
  precio,
  capacidad,
  es_disponible
)
SELECT
  a.id_usuario,
  TIMESTAMP(
    DATE_ADD(CURRENT_DATE, INTERVAL (MOD(a.demo_no * 2 + horario.n * 5, 56) + 1) DAY),
    MAKETIME(MOD(a.demo_no + horario.n * 2, 12) + 8, IF(MOD(horario.n, 2) = 0, 30, 0), 0)
  ),
  DATE_ADD(
    TIMESTAMP(
      DATE_ADD(CURRENT_DATE, INTERVAL (MOD(a.demo_no * 2 + horario.n * 5, 56) + 1) DAY),
      MAKETIME(MOD(a.demo_no + horario.n * 2, 12) + 8, IF(MOD(horario.n, 2) = 0, 30, 0), 0)
    ),
    INTERVAL IF(MOD(horario.n, 4) = 0, 90, 60) MINUTE
  ),
  IF(MOD(a.demo_no + horario.n, 2) = 0, 'virtual', 'presencial'),
  IF(MOD(horario.n, 3) = 0, 'individual', 'grupal'),
  especialidad.fk_tema,
  ELT(MOD(a.demo_no + horario.n, 5) + 1, 0.00, 80.00, 100.00, 120.00, 150.00),
  IF(MOD(horario.n, 3) = 0, 1, MOD(a.demo_no + horario.n, 5) + 3),
  1
FROM seed_advisors a
CROSS JOIN seed_numbers horario
INNER JOIN (
  SELECT
    fk_asesor,
    fk_tema,
    ROW_NUMBER() OVER (PARTITION BY fk_asesor ORDER BY fk_tema) AS fila,
    COUNT(*) OVER (PARTITION BY fk_asesor) AS total_temas
  FROM asesores_temas
) especialidad
  ON especialidad.fk_asesor = a.id_usuario
 AND especialidad.fila = MOD(horario.n - 1, especialidad.total_temas) + 1
WHERE horario.n <= 6;

-- Tres horarios históricos por asesor para probar historiales y calificaciones.
INSERT INTO disponibilidades (
  fk_asesor,
  fecha_inicio,
  fecha_fin,
  modalidad,
  tipo_sesion,
  fk_tema,
  precio,
  capacidad,
  es_disponible
)
SELECT
  a.id_usuario,
  TIMESTAMP(
    DATE_SUB(CURRENT_DATE, INTERVAL (a.demo_no + horario.n * 7) DAY),
    MAKETIME(MOD(a.demo_no + horario.n * 3, 10) + 9, 0, 0)
  ),
  DATE_ADD(
    TIMESTAMP(
      DATE_SUB(CURRENT_DATE, INTERVAL (a.demo_no + horario.n * 7) DAY),
      MAKETIME(MOD(a.demo_no + horario.n * 3, 10) + 9, 0, 0)
    ),
    INTERVAL 60 MINUTE
  ),
  IF(MOD(a.demo_no + horario.n, 2) = 0, 'virtual', 'presencial'),
  IF(horario.n = 3, 'individual', 'grupal'),
  especialidad.fk_tema,
  ELT(MOD(a.demo_no + horario.n, 4) + 1, 0.00, 80.00, 100.00, 120.00),
  IF(horario.n = 3, 1, 5),
  0
FROM seed_advisors a
CROSS JOIN seed_numbers horario
INNER JOIN (
  SELECT
    fk_asesor,
    fk_tema,
    ROW_NUMBER() OVER (PARTITION BY fk_asesor ORDER BY fk_tema) AS fila,
    COUNT(*) OVER (PARTITION BY fk_asesor) AS total_temas
  FROM asesores_temas
) especialidad
  ON especialidad.fk_asesor = a.id_usuario
 AND especialidad.fila = MOD(horario.n, especialidad.total_temas) + 1
WHERE horario.n <= 3;

DROP TEMPORARY TABLE IF EXISTS seed_availabilities;

CREATE TEMPORARY TABLE seed_availabilities AS
SELECT
  d.id_disponibilidad,
  d.fecha_inicio,
  d.tipo_sesion,
  a.demo_no AS advisor_no,
  IF(d.fecha_inicio >= CURRENT_DATE, 'futura', 'historica') AS periodo,
  ROW_NUMBER() OVER (
    PARTITION BY a.demo_no, IF(d.fecha_inicio >= CURRENT_DATE, 'futura', 'historica')
    ORDER BY d.fecha_inicio, d.id_disponibilidad
  ) AS slot_no,
  ROW_NUMBER() OVER (
    PARTITION BY
      a.demo_no,
      IF(d.fecha_inicio >= CURRENT_DATE, 'futura', 'historica'),
      d.tipo_sesion
    ORDER BY d.fecha_inicio, d.id_disponibilidad
  ) AS type_slot_no
FROM disponibilidades d
INNER JOIN seed_advisors a ON a.id_usuario = d.fk_asesor;

ALTER TABLE seed_availabilities
  ADD PRIMARY KEY (id_disponibilidad),
  ADD KEY idx_seed_availability (advisor_no, periodo, slot_no),
  ADD KEY idx_seed_availability_type (advisor_no, periodo, tipo_sesion, type_slot_no);

-- Una asistencia completada por cada horario histórico.
INSERT INTO inscripciones_sesion (
  fk_disponibilidad,
  fk_asesorado,
  fecha_reserva,
  estado
)
SELECT
  d.id_disponibilidad,
  s.id_usuario,
  DATE_SUB(d.fecha_inicio, INTERVAL 5 DAY),
  'completada'
FROM seed_availabilities d
INNER JOIN seed_students s
  ON s.demo_no = MOD(d.advisor_no * 3 + d.slot_no - 1, 50) + 1
WHERE d.periodo = 'historica';

-- Una cancelación adicional en cada segundo horario histórico grupal.
INSERT INTO inscripciones_sesion (
  fk_disponibilidad,
  fk_asesorado,
  fecha_reserva,
  estado
)
SELECT
  d.id_disponibilidad,
  s.id_usuario,
  DATE_SUB(d.fecha_inicio, INTERVAL 8 DAY),
  'cancelada'
FROM seed_availabilities d
INNER JOIN seed_students s
  ON s.demo_no = MOD(d.advisor_no * 3 + d.slot_no + 16, 50) + 1
WHERE d.periodo = 'historica'
  AND d.tipo_sesion = 'grupal'
  AND d.type_slot_no = 2;

-- Dos lugares ocupados en el primer horario grupal futuro de cada asesor.
INSERT INTO inscripciones_sesion (
  fk_disponibilidad,
  fk_asesorado,
  fecha_reserva,
  estado
)
SELECT
  d.id_disponibilidad,
  s.id_usuario,
  CURRENT_TIMESTAMP,
  'pendiente'
FROM seed_availabilities d
CROSS JOIN seed_numbers participante
INNER JOIN seed_students s
  ON s.demo_no = MOD(d.advisor_no * 5 + participante.n * 11 - 1, 50) + 1
WHERE d.periodo = 'futura'
  AND d.tipo_sesion = 'grupal'
  AND d.type_slot_no = 1
  AND participante.n <= 2;

-- Una reservación individual futura por asesor cuando exista el tercer horario.
INSERT INTO inscripciones_sesion (
  fk_disponibilidad,
  fk_asesorado,
  fecha_reserva,
  estado
)
SELECT
  d.id_disponibilidad,
  s.id_usuario,
  CURRENT_TIMESTAMP,
  'pendiente'
FROM seed_availabilities d
INNER JOIN seed_students s
  ON s.demo_no = MOD(d.advisor_no * 7 + 12, 50) + 1
WHERE d.periodo = 'futura'
  AND d.tipo_sesion = 'individual'
  AND d.type_slot_no = 1;

-- Los horarios individuales ocupados dejan de aparecer como reservables.
UPDATE disponibilidades d
INNER JOIN seed_availabilities sd ON sd.id_disponibilidad = d.id_disponibilidad
SET d.es_disponible = 0
WHERE sd.periodo = 'futura'
  AND d.tipo_sesion = 'individual'
  AND EXISTS (
    SELECT 1
    FROM inscripciones_sesion i
    WHERE i.fk_disponibilidad = d.id_disponibilidad
      AND i.estado != 'cancelada'
  );

-- Calificar cinco de cada seis sesiones completadas: 75 reseñas variadas.
INSERT INTO calificaciones (
  fk_inscripcion,
  puntuacion,
  comentario,
  fecha_calificacion
)
SELECT
  historial.id_inscripcion,
  ELT(MOD(historial.orden, 5) + 1, 5, 4, 5, 3, 4),
  ELT(
    MOD(historial.orden, 8) + 1,
    'Explicó el tema con claridad y resolvió todas mis dudas.',
    'La sesión fue dinámica y los ejemplos fueron muy útiles.',
    'Buen dominio del tema y excelente puntualidad.',
    'Me ayudó a prepararme para el examen.',
    'La explicación fue clara, aunque faltó tiempo para practicar.',
    'Muy recomendable para reforzar los conceptos básicos.',
    'Compartió ejercicios adicionales y material de apoyo.',
    'La asesoría cumplió mis expectativas.'
  ),
  DATE_ADD(historial.fecha_inicio, INTERVAL 90 MINUTE)
FROM (
  SELECT
    i.id_inscripcion,
    d.fecha_inicio,
    ROW_NUMBER() OVER (ORDER BY i.id_inscripcion) AS orden
  FROM inscripciones_sesion i
  INNER JOIN seed_availabilities d ON d.id_disponibilidad = i.fk_disponibilidad
  WHERE i.estado = 'completada'
) historial
WHERE MOD(historial.orden, 6) != 0;

-- Registrar el motivo de las cancelaciones demo.
INSERT INTO historial_cancelaciones (
  fk_inscripcion,
  fk_usuario_cancelo,
  motivo,
  fecha_cancelacion
)
SELECT
  i.id_inscripcion,
  i.fk_asesorado,
  ELT(
    MOD(i.id_inscripcion, 4) + 1,
    'Conflicto con el horario de clases.',
    'La materia cambió la fecha del examen.',
    'Se presentó una actividad académica inesperada.',
    'El estudiante ya no necesitó la sesión.'
  ),
  DATE_ADD(i.fecha_reserva, INTERVAL 1 DAY)
FROM inscripciones_sesion i
INNER JOIN seed_availabilities d ON d.id_disponibilidad = i.fk_disponibilidad
WHERE i.estado = 'cancelada';

-- Ochenta favoritos: dos asesores distintos para cuarenta asesorados.
INSERT INTO favoritos (fk_asesorado, fk_asesor, fecha_guardado)
SELECT
  s.id_usuario,
  a.id_usuario,
  DATE_SUB(CURRENT_TIMESTAMP, INTERVAL MOD(s.demo_no + posicion.n, 20) DAY)
FROM seed_students s
CROSS JOIN seed_numbers posicion
INNER JOIN seed_advisors a
  ON a.demo_no = MOD(s.demo_no * 3 + posicion.n * 7 - 1, 30) + 1
WHERE s.demo_no <= 40
  AND posicion.n <= 2;

-- Sincronizar métricas materializadas del perfil con las relaciones insertadas.
UPDATE perfiles_asesores pa
INNER JOIN seed_advisors a ON a.id_usuario = pa.id_asesor
LEFT JOIN (
  SELECT
    d.fk_asesor,
    COUNT(DISTINCT CASE WHEN i.estado = 'completada' THEN i.id_inscripcion END) AS completadas,
    ROUND(AVG(c.puntuacion), 1) AS promedio
  FROM disponibilidades d
  LEFT JOIN inscripciones_sesion i ON i.fk_disponibilidad = d.id_disponibilidad
  LEFT JOIN calificaciones c ON c.fk_inscripcion = i.id_inscripcion
  GROUP BY d.fk_asesor
) metricas ON metricas.fk_asesor = pa.id_asesor
SET
  pa.conteo_asesorias = COALESCE(metricas.completadas, 0),
  pa.calificacion_promedio = COALESCE(metricas.promedio, 0.0);

DROP TEMPORARY TABLE IF EXISTS seed_availabilities;
DROP TEMPORARY TABLE IF EXISTS seed_students;
DROP TEMPORARY TABLE IF EXISTS seed_advisors;
DROP TEMPORARY TABLE IF EXISTS seed_numbers;
DROP TEMPORARY TABLE IF EXISTS seed_hundreds;
DROP TEMPORARY TABLE IF EXISTS seed_tens;
DROP TEMPORARY TABLE IF EXISTS seed_digits;

COMMIT;

SELECT 'Seed de desarrollo aplicado correctamente' AS resultado;
SELECT
  SUM(correo LIKE 'demo.asesor.%@utmentor.local') AS asesores_demo,
  SUM(correo LIKE 'demo.asesorado.%@utmentor.local') AS asesorados_demo
FROM usuarios;
