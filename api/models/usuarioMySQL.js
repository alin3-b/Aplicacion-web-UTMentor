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
      r.nombre_rol
    FROM usuarios u
    LEFT JOIN carreras c ON u.fk_carrera = c.id_carrera
    LEFT JOIN usuario_rol ur ON u.id_usuario = ur.fk_usuario
    LEFT JOIN roles r ON ur.fk_rol = r.id_rol
    WHERE u.es_activo = TRUE
    ORDER BY u.fecha_registro DESC
  `);
  return rows;
}

export async function addUsuario({
  nombre_completo,
  correo,
  semestre,
  fk_carrera,
  password_hash,
}) {
  const [result] = await mysqlPool.query(
    `INSERT INTO usuarios 
    (nombre_completo, correo, semestre, fk_carrera, password_hash, es_activo)
    VALUES (?, ?, ?, ?, ?, TRUE)`,
    [nombre_completo, correo, semestre, fk_carrera, password_hash]
  );
  return { id_usuario: result.insertId, nombre_completo, correo };
}

// ✅ CORREGIDO: sin descripcion ni correo_contacto
export async function getAllAsesores() {
  const [rows] = await mysqlPool.query(`
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
    WHERE u.es_activo = TRUE
    ORDER BY pa.calificacion_promedio DESC, pa.conteo_asesorias DESC
  `);

  const asesoresConDisponibilidades = await Promise.all(
    rows.map(async (asesor) => {
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
        [asesor.id_usuario]
      );

      return {
        ...asesor,
        disponibilidades,
      };
    })
  );

  return asesoresConDisponibilidades;
}

// ✅ CORREGIDO: sin descripcion ni correo_contacto
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