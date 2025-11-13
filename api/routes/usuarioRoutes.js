// api/routes/usuarioRoutes.js
import express from "express";
import { listarUsuarios, crearUsuario } from "../controllers/usuarioController.js";

const router = express.Router();

// === LISTAR USUARIOS ===
router.get("/", listarUsuarios);

// === CREAR USUARIO ===
router.post("/", crearUsuario);

// Mensaje de confirmación (igual que tu profe)
console.log("Rutas de usuarios cargadas");

export default router;