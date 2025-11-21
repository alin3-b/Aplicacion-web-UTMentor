// UTMentor/js/iniciarSesion.js
document.documentElement.classList.remove("no-js");
/* ===========================
   LIMPIAR INPUTS AL CARGAR O VOLVER ATRÁS
=========================== */
function limpiarInputsLogin() {
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  if (emailInput) emailInput.value = "";
  if (passwordInput) passwordInput.value = "";
}

// Cuando la página se carga normalmente
window.addEventListener("load", () => {
  limpiarInputsLogin();
});

// Cuando la página viene del cache de historial (back button)
window.addEventListener("pageshow", (event) => {
  if (event.persisted) {
    cerrarSesion(); // limpia localStorage
  }
  limpiarInputsLogin(); // limpia inputs siempre
});


/* ===========================
   SESIÓN
=========================== */
function verificarSesion() {
  const token = localStorage.getItem("token");
  const usuario = JSON.parse(localStorage.getItem("usuario") || "null");
  if (!token || !usuario) {
    cerrarSesion();
    return false;
  }
  return true;
}

function cerrarSesion() {
  console.log("⚠ Cerrando sesión por seguridad");
  localStorage.removeItem("usuario");
  localStorage.removeItem("token");
  localStorage.removeItem("isLoggedIn");
  cerrarModalDeRoles();
}

/* ===========================
   MODAL DE ROLES
=========================== */
const modal = document.getElementById("roleModal");
if (modal) {
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
}

