// api/controllers/usuarioController.js
import bcrypt from "bcryptjs";
import {
  getUsuarios,
  getUsuarioById,
  addUsuario,
  getAllAsesores,
  getAsesorInfo,
  getTemasPopulares,
  getMetricas,
  getUsuarioCheckByCorreo,
  getUserByEmail,
  getRolesByUserId,
  updateUsuarioProfile,
  updateAsesorProfile,
  createDisponibilidad,
  getDisponibilidades,
  deleteDisponibilidad,
  deleteUsuario,
  getAsesoriasPorAsesorado,
  cancelarInscripcion,
  crearCalificacion,
  getInscripcionPendienteCalificacion,
  getFavoritosPorAsesorado,
  eliminarFavorito,
} from "../models/usuarioMySQL.js";
import { generarToken } from "../utils/jwt.js";
import minioClient, { bucketName } from "../config/minio.js";
import path from "path";


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
      return res.status(400).json({ error: "Este correo ya está registrado" });
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
 *     summary: Inicia sesión y genera un JWT para el usuario
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
 *                 example: "usuario@example.com"
 *               password:
 *                 type: string
 *                 example: "MiPassword123"
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 mensaje:
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
 *                     roles:
 *                       type: array
 *                       items:
 *                         type: integer
 *                 token:
 *                   type: string
 *       400:
 *         description: Campos faltantes
 *       401:
 *         description: Credenciales incorrectas
 *       500:
 *         description: Error interno del servidor
 */
export async function loginUsuario(req, res) {
  try {
    const { correo, password } = req.body;

    // ===========================
    // 1. Validar campos
    // ===========================
    if (!correo || !password) {
      return res.status(400).json({
        success: false,
        error: "Correo y contraseña son obligatorios",
      });
    }

    // ===========================
    // 2. Buscar usuario por correo
    // ===========================
    const usuario = await getUserByEmail(correo);
    if (!usuario) {
      console.log(`[LOGIN] Usuario no encontrado: ${correo}`);
      return res.status(401).json({
        success: false,
        error: "Correo o contraseña incorrectos",
      });
    }

    // ===========================
    // 3. Comparar contraseña hasheada
    // ===========================
    console.log(`[LOGIN] Comparando password para: ${correo}`);
    console.log(`[LOGIN] Hash en BD: ${usuario.password_hash ? usuario.password_hash.substring(0, 20) : 'NULL'}...`);
    
    const okPassword = await bcrypt.compare(password, usuario.password_hash);
    console.log(`[LOGIN] Resultado comparación: ${okPassword}`);

    if (!okPassword) {
      return res.status(401).json({
        success: false,
        error: "Correo o contraseña incorrectos",
      });
    }

    // ===========================
    // 4. Obtener roles (1 o varios)
    // ===========================
    const roles = await getRolesByUserId(usuario.id_usuario);
    // → ejemplo resultado: [1] o [1,2]

    // ===========================
    // 5. Crear payload del JWT
    // ===========================
    const payload = {
      id_usuario: usuario.id_usuario,
      nombre: usuario.nombre_completo,
      correo: usuario.correo,
      roles // MANDAMOS TODOS LOS ROLES, no solo uno
    };

    // ===========================
    // 6. Generar token JWT
    // ===========================
    const token = generarToken(payload);

    // ===========================
    // 7. Respuesta limpia sin password
    // ===========================
    const { password_hash, ...usuarioSinPassword } = usuario;

    return res.status(200).json({
      success: true,
      mensaje: "Inicio de sesión exitoso",
      usuario: {
        ...usuarioSinPassword,
        roles
      },
      token
    });

  } catch (error) {
    console.error("❌ Error en loginUsuario:", error);
    return res.status(500).json({
      success: false,
      error: "Error interno del servidor",
    });
  }
}

/**
 * @openapi
 * /api/usuarios/asesores/{id}:
 *   put:
 *     summary: Actualiza la información de un asesor
 *     tags: [Asesores]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre_completo:
 *                 type: string
 *               semestre:
 *                 type: integer
 *               fk_carrera:
 *                 type: integer
 *               password:
 *                 type: string
 *               ruta_foto:
 *                 type: string
 *               temas:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     topic:
 *                       type: string
 *                     area:
 *                       type: string
 *     responses:
 *       200:
 *         description: Asesor actualizado correctamente
 *       400:
 *         description: Error en la solicitud
 *       404:
 *         description: Asesor no encontrado
 *       500:
 *         description: Error interno del servidor
 */
