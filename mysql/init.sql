-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Servidor: mysql:3306
-- Tiempo de generación: 18-11-2025 a las 17:35:23
-- Versión del servidor: 8.4.7
-- Versión de PHP: 8.2.28

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `utmentor`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `areas_conocimiento`
--

CREATE TABLE `areas_conocimiento` (
  `id_area` int NOT NULL,
  `nombre_area` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `areas_conocimiento`
--

INSERT INTO `areas_conocimiento` (`id_area`, `nombre_area`) VALUES
(7, 'Biología y Biotecnología'),
(8, 'Ciencias Sociales'),
(10, 'Diseño y Artes Gráficas'),
(5, 'Física'),
(11, 'Humanidades y Ética'),
(4, 'Idiomas'),
(3, 'Ingeniería'),
(1, 'Matemáticas'),
(9, 'Negocios/Administración'),
(2, 'Programación'),
(6, 'Química'),
(12, 'Sostenibilidad/Ambiente');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `asesores_temas`
--

CREATE TABLE `asesores_temas` (
  `fk_asesor` int NOT NULL,
  `fk_tema` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `asesores_temas`
--

INSERT INTO `asesores_temas` (`fk_asesor`, `fk_tema`) VALUES
(13, 1),
(13, 2),
(13, 3),
(11, 4),
(11, 5),
(11, 6),
(15, 7),
(17, 8),
(12, 9),
(14, 10),
(20, 11),
(16, 12),
(18, 13),
(19, 14),
(12, 15);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `calificaciones`
--

CREATE TABLE `calificaciones` (
  `id_calificacion` int NOT NULL,
  `fk_inscripcion` int NOT NULL,
  `puntuacion` int NOT NULL,
  `comentario` text COLLATE utf8mb4_unicode_ci,
  `fecha_calificacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ;

--
-- Volcado de datos para la tabla `calificaciones`
--

INSERT INTO `calificaciones` (`id_calificacion`, `fk_inscripcion`, `puntuacion`, `comentario`, `fecha_calificacion`) VALUES
(1, 1, 5, 'Excelente explicación, muy claro', '2025-11-15 03:21:19'),
(2, 2, 4, 'Buena sesión, pero un poco rápida', '2025-11-15 03:21:19'),
(3, 3, 5, 'Me ayudó mucho con el proyecto', '2025-11-15 03:21:19'),
(4, 4, 5, 'El profesor es muy paciente', '2025-11-15 03:21:19'),
(5, 5, 4, 'Buen contenido, pero faltó práctica', '2025-11-15 03:21:19'),
(6, 6, 5, 'Recomendado 100%', '2025-11-15 03:21:19'),
(7, 7, 3, 'Faltó más interacción', '2025-11-15 03:21:19'),
(8, 11, 5, 'Sesión muy productiva', '2025-11-15 03:21:19'),
(9, 21, 5, 'El asesor me ayudó a depurar mi código.', '2025-11-16 06:32:00'),
(10, 22, 4, 'Buena sesión sobre estructuras de datos.', '2025-11-16 06:32:05'),
(11, 23, 5, 'El mejor para Cálculo Integral, 10/10.', '2025-11-16 06:32:10'),
(12, 24, 5, 'Muy claro y organizado para el tema de integrales.', '2025-11-16 06:32:15'),
(13, 25, 4, 'Podría haber más ejemplos prácticos.', '2025-11-16 06:32:20'),
(14, 26, 5, 'Sesión muy útil para Termodinámica.', '2025-11-16 06:32:25'),
(15, 27, 4, 'Javier es muy claro explicando Circuitos Eléctricos.', '2025-11-16 06:32:30'),
(16, 28, 5, 'Excelente para preparación de examen de Inglés Técnico.', '2025-11-16 06:32:35'),
(17, 29, 5, 'Dominio del tema y ejercicios relevantes.', '2025-11-16 06:32:40'),
(18, 30, 3, 'El grupo era muy grande, poca atención individual.', '2025-11-16 06:32:45'),
(19, 31, 5, 'Me ayudó a entender los principios de Diseño UX/UI.', '2025-11-16 06:32:50'),
(20, 32, 4, 'La sesión de Ética en IA fue interesante, pero abstracta.', '2025-11-16 06:32:55'),
(21, 33, 5, 'Mecánica de Fluidos por Fernando, muy bien.', '2025-11-16 06:33:00'),
(22, 34, 5, 'Gran manejo de los conceptos de Mecánica de Fluidos.', '2025-11-16 06:33:05'),
(23, 35, 4, 'Buenos tips para Emprendimiento, el precio es justo.', '2025-11-16 06:33:10');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `carreras`
--

CREATE TABLE `carreras` (
  `id_carrera` int NOT NULL,
  `nombre_carrera` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `carreras`
--

INSERT INTO `carreras` (`id_carrera`, `nombre_carrera`) VALUES
(1, 'Ingeniería Civil'),
(2, 'Ingeniería en Alimentos'),
(3, 'Ingeniería en Computación'),
(4, 'Ingeniería en Diseño'),
(5, 'Ingeniería en Electrónica'),
(6, 'Ingeniería en Física Aplicada'),
(8, 'Ingeniería en Mecánica Automotriz'),
(9, 'Ingeniería en Mecatrónica'),
(7, 'Ingeniería Industrial'),
(10, 'Ingeniería Química en Procesos Sostenibles'),
(11, 'Licenciatura en Ciencias Empresariales'),
(13, 'Licenciatura en Estudios Mexicanos modalidad virtual'),
(12, 'Licenciatura en Matemáticas Aplicadas');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `disponibilidades`
--

CREATE TABLE `disponibilidades` (
  `id_disponibilidad` int NOT NULL,
  `fk_asesor` int NOT NULL,
  `fecha_inicio` datetime NOT NULL,
  `fecha_fin` datetime NOT NULL,
  `modalidad` enum('presencial','virtual') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tipo_sesion` enum('grupal','individual') COLLATE utf8mb4_unicode_ci NOT NULL,
  `fk_tema` int DEFAULT NULL,
  `precio` decimal(10,2) NOT NULL,
  `capacidad` int DEFAULT '1',
  `es_disponible` tinyint(1) DEFAULT '1'
) ;

--
-- Volcado de datos para la tabla `disponibilidades`
--

INSERT INTO `disponibilidades` (`id_disponibilidad`, `fk_asesor`, `fecha_inicio`, `fecha_fin`, `modalidad`, `tipo_sesion`, `fk_tema`, `precio`, `capacidad`, `es_disponible`) VALUES
(1, 11, '2025-11-20 10:00:00', '2025-11-20 11:00:00', 'virtual', 'individual', 4, 250.00, 1, 1),
(2, 11, '2025-11-22 15:00:00', '2025-11-22 16:30:00', 'presencial', 'grupal', 5, 180.00, 4, 1),
(3, 11, '2025-11-25 09:00:00', '2025-11-25 10:00:00', 'virtual', 'individual', 6, 300.00, 1, 1),
(4, 12, '2025-11-21 14:00:00', '2025-11-21 15:30:00', 'presencial', 'grupal', 15, 200.00, 5, 1),
(5, 12, '2025-11-24 11:00:00', '2025-11-24 12:00:00', 'virtual', 'individual', 9, 280.00, 1, 1),
(6, 13, '2025-11-19 16:00:00', '2025-11-19 17:00:00', 'virtual', 'individual', 2, 220.00, 1, 1),
(7, 13, '2025-11-23 10:00:00', '2025-11-23 11:30:00', 'presencial', 'grupal', 1, 150.00, 3, 1),
(8, 13, '2025-11-26 13:00:00', '2025-11-26 14:00:00', 'virtual', 'individual', 3, 240.00, 1, 1),
(9, 14, '2025-11-20 17:00:00', '2025-11-20 18:00:00', 'virtual', 'individual', 10, 180.00, 1, 1),
(10, 14, '2025-11-27 09:00:00', '2025-11-27 10:30:00', 'presencial', 'grupal', 10, 120.00, 4, 1),
(11, 15, '2025-11-21 09:00:00', '2025-11-21 10:00:00', 'presencial', 'individual', 7, 320.00, 1, 1),
(12, 16, '2025-11-22 11:00:00', '2025-11-22 12:00:00', 'virtual', 'individual', 12, 290.00, 1, 1),
(13, 17, '2025-11-25 14:00:00', '2025-11-25 15:00:00', 'presencial', 'individual', 8, 310.00, 1, 1),
(14, 18, '2025-11-24 16:00:00', '2025-11-24 17:00:00', 'virtual', 'individual', 13, 200.00, 1, 1),
(15, 19, '2025-11-26 17:00:00', '2025-11-26 18:30:00', 'presencial', 'grupal', 14, 190.00, 6, 1),
(16, 11, '2025-11-28 11:00:00', '2025-11-28 12:00:00', 'virtual', 'individual', 5, 260.00, 1, 1),
(17, 13, '2025-11-29 14:00:00', '2025-11-29 15:30:00', 'presencial', 'grupal', 3, 160.00, 5, 1),
(18, 12, '2025-11-30 09:00:00', '2025-11-30 10:00:00', 'virtual', 'individual', 9, 290.00, 1, 1),
(19, 15, '2025-12-01 16:00:00', '2025-12-01 17:00:00', 'presencial', 'individual', 7, 300.00, 1, 1),
(20, 14, '2025-12-02 10:00:00', '2025-12-02 11:30:00', 'virtual', 'grupal', 10, 130.00, 3, 1),
(21, 16, '2025-12-03 15:00:00', '2025-12-03 16:00:00', 'presencial', 'individual', 12, 270.00, 1, 1),
(22, 18, '2025-12-04 17:00:00', '2025-12-04 18:00:00', 'virtual', 'individual', 13, 210.00, 1, 1),
(23, 17, '2025-12-05 08:00:00', '2025-12-05 09:30:00', 'presencial', 'grupal', 8, 170.00, 4, 1),
(24, 19, '2025-12-06 12:00:00', '2025-12-06 13:00:00', 'virtual', 'individual', 14, 220.00, 1, 1),
(25, 20, '2025-12-07 14:00:00', '2025-12-07 15:00:00', 'virtual', 'individual', 11, 240.00, 1, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `favoritos`
--

CREATE TABLE `favoritos` (
  `id_favorito` int NOT NULL,
  `fk_asesorado` int NOT NULL,
  `fk_asesor` int NOT NULL,
  `fecha_guardado` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `favoritos`
--

INSERT INTO `favoritos` (`id_favorito`, `fk_asesorado`, `fk_asesor`, `fecha_guardado`) VALUES
(1, 1, 11, '2025-11-15 03:22:02'),
(2, 1, 13, '2025-11-15 03:22:02'),
(3, 2, 11, '2025-11-15 03:22:02'),
(4, 2, 12, '2025-11-15 03:22:02'),
(5, 3, 13, '2025-11-15 03:22:02'),
(6, 3, 14, '2025-11-15 03:22:02'),
(7, 4, 11, '2025-11-15 03:22:02'),
(8, 4, 19, '2025-11-15 03:22:02'),
(9, 5, 12, '2025-11-15 03:22:02'),
(10, 5, 16, '2025-11-15 03:22:02'),
(11, 6, 13, '2025-11-15 03:22:02'),
(12, 7, 14, '2025-11-15 03:22:02'),
(13, 7, 18, '2025-11-15 03:22:02'),
(14, 21, 11, '2025-11-16 06:34:00'),
(15, 23, 13, '2025-11-16 06:34:05'),
(16, 26, 12, '2025-11-16 06:34:10'),
(17, 29, 14, '2025-11-16 06:34:15'),
(18, 31, 16, '2025-11-16 06:34:20'),
(19, 34, 17, '2025-11-16 06:34:25'),
(20, 38, 15, '2025-11-16 06:34:30');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `historial_cancelaciones`
--

CREATE TABLE `historial_cancelaciones` (
  `id_cancelacion` int NOT NULL,
  `fk_inscripcion` int NOT NULL,
  `fk_usuario_cancelo` int DEFAULT NULL,
  `motivo` text COLLATE utf8mb4_unicode_ci,
  `fecha_cancelacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `historial_cancelaciones`
--

INSERT INTO `historial_cancelaciones` (`id_cancelacion`, `fk_inscripcion`, `fk_usuario_cancelo`, `motivo`, `fecha_cancelacion`) VALUES
(1, 18, 8, 'Conflicto de horario', '2025-11-15 03:21:47'),
(2, 19, 9, 'Emergencia personal', '2025-11-15 03:21:47'),
(3, 20, 10, 'Cambio de tema de interés', '2025-11-15 03:21:47');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `inscripciones_sesion`
--

CREATE TABLE `inscripciones_sesion` (
  `id_inscripcion` int NOT NULL,
  `fk_disponibilidad` int NOT NULL,
  `fk_asesorado` int NOT NULL,
  `fecha_reserva` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `estado` enum('pendiente','completada','cancelada') COLLATE utf8mb4_unicode_ci DEFAULT 'pendiente'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `inscripciones_sesion`
--

INSERT INTO `inscripciones_sesion` (`id_inscripcion`, `fk_disponibilidad`, `fk_asesorado`, `fecha_reserva`, `estado`) VALUES
(1, 1, 1, '2025-11-15 03:20:24', 'completada'),
(2, 1, 2, '2025-11-15 03:20:24', 'completada'),
(3, 3, 3, '2025-11-15 03:20:24', 'completada'),
(4, 6, 4, '2025-11-15 03:20:24', 'completada'),
(5, 7, 5, '2025-11-15 03:20:24', 'completada'),
(6, 7, 6, '2025-11-15 03:20:24', 'completada'),
(7, 9, 7, '2025-11-15 03:20:24', 'completada'),
(8, 10, 8, '2025-11-15 03:20:24', 'completada'),
(9, 10, 9, '2025-11-15 03:20:24', 'completada'),
(10, 11, 10, '2025-11-15 03:20:24', 'completada'),
(11, 12, 1, '2025-11-15 03:20:24', 'completada'),
(12, 13, 2, '2025-11-15 03:20:24', 'completada'),
(13, 2, 3, '2025-11-15 03:20:24', 'pendiente'),
(14, 4, 4, '2025-11-15 03:20:24', 'pendiente'),
(15, 5, 5, '2025-11-15 03:20:24', 'pendiente'),
(16, 8, 6, '2025-11-15 03:20:24', 'pendiente'),
(17, 14, 7, '2025-11-15 03:20:24', 'pendiente'),
(18, 2, 8, '2025-11-15 03:20:24', 'cancelada'),
(19, 4, 9, '2025-11-15 03:20:24', 'cancelada'),
(20, 15, 10, '2025-11-15 03:20:24', 'cancelada'),
(21, 16, 21, '2025-11-16 06:30:00', 'completada'),
(22, 16, 22, '2025-11-16 06:30:05', 'completada'),
(23, 17, 23, '2025-11-16 06:30:10', 'completada'),
(24, 17, 24, '2025-11-16 06:30:15', 'completada'),
(25, 17, 25, '2025-11-16 06:30:20', 'completada'),
(26, 18, 26, '2025-11-16 06:30:25', 'completada'),
(27, 19, 27, '2025-11-16 06:30:30', 'completada'),
(28, 20, 28, '2025-11-16 06:30:35', 'completada'),
(29, 20, 29, '2025-11-16 06:30:40', 'completada'),
(30, 20, 30, '2025-11-16 06:30:45', 'completada'),
(31, 21, 31, '2025-11-16 06:30:50', 'completada'),
(32, 22, 32, '2025-11-16 06:30:55', 'completada'),
(33, 23, 33, '2025-11-16 06:31:00', 'completada'),
(34, 23, 34, '2025-11-16 06:31:05', 'completada'),
(35, 24, 35, '2025-11-16 06:31:10', 'completada'),
(36, 16, 36, '2025-11-16 06:31:15', 'pendiente'),
(37, 17, 37, '2025-11-16 06:31:20', 'pendiente'),
(38, 18, 38, '2025-11-16 06:31:25', 'pendiente'),
(39, 20, 39, '2025-11-16 06:31:30', 'pendiente'),
(40, 25, 40, '2025-11-16 06:31:35', 'pendiente');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `perfiles_asesores`
--

CREATE TABLE `perfiles_asesores` (
  `id_asesor` int NOT NULL,
  `conteo_asesorias` int DEFAULT '0',
  `calificacion_promedio` decimal(2,1) DEFAULT '0.0' COMMENT 'Calificacion promedio redondeada a un decimal (0.0 a 5.0)'
) ;

--
-- Volcado de datos para la tabla `perfiles_asesores`
--

INSERT INTO `perfiles_asesores` (`id_asesor`, `conteo_asesorias`, `calificacion_promedio`) VALUES
(11, 5, 4.6),
(12, 0, 0.0),
(13, 6, 4.7),
(14, 6, 3.7),
(15, 2, 2.0),
(16, 2, 5.0),
(17, 3, 3.3),
(18, 1, 4.0),
(19, 1, 4.0),
(20, 0, 0.0);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `roles`
--

CREATE TABLE `roles` (
  `id_rol` int NOT NULL,
  `nombre_rol` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `roles`
--

INSERT INTO `roles` (`id_rol`, `nombre_rol`) VALUES
(1, 'Asesor'),
(2, 'Asesorado');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `temas`
--

CREATE TABLE `temas` (
  `id_tema` int NOT NULL,
  `nombre_tema` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fk_area` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `temas`
--

INSERT INTO `temas` (`id_tema`, `nombre_tema`, `fk_area`) VALUES
(1, 'Álgebra Lineal', 1),
(2, 'Cálculo Diferencial', 1),
(3, 'Cálculo Integral', 1),
(4, 'Python Básico', 2),
(5, 'Estructuras de Datos', 2),
(6, 'Bases de Datos', 2),
(7, 'Circuitos Eléctricos', 5),
(8, 'Mecánica de Fluidos', 3),
(9, 'Termodinámica', 5),
(10, 'Inglés Técnico', 4),
(11, 'Francés B1', 4),
(12, 'Diseño UX/UI', 10),
(13, 'Ética en IA', 11),
(14, 'Emprendimiento', 9),
(15, 'Sostenibilidad Urbana', 12);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tokens_recuperacion`
--

CREATE TABLE `tokens_recuperacion` (
  `id_token` int NOT NULL,
  `fk_usuario` int NOT NULL,
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha_expiracion` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id_usuario` int NOT NULL,
  `nombre_completo` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fk_carrera` int NOT NULL,
  `semestre` int NOT NULL,
  `correo` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ruta_foto` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fecha_registro` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `es_activo` tinyint(1) DEFAULT '1',
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_modificacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id_usuario`, `nombre_completo`, `fk_carrera`, `semestre`, `correo`, `password_hash`, `ruta_foto`, `fecha_registro`, `es_activo`, `fecha_creacion`, `fecha_modificacion`) VALUES
(1, 'Ana López García', 3, 5, 'ana.lopez@estudiante.utem.mx', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NULL, '2025-11-15 03:08:43', 1, '2025-11-15 03:08:43', '2025-11-15 03:08:43'),
(2, 'Carlos Ruiz Mendoza', 1, 7, 'carlos.ruiz@estudiante.utem.mx', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NULL, '2025-11-15 03:08:43', 1, '2025-11-15 03:08:43', '2025-11-15 03:08:43'),
(3, 'María Fernández Soto', 7, 3, 'maria.fernandez@estudiante.utem.mx', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NULL, '2025-11-15 03:08:43', 1, '2025-11-15 03:08:43', '2025-11-15 03:08:43'),
(4, 'José Martínez Vega', 9, 6, 'jose.martinez@estudiante.utem.mx', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NULL, '2025-11-15 03:08:43', 1, '2025-11-15 03:08:43', '2025-11-15 03:08:43'),
(5, 'Laura Gómez Pérez', 2, 4, 'laura.gomez@estudiante.utem.mx', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NULL, '2025-11-15 03:08:43', 1, '2025-11-15 03:08:43', '2025-11-15 03:08:43'),
(6, 'Pedro Sánchez Díaz', 5, 8, 'pedro.sanchez@estudiante.utem.mx', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NULL, '2025-11-15 03:08:43', 1, '2025-11-15 03:08:43', '2025-11-15 03:08:43'),
(7, 'Sofía Herrera Cruz', 13, 2, 'sofia.herrera@estudiante.utem.mx', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NULL, '2025-11-15 03:08:43', 1, '2025-11-15 03:08:43', '2025-11-15 03:08:43'),
(8, 'Miguel Torres Ramos', 11, 9, 'miguel.torres@estudiante.utem.mx', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NULL, '2025-11-15 03:08:43', 1, '2025-11-15 03:08:43', '2025-11-15 03:08:43'),
(9, 'Elena Castro Ortiz', 4, 5, 'elena.castro@estudiante.utem.mx', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NULL, '2025-11-15 03:08:43', 1, '2025-11-15 03:08:43', '2025-11-15 03:08:43'),
(10, 'Daniel Morales Nava', 6, 7, 'daniel.morales@estudiante.utem.mx', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NULL, '2025-11-15 03:08:43', 1, '2025-11-15 03:08:43', '2025-11-15 03:08:43'),
(11, 'Roberto Jiménez', 3, 10, 'roberto.jimenez@utem.mx', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '/fotos/roberto.jpg', '2025-11-15 03:08:43', 1, '2025-11-15 03:08:43', '2025-11-15 15:01:34'),
(12, 'Claudia Morales', 2, 10, 'claudia.morales@utem.mx', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '/fotos/claudia.jpg', '2025-11-15 03:08:43', 1, '2025-11-15 03:08:43', '2025-11-15 15:02:08'),
(13, 'Luis Hernández', 1, 10, 'luis.hernandez@utem.mx', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '/fotos/luis.jpg', '2025-11-15 03:08:43', 1, '2025-11-15 03:08:43', '2025-11-15 15:02:26'),
(14, 'Isabel Vargas', 9, 10, 'isabel.vargas@utem.mx', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '/fotos/isabel.jpg', '2025-11-15 03:08:43', 1, '2025-11-15 03:08:43', '2025-11-15 15:02:45'),
(15, 'Javier Ortiz', 5, 10, 'javier.ortiz@utem.mx', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '/fotos/javier.jpg', '2025-11-15 03:08:43', 1, '2025-11-15 03:08:43', '2025-11-15 15:03:00'),
(16, 'Patricia Reyes', 4, 10, 'patricia.reyes@utem.mx', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '/fotos/patricia.jpg', '2025-11-15 03:08:43', 1, '2025-11-15 03:08:43', '2025-11-15 15:03:11'),
(17, 'Fernando Castillo', 7, 10, 'fernando.castillo@utem.mx', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '/fotos/fernando.jpg', '2025-11-15 03:08:43', 1, '2025-11-15 03:08:43', '2025-11-15 15:03:23'),
(18, 'Valeria Domínguez', 10, 10, 'valeria.dominguez@utem.mx', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '/fotos/valeria.jpg', '2025-11-15 03:08:43', 1, '2025-11-15 03:08:43', '2025-11-15 15:03:35'),
(19, 'Andrés Salazar', 13, 10, 'andres.salazar@utem.mx', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '/fotos/andres.jpg', '2025-11-15 03:08:43', 1, '2025-11-15 03:08:43', '2025-11-15 15:03:48'),
(20, 'Camila Rivera', 11, 10, 'camila.rivera@utem.mx', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '/fotos/camila.jpg', '2025-11-15 03:08:43', 1, '2025-11-15 03:08:43', '2025-11-15 15:04:02'),
(21, 'Felipe Soto Bravo', 1, 3, 'felipe.soto@estudiante.utem.mx', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NULL, '2025-11-16 06:29:00', 1, '2025-11-16 06:29:00', '2025-11-16 06:29:00'),
(22, 'Gabriela Naranjo Diez', 2, 5, 'gabriela.naranjo@estudiante.utem.mx', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NULL, '2025-11-16 06:29:00', 1, '2025-11-16 06:29:00', '2025-11-16 06:29:00'),
(23, 'Héctor Ibarra Luna', 3, 7, 'hector.ibarra@estudiante.utem.mx', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NULL, '2025-11-16 06:29:00', 1, '2025-11-16 06:29:00', '2025-11-16 06:29:00'),
(24, 'Irene Rojas Quiroz', 4, 2, 'irene.rojas@estudiante.utem.mx', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NULL, '2025-11-16 06:29:00', 1, '2025-11-16 06:29:00', '2025-11-16 06:29:00'),
(25, 'Julián Pardo Ríos', 5, 4, 'julian.pardo@estudiante.utem.mx', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NULL, '2025-11-16 06:29:00', 1, '2025-11-16 06:29:00', '2025-11-16 06:29:00'),
(26, 'Karla Velásquez Cien', 6, 6, 'karla.velasquez@estudiante.utem.mx', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NULL, '2025-11-16 06:29:00', 1, '2025-11-16 06:29:00', '2025-11-16 06:29:00'),
(27, 'Leo Zamora Blanco', 7, 8, 'leo.zamora@estudiante.utem.mx', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NULL, '2025-11-16 06:29:00', 1, '2025-11-16 06:29:00', '2025-11-16 06:29:00'),
(28, 'Marta Núñez Salas', 8, 3, 'marta.nunez@estudiante.utem.mx', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NULL, '2025-11-16 06:29:00', 1, '2025-11-16 06:29:00', '2025-11-16 06:29:00'),
(29, 'Néstor Orozco Ruiz', 9, 5, 'nestor.orozco@estudiante.utem.mx', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NULL, '2025-11-16 06:29:00', 1, '2025-11-16 06:29:00', '2025-11-16 06:29:00'),
(30, 'Olivia Peña Guzmán', 10, 7, 'olivia.pena@estudiante.utem.mx', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NULL, '2025-11-16 06:29:00', 1, '2025-11-16 06:29:00', '2025-11-16 06:29:00'),
(31, 'Pablo Quintero Díaz', 11, 2, 'pablo.quintero@estudiante.utem.mx', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NULL, '2025-11-16 06:29:00', 1, '2025-11-16 06:29:00', '2025-11-16 06:29:00'),
(32, 'Regina Solís Toro', 12, 4, 'regina.solis@estudiante.utem.mx', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NULL, '2025-11-16 06:29:00', 1, '2025-11-16 06:29:00', '2025-11-16 06:29:00'),
(33, 'Samuel Uribe León', 13, 6, 'samuel.uribe@estudiante.utem.mx', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NULL, '2025-11-16 06:29:00', 1, '2025-11-16 06:29:00', '2025-11-16 06:29:00'),
(34, 'Teresa Vega Mota', 1, 8, 'teresa.vega@estudiante.utem.mx', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NULL, '2025-11-16 06:29:00', 1, '2025-11-16 06:29:00', '2025-11-16 06:29:00'),
(35, 'Ulises Wences Luna', 2, 3, 'ulises.wences@estudiante.utem.mx', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NULL, '2025-11-16 06:29:00', 1, '2025-11-16 06:29:00', '2025-11-16 06:29:00'),
(36, 'Viviana Ximénez Pérez', 3, 5, 'viviana.ximenez@estudiante.utem.mx', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NULL, '2025-11-16 06:29:00', 1, '2025-11-16 06:29:00', '2025-11-16 06:29:00'),
(37, 'Walter Yáñez Ríos', 4, 7, 'walter.yanez@estudiante.utem.mx', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NULL, '2025-11-16 06:29:00', 1, '2025-11-16 06:29:00', '2025-11-16 06:29:00'),
(38, 'Ximena Zúñiga Mora', 5, 2, 'ximena.zuniga@estudiante.utem.mx', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NULL, '2025-11-16 06:29:00', 1, '2025-11-16 06:29:00', '2025-11-16 06:29:00'),
(39, 'Yael Alonso Cano', 6, 4, 'yael.alonso@estudiante.utem.mx', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NULL, '2025-11-16 06:29:00', 1, '2025-11-16 06:29:00', '2025-11-16 06:29:00'),
(40, 'Zoe Bravo Durán', 7, 6, 'zoe.bravo@estudiante.utem.mx', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NULL, '2025-11-16 06:29:00', 1, '2025-11-16 06:29:00', '2025-11-16 06:29:00'),
(41, 'ali', 10, 1, 'user@example.com', '$2a$10$P7C.CWjZIOOMPtrFjmtJo..fBNx9leNNZPXO6Uu4Ln2SKFfluFqyy', NULL, '2025-11-18 06:16:24', 1, '2025-11-18 06:16:24', '2025-11-18 06:16:24'),
(42, 'Aline Pérez', 1, 3, 'aline@example.com', '$2a$10$XWYEEpttKUIR5RpC3TTCPuedfGxDcewMBpdA9RnJC0ER2b4omJQ4C', NULL, '2025-11-18 06:23:49', 1, '2025-11-18 06:23:49', '2025-11-18 06:23:49'),
(44, 'Aline Pérez', 1, 3, 'aline8908@example.com', '$2a$10$gxgwhfE9n5u4e.ojh3KFieoYR/4oR96YTiFvmFVmuL4iCkGrpxaAi', NULL, '2025-11-18 06:47:12', 1, '2025-11-18 06:47:12', '2025-11-18 06:47:12'),
(45, 'Aline Pérez', 1, 3, 'aline8900000000008@example.com', '$2a$10$.a2Y8jxGlCAf64FgigvFqO/6xU6ysHiAssXWmKfu3BPDHWmrhVlBy', NULL, '2025-11-18 08:20:27', 1, '2025-11-18 08:20:27', '2025-11-18 08:20:27'),
(46, 'Aline Pérez', 1, 3, 'aloooooooooooooooine@example.com', '$2a$10$qWIxDhyorLojpzLcNFplCu4SvJmboPPT..a4i9ITb6UH4JDcyRicm', NULL, '2025-11-18 16:00:06', 1, '2025-11-18 16:00:06', '2025-11-18 16:00:06');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuario_rol`
--

CREATE TABLE `usuario_rol` (
  `fk_usuario` int NOT NULL,
  `fk_rol` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `usuario_rol`
--

INSERT INTO `usuario_rol` (`fk_usuario`, `fk_rol`) VALUES
(11, 1),
(12, 1),
(13, 1),
(14, 1),
(15, 1),
(16, 1),
(17, 1),
(18, 1),
(19, 1),
(20, 1),
(44, 1),
(45, 1),
(1, 2),
(2, 2),
(3, 2),
(4, 2),
(5, 2),
(6, 2),
(7, 2),
(8, 2),
(9, 2),
(10, 2),
(21, 2),
(22, 2),
(23, 2),
(24, 2),
(25, 2),
(26, 2),
(27, 2),
(28, 2),
(29, 2),
(30, 2),
(31, 2),
(32, 2),
(33, 2),
(34, 2),
(35, 2),
(36, 2),
(37, 2),
(38, 2),
(39, 2),
(40, 2),
(42, 2),
(44, 2),
(45, 2),
(46, 2);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `areas_conocimiento`
--
ALTER TABLE `areas_conocimiento`
  ADD PRIMARY KEY (`id_area`),
  ADD UNIQUE KEY `nombre_area` (`nombre_area`);

--
-- Indices de la tabla `asesores_temas`
--
ALTER TABLE `asesores_temas`
  ADD PRIMARY KEY (`fk_asesor`,`fk_tema`),
  ADD KEY `fk_asesores_temas_temas` (`fk_tema`);

--
-- Indices de la tabla `calificaciones`
--
ALTER TABLE `calificaciones`
  ADD PRIMARY KEY (`id_calificacion`),
  ADD UNIQUE KEY `fk_inscripcion` (`fk_inscripcion`),
  ADD KEY `idx_calificaciones_inscripcion` (`fk_inscripcion`);

--
-- Indices de la tabla `carreras`
--
ALTER TABLE `carreras`
  ADD PRIMARY KEY (`id_carrera`),
  ADD UNIQUE KEY `nombre_carrera` (`nombre_carrera`);

--
-- Indices de la tabla `disponibilidades`
--
ALTER TABLE `disponibilidades`
  ADD PRIMARY KEY (`id_disponibilidad`),
  ADD KEY `fk_disponibilidades_tema` (`fk_tema`),
  ADD KEY `idx_disponibilidades_asesor_fecha` (`fk_asesor`,`fecha_inicio`),
  ADD KEY `idx_disponibilidades_estado` (`es_disponible`),
  ADD KEY `idx_disponibilidades_fecha` (`fecha_inicio`,`fecha_fin`);

--
-- Indices de la tabla `favoritos`
--
ALTER TABLE `favoritos`
  ADD PRIMARY KEY (`id_favorito`),
  ADD UNIQUE KEY `uk_favoritos_asesorado_asesor` (`fk_asesorado`,`fk_asesor`),
  ADD KEY `fk_favoritos_asesor` (`fk_asesor`),
  ADD KEY `idx_favoritos_asesorado` (`fk_asesorado`);

--
-- Indices de la tabla `historial_cancelaciones`
--
ALTER TABLE `historial_cancelaciones`
  ADD PRIMARY KEY (`id_cancelacion`),
  ADD KEY `fk_historial_inscripcion` (`fk_inscripcion`),
  ADD KEY `idx_historial_usuario_cancelo` (`fk_usuario_cancelo`);

--
-- Indices de la tabla `inscripciones_sesion`
--
ALTER TABLE `inscripciones_sesion`
  ADD PRIMARY KEY (`id_inscripcion`),
  ADD UNIQUE KEY `uk_inscripcion_disponibilidad_asesorado` (`fk_disponibilidad`,`fk_asesorado`),
  ADD KEY `idx_inscripciones_estado` (`estado`),
  ADD KEY `idx_inscripciones_disponibilidad` (`fk_disponibilidad`),
  ADD KEY `idx_inscripciones_asesorado` (`fk_asesorado`);

--
-- Indices de la tabla `perfiles_asesores`
--
ALTER TABLE `perfiles_asesores`
  ADD PRIMARY KEY (`id_asesor`);

--
-- Indices de la tabla `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id_rol`),
  ADD UNIQUE KEY `nombre_rol` (`nombre_rol`);

--
-- Indices de la tabla `temas`
--
ALTER TABLE `temas`
  ADD PRIMARY KEY (`id_tema`),
  ADD UNIQUE KEY `nombre_tema` (`nombre_tema`),
  ADD KEY `fk_temas_areas` (`fk_area`),
  ADD KEY `idx_temas_nombre` (`nombre_tema`);

--
-- Indices de la tabla `tokens_recuperacion`
--
ALTER TABLE `tokens_recuperacion`
  ADD PRIMARY KEY (`id_token`),
  ADD UNIQUE KEY `token` (`token`),
  ADD KEY `fk_tokens_usuario` (`fk_usuario`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id_usuario`),
  ADD UNIQUE KEY `correo` (`correo`),
  ADD KEY `fk_usuarios_carreras` (`fk_carrera`),
  ADD KEY `idx_usuarios_correo` (`correo`),
  ADD KEY `idx_usuarios_nombre` (`nombre_completo`),
  ADD KEY `idx_usuarios_activo` (`es_activo`);

--
-- Indices de la tabla `usuario_rol`
--
ALTER TABLE `usuario_rol`
  ADD PRIMARY KEY (`fk_usuario`,`fk_rol`),
  ADD KEY `idx_usuario_rol_rol` (`fk_rol`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `areas_conocimiento`
--
ALTER TABLE `areas_conocimiento`
  MODIFY `id_area` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT de la tabla `calificaciones`
--
ALTER TABLE `calificaciones`
  MODIFY `id_calificacion` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `carreras`
--
ALTER TABLE `carreras`
  MODIFY `id_carrera` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT de la tabla `disponibilidades`
--
ALTER TABLE `disponibilidades`
  MODIFY `id_disponibilidad` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `favoritos`
--
ALTER TABLE `favoritos`
  MODIFY `id_favorito` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT de la tabla `historial_cancelaciones`
--
ALTER TABLE `historial_cancelaciones`
  MODIFY `id_cancelacion` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `inscripciones_sesion`
--
ALTER TABLE `inscripciones_sesion`
  MODIFY `id_inscripcion` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

--
-- AUTO_INCREMENT de la tabla `roles`
--
ALTER TABLE `roles`
  MODIFY `id_rol` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `temas`
--
ALTER TABLE `temas`
  MODIFY `id_tema` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT de la tabla `tokens_recuperacion`
--
ALTER TABLE `tokens_recuperacion`
  MODIFY `id_token` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id_usuario` int NOT NULL AUTO_INCREMENT;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `asesores_temas`
--
ALTER TABLE `asesores_temas`
  ADD CONSTRAINT `fk_asesores_temas_asesores` FOREIGN KEY (`fk_asesor`) REFERENCES `perfiles_asesores` (`id_asesor`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_asesores_temas_temas` FOREIGN KEY (`fk_tema`) REFERENCES `temas` (`id_tema`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `calificaciones`
--
ALTER TABLE `calificaciones`
  ADD CONSTRAINT `fk_calificaciones_inscripcion` FOREIGN KEY (`fk_inscripcion`) REFERENCES `inscripciones_sesion` (`id_inscripcion`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `disponibilidades`
--
ALTER TABLE `disponibilidades`
  ADD CONSTRAINT `fk_disponibilidades_asesor` FOREIGN KEY (`fk_asesor`) REFERENCES `perfiles_asesores` (`id_asesor`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_disponibilidades_tema` FOREIGN KEY (`fk_tema`) REFERENCES `temas` (`id_tema`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Filtros para la tabla `favoritos`
--
ALTER TABLE `favoritos`
  ADD CONSTRAINT `fk_favoritos_asesor` FOREIGN KEY (`fk_asesor`) REFERENCES `perfiles_asesores` (`id_asesor`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_favoritos_asesorado` FOREIGN KEY (`fk_asesorado`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `historial_cancelaciones`
--
ALTER TABLE `historial_cancelaciones`
  ADD CONSTRAINT `fk_historial_inscripcion` FOREIGN KEY (`fk_inscripcion`) REFERENCES `inscripciones_sesion` (`id_inscripcion`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_historial_usuario` FOREIGN KEY (`fk_usuario_cancelo`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Filtros para la tabla `inscripciones_sesion`
--
ALTER TABLE `inscripciones_sesion`
  ADD CONSTRAINT `fk_inscripciones_asesorado` FOREIGN KEY (`fk_asesorado`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_inscripciones_disponibilidad` FOREIGN KEY (`fk_disponibilidad`) REFERENCES `disponibilidades` (`id_disponibilidad`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `perfiles_asesores`
--
ALTER TABLE `perfiles_asesores`
  ADD CONSTRAINT `fk_perfiles_asesores_usuarios` FOREIGN KEY (`id_asesor`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `temas`
--
ALTER TABLE `temas`
  ADD CONSTRAINT `fk_temas_areas` FOREIGN KEY (`fk_area`) REFERENCES `areas_conocimiento` (`id_area`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Filtros para la tabla `tokens_recuperacion`
--
ALTER TABLE `tokens_recuperacion`
  ADD CONSTRAINT `fk_tokens_usuario` FOREIGN KEY (`fk_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD CONSTRAINT `fk_usuarios_carreras` FOREIGN KEY (`fk_carrera`) REFERENCES `carreras` (`id_carrera`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Filtros para la tabla `usuario_rol`
--
ALTER TABLE `usuario_rol`
  ADD CONSTRAINT `fk_usuario_rol_roles` FOREIGN KEY (`fk_rol`) REFERENCES `roles` (`id_rol`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_usuario_rol_usuarios` FOREIGN KEY (`fk_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
