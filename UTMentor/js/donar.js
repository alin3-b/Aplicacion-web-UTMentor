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

const stripe = Stripe("pk_test_51STq7ZF3d8y3BiJnJqaXNEFHJc4WQs8WzjXmCd4ENlblsFGVHRPVjRjp6gBFxw3P5KS593DjoxScDh169C0WIxUh00ryapalUb"); // REEMPLAZA
let elements;
let paymentElement;

function mostrarMensaje(texto, tipo) {
  const mensaje = document.getElementById("mensaje");
  mensaje.innerText = texto;
  mensaje.className = tipo;
  mensaje.style.display = "block";
}

function mostrarLoader(activo) {
  document.getElementById("loader").style.display = activo ? "block" : "none";
  document.getElementById("submit").disabled = activo;
}

async function generarIntentoPago() {
  const amount = Number(document.getElementById("amount").value);
  mostrarLoader(true);
  mostrarMensaje("", ""); // limpiar mensaje

  try {
    const res = await fetch("http://localhost:3000/api/pagos/donar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount })
    });

    if (!res.ok) throw new Error("Error al comunicarse con el servidor");

    const data = await res.json();
    const clientSecret = data.clientSecret;

    if (elements && paymentElement) {
      paymentElement.unmount();
    }

    elements = stripe.elements({ clientSecret });
    paymentElement = elements.create("payment");
    paymentElement.mount("#payment-element");

  } catch (error) {
    mostrarMensaje("❌ No se pudo preparar el pago: " + error.message, "error");
  } finally {
    mostrarLoader(false);
  }
}

// Crear Payment Intent al cargar y cada vez que cambie el monto
document.getElementById("amount").addEventListener("change", generarIntentoPago);
generarIntentoPago();

document.getElementById("submit").addEventListener("click", async () => {
  mostrarLoader(true);
  mostrarMensaje("", "");

  try {
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: window.location.href },
      redirect: "if_required"
    });

    if (error) {
      mostrarMensaje("❌ Error en el pago: " + error.message, "error");
    } else {
      mostrarMensaje("✅ ¡Gracias por tu donación! Pago completado.", "ok");
    }
  } catch (err) {
    mostrarMensaje("❌ Error inesperado: " + err.message, "error");
  } finally {
    mostrarLoader(false);
  }
});