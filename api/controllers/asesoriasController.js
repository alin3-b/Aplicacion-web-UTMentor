// api/controllers/asesoriasController.js
import {
    getAsesoriasByAsesor,
    existeInscripcion,
    crearInscripcion,
    getInscripcion
} from "../models/asesoriasMySQL.js";

/**
 * @openapi
 * /api/asesorias/asesor/{id_asesor}:
 *   get:
 *     summary: Obtiene todas las asesorías disponibles de un asesor
 *     tags: [Asesorias]
 *     parameters:
 *       - in: path
 *         name: id_asesor
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de asesorías disponibles
 */
export async function listarAsesoriasPorAsesor(req, res) {
    try {
        const { id_asesor } = req.params;

        if (!id_asesor) {
            return res.status(400).json({ ok: false, mensaje: "Debe enviar id_asesor" });
        }

        const asesorias = await getAsesoriasByAsesor(id_asesor);

        res.json({
            ok: true,
            asesorias
        });

    } catch (error) {
        console.error("Error al obtener asesorías por asesor:", error);
        res.status(500).json({ ok: false, mensaje: "Error interno del servidor" });
    }
}

/**
 * @openapi
 * /api/asesorias:
 *   post:
 *     summary: Agenda una asesoría
 *     tags: [Asesorías]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fk_disponibilidad
 */
export async function agendarAsesoria(req, res) {
    try {
        const fk_asesorado = req.user.id; // viene de JWT
        const { fk_disponibilidad } = req.body;

        if (!fk_disponibilidad) {
            return res.status(400).json({ ok: false, mensaje: "Debe enviar fk_disponibilidad" });
        }

        // evitar duplicado
        const yaExiste = await existeInscripcion(fk_disponibilidad, fk_asesorado);
        if (yaExiste) {
            return res.status(409).json({
                ok: false,
                mensaje: "Ya estás inscrito en esta asesoría"
            });
        }

        // crear inscripción
        let id_inscripcion;
        try {
            id_inscripcion = await crearInscripcion(fk_disponibilidad, fk_asesorado);
        } catch (error) {
            console.error("Error en crearInscripcion:", error);

            if (error.message.includes("cupo")) {
                return res.status(400).json({
                    ok: false,
                    mensaje: "La sesión ya está llena"
                });
            }

            return res.status(400).json({
                ok: false,
                mensaje: "No se pudo crear la inscripción"
            });
        }

        const reserva = await getInscripcion(id_inscripcion);

        res.status(201).json({
            ok: true,
            mensaje: "Asesoría agendada correctamente",
            reserva
        });

    } catch (error) {
        console.error("Error al agendar asesoría:", error);
        res.status(500).json({ ok: false, mensaje: "Error interno del servidor" });
    }
}
