import { Router } from "express";
import { generarDescripcion } from "../controllers/iaController.js";

const router = Router();
router.post("/generarDescripcionAsesor", generarDescripcion);

export default router;
