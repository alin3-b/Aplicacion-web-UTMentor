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

// ----- NUEVO: soporte para filtro de Área + paginación -----
(function(){
  // Filtro: Área de conocimiento
  const $area = document.getElementById('filtro-area');
  if ($area){
    // Cuando cambie el área, re-aplicamos filtros con tu lógica actual
    $area.addEventListener('change', () => {
      if (typeof window.applyFilters === 'function') {
        window.applyFilters();
      } else {
        // fallback: intenta disparar tu botón de buscar si existe
        document.getElementById('btn-buscar')?.click();
      }
    });
  }

  // Paginación
  const $paginacion = document.querySelector('.paginacion');
  if ($paginacion){
    const $btnPrev = $paginacion.querySelector('.page-btn.prev');
    const $btnNext = $paginacion.querySelector('.page-btn.next');
    const $pageList = $paginacion.querySelector('.page-list');

    // Función para cambiar de página integrándose con tu render actual
    const goto = (n) => {
      const cur  = (typeof window.currentPage !== 'undefined') ? window.currentPage : 1;
      const max  = (typeof window.totalPages  !== 'undefined') ? window.totalPages  : 1;
      const next = Math.min(Math.max(1, n), max);

      if (typeof window.setPage === 'function'){
        window.setPage(next);
      } else if (typeof window.render === 'function'){
        window.currentPage = next;
        window.render();
      } else {
        // Si no hay render global, no hacemos nada para no romper tu código
      }
    };

    $btnPrev?.addEventListener('click', () => {
      const cur = (typeof window.currentPage !== 'undefined') ? window.currentPage : 1;
      goto(cur - 1);
    });

    $btnNext?.addEventListener('click', () => {
      const cur = (typeof window.currentPage !== 'undefined') ? window.currentPage : 1;
      goto(cur + 1);
    });

    $pageList?.addEventListener('click', (e) => {
      const btn = e.target.closest('.page-number');
      if (!btn) return;
      const n = Number(btn.dataset.page);
      if (Number.isFinite(n)) goto(n);
    });
  }
})();
