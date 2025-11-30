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
    const [cupoInfo] = await mysqlPool.query(
        `SELECT 
            d.capacidad,
            (SELECT COUNT(*) FROM inscripciones_sesion WHERE fk_disponibilidad = d.id_disponibilidad AND estado != 'cancelada') as inscritos
         FROM disponibilidades d
         WHERE d.id_disponibilidad = ?`,
        [fk_disponibilidad]
    );

    if (cupoInfo.length === 0) {
        throw new Error("La disponibilidad no existe");
    }

    const { capacidad, inscritos } = cupoInfo[0];

    if (inscritos >= capacidad) {
        throw new Error("No hay cupo disponible para esta sesión");
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

/**
 * Crea una calificación para una inscripción y actualiza el promedio del asesor
 */
export async function crearCalificacion(fk_inscripcion, puntuacion, comentario) {
    // 1. Insertar calificación
    const [result] = await mysqlPool.query(
        `INSERT INTO calificaciones (fk_inscripcion, puntuacion, comentario)
         VALUES (?, ?, ?)`,
        [fk_inscripcion, puntuacion, comentario]
    );
    
    // 2. Obtener id_asesor para actualizar su promedio
    const [rows] = await mysqlPool.query(`
        SELECT d.fk_asesor 
        FROM inscripciones_sesion i
        JOIN disponibilidades d ON d.id_disponibilidad = i.fk_disponibilidad
        WHERE i.id_inscripcion = ?
    `, [fk_inscripcion]);
    
    if (rows.length > 0) {
        const id_asesor = rows[0].fk_asesor;
        await actualizarPromedioAsesor(id_asesor);
    }

    return result.insertId;
}

async function actualizarPromedioAsesor(id_asesor) {
    const [rows] = await mysqlPool.query(`
        SELECT AVG(c.puntuacion) as promedio
        FROM calificaciones c
        JOIN inscripciones_sesion i ON i.id_inscripcion = c.fk_inscripcion
        JOIN disponibilidades d ON d.id_disponibilidad = i.fk_disponibilidad
        WHERE d.fk_asesor = ?
    `, [id_asesor]);

    const promedio = rows[0].promedio || 0;

    await mysqlPool.query(`
        UPDATE perfiles_asesores
        SET calificacion_promedio = ?
        WHERE id_asesor = ?
    `, [promedio, id_asesor]);
}
