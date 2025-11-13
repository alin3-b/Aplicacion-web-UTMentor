// api/controllers/usuarioController.js
import { getUsuarios, addUsuario } from "../models/usuarioMySQL.js";

/**
 * @openapi
 * /api/usuarios:
 *   get:
 *     summary: Lista todos los usuarios activos
 *     tags: [Usuarios]
 *     responses:
 *       200:
 *         description: Lista de usuarios con carrera y rol
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id_usuario:
 *                     type: integer
 *                   nombre_completo:
 *                     type: string
 *                   correo:
 *                     type: string
 *                   semestre:
 *                     type: integer
 *                   nombre_carrera:
 *                     type: string
 *                     nullable: true
 *                   nombre_rol:
 *                     type: string
 *                     nullable: true
 */
export async function listarUsuarios(req, res) {
  try {
    const usuarios = await getUsuarios();
    res.json(usuarios);
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
}

/**
 * @openapi
 * /api/usuarios:
 *   post:
 *     summary: Crea un nuevo usuario
 *     tags: [Usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre_completo
 *               - correo
 *               - semestre
 *               - fk_carrera
 *               - password_hash
 *             properties:
 *               nombre_completo:
 *                 type: string
 *               correo:
 *                 type: string
 *                 format: email
 *               semestre:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 10
 *               fk_carrera:
 *                 type: integer
 *               password_hash:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id_usuario:
 *                   type: integer
 *                 nombre_completo:
 *                   type: string
 *                 correo:
 *                   type: string
 *       400:
 *         description: Faltan campos obligatorios
 */
export async function crearUsuario(req, res) {
  const { nombre_completo, correo, semestre, fk_carrera, password_hash } = req.body;

  // Validación básica (como tu profe)
  if (!nombre_completo || !correo || !semestre || !fk_carrera || !password_hash) {
    return res.status(400).json({ error: "Faltan campos obligatorios" });
  }

  try {
    const nuevoUsuario = await addUsuario({
      nombre_completo,
      correo,
      semestre,
      fk_carrera,
      password_hash,
    });
    res.status(201).json(nuevoUsuario);
  } catch (error) {
    console.error("Error al crear usuario:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
}