# Impact analysis: UTMentor en Figma

## Impacto en producto

- Centraliza la experiencia visual en un archivo editable y reutilizable.
- Facilita revisar navegación, jerarquía, consistencia y estados antes de futuros cambios de código.
- Hace explícitos los flujos de asesor y asesorado.

## Sistema visual unificado

- Fuente primaria: Inter.
- Marca: `#5B68FF` y `#19C0FF`.
- Texto: `#0F172A`; texto secundario: `#475569`.
- Superficies: blanco y `#F6F8FB`.
- Estados: éxito `#10B981`, peligro `#E11D48`, advertencia `#F59E0B`.
- Radios, espaciado, sombras y tamaños tipográficos se modelan como variables/estilos.

## Imágenes

- Fotografías y avatares se reutilizan como fills individuales con recorte consistente.
- Logotipos e iconos se conservan como assets editables o componentes reutilizables cuando sea viable.
- Ninguna pantalla final se entrega como captura plana.

## Riesgos y límites

- Datos dependientes de API se representarán con contenido de ejemplo.
- Stripe, autenticación, persistencia, subida de imágenes y operaciones destructivas serán simulaciones.
- Variaciones actuales de CSS se normalizarán; Figma representará una versión coherente, no todos los conflictos de cascada.
- El prototipo cubre estados relevantes, no todas las combinaciones posibles de datos o errores.

## Impacto en repositorio

- No se modifica la aplicación productiva.
- Solo se agrega documentación de iniciativa dentro de `ai-context`.

