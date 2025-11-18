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
