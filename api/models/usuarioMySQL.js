// api/models/usuarioMySQL.js
import { mysqlPool } from "../config/db.js";

export async function getUsuarios() {
  const [rows] = await mysqlPool.query(`
    SELECT 
      u.id_usuario,
      u.nombre_completo,
      u.correo,
      u.semestre,
      c.nombre_carrera,
      GROUP_CONCAT(r.nombre_rol) AS roles
    FROM usuarios u
    LEFT JOIN carreras c ON u.fk_carrera = c.id_carrera
    LEFT JOIN usuario_rol ur ON u.id_usuario = ur.fk_usuario
    LEFT JOIN roles r ON ur.fk_rol = r.id_rol
    WHERE u.es_activo = TRUE
    GROUP BY u.id_usuario
    ORDER BY u.fecha_registro DESC
  `);
  return rows;
}

export async function getAllAsesores(filtros = {}) {
  const { nombre, carrera, dia, desde, hasta, tema, area } = filtros;

  const conditions = ["u.es_activo = TRUE"];
  const params = [];

  if (nombre) {
    conditions.push("u.nombre_completo LIKE ? COLLATE utf8mb4_unicode_ci");
    params.push(`%${nombre}%`);
  }

  if (carrera) {
    conditions.push("c.nombre_carrera LIKE ? COLLATE utf8mb4_unicode_ci");
    params.push(`%${carrera}%`);
  }

  if (tema) {
    conditions.push("t.nombre_tema LIKE ? COLLATE utf8mb4_unicode_ci");
    params.push(`%${tema}%`);
  }

  if (area) {
    conditions.push("a.nombre_area LIKE ? COLLATE utf8mb4_unicode_ci");
    params.push(`%${area}%`);
  }

  if (dia) {
    const diasMap = { "Domingo":0,"Lunes":1,"Martes":2,"Miércoles":3,"Jueves":4,"Viernes":5,"Sábado":6 };
    conditions.push("DAYOFWEEK(d.fecha_inicio) = ?");
    params.push(diasMap[dia] + 1);
  }
  
  if (desde && hasta) {
    conditions.push("(TIME(d.fecha_fin) >= ? AND TIME(d.fecha_inicio) <= ?)");
    params.push(desde, hasta);
  } else if (desde) {
    conditions.push("TIME(d.fecha_fin) >= ?");
    params.push(desde);
  } else if (hasta) {
    conditions.push("TIME(d.fecha_inicio) <= ?");
    params.push(hasta);
  }
  

  const query = `
    SELECT 
      u.id_usuario,
      u.nombre_completo,
      c.nombre_carrera,
      COALESCE(pa.conteo_asesorias, 0) AS numero_sesiones,
      COALESCE(pa.calificacion_promedio, 0.0) AS puntuacion_promedio,
      u.correo AS correo_contacto,
      d.id_disponibilidad,
      d.fecha_inicio,
      d.fecha_fin,
      d.modalidad,
      d.tipo_sesion,
      t.nombre_tema,
      a.nombre_area,
      d.precio,
      d.capacidad,
      d.es_disponible,
      (
        SELECT COUNT(*) 
        FROM inscripciones_sesion i 
        WHERE i.fk_disponibilidad = d.id_disponibilidad AND i.estado != 'cancelada'
      ) AS inscritos
    FROM usuarios u
    INNER JOIN perfiles_asesores pa ON u.id_usuario = pa.id_asesor
    LEFT JOIN carreras c ON u.fk_carrera = c.id_carrera
    LEFT JOIN disponibilidades d ON d.fk_asesor = u.id_usuario
    LEFT JOIN temas t ON d.fk_tema = t.id_tema
    LEFT JOIN areas_conocimiento a ON t.fk_area = a.id_area
    WHERE ${conditions.join(" AND ")}
    ORDER BY pa.conteo_asesorias DESC, d.fecha_inicio ASC
  `;

  const [rows] = await mysqlPool.query(query, params);

  // Mapear asesores con sus disponibilidades
  const asesoresMap = new Map();
  rows.forEach((row) => {
    const {
      id_disponibilidad, fecha_inicio, fecha_fin, modalidad, tipo_sesion,
      nombre_tema, nombre_area, precio, capacidad, es_disponible, inscritos,
      id_usuario, nombre_completo, nombre_carrera, numero_sesiones, puntuacion_promedio, correo_contacto
    } = row;

    if (!asesoresMap.has(id_usuario)) {
      asesoresMap.set(id_usuario, {
        id_usuario,
        nombre_completo,
        nombre_carrera,
        numero_sesiones,
        puntuacion_promedio,
        correo_contacto,
        disponibilidades: []
      });
    }

    if (id_disponibilidad) {
      asesoresMap.get(id_usuario).disponibilidades.push({
        id_disponibilidad,
        fecha_inicio,
        fecha_fin,
        modalidad,
        tipo_sesion,
        nombre_tema,
        nombre_area,
        precio,
        capacidad,
        es_disponible,
        inscritos
      });
    }
  });

  return Array.from(asesoresMap.values());
}

