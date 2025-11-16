// UTMentor/js/explorar.js
import { obtenerAsesores } from "./services/asesorService.js";
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

document.documentElement.classList.remove("no-js");

// Contenedor de resultados
const listaAsesoresEl = document.getElementById("lista-asesores");

// ----- PAGINACIÓN -----
let asesoresGlobal = [];      // Todos los asesores obtenidos
let currentPage = 1;          // Página actual
const perPage = 6;            // Cantidad de asesores por página
let totalPages = 1;           // Se actualizará luego de cargar asesores

// Dummy images si no hay fotos en la BD
const advisorImages = [
  "../imagenes/adviser1.jpg",
  "../imagenes/adviser2.jpg",
  "../imagenes/adviser3.jpg",
  "../imagenes/adviser4.jpg",
  "../imagenes/adviser5.jpg",
];

// Generar estrellas
function generarEstrellas(calificacion) {
  const rating = parseFloat(calificacion) || 0;
  const entero = Math.floor(rating);
  let html = "";
  for (let i = 0; i < 5; i++) {
    html += i < entero ? "★" : "☆";
  }
  return html;
}

// Crear card HTML
function crearAsesorCard(asesor, index) {
  const imagenAsesor = advisorImages[index % advisorImages.length];
  const nombreCorto = asesor.nombre_completo.trim();

  const rating = parseFloat(asesor.puntuacion_promedio) || 0;
  const sesiones = asesor.numero_sesiones || 0;
  const sesionesTexto = sesiones >= 100 ? "100+" :
                        sesiones >= 50 ? "50+" :
                        sesiones >= 10 ? "10+" : sesiones;

  const disponibilidad = formatDisponibilidad(asesor.disponibilidades);
  const carreraCorta = asesor.nombre_carrera
    ? asesor.nombre_carrera
        .replace("Ingenieri­a", "Ing.")
        .replace("Licenciatura", "Lic.")
    : "Universidad";

  return `
    <li class="asesor-card">
      <div class="asesor-card-main">
        <img class="asesor-avatar" src="${imagenAsesor}" alt="${nombreCorto}" />
        <div class="asesor-info">
          <div class="asesor-headerline">
            <span class="asesor-nombre">${nombreCorto}</span>
          </div>
          <div class="asesor-detalle">
            <span class="asesor-carrera">${carreraCorta}</span>
            <span class="asesor-bullet">·</span>
            <span class="asesor-semestre">${asesor.semestre || "-"}</span>
          </div>
          <div class="asesor-stats">
            <span class="asesor-sesiones">${sesionesTexto} sesiones completadas</span>
          </div>
        </div>
        <div class="asesor-extra">
          <div class="asesor-rating">
            <div class="stars" aria-label="${rating} de 5">${generarEstrellas(rating)}</div>
            <div class="asesor-submeta">
              <span>${Number.isInteger(rating) ? rating : rating.toFixed(1)} / 5</span>
            </div>
            <div class="asesor-availability">
              <span>${disponibilidad}</span>
            </div>
          </div>
          <a class="btn-perfil" href="panelPublicoAsesor.html?id=${asesor.id_usuario}">Ver perfil</a>
        </div>
      </div>
    </li>
  `;
}

// Formatear disponibilidad
function formatDisponibilidad(disponibilidades) {
  if (!disponibilidades || disponibilidades.length === 0) return "Sin disponibilidad";

  const nombresDias = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  const dias = new Set();
  disponibilidades.forEach(d => {
    const fecha = new Date(d.fecha_inicio);
    dias.add(nombresDias[fecha.getDay()]);
  });

  return Array.from(dias).slice(0, 3).join(" · ") || "Próximamente";
}

// Renderizar página actual
function renderPage() {
  if (!listaAsesoresEl) return;

  totalPages = Math.ceil(asesoresGlobal.length / perPage);
  const start = (currentPage - 1) * perPage;
  const end = start + perPage;

  const pageAsesores = asesoresGlobal.slice(start, end);

  listaAsesoresEl.innerHTML = pageAsesores
    .map((asesor, idx) => crearAsesorCard(asesor, start + idx))
    .join("");

  updatePaginationButtons();
}

// Actualizar botones
function updatePaginationButtons() {
  const $paginacion = document.querySelector('.paginacion');
  if (!$paginacion) return;

  const $btnPrev = $paginacion.querySelector('.page-btn.prev');
  const $btnNext = $paginacion.querySelector('.page-btn.next');
  const $pageList = $paginacion.querySelector('.page-list');

  if ($btnPrev) $btnPrev.disabled = currentPage <= 1;
  if ($btnNext) $btnNext.disabled = currentPage >= totalPages;

  if ($pageList) {
    $pageList.innerHTML = '';
    for (let i = 1; i <= totalPages; i++) {
      const isCurrent = i === currentPage;
      $pageList.innerHTML += `
        <button
          class="page-number ${isCurrent ? 'is-active' : ''}"
          data-page="${i}"
          ${isCurrent ? 'aria-current="page"' : ''}
        >
          ${i}
        </button>
      `;
    }
  }
  
}

// Cambiar página
function gotoPage(n) {
  currentPage = Math.min(Math.max(1, n), totalPages);
  renderPage();
}

// Eventos paginación
document.addEventListener('click', (e) => {
  if (e.target.matches('.page-btn.prev')) {
    gotoPage(currentPage - 1);
  } else if (e.target.matches('.page-btn.next')) {
    gotoPage(currentPage + 1);
  } else if (e.target.matches('.page-number')) {
    const n = Number(e.target.dataset.page);
    if (Number.isFinite(n)) gotoPage(n);
  }
});

// Cargar asesores con paginación
async function cargarAsesores() {
  if (!listaAsesoresEl) return;

  try {
    const asesores = await obtenerAsesores();
    asesoresGlobal = asesores || [];
    currentPage = 1;
    renderPage();
  } catch (error) {
    console.error("Error cargando asesores:", error);
    listaAsesoresEl.innerHTML = `<li style="padding:2rem;text-align:center;">Error al cargar asesores</li>`;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  cargarAsesores();
});
