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

// Script: seleccionar montos
const buttons = document.querySelectorAll(".don-amount");
const input = document.getElementById("don-custom");

buttons.forEach(btn => {
    btn.addEventListener("click", () => {
        input.value = btn.dataset.value;
    });
});