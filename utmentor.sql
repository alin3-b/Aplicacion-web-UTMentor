-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: mysql:3306
-- Generation Time: Nov 13, 2025 at 05:22 AM
-- Server version: 8.4.7
-- PHP Version: 8.3.27

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `utmentor`
--

DELIMITER $$
--
-- Procedures
--
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_actualizar_perfil_asesor` (IN `p_id_asesor` INT)   BEGIN
  UPDATE perfiles_asesores pa
  SET
    pa.conteo_asesorias = (
      SELECT COUNT(*)
      FROM calificaciones c
        INNER JOIN inscripciones_sesion i ON i.id_inscripcion = c.fk_inscripcion
        INNER JOIN disponibilidades d ON d.id_disponibilidad = i.fk_disponibilidad
      WHERE d.fk_asesor = p_id_asesor
    ),
    pa.calificacion_promedio = (
      SELECT IFNULL(AVG(c.puntuacion), 0)
      FROM calificaciones c
        INNER JOIN inscripciones_sesion i ON i.id_inscripcion = c.fk_inscripcion
        INNER JOIN disponibilidades d ON d.id_disponibilidad = i.fk_disponibilidad
      WHERE d.fk_asesor = p_id_asesor
    )
  WHERE pa.id_asesor = p_id_asesor;
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `areas_conocimiento`
--

CREATE TABLE `areas_conocimiento` (
  `id_area` int NOT NULL,
  `nombre_area` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `areas_conocimiento`
--

INSERT INTO `areas_conocimiento` (`id_area`, `nombre_area`) VALUES
(7, 'BiologÃ­a y BiotecnologÃ­a'),
(8, 'Ciencias Sociales'),
(10, 'DiseÃ±o y Artes GrÃ¡ficas'),
(5, 'FÃ­sica'),
(11, 'Humanidades y Ã‰tica'),
(4, 'Idiomas'),
(3, 'IngenierÃ­a'),
(1, 'MatemÃ¡ticas'),
(9, 'Negocios/AdministraciÃ³n'),
(2, 'ProgramaciÃ³n'),
(6, 'QuÃ­mica'),
(12, 'Sostenibilidad/Ambiente');

-- --------------------------------------------------------

--
-- Table structure for table `asesores_temas`
--

CREATE TABLE `asesores_temas` (
  `fk_asesor` int NOT NULL,
  `fk_tema` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `calificaciones`
--

CREATE TABLE `calificaciones` (
  `id_calificacion` int NOT NULL,
  `fk_inscripcion` int NOT NULL,
  `puntuacion` int NOT NULL,
  `comentario` text COLLATE utf8mb4_unicode_ci,
  `fecha_calificacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ;

--
-- Triggers `calificaciones`
--
DELIMITER $$
CREATE TRIGGER `trg_actualizar_perfil_delete` AFTER DELETE ON `calificaciones` FOR EACH ROW BEGIN
  CALL sp_actualizar_perfil_asesor(
    (SELECT d.fk_asesor
     FROM inscripciones_sesion i
       INNER JOIN disponibilidades d ON d.id_disponibilidad = i.fk_disponibilidad
     WHERE i.id_inscripcion = OLD.fk_inscripcion)
  );
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trg_actualizar_perfil_insert` AFTER INSERT ON `calificaciones` FOR EACH ROW BEGIN
  CALL sp_actualizar_perfil_asesor(
    (SELECT d.fk_asesor
     FROM inscripciones_sesion i
       INNER JOIN disponibilidades d ON d.id_disponibilidad = i.fk_disponibilidad
     WHERE i.id_inscripcion = NEW.fk_inscripcion)
  );
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trg_actualizar_perfil_update` AFTER UPDATE ON `calificaciones` FOR EACH ROW BEGIN
  CALL sp_actualizar_perfil_asesor(
    (SELECT d.fk_asesor
     FROM inscripciones_sesion i
       INNER JOIN disponibilidades d ON d.id_disponibilidad = i.fk_disponibilidad
     WHERE i.id_inscripcion = NEW.fk_inscripcion)
  );
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `carreras`
--

