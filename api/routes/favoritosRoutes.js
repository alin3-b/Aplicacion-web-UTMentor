// api/routes/favoritosRoutes.js
import express from "express";
import {
    agregarFavorito,
    eliminarFavorito
} from "../controllers/favoritosController.js";

const router = express.Router();

router.post("/", agregarFavorito);
router.delete("/:id_favorito", eliminarFavorito);

export default router;
