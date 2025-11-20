// Configuración global de la API
const API_CONFIG = {
  baseURL: "http://localhost:3000",
  endpoints: {
    login: "/api/usuarios/login",
    register: "/api/usuarios",
    usuarios: "/api/usuarios",
    asesores: "/api/usuarios/asesores",
    recuperarPassword: "/api/email/recuperar-password",
    pagos: "/api/pagos",
  },
};

// Función helper para construir URLs completas
function getApiUrl(endpoint) {
  return `${API_CONFIG.baseURL}${API_CONFIG.endpoints[endpoint] || endpoint}`;
}

// Exportar para uso en otros archivos
if (typeof module !== "undefined" && module.exports) {
  module.exports = { API_CONFIG, getApiUrl };
}
