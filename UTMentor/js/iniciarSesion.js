// Quita la clase no-js si el script cargó
document.documentElement.classList.remove("no-js");

/* ===========================
   NAV MÓVIL (burger)
=========================== */
(function navMobile() {
  const burger = document.querySelector(".burger");
  const panel = document.getElementById("mobile-panel");
  const label = burger ? burger.querySelector(".burger-label") : null;

  if (!burger || !panel) return;

  const setOpen = (open) => {
    panel.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    burger.setAttribute("title", open ? "Cerrar menú" : "Abrir menú");
    if (label) label.textContent = open ? "Cerrar" : "Menú";
  };

  burger.addEventListener("click", () => {
    setOpen(!panel.classList.contains("open"));
  });

  // Cierra al navegar por un link dentro del panel
  panel.addEventListener("click", (e) => {
    if (e.target.closest("a")) setOpen(false);
  });

  // Cierra con Escape
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setOpen(false);
  });

  // Cierra clic fuera (solo móvil)
  document.addEventListener("click", (e) => {
    if (window.innerWidth > 860) return;
    if (!panel.contains(e.target) && !burger.contains(e.target)) {
      setOpen(false);
    }
  });
})();

/* ============================
   MOSTRAR / OCULTAR CONTRASEÑA
===============================*/
const togglePw = document.querySelector(".toggle-pw");
const passwordInput = document.getElementById("password");

if (togglePw && passwordInput) {
  togglePw.addEventListener("click", () => {
    const isPassword = passwordInput.type === "password";
    passwordInput.type = isPassword ? "text" : "password";
  });
}

/* ============================
   MODAL DE ROLES
===============================*/
const modal = document.getElementById("roleModal");

// Asegurar que el modal inicie cerrado
if (modal) {
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
}

function abrirModalDeRoles() {
  if (modal) {
    console.log("Abriendo modal de roles");
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    // Reconfigurar botones al abrir el modal
    configurarBotonesModal();
  }
}

function cerrarModalDeRoles() {
  if (modal) {
    console.log("Cerrando modal de roles");
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
  }
}

/* ============================
   CERRAR MODAL
===============================*/
document.querySelectorAll("[data-role-dismiss]").forEach((el) => {
  el.addEventListener("click", cerrarModalDeRoles);
});

/* ============================
   BOTONES DEL MODAL DE ROLES
===============================*/
// Función para configurar los botones del modal
function configurarBotonesModal() {
  const botonesRol = document.querySelectorAll("#roleModal [data-role]");
  console.log(
    "Configurando botones del modal, encontrados:",
    botonesRol.length
  );

  botonesRol.forEach((btn) => {
    // Remover listeners anteriores clonando el elemento
    const nuevoBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(nuevoBtn, btn);

    nuevoBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const rolSeleccionado = nuevoBtn.getAttribute("data-role");
      console.log("Rol seleccionado:", rolSeleccionado);

      // Guardar el rol seleccionado
      const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
      usuario.rolActivo = rolSeleccionado;
      localStorage.setItem("usuario", JSON.stringify(usuario));

      // Redirigir según el rol seleccionado
      if (rolSeleccionado === "Asesor") {
        window.location.href = "panelAsesor.html";
      } else {
        window.location.href = "panelAsesorado.html";
      }
    });
  });
}

// NO configurar botones al cargar, solo cuando se abra el modal

// iniciarSesion.js

