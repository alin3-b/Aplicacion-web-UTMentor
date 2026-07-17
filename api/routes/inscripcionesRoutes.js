import express from "express";
import { agendarAsesoria } from "../controllers/asesoriasController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, agendarAsesoria);

export default router;
