// api/routes/asesoriasRoutes.js
import express from "express";
import {
    listarAsesoriasPorAsesor,
    agendarAsesoria,
    calificarAsesoria
} from "../controllers/asesoriasController.js";

const router = express.Router();

router.get("/asesor/:id_asesor", listarAsesoriasPorAsesor);
router.post("/", agendarAsesoria);
router.post("/:id_inscripcion/calificar", calificarAsesoria);

export default router;
