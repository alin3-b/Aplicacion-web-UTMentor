/*
 * migration_001_crear_esquema_utmentor_CORREGIDO_v1.5.sql
 * Autor: Aline Pérez (actualizado por Grok)
 * Fecha: 2025-11-14
 * Versión: 1.5 - Eliminadas suscripciones y pagos
 */
-- Forzar compatibilidad de acentos y eñes
SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;
SET CHARACTER SET utf8mb4;

-- Crear base de datos
CREATE DATABASE IF NOT EXISTS utmentor CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE utmentor;

-- =========================================================
-- 1. CATÁLOGOS BÁSICOS
-- =========================================================
CREATE TABLE IF NOT EXISTS carreras (
  id_carrera INT AUTO_INCREMENT PRIMARY KEY,
  nombre_carrera VARCHAR(100) UNIQUE NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS areas_conocimiento (
  id_area INT AUTO_INCREMENT PRIMARY KEY,
  nombre_area VARCHAR(100) UNIQUE NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS roles (
  id_rol INT AUTO_INCREMENT PRIMARY KEY,
  nombre_rol VARCHAR(50) UNIQUE NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS temas (
  id_tema INT AUTO_INCREMENT PRIMARY KEY,
  nombre_tema VARCHAR(100) UNIQUE NOT NULL,
  fk_area INT NOT NULL,
  CONSTRAINT fk_temas_areas
    FOREIGN KEY (fk_area) REFERENCES areas_conocimiento(id_area)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  INDEX idx_temas_nombre (nombre_tema)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- 2. DATOS INICIALES OBLIGATORIOS
-- =========================================================
INSERT IGNORE INTO roles (nombre_rol) VALUES
  ('Asesor'), ('Asesorado');

INSERT IGNORE INTO areas_conocimiento (nombre_area) VALUES
  ('Matemáticas'), ('Programación'), ('Ingeniería'), ('Idiomas'),
  ('Física'), ('Química'), ('Biología y Biotecnología'),
  ('Ciencias Sociales'), ('Negocios/Administración'),
  ('Diseño y Artes Gráficas'), ('Humanidades y Ética'),
  ('Sostenibilidad/Ambiente');

INSERT IGNORE INTO carreras (nombre_carrera) VALUES
  ('Ingeniería Civil'), ('Ingeniería en Alimentos'),
  ('Ingeniería en Computación'), ('Ingeniería en Diseño'),
  ('Ingeniería en Electrónica'), ('Ingeniería en Física Aplicada'),
  ('Ingeniería Industrial'), ('Ingeniería en Mecánica Automotriz'),
  ('Ingeniería en Mecatrónica'),
  ('Ingeniería Química en Procesos Sostenibles'),
  ('Licenciatura en Ciencias Empresariales'),
  ('Licenciatura en Matemáticas Aplicadas'),
  ('Licenciatura en Estudios Mexicanos modalidad virtual');

-- =========================================================
-- 3. USUARIOS
-- =========================================================
CREATE TABLE IF NOT EXISTS usuarios (
  id_usuario INT AUTO_INCREMENT PRIMARY KEY,
  nombre_completo VARCHAR(100) NOT NULL,
  fk_carrera INT NOT NULL,
  semestre INT NOT NULL CHECK (semestre BETWEEN 1 AND 10),
  correo VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  ruta_foto VARCHAR(255),
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  es_activo BOOLEAN DEFAULT TRUE,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_usuarios_carreras
    FOREIGN KEY (fk_carrera) REFERENCES carreras(id_carrera)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  INDEX idx_usuarios_correo (correo),
  INDEX idx_usuarios_nombre (nombre_completo),
  INDEX idx_usuarios_activo (es_activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- 4. ROLES Y SEGURIDAD
-- =========================================================
CREATE TABLE IF NOT EXISTS usuario_rol (
  fk_usuario INT NOT NULL,
  fk_rol INT NOT NULL,
  PRIMARY KEY (fk_usuario, fk_rol),
  CONSTRAINT fk_usuario_rol_usuarios
    FOREIGN KEY (fk_usuario) REFERENCES usuarios(id_usuario)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_usuario_rol_roles
    FOREIGN KEY (fk_rol) REFERENCES roles(id_rol)
    ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX idx_usuario_rol_rol (fk_rol)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tokens_recuperacion (
  id_token INT AUTO_INCREMENT PRIMARY KEY,
  fk_usuario INT NOT NULL,
  token VARCHAR(255) UNIQUE NOT NULL,
  fecha_expiracion DATETIME NOT NULL,
  CONSTRAINT fk_tokens_usuario
    FOREIGN KEY (fk_usuario) REFERENCES usuarios(id_usuario)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- 5. PERFIL DE ASESOR (1:1) - Nota: validación por trigger
-- =========================================================
CREATE TABLE IF NOT EXISTS perfiles_asesores (
  id_asesor INT PRIMARY KEY,
  conteo_asesorias INT DEFAULT 0 CHECK (conteo_asesorias >= 0),
  calificacion_promedio DECIMAL(3,2) DEFAULT 0.00 CHECK (calificacion_promedio BETWEEN 0 AND 5),
  CONSTRAINT fk_perfiles_asesores_usuarios
    FOREIGN KEY (id_asesor) REFERENCES usuarios(id_usuario)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- 6. TEMAS DEL ASESOR
-- =========================================================
CREATE TABLE IF NOT EXISTS asesores_temas (
  fk_asesor INT NOT NULL,
  fk_tema INT NOT NULL,
  PRIMARY KEY (fk_asesor, fk_tema),
  CONSTRAINT fk_asesores_temas_asesores
    FOREIGN KEY (fk_asesor) REFERENCES perfiles_asesores(id_asesor)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_asesores_temas_temas
    FOREIGN KEY (fk_tema) REFERENCES temas(id_tema)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- 7. FAVORITOS
-- =========================================================
CREATE TABLE IF NOT EXISTS favoritos (
  id_favorito INT AUTO_INCREMENT PRIMARY KEY,
  fk_asesorado INT NOT NULL,
  fk_asesor INT NOT NULL,
  fecha_guardado TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uk_favoritos_asesorado_asesor UNIQUE (fk_asesorado, fk_asesor),
  CONSTRAINT fk_favoritos_asesorado
    FOREIGN KEY (fk_asesorado) REFERENCES usuarios(id_usuario)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_favoritos_asesor
    FOREIGN KEY (fk_asesor) REFERENCES perfiles_asesores(id_asesor)
    ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX idx_favoritos_asesorado (fk_asesorado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- 8. DISPONIBILIDADES
-- =========================================================
CREATE TABLE IF NOT EXISTS disponibilidades (
  id_disponibilidad INT AUTO_INCREMENT PRIMARY KEY,
  fk_asesor INT NOT NULL,
  fecha_inicio DATETIME NOT NULL,
  fecha_fin DATETIME NOT NULL,
  modalidad ENUM('presencial', 'virtual') NOT NULL,
  tipo_sesion ENUM('grupal', 'individual') NOT NULL,
  fk_tema INT NULL,
  precio DECIMAL(10,2) NOT NULL CHECK (precio >= 0),
  capacidad INT DEFAULT 1 CHECK (capacidad >= 1),
  es_disponible BOOLEAN DEFAULT TRUE,
  CONSTRAINT chk_fechas_disponibilidad CHECK (fecha_fin > fecha_inicio),
  CONSTRAINT chk_capacidad_grupal CHECK (
    (tipo_sesion = 'grupal' AND capacidad > 1) OR
    (tipo_sesion = 'individual' AND capacidad = 1)
  ),
  CONSTRAINT fk_disponibilidades_asesor
    FOREIGN KEY (fk_asesor) REFERENCES perfiles_asesores(id_asesor)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_disponibilidades_tema
    FOREIGN KEY (fk_tema) REFERENCES temas(id_tema)
    ON DELETE SET NULL ON UPDATE CASCADE,
  INDEX idx_disponibilidades_asesor_fecha (fk_asesor, fecha_inicio),
  INDEX idx_disponibilidades_estado (es_disponible),
  INDEX idx_disponibilidades_fecha (fecha_inicio, fecha_fin)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- 9. INSCRIPCIONES
-- =========================================================
CREATE TABLE IF NOT EXISTS inscripciones_sesion (
  id_inscripcion INT AUTO_INCREMENT PRIMARY KEY,
  fk_disponibilidad INT NOT NULL,
  fk_asesorado INT NOT NULL,
  fecha_reserva TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  estado ENUM('pendiente', 'completada', 'cancelada') DEFAULT 'pendiente',
  CONSTRAINT uk_inscripcion_disponibilidad_asesorado UNIQUE (fk_disponibilidad, fk_asesorado),
  CONSTRAINT fk_inscripciones_disponibilidad
    FOREIGN KEY (fk_disponibilidad) REFERENCES disponibilidades(id_disponibilidad)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_inscripciones_asesorado
    FOREIGN KEY (fk_asesorado) REFERENCES usuarios(id_usuario)
    ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX idx_inscripciones_estado (estado),
  INDEX idx_inscripciones_disponibilidad (fk_disponibilidad),
  INDEX idx_inscripciones_asesorado (fk_asesorado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- 10. CALIFICACIONES
-- =========================================================
CREATE TABLE IF NOT EXISTS calificaciones (
  id_calificacion INT AUTO_INCREMENT PRIMARY KEY,
  fk_inscripcion INT UNIQUE NOT NULL,
  puntuacion INT NOT NULL CHECK (puntuacion BETWEEN 0 AND 5),
  comentario TEXT,
  fecha_calificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_calificaciones_inscripcion
    FOREIGN KEY (fk_inscripcion) REFERENCES inscripciones_sesion(id_inscripcion)
    ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX idx_calificaciones_inscripcion (fk_inscripcion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- 11. HISTORIAL DE CANCELACIONES
-- =========================================================
CREATE TABLE IF NOT EXISTS historial_cancelaciones (
  id_cancelacion INT AUTO_INCREMENT PRIMARY KEY,
  fk_inscripcion INT NOT NULL,
  fk_usuario_cancelo INT NULL,
  motivo TEXT,
  fecha_cancelacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_historial_inscripcion
    FOREIGN KEY (fk_inscripcion) REFERENCES inscripciones_sesion(id_inscripcion)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_historial_usuario
    FOREIGN KEY (fk_usuario_cancelo) REFERENCES usuarios(id_usuario)
    ON DELETE SET NULL ON UPDATE CASCADE,
  INDEX idx_historial_usuario_cancelo (fk_usuario_cancelo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- 12. PROCEDIMIENTO: Actualizar perfil del asesor
-- =========================================================
DELIMITER //
DROP PROCEDURE IF EXISTS sp_actualizar_perfil_asesor//
CREATE PROCEDURE sp_actualizar_perfil_asesor(
  IN p_id_asesor INT
)
BEGIN
  IF p_id_asesor IS NULL THEN
    LEAVE sp_end;
  END IF;
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
  sp_end:
  SELECT 1;
END//
DELIMITER ;

-- =========================================================
-- 13. TRIGGERS
-- =========================================================
DELIMITER //

-- A) Validar rol Asesor
DROP TRIGGER IF EXISTS trg_validar_perfil_asesor_insert//
CREATE TRIGGER trg_validar_perfil_asesor_insert
BEFORE INSERT ON perfiles_asesores
FOR EACH ROW
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM usuario_rol ur
    INNER JOIN roles r ON r.id_rol = ur.fk_rol
    WHERE ur.fk_usuario = NEW.id_asesor AND r.nombre_rol = 'Asesor'
  ) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Solo usuarios con rol Asesor pueden tener perfil de asesor';
  END IF;
END//

DROP TRIGGER IF EXISTS trg_validar_perfil_asesor_update//
CREATE TRIGGER trg_validar_perfil_asesor_update
BEFORE UPDATE ON perfiles_asesores
FOR EACH ROW
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM usuario_rol ur
    INNER JOIN roles r ON r.id_rol = ur.fk_rol
    WHERE ur.fk_usuario = NEW.id_asesor AND r.nombre_rol = 'Asesor'
  ) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Solo usuarios con rol Asesor pueden tener perfil de asesor';
  END IF;
END//

-- B) Crear perfil al asignar rol Asesor
DROP TRIGGER IF EXISTS trg_crear_perfil_al_insertar_rol//
CREATE TRIGGER trg_crear_perfil_al_insertar_rol
AFTER INSERT ON usuario_rol
FOR EACH ROW
BEGIN
  DECLARE rol_nombre VARCHAR(50);
  SELECT nombre_rol INTO rol_nombre FROM roles WHERE id_rol = NEW.fk_rol LIMIT 1;
  IF rol_nombre = 'Asesor' THEN
    INSERT IGNORE INTO perfiles_asesores (id_asesor) VALUES (NEW.fk_usuario);
  END IF;
END//

-- C) Eliminar perfil si se quita rol Asesor
DROP TRIGGER IF EXISTS trg_borrar_perfil_al_eliminar_rol//
CREATE TRIGGER trg_borrar_perfil_al_eliminar_rol
AFTER DELETE ON usuario_rol
FOR EACH ROW
BEGIN
  DECLARE rol_nombre VARCHAR(50);
  SELECT nombre_rol INTO rol_nombre FROM roles WHERE id_rol = OLD.fk_rol LIMIT 1;
  IF rol_nombre = 'Asesor' AND NOT EXISTS (
    SELECT 1 FROM usuario_rol ur
    INNER JOIN roles r ON r.id_rol = ur.fk_rol
    WHERE ur.fk_usuario = OLD.fk_usuario AND r.nombre_rol = 'Asesor'
  ) THEN
    DELETE FROM perfiles_asesores WHERE id_asesor = OLD.fk_usuario;
  END IF;
END//

-- D) Control de cupo
DROP TRIGGER IF EXISTS trg_control_cupo//
CREATE TRIGGER trg_control_cupo
BEFORE INSERT ON inscripciones_sesion
FOR EACH ROW
BEGIN
  DECLARE cupo_actual INT DEFAULT 0;
  DECLARE capacidad_max INT DEFAULT 0;
  SELECT COUNT(*) INTO cupo_actual
  FROM inscripciones_sesion
  WHERE fk_disponibilidad = NEW.fk_disponibilidad AND estado != 'cancelada';
  SET cupo_actual = cupo_actual + 1;
  SELECT capacidad INTO capacidad_max
  FROM disponibilidades WHERE id_disponibilidad = NEW.fk_disponibilidad LIMIT 1;
  IF capacidad_max IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Disponibilidad no existe';
  ELSEIF cupo_actual > capacidad_max THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cupo lleno para esta sesión';
  END IF;
END//

-- E) Actualizar disponibilidad
DROP TRIGGER IF EXISTS trg_actualizar_estado//
CREATE TRIGGER trg_actualizar_estado
AFTER INSERT ON inscripciones_sesion
FOR EACH ROW
BEGIN
  DECLARE cupo_actual INT DEFAULT 0;
  DECLARE capacidad_max INT DEFAULT 0;
  SELECT COUNT(*) INTO cupo_actual
  FROM inscripciones_sesion
  WHERE fk_disponibilidad = NEW.fk_disponibilidad AND estado != 'cancelada';
  SELECT capacidad INTO capacidad_max
  FROM disponibilidades WHERE id_disponibilidad = NEW.fk_disponibilidad LIMIT 1;
  IF capacidad_max IS NOT NULL AND cupo_actual >= capacidad_max THEN
    UPDATE disponibilidades SET es_disponible = FALSE WHERE id_disponibilidad = NEW.fk_disponibilidad;
  END IF;
END//

-- F) Validar calificación
DROP TRIGGER IF EXISTS trg_validar_calificacion_before_insert//
CREATE TRIGGER trg_validar_calificacion_before_insert
BEFORE INSERT ON calificaciones
FOR EACH ROW
BEGIN
  DECLARE estado_ins VARCHAR(20);
  SELECT estado INTO estado_ins
  FROM inscripciones_sesion WHERE id_inscripcion = NEW.fk_inscripcion LIMIT 1;
  IF estado_ins IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Inscripción no encontrada';
  ELSEIF estado_ins <> 'completada' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Solo se pueden calificar inscripciones completadas';
  END IF;
END//

-- G) Actualizar perfil tras calificación
DROP TRIGGER IF EXISTS trg_actualizar_perfil_insert//
CREATE TRIGGER trg_actualizar_perfil_insert
AFTER INSERT ON calificaciones
FOR EACH ROW
BEGIN
  DECLARE v_asesor_id INT DEFAULT NULL;
  SET v_asesor_id = (
    SELECT d.fk_asesor FROM inscripciones_sesion i
    JOIN disponibilidades d ON d.id_disponibilidad = i.fk_disponibilidad
    WHERE i.id_inscripcion = NEW.fk_inscripcion LIMIT 1
  );
  IF v_asesor_id IS NOT NULL THEN
    CALL sp_actualizar_perfil_asesor(v_asesor_id);
  END IF;
END//

DROP TRIGGER IF EXISTS trg_actualizar_perfil_update//
CREATE TRIGGER trg_actualizar_perfil_update
AFTER UPDATE ON calificaciones
FOR EACH ROW
BEGIN
  DECLARE v_asesor_id INT DEFAULT NULL;
  SET v_asesor_id = (
    SELECT d.fk_asesor FROM inscripciones_sesion i
    JOIN disponibilidades d ON d.id_disponibilidad = i.fk_disponibilidad
    WHERE i.id_inscripcion = NEW.fk_inscripcion LIMIT 1
  );
  IF v_asesor_id IS NOT NULL THEN
    CALL sp_actualizar_perfil_asesor(v_asesor_id);
  END IF;
END//

DROP TRIGGER IF EXISTS trg_actualizar_perfil_delete//
CREATE TRIGGER trg_actualizar_perfil_delete
AFTER DELETE ON calificaciones
FOR EACH ROW
BEGIN
  DECLARE v_asesor_id INT DEFAULT NULL;
  SET v_asesor_id = (
    SELECT d.fk_asesor FROM inscripciones_sesion i
    JOIN disponibilidades d ON d.id_disponibilidad = i.fk_disponibilidad
    WHERE i.id_inscripcion = OLD.fk_inscripcion LIMIT 1
  );
  IF v_asesor_id IS NOT NULL THEN
    CALL sp_actualizar_perfil_asesor(v_asesor_id);
  END IF;
END//

DELIMITER ;

-- =========================================================
-- FIN DEL SCRIPT - v1.5 (sin suscripciones)
-- =========================================================