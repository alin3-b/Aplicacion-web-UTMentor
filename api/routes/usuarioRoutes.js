// api/routes/usuarioRoutes.js
import express from "express";
import {
  listarUsuarios,
  crearUsuario,
  listarAsesores,
  obtenerInfoAsesor,
  actualizarAsesor,
  listarTemasPopulares,
  obtenerMetricas,
  checkEmailController,
  loginUsuario,
  subirFotoPerfil,
  crearDisponibilidadController,
  listarDisponibilidadesController,
  eliminarDisponibilidadController,
  eliminarUsuarioController,
  cerrarSesion,
} from "../controllers/usuarioController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

// === LISTAR USUARIOS ===
router.get("/", listarUsuarios);

// === CREAR USUARIO ===
router.post("/", crearUsuario);

// === ELIMINAR USUARIO ===
router.delete("/:id", eliminarUsuarioController);

// === LOGIN USUARIO ===
router.post("/login", loginUsuario);

// === LOGOUT USUARIO ===
router.post("/:id/logout", cerrarSesion);

// === LISTAR TODOS LOS ASESORES ===
router.get("/asesores", listarAsesores);

// === OBTENER INFO COMPLETA DE ASESOR ===
router.get("/asesores/:id", obtenerInfoAsesor);

// === ACTUALIZAR ASESOR ===
router.put("/asesores/:id", actualizarAsesor);

// === SUBIR FOTO PERFIL ===
router.post("/asesores/:id/foto", upload.single('foto'), subirFotoPerfil);

// === CREAR DISPONIBILIDAD ===
router.post("/asesores/:id/disponibilidades", crearDisponibilidadController);

// === LISTAR DISPONIBILIDADES ===
router.get("/asesores/:id/disponibilidades", listarDisponibilidadesController);

// === ELIMINAR DISPONIBILIDAD ===
router.delete("/asesores/:id/disponibilidades/:id_disponibilidad", eliminarDisponibilidadController);

router.get("/temas/populares", listarTemasPopulares);

router.get("/metricas", obtenerMetricas);

router.get("/check-email", checkEmailController);

// Mensaje de confirmación (igual que tu profe)
console.log("Rutas de usuarios cargadas");

export default router;
