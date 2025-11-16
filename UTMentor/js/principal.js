//UTMentor/js/principal.js
// Importar servicio de asesores
import { obtenerAsesores } from "./services/asesorService.js";
import { obtenerTemasPopulares } from "./services/topicService.js";
import { obtenerMetricas } from "./services/metricasService.js";


document.documentElement.classList.remove("no-js");

// Toggle del menú móvil + actualización de etiqueta/aria
(function () {
  const burger = document.querySelector(".burger");
  const panel = document.getElementById("mobile-panel");
  const label = burger ? burger.querySelector(".burger-label") : null;

  if (!burger || !panel) return;

  function setOpen(open) {
    panel.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    burger.setAttribute("title", open ? "Cerrar menú" : "Abrir menú");
    if (label) label.textContent = open ? "Cerrar" : "Menú";
  }

  burger.addEventListener("click", () => {
    setOpen(!panel.classList.contains("open"));
  });

  // Cierra al hacer click en un enlace (móvil)
  panel.addEventListener("click", (e) => {
    if (e.target.closest("a")) setOpen(false);
  });

  // Cierra con Escape
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setOpen(false);
  });

  // Cierra si se hace click fuera (solo móvil)
  document.addEventListener("click", (e) => {
    if (window.innerWidth > 860) return;
    if (!panel.contains(e.target) && !burger.contains(e.target)) {
      setOpen(false);
    }
  });
})();

// --- Nav transparente sobre el hero usando IntersectionObserver ---
(function () {
  const navWrap = document.querySelector(".nav-wrap");
  const hero = document.querySelector(".hero");
  if (!navWrap || !hero) return;

  const observer = new IntersectionObserver(
    (entries) => {
      const e = entries[0];
      // Si el hero es visible al menos 30%, el nav es transparente
      if (e.isIntersecting && e.intersectionRatio >= 0.3) {
        navWrap.classList.add("is-transparent");
      } else {
        navWrap.classList.remove("is-transparent");
      }
    },
    { threshold: [0, 0.3, 1] }
  );

  observer.observe(hero);
})();

// ---------------- TESTIMONIOS (slider) ----------------

// Data de testimonios
const testimonials = [
  {
    img: "../imagenes/testimony1.jpg",
    quote:
      "“Agendé cálculo en minutos y pasé mi extraordinario. La asesoría fue directa, clara y sin vueltas.”",
    author: "— Andrea M., Ingeniería Industrial",
    alt: "Andrea M.",
  },
  {
    img: "../imagenes/testimony2.jpg",
    quote: "“Me gustó que el asesor ya tenía reseñas y horario claro.”",
    author: "— Luis R., Ingeniería en Física Aplicada",
    alt: "Luis R.",
  },
  {
    img: "../imagenes/testimony3.jpg",
    quote: "“Confirmaron por correo en menos de un día. Muy serio todo.”",
    author: "— Pablo S., Ingeniería Mecánica Automotriz",
    alt: "Pablo S.",
  },
  {
    img: "../imagenes/testimony4.jpg",
    quote:
      "“Doy asesorías de programación y mi reputación me trae más alumnos.”",
    author: "— Sofía G., Asesora en Programación Modular",
    alt: "Sofía G.",
  },
  {
    img: "../imagenes/testimony5.jpg",
    quote: "“Funciona presencial o por videollamada, eso me salvó.”",
    author: "— Miriam A., Ingeniería Civil",
    alt: "Miriam A.",
  },
];

// Estado actual
let currentTestimonial = 0;

// Elements
const mainAvatarEl = document.getElementById("review-main-avatar");
const quoteEl = document.getElementById("review-quote");
const authorEl = document.getElementById("review-author");
const avatarsListEl = document.getElementById("review-avatars");

const prevBtn = document.querySelector('.reviews-arrow[data-action="prev"]');
const nextBtn = document.querySelector('.reviews-arrow[data-action="next"]');

// Función para renderizar el testimonio actual
function renderTestimonial(idx) {
  const t = testimonials[idx];
  if (!t) return;

  // Actualiza imagen grande
  mainAvatarEl.src = t.img;
  mainAvatarEl.alt = "Foto de " + t.alt;

  // Actualiza texto
  quoteEl.textContent = t.quote;
  authorEl.textContent = t.author;

  // Actualiza miniaturas activas
  const miniItems = avatarsListEl.querySelectorAll(".reviews-avatars__item");
  miniItems.forEach((item) => {
    const itemIndex = parseInt(item.getAttribute("data-index"), 10);
    if (itemIndex === idx) {
      item.classList.add("reviews-avatars__item--active");
    } else {
      item.classList.remove("reviews-avatars__item--active");
    }
  });
}

