// UTMentor/js/explorar.js
import { obtenerAsesores } from "./services/asesorService.js";

// =====================
// VARIABLES GLOBALES
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

// =====================
// FUNCIONES REUTILIZABLES
// =====================

// Sanitización para evitar XSS
function sanitizeText(str = "") {
  return String(str)
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/\(/g, "&#40;")
    .replace(/\)/g, "&#41;");
}

// Validar nombres (solo letras, acentos y espacios)
function validarTextoNombre(str = "") {
  if (!str.trim()) return true;
  return /^[A-Za-zÁÉÍÓÚÜáéíóúüÑñ\s]{2,40}$/.test(str.trim());
}

// Validar hora formato 24h
function validarHora(str = "") {
  if (!str) return true;
  return /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(str);
}

// Generar estrellas de rating
function generarEstrellas(calificacion) {
  const rating = parseFloat(calificacion) || 0;
  const entero = Math.floor(rating);
  let html = "";
  for (let i = 0; i < 5; i++) html += i < entero ? "★" : "☆";
  return html;
}

// Formatear disponibilidad
function formatDisponibilidad(disponibilidades) {
  if (!disponibilidades || disponibilidades.length === 0)
    return "Sin disponibilidad";

  const nombresDias = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  const dias = new Set();

  disponibilidades.forEach(d => {
    const fecha = new Date(d.fecha_inicio);
    dias.add(nombresDias[fecha.getDay()]);
  });

  return Array.from(dias).slice(0, 3).join(" · ") || "Próximamente";
}

// =====================
// UI HELPERS
// =====================

// Crear tarjeta de asesor
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

// Renderizar página de resultados
function renderPage() {
  if (!listaAsesoresEl) return;

  const alerta = document.querySelector(".alerta-resultados");
  totalPages = Math.ceil(asesoresGlobal.length / perPage);

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

  if (alerta) alerta.style.display = "none";

  const start = (currentPage - 1) * perPage;
  const end = start + perPage;
  const pageAsesores = asesoresGlobal.slice(start, end);

  listaAsesoresEl.innerHTML = pageAsesores
    .map((asesor, idx) => crearAsesorCard(asesor, start + idx))
    .join("");

  updatePaginationButtons();
}

// Actualizar botones de paginación
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

// Cambiar página
function gotoPage(n) {
  currentPage = Math.min(Math.max(1, n), totalPages);
  renderPage();
}

// =====================
// EVENTOS DE PAGINACIÓN
// =====================
document.addEventListener('click', (e) => {
  if (e.target.matches('.page-btn.prev')) gotoPage(currentPage - 1);
  else if (e.target.matches('.page-btn.next')) gotoPage(currentPage + 1);
  else if (e.target.matches('.page-number')) {
    const n = Number(e.target.dataset.page);
    if (Number.isFinite(n)) gotoPage(n);
  }
});

// =====================
// CARGA DE DATOS
// =====================
async function cargarAsesores(filtros = {}) {
  if (!listaAsesoresEl) return;

  try {
    asesoresGlobal = await obtenerAsesores(filtros);
    currentPage = 1;
    renderPage();
  } catch (error) {
    console.error("Error cargando asesores:", error);
    listaAsesoresEl.innerHTML =
      `<li style="padding:2rem;text-align:center;">Error al cargar asesores</li>`;
  }
}

// =====================
// FILTROS Y BOTONES
// =====================
(function initFiltros() {
  const temaInput = document.getElementById('filtro-tema');
  const asesorInput = document.getElementById('filtro-asesor');
  const carreraSel = document.getElementById('filtro-carrera');
  const diaSel = document.getElementById('filtro-dia');
  const desdeTime = document.getElementById('filtro-hora-desde');
  const hastaTime = document.getElementById('filtro-hora-hasta');
  const areaSel = document.getElementById('filtro-area');
  const buscarBtn = document.getElementById('btn-buscar');
  const limpiarBtn = document.getElementById('btn-limpiar');

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

  function actualizarBotonLimpiar() {
    limpiarBtn.style.display = hayFiltros() ? "inline-flex" : "none";
  }

  function validarInputTexto(el) {
    el.addEventListener("input", () => {
      const val = el.value.trim();
      if (!validarTextoNombre(val)) el.classList.add("input-error");
      else el.classList.remove("input-error");
      actualizarBotonLimpiar();
    });
  }

  if (temaInput) validarInputTexto(temaInput);
  if (asesorInput) validarInputTexto(asesorInput);

  [desdeTime, hastaTime].forEach(el => {
    if (!el) return;
    el.addEventListener("input", () => {
      if (!validarHora(el.value)) el.classList.add("input-error");
      else el.classList.remove("input-error");
      actualizarBotonLimpiar();
    });
  });

  [carreraSel, diaSel, areaSel].forEach(el => {
    if (el) el.addEventListener("change", actualizarBotonLimpiar);
  });

  actualizarBotonLimpiar();

  [temaInput, asesorInput, desdeTime, hastaTime].forEach(el => {
    if (!el) return;
    el.addEventListener("keydown", e => {
      if (e.key === "Enter") {
        e.preventDefault();
        buscarBtn.click();
      }
    });
  });

  if (buscarBtn) {
    buscarBtn.addEventListener('click', async () => {
      if (!validarTextoNombre(temaInput.value) || !validarTextoNombre(asesorInput.value)) return;
      if (!validarHora(desdeTime.value) || !validarHora(hastaTime.value)) return;

      const filtros = {
        tema: sanitizeText(temaInput?.value.trim() || ''),
        asesor: sanitizeText(asesorInput?.value.trim() || ''),
        carrera: sanitizeText(carreraSel?.value || ''),
        dia: sanitizeText(diaSel?.value || ''),
        desde: sanitizeText(desdeTime?.value || ''),
        hasta: sanitizeText(hastaTime?.value || ''),
        area: sanitizeText(areaSel?.value || '')
      };

      try {
        asesoresGlobal = await obtenerAsesores(filtros);
        currentPage = 1;
        renderPage();
        actualizarBotonLimpiar();
      } catch (error) {
        console.error("Error al cargar asesores con filtros:", error);
        listaAsesoresEl.innerHTML = `<li style="padding:2rem;text-align:center;">Error al cargar asesores</li>`;
      }
    });
  }

  if (limpiarBtn) {
    limpiarBtn.addEventListener("click", () => {
      if (temaInput) temaInput.value = "";
      if (asesorInput) asesorInput.value = "";
      if (carreraSel) carreraSel.selectedIndex = 0;
      if (diaSel) diaSel.selectedIndex = 0;
      if (areaSel) areaSel.selectedIndex = 0;
      if (desdeTime) desdeTime.value = "";
      if (hastaTime) hastaTime.value = "";

      [temaInput, asesorInput, desdeTime, hastaTime].forEach(el => el?.classList.remove("input-error"));
      actualizarBotonLimpiar();
      cargarAsesores();
    });
  }
})();

// =====================
// INICIALIZACIÓN
// =====================
document.documentElement.classList.remove('no-js');
document.addEventListener("DOMContentLoaded", () => cargarAsesores());