export async function actualizarAsesor(req, res) {
  const { id } = req.params;
  const { nombre_completo, semestre, fk_carrera, password, ruta_foto, temas } = req.body;

  try {
    const data = { nombre_completo, semestre, fk_carrera, ruta_foto, temas };

    if (password) {
      data.password_hash = await bcrypt.hash(password, 10);
    }

    const updated = await updateAsesorProfile(id, data);

    if (!updated) {
      return res.status(404).json({ error: "Asesor no encontrado o sin cambios" });
    }

    res.json({ message: "Asesor actualizado correctamente" });
  } catch (error) {
    console.error("Error al actualizar asesor:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
}

/**
 * @openapi
 * /api/usuarios/asesores/{id}/foto:
 *   post:
 *     summary: Sube una foto de perfil para el asesor
 *     tags: [Asesores]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               foto:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Foto actualizada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 *       400:
 *         description: No se subió ningún archivo
 *       500:
 *         description: Error interno del servidor
 */
export async function subirFotoPerfil(req, res) {
  const { id } = req.params;
  
  if (!req.file) {
    return res.status(400).json({ error: "No se ha subido ningún archivo" });
  }

  try {
    const fileExtension = path.extname(req.file.originalname);
    const fileName = `asesores/${id}-${Date.now()}${fileExtension}`;
    
    // Subir a MinIO
    await minioClient.putObject(
      bucketName,
      fileName,
      req.file.buffer,
      req.file.size,
      { 'Content-Type': req.file.mimetype }
    );

    // Construir URL pública
    // Asumiendo que el bucket es público o usamos presigned URLs.
    // Si usamos localhost para desarrollo, la URL debe ser accesible desde el navegador.
    // process.env.MINIO_ENDPOINT suele ser interno (minio:9000).
    // Para el navegador necesitamos localhost:9000.
    
    // Una opción es usar una variable de entorno para la URL pública base.
    const publicHost = process.env.MINIO_PUBLIC_HOST || 'http://localhost:9000';
    const url = `${publicHost}/${bucketName}/${fileName}`;

    // Actualizar BD
    await updateAsesorProfile(id, { ruta_foto: url });

    res.json({ message: "Foto actualizada", url });
  } catch (error) {
    console.error("Error al subir foto:", error);
    res.status(500).json({ error: "Error al procesar la imagen" });
  }
}

/**
 * @openapi
 * /api/usuarios/asesores/{id}/disponibilidades:
 *   post:
 *     summary: Crea una nueva disponibilidad para un asesor
 *     tags: [Asesores]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fecha_inicio
 *               - fecha_fin
 *               - modalidad
 *               - tipo_sesion
 *               - precio
 *             properties:
 *               fecha_inicio:
 *                 type: string
 *                 format: date-time
 *               fecha_fin:
 *                 type: string
 *                 format: date-time
 *               modalidad:
 *                 type: string
 *                 enum: [presencial, virtual]
 *               tipo_sesion:
 *                 type: string
 *                 enum: [grupal, individual]
 *               fk_tema:
 *                 type: integer
 *                 nullable: true
 *               precio:
 *                 type: number
 *               capacidad:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Disponibilidad creada
 *       500:
 *         description: Error interno del servidor
 */
export async function crearDisponibilidadController(req, res) {
  const { id } = req.params;
  const { fecha_inicio, fecha_fin, modalidad, tipo_sesion, fk_tema, precio, capacidad } = req.body;

  try {
    const id_disponibilidad = await createDisponibilidad({
      fk_asesor: id,
      fecha_inicio,
      fecha_fin,
      modalidad,
      tipo_sesion,
      fk_tema,
      precio,
      capacidad
    });

    res.status(201).json({
      success: true,
      message: "Disponibilidad creada",
      data: {
        id_disponibilidad,
        fk_asesor: id,
        fecha_inicio,
        fecha_fin,
        modalidad,
        tipo_sesion,
        fk_tema,
        precio,
        capacidad
      }
    });
  } catch (error) {
    console.error("Error al crear disponibilidad:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
}

/**
 * @openapi
 * /api/usuarios/asesores/{id}/disponibilidades:
 *   get:
 *     summary: Obtiene las disponibilidades de un asesor con filtros de fecha
 *     tags: [Asesores]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: fecha_desde
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: fecha_hasta
 *         schema: { type: string, format: date }
 *     responses:
 *       200:
 *         description: Lista de disponibilidades
 */
export async function listarDisponibilidadesController(req, res) {
  const { id } = req.params;
  const { fecha_desde, fecha_hasta } = req.query;

  try {
    const disponibilidades = await getDisponibilidades(id, { fecha_desde, fecha_hasta });
    res.json({
      success: true,
      data: disponibilidades
    });
  } catch (error) {
    console.error("Error al listar disponibilidades:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
}

/**
 * @openapi
 * /api/usuarios/asesores/{id}/disponibilidades/{id_disponibilidad}:
 *   delete:
 *     summary: Elimina una disponibilidad de un asesor
 *     tags: [Asesores]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del asesor
 *       - in: path
 *         name: id_disponibilidad
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la disponibilidad a eliminar
 *     responses:
 *       200:
 *         description: Disponibilidad eliminada correctamente
 *       404:
 *         description: Disponibilidad no encontrada o no pertenece al asesor
 *       500:
 *         description: Error interno del servidor
 */
export async function eliminarDisponibilidadController(req, res) {
  const { id, id_disponibilidad } = req.params;

  try {
    const deleted = await deleteDisponibilidad(id_disponibilidad, id);

    if (!deleted) {
      return res.status(404).json({ error: "Disponibilidad no encontrada o no pertenece al asesor" });
    }

    res.json({ success: true, message: "Disponibilidad eliminada correctamente" });
  } catch (error) {
    console.error("Error al eliminar disponibilidad:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
}

/**
 * @openapi
 * /api/usuarios/{id}:
 *   delete:
 *     summary: Desactiva (elimina lógicamente) un usuario
 *     tags: [Usuarios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Usuario eliminado correctamente
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error interno del servidor
 */
export async function eliminarUsuarioController(req, res) {
  const { id } = req.params;

  try {
    const deleted = await deleteUsuario(id);

    if (!deleted) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json({ success: true, message: "Usuario eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
}

/**
 * @openapi
 * /api/usuarios/{id}/logout:
 *   post:
 *     summary: Cierra la sesión de un usuario
 *     tags: [Usuarios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Sesión cerrada correctamente
 */
export async function cerrarSesion(req, res) {
  const { id } = req.params;
  
  // En JWT stateless, el servidor no invalida el token automáticamente sin una lista negra.
  // Aquí asumimos que el cliente borrará el token.
  // Podríamos registrar el evento de logout si fuera necesario.
  console.log(`Usuario ${id} ha cerrado sesión.`);

  res.json({ success: true, message: "Sesión cerrada correctamente" });
}

/**
 * @openapi
 * /api/usuarios/{id}:
 *   get:
 *     summary: Obtiene información básica de un usuario (asesorado)
 *     tags: [Usuarios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Información del usuario
 *       404:
 *         description: Usuario no encontrado
 */
export async function obtenerUsuarioPorId(req, res) {
  const { id } = req.params;
  try {
    const usuario = await getUsuarioById(id);
    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    res.json(usuario);
  } catch (error) {
    console.error("Error al obtener usuario:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
}

/**
 * @openapi
 * /api/usuarios/{id}:
 *   put:
 *     summary: Actualiza la información de un usuario (asesorado)
 *     tags: [Usuarios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre_completo:
 *                 type: string
 *               semestre:
 *                 type: integer
 *               fk_carrera:
 *                 type: integer
 *               password:
 *                 type: string
 *               ruta_foto:
 *                 type: string
 *     responses:
 *       200:
 *         description: Usuario actualizado correctamente
 *       400:
 *         description: Error en la solicitud
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error interno del servidor
 */
export async function actualizarUsuarioController(req, res) {
  const { id } = req.params;
  const { nombre_completo, semestre, fk_carrera, password, ruta_foto } = req.body;

  try {
    const data = { nombre_completo, semestre, fk_carrera, ruta_foto };

    if (password) {
      data.password_hash = await bcrypt.hash(password, 10);
    }

    const updated = await updateUsuarioProfile(id, data);

    if (!updated) {
      return res.status(404).json({ error: "Usuario no encontrado o sin cambios" });
    }

    res.json({ message: "Usuario actualizado correctamente" });
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
}

/**
 * @openapi
 * /api/usuarios/{id}/asesorias:
 *   get:
 *     summary: Obtiene las asesorías programadas para un asesorado
 *     tags: [Usuarios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de asesorías
 *       500:
 *         description: Error interno del servidor
 */
export async function listarAsesoriasAsesorado(req, res) {
  const { id } = req.params;
  try {
    const asesorias = await getAsesoriasPorAsesorado(id);
    res.json(asesorias);
  } catch (error) {
    console.error("Error al obtener asesorías del asesorado:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
}

/**
 * @openapi
 * /api/usuarios/{id}/asesorias/{id_asesoria}:
 *   delete:
 *     summary: Cancela una asesoría programada
 *     tags: [Usuarios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario (asesorado)
 *       - in: path
 *         name: id_asesoria
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la inscripción a cancelar
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               motivo:
 *                 type: string
 *     responses:
 *       200:
 *         description: Asesoría cancelada correctamente
 *       404:
 *         description: Asesoría no encontrada o ya cancelada
 *       500:
 *         description: Error interno del servidor
 */
export async function cancelarAsesoriaController(req, res) {
  const { id, id_asesoria } = req.params;
  const { motivo } = req.body;

  try {
    const success = await cancelarInscripcion(id_asesoria, id, motivo);
    if (!success) {
      return res.status(404).json({ error: "Asesoría no encontrada, no pertenece al usuario o ya está cancelada" });
    }
    res.json({ message: "Asesoría cancelada correctamente" });
  } catch (error) {
    console.error("Error al cancelar asesoría:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
}

/**
 * @openapi
 * /api/asesorias/{id_inscripcion}/calificar:
 *   post:
 *     summary: Califica una asesoría completada
 *     tags: [Asesorias]
 *     parameters:
 *       - in: path
 *         name: id_inscripcion
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [puntuacion]
 *             properties:
 *               puntuacion:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               comentario:
 *                 type: string
 *     responses:
 *       200:
 *         description: Calificación guardada
 *       500:
 *         description: Error interno
 */
export async function calificarSesionController(req, res) {
  const { id_inscripcion } = req.params;
  const { puntuacion, comentario } = req.body;

  try {
    await crearCalificacion({ fk_inscripcion: id_inscripcion, puntuacion, comentario });
    res.json({ message: "Calificación guardada correctamente" });
  } catch (error) {
    console.error("Error al calificar sesión:", error);
    // Manejo básico de duplicados si intenta calificar 2 veces
    if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ error: "Esta sesión ya fue calificada" });
    }
    res.status(500).json({ error: "Error interno del servidor" });
  }
}

/**
 * @openapi
 * /api/usuarios/{id}/calificar-asesor:
 *   post:
 *     summary: Califica al asesor especificado (busca la última sesión pendiente)
 *     tags: [Usuarios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del asesorado
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id_asesor, puntuacion]
 *             properties:
 *               id_asesor:
 *                 type: integer
 *               puntuacion:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               comentario:
 *                 type: string
 *     responses:
 *       200:
 *         description: Calificación registrada
 *       404:
 *         description: No hay sesiones pendientes para calificar con este asesor
 *       500:
 *         description: Error interno
 */
export async function calificarAsesorPorUsuarioController(req, res) {
  const { id } = req.params; // id_asesorado
  const { id_asesor, puntuacion, comentario } = req.body;

  if (!id_asesor || !puntuacion) {
    return res.status(400).json({ error: "Faltan datos (id_asesor, puntuacion)" });
  }

  try {
    // Buscar la última sesión completada y sin calificar entre este usuario y el asesor
    const inscripcion = await getInscripcionPendienteCalificacion(id, id_asesor);
    
    if (!inscripcion) {
      return res.status(404).json({ error: "No tienes sesiones pendientes de calificar con este asesor" });
    }

    await crearCalificacion({ 
      fk_inscripcion: inscripcion.id_inscripcion, 
      puntuacion, 
      comentario 
    });

    res.json({ message: "Calificación registrada correctamente" });
  } catch (error) {
    console.error("Error al calificar asesor:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
}

/**
 * @openapi
 * /api/usuarios/{id}/favoritos:
 *   get:
 *     summary: Obtiene los asesores favoritos de un asesorado
 *     tags: [Usuarios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del asesorado
 *     responses:
 *       200:
 *         description: Lista de asesores favoritos
 *       500:
 *         description: Error interno del servidor
 */
export async function listarFavoritosAsesorado(req, res) {
  const { id } = req.params;
  try {
    const favoritos = await getFavoritosPorAsesorado(id);
    res.json(favoritos);
  } catch (error) {
    console.error("Error al obtener favoritos del asesorado:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
}

/**
 * @openapi
 * /api/usuarios/{id}/favoritos/{id_asesor}:
 *   delete:
 *     summary: Elimina un asesor de los favoritos de un asesorado
 *     tags: [Usuarios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del asesorado
 *       - in: path
 *         name: id_asesor
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del asesor a eliminar de favoritos
 *     responses:
 *       200:
 *         description: Asesor eliminado de favoritos correctamente
 *       404:
 *         description: El asesor no estaba en favoritos
 *       500:
 *         description: Error interno del servidor
 */
export async function eliminarFavoritoController(req, res) {
  const { id, id_asesor } = req.params;
  try {
    const deleted = await eliminarFavorito(id, id_asesor);
    if (!deleted) {
      return res.status(404).json({ error: "El asesor no estaba en tus favoritos" });
    }
    res.json({ message: "Asesor eliminado de favoritos correctamente" });
  } catch (error) {
    console.error("Error al eliminar favorito:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
}


