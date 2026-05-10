# Seguridad del frontend

CODA no tiene backend, base de datos ni autenticación, pero sigue siendo una aplicación web que carga JavaScript, audio y contenido HTML local. La superficie principal de riesgo está en el navegador: inyección de scripts, dependencias externas, preferencias manipuladas y permisos no necesarios.

## Política de contenido

`index.html` declara una política CSP mediante `<meta http-equiv="Content-Security-Policy">`. La política permite scripts, imágenes, audio y conexiones solo desde el propio origen. La excepción externa queda limitada a hojas de estilo de Google Fonts y archivos de fuente de Google Fonts, usados para Open Sans y Material Icons. Se mantiene `'unsafe-inline'` únicamente en `style-src` porque jQuery UI aplica estilos dinámicos sobre diálogos y componentes; `script-src` no permite scripts inline ni scripts externos.

La política recomendada para un servidor estático que permita cabeceras HTTP equivalentes es:

```text
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data:; font-src 'self' data: https://fonts.gstatic.com; media-src 'self' data: blob:; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=(), midi=()
```

GitHub Pages no permite configurar todas estas cabeceras directamente. En ese caso, conservar la CSP de `index.html` ya aporta una defensa útil, aunque `frame-ancestors` solo funciona como cabecera HTTP y debe configurarse en el proveedor de hosting cuando exista esa posibilidad.

## Permisos del navegador

El playback actual usa Web Audio y soundfonts locales. No necesita cámara, micrófono, geolocalización, pagos, USB ni Web MIDI. Por ese motivo, la cabecera recomendada desactiva esos permisos. Si en el futuro se introduce una integración Web MIDI real para enviar notas a dispositivos externos, habrá que revisar `Permissions-Policy` y documentar ese cambio de alcance.

## Preferencias locales

La cookie funcional `coda_preferences` solo debe guardar valores ligeros de interfaz: idioma, notación, tema, volumen, tónica, escala, formato e instrumento sonoro. `js/services/preferences-service.js` centraliza la validación para que una cookie manipulada no pueda forzar índices fuera de rango, valores desconocidos o rutas de soundfont inesperadas.

## HTML confiable

El contenido HTML largo de bienvenida, pie y novedades procede de módulos locales versionados (`js/content/` y `js/i18n/`). Cuando un controlador inserta HTML, debe hacerlo con funciones marcadas como HTML confiable y revisado. El texto que venga de interacción de usuario debe insertarse siempre como texto, no como HTML.
