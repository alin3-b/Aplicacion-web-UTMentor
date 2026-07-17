// api/models/favoritosMySQL.js
import { mysqlPool } from "../config/db.js";

/**
 * Agrega un asesor a los favoritos del usuario
 */
export async function addFavorito({ fk_asesorado, fk_asesor }) {
    const conn = await mysqlPool.getConnection();
    try {
        await conn.beginTransaction();

        // Validar que no exista duplicado
        const [existe] = await conn.query(
            `SELECT id_favorito 
       FROM favoritos 
       WHERE fk_asesorado = ? AND fk_asesor = ?
       LIMIT 1`,
            [fk_asesorado, fk_asesor]
        );

        if (existe.length > 0) {
            throw new Error("Este asesor ya está en favoritos");
        }

        // Insertar
        const [result] = await conn.query(
            `INSERT INTO favoritos (fk_asesorado, fk_asesor)
       VALUES (?, ?)`,
            [fk_asesorado, fk_asesor]
        );

        await conn.commit();
        return { id_favorito: result.insertId, fk_asesorado, fk_asesor };

    } catch (error) {
        await conn.rollback();
        throw error;
    } finally {
        conn.release();
    }
}

/**
 * Elimina un favorito por ID
 */
export async function deleteFavorito(id_favorito) {
    const [result] = await mysqlPool.query(
        `DELETE FROM favoritos WHERE id_favorito = ?`,
        [id_favorito]
    );

    return result.affectedRows > 0;
}
