//api/routes/authTestRoutes.js
import express from "express";
import { generarToken, verificarToken } from "../utils/jwt.js";

const router = express.Router();

// Genera un token de prueba
router.get("/jwt/generar", (req, res) => {
    const token = generarToken({ userId: 123, role: "test" });
    res.json({ ok: true, token });
});

// Verifica un token enviado por header
router.get("/jwt/verificar", (req, res) => {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
        return res.status(401).json({ ok: false, error: "Falta token" });
    }

    const decoded = verificarToken(token);

    if (!decoded) {
        return res.status(401).json({ ok: false, error: "Token inválido" });
    }

    res.json({ ok: true, data: decoded });
});

export default router;
