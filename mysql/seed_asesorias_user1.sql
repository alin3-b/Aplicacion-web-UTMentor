-- Script para cargar asesorías de prueba para el usuario ID 1 (Asesorado)

-- 1. Asegurarnos de que existen disponibilidades futuras y pasadas para inscribir al usuario
-- Insertamos disponibilidades para asesores existentes (ej. 11, 12, 13)

INSERT INTO disponibilidades (fk_asesor, fecha_inicio, fecha_fin, modalidad, tipo_sesion, fk_tema, precio, capacidad, es_disponible) VALUES
-- Sesión PASADA (ayer) - Para probar "Calificar asesores"
(11, DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_ADD(DATE_SUB(NOW(), INTERVAL 1 DAY), INTERVAL 1 HOUR), 'virtual', 'individual', 4, 200.00, 1, 1),

-- Sesión FUTURA (mañana) - Para probar "Mis sesiones" (próxima)
(12, DATE_ADD(NOW(), INTERVAL 1 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 1 DAY), INTERVAL 1 HOUR), 'presencial', 'grupal', 5, 150.00, 5, 1),

-- Sesión FUTURA (en 3 días)
(13, DATE_ADD(NOW(), INTERVAL 3 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 3 DAY), INTERVAL 1 HOUR), 'virtual', 'individual', 2, 250.00, 1, 1),

-- Sesión PASADA (hace 1 semana) - Para probar historial o calificación pendiente
(11, DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_ADD(DATE_SUB(NOW(), INTERVAL 7 DAY), INTERVAL 1 HOUR), 'presencial', 'individual', 6, 180.00, 1, 1);

-- 2. Inscribir al usuario ID 1 en estas disponibilidades
-- Obtenemos los IDs de las disponibilidades recién insertadas (asumiendo que son las últimas, pero mejor usamos subconsultas o variables si fuera un script más complejo. Aquí usaremos LAST_INSERT_ID() de forma secuencial o simplemente asumimos que se insertaron al final).
-- Para ser más seguros en un script de carga manual, seleccionamos los IDs basados en los datos insertados.

INSERT INTO inscripciones_sesion (fk_disponibilidad, fk_asesorado, fecha_reserva, estado)
SELECT id_disponibilidad, 1, NOW(), 'completada'
FROM disponibilidades
WHERE fk_asesor IN (11, 12, 13)
  AND (
       -- Coinciden con las fechas relativas insertadas arriba
       DATE(fecha_inicio) = DATE(DATE_SUB(NOW(), INTERVAL 1 DAY)) OR
       DATE(fecha_inicio) = DATE(DATE_ADD(NOW(), INTERVAL 1 DAY)) OR
       DATE(fecha_inicio) = DATE(DATE_ADD(NOW(), INTERVAL 3 DAY)) OR
       DATE(fecha_inicio) = DATE(DATE_SUB(NOW(), INTERVAL 7 DAY))
      )
  AND id_disponibilidad NOT IN (SELECT fk_disponibilidad FROM inscripciones_sesion WHERE fk_asesorado = 1);

-- Nota: El estado 'completada' se usa aquí genéricamente. 
-- En la lógica de negocio real:
-- - Si la fecha ya pasó, debería considerarse realizada (para calificar).
-- - Si es futura, está 'pendiente' o 'confirmada'.
-- Ajustamos el estado según la fecha para ser consistentes con la lógica del frontend.

UPDATE inscripciones_sesion i
JOIN disponibilidades d ON i.fk_disponibilidad = d.id_disponibilidad
SET i.estado = 'completada'
WHERE i.fk_asesorado = 1 AND d.fecha_fin < NOW();

UPDATE inscripciones_sesion i
JOIN disponibilidades d ON i.fk_disponibilidad = d.id_disponibilidad
SET i.estado = 'pendiente'
WHERE i.fk_asesorado = 1 AND d.fecha_inicio > NOW();

SELECT * FROM inscripciones_sesion WHERE fk_asesorado = 1;