(function () {
  console.log("=== Inicializando módulo de login ===");

  // --------- Selectores con fallback ---------
  const form =
    document.getElementById("loginForm") ||
    document.querySelector(".login-form");

  console.log("Formulario encontrado:", form);

  if (!form) {
    console.error("No se encontró el formulario de login");
    return; // No hay formulario en la página
  }

  const emailInput =
    document.getElementById("email") ||
    form.querySelector('input[type="email"]');

  const passwordInput =
    document.getElementById("password") ||
    form.querySelector('input[type="password"]');

  const togglePwBtn = form.querySelector(".toggle-pw") || null;

  const emailGroup = emailInput?.closest(".input-group");
  const passGroup = passwordInput?.closest(".input-group");

  const emailError =
    document.getElementById("emailError") ||
    emailGroup?.querySelector(".input-error");

  const passwordError =
    document.getElementById("passwordError") ||
    passGroup?.querySelector(".input-error");

  const authError =
    document.getElementById("authError") ||
    // si no existe, lo creamos debajo del botón de submit
    (() => {
      const el = document.createElement("p");
      el.className = "auth-error";
      const submitBtn = form.querySelector('[type="submit"], .btn-login');
      if (submitBtn?.parentNode) {
        submitBtn.parentNode.insertBefore(el, submitBtn.nextSibling);
      } else {
        form.appendChild(el);
      }
      return el;
    })();

  const submitBtn = form.querySelector('[type="submit"], .btn-login');

  // --------- Utilidades ---------
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

  function setFieldError(groupEl, errorEl, message) {
    if (!groupEl || !errorEl) return;
    errorEl.textContent = message || "";
    if (message) {
      groupEl.classList.add("is-invalid");
      errorEl.style.display = "block";
      const input = groupEl.querySelector("input");
      if (input) input.setAttribute("aria-invalid", "true");
    } else {
      groupEl.classList.remove("is-invalid");
      errorEl.style.display = "none";
      const input = groupEl.querySelector("input");
      if (input) input.removeAttribute("aria-invalid");
    }
  }

  function showAuthError(message) {
    if (!authError) return;
    authError.textContent = message || "";
    if (message) {
      authError.classList.add("is-visible");
      authError.setAttribute("role", "alert");
      authError.setAttribute("aria-live", "polite");
    } else {
      authError.classList.remove("is-visible");
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

  // --------- Validadores ---------
  function validateEmail() {
    if (!emailInput) return true;
    const value = (emailInput.value || "").trim().toLowerCase();
    emailInput.value = value;

    if (!value) {
      setFieldError(emailGroup, emailError, "Ingresa tu correo.");
      return false;
    }
    if (!EMAIL_RE.test(value)) {
      setFieldError(emailGroup, emailError, "Ingresa un correo válido.");
      return false;
    }
    setFieldError(emailGroup, emailError, "");
    return true;
  }

  function validatePassword() {
    if (!passwordInput) return true;
    const value = (passwordInput.value || "").trim();

    if (!value) {
      setFieldError(passGroup, passwordError, "Ingresa tu contraseña.");
      return false;
    }
    if (value.length < 6) {
      setFieldError(
        passGroup,
        passwordError,
        "La contraseña debe tener al menos 6 caracteres."
      );
      return false;
    }
    setFieldError(passGroup, passwordError, "");
    return true;
  }

  // --------- Eventos de interacción ---------
  // En vivo (mientras teclean)
  emailInput?.addEventListener("input", () => {
    showAuthError("");
    if (emailGroup?.classList.contains("is-invalid")) validateEmail();
  });

  passwordInput?.addEventListener("input", () => {
    showAuthError("");
    if (passGroup?.classList.contains("is-invalid")) validatePassword();
  });

  // Validación al salir del campo
  emailInput?.addEventListener("blur", validateEmail);
  passwordInput?.addEventListener("blur", validatePassword);

  // Toggle “ver contraseña”
  togglePwBtn?.addEventListener("click", () => {
    if (!passwordInput) return;
    const isText = passwordInput.type === "text";
    passwordInput.type = isText ? "password" : "text";
    togglePwBtn.setAttribute("aria-pressed", String(!isText));
  });

  // --------- Envío del formulario ---------
  form.addEventListener("submit", async (e) => {
    console.log("=== Formulario enviado ===");
    e.preventDefault();
    e.stopPropagation();
    showAuthError("");

    const okEmail = validateEmail();
    const okPass = validatePassword();
    console.log("Validaciones - Email:", okEmail, "Password:", okPass);

    if (!okEmail || !okPass) {
      // Llevamos el foco al primer error
      const firstInvalid = form.querySelector(".input-group.is-invalid input");
      firstInvalid?.focus();
      return;
    }

    // Bloqueamos submit mientras “autenticamos”
    disableSubmit(true);

    try {
      const email = emailInput.value.trim();
      const password = passwordInput.value;
      console.log("Enviando petición de login con correo:", email);

      // Llamada al endpoint de login
      const response = await fetch("http://localhost:3000/api/usuarios/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ correo: email, password }),
      });

      const data = await response.json();
      console.log("Respuesta del servidor:", data);

      if (response.ok && data.success) {
        // Login exitoso - guardar datos del usuario
        console.log("Login exitoso, usuario:", data.usuario);
        localStorage.setItem("usuario", JSON.stringify(data.usuario));
        localStorage.setItem("isLoggedIn", "true");

        // Verificar si el usuario tiene ambos roles
        const tieneAmbosRoles = verificarAmbosRoles(data.usuario);
        console.log("¿Tiene ambos roles?", tieneAmbosRoles);

        if (tieneAmbosRoles) {
          // Mostrar modal de selección de rol
          console.log("Abriendo modal de roles");
          abrirModalDeRoles();
        } else {
          // Redirigir según el rol
          console.log("Redirigiendo según rol:", data.usuario.nombre_rol);
          redirigirSegunRol(data.usuario);
        }
      } else {
        // Error de autenticación
        setFieldError(passGroup, passwordError, "");
        setFieldError(emailGroup, emailError, "");
        showAuthError(data.error || "Usuario o contraseña incorrectos.");
        passwordInput.focus();
      }
    } catch (err) {
      console.error("Error en login:", err);
      showAuthError("Error de conexión. Verifica que el servidor esté activo.");
    } finally {
      disableSubmit(false);
    }
  });

  // --------- Funciones auxiliares ---------
  function verificarAmbosRoles(usuario) {
    // Por ahora retorna false, pero aquí puedes agregar lógica
    // para verificar si el usuario tiene múltiples roles
    // Esto dependerá de cómo tu backend devuelva la información de roles
    return false;
  }

  function redirigirSegunRol(usuario) {
    const rol = usuario.nombre_rol;

    if (rol === "Asesor") {
      window.location.href = "panelAsesor.html";
    } else if (rol === "Asesorado" || rol === "Usuario") {
      window.location.href = "panelAsesorado.html";
    } else {
      // Por defecto, redirigir al panel de asesorado
      window.location.href = "panelAsesorado.html";
    }
  }
})();

(function () {
  const openForgot = document.getElementById("openForgot");
  const forgotModal = document.getElementById("forgotModal");

  if (!openForgot || !forgotModal) {
    console.error("Modal de recuperación no encontrado");
    return;
  }

  const forgotDismissEls = forgotModal.querySelectorAll(
    "[data-forgot-dismiss]"
  );
  const forgotCancel = document.getElementById("forgotCancel");
  const forgotForm = document.getElementById("forgotForm");
  const forgotEmail = document.getElementById("forgotEmail");
  const forgotEmailError = document.getElementById("forgotEmailError");
  const forgotMsg = document.getElementById("forgotMsg");

  console.log("Modal de recuperación inicializado correctamente");

  const open = () => {
    forgotModal.classList.add("is-open");
    forgotModal.setAttribute("aria-hidden", "false");
    forgotEmail.focus();
    forgotMsg.textContent = "";
    forgotEmailError.textContent = "";
    forgotEmail.value = "";
  };
  const close = () => {
    forgotModal.classList.remove("is-open");
    forgotModal.setAttribute("aria-hidden", "true");
  };

  // Abrir
  openForgot.addEventListener("click", (e) => {
    e.preventDefault();
    console.log("Click en recuperar contraseña");
    open();
  });

  // Cerrar
  [...forgotDismissEls].forEach((el) => el.addEventListener("click", close));
  forgotCancel.addEventListener("click", close);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && forgotModal.classList.contains("is-open"))
      close();
  });

  // Envío del formulario de recuperación
  forgotForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    console.log("Formulario de recuperación enviado");
    forgotEmailError.textContent = "";
    forgotMsg.textContent = "";

    const email = forgotEmail.value.trim();
    console.log("Email ingresado:", email);

    if (!email) {
      forgotEmailError.textContent = "Ingresa tu correo.";
      forgotEmail.focus();
      return;
    }
    if (!forgotEmail.checkValidity()) {
      forgotEmailError.textContent = "Ingresa un correo válido.";
      forgotEmail.focus();
      return;
    }

    // Deshabilitar botón de envío
    const forgotSubmit = document.getElementById("forgotSubmit");
    forgotSubmit.disabled = true;
    forgotSubmit.textContent = "Enviando...";

    try {
      // Llamada al backend para enviar el correo de recuperación
      console.log("Enviando petición al servidor...");
      const response = await fetch(
        "http://localhost:3000/api/email/recuperar-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      console.log("Respuesta recibida:", response.status);
      const data = await response.json();
      console.log("Datos:", data);

      if (response.ok && data.success) {
        forgotMsg.textContent =
          "Se ha enviado un enlace de recuperación a tu correo electrónico.";
        forgotMsg.style.color = "#16a34a";
        forgotEmail.value = "";
      } else {
        forgotEmailError.textContent =
          data.message || "Error al enviar el correo. Inténtalo de nuevo.";
      }
    } catch (error) {
      console.error("Error al enviar correo de recuperación:", error);
      forgotEmailError.textContent =
        "Error de conexión. Verifica que el servidor esté activo.";
    } finally {
      forgotSubmit.disabled = false;
      forgotSubmit.textContent = "Recuperar contraseña";
    }
  });
})();
