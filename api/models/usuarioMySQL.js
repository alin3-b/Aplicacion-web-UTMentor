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
    const diasMap = { "Domingo": 0, "Lunes": 1, "Martes": 2, "Miércoles": 3, "Jueves": 4, "Viernes": 5, "Sábado": 6 };
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
    ORDER BY pa.conteo_asesorias DESC, 
        CASE WHEN d.fecha_inicio IS NULL THEN 1 ELSE 0 END ASC,
        d.fecha_inicio ASC
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
  // === 1. Datos básicos del usuario y perfil de asesor ===
  const [userRows] = await mysqlPool.query(
    `
    SELECT 
      u.id_usuario,
      u.nombre_completo,
      u.correo AS correo_contacto,
      u.ruta_foto,
      u.semestre,
      c.nombre_carrera,
      COALESCE(pa.conteo_asesorias, 0) AS numero_sesiones,
      COALESCE(pa.calificacion_promedio, 0.0) AS puntuacion_promedio
    FROM usuarios u
    INNER JOIN perfiles_asesores pa ON u.id_usuario = pa.id_asesor
    LEFT JOIN carreras c ON u.fk_carrera = c.id_carrera
    WHERE u.id_usuario = ? AND u.es_activo = TRUE
    `,
    [id_asesor]
  );

  if (userRows.length === 0) return null;
  const asesor = userRows[0];

  // === 2. Roles del usuario ===
  const [rolesRows] = await mysqlPool.query(
    `SELECT r.nombre_rol
     FROM usuario_rol ur
     INNER JOIN roles r ON ur.fk_rol = r.id_rol
     WHERE ur.fk_usuario = ?`,
    [id_asesor]
  );
  asesor.roles = rolesRows.map(r => r.nombre_rol);

  // === 3. Todas las disponibilidades del asesor ===
  const [disponibilidadesRows] = await mysqlPool.query(
    `
    SELECT 
      d.id_disponibilidad,
      d.fecha_inicio,
      d.fecha_fin,
      d.modalidad,
      d.tipo_sesion,
      d.precio,
      d.capacidad,
      d.es_disponible,
      t.nombre_tema,
      a.nombre_area,
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
  asesor.disponibilidades = disponibilidadesRows;

  // === 4. Todos los temas y áreas que el asesor puede impartir ===
  const [temasRows] = await mysqlPool.query(
    `
    SELECT 
      t.id_tema,
      t.nombre_tema,
      a.id_area,
      a.nombre_area
    FROM asesores_temas at
    INNER JOIN temas t ON at.fk_tema = t.id_tema
    INNER JOIN areas_conocimiento a ON t.fk_area = a.id_area
    WHERE at.fk_asesor = ?
    ORDER BY a.nombre_area ASC, t.nombre_tema ASC
    `,
    [id_asesor]
  );
  asesor.temas = temasRows;

  // === 5. Lista de áreas únicas del asesor ===
  const areasUnicas = [...new Map(temasRows.map(t => [t.id_area, t])).values()];
  asesor.areas = areasUnicas.map(a => ({ id_area: a.id_area, nombre_area: a.nombre_area }));

  return asesor;
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

    // 3. Si el usuario es asesor (role = 1), crear su perfil de asesor
    if (roles.includes(1)) {
      await conn.query(
        `INSERT INTO perfiles_asesores 
        (id_asesor, conteo_asesorias, calificacion_promedio)
        VALUES (?, 0, 0.0)`,
        [id_usuario]
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
      c.nombre_carrera
    FROM usuarios u
    LEFT JOIN carreras c ON u.fk_carrera = c.id_carrera
    WHERE u.correo = ? 
      AND u.es_activo = TRUE
    LIMIT 1
    `,
    [correo]
  );

  return rows[0] || null;
}


export async function getRolesByUserId(idUsuario) {
  const [rows] = await mysqlPool.query(
    `
    SELECT ur.fk_rol AS id_rol
    FROM usuario_rol ur
    WHERE ur.fk_usuario = ?
    `,
    [idUsuario]
  );

  // Devuelve un array de IDs: [1] o [1,2]
  return rows.map(r => r.id_rol);
}

