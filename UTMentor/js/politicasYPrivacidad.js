document.addEventListener("DOMContentLoaded", () => {
  const cards = document.querySelectorAll(".card");
  const contenido = document.getElementById("contenido");

  const secciones = {
    privacidad: `
      <h2>Política de Privacidad</h2>
      <p>En UTMentor, valoramos tu privacidad. La información personal que nos proporcionas se utiliza únicamente para mejorar tu experiencia y ofrecerte un servicio seguro y personalizado. No compartimos tus datos con terceros sin tu consentimiento.</p>
    `,
    terminos: `
      <h2>Términos y Condiciones</h2>
      <p>El uso de UTMentor implica la aceptación de nuestros términos. Te comprometes a utilizar la plataforma de manera responsable y conforme a las leyes aplicables. Nos reservamos el derecho de modificar estos términos en cualquier momento.</p>
    `,
    aviso: `
      <h2>Aviso Legal</h2>
      <p>El contenido, diseño y logotipos de UTMentor son propiedad exclusiva de la institución. Cualquier uso no autorizado de este material puede ser sancionado según la legislación vigente.</p>
    `,
    cookies: `
      <h2>Política de Cookies</h2>
      <p>Utilizamos cookies para analizar el tráfico y mejorar tu experiencia en nuestro sitio. Puedes configurar tu navegador para rechazar cookies, aunque algunas funciones podrían no estar disponibles.</p>
    `
  };

  cards.forEach(card => {
    card.addEventListener("click", () => {
      const id = card.dataset.section;
      contenido.innerHTML = secciones[id] || "<p>Sección no encontrada.</p>";
      contenido.scrollIntoView({ behavior: "smooth" });
    });
  });
});
