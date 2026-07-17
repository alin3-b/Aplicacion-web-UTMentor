// api/controllers/favoritosController.js
import {
    addFavorito,
    deleteFavorito
} from "../models/favoritosMySQL.js";

/**
 * @openapi
 * /api/favoritos:
 *   post:
 *     summary: Agrega un asesor a favoritos
 *     tags: [Favoritos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fk_asesorado
 *               - fk_asesor
 *             properties:
 *               fk_asesorado:
 *                 type: integer
 *               fk_asesor:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Favorito agregado correctamente
 */
export async function agregarFavorito(req, res) {
    try {
        const { fk_asesorado, fk_asesor } = req.body;

        if (!fk_asesorado || !fk_asesor) {
            return res.status(400).json({ error: "Datos incompletos" });
        }

        const favorito = await addFavorito({ fk_asesorado, fk_asesor });
        res.status(201).json(favorito);

    } catch (error) {
        console.error("Error al agregar favorito:", error);

        if (error.message.includes("ya está en favoritos")) {
            return res.status(400).json({ error: "Este asesor ya está en favoritos" });
        }

        res.status(500).json({ error: "Error interno del servidor" });
    }
}

/**
 * @openapi
 * /api/favoritos/{id_favorito}:
 *   delete:
 *     summary: Elimina un favorito
 *     tags: [Favoritos]
 *     parameters:
 *       - in: path
 *         name: id_favorito
 *         required: true
 *         schema:
 *           type: integer
 */
export async function eliminarFavorito(req, res) {
    try {
        const { id_favorito } = req.params;

        const eliminado = await deleteFavorito(id_favorito);

        if (!eliminado) {
            return res.status(404).json({ error: "Favorito no encontrado" });
        }

        res.json({ success: true });

    } catch (error) {
        console.error("Error al eliminar favorito:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
}
