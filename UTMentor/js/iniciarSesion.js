// Quita la clase no-js si el script cargó
document.documentElement.classList.remove('no-js');

/* ===========================
   NAV MÓVIL (burger)
=========================== */
(function navMobile() {
  const burger = document.querySelector('.burger');
  const panel = document.getElementById('mobile-panel');
  const label = burger ? burger.querySelector('.burger-label') : null;

  if (!burger || !panel) return;

  const setOpen = (open) => {
    panel.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    burger.setAttribute('title', open ? 'Cerrar menú' : 'Abrir menú');
    if (label) label.textContent = open ? 'Cerrar' : 'Menú';
  };

  burger.addEventListener('click', () => {
    setOpen(!panel.classList.contains('open'));
  });

  // Cierra al navegar por un link dentro del panel
  panel.addEventListener('click', (e) => {
    if (e.target.closest('a')) setOpen(false);
  });

  // Cierra con Escape
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setOpen(false);
  });

  // Cierra clic fuera (solo móvil)
  document.addEventListener('click', (e) => {
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

togglePw.addEventListener("click", () => {
  const isPassword = passwordInput.type === "password";
  passwordInput.type = isPassword ? "text" : "password";
});


/* ============================
   MOSTRAR MODAL DE ROLES
===============================*/

// Simula si un usuario tiene ambos roles
// En tu backend esto vendrá desde la base de datos
const usuarioTieneAmbosRoles = true;

const btnLogin = document.querySelector(".btn-login");
const modal = document.getElementById("roleModal");

btnLogin.addEventListener("click", (e) => {
  e.preventDefault(); // evita enviar el form

  if (usuarioTieneAmbosRoles) {
    abrirModalDeRoles();
  } else {
    // Redirección normal (ejemplo)
    window.location.href = "panelAsesorado.html";
  }
});


function abrirModalDeRoles() {
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
}

/* ============================
   CERRAR MODAL
===============================*/
document.querySelectorAll("[data-role-dismiss]").forEach(el => {
  el.addEventListener("click", () => {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
  });
});

// iniciarSesion.js

(function () {
  // --------- Selectores con fallback ---------
  const form =
    document.getElementById("loginForm") ||
    document.querySelector(".login-form");

  if (!form) return; // No hay formulario en la página

  const emailInput =
    document.getElementById("email") ||
    form.querySelector('input[type="email"]');

  const passwordInput =
    document.getElementById("password") ||
    form.querySelector('input[type="password"]');

  const togglePwBtn =
    form.querySelector(".toggle-pw") || null;

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

  const submitBtn =
    form.querySelector('[type="submit"], .btn-login');

  // --------- Utilidades ---------
  const EMAIL_RE =
    /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

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
      setFieldError(passGroup, passwordError, "La contraseña debe tener al menos 6 caracteres.");
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
    e.preventDefault();
    showAuthError("");

    const okEmail = validateEmail();
    const okPass = validatePassword();

    if (!okEmail || !okPass) {
      // Llevamos el foco al primer error
      const firstInvalid =
        form.querySelector(".input-group.is-invalid input");
      firstInvalid?.focus();
      return;
    }

    // Bloqueamos submit mientras “autenticamos”
    disableSubmit(true);

    try {
      const email = emailInput.value;
      const password = passwordInput.value;

      // TODO: Reemplazar por tu llamada real al backend.
      const isAuthOk = await fakeAuth(email, password);

      if (!isAuthOk) {
        // Error de autenticación
        setFieldError(passGroup, passwordError, "");
        setFieldError(emailGroup, emailError, "");
        showAuthError("Usuario o contraseña incorrectos.");
        passwordInput.focus();
        return;
      }

      // Éxito: redirige o continúa flujo
      window.location.href = "panelAsesorado.html"; // ajusta la URL a tu flujo real
    } catch (err) {
      console.error(err);
      showAuthError("Ocurrió un problema al iniciar sesión. Inténtalo de nuevo.");
    } finally {
      disableSubmit(false);
    }
  });

  // --------- Simulación de autenticación (reemplazar) ---------
  function fakeAuth(email, password) {
    return new Promise((resolve) => {
      // Simulamos latencia
      setTimeout(() => {
        // Demo: credenciales válidas
        const OK_USER = "demo@utmentor.com";
        const OK_PASS = "Demo123!";
        resolve(email === OK_USER && password === OK_PASS);
      }, 800);
    });
  }
})();

(function () {
      const openForgot = document.getElementById('openForgot');
      const forgotModal = document.getElementById('forgotModal');
      const forgotDismissEls = forgotModal.querySelectorAll('[data-forgot-dismiss]');
      const forgotCancel = document.getElementById('forgotCancel');
      const forgotForm = document.getElementById('forgotForm');
      const forgotEmail = document.getElementById('forgotEmail');
      const forgotEmailError = document.getElementById('forgotEmailError');
      const forgotMsg = document.getElementById('forgotMsg');

      const open = () => {
        forgotModal.classList.add('is-open');
        forgotModal.setAttribute('aria-hidden', 'false');
        forgotEmail.focus();
        forgotMsg.textContent = '';
        forgotEmailError.textContent = '';
        forgotEmail.value = '';
      };
      const close = () => {
        forgotModal.classList.remove('is-open');
        forgotModal.setAttribute('aria-hidden', 'true');
      };

      // Abrir
      openForgot.addEventListener('click', (e) => {
        e.preventDefault();
        open();
      });

      // Cerrar
      [...forgotDismissEls].forEach(el => el.addEventListener('click', close));
      forgotCancel.addEventListener('click', close);
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && forgotModal.classList.contains('is-open')) close();
      });

      // Envío del formulario de recuperación
      forgotForm.addEventListener('submit', (e) => {
        e.preventDefault();
        forgotEmailError.textContent = '';

        if (!forgotEmail.value.trim()) {
          forgotEmailError.textContent = 'Ingresa tu correo.';
          forgotEmail.focus();
          return;
        }
        if (!forgotEmail.checkValidity()) {
          forgotEmailError.textContent = 'Ingresa un correo válido.';
          forgotEmail.focus();
          return;
        }

        // Aquí harías la llamada a tu endpoint de recuperación.
        // Simulamos éxito:
        forgotMsg.textContent = 'Se ha enviado un enlace de recuperación a tu correo electrónico.';
      });
    })();
