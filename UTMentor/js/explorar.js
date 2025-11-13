// Fallback: si este script corre, quitamos no-js
document.documentElement.classList.remove('no-js');

// Toggle del menú móvil + actualización de etiqueta/aria
(function () {
  const burger = document.querySelector('.burger');
  const panel  = document.getElementById('mobile-panel');
  const label  = burger ? burger.querySelector('.burger-label') : null;

  if (!burger || !panel) return;

  function setOpen(open) {
    panel.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    burger.setAttribute('title', open ? 'Cerrar menú' : 'Abrir menú');
    if (label) label.textContent = open ? 'Cerrar' : 'Menú';
  }

  burger.addEventListener('click', () => {
    setOpen(!panel.classList.contains('open'));
  });

  // Cierra al hacer click en un enlace (móvil)
  panel.addEventListener('click', (e) => {
    if (e.target.closest('a')) setOpen(false);
  });

  // Cierra con Escape
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setOpen(false);
  });

  // Cierra si se hace click fuera (solo móvil)
  document.addEventListener('click', (e) => {
    if (window.innerWidth > 860) return;
    if (!panel.contains(e.target) && !burger.contains(e.target)) {
      setOpen(false);
    }
  });
})();

(function(){
  const temaInput   = document.getElementById('filtro-tema');
  const asesorInput = document.getElementById('filtro-asesor');
  const carreraSel  = document.getElementById('filtro-carrera');
  const diaSel      = document.getElementById('filtro-dia');
  const desdeTime   = document.getElementById('filtro-hora-desde');
  const hastaTime   = document.getElementById('filtro-hora-hasta');
  const buscarBtn   = document.getElementById('btn-buscar');

  // Buscar / aplicar filtros
  if (buscarBtn){
    buscarBtn.addEventListener('click', ()=>{
      // Recolectar filtros actuales
      const filtros = {
        tema: temaInput.value.trim(),
        asesor: asesorInput.value.trim(),
        carrera: carreraSel.value,
        dia: diaSel.value,
        desde: desdeTime.value,
        hasta: hastaTime.value,
      };

      console.log("Buscar con filtros:", filtros);

      // - llamada a backend
      // - refrescar la lista de asesores
      // - mostrar loading, etc.
    });
  }
})();