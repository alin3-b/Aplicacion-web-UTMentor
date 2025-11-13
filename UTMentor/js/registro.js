// Quita la clase no-js si existiera
document.documentElement.classList.remove("no-js");

/* -------- NAV móvil (reutilizado) -------- */
(() => {
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

  burger.addEventListener("click", () =>
    setOpen(!panel.classList.contains("open"))
  );
  panel.addEventListener("click", (e) => {
    if (e.target.closest("a")) setOpen(false);
  });
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setOpen(false);
  });
  document.addEventListener("click", (e) => {
    if (window.innerWidth > 860) return;
    if (!panel.contains(e.target) && !burger.contains(e.target)) setOpen(false);
  });
})();

/* -------- Toggle de contraseña (ambos campos) -------- */
(() => {
  document.querySelectorAll(".f-field-pw").forEach((wrap) => {
    const input = wrap.querySelector(".f-input");
    const btn = wrap.querySelector(".pw-toggle");
    if (!input || !btn) return;

    let visible = false;
    btn.addEventListener("click", () => {
      visible = !visible;
      input.type = visible ? "text" : "password";
      btn.classList.toggle("is-visible", visible);
      btn.setAttribute(
        "aria-label",
        visible ? "Ocultar contraseña" : "Mostrar contraseña"
      );
    });
  });
})();

/* -------- Tabs de rol + mostrar/ocultar campos de tutor -------- */
(() => {
  const tabs = document.querySelectorAll(".role-tab");
  const onlyTutor = document.querySelector(".only-tutor");
  let role = "asesor"; // por defecto coincide con el tab activo

  const setRole = (r) => {
    role = r;
    tabs.forEach((t) => t.classList.toggle("is-active", t.dataset.role === r));
    if (onlyTutor) onlyTutor.classList.toggle("is-hidden", r === "asesorado");
  };

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => setRole(tab.dataset.role));
  });
})();

/* -------- Chips de temas (simple Enter para agregar) -------- */
(() => {
  const input = document.getElementById("topicInput");
  const holder = document.getElementById("topicChips");
  if (!input || !holder) return;

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const val = input.value.trim();
      if (!val) return;
      const chip = document.createElement("span");
      chip.className = "chip";
      chip.textContent = val;
      holder.appendChild(chip);
      input.value = "";
    }
  });
})();

/* -------- Modales: pago (asesor/ambos) y elección de rol (ambos) -------- */
(() => {
  const form = document.getElementById("signupForm");
  const payModal = document.getElementById("payModal");
  const roleModal = document.getElementById("roleModal");

  // utilidades
  const open = (el) => {
    el?.classList.add("is-open");
    el?.setAttribute("aria-hidden", "false");
  };
  const close = (el) => {
    el?.classList.remove("is-open");
    el?.setAttribute("aria-hidden", "true");
  };
  const bindBackdropClose = (el) => {
    el?.addEventListener("click", (e) => {
      if (
        e.target.classList.contains("modal__backdrop") ||
        e.target.hasAttribute("data-close")
      )
        close(el);
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") close(el);
    });
  };
  bindBackdropClose(payModal);
  bindBackdropClose(roleModal);

  // recoge el rol activo
  const getActiveRole = () => {
    const active = document.querySelector(".role-tab.is-active");
    return active ? active.dataset.role : "asesor";
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const role = getActiveRole();

    if (role === "asesorado") {
      // flujo simple de demo
      window.location.href = "panelAsesorado.html";
      return;
    }

    if (role === "asesor") {
      // abrir modal de pago
      open(payModal);
      document.getElementById("payConfirm")?.addEventListener(
        "click",
        () => {
          close(payModal);
          window.location.href = "panelAsesor.html";
        },
        { once: true }
      );
      return;
    }

    // AMBOS: pago → luego modal de elección
    open(payModal);
    document.getElementById("payConfirm")?.addEventListener(
      "click",
      () => {
        close(payModal);
        open(roleModal);
      },
      { once: true }
    );
  });
})();

// --- UI Pago: selección de método + mostrar form tarjeta + toggle ojo CVC ---
(function () {
  const payModal = document.getElementById("payModal");
  if (!payModal) return;

  const methods = payModal.querySelectorAll(".pay-method");
  const cardBlock = payModal.querySelector("#payCard");
  const cvcField = payModal.querySelector("#payCard .f-field-pw input");
  const cvcToggle = payModal.querySelector("#payCard .pw-toggle");
  const confirmBtn = payModal.querySelector("#payConfirm");

  // por defecto: tarjeta visible
  function showCardForm(show) {
    if (show) {
      cardBlock.removeAttribute("hidden");
    } else {
      cardBlock.setAttribute("hidden", "");
    }
  }
  showCardForm(true);

  methods.forEach((btn) => {
    btn.addEventListener("click", () => {
      methods.forEach((b) => {
        b.classList.remove("is-selected");
        b.setAttribute("aria-selected", "false");
      });
      btn.classList.add("is-selected");
      btn.setAttribute("aria-selected", "true");

      const m = btn.dataset.method;
      // mostramos form de tarjeta solo para card/mastercard/visa
      if (m === "card" || m === "mastercard") {
        showCardForm(true);
      } else {
        showCardForm(false);
      }
    });
  });

  // ejemplo de “continuar” (solo UI)
  if (confirmBtn) {
    confirmBtn.addEventListener("click", () => {
      // aquí dispararías tu call a Stripe/Uelz/etc.
      alert("Continuar con tu compra (demo UI)");
    });
  }
})();
