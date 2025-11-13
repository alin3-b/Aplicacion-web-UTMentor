/*
 * Script: migration_001_crear_esquema_utmentor.sql
 * Autor: Aline Pérez
 * Fecha: 2025-11-08
 * Descripción: Creación completa del esquema UTmentor con datos iniciales,
 *              índices, triggers y procedimientos. Listo para producción.
 */

-- ===================================================================
-- U T M E N T O R  -  SCRIPT FINAL COMPLETO 100% SEGURO Y OPTIMIZADO
-- Versión: 1.2 | MySQL 8+ | Motor: InnoDB | Listo para Producción
-- ===================================================================
CREATE DATABASE IF NOT EXISTS utmentor CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci; 
USE utmentor;

-- =========================================================
-- 1. CATÁLOGOS BÁSICOS
-- =========================================================

CREATE TABLE carreras (
  id_carrera INT AUTO_INCREMENT PRIMARY KEY,
  nombre_carrera VARCHAR(100) UNIQUE NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE areas_conocimiento (
  id_area INT AUTO_INCREMENT PRIMARY KEY,
  nombre_area VARCHAR(100) UNIQUE NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE roles (
  id_rol INT AUTO_INCREMENT PRIMARY KEY,
  nombre_rol VARCHAR(50) UNIQUE NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE temas (
  id_tema INT AUTO_INCREMENT PRIMARY KEY,
  nombre_tema VARCHAR(100) UNIQUE NOT NULL,
  fk_area INT NOT NULL,
  CONSTRAINT fk_temas_areas
    FOREIGN KEY (fk_area) REFERENCES areas_conocimiento(id_area)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  INDEX idx_temas_nombre (nombre_tema)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE politicas (
  id_politica INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(100) NOT NULL,
  contenido TEXT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- 2. DATOS INICIALES OBLIGATORIOS
-- =========================================================

INSERT INTO roles (nombre_rol) VALUES
  ('Asesor'), ('Asesorado');

INSERT INTO areas_conocimiento (nombre_area) VALUES
  ('Matemáticas'), ('Programación'), ('Ingeniería'), ('Idiomas'),
  ('Física'), ('Química'), ('Biología y Biotecnología'),
  ('Ciencias Sociales'), ('Negocios/Administración'),
  ('Diseño y Artes Gráficas'), ('Humanidades y Ética'),
  ('Sostenibilidad/Ambiente');

INSERT INTO carreras (nombre_carrera) VALUES
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

CREATE TABLE usuarios (
  id_usuario INT AUTO_INCREMENT PRIMARY KEY,
  nombre_completo VARCHAR(100) NOT NULL,
  fk_carrera INT NOT NULL,
  semestre INT NOT NULL CHECK (semestre BETWEEN 1 AND 10),
  correo VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  ruta_foto VARCHAR(255),
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  es_activo BOOLEAN DEFAULT TRUE,
  fk_rol_activo INT NULL,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_usuarios_carreras
    FOREIGN KEY (fk_carrera) REFERENCES carreras(id_carrera)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_usuarios_roles
    FOREIGN KEY (fk_rol_activo) REFERENCES roles(id_rol)
    ON DELETE SET NULL ON UPDATE CASCADE,
  INDEX idx_usuarios_correo (correo),
  INDEX idx_usuarios_nombre (nombre_completo),
  INDEX idx_usuarios_activo (es_activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- 4. ROLES Y SEGURIDAD
-- =========================================================

CREATE TABLE usuario_rol (
  fk_usuario INT NOT NULL,
  fk_rol INT NOT NULL,
  PRIMARY KEY (fk_usuario, fk_rol),
  CONSTRAINT fk_usuario_rol_usuarios
    FOREIGN KEY (fk_usuario) REFERENCES usuarios(id_usuario)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_usuario_rol_roles
    FOREIGN KEY (fk_rol) REFERENCES roles(id_rol)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE tokens_recuperacion (
  id_token INT AUTO_INCREMENT PRIMARY KEY,
  fk_usuario INT NOT NULL,
  token VARCHAR(255) UNIQUE NOT NULL,
  fecha_expiracion DATETIME NOT NULL,
  CONSTRAINT fk_tokens_usuario
    FOREIGN KEY (fk_usuario) REFERENCES usuarios(id_usuario)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- 5. PERFIL DE ASESOR (1:1)
-- =========================================================

CREATE TABLE perfiles_asesores (
  id_asesor INT PRIMARY KEY,
  descripcion TEXT,
  correo_contacto VARCHAR(100),
  conteo_asesorias INT DEFAULT 0,
  calificacion_promedio DECIMAL(3,2) DEFAULT 0.0,
  CONSTRAINT fk_perfiles_asesores_usuarios
    FOREIGN KEY (id_asesor) REFERENCES usuarios(id_usuario)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- 6. SUSCRIPCIONES
-- =========================================================

CREATE TABLE suscripciones (
  id_suscripcion INT AUTO_INCREMENT PRIMARY KEY,
  fk_asesor INT NOT NULL,
  fecha_inicio DATE NOT NULL,
  fecha_expiracion DATE NOT NULL,
  monto DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  metodo_pago ENUM('tarjeta', 'transferencia', 'paypal', 'otro') DEFAULT 'otro',
  es_activa BOOLEAN DEFAULT TRUE,
  CONSTRAINT fk_suscripciones_asesores
    FOREIGN KEY (fk_asesor) REFERENCES perfiles_asesores(id_asesor)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT chk_fechas_suscripcion CHECK (fecha_expiracion > fecha_inicio)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- 7. TEMAS DEL ASESOR
-- =========================================================

CREATE TABLE asesores_temas (
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
-- 8. FAVORITOS
-- =========================================================

CREATE TABLE favoritos (
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
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- 9. DISPONIBILIDADES
-- =========================================================

CREATE TABLE disponibilidades (
  id_disponibilidad INT AUTO_INCREMENT PRIMARY KEY,
  fk_asesor INT NOT NULL,
  fecha_inicio DATETIME NOT NULL,
  fecha_fin DATETIME NOT NULL,
  modalidad ENUM('presencial', 'virtual') NOT NULL,
  tipo_sesion ENUM('grupal', 'individual') NOT NULL,
  fk_tema INT NULL,
  precio DECIMAL(10,2) NOT NULL,
  capacidad INT DEFAULT 1 CHECK (capacidad >= 1),
  es_disponible BOOLEAN DEFAULT TRUE,
  CONSTRAINT chk_fechas_disponibilidad CHECK (fecha_fin > fecha_inicio),
  CONSTRAINT fk_disponibilidades_asesor
    FOREIGN KEY (fk_asesor) REFERENCES perfiles_asesores(id_asesor)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_disponibilidades_tema
    FOREIGN KEY (fk_tema) REFERENCES temas(id_tema)
    ON DELETE SET NULL ON UPDATE CASCADE,
  INDEX idx_disponibilidades_asesor_fecha (fk_asesor, fecha_inicio),
  INDEX idx_disponibilidades_estado (es_disponible)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- 10. INSCRIPCIONES
-- =========================================================

CREATE TABLE inscripciones_sesion (
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
  INDEX idx_inscripciones_disponibilidad (fk_disponibilidad)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- 11. CALIFICACIONES
-- =========================================================

CREATE TABLE calificaciones (
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
-- 12. HISTORIAL DE CANCELACIONES
-- =========================================================

CREATE TABLE historial_cancelaciones (
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
-- 13. PROCEDIMIENTO: Actualizar perfil del asesor
-- =========================================================

DELIMITER //

/*
 * Procedimiento: sp_actualizar_perfil_asesor
 * Parámetros:
 *   - p_id_asesor (INT): ID del asesor a actualizar
 * Retorna: Nada (actualiza perfiles_asesores)
 * Descripción: Recalcula conteo de asesorías y calificación promedio
 */

DROP PROCEDURE IF EXISTS sp_actualizar_perfil_asesor//
CREATE PROCEDURE sp_actualizar_perfil_asesor(
  IN p_id_asesor INT
)
BEGIN
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
END//

DELIMITER ;

-- =========================================================
-- 14. TRIGGERS
-- =========================================================

DELIMITER //

-- Control de cupo
DROP TRIGGER IF EXISTS trg_control_cupo//
CREATE TRIGGER trg_control_cupo
BEFORE INSERT ON inscripciones_sesion
FOR EACH ROW
BEGIN
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
      SET MESSAGE_TEXT = 'Cupo lleno para esta sesión';
  END IF;
END//

-- Actualizar estado disponibilidad
DROP TRIGGER IF EXISTS trg_actualizar_estado//
CREATE TRIGGER trg_actualizar_estado
AFTER INSERT ON inscripciones_sesion
FOR EACH ROW
BEGIN
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
END//

-- Triggers para actualizar perfil asesor
DROP TRIGGER IF EXISTS trg_actualizar_perfil_insert//
CREATE TRIGGER trg_actualizar_perfil_insert
AFTER INSERT ON calificaciones
FOR EACH ROW
BEGIN
  CALL sp_actualizar_perfil_asesor(
    (SELECT d.fk_asesor
     FROM inscripciones_sesion i
       INNER JOIN disponibilidades d ON d.id_disponibilidad = i.fk_disponibilidad
     WHERE i.id_inscripcion = NEW.fk_inscripcion)
  );
END//

DROP TRIGGER IF EXISTS trg_actualizar_perfil_update//
CREATE TRIGGER trg_actualizar_perfil_update
AFTER UPDATE ON calificaciones
FOR EACH ROW
BEGIN
  CALL sp_actualizar_perfil_asesor(
    (SELECT d.fk_asesor
     FROM inscripciones_sesion i
       INNER JOIN disponibilidades d ON d.id_disponibilidad = i.fk_disponibilidad
     WHERE i.id_inscripcion = NEW.fk_inscripcion)
  );
END//

DROP TRIGGER IF EXISTS trg_actualizar_perfil_delete//
CREATE TRIGGER trg_actualizar_perfil_delete
AFTER DELETE ON calificaciones
FOR EACH ROW
BEGIN
  CALL sp_actualizar_perfil_asesor(
    (SELECT d.fk_asesor
     FROM inscripciones_sesion i
       INNER JOIN disponibilidades d ON d.id_disponibilidad = i.fk_disponibilidad
     WHERE i.id_inscripcion = OLD.fk_inscripcion)
  );
END//

DELIMITER ;

-- =========================================================
-- FIN DEL SCRIPT
-- =========================================================