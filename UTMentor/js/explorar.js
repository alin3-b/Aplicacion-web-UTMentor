// UTMentor/js/explorar.js
import { obtenerAsesores } from "./services/asesorService.js";

// =====================
// UTILIDADES DE SEGURIDAD
// =====================

// Evita XSS escapando caracteres peligrosos
function sanitizeText(str = "") {
  return String(str)
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/\(/g, "&#40;")
    .replace(/\)/g, "&#41;");
}

// Valida nombres de texto (solo letras, acentos y espacios)
function validarTextoNombre(str = "") {
  if (!str.trim()) return true; // vacío es válido
  return /^[A-Za-zÁÉÍÓÚÜáéíóúüÑñ\s]{2,40}$/.test(str.trim());
}

// Valida horas en formato 24h (00:00 – 23:59)
function validarHora(str = "") {
  if (!str) return true;
  return /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(str);
}

// =====================
// Fallback no-js
// =====================
document.documentElement.classList.remove('no-js');

// =====================
// MENÚ MÓVIL
// =====================
(function () {
  const burger = document.querySelector('.burger');
  const panel = document.getElementById('mobile-panel');
  const label = burger ? burger.querySelector('.burger-label') : null;
  if (!burger || !panel) return;

  function setOpen(open) {
    panel.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    burger.setAttribute('title', open ? 'Cerrar menú' : 'Abrir menú');
    if (label) label.textContent = open ? 'Cerrar' : 'Menú';
  }

  burger.addEventListener('click', () => setOpen(!panel.classList.contains('open')));
  panel.addEventListener('click', e => { if (e.target.closest('a')) setOpen(false); });
  window.addEventListener('keydown', e => { if (e.key === 'Escape') setOpen(false); });
  document.addEventListener('click', e => {
    if (window.innerWidth > 860) return;
    if (!panel.contains(e.target) && !burger.contains(e.target)) setOpen(false);
  });
})();