export async function getAsesorInfo(id_asesor) {
  const [rows] = await mysqlPool.query(
    `
    SELECT 
      u.id_usuario,
      u.nombre_completo,
      c.nombre_carrera,
      COALESCE(pa.conteo_asesorias, 0) AS numero_sesiones,
      COALESCE(pa.calificacion_promedio, 0.0) AS puntuacion_promedio,
      u.correo AS correo_contacto
    FROM usuarios u
    INNER JOIN perfiles_asesores pa ON u.id_usuario = pa.id_asesor
    LEFT JOIN carreras c ON u.fk_carrera = c.id_carrera
    WHERE u.id_usuario = ? AND u.es_activo = TRUE
  `,
    [id_asesor]
  );

  if (rows.length === 0) {
    return null;
  }

  const asesor = rows[0];

  const [disponibilidades] = await mysqlPool.query(
    `
    SELECT 
      d.id_disponibilidad,
      d.fecha_inicio,
      d.fecha_fin,
      d.modalidad,
      d.tipo_sesion,
      t.nombre_tema,
      a.nombre_area,
      d.precio,
      d.capacidad,
      d.es_disponible,
      IFNULL(COUNT(i.id_inscripcion), 0) AS inscritos
    FROM disponibilidades d
    LEFT JOIN temas t ON d.fk_tema = t.id_tema
    LEFT JOIN areas_conocimiento a ON t.fk_area = a.id_area
    LEFT JOIN inscripciones_sesion i ON d.id_disponibilidad = i.fk_disponibilidad 
      AND i.estado != 'cancelada'
    WHERE d.fk_asesor = ?
    GROUP BY d.id_disponibilidad
    ORDER BY d.fecha_inicio ASC
  `,
    [id_asesor]
  );

  return {
    ...asesor,
    disponibilidades,
  };
}

export async function getTemasPopulares() {
  const [rows] = await mysqlPool.query(`
    SELECT 
      t.id_tema,
      t.nombre_tema,
      COUNT(DISTINCT at.fk_asesor) AS numero_asesores,
      COUNT(DISTINCT i.id_inscripcion) AS numero_reservas
    FROM temas t
    LEFT JOIN asesores_temas at ON t.id_tema = at.fk_tema
    LEFT JOIN disponibilidades d ON t.id_tema = d.fk_tema
    LEFT JOIN inscripciones_sesion i 
          ON d.id_disponibilidad = i.fk_disponibilidad 
          AND i.estado != 'cancelada'
    GROUP BY t.id_tema
    ORDER BY numero_reservas DESC, numero_asesores DESC
    LIMIT 6
  `);

  return rows;
}

export async function addUsuario({
  nombre_completo,
  correo,
  semestre,
  fk_carrera,
  password_hash,
  roles = []
}) {
  const conn = await mysqlPool.getConnection();
  try {
    await conn.beginTransaction();

    // 1. Crear usuario
    const [result] = await conn.query(
      `INSERT INTO usuarios 
       (nombre_completo, correo, semestre, fk_carrera, password_hash, es_activo)
       VALUES (?, ?, ?, ?, ?, TRUE)`,
      [nombre_completo, correo, semestre, fk_carrera, password_hash]
    );

    const id_usuario = result.insertId;

    // 2. Insertar roles directamente (ya vienen validos desde frontend)
    if (roles.length > 0) {
      const values = roles.map(r => [id_usuario, r]);
      await conn.query(
        `INSERT INTO usuario_rol (fk_usuario, fk_rol) VALUES ?`,
        [values]
      );
    }

    await conn.commit();

    return { id_usuario, roles };
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

export async function getMetricas() {
  const [[asesoresActivos]] = await mysqlPool.query(`
    SELECT COUNT(DISTINCT u.id_usuario) AS total
    FROM usuarios u
    INNER JOIN usuario_rol ur ON u.id_usuario = ur.fk_usuario
    INNER JOIN roles r ON ur.fk_rol = r.id_rol
    WHERE r.nombre_rol = 'Asesor' AND u.es_activo = TRUE
  `);

  const [[calificaciones5]] = await mysqlPool.query(`
    SELECT COUNT(*) AS total FROM calificaciones WHERE puntuacion = 5
  `);

  const [[temasImpartidos]] = await mysqlPool.query(`
    SELECT COUNT(*) AS total FROM disponibilidades
  `);

  const [[satisfaccion]] = await mysqlPool.query(`
    SELECT ROUND(AVG(puntuacion), 1) AS promedio FROM calificaciones
  `);

  return {
    asesoresActivos: asesoresActivos.total,
    calificaciones5: calificaciones5.total,
    temasImpartidos: temasImpartidos.total,
    satisfaccionPromedio: satisfaccion.promedio,
  };
}

export async function getUsuarioCheckByCorreo(correo) {
  const [rows] = await mysqlPool.query(
    "SELECT id_usuario FROM usuarios WHERE correo = ? LIMIT 1",
    [correo]
  );
  return rows.length > 0;
}

export async function getUserByEmail(correo) {
  const [rows] = await mysqlPool.query(
    `
    SELECT 
      u.id_usuario,
      u.nombre_completo,
      u.correo,
      u.password_hash,
      u.semestre,
      u.es_activo,
      c.nombre_carrera,
      r.nombre_rol
    FROM usuarios u
    LEFT JOIN carreras c ON u.fk_carrera = c.id_carrera
    LEFT JOIN usuario_rol ur ON u.id_usuario = ur.fk_usuario
    LEFT JOIN roles r ON ur.fk_rol = r.id_rol
    WHERE u.correo = ? AND u.es_activo = TRUE
    `,
    [correo]
  );
  return rows[0] || null;
}