// ../js/registro.js
document.documentElement.classList.remove("no-js");

/* ===========================================================
   UTILIDADES
=========================================================== */
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

/* ===========================================================
   TOAST
=========================================================== */
function showToast(message, isError = false) {
    const toast = document.getElementById("toastMensaje");
    toast.textContent = message;
    toast.classList.toggle("error", isError);
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 3500);
}

/* ===========================================================
   MODAL DE ROLES
=========================================================== */
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
        const nuevoBtn = btn.cloneNode(true);
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

/* ===========================================================
   LIMPIAR INPUTS
=========================================================== */
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

window.addEventListener("load", limpiarInputsRegistro);
window.addEventListener("pageshow", (event) => {
    if (event.persisted) cerrarSesion();
    limpiarInputsRegistro();
});

/* ===========================================================
   SELECT SEMESTRES
=========================================================== */
const semestre = document.getElementById("semestre");
for (let i = 1; i <= 10; i++) {
    const opt = document.createElement("option");
    opt.value = i;
    opt.textContent = `${i}° semestre`;
    semestre.appendChild(opt);
}

/* ===========================================================
   VALIDACIÓN PERSONALIZADA
=========================================================== */
function limpiarErrores() {
    document.querySelectorAll(".campo-error").forEach(el => el.classList.remove("campo-error"));
    document.querySelectorAll(".error-msg").forEach(el => el.textContent = "");
}

document.getElementById("formRegistro").addEventListener("submit", async (e) => {
    e.preventDefault();
    limpiarErrores();

    const nombre = sanitize(document.getElementById("nombre_completo").value.trim());
    const correo = sanitize(document.getElementById("correo").value.trim());
    const password = sanitize(document.getElementById("password").value.trim());
    const confirmPassword = sanitize(document.getElementById("confirmPassword").value.trim());
    const roles = document.getElementById("roles").value.split(",").map(Number);
    const fk_carrera = Number(document.getElementById("fk_carrera").value);
    const semestreVal = Number(document.getElementById("semestre").value);
    const policy = document.getElementById("policy");

    let faltanCampos = false;

    /* ========= CAMPOS DE TEXTO ========= */
    const camposTexto = [
        { id: "nombre_completo", val: nombre },
        { id: "correo", val: correo },
        { id: "password", val: password },
        { id: "confirmPassword", val: confirmPassword }
    ];

    camposTexto.forEach(c => {
        const el = document.getElementById(c.id);
        if (!c.val) {
            faltanCampos = true;
            el.classList.add("campo-error");
        }
    });

    /* ========= VALIDAR CARRERA ========= */
    if (!fk_carrera || fk_carrera === 0) {
        document.getElementById("fk_carrera").classList.add("campo-error");
        faltanCampos = true;
    }

    /* ========= VALIDAR SEMESTRE ========= */
    if (!semestreVal || semestreVal === 0) {
        document.getElementById("semestre").classList.add("campo-error");
        faltanCampos = true;
    }

    /* ========= VALIDAR ROLES ========= */
    if (!roles || roles.length === 0 || roles[0] === 0 || isNaN(roles[0])) {
        document.getElementById("roles").classList.add("campo-error");
        faltanCampos = true;
    }

    /* ========= MENSAJE GENERAL ========= */
    if (faltanCampos) {
        showToast("Completa todos los campos requeridos", true);
        return;
    }

    let hayErrores = false;

    // Nombre completo
    const nombreC = document.getElementById("nombre_completo");
    const errorNombre = document.getElementById("errorNombre");
    const nombreRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ ]{3,60}$/;
    if (!nombreRegex.test(nombreC.value)) {
        nombreC.classList.add("campo-error");
        errorNombre.textContent = "Ingresa un nombre válido (solo letras y espacios)";
        errorNombre.style.display = "block";
        hayErrores = true;
    }

    // Correo
    const correoInput = document.getElementById("correo");
    const errorCorreo = document.getElementById("errorCorreo");
    const correoRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!correoRegex.test(correoInput.value)) {
        correoInput.classList.add("campo-error");
        errorCorreo.textContent = "Ingresa un correo válido";
        errorCorreo.style.display = "block";
        hayErrores = true;
    }

    // Contraseña
    const passwordInput = document.getElementById("password");
    const errorContras = document.getElementById("errorContras");
    if (passwordInput.value.length < 8) {
        passwordInput.classList.add("campo-error");
        errorContras.textContent = "La contraseña debe tener al menos 8 caracteres";
        errorContras.style.display = "block";
        hayErrores = true;
    }

    // Confirmar contraseña
    const confirmInput = document.getElementById("confirmPassword");
    const errorConfirm = document.getElementById("errorConfirm");
    if (confirmInput.value !== passwordInput.value) {
        confirmInput.classList.add("campo-error");
        errorConfirm.textContent = "Las contraseñas no coinciden";
        errorConfirm.style.display = "block";
        hayErrores = true;
    }

    // Términos y condiciones
    const policyy = document.getElementById("policy");
    const policyError = document.getElementById("policyError");
    if (!policyy.checked) {
        policyy.classList.add("campo-error");
        policyError.textContent = "Debes aceptar los términos y condiciones";
        policyError.style.display = "block";
        hayErrores = true;
    }

    // Si hay errores, no continuar con el registro
    if (hayErrores) return;

    /* ===========================================================
       SI TODO ESTÁ BIEN → REGISTRAR
    ============================================================ */
    const data = {
        nombre_completo: nombre,
        correo,
        password,
        roles,
        fk_carrera,
        semestre: semestreVal
    };

    const { ok, data: result } = await apiPost("/api/usuarios", data);
    if (!ok) {
        showToast(result.error || "Error interno del servidor", true);
        return;
    }

    const loginRes = await apiPost("/api/usuarios/login", { correo, password });
    if (!loginRes.ok || !loginRes.data.success) {
        showToast("Usuario registrado pero no se pudo iniciar sesión automáticamente.", true);
        return;
    }

    const usuario = loginRes.data.usuario;
    usuario.roles = usuario.roles.map(r => r === 1 ? "Asesor" : r === 2 ? "Asesorado" : "Usuario");
    usuario.nombre_rol = usuario.nombre_rol || usuario.roles[0];
    
    // Asignar id para compatibilidad con paneles
    usuario.id = usuario.id_usuario;

    localStorage.setItem("usuario", JSON.stringify(usuario));
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("token", loginRes.data.token);

    showToast("Usuario registrado y logueado correctamente");

    if (usuario.roles.length > 1) abrirModalDeRoles();
    else if (usuario.nombre_rol === "Asesor") window.location.href = "panelAsesor.html";
    else window.location.href = "panelAsesorado.html";
});

