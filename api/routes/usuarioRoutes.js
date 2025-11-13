// api/routes/usuarioRoutes.js
import express from "express";
import {
  listarUsuarios,
  crearUsuario,
  listarAsesores,
  obtenerInfoAsesor,
  generarAsesoresDummy,
} from "../controllers/usuarioController.js";

const router = express.Router();

// === LISTAR USUARIOS ===
router.get("/", listarUsuarios);

// === CREAR USUARIO ===
router.post("/", crearUsuario);

// === LISTAR TODOS LOS ASESORES ===
router.get("/asesores", listarAsesores);

// === OBTENER INFO COMPLETA DE ASESOR ===
router.get("/asesor/:id", obtenerInfoAsesor);

// === GENERAR ASESORES DUMMY ===
router.post("/asesores/dummy", generarAsesoresDummy);

// Mensaje de confirmación (igual que tu profe)
console.log("Rutas de usuarios cargadas");

export default router;
