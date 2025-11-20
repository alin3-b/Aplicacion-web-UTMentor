// ../js/registro.js
document.documentElement.classList.remove("no-js");

// ===========================
// UTILIDADES
// ===========================
function sanitize(input) {
    return input.replace(/[<>'"]/g, "");
}

async function apiPost(url, body) {
    try {
        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });
        const data = await res.json();
        return { ok: res.ok, status: res.status, data };
    } catch (err) {
        console.error("Error en API:", err);
        return { ok: false, status: 0, data: { success: false, message: "Error de conexión" } };
    }
}

function cerrarSesion() {
    localStorage.removeItem("usuario");
    localStorage.removeItem("token");
    localStorage.removeItem("isLoggedIn");
    cerrarModalDeRoles();
}

// ===========================
// TOAST
// ===========================
function showToast(message, isError = false) {
    const toast = document.getElementById("toastMensaje");
    toast.textContent = message;
    toast.classList.toggle("error", isError);
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 3500);
}

// ===========================
// MODAL DE ROLES
// ===========================
const modal = document.getElementById("roleModal");
function abrirModalDeRoles() {
    if (!modal) return;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    configurarBotonesModal();
}
function cerrarModalDeRoles() {
    if (!modal) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
}
function configurarBotonesModal() {
    const botones = modal.querySelectorAll("[data-role]");
    botones.forEach(btn => {
        const nuevoBtn = btn.cloneNode(true); // eliminar listeners previos
        btn.parentNode.replaceChild(nuevoBtn, btn);
        nuevoBtn.addEventListener("click", () => {
            const rol = nuevoBtn.getAttribute("data-role");
            const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
            usuario.rolActivo = rol;
            localStorage.setItem("usuario", JSON.stringify(usuario));

            cerrarModalDeRoles();
            if (rol === "Asesor") window.location.href = "panelAsesor.html";
            else window.location.href = "panelAsesorado.html";
        });
    });

    const dismissBtn = modal.querySelector("[data-role-dismiss]");
    dismissBtn?.addEventListener("click", cerrarModalDeRoles);
}

// ===========================
// LIMPIAR INPUTS AL CARGAR O VOLVER ATRÁS
// ===========================
function limpiarInputsRegistro() {
  const inputs = [
    "nombre_completo",
    "correo",
    "password",
    "confirmPassword",
    "semestre",
    "fk_carrera",
    "roles"
  ];
  inputs.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
  const policy = document.getElementById("policy");
  if (policy) policy.checked = false;
}

window.addEventListener("load", () => limpiarInputsRegistro());
window.addEventListener("pageshow", (event) => {
    if (event.persisted) cerrarSesion();
    limpiarInputsRegistro();
});

// ===========================
// SELECT SEMESTRES
// ===========================
const semestre = document.getElementById("semestre");
for (let i = 1; i <= 10; i++) {
    const opt = document.createElement("option");
    opt.value = i;
    opt.textContent = `${i}° semestre`;
    semestre.appendChild(opt);
}

// ===========================
// FORMULARIO REGISTRO
// ===========================
const regexNombre = /^[A-Za-zÁÉÍÓÚáéíóúÑñ ]{3,60}$/;
const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const regexPassword = /^[A-Za-z0-9!@#$%^&*()_\-+=.?]{6,50}$/;

document.getElementById("formRegistro").addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombre = sanitize(document.getElementById("nombre_completo").value.trim());
    const correo = sanitize(document.getElementById("correo").value.trim());
    const password = sanitize(document.getElementById("password").value.trim());
    const confirmPassword = sanitize(document.getElementById("confirmPassword").value.trim());
    const roles = document.getElementById("roles").value.split(",").map(Number);
    const fk_carrera = Number(document.getElementById("fk_carrera").value);
    const semestreVal = Number(document.getElementById("semestre").value);
    const policy = document.getElementById("policy");

    // Validaciones
    if (!regexNombre.test(nombre)) { showToast("Nombre inválido (3-60 letras).", true); return; }
    if (!regexCorreo.test(correo)) { showToast("Correo inválido.", true); return; }
    if (!regexPassword.test(password)) { showToast("Contraseña inválida.", true); return; }
    if (password !== confirmPassword) { showToast("Las contraseñas no coinciden.", true); return; }
    if (!policy.checked) { showToast("Debes aceptar los términos y condiciones.", true); return; }

    const data = { nombre_completo: nombre, correo, password, roles, fk_carrera, semestre: semestreVal };

    // Registro usuario
    const { ok, data: result } = await apiPost("/api/usuarios", data);
    if (!ok) { showToast(result.error || "Error interno del servidor", true); return; }

    // Registro exitoso → iniciar sesión automáticamente
    const loginRes = await apiPost("/api/usuarios/login", { correo, password });
    if (!loginRes.ok || !loginRes.data.success) {
        showToast("Usuario registrado pero no se pudo iniciar sesión automáticamente.", true);
        return;
    }

    const usuario = loginRes.data.usuario;
    usuario.roles = usuario.roles.map(r => r === 1 ? "Asesor" : r === 2 ? "Asesorado" : "Usuario");
    usuario.nombre_rol = usuario.nombre_rol || usuario.roles[0];

    localStorage.setItem("usuario", JSON.stringify(usuario));
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("token", loginRes.data.token);

    showToast("Usuario registrado y logueado correctamente");

    // Redirección según roles
    if (usuario.roles.length > 1) abrirModalDeRoles();
    else if (usuario.nombre_rol === "Asesor") window.location.href = "panelAsesor.html";
    else window.location.href = "panelAsesorado.html";
});
