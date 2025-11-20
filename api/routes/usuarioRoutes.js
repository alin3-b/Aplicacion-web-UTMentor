// api/routes/usuarioRoutes.js
import express from "express";
import {
  listarUsuarios,
  crearUsuario,
  listarAsesores,
  obtenerInfoAsesor,
  listarTemasPopulares,
  obtenerMetricas,
  checkEmailController,
  loginUsuario,
} from "../controllers/usuarioController.js";

const router = express.Router();

// === LISTAR USUARIOS ===
router.get("/", listarUsuarios);

// === CREAR USUARIO ===
router.post("/", crearUsuario);

// === LOGIN USUARIO ===
router.post("/login", loginUsuario);

// === LISTAR TODOS LOS ASESORES ===
router.get("/asesores", listarAsesores);

// === OBTENER INFO COMPLETA DE ASESOR ===
router.get("/asesores/:id", obtenerInfoAsesor);

router.get("/temas/populares", listarTemasPopulares);

router.get("/metricas", obtenerMetricas);

router.get("/check-email", checkEmailController);

// Mensaje de confirmación (igual que tu profe)
console.log("Rutas de usuarios cargadas");

export default router;
