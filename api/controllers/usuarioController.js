// api/controllers/usuarioController.js
import bcrypt from "bcryptjs";
import {
  getUsuarios,
  addUsuario,
  getAllAsesores,
  getAsesorInfo,
  getTemasPopulares,
  getMetricas,
  getUsuarioCheckByCorreo,
  getUserByEmail,
} from "../models/usuarioMySQL.js";

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
 * /api/usuarios/asesores:
 *   get:
 *     summary: Obtiene todos los asesores con filtros opcionales
 *     tags: [Asesores]
 *     parameters:
 *       - name: nombre
 *         in: query
 *         schema: { type: string }
 *       - name: carrera
 *         in: query
 *         schema: { type: string }
 *       - name: calificacionMin
 *         in: query
 *         schema: { type: number }
 *       - name: dia
 *         in: query
 *         schema: { type: string }
 *       - name: horaDesde
 *         in: query
 *         schema: { type: string }
 *       - name: horaHasta
 *         in: query
 *         schema: { type: string }
 *       - name: tema
 *         in: query
 *         schema: { type: string }
 *       - name: area
 *         in: query
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Lista de asesores activos
 */
export async function listarAsesores(req, res) {
  try {
    const filtros = {
      nombre: req.query.nombre,
      carrera: req.query.carrera,
      calificacionMin: req.query.calificacionMin,
      dia: req.query.dia,
      desde: req.query.horaDesde,
      hasta: req.query.horaHasta,
      tema: req.query.tema,
      area: req.query.area,
    };

    const asesores = await getAllAsesores(filtros);
    if (asesores.length === 0) {
      return res.status(200).json({ ok: true, message: "No se encontraron asesores", asesores: [] });
    }
    res.json(asesores);
  } catch (error) {
    console.error("Error al obtener asesores:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
}

/**
 * @openapi
 * /api/usuarios/asesores/{id}:
 *   get:
 *     summary: Obtiene información completa de un asesor
 *     tags: [Asesores]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Información del asesor
 *       404:
 *         description: Asesor no encontrado
 */
export async function obtenerInfoAsesor(req, res) {
  try {
    const { id } = req.params;
    const asesor = await getAsesorInfo(id);

    if (!asesor) {
      return res.status(404).json({ error: "Asesor no encontrado" });
    }

    res.json(asesor);
  } catch (error) {
    console.error("Error al obtener información del asesor:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
}

/**
 * @openapi
 * /api/temas/populares:
 *   get:
 *     summary: Obtiene los temas más populares
 *     tags: [Temas]
 *     responses:
 *       200:
 *         description: Lista de temas populares
 */
export async function listarTemasPopulares(req, res) {
  try {
    const temas = await getTemasPopulares();
    if (temas.length === 0) {
      return res.status(200).json({ ok: true, message: "No se encontraron temas populares", temas: [] });
    }
    res.json(temas);
  } catch (error) {
    console.error("Error al obtener temas populares:", error);
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
 *               - password
 *             properties:
 *               nombre_completo:
 *                 type: string
 *                 description: Nombre completo del usuario
 *               correo:
 *                 type: string
 *                 format: email
 *                 description: Correo electrónico único del usuario
 *               semestre:
 *                 type: integer
 *                 description: Semestre del usuario (1-10)
 *               fk_carrera:
 *                 type: integer
 *                 description: ID de la carrera del usuario
 *               password:
 *                 type: string
 *                 description: Contraseña del usuario
 *               roles:
 *                 type: array
 *                 description: IDs de los roles del usuario (opcional)
 *                 items:
 *                   type: integer
 *             example:
 *               nombre_completo: "Aline Pérez"
 *               correo: "aline@example.com"
 *               semestre: 3
 *               fk_carrera: 1
 *               password: "MiContraseña123"
 *               roles: [2]
 *     responses:
 *       201:
 *         description: Usuario creado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id_usuario:
 *                   type: integer
 *                 roles:
 *                   type: array
 *                   items:
 *                     type: integer
 *       400:
 *         description: Faltan campos obligatorios o correo duplicado
 *       500:
 *         description: Error interno del servidor
 */
export async function crearUsuario(req, res) {
  const { nombre_completo, correo, semestre, fk_carrera, password, roles } = req.body;

  if (!nombre_completo || !correo || !semestre || !fk_carrera || !password) {
    return res.status(400).json({ error: "Faltan campos obligatorios" });
  }

  try {
    const password_hash = await bcrypt.hash(password, 10);

    const nuevoUsuario = await addUsuario({
      nombre_completo,
      correo,
      semestre,
      fk_carrera,
      password_hash,
      roles: roles && roles.length > 0 ? roles : [2] // Rol por defecto "Estudiante"
    });

    res.status(201).json(nuevoUsuario);
  } catch (error) {
    console.error("Error al crear usuario:", error);

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ error: "El correo ya está registrado" });
    }

    res.status(500).json({ error: "Error interno del servidor" });
  }
}

/**
 * @openapi
 * /api/usuarios/metricas:
 *   get:
 *     summary: Obtiene métricas de la plataforma
 *     tags: [Usuarios]
 *     responses:
 *       200:
 *         description: Métricas del sistema
 */
export const obtenerMetricas = async (req, res) => {
  try {
    const metricas = await getMetricas();
    res.json(metricas);
  } catch (error) {
    console.error("Error al obtener métricas:", error);
    res.status(500).json({ error: "Error al obtener métricas" });
  }
};

/**
 * @openapi
 * /api/usuarios/check-email:
 *   get:
 *     summary: Verifica si un correo ya está registrado
 *     tags: [Usuarios]
 *     parameters:
 *       - in: query
 *         name: correo
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Indica si el correo existe
 */
export async function checkEmailController(req, res) {
  try {
    const { correo } = req.query;

    if (!correo) {
      return res.status(400).json({ error: "Correo requerido" });
    }

    const exists = await getUsuarioCheckByCorreo(correo);

    res.json({ exists });
  } catch (error) {
    console.error("Error en check-email:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
}

/**
 * @openapi
 * /api/usuarios/login:
 *   post:
 *     summary: Autentica un usuario con correo y contraseña
 *     tags: [Usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - correo
 *               - password
 *             properties:
 *               correo:
 *                 type: string
 *                 format: email
 *                 example: usuario@example.com
 *               password:
 *                 type: string
 *                 example: miContraseña123
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 usuario:
 *                   type: object
 *                   properties:
 *                     id_usuario:
 *                       type: integer
 *                     nombre_completo:
 *                       type: string
 *                     correo:
 *                       type: string
 *                     semestre:
 *                       type: integer
 *                     nombre_carrera:
 *                       type: string
 *                     nombre_rol:
 *                       type: string
 *       400:
 *         description: Faltan campos obligatorios
 *       401:
 *         description: Credenciales inválidas
 */
export async function loginUsuario(req, res) {
  const { correo, password } = req.body;

  // Validación de campos
  if (!correo || !password) {
    return res.status(400).json({
      success: false,
      error: "Correo y contraseña son obligatorios",
    });
  }

  try {
    // Buscar usuario por correo
    const usuario = await getUserByEmail(correo);
    console.log(`Usuario: ${JSON.stringify(usuario)}`);
    if (!usuario) {
      return res.status(401).json({
        success: false,
        error: "Credenciales inválidas",
      });
    }

    // Validar contraseña (comparación directa por ahora)
    // NOTA: En producción deberías usar bcrypt.compare() si las contraseñas están hasheadas
    if (usuario.password_hash !== password) {
      return res.status(401).json({
        success: false,
        error: "Credenciales inválidas",
      });
    }

    // Login exitoso - no devolver el password_hash
    const { password_hash, ...usuarioSinPassword } = usuario;

    res.json({
      success: true,
      message: "Login exitoso",
      usuario: usuarioSinPassword,
    });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({
      success: false,
      error: "Error interno del servidor",
    });
  }
}

