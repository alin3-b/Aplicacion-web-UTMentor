// UTmentor/js/services/topicService.js
// Servicio para interactuar con la API de temas
const API_BASE_URL = "/api";  // ← Usa el PROXY de NGINX

/**
 * Obtiene los temas más populares
 * @returns {Promise<Array>} Lista de temas con número de asesores y reservas
 */
export async function obtenerTemasPopulares() {
    try {
        const response = await fetch(`${API_BASE_URL}/usuarios/temas/populares`);

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error al obtener temas populares:", error);
        throw error;
    }
}