export async function updateAsesorProfile(id_asesor, data) {
  const { nombre_completo, semestre, fk_carrera, password_hash, ruta_foto, temas } = data;

  const conn = await mysqlPool.getConnection();
  try {
    await conn.beginTransaction();

    const updates = [];
    const params = [];

    if (nombre_completo) {
      updates.push("nombre_completo = ?");
      params.push(nombre_completo);
    }
    if (semestre) {
      updates.push("semestre = ?");
      params.push(semestre);
    }
    if (fk_carrera) {
      updates.push("fk_carrera = ?");
      params.push(fk_carrera);
    }
    if (password_hash) {
      updates.push("password_hash = ?");
      params.push(password_hash);
    }
    if (ruta_foto) {
      updates.push("ruta_foto = ?");
      params.push(ruta_foto);
    }

    if (updates.length > 0) {
      params.push(id_asesor);
      await conn.query(
        `UPDATE usuarios SET ${updates.join(", ")} WHERE id_usuario = ?`,
        params
      );
    }

    // Actualizar temas si se proporcionan
    if (temas && Array.isArray(temas)) {
      // 1. Eliminar relaciones existentes
      await conn.query("DELETE FROM asesores_temas WHERE fk_asesor = ?", [id_asesor]);

      // 2. Insertar nuevos temas
      for (const t of temas) {
        // Buscar si el tema ya existe por nombre y área
        // Primero necesitamos el ID del área.
        // Asumimos que el frontend envía el nombre del área.
        const [areaRows] = await conn.query(
          "SELECT id_area FROM areas_conocimiento WHERE nombre_area = ? LIMIT 1",
          [t.area]
        );
        
        let id_area = null;
        if (areaRows.length > 0) {
          id_area = areaRows[0].id_area;
        } else {
          // Si no existe el área, podríamos crearla o saltar.
          // Por simplicidad, saltamos si el área no es válida.
          continue;
        }

        // Buscar o crear el tema
        // Buscamos solo por nombre porque tiene restricción UNIQUE en la BD
        const [temaRows] = await conn.query(
          "SELECT id_tema FROM temas WHERE nombre_tema = ? LIMIT 1",
          [t.topic]
        );

        let id_tema = null;
        if (temaRows.length > 0) {
          id_tema = temaRows[0].id_tema;
          // Actualizamos el área del tema existente para reflejar el cambio solicitado
          await conn.query("UPDATE temas SET fk_area = ? WHERE id_tema = ?", [id_area, id_tema]);
        } else {
          const [insertTema] = await conn.query(
            "INSERT INTO temas (nombre_tema, fk_area) VALUES (?, ?)",
            [t.topic, id_area]
          );
          id_tema = insertTema.insertId;
        }

        // Relacionar tema con asesor
        await conn.query(
          "INSERT INTO asesores_temas (fk_asesor, fk_tema) VALUES (?, ?)",
          [id_asesor, id_tema]
        );
      }
    }

    await conn.commit();
    return true;
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

export async function createDisponibilidad(data) {
  const {
    fk_asesor,
    fecha_inicio,
    fecha_fin,
    modalidad,
    tipo_sesion,
    fk_tema,
    precio,
    capacidad,
    es_disponible
  } = data;

  const [result] = await mysqlPool.query(
    `INSERT INTO disponibilidades 
    (fk_asesor, fecha_inicio, fecha_fin, modalidad, tipo_sesion, fk_tema, precio, capacidad, es_disponible)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [fk_asesor, fecha_inicio, fecha_fin, modalidad, tipo_sesion, fk_tema, precio, capacidad, es_disponible || 1]
  );
  return result.insertId;
}

export async function getDisponibilidades(id_asesor, filtros = {}) {
  const { fecha_desde, fecha_hasta } = filtros;
  const conditions = ["d.fk_asesor = ?"];
  const params = [id_asesor];

  if (fecha_desde) {
    conditions.push("DATE(d.fecha_inicio) >= ?");
    params.push(fecha_desde);
  }
  if (fecha_hasta) {
    conditions.push("DATE(d.fecha_fin) <= ?");
    params.push(fecha_hasta);
  }

  const query = `
    SELECT 
      d.id_disponibilidad,
      d.fecha_inicio,
      d.fecha_fin,
      d.modalidad,
      d.tipo_sesion,
      d.precio,
      d.capacidad,
      d.es_disponible,
      t.nombre_tema,
      a.nombre_area,
      (SELECT COUNT(*) FROM inscripciones_sesion i WHERE i.fk_disponibilidad = d.id_disponibilidad AND i.estado != 'cancelada') as inscritos
    FROM disponibilidades d
    LEFT JOIN temas t ON d.fk_tema = t.id_tema
    LEFT JOIN areas_conocimiento a ON t.fk_area = a.id_area
    WHERE ${conditions.join(" AND ")}
    ORDER BY d.fecha_inicio ASC
  `;

  const [rows] = await mysqlPool.query(query, params);
  return rows;
}

export async function deleteDisponibilidad(id_disponibilidad, id_asesor) {
  const [result] = await mysqlPool.query(
    "DELETE FROM disponibilidades WHERE id_disponibilidad = ? AND fk_asesor = ?",
    [id_disponibilidad, id_asesor]
  );
  return result.affectedRows > 0;
}
