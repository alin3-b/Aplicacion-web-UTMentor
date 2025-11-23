// api/routes/emailRoutes.js
import express from "express";
import { enviarCorreoRecuperacion } from "../controllers/emailSender.js";

const router = express.Router();

/**
 * @swagger
 * /api/email/recuperar-password:
 *   post:
 *     summary: Enviar correo de recuperación de contraseña
 *     tags: [Email]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Correo electrónico del usuario
 *     responses:
 *       200:
 *         description: Correo enviado exitosamente
 *       400:
 *         description: Email no proporcionado
 *       500:
 *         description: Error al enviar el correo
 */
router.post("/recuperar-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "El correo electrónico es requerido",
      });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "El formato del correo electrónico no es válido",
      });
    }

    // URL del frontend (ajustar según tu configuración)
    const frontendUrl =
      process.env.FRONTEND_URL || "http://localhost:8180";

    // Enviar correo de recuperación
    const resultado = await enviarCorreoRecuperacion(email, frontendUrl);

    if (resultado.success) {
      return res.status(200).json({
        success: true,
        message: "Correo de recuperación enviado exitosamente",
        messageId: resultado.messageId,
      });
    } else {
      return res.status(500).json({
        success: false,
        message: "Error al enviar el correo",
        error: resultado.error,
      });
    }
  } catch (error) {
    console.error("Error en ruta de recuperación:", error);
    return res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: error.message,
    });
  }
});

console.log("Rutas de email cargadas");

export default router;
