# Discovery: UTMentor en Figma

## Objetivo

Trasladar la interfaz web de UTMentor a un archivo Figma editable, consistente y navegable, manteniendo los flujos visibles de la aplicación sin reproducir lógica de backend.

## Fuente analizada

- 10 páginas HTML: sitio público, autenticación, perfil público y paneles de asesor/asesorado.
- CSS por página con una identidad compartida, pero variaciones de color, tipografía y espaciado.
- JavaScript para navegación, filtros, carruseles, formularios, calendarios, favoritos, calificaciones y modales.
- Fotografías, avatares, logotipos e iconos locales en `UTMentor/imagenes`.
- Capturas de referencia en `imagenes`.

## Hallazgos

- La marca usa principalmente azul violeta `#5B68FF` y cian `#19C0FF`.
- La tipografía alterna entre Inter, Segoe UI y fuentes del sistema.
- Se repiten patrones de navegación, botones, campos, tarjetas, modales, barras laterales y estados.
- Los paneles privados contienen vistas internas que deben modelarse como pantallas o estados separados.
- Las funciones con API, autenticación, Stripe y carga de archivos solo pueden simularse en un prototipo Figma.
- Las imágenes de contenido deben mantenerse como recursos individuales; las capturas completas solo sirven de referencia visual.

## Alcance acordado

- Foundations, componentes reutilizables y variables.
- Pantallas públicas, autenticación, perfil público y paneles privados.
- Prototipo con navegación y estados representativos.
- Uniformización de color y tipografía sin cambiar la identidad de UTMentor.
- Vistas desktop y adaptaciones móviles principales.

