import nodemailer from "nodemailer";

/**
 * Envía un correo electrónico usando SMTP con Nodemailer
 * @param {Object} config - Configuración del correo
 * @param {string} config.host - Servidor SMTP (ej: 'smtp.gmail.com')
 * @param {number} config.port - Puerto SMTP (465 para SSL, 587 para TLS)
 * @param {boolean} config.secure - true para SSL (puerto 465), false para TLS (puerto 587)
 * @param {string} config.user - Usuario/email de autenticación
 * @param {string} config.password - Contraseña o app password
 * @param {string} config.from - Dirección del remitente
 * @param {string|string[]} config.to - Destinatario(s)
 * @param {string} config.subject - Asunto del correo
 * @param {string} config.text - Contenido en texto plano
 * @param {string} [config.html] - Contenido en HTML (opcional)
 * @param {Array} [config.attachments] - Adjuntos opcionales
 * @returns {Promise<Object>} Resultado del envío
 */
async function enviarCorreo(config) {
  try {
    // Crear el transportador SMTP
    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.password,
      },
    });
    // Verificar la conexión

    await transporter.verify();
    console.log("Conexión SMTP establecida correctamente");

    // Configurar el mensaje
    const mailOptions = {
      from: config.from,
      to: config.to,
      subject: config.subject,
      text: config.text,
      html: config.html,
      attachments: config.attachments,
    };

    // Enviar el correo
    const info = await transporter.sendMail(mailOptions);

    console.log("Correo enviado exitosamente");
    console.log("ID del mensaje:", info.messageId);

    return {
      success: true,
      messageId: info.messageId,
      response: info.response,
    };
  } catch (error) {
    console.error("Error al enviar el correo:", error.message);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Envía un correo de recuperación de contraseña
 * @param {string} emailDestino - Correo del usuario que recupera la contraseña
 * @param {string} frontendUrl - URL base del frontend (opcional, por defecto: http://localhost:3000)
 * @returns {Promise<Object>} Resultado del envío
 */
async function enviarCorreoRecuperacion(
  emailDestino,
  frontendUrl = "http://localhost:3000"
) {
  // Construir la URL de recuperación con el email como query param
  const urlRecuperacion = `${frontendUrl}/cambioContraseña.html?email=${encodeURIComponent(
    emailDestino
  )}`;

  // Crear el contenido del correo en texto plano
  const textoPlano = `
Hola,

Has solicitado recuperar tu contraseña.

Para cambiar tu contraseña, haz clic en el siguiente enlace:
${urlRecuperacion}

Si no solicitaste este cambio, ignora este correo.

Saludos,
El equipo de soporte
  `.trim();

  // Crear el contenido del correo en HTML
  const htmlContenido = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; line-height: 1.6; color: #333333; background-color: #f4f4f4;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f4f4f4;">
        <tr>
            <td style="padding: 20px 0;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: 0 auto; background-color: #ffffff; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background-color: #4CAF50; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: bold;">Recuperación de Contraseña</h1>
                        </td>
                    </tr>
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <p style="margin: 0 0 15px 0; font-size: 16px;">Hola,</p>
                            <p style="margin: 0 0 15px 0; font-size: 16px;">Has solicitado recuperar tu contraseña.</p>
                            <p style="margin: 0 0 25px 0; font-size: 16px;">Para cambiar tu contraseña, haz clic en el siguiente botón:</p>
                            
                            <!-- Button -->
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                <tr>
                                    <td style="text-align: center; padding: 10px 0 25px 0;">
                                        <a href="${urlRecuperacion}" style="display: inline-block; padding: 15px 40px; background-color: #4CAF50; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">Cambiar Contraseña</a>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="margin: 0 0 10px 0; font-size: 14px; color: #666666;">O copia y pega el siguiente enlace en tu navegador:</p>
                            <p style="margin: 0 0 25px 0; padding: 15px; background-color: #f0f0f0; border-radius: 5px; word-break: break-all; font-size: 14px;">
                                <a href="${urlRecuperacion}" style="color: #4CAF50; text-decoration: none;">${urlRecuperacion}</a>
                            </p>
                            
                            <p style="margin: 0 0 15px 0; font-size: 16px;"><strong>Si no solicitaste este cambio, ignora este correo.</strong></p>
                            <p style="margin: 0; font-size: 16px;">Saludos,<br>El equipo de UTMentor</p>
                        </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 20px 30px; text-align: center; border-top: 1px solid #eeeeee;">
                            <p style="margin: 0; font-size: 12px; color: #999999;">Este es un correo automático, por favor no responder.</p>
                            <p style="margin: 10px 0 0 0; font-size: 12px; color: #999999;">© 2025 UTMentor. Todos los derechos reservados.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
  `.trim();

  // Configuración del correo
  const resultado = await enviarCorreo({
    // Configuración del servidor SMTP (usa tus credenciales)
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    user: "aagl001003@gs.utm.mx",
    password: "odbduoikgmymevae",

    // Configuración del mensaje
    from: '"Soporte - Sistema" <aagl001003@gs.utm.mx>',
    to: emailDestino,
    subject: "Recuperación de Contraseña",
    text: textoPlano,
    html: htmlContenido,
  });

  return resultado;
}

// Ejemplo de uso de recuperación de contraseña
async function ejemploRecuperacion() {
  const emailUsuario = "lauraj.alvarezguevara@gmail.com";
  const urlFrontend = "http://localhost:3000"; // Cambia esto por la URL de tu frontend

  console.log(`Enviando correo de recuperación a: ${emailUsuario}`);

  const resultado = await enviarCorreoRecuperacion(emailUsuario, urlFrontend);

  if (resultado.success) {
    console.log("✓ Correo de recuperación enviado exitosamente");
    console.log("ID del mensaje:", resultado.messageId);
  } else {
    console.log("✗ Error al enviar correo:", resultado.error);
  }
}

// Exportar las funciones
export { enviarCorreo, enviarCorreoRecuperacion };

// Ejecutar el ejemplo de recuperación solo si se ejecuta directamente
// ejemploRecuperacion();