function abrirModalDeRoles() {
  if (!verificarSesion()) return; // no abrir modal si sesión inválida
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

document.querySelectorAll("[data-role-dismiss]").forEach(el => el.addEventListener("click", cerrarModalDeRoles));

function configurarBotonesModal() {
  const botonesRol = document.querySelectorAll("#roleModal [data-role]");
  botonesRol.forEach((btn) => {
    const nuevoBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(nuevoBtn, btn);

    nuevoBtn.addEventListener("click", (e) => {
      e.preventDefault();

      // Verificar sesión antes de permitir selección
      if (!verificarSesion()) {
        cerrarModalDeRoles();
        alert("Tu sesión ha expirado. Por favor, inicia sesión de nuevo.");
        window.location.href = "iniciarSesion.html";
        return;
      }

      const rolSeleccionado = nuevoBtn.getAttribute("data-role");
      if (!["Asesor", "Asesorado"].includes(rolSeleccionado)) {
        console.warn("Rol no permitido:", rolSeleccionado);
        return;
      }

      const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
      usuario.rolActivo = rolSeleccionado;
      usuario.nombre_rol = rolSeleccionado;
      localStorage.setItem("usuario", JSON.stringify({
        id: usuario.id,
        nombre: usuario.nombre,
        roles: usuario.roles,
        rolActivo: rolSeleccionado
      }));

      console.log("⚡ Usuario seleccionó el rol:", rolSeleccionado);
      if (rolSeleccionado === "Asesor") window.location.href = "panelAsesor.html";
      else window.location.href = "panelAsesorado.html";
    });
  });
}

/* ===========================
   UTILIDADES
=========================== */
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

function sanitizeInput(str) {
  const temp = document.createElement("div");
  temp.textContent = str;
  return temp.innerHTML;
}

/* ===========================
   NAV MÓVIL
=========================== */
(function navMobile() {
  const burger = document.querySelector(".burger");
  const panel = document.getElementById("mobile-panel");
  const label = burger?.querySelector(".burger-label");
  if (!burger || !panel) return;

  const setOpen = (open) => {
    panel.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    burger.setAttribute("title", open ? "Cerrar menú" : "Abrir menú");
    if (label) label.textContent = open ? "Cerrar" : "Menú";
  };

  burger.addEventListener("click", () => setOpen(!panel.classList.contains("open")));
  panel.addEventListener("click", (e) => { if (e.target.closest("a")) setOpen(false); });
  window.addEventListener("keydown", (e) => { if (e.key === "Escape") setOpen(false); });
  document.addEventListener("click", (e) => {
    if (window.innerWidth > 860) return;
    if (!panel.contains(e.target) && !burger.contains(e.target)) setOpen(false);
  });
})();

/* ===========================
   LOGIN
=========================== */
(function () {
  console.log("=== Inicializando módulo de login ===");

  const form = document.getElementById("loginForm") || document.querySelector(".login-form");
  if (!form) return console.error("No se encontró el formulario de login");

  const emailInput = document.getElementById("email") || form.querySelector('input[type="email"]');
  const passwordInput = document.getElementById("password") || form.querySelector('input[type="password"]');
  const togglePwBtn = form.querySelector(".toggle-pw");

  const emailGroup = emailInput?.closest(".input-group");
  const passGroup = passwordInput?.closest(".input-group");

  const emailError = document.getElementById("emailError") || emailGroup?.querySelector(".input-error");
  const passwordError = document.getElementById("passwordError") || passGroup?.querySelector(".input-error");

  const authError = document.getElementById("authError") || (() => {
    const el = document.createElement("p");
    el.className = "auth-error";
    const submitBtn = form.querySelector('[type="submit"], .btn-login');
    submitBtn?.parentNode?.insertBefore(el, submitBtn.nextSibling) || form.appendChild(el);
    return el;
  })();

  const submitBtn = form.querySelector('[type="submit"], .btn-login');
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

  function setFieldError(groupEl, errorEl, message) {
    if (!groupEl || !errorEl) return;
    errorEl.textContent = sanitizeInput(message || "");
    groupEl.classList.toggle("is-invalid", !!message);
    errorEl.style.display = message ? "block" : "none";
    const input = groupEl.querySelector("input");
    input?.setAttribute("aria-invalid", !!message);
  }

  function showAuthError(message) {
    if (!authError) return;
    authError.textContent = sanitizeInput(message || "");
    authError.classList.toggle("is-visible", !!message);
    if (message) {
      authError.setAttribute("role", "alert");
      authError.setAttribute("aria-live", "polite");
    } else {
      authError.removeAttribute("role");
      authError.removeAttribute("aria-live");
    }
  }

  function disableSubmit(state) {
    if (!submitBtn) return;
    submitBtn.disabled = !!state;
    if (state) {
      submitBtn.dataset._label = submitBtn.textContent.trim();
      submitBtn.textContent = "Entrando…";
    } else if (submitBtn.dataset._label) {
      submitBtn.textContent = submitBtn.dataset._label;
      delete submitBtn.dataset._label;
    }
  }

  togglePwBtn?.addEventListener("click", () => {
    const isText = passwordInput.type === "text";
    passwordInput.type = isText ? "password" : "text";
    togglePwBtn.setAttribute("aria-pressed", String(!isText));
  });

  function validateEmail() {
    const value = sanitizeInput((emailInput.value || "").trim().toLowerCase());
    emailInput.value = value;
    if (!value) { setFieldError(emailGroup, emailError, "Ingresa tu correo."); return false; }
    if (!EMAIL_RE.test(value)) { setFieldError(emailGroup, emailError, "Ingresa un correo válido."); return false; }
    setFieldError(emailGroup, emailError, ""); return true;
  }

  function validatePassword() {
    const value = (passwordInput.value || "").trim();
    if (!value) { setFieldError(passGroup, passwordError, "Ingresa tu contraseña."); return false; }
    if (value.length < 6) { setFieldError(passGroup, passwordError, "La contraseña debe tener al menos 8 caracteres."); return false; }
    setFieldError(passGroup, passwordError, ""); return true;
  }

  emailInput?.addEventListener("input", () => { showAuthError(""); if (emailGroup?.classList.contains("is-invalid")) validateEmail(); });
  passwordInput?.addEventListener("input", () => { showAuthError(""); if (passGroup?.classList.contains("is-invalid")) validatePassword(); });
  emailInput?.addEventListener("blur", validateEmail);
  passwordInput?.addEventListener("blur", validatePassword);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    showAuthError("");

    if (!validateEmail() || !validatePassword()) {
      showAuthError("Por favor completa todos los campos");
      form.querySelector(".input-group.is-invalid input")?.focus();
      return;
    }

    disableSubmit(true);

    const { ok, data } = await apiPost("http://localhost:3000/api/usuarios/login", {
      correo: emailInput.value.trim(),
      password: passwordInput.value,
    });

    if (ok && data.success) {
      const rolMap = { 1: "Asesor", 2: "Asesorado" };
      const usuario = data.usuario;

      usuario.roles = usuario.roles?.map(r => rolMap[r] || "Usuario") || ["Usuario"];
      usuario.nombre_rol = usuario.nombre_rol || usuario.roles[0];

      localStorage.setItem("usuario", JSON.stringify({
        id: usuario.id,
        nombre: usuario.nombre,
        roles: usuario.roles
      }));
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("token", data.token);

      console.log("Usuario logueado con rol(s):", usuario.roles);

      if (usuario.roles.length > 1) abrirModalDeRoles();
      else redirigirSegunRol(usuario);
    } else {
      showAuthError(data.message || "Usuario o contraseña incorrectos.");
      passwordInput.focus();
    }

    disableSubmit(false);
  });

  function redirigirSegunRol(usuario) {
    const rol = usuario.rolActivo || usuario.nombre_rol;
    console.log("⚡ Redirigiendo usuario con rol:", rol);
    if (rol === "Asesor") window.location.href = "panelAsesor.html";
    else window.location.href = "panelAsesorado.html";
  }

})();

