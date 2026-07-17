// api/middleware/authMiddleware.js
import { verificarToken } from "../utils/jwt.js";

export function authMiddleware(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        // 1. Verificar si el header existe
        if (!authHeader) {
            return res.status(401).json({
                error: "Authorization header faltante",
                detalle: "Debe enviar 'Authorization: Bearer <token>'"
            });
        }

        // 2. Validar formato correcto: "Bearer token"
        const partes = authHeader.split(" ");
        if (partes.length !== 2 || partes[0] !== "Bearer") {
            return res.status(400).json({
                error: "Formato de Authorization inválido",
                detalle: "Use 'Bearer <token>'"
            });
        }

        const token = partes[1];

        // 3. Verificar token
        const decoded = verificarToken(token);
        if (!decoded) {
            return res.status(403).json({
                error: "Token inválido o expirado"
            });
        }

        // 4. Guardar datos del usuario en req
        req.usuario = decoded;

        // 5. Continuar con la petición
        next();

    } catch (error) {
        console.error("Error en authMiddleware:", error);
        return res.status(500).json({
            error: "Error interno en autenticación"
        });
    }
}