CREATE TABLE `carreras` (
  `id_carrera` int NOT NULL,
  `nombre_carrera` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `carreras`
--

INSERT INTO `carreras` (`id_carrera`, `nombre_carrera`) VALUES
(1, 'IngenierÃ­a Civil'),
(2, 'IngenierÃ­a en Alimentos'),
(3, 'IngenierÃ­a en ComputaciÃ³n'),
(4, 'IngenierÃ­a en DiseÃ±o'),
(5, 'IngenierÃ­a en ElectrÃ³nica'),
(6, 'IngenierÃ­a en FÃ­sica Aplicada'),
(8, 'IngenierÃ­a en MecÃ¡nica Automotriz'),
(9, 'IngenierÃ­a en MecatrÃ³nica'),
(7, 'IngenierÃ­a Industrial'),
(10, 'IngenierÃ­a QuÃ­mica en Procesos Sostenibles'),
(11, 'Licenciatura en Ciencias Empresariales'),
(13, 'Licenciatura en Estudios Mexicanos modalidad virtual'),
(12, 'Licenciatura en MatemÃ¡ticas Aplicadas');

-- --------------------------------------------------------

--
-- Table structure for table `disponibilidades`
--

CREATE TABLE `disponibilidades` (
  `id_disponibilidad` int NOT NULL,
  `fk_asesor` int NOT NULL,
  `fecha_inicio` datetime NOT NULL,
  `fecha_fin` datetime NOT NULL,
  `modalidad` enum('presencial','virtual') COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo_sesion` enum('grupal','individual') COLLATE utf8mb4_unicode_ci NOT NULL,
  `fk_tema` int DEFAULT NULL,
  `precio` decimal(10,2) NOT NULL,
  `capacidad` int DEFAULT '1',
  `es_disponible` tinyint(1) DEFAULT '1'
) ;

-- --------------------------------------------------------

--
-- Table structure for table `favoritos`
--

CREATE TABLE `favoritos` (
  `id_favorito` int NOT NULL,
  `fk_asesorado` int NOT NULL,
  `fk_asesor` int NOT NULL,
  `fecha_guardado` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `historial_cancelaciones`
--

CREATE TABLE `historial_cancelaciones` (
  `id_cancelacion` int NOT NULL,
  `fk_inscripcion` int NOT NULL,
  `fk_usuario_cancelo` int DEFAULT NULL,
  `motivo` text COLLATE utf8mb4_unicode_ci,
  `fecha_cancelacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `inscripciones_sesion`
--

CREATE TABLE `inscripciones_sesion` (
  `id_inscripcion` int NOT NULL,
  `fk_disponibilidad` int NOT NULL,
  `fk_asesorado` int NOT NULL,
  `fecha_reserva` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `estado` enum('pendiente','completada','cancelada') COLLATE utf8mb4_unicode_ci DEFAULT 'pendiente'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Triggers `inscripciones_sesion`
--
DELIMITER $$
CREATE TRIGGER `trg_actualizar_estado` AFTER INSERT ON `inscripciones_sesion` FOR EACH ROW BEGIN
  DECLARE cupo_actual INT;
  DECLARE capacidad_max INT;

  SELECT COUNT(*), d.capacidad
  INTO cupo_actual, capacidad_max
  FROM inscripciones_sesion i
    INNER JOIN disponibilidades d ON d.id_disponibilidad = i.fk_disponibilidad
  WHERE i.fk_disponibilidad = NEW.fk_disponibilidad
    AND i.estado != 'cancelada';

  IF cupo_actual >= capacidad_max THEN
    UPDATE disponibilidades
    SET es_disponible = FALSE
    WHERE id_disponibilidad = NEW.fk_disponibilidad;
  ELSEIF cupo_actual < capacidad_max AND es_disponible = FALSE THEN
    UPDATE disponibilidades
    SET es_disponible = TRUE
    WHERE id_disponibilidad = NEW.fk_disponibilidad;
  END IF;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trg_control_cupo` BEFORE INSERT ON `inscripciones_sesion` FOR EACH ROW BEGIN
  DECLARE cupo_actual INT;
  DECLARE capacidad_max INT;

  SELECT COUNT(*), d.capacidad
  INTO cupo_actual, capacidad_max
  FROM inscripciones_sesion i
    INNER JOIN disponibilidades d ON d.id_disponibilidad = i.fk_disponibilidad
  WHERE i.fk_disponibilidad = NEW.fk_disponibilidad
    AND i.estado != 'cancelada';

  IF cupo_actual >= capacidad_max THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Cupo lleno para esta sesiÃ³n';
  END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `perfiles_asesores`
--

CREATE TABLE `perfiles_asesores` (
  `id_asesor` int NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `correo_contacto` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `conteo_asesorias` int DEFAULT '0',
  `calificacion_promedio` decimal(3,2) DEFAULT '0.00'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `politicas`
--

CREATE TABLE `politicas` (
  `id_politica` int NOT NULL,
  `titulo` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `contenido` text COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id_rol` int NOT NULL,
  `nombre_rol` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id_rol`, `nombre_rol`) VALUES
(1, 'Asesor'),
(2, 'Asesorado');

-- --------------------------------------------------------

--
-- Table structure for table `suscripciones`
--

CREATE TABLE `suscripciones` (
  `id_suscripcion` int NOT NULL,
  `fk_asesor` int NOT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_expiracion` date NOT NULL,
  `monto` decimal(10,2) NOT NULL DEFAULT '0.00',
  `metodo_pago` enum('tarjeta','transferencia','paypal','otro') COLLATE utf8mb4_unicode_ci DEFAULT 'otro',
  `es_activa` tinyint(1) DEFAULT '1'
) ;

-- --------------------------------------------------------

--
-- Table structure for table `temas`
--

CREATE TABLE `temas` (
  `id_tema` int NOT NULL,
  `nombre_tema` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fk_area` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tokens_recuperacion`
--

CREATE TABLE `tokens_recuperacion` (
  `id_token` int NOT NULL,
  `fk_usuario` int NOT NULL,
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha_expiracion` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `usuarios`
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
  `fk_rol_activo` int DEFAULT NULL,
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_modificacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ;

-- --------------------------------------------------------

--
-- Table structure for table `usuario_rol`
--

CREATE TABLE `usuario_rol` (
  `fk_usuario` int NOT NULL,
  `fk_rol` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `areas_conocimiento`
--
ALTER TABLE `areas_conocimiento`
  ADD PRIMARY KEY (`id_area`),
  ADD UNIQUE KEY `nombre_area` (`nombre_area`);

--
-- Indexes for table `asesores_temas`
--
ALTER TABLE `asesores_temas`
  ADD PRIMARY KEY (`fk_asesor`,`fk_tema`),
  ADD KEY `fk_asesores_temas_temas` (`fk_tema`);

--
-- Indexes for table `calificaciones`
--
ALTER TABLE `calificaciones`
  ADD PRIMARY KEY (`id_calificacion`),
  ADD UNIQUE KEY `fk_inscripcion` (`fk_inscripcion`),
  ADD KEY `idx_calificaciones_inscripcion` (`fk_inscripcion`);

--
-- Indexes for table `carreras`
--
ALTER TABLE `carreras`
  ADD PRIMARY KEY (`id_carrera`),
  ADD UNIQUE KEY `nombre_carrera` (`nombre_carrera`);

--
-- Indexes for table `disponibilidades`
--
ALTER TABLE `disponibilidades`
  ADD PRIMARY KEY (`id_disponibilidad`),
  ADD KEY `fk_disponibilidades_tema` (`fk_tema`),
  ADD KEY `idx_disponibilidades_asesor_fecha` (`fk_asesor`,`fecha_inicio`),
  ADD KEY `idx_disponibilidades_estado` (`es_disponible`);

--
-- Indexes for table `favoritos`
--
ALTER TABLE `favoritos`
  ADD PRIMARY KEY (`id_favorito`),
  ADD UNIQUE KEY `uk_favoritos_asesorado_asesor` (`fk_asesorado`,`fk_asesor`),
  ADD KEY `fk_favoritos_asesor` (`fk_asesor`);

--
-- Indexes for table `historial_cancelaciones`
--
ALTER TABLE `historial_cancelaciones`
  ADD PRIMARY KEY (`id_cancelacion`),
  ADD KEY `fk_historial_inscripcion` (`fk_inscripcion`),
  ADD KEY `idx_historial_usuario_cancelo` (`fk_usuario_cancelo`);

--
-- Indexes for table `inscripciones_sesion`
--
ALTER TABLE `inscripciones_sesion`
  ADD PRIMARY KEY (`id_inscripcion`),
  ADD UNIQUE KEY `uk_inscripcion_disponibilidad_asesorado` (`fk_disponibilidad`,`fk_asesorado`),
  ADD KEY `fk_inscripciones_asesorado` (`fk_asesorado`),
  ADD KEY `idx_inscripciones_estado` (`estado`),
  ADD KEY `idx_inscripciones_disponibilidad` (`fk_disponibilidad`);

--
-- Indexes for table `perfiles_asesores`
--
ALTER TABLE `perfiles_asesores`
  ADD PRIMARY KEY (`id_asesor`);

--
-- Indexes for table `politicas`
--
ALTER TABLE `politicas`
  ADD PRIMARY KEY (`id_politica`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id_rol`),
  ADD UNIQUE KEY `nombre_rol` (`nombre_rol`);

--
-- Indexes for table `suscripciones`
--
ALTER TABLE `suscripciones`
  ADD PRIMARY KEY (`id_suscripcion`),
  ADD KEY `fk_suscripciones_asesores` (`fk_asesor`);

--
-- Indexes for table `temas`
--
ALTER TABLE `temas`
  ADD PRIMARY KEY (`id_tema`),
  ADD UNIQUE KEY `nombre_tema` (`nombre_tema`),
  ADD KEY `fk_temas_areas` (`fk_area`),
  ADD KEY `idx_temas_nombre` (`nombre_tema`);

--
-- Indexes for table `tokens_recuperacion`
--
ALTER TABLE `tokens_recuperacion`
  ADD PRIMARY KEY (`id_token`),
  ADD UNIQUE KEY `token` (`token`),
  ADD KEY `fk_tokens_usuario` (`fk_usuario`);

--
-- Indexes for table `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id_usuario`),
  ADD UNIQUE KEY `correo` (`correo`),
  ADD KEY `fk_usuarios_carreras` (`fk_carrera`),
  ADD KEY `fk_usuarios_roles` (`fk_rol_activo`),
  ADD KEY `idx_usuarios_correo` (`correo`),
  ADD KEY `idx_usuarios_nombre` (`nombre_completo`),
  ADD KEY `idx_usuarios_activo` (`es_activo`);

--
-- Indexes for table `usuario_rol`
--
ALTER TABLE `usuario_rol`
  ADD PRIMARY KEY (`fk_usuario`,`fk_rol`),
  ADD KEY `fk_usuario_rol_roles` (`fk_rol`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `areas_conocimiento`
--
ALTER TABLE `areas_conocimiento`
  MODIFY `id_area` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `calificaciones`
--
ALTER TABLE `calificaciones`
  MODIFY `id_calificacion` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `carreras`
--
ALTER TABLE `carreras`
  MODIFY `id_carrera` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `disponibilidades`
--
ALTER TABLE `disponibilidades`
  MODIFY `id_disponibilidad` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `favoritos`
--
ALTER TABLE `favoritos`
  MODIFY `id_favorito` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `historial_cancelaciones`
--
ALTER TABLE `historial_cancelaciones`
  MODIFY `id_cancelacion` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `inscripciones_sesion`
--
ALTER TABLE `inscripciones_sesion`
  MODIFY `id_inscripcion` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `politicas`
--
ALTER TABLE `politicas`
  MODIFY `id_politica` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id_rol` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `suscripciones`
--
ALTER TABLE `suscripciones`
  MODIFY `id_suscripcion` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `temas`
--
ALTER TABLE `temas`
  MODIFY `id_tema` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tokens_recuperacion`
--
ALTER TABLE `tokens_recuperacion`
  MODIFY `id_token` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id_usuario` int NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `asesores_temas`
--
ALTER TABLE `asesores_temas`
  ADD CONSTRAINT `fk_asesores_temas_asesores` FOREIGN KEY (`fk_asesor`) REFERENCES `perfiles_asesores` (`id_asesor`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_asesores_temas_temas` FOREIGN KEY (`fk_tema`) REFERENCES `temas` (`id_tema`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `calificaciones`
--
ALTER TABLE `calificaciones`
  ADD CONSTRAINT `fk_calificaciones_inscripcion` FOREIGN KEY (`fk_inscripcion`) REFERENCES `inscripciones_sesion` (`id_inscripcion`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `disponibilidades`
--
ALTER TABLE `disponibilidades`
  ADD CONSTRAINT `fk_disponibilidades_asesor` FOREIGN KEY (`fk_asesor`) REFERENCES `perfiles_asesores` (`id_asesor`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_disponibilidades_tema` FOREIGN KEY (`fk_tema`) REFERENCES `temas` (`id_tema`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `favoritos`
--
ALTER TABLE `favoritos`
  ADD CONSTRAINT `fk_favoritos_asesor` FOREIGN KEY (`fk_asesor`) REFERENCES `perfiles_asesores` (`id_asesor`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_favoritos_asesorado` FOREIGN KEY (`fk_asesorado`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `historial_cancelaciones`
--
ALTER TABLE `historial_cancelaciones`
  ADD CONSTRAINT `fk_historial_inscripcion` FOREIGN KEY (`fk_inscripcion`) REFERENCES `inscripciones_sesion` (`id_inscripcion`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_historial_usuario` FOREIGN KEY (`fk_usuario_cancelo`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `inscripciones_sesion`
--
ALTER TABLE `inscripciones_sesion`
  ADD CONSTRAINT `fk_inscripciones_asesorado` FOREIGN KEY (`fk_asesorado`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_inscripciones_disponibilidad` FOREIGN KEY (`fk_disponibilidad`) REFERENCES `disponibilidades` (`id_disponibilidad`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `perfiles_asesores`
--
ALTER TABLE `perfiles_asesores`
  ADD CONSTRAINT `fk_perfiles_asesores_usuarios` FOREIGN KEY (`id_asesor`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `suscripciones`
--
ALTER TABLE `suscripciones`
  ADD CONSTRAINT `fk_suscripciones_asesores` FOREIGN KEY (`fk_asesor`) REFERENCES `perfiles_asesores` (`id_asesor`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `temas`
--
ALTER TABLE `temas`
  ADD CONSTRAINT `fk_temas_areas` FOREIGN KEY (`fk_area`) REFERENCES `areas_conocimiento` (`id_area`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `tokens_recuperacion`
--
ALTER TABLE `tokens_recuperacion`
  ADD CONSTRAINT `fk_tokens_usuario` FOREIGN KEY (`fk_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `usuarios`
--
ALTER TABLE `usuarios`
  ADD CONSTRAINT `fk_usuarios_carreras` FOREIGN KEY (`fk_carrera`) REFERENCES `carreras` (`id_carrera`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_usuarios_roles` FOREIGN KEY (`fk_rol_activo`) REFERENCES `roles` (`id_rol`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `usuario_rol`
--
ALTER TABLE `usuario_rol`
  ADD CONSTRAINT `fk_usuario_rol_roles` FOREIGN KEY (`fk_rol`) REFERENCES `roles` (`id_rol`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_usuario_rol_usuarios` FOREIGN KEY (`fk_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
