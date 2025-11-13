// Servicio para interactuar con la API de asesores
const API_BASE_URL = "http://localhost:3000/api";

/**
 * Obtiene todos los asesores
 * @returns {Promise<Array>} Lista de asesores con su información y disponibilidades
 */
export async function obtenerAsesores() {
  try {
    const response = await fetch(`${API_BASE_URL}/usuarios/asesores`);

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

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

/**
 * Genera datos dummy de asesores (solo para pruebas)
 * @returns {Promise<Object>} Resultado de la creación
 */
export async function generarAsesoresDummy() {
  try {
    const response = await fetch(`${API_BASE_URL}/usuarios/asesores/dummy`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error al generar asesores dummy:", error);
    throw error;
  }
}
