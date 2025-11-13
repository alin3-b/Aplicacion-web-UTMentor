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
    LEFT JOIN roles r ON u.fk_rol_activo = r.id_rol
    WHERE u.es_activo = TRUE
    ORDER BY u.fecha_registro DESC
  `);
  return rows;
}

export async function addUsuario({ nombre_completo, correo, semestre, fk_carrera, password_hash }) {
  const [result] = await mysqlPool.query(
    `INSERT INTO usuarios 
    (nombre_completo, correo, semestre, fk_carrera, password_hash, es_activo)
    VALUES (?, ?, ?, ?, ?, TRUE)`,
    [nombre_completo, correo, semestre, fk_carrera, password_hash]
  );
  return { id_usuario: result.insertId, nombre_completo, correo };
}