/* ===========================================================
   🔥 QUITAR ROJO EN CUANTO SE ESCRIBA / SELECCIONE
=========================================================== */
const campos = [
    "nombre_completo",
    "correo",
    "password",
    "confirmPassword",
    "fk_carrera",
    "semestre",
    "roles"
];

campos.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;

    el.addEventListener("input", () => {
        el.classList.remove("campo-error");
    });

    el.addEventListener("change", () => {
        el.classList.remove("campo-error");
    });
});

/* ===========================================================
   TOGGLE PASSWORD
=========================================================== */
const passInput = document.getElementById("password");
const togglePass = document.getElementById("togglePass");

togglePass.addEventListener("click", () => {
    const visible = passInput.type === "text";
    passInput.type = visible ? "password" : "text";
    togglePass.src = visible ? "../imagenes/vista.png" : "../imagenes/ocultar.png";
});

const confirmInput = document.getElementById("confirmPassword");
const toggleConfirmPass = document.getElementById("toggleConfirmPass");

toggleConfirmPass.addEventListener("click", () => {
    const visible = confirmInput.type === "text";
    confirmInput.type = visible ? "password" : "text";
    toggleConfirmPass.src = visible ? "../imagenes/vista.png" : "../imagenes/ocultar.png";
});

const camposConErrores = [
    { inputId: "nombre_completo", errorId: "errorNombre" },
    { inputId: "correo", errorId: "errorCorreo" },
    { inputId: "password", errorId: "errorContras" },
    { inputId: "confirmPassword", errorId: "errorConfirm" },
    { inputId: "policy", errorId: "policyError" }
];

camposConErrores.forEach(campo => {
    const input = document.getElementById(campo.inputId);
    const errorMsg = document.getElementById(campo.errorId);

    if (!input) return;

    // Si es un checkbox (policy)
    if (input.type === "checkbox") {
        input.addEventListener("change", () => {
            input.classList.remove("campo-error");
            errorMsg.textContent = "";
            errorMsg.style.display = "none";
        });
    } else {
        // Para inputs de texto, correo y password
        input.addEventListener("input", () => {
            input.classList.remove("campo-error");
            errorMsg.textContent = "";
            errorMsg.style.display = "none";
        });
    }
});
