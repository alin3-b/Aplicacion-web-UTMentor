// api/routes/paymentsRoutes.js
import express from "express";
import { crearDonacion } from "../controllers/paymentsController.js";

const router = express.Router();

// === CREAR DONACIÓN ===
router.post("/donar", crearDonacion);

console.log("Rutas de pagos cargadas");

export default router;