/* ===========================
   PAGESHOW PARA BACK BUTTON
=========================== */
window.addEventListener("pageshow", (event) => {
  if (event.persisted) {
    cerrarSesion();
  }
});

/* ===========================
   RECUPERACIÓN DE CONTRASEÑA
=========================== */
(function () {
  const openForgot = document.getElementById("openForgot");
  const forgotModal = document.getElementById("forgotModal");
  if (!openForgot || !forgotModal) return;

  const forgotDismissEls = forgotModal.querySelectorAll("[data-forgot-dismiss]");
  const forgotCancel = document.getElementById("forgotCancel");
  const forgotForm = document.getElementById("forgotForm");
  const forgotEmail = document.getElementById("forgotEmail");
  const forgotEmailError = document.getElementById("forgotEmailError");
  const forgotMsg = document.getElementById("forgotMsg");
  const forgotSubmit = document.getElementById("forgotSubmit");

  const open = () => {
    forgotModal.classList.add("is-open");
    forgotModal.setAttribute("aria-hidden", "false");
    forgotEmail.value = "";
    forgotEmailError.textContent = "";
    forgotMsg.textContent = "";
    forgotEmail.focus();
  };
  const close = () => { forgotModal.classList.remove("is-open"); forgotModal.setAttribute("aria-hidden", "true"); };

  openForgot.addEventListener("click", e => { e.preventDefault(); open(); });
  [...forgotDismissEls].forEach(el => el.addEventListener("click", close));
  forgotCancel.addEventListener("click", close);
  document.addEventListener("keydown", e => { if (e.key === "Escape" && forgotModal.classList.contains("is-open")) close(); });

  forgotForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    forgotEmailError.textContent = "";
    forgotMsg.textContent = "";

    const email = sanitizeInput(forgotEmail.value.trim());
    if (!email) { forgotEmailError.textContent = "Ingresa tu correo."; forgotEmail.focus(); return; }
    if (!forgotEmail.checkValidity()) { forgotEmailError.textContent = "Ingresa un correo válido."; forgotEmail.focus(); return; }

    forgotSubmit.disabled = true; forgotSubmit.textContent = "Enviando...";
    const { ok, data } = await apiPost("http://localhost:3000/api/email/recuperar-password", { email });

    if (ok && data.success) {
      forgotMsg.textContent = "Se ha enviado un enlace de recuperación a tu correo electrónico.";
      forgotMsg.style.color = "#16a34a"; forgotEmail.value = "";
    } else {
      forgotEmailError.textContent = data.message || "Error al enviar el correo. Inténtalo de nuevo.";
    }

    forgotSubmit.disabled = false; forgotSubmit.textContent = "Recuperar contraseña";
  });
})();
