// Util: formato corto de fecha/hora
const fmtDay = new Intl.DateTimeFormat('es-MX',{weekday:'short',day:'2-digit'});
const fmtTime = new Intl.DateTimeFormat('es-MX',{hour:'2-digit',minute:'2-digit'});

// Estado UI
const agendaGrid = document.getElementById('agendaGrid');
const weekLabel  = document.getElementById('weekLabel');
const prevWeek   = document.getElementById('prevWeek');
const nextWeek   = document.getElementById('nextWeek');
const btnReservar= document.getElementById('btnReservar');

// Modal
const modal      = document.getElementById('bookModal');
const slotSummary= document.getElementById('slotSummary');
const bookForm   = document.getElementById('bookForm');
const sessionTipo= document.getElementById('sessionTipo');
const maxPeople  = document.getElementById('maxPeopleDiv');
const sessionTema= document.getElementById('sessionTema');

// ---- Semana base (hoy -> lunes) ----
const today = new Date();
let start = startOfWeek(today);

// Datos de ejemplo de slots (normalmente vendrían del backend)
function mockSlots(date) {
  // genera 3–5 slots por día, entre 9:00 y 19:00
  const slots = [];
  const n = 3 + Math.floor(Math.random()*3);
  for (let i=0;i<n;i++){
    const hour = 9 + Math.floor(Math.random()*10);
    const m = Math.random() < .5 ? 0 : 30;
    const d = new Date(date);
    d.setHours(hour, m, 0, 0);
    slots.push(d);
  }
  return slots.sort((a,b)=>a-b);
}

// Render semana
function renderWeek() {
  const end = new Date(start); end.setDate(start.getDate() + 6);
  weekLabel.textContent = `${fmtDay.format(start)} – ${fmtDay.format(end)}`.replaceAll('.', '');

  agendaGrid.innerHTML = '';
  for (let i=0; i<7; i++){
    const day = new Date(start); day.setDate(start.getDate() + i);

    const col = document.createElement('div');
    col.className = 'day-col';

    const head = document.createElement('div');
    head.className = 'day-col__head';
    head.innerHTML = `<div class="day-col__name">${fmtDay.format(day).split(' ')[0]}</div>
                      <div class="day-col__date">${fmtDay.format(day).split(' ')[1]}</div>`;
    col.appendChild(head);

    const daySlots = mockSlots(day);
    if (!daySlots.length){
      const empty = document.createElement('div');
      empty.className = 'muted';
      empty.textContent = '— sin horarios —';
      col.appendChild(empty);
    } else {
      daySlots.forEach(d => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'session-item';
        btn.textContent = fmtTime.format(d);
        btn.addEventListener('click', () => selectSlot(d, btn));
        col.appendChild(btn);
      });
    }

    agendaGrid.appendChild(col);
  }
}

// Selección de slot
let selectedSlot = null;
function selectSlot(date, el){
  // marcar visualmente
  agendaGrid.querySelectorAll('.session-item.selected').forEach(s=>s.classList.remove('selected'));
  el.classList.add('selected');

  selectedSlot = date;
  slotSummary.textContent = `Has elegido: ${date.toLocaleDateString('es-MX',{weekday:'long', day:'2-digit', month:'short'})}, ${fmtTime.format(date)} (60 min)`;
  openModal();
}

// Navegación de semana
prevWeek.addEventListener('click',()=>{ start.setDate(start.getDate()-7); renderWeek(); });
nextWeek.addEventListener('click',()=>{ start.setDate(start.getDate()+7); renderWeek(); });

// Botón reservar (si no hay slot seleccionado, abre modal con aviso)
btnReservar.addEventListener('click', () => {
  if (!selectedSlot) slotSummary.textContent = 'Selecciona un horario en el calendario.';
  openModal();
});

// Modal básico
function openModal(){
  // Cargar temas desde la lista del perfil (reutilizamos lógica del módulo anterior)
  fillTopicsFromProfile(); // :contentReference[oaicite:3]{index=3}
  modal.setAttribute('aria-hidden','false');
  setTimeout(()=>bookForm.querySelector('.f-input')?.focus(), 0);
}
function closeModal(){
  modal.setAttribute('aria-hidden','true');
}
modal.addEventListener('click',(e)=>{ if(e.target.hasAttribute('data-close')) closeModal(); });
modal.querySelector('.modal__close').addEventListener('click',closeModal);
document.addEventListener('keydown',(e)=>{ if(e.key==='Escape') closeModal(); });

// Mostrar capacidad si el tipo es Grupo
sessionTipo.addEventListener('change',()=>{
  maxPeople.style.display = sessionTipo.value === 'Grupo' ? 'block' : 'none';
});

// Confirmación (maqueta)
bookForm.addEventListener('submit',(e)=>{
  e.preventDefault();
  if (!selectedSlot) {
    alert('Selecciona un horario en la agenda.');
    return;
  }
  closeModal();
  alert('Tu reserva ha sido registrada (maqueta).');
});

// Helper: cargar temas desde el perfil (ul li)
function fillTopicsFromProfile(){
  const ul = document.querySelector('#profileTopics ul');
  sessionTema.innerHTML = '';
  ul.querySelectorAll('li').forEach(li=>{
    const opt = document.createElement('option');
    opt.value = li.textContent.trim();
    opt.textContent = li.textContent.trim();
    sessionTema.appendChild(opt);
  });
}

// Util: inicio de semana (lunes)
function startOfWeek(d){
  const r = new Date(d);
  const day = (r.getDay()+6)%7; // 0=lunes
  r.setDate(r.getDate()-day);
  r.setHours(0,0,0,0);
  return r;
}

// Inicial
renderWeek();
