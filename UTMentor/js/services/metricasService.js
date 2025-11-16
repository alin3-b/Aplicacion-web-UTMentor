const API_BASE_URL = "/api";

export async function obtenerMetricas() {
    try {
        const response = await fetch(`${API_BASE_URL}/usuarios/metricas`);
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error("Error al obtener métricas:", error);
        return null;
    }
}
