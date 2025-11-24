// UTMentor/js/donar.js
document.documentElement.classList.remove("no-js");

/* ===========================
   NAV MÓVIL (burger)
=========================== */
(function navMobile() {
  const burger = document.querySelector(".burger");
  const panel = document.getElementById("mobile-panel");
  const label = burger?.querySelector(".burger-label");
  if (!burger || !panel) return;

  const setOpen = (open) => {
    panel.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    burger.setAttribute("title", open ? "Cerrar menú" : "Abrir menú");
    if (label) label.textContent = open ? "Cerrar" : "Menú";
  };

  burger.addEventListener("click", () => setOpen(!panel.classList.contains("open")));
  panel.addEventListener("click", (e) => { if (e.target.closest("a")) setOpen(false); });
  window.addEventListener("keydown", (e) => { if (e.key === "Escape") setOpen(false); });
  document.addEventListener("click", (e) => {
    if (window.innerWidth > 860) return;
    if (!panel.contains(e.target) && !burger.contains(e.target)) setOpen(false);
  });
})();

/* ===========================
   UTILIDADES
=========================== */
function sanitizeInput(str) {
  const temp = document.createElement("div");
  temp.textContent = str;
  return temp.innerHTML;
}

async function apiPost(url, body) {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    return { ok: res.ok, status: res.status, data };
  } catch (err) {
    console.error("Error en API:", err);
    return { ok: false, status: 0, data: { success: false, message: "Error de conexión" } };
  }
}

/* ===========================
   SELECCIÓN DE MONTO
=========================== */
const buttons = document.querySelectorAll(".don-amount");
const input = document.getElementById("don-custom");

buttons.forEach(btn => {
  btn.addEventListener("click", () => {
    input.value = btn.dataset.value;
  });
});

/* ===========================
   STRIPE
=========================== */
const stripe = Stripe("pk_test_51STq7ZF3d8y3BiJnJqaXNEFHJc4WQs8WzjXmCd4ENlblsFGVHRPVjRjp6gBFxw3P5KS593DjoxScDh169C0WIxUh00ryapalUb");
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

/* ===========================
   CREAR PAYMENT INTENT
=========================== */
async function generarIntentoPago() {
  const amount = Number(document.getElementById("amount").value);
  mostrarLoader(true);
  mostrarMensaje("", "");

  if (!amount || amount <= 0) {
    mostrarMensaje("❌ Ingresa un monto válido", "error");
    mostrarLoader(false);
    return;
  }

  try {
    const { ok, data } = await apiPost("/api/pagos/donar", { amount });
    if (!ok) throw new Error(data.message || "Error al crear el pago");

    const clientSecret = data.clientSecret;
    if (elements && paymentElement) paymentElement.unmount();

    elements = stripe.elements({ clientSecret });
    paymentElement = elements.create("payment");
    paymentElement.mount("#payment-element");

  } catch (err) {
    mostrarMensaje("❌ No se pudo preparar el pago: " + err.message, "error");
  } finally {
    mostrarLoader(false);
  }
}

document.getElementById("amount").addEventListener("change", generarIntentoPago);
generarIntentoPago();

/* ===========================
   CONFIRMAR PAGO
=========================== */
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
