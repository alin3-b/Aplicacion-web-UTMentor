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
      <p>
        Al registrarse, acepta las siguientes condiciones:
        <ul style="margin-top: 10px; padding-left: 20px;">
          <li>El usuario se registrará en uno o ambos roles (Asesor/Asesorado).</li>
          <li>El sistema no gestiona pagos reales; los costos son solo precios de referencia.</li>
          <li>La comunicación con el asesor/asesorado se realizará fuera de la plataforma (vía correo electrónico, dado que no hay chat o videollamadas).</li>
          <li>La cancelación de sesiones debe realizarse con un plazo mínimo de 24 horas antes de la hora agendada.</li>
        </ul>
        Nos reservamos el derecho de invalidar cuentas que incumplan estas normas.
      </p>
    `,
    aviso: `
      <h2>Aviso Legal</h2>
      <p>
        UTMentor es una aplicación web provista "tal cual" y depende de la infraestructura del servidor web y la base de datos MySQL. 
        El sistema no es responsable de la calidad o veracidad de las asesorías impartidas ni de la comunicación externa entre usuarios. 
        El correcto funcionamiento requiere una conexión a Internet estable y un navegador compatible (Chrome, Edge o Firefox).
      </p>
    `,
    cookies: `
      <h2>Política de Cookies</h2>
      <p>
        Utilizamos cookies estrictamente necesarias para el funcionamiento del sistema, principalmente para mantener la sesión activa (autenticación) y permitir el cambio de roles. 
        También usamos cookies funcionales para análisis de rendimiento y usabilidad. 
        Al usar UTMentor, usted acepta el uso de estas tecnologías para garantizar el servicio.
      </p>
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
