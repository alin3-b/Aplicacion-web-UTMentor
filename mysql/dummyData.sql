-- Script para insertar registros en la tabla "temas"

INSERT INTO temas (id_tema, nombre_tema, fk_area)
VALUES
(1, 'Programación Básica', 2), -- Relacionado con Programación
(2, 'Álgebra y Cálculo', 1), -- Relacionado con Matemáticas
(3, 'Diseño Gráfico Digital', 10); -- Relacionado con Diseño y Artes Gráficas



-- Script para insertar registros en la tabla "disponibilidades"

INSERT INTO disponibilidades (fk_asesor, fecha_inicio, fecha_fin, modalidad, tipo_sesion, fk_tema, precio, capacidad, es_disponible)
VALUES
-- Registros para el asesor 1
(1, '2025-11-13 10:00:00', '2025-11-13 12:00:00', 'presencial', 'individual', 1, 50.00, 5, 1),
(1, '2025-11-14 14:00:00', '2025-11-14 16:00:00', 'virtual', 'grupal', 2, 30.00, 10, 1),
(1, '2025-11-15 09:00:00', '2025-11-15 11:00:00', 'presencial', 'individual', 3, 40.00, 3, 1),

-- Registros para el asesor 2
(2, '2025-11-13 08:00:00', '2025-11-13 10:00:00', 'virtual', 'grupal', 1, 25.00, 8, 1),
(2, '2025-11-14 15:00:00', '2025-11-14 17:00:00', 'presencial', 'individual', 2, 60.00, 4, 1),

-- Registros para el asesor 3
(3, '2025-11-13 11:00:00', '2025-11-13 13:00:00', 'virtual', 'individual', 1, 45.00, 6, 1),
(3, '2025-11-14 09:00:00', '2025-11-14 11:00:00', 'presencial', 'grupal', 3, 35.00, 12, 1),
(3, '2025-11-15 16:00:00', '2025-11-15 18:00:00', 'virtual', 'individual', 2, 50.00, 5, 1),

-- Registros para el asesor 4
(4, '2025-11-13 07:00:00', '2025-11-13 09:00:00', 'presencial', 'grupal', 1, 20.00, 10, 1),
(4, '2025-11-14 12:00:00', '2025-11-14 14:00:00', 'virtual', 'individual', 2, 55.00, 4, 1),

-- Registros para el asesor 5
(5, '2025-11-13 13:00:00', '2025-11-13 15:00:00', 'virtual', 'grupal', 3, 30.00, 8, 1),
(5, '2025-11-14 10:00:00', '2025-11-14 12:00:00', 'presencial', 'individual', 1, 40.00, 5, 1);