// =====================
// FILTROS ROBUSTOS
// =====================
(function () {
  const temaInput = document.getElementById('filtro-tema');
  const asesorInput = document.getElementById('filtro-asesor');
  const carreraSel = document.getElementById('filtro-carrera');
  const diaSel = document.getElementById('filtro-dia');
  const desdeTime = document.getElementById('filtro-hora-desde');
  const hastaTime = document.getElementById('filtro-hora-hasta');
  const areaSel = document.getElementById('filtro-area');
  const buscarBtn = document.getElementById('btn-buscar');
  const limpiarBtn = document.getElementById('btn-limpiar');

  const errorTema = document.getElementById("error-tema");
  const errorAsesor = document.getElementById("error-asesor");

  if (temaInput && errorTema) {
    validarInputTexto(temaInput, errorTema, "Tema");
  }

  if (asesorInput && errorAsesor) {
    validarInputTexto(asesorInput, errorAsesor, "Nombre");
  }

  // Detectar si hay filtros activos
  function hayFiltros() {
    return (
      (temaInput?.value.trim() || "") !== "" ||
      (asesorInput?.value.trim() || "") !== "" ||
      (carreraSel && carreraSel.value !== "") ||
      (diaSel && diaSel.value !== "") ||
      (areaSel && areaSel.value !== "") ||
      (desdeTime && desdeTime.value !== "") ||
      (hastaTime && hastaTime.value !== "")
    );
  }

  // Mostrar/ocultar botón limpiar
  function actualizarBotonLimpiar() {
    limpiarBtn.style.display = hayFiltros() ? "inline-flex" : "none";
  }

  // === Validación en vivo ===
  function validarInputTexto(el, errorEl, campoNombre) {
    el.addEventListener("input", () => {
      const val = el.value.trim();
      if (!validarTextoNombre(val)) {
        el.classList.add("input-error");
        errorEl.textContent = `${campoNombre} inválido. Solo letras y espacios (2-40 caracteres).`;
        errorEl.classList.add("visible");
      } else {
        el.classList.remove("input-error");
        errorEl.textContent = "";
        errorEl.classList.remove("visible");
      }
      actualizarBotonLimpiar();
    });
  }

  // Validar hora
  [desdeTime, hastaTime].forEach(el => {
    if (!el) return;
    el.addEventListener("input", () => {
      if (!validarHora(el.value)) {
        el.classList.add("input-error");
      } else {
        el.classList.remove("input-error");
      }
      actualizarBotonLimpiar();
    });
  });

  // Actualiza solo la visibilidad del botón
  [
    carreraSel, diaSel, areaSel
  ].forEach(el => {
    if (el) el.addEventListener("change", actualizarBotonLimpiar);
  });

  actualizarBotonLimpiar();

  // === ENTER para buscar ===
  [temaInput, asesorInput, desdeTime, hastaTime].forEach(el => {
    if (!el) return;
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        buscarBtn.click();
      }
    });
  });

  // =====================
  // BOTÓN BUSCAR (ROBUSTO)
  // =====================
  if (buscarBtn) {
    buscarBtn.addEventListener('click', async () => {
      // VALIDACIÓN FINAL
      if (!validarTextoNombre(temaInput.value)) {
        console.warn("Tema inválido");
        return;
      }
      if (!validarTextoNombre(asesorInput.value)) {
        console.warn("Asesor inválido");
        return;
      }
      if (!validarHora(desdeTime.value) || !validarHora(hastaTime.value)) {
        console.warn("Hora inválida");
        return;
      }

      const filtros = {
        tema: sanitizeText(temaInput?.value.trim() || ''),
        asesor: sanitizeText(asesorInput?.value.trim() || ''),
        carrera: sanitizeText(carreraSel?.value || ''),
        dia: sanitizeText(diaSel?.value || ''),
        desde: sanitizeText(desdeTime?.value || ''),
        hasta: sanitizeText(hastaTime?.value || ''),
        area: sanitizeText(areaSel?.value || '')
      };

      console.log("Buscar con filtros:", filtros);

      try {
        const resp = await obtenerAsesores(filtros);
        console.log("🟡 Respuesta API (buscar con filtros):", resp);

        // Normalizar SIEMPRE a array
        if (Array.isArray(resp)) {
          asesoresGlobal = resp;                   // Caso normal
        } else if (Array.isArray(resp.asesores)) {
          asesoresGlobal = resp.asesores;          // Caso de "no se encontró nada"
        } else {
          console.warn("⚠ Respuesta inesperada:", resp);
          asesoresGlobal = [];
        }

        currentPage = 1;
        renderPage();
        actualizarBotonLimpiar();

      } catch (error) {
        console.error("Error al cargar asesores con filtros:", error);
        listaAsesoresEl.innerHTML = `<li style="padding:2rem;text-align:center;">Error al cargar asesores</li>`;
      }
    });
  }

  // =====================
  // BOTÓN LIMPIAR
  // =====================
  if (limpiarBtn) {
    limpiarBtn.addEventListener("click", async () => {

      if (temaInput) temaInput.value = "";
      if (asesorInput) asesorInput.value = "";
      if (carreraSel) carreraSel.selectedIndex = 0;
      if (diaSel) diaSel.selectedIndex = 0;
      if (areaSel) areaSel.selectedIndex = 0;
      if (desdeTime) desdeTime.value = "";
      if (hastaTime) hastaTime.value = "";

      temaInput?.classList.remove("input-error");
      asesorInput?.classList.remove("input-error");
      desdeTime?.classList.remove("input-error");
      hastaTime?.classList.remove("input-error");

      actualizarBotonLimpiar();

      // ⭐ Recargar TODOS los asesores
      await cargarAsesores();
    });
  }
})();

// =====================
// PAGINACIÓN + RENDER
// =====================
const listaAsesoresEl = document.getElementById("lista-asesores");
let asesoresGlobal = [];
let currentPage = 1;
const perPage = 6;
let totalPages = 1;

const advisorImages = [
  "../imagenes/adviser1.jpg",
  "../imagenes/adviser2.jpg",
  "../imagenes/adviser3.jpg",
  "../imagenes/adviser4.jpg",
  "../imagenes/adviser5.jpg",
];

function generarEstrellas(calificacion) {
  const rating = parseFloat(calificacion) || 0;
  const entero = Math.floor(rating);
  let html = "";
  for (let i = 0; i < 5; i++) html += i < entero ? "★" : "☆";
  return html;
}

