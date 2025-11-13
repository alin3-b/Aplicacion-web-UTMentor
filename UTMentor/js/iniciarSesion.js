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

/* ===========================
   TOGGLE CONTRASEÑA (ojito)
=========================== */
(function passwordToggle() {
  const field = document.querySelector('.auth-field-password .auth-input');
  const btn = document.querySelector('.auth-pw-toggle');

  if (!field || !btn) return;

  let visible = false;
  const update = () => {
    field.type = visible ? 'text' : 'password';
    btn.setAttribute('aria-label', visible ? 'Ocultar contraseña' : 'Mostrar contraseña');
    // Para estilos del ícono (si los usas en CSS)
    btn.classList.toggle('is-visible', visible);
  };

  btn.addEventListener('click', () => {
    visible = !visible;
    update();
  });

  update(); // estado inicial consistente
})();

/* ===========================
   MODAL ROLES (maqueta)
=========================== */
(function roleModal() {
  const form = document.querySelector('.auth-form');
  const modal = document.getElementById('roleModal');
  if (!form || !modal) return;

  const backdrop = modal.querySelector('.role-modal__backdrop');
  const closeBtn = modal.querySelector('.role-modal__close');

  // Focusables dentro del modal
  const focusableSelectors =
    'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

  let lastActiveElement = null;

  const lockScroll = (lock) => {
    document.body.style.overflow = lock ? 'hidden' : '';
  };

  const openModal = () => {
    lastActiveElement = document.activeElement;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    lockScroll(true);

    // Mueve foco al primer foco disponible dentro
    const firstFocusable = modal.querySelector(focusableSelectors);
    if (firstFocusable) firstFocusable.focus();
  };

  const closeModal = () => {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    lockScroll(false);
    if (lastActiveElement) lastActiveElement.focus();
  };

  // Maqueta: abre el modal al enviar (aquí colocarás tu lógica real)
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    openModal();
  });

  // Cierres
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (backdrop) backdrop.addEventListener('click', closeModal);

  document.addEventListener('keydown', (e) => {
    if (modal.classList.contains('is-open') && e.key === 'Escape') {
      closeModal();
    }
  });

  // Focus trap muy básico
  modal.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab' || !modal.classList.contains('is-open')) return;
    const focusables = Array.from(modal.querySelectorAll(focusableSelectors))
      .filter(el => el.offsetParent !== null);
    if (!focusables.length) return;

    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });
})();


