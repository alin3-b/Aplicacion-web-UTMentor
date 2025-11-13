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

export async function getAllAsesores() {
  const [rows] = await mysqlPool.query(`
    SELECT 
      u.id_usuario,
      u.nombre_completo,
      c.nombre_carrera,
      pa.conteo_asesorias as numero_sesiones,
      pa.calificacion_promedio as puntuacion_promedio,
      pa.descripcion,
      pa.correo_contacto
    FROM usuarios u
    INNER JOIN perfiles_asesores pa ON u.id_usuario = pa.id_asesor
    LEFT JOIN carreras c ON u.fk_carrera = c.id_carrera
    WHERE u.es_activo = TRUE
    ORDER BY pa.calificacion_promedio DESC, pa.conteo_asesorias DESC
  `);

  // Para cada asesor, obtener sus disponibilidades
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
          IFNULL(COUNT(i.id_inscripcion), 0) as inscritos
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

export async function getAsesorInfo(id_asesor) {
  const [rows] = await mysqlPool.query(
    `
    SELECT 
      u.id_usuario,
      u.nombre_completo,
      c.nombre_carrera,
      pa.conteo_asesorias as numero_sesiones,
      pa.calificacion_promedio as puntuacion_promedio,
      pa.descripcion,
      pa.correo_contacto
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

  // Obtener disponibilidades del asesor
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
      IFNULL(COUNT(i.id_inscripcion), 0) as inscritos
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

export async function insertDummyAsesores() {
  const connection = await mysqlPool.getConnection();

  try {
    await connection.beginTransaction();

    // Insertar 5 usuarios dummy
    const usuarios = [
      [
        "Juan Pérez García",
        "juan.perez@utleon.edu.mx",
        6,
        3,
        "$2b$10$dummyhash1",
      ],
      [
        "María López Hernández",
        "maria.lopez@utleon.edu.mx",
        8,
        2,
        "$2b$10$dummyhash2",
      ],
      [
        "Carlos Ramírez Torres",
        "carlos.ramirez@utleon.edu.mx",
        7,
        5,
        "$2b$10$dummyhash3",
      ],
      [
        "Ana Martínez Silva",
        "ana.martinez@utleon.edu.mx",
        9,
        12,
        "$2b$10$dummyhash4",
      ],
      [
        "Luis González Vega",
        "luis.gonzalez@utleon.edu.mx",
        6,
        7,
        "$2b$10$dummyhash5",
      ],
    ];

    const usuariosIds = [];
    for (const usuario of usuarios) {
      const [result] = await connection.query(
        `INSERT INTO usuarios (nombre_completo, correo, semestre, fk_carrera, password_hash, fk_rol_activo, es_activo)
         VALUES (?, ?, ?, ?, ?, 1, TRUE)`,
        usuario
      );
      usuariosIds.push(result.insertId);
    }

    // Crear perfiles de asesores
    const perfiles = [
      [
        "Especialista en estructuras de datos y algoritmos. Más de 50 asesorías exitosas.",
        "juan.perez@utleon.edu.mx",
        48,
        4.8,
      ],
      [
        "Experta en desarrollo web full-stack. Paciencia y claridad en las explicaciones.",
        "maria.lopez@utleon.edu.mx",
        65,
        4.9,
      ],
      [
        "Ingeniero electrónico con amplia experiencia en proyectos prácticos.",
        "carlos.ramirez@utleon.edu.mx",
        32,
        4.6,
      ],
      [
        "Matemática aplicada, especializada en cálculo diferencial e integral.",
        "ana.martinez@utleon.edu.mx",
        78,
        5.0,
      ],
      [
        "Experto en manufactura esbelta y control de calidad.",
        "luis.gonzalez@utleon.edu.mx",
        41,
        4.7,
      ],
    ];

    for (let i = 0; i < usuariosIds.length; i++) {
      await connection.query(
        `INSERT INTO perfiles_asesores (id_asesor, descripcion, correo_contacto, conteo_asesorias, calificacion_promedio)
         VALUES (?, ?, ?, ?, ?)`,
        [usuariosIds[i], ...perfiles[i]]
      );
    }

    // Crear áreas y temas si no existen
    const [areas] = await connection.query(
      "SELECT id_area FROM areas_conocimiento LIMIT 1"
    );

    if (areas.length > 0) {
      // Verificar si hay temas
      const [temas] = await connection.query(
        "SELECT id_tema FROM temas LIMIT 3"
      );

      if (temas.length >= 3) {
        // Crear disponibilidades para cada asesor
        const ahora = new Date();
        for (let i = 0; i < usuariosIds.length; i++) {
          // 2 disponibilidades por asesor
          for (let j = 0; j < 2; j++) {
            const diasAdelante = i * 7 + j * 3 + 1;
            const fechaInicio = new Date(ahora);
            fechaInicio.setDate(ahora.getDate() + diasAdelante);
            fechaInicio.setHours(10 + j * 4, 0, 0, 0);

            const fechaFin = new Date(fechaInicio);
            fechaFin.setHours(fechaInicio.getHours() + 2);

            const modalidad = j === 0 ? "virtual" : "presencial";
            const tipoSesion = j === 0 ? "individual" : "grupal";
            const precio = j === 0 ? 100.0 : 50.0;
            const capacidad = j === 0 ? 1 : 5;
            const temaId = temas[i % temas.length].id_tema;

            await connection.query(
              `INSERT INTO disponibilidades 
               (fk_asesor, fecha_inicio, fecha_fin, modalidad, tipo_sesion, fk_tema, precio, capacidad, es_disponible)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, TRUE)`,
              [
                usuariosIds[i],
                fechaInicio,
                fechaFin,
                modalidad,
                tipoSesion,
                temaId,
                precio,
                capacidad,
              ]
            );
          }
        }
      }
    }

    await connection.commit();
    return { success: true, ids: usuariosIds };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
