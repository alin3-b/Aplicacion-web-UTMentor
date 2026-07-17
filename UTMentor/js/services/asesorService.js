//UTMentor/js/services/asesorServidor.js
// Servicio para interactuar con la API de asesores
const API_BASE_URL = "/api";

export async function obtenerAsesores(filtros = {}) {
  try {
    // Construimos query string según los filtros
    const params = new URLSearchParams();

    if (filtros.asesor) params.append("nombre", filtros.asesor);
    if (filtros.carrera) params.append("carrera", filtros.carrera);
    if (filtros.tema) params.append("tema", filtros.tema);
    if (filtros.area) params.append("area", filtros.area);
    if (filtros.dia) params.append("dia", filtros.dia);
    if (filtros.desde) params.append("horaDesde", filtros.desde);
    if (filtros.hasta) params.append("horaHasta", filtros.hasta);

    const url = `${API_BASE_URL}/usuarios/asesores?${params.toString()}`;

    const response = await fetch(url);
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Error al obtener asesores:", error);
    throw error;
  }
}

/**
 * Obtiene la información de un asesor específico
 * @param {number} id - ID del asesor
 * @returns {Promise<Object>} Información del asesor con disponibilidades
 */
export async function obtenerAsesorPorId(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/usuarios/asesor/${id}`);

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error al obtener asesor ${id}:`, error);
    throw error;
  }
}

