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

// --- Nav transparente sobre el hero usando IntersectionObserver ---
(function () {
  const navWrap = document.querySelector('.nav-wrap');
  const hero = document.querySelector('.hero');
  if (!navWrap || !hero) return;

  const observer = new IntersectionObserver(
    (entries) => {
      const e = entries[0];
      // Si el hero es visible al menos 30%, el nav es transparente
      if (e.isIntersecting && e.intersectionRatio >= 0.3) {
        navWrap.classList.add('is-transparent');
      } else {
        navWrap.classList.remove('is-transparent');
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
    quote: "“Agendé cálculo en minutos y pasé mi extraordinario. La asesoría fue directa, clara y sin vueltas.”",
    author: "— Andrea M., Ingeniería Industrial",
    alt: "Andrea M."
  },
  {
    img: "../imagenes/testimony2.jpg",
    quote: "“Me gustó que el asesor ya tenía reseñas y horario claro.”",
    author: "— Luis R., Ingeniería en Física Aplicada",
    alt: "Luis R."
  },
  {
    img: "../imagenes/testimony3.jpg",
    quote: "“Confirmaron por correo en menos de un día. Muy serio todo.”",
    author: "— Pablo S., Ingeniería Mecánica Automotriz",
    alt: "Pablo S."
  },
  {
    img: "../imagenes/testimony4.jpg",
    quote: "“Doy asesorías de programación y mi reputación me trae más alumnos.”",
    author: "— Sofía G., Asesora en Programación Modular",
    alt: "Sofía G."
  },
  {
    img: "../imagenes/testimony5.jpg",
    quote: "“Funciona presencial o por videollamada, eso me salvó.”",
    author: "— Miriam A., Ingeniería Civil",
    alt: "Miriam A."
  }
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
  miniItems.forEach(item => {
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
  currentTestimonial = (currentTestimonial - 1 + testimonials.length) % testimonials.length;
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

// Carrusel "Asesores populares"
(function(){
  const track = document.getElementById('featured-track');
  if (!track) return;

  const arrows = document.querySelectorAll('.featured-arrow');
  const card = track.querySelector('.advisorCard');
  const step = card ? (card.offsetWidth + 16) : 360; // ancho aprox + gap

  arrows.forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const dir = btn.getAttribute('data-dir');
      track.scrollBy({ left: dir === 'next' ? step : -step, behavior:'smooth' });
    });
  });
})();

// FAQ: permitir sólo una tarjeta abierta a la vez
(function(){
  const items = document.querySelectorAll('.faq__item');
  if (!items.length) return;

  items.forEach((el) => {
    el.addEventListener('toggle', () => {
      if (!el.open) return;
      items.forEach((other) => { if (other !== el) other.open = false; });
    });
  });
})();
