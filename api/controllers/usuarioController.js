// api/controllers/usuarioController.js
import {
  getUsuarios,
  addUsuario,
  getAllAsesores,
  getAsesorInfo,
  getTemasPopulares,
  getMetricas,
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
 *     summary: Obtiene todos los asesores con su información y disponibilidades
 *     tags: [Asesores]
 *     responses:
 *       200:
 *         description: Lista de todos los asesores activos
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
 *                   nombre_carrera:
 *                     type: string
 *                   numero_sesiones:
 *                     type: integer
 *                   puntuacion_promedio:
 *                     type: number
 *                     format: float
 *                   descripcion:
 *                     type: string
 *                   correo_contacto:
 *                     type: string
 *                   disponibilidades:
 *                     type: array
 *                     items:
 *                       type: object
 */
export async function listarAsesores(req, res) {
  try {
    const filtros = {
      nombre: req.query.nombre,
      carrera: req.query.carrera,
      calificacionMin: req.query.calificacionMin, // si quieres filtrar por calificación
      dia: req.query.dia,
      desde: req.query.horaDesde, // coincide con getAllAsesores
      hasta: req.query.horaHasta, // coincide con getAllAsesores
      tema: req.query.tema,
      area: req.query.area,
    };

    const asesores = await getAllAsesores(filtros);
    res.json(asesores);
  } catch (error) {
    console.error("Error al obtener asesores:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
}

/**
 * @openapi
 * /api/usuarios/asesor/{id}:
 *   get:
 *     summary: Obtiene información completa de un asesor
 *     tags: [Asesores]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del asesor
 *     responses:
 *       200:
 *         description: Información del asesor con disponibilidades
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id_usuario:
 *                   type: integer
 *                 nombre_completo:
 *                   type: string
 *                 nombre_carrera:
 *                   type: string
 *                 numero_sesiones:
 *                   type: integer
 *                 puntuacion_promedio:
 *                   type: number
 *                   format: float
 *                 descripcion:
 *                   type: string
 *                 correo_contacto:
 *                   type: string
 *                 disponibilidades:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id_disponibilidad:
 *                         type: integer
 *                       fecha_inicio:
 *                         type: string
 *                         format: date-time
 *                       fecha_fin:
 *                         type: string
 *                         format: date-time
 *                       modalidad:
 *                         type: string
 *                         enum: [presencial, virtual]
 *                       tipo_sesion:
 *                         type: string
 *                         enum: [grupal, individual]
 *                       nombre_tema:
 *                         type: string
 *                       nombre_area:
 *                         type: string
 *                       precio:
 *                         type: number
 *                         format: float
 *                       capacidad:
 *                         type: integer
 *                       es_disponible:
 *                         type: boolean
 *                       inscritos:
 *                         type: integer
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
 *         description: Lista de temas populares con número de asesores y reservas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id_tema:
 *                     type: integer
 *                   nombre_tema:
 *                     type: string
 *                   numero_asesores:
 *                     type: integer
 *                   numero_reservas:
 *                     type: integer
 */
export async function listarTemasPopulares(req, res) {
  try {
    const temas = await getTemasPopulares();
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
  const { nombre_completo, correo, semestre, fk_carrera, password_hash } =
    req.body;

  // Validación básica (como tu profe)
  if (
    !nombre_completo ||
    !correo ||
    !semestre ||
    !fk_carrera ||
    !password_hash
  ) {
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
