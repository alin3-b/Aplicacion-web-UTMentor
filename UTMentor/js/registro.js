// js/registro.js
const signupForm = document.getElementById("signupForm");
const btnSignup = document.getElementById("btnSignup");
const signupError = document.getElementById("signupError");
const signupInfo = document.getElementById("signupInfo");
const dupHint = document.getElementById("dupHint");

// URL FINAL CORRECTA (puerto 3000 + ruta montada en server.js)
const API_BASE = "http://localhost:3000/api/usuarios";

// MAPEO DE ROLES SEGÚN TU BASE DE DATOS REAL
const ROLES_MAP = {
  asesorado: [2],     // Solo estudiante
  asesor: [1],        // Solo asesor
  ambos: [1, 2]       // Ambos roles
};

signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Limpiar mensajes anteriores
  signupError.textContent = "";
  signupInfo.textContent = "";
  dupHint.hidden = true;

  // Capturar datos del formulario
  const rolSeleccionado = document.getElementById("role").value;
  const nombre_completo = document.getElementById("fullName").value.trim();
  const semestre = parseInt(document.getElementById("semester").value);
  const fk_carrera = parseInt(document.getElementById("career").value);
  const correo = document.getElementById("email").value.trim().toLowerCase();
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;
  const policy = document.getElementById("policy").checked;

  // Validaciones del frontend
  if (!rolSeleccionado) return showError("Selecciona tu rol");
  if (!nombre_completo) return showError("Ingresa tu nombre completo");
  if (isNaN(semestre)) return showError("Selecciona tu semestre");
  if (isNaN(fk_carrera)) return showError("Selecciona tu carrera");
  if (!correo) return showError("Ingresa tu correo");
  if (password.length < 6) return showError("La contraseña debe tener al menos 6 caracteres");
  if (password !== confirmPassword) return showError("Las contraseñas no coinciden");
  if (!policy) return showError("Debes aceptar las políticas de privacidad");

  // Datos que se envían al backend
  const payload = {
    nombre_completo,
    correo,
    semestre,
    fk_carrera,
    password,
    roles: ROLES_MAP[rolSeleccionado]  // Aquí se decide si es 1, 2 o [1,2]
  };

  console.log("Enviando al backend:", payload); // Para que veas exactamente qué se manda

  try {
    btnSignup.disabled = true;
    btnSignup.textContent = "Creando cuenta...";

    const response = await fetch(API_BASE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    console.log("Respuesta del servidor:", data);

    if (response.status === 201) {
      // ÉXITO: usuario creado y guardado en la base de datos
      signupInfo.textContent = "¡Cuenta creada con éxito!";
      signupInfo.style.color = "#10b981";

      setTimeout(() => {
        if (rolSeleccionado === "ambos") {
          document.getElementById("roleModal").style.display = "block";
          document.getElementById("roleModal").removeAttribute("aria-hidden");
        } else if (rolSeleccionado === "asesor") {
          window.location.href = "panelAsesor.html";
        } else {
          window.location.href = "panelAsesorado.html";
        }
      }, 1500);

    } else if (response.status === 400 && data.error?.includes("correo")) {
      dupHint.hidden = false;
    } else {
      showError(data.error || "Error desconocido al registrarse");
    }

  } catch (err) {
    console.error("Error de red:", err);
    showError("No se pudo conectar al servidor. Asegúrate de que esté corriendo en el puerto 3000");
  } finally {
    btnSignup.disabled = false;
    btnSignup.textContent = "Registrarse";
  }
});

function showError(mensaje) {
  signupError.textContent = mensaje;
}

// Cerrar modal
document.querySelectorAll("[data-role-dismiss]").forEach(el => {
  el.addEventListener("click", () => {
    const modal = document.getElementById("roleModal");
    modal.style.display = "none";
    modal.setAttribute("aria-hidden", "true");
  });
});