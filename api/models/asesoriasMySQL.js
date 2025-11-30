// api/models/asesoriasMySQL.js
import { mysqlPool } from "../config/db.js";

/**
 * Obtiene asesorías disponibles filtradas por id del asesor
 */
export async function getAsesoriasByAsesor(id_asesor) {
    const [rows] = await mysqlPool.query(
        `SELECT 
            d.id_disponibilidad,
            d.fecha_inicio,
            d.fecha_fin,
            d.modalidad,
            d.tipo_sesion,
            d.precio,
            d.capacidad,
            t.nombre_tema,
            u.nombre_completo AS nombre_asesor
        FROM disponibilidades d
        LEFT JOIN temas t ON t.id_tema = d.fk_tema
        INNER JOIN perfiles_asesores pa ON pa.id_asesor = d.fk_asesor
        INNER JOIN usuarios u ON u.id_usuario = pa.id_asesor
        WHERE d.es_disponible = TRUE
          AND d.fecha_fin > NOW()
          AND d.fk_asesor = ?
        ORDER BY d.fecha_inicio ASC`,
        [id_asesor]
    );

    return rows;
}

/**
 * Verifica si ya existe una inscripción
 */
export async function existeInscripcion(fk_disponibilidad, fk_asesorado) {
    const [rows] = await mysqlPool.query(
        `SELECT id_inscripcion 
         FROM inscripciones_sesion
         WHERE fk_disponibilidad = ? AND fk_asesorado = ?
         LIMIT 1`,
        [fk_disponibilidad, fk_asesorado]
    );

    return rows.length > 0;
}

/**
 * Crea una inscripción
 */
export async function crearInscripcion(fk_disponibilidad, fk_asesorado) {
    // 1. Verificar cupo
    const [rows] = await mysqlPool.query(
        `SELECT d.capacidad, COUNT(i.id_inscripcion) as ocupados
         FROM disponibilidades d
         LEFT JOIN inscripciones_sesion i ON i.fk_disponibilidad = d.id_disponibilidad 
                                         AND i.estado != 'cancelada'
         WHERE d.id_disponibilidad = ?
         GROUP BY d.id_disponibilidad`,
        [fk_disponibilidad]
    );

    if (rows.length === 0) {
        throw new Error("La disponibilidad no existe");
    }

    const { capacidad, ocupados } = rows[0];
    if (ocupados >= capacidad) {
        throw new Error("El cupo para esta sesión está lleno");
    }

    // 2. Insertar
    const [result] = await mysqlPool.query(
        `INSERT INTO inscripciones_sesion (fk_disponibilidad, fk_asesorado)
         VALUES (?, ?)`,
        [fk_disponibilidad, fk_asesorado]
    );

    return result.insertId;
}

/**
 * Devuelve una inscripción completa para mostrar al usuario
 */
export async function getInscripcion(id) {
    const [rows] = await mysqlPool.query(
        `SELECT 
            i.id_inscripcion,
            i.fecha_reserva,
            i.estado,
            d.fecha_inicio,
            d.fecha_fin,
            d.modalidad,
            d.tipo_sesion,
            d.precio,
            u.nombre_completo AS nombre_asesor,
            t.nombre_tema
        FROM inscripciones_sesion i
        INNER JOIN disponibilidades d ON d.id_disponibilidad = i.fk_disponibilidad
        INNER JOIN perfiles_asesores pa ON pa.id_asesor = d.fk_asesor
        INNER JOIN usuarios u ON u.id_usuario = pa.id_asesor
        LEFT JOIN temas t ON t.id_tema = d.fk_tema
        WHERE i.id_inscripcion = ?`,
        [id]
    );

    return rows[0] || null;
}
