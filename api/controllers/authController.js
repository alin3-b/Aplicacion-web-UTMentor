// api/controllers/authController.js
import { mysqlPool } from "../config/db.js";
import { generarToken } from "../utils/jwt.js";
import bcrypt from "bcryptjs";

/**
 * Inicia sesión de un usuario.
 * Verifica correo, contraseña y genera JWT.
 */
export async function login(req, res) {
    const { correo, password } = req.body;

    if (!correo || !password) {
        return res.status(400).json({ error: "Correo y contraseña requeridos" });
    }

    try {
        const [rows] = await mysqlPool.query(
            "SELECT * FROM usuarios WHERE correo = ? LIMIT 1",
            [correo]
        );

        if (!rows || rows.length === 0) {
            return res.status(400).json({ error: "Correo o contraseña incorrectos" });
        }

        const usuario = rows[0];

        // comparar password con password_hash
        const esValido = await bcrypt.compare(password, usuario.password_hash);

        if (!esValido) {
            return res.status(400).json({ error: "Correo o contraseña incorrectos" });
        }

        // generar JWT
        const token = generarToken({
            id: usuario.id_usuario,
            rol: usuario.rol,
        });

        // opcional: devolver también el token como header
        res.setHeader("Authorization", `Bearer ${token}`);

        return res.json({
            mensaje: "Login exitoso",
            token,
            usuario: {
                id: usuario.id_usuario,
                nombre: usuario.nombre_completo,
                rol: usuario.rol,
            },
        });
    } catch (err) {
        console.error("Error en login:", err);
        res.status(500).json({ error: "Error interno del servidor" });
    }
}

/**
 * Restablece la contraseña de un usuario.
 * Recibe email y nueva contraseña, la hashea y actualiza en BD.
 */
export async function resetPassword(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Email y contraseña requeridos" });
    }

    try {
        // Verificar si el usuario existe
        const [rows] = await mysqlPool.query(
            "SELECT * FROM usuarios WHERE correo = ? LIMIT 1",
            [email]
        );

        if (!rows || rows.length === 0) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        // Hashear la nueva contraseña
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        console.log(`[RESET] Actualizando password para: ${email}`);
        console.log(`[RESET] Nuevo hash generado: ${passwordHash.substring(0, 20)}...`);

        // Actualizar en la base de datos
        const [result] = await mysqlPool.query(
            "UPDATE usuarios SET password_hash = ? WHERE correo = ?",
            [passwordHash, email]
        );

        console.log(`[RESET] Filas afectadas: ${result.affectedRows}`);

        if (result.affectedRows === 0) {
             console.warn(`[RESET] No se encontró usuario con correo: ${email}`);
             return res.status(404).json({ error: "Usuario no encontrado para actualizar" });
        }

        return res.json({ message: "Contraseña actualizada correctamente" });

    } catch (err) {
        console.error("Error en resetPassword:", err);
        res.status(500).json({ error: "Error interno del servidor" });
    }
}