function crearAsesorCard(asesor, index) {
  const imagenAsesor = advisorImages[index % advisorImages.length];
  const nombreCorto = sanitizeText(asesor.nombre_completo.trim());
  const rating = parseFloat(asesor.puntuacion_promedio) || 0;
  const sesiones = asesor.numero_sesiones || 0;
  const sesionesTexto =
    sesiones >= 100 ? "100+" :
      sesiones >= 50 ? "50+" :
        sesiones >= 10 ? "10+" : sesiones;

  const disponibilidad = formatDisponibilidad(asesor.disponibilidades);
  const carreraCorta = asesor.nombre_carrera
    ? sanitizeText(
      asesor.nombre_carrera.replace("Ingenieri­a", "Ing.").replace("Licenciatura", "Lic.")
    )
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

function formatDisponibilidad(disponibilidades) {
  if (!disponibilidades || disponibilidades.length === 0)
    return "Sin disponibilidad";

  const nombresDias = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  const dias = new Set();

  disponibilidades.forEach(d => {
    const fecha = new Date(d.fecha_inicio);
    dias.add(nombresDias[fecha.getDay()]);
  });

  return Array.from(dias).slice(0, 4).join(" · ") || "Próximamente";
}

function renderPage() {
  if (!listaAsesoresEl) return;

  const alerta = document.querySelector(".alerta-resultados");

  totalPages = Math.ceil(asesoresGlobal.length / perPage);

  // Si no hay resultados
  if (asesoresGlobal.length === 0) {
    listaAsesoresEl.innerHTML = "";
    if (alerta) {
      alerta.style.display = "flex";
      alerta.querySelector(".alerta-texto").textContent =
        "No se encontraron asesores que coincidan con tus filtros. Intenta modificar los criterios o eliminar algunos filtros.";
    }
    updatePaginationButtons();
    return;
  }

  // Si hay resultados, ocultar alerta
  if (alerta) alerta.style.display = "none";

  // Render normal
  const start = (currentPage - 1) * perPage;
  const end = start + perPage;
  const pageAsesores = asesoresGlobal.slice(start, end);

  listaAsesoresEl.innerHTML = pageAsesores
    .map((asesor, idx) => crearAsesorCard(asesor, start + idx))
    .join("");

  updatePaginationButtons();
}

function updatePaginationButtons() {
  const pag = document.querySelector('.paginacion');
  if (!pag) return;

  const btnPrev = pag.querySelector('.page-btn.prev');
  const btnNext = pag.querySelector('.page-btn.next');
  const pageList = pag.querySelector('.page-list');

  if (btnPrev) btnPrev.disabled = currentPage <= 1;
  if (btnNext) btnNext.disabled = currentPage >= totalPages;

  if (pageList) {
    pageList.innerHTML = "";
    for (let i = 1; i <= totalPages; i++) {
      const isCurrent = i === currentPage;
      pageList.innerHTML += `
        <button class="page-number ${isCurrent ? 'is-active' : ''}" 
          data-page="${i}" ${isCurrent ? 'aria-current="page"' : ''}>${i}</button>`;
    }
  }
}

function gotoPage(n) {
  currentPage = Math.min(Math.max(1, n), totalPages);
  renderPage();
}

document.addEventListener('click', (e) => {
  if (e.target.matches('.page-btn.prev')) gotoPage(currentPage - 1);
  else if (e.target.matches('.page-btn.next')) gotoPage(currentPage + 1);
  else if (e.target.matches('.page-number')) {
    const n = Number(e.target.dataset.page);
    if (Number.isFinite(n)) gotoPage(n);
  }
});

async function cargarAsesores() {
  if (!listaAsesoresEl) return;

  try {
    asesoresGlobal = await obtenerAsesores();

    currentPage = 1;
    renderPage();
  } catch (error) {
    console.error("Error cargando asesores:", error);
    listaAsesoresEl.innerHTML =
      `<li style="padding:2rem;text-align:center;">Error al cargar asesores</li>`;
  }
}

document.addEventListener("DOMContentLoaded", () => cargarAsesores());