// Navegar prev/next
function goPrev() {
  currentTestimonial =
    (currentTestimonial - 1 + testimonials.length) % testimonials.length;
  renderTestimonial(currentTestimonial);
}
function goNext() {
  currentTestimonial = (currentTestimonial + 1) % testimonials.length;
  renderTestimonial(currentTestimonial);
}

if (prevBtn && nextBtn) {
  prevBtn.addEventListener("click", goPrev);
  nextBtn.addEventListener("click", goNext);
}

// Click directo en los avatares pequeños
if (avatarsListEl) {
  avatarsListEl.addEventListener("click", (e) => {
    const item = e.target.closest(".reviews-avatars__item");
    if (!item) return;
    const idx = parseInt(item.getAttribute("data-index"), 10);
    if (Number.isInteger(idx)) {
      currentTestimonial = idx;
      renderTestimonial(currentTestimonial);
    }
  });
}

// Render inicial
renderTestimonial(currentTestimonial);

// ---------------- ASESORES POPULARES (desde API) ----------------

// Imágenes dummy para reutilizar (ya que no hay fotos en BD)
const advisorImages = [
  "../imagenes/adviser1.jpg",
  "../imagenes/adviser2.jpg",
  "../imagenes/adviser3.jpg",
  "../imagenes/adviser4.jpg",
  "../imagenes/adviser5.jpg",
];

function formatDisponibilidad(disponibilidades) {
  if (!disponibilidades || disponibilidades.length === 0) {
    return "Sin disponibilidad";
  }

  const nombresDias = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  const dias = new Set();

  disponibilidades.forEach((disp) => {
    const fecha = new Date(disp.fecha_inicio);
    dias.add(nombresDias[fecha.getDay()]);
  });

  // Mostrar máximo 3 días
  return Array.from(dias).slice(0, 3).join(" · ") || "Próximamente";
}


// Función para generar estrellas
function generarEstrellas(calificacion) {
  const rating = parseFloat(calificacion) || 0;
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  let html = "";

  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      html += '<span class="star">★</span>';
    } else {
      html += '<span class="star star--off">★</span>';
    }
  }

  return html;
}

// Función para crear card de asesor
function crearAsesorCard(asesor, index) {
  const imagenAsesor = advisorImages[index % advisorImages.length];

  // Formatear nombre: Primer nombre + Primera letra del apellido
  const partesNombre = asesor.nombre_completo.trim().split(" ");
  const primerNombre = partesNombre[0] || "";
  const primeraLetraApellido = partesNombre[1] ? partesNombre[1][0] + "." : "";
  const nombreCorto = `${primerNombre} ${primeraLetraApellido}`.trim();

  const rating = parseFloat(asesor.puntuacion_promedio) || 0;
  const sesiones = asesor.numero_sesiones || 0;
  const sesionesTexto =
    sesiones >= 100
      ? "100+"
      : sesiones >= 50
      ? "50+"
      : sesiones >= 10
      ? "10+"
      : sesiones;
  const disponibilidad = formatDisponibilidad(asesor.disponibilidades);
  const carreraCorta = asesor.nombre_carrera
    ? asesor.nombre_carrera
        .replace("Ingenieri­a", "Ing.")
        .replace("Licenciatura", "Lic.")
    : "Universidad";

  return `
    <li class="advisorCard">
      <div class="advisorCard__rowTop">
        <div class="advisorCard__profile">
          <div class="advisorCard__avatar">
            <img src="${imagenAsesor}" alt="${nombreCorto}" />
          </div>
          <div class="advisorCard__info">
            <div class="advisorCard__name">${nombreCorto}</div>
            <div class="advisorCard__career">${carreraCorta}</div>
            <div class="advisorCard__sessions">
              <span class="advisorCard__iconSessions" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="16" height="16">
                  <path d="M4 5h16v14H4z" stroke="currentColor" stroke-width="1.5" fill="none"/>
                  <path d="M4 9h16M9 4v2M15 4v2" stroke="currentColor" stroke-width="1.5"/>
                </svg>
              </span>
              ${sesionesTexto}+ sesiones
            </div>
          </div>
        </div>
        <div class="advisorCard__ratingBlock">
          <div class="advisorCard__stars" aria-label="${rating} de 5">
            ${generarEstrellas(rating)}
            <span class="advisorCard__scoreText">${Number.isInteger(rating) ? rating : rating.toFixed(1)}/5</span>
          </div>
          <div class="advisorCard__availability">${disponibilidad}</div>
        </div>
      </div>
      <div class="advisorCard__rowBottom">
        <a class="advisorCard__cta" href="panelPublicoAsesor.html?id=${
          asesor.id_usuario
        }">Ver perfil</a>
      </div>
    </li>
  `;
}

async function cargarAsesoresPopulares() {
  const track = document.getElementById("featured-track");
  if (!track) return;

  try {
    // Usar el servicio
    const asesores = await obtenerAsesores();
    console.log("Asesores JSON:", JSON.stringify(asesores, null, 2));
    if (!asesores || asesores.length === 0) {
      track.innerHTML =
        '<li style="padding: 2rem; text-align: center; width: 100%;">No hay asesores disponibles en este momento.</li>';
      return;
    }

    // Ordenar primero por calificación y luego por número de sesiones (descendente)
    const asesoresOrdenados = asesores.sort((a, b) => {
      if (b.puntuacion_promedio !== a.puntuacion_promedio) {
        return b.puntuacion_promedio - a.puntuacion_promedio;
      }
      return b.numero_sesiones - a.numero_sesiones;
    });

    // Tomar solo los primeros 5 asesores
    const asesoresTop = asesoresOrdenados.slice(0, 5);

    // Generar las cards
    track.innerHTML = asesoresTop
      .map((asesor, index) => crearAsesorCard(asesor, index))
      .join("");

    // Inicializar carrusel después de cargar
    inicializarCarruselAsesores();
  } catch (error) {
    console.error("Error al cargar asesores populares:", error);
    track.innerHTML =
      '<li style="padding: 2rem; text-align: center; width: 100%;">Error al cargar asesores. Intenta recargar la página.</li>';
  }
}


// Función para inicializar el carrusel
function inicializarCarruselAsesores() {
  const track = document.getElementById("featured-track");
  if (!track) return;

  const arrows = document.querySelectorAll(".featured-arrow");
  const card = track.querySelector(".advisorCard");
  const step = card ? card.offsetWidth + 16 : 360;

  arrows.forEach((btn) => {
    // Remover listeners anteriores si existen
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);

    newBtn.addEventListener("click", () => {
      const dir = newBtn.getAttribute("data-dir");
      track.scrollBy({
        left: dir === "next" ? step : -step,
        behavior: "smooth",
      });
    });
  });
}

// ---------------- TEMAS POPULARES ----------------

// Función para generar el HTML de un tema
function crearTemaCard(tema) {
  return `
    <li class="subject">
      <div class="subject__body">
        <h4>${tema.nombre_tema}</h4>
        <span class="subject__meta">${tema.numero_asesores} asesores</span>
      </div>
      <span class="subject__chev" aria-hidden="true">›</span>
    </li>
  `;
}

// Función para cargar temas populares desde la API
async function cargarTemasPopulares() {
  const grid = document.querySelector(".subjects__grid");
  if (!grid) return;

  try {
    const temas = await obtenerTemasPopulares(); // Llama a tu service
    if (!temas || temas.length === 0) {
      grid.innerHTML = `<li style="padding: 2rem; text-align: center; width: 100%;">No hay temas disponibles</li>`;
      return;
    }

    // Como vienen ordenados y siempre son 6, solo mapeamos
    grid.innerHTML = temas.map(crearTemaCard).join("");
  } catch (error) {
    console.error("Error al cargar temas populares:", error);
    grid.innerHTML = `<li style="padding: 2rem; text-align: center; width: 100%;">Error al cargar temas</li>`;
  }
}

async function cargarMetricas() {
  const metricas = await obtenerMetricas();
  if (!metricas) return;

  const container = document.querySelector(".trust-metrics");
  if (!container) return;

  container.innerHTML = `
    <div class="trust-metric">
      <div class="trust-metric__value">+${metricas.asesoresActivos}</div>
      <div class="trust-metric__label">asesores impartiendo temas cada semana.</div>
    </div>

    <div class="trust-metric">
      <div class="trust-metric__value">+${metricas.calificaciones5}</div>
      <div class="trust-metric__label">calificaciones de asesores con 5 estrellas.</div>
    </div>

    <div class="trust-metric">
      <div class="trust-metric__value">+${metricas.temasImpartidos}</div>
      <div class="trust-metric__label">temas impartidos.</div>
    </div>

    <div class="trust-metric">
      <div class="trust-metric__value">${metricas.satisfaccionPromedio}/5</div>
      <div class="trust-metric__label">en satisfacción de los usuarios.</div>
    </div>
  `;
}
// Inicializar al cargar la página
document.addEventListener("DOMContentLoaded", () => {
  cargarAsesoresPopulares();  // Ya existente
  cargarTemasPopulares();
  cargarMetricas();
});

// FAQ: permitir sólo una tarjeta abierta a la vez
(function () {
  const items = document.querySelectorAll(".faq__item");
  if (!items.length) return;

  items.forEach((el) => {
    el.addEventListener("toggle", () => {
      if (!el.open) return;
      items.forEach((other) => {
        if (other !== el) other.open = false;
      });
    });
  });
})();
