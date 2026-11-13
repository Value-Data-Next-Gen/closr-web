/* Identificadores de medición y publicidad.
 *
 * Vacíos = el tag no se carga y no se envía ningún hit. Así nace el repo:
 * al 11-sep-2026 no existe ninguna cuenta de anuncios de closr.
 *
 * Van en un archivo versionado y no en variables de entorno porque
 * `netlify.toml` publica el sitio SIN paso de build (`publish = "."`), así que
 * no hay momento en que alguien pueda sustituir una variable. No es una fuga:
 * un identificador de píxel es público por definición, viaja en el HTML de
 * cualquier sitio que lo use y no autoriza nada por sí solo.
 *
 * NUNCA poner acá la propiedad GA4 de valuedata.cl: mezclaría los datos de dos
 * negocios y GA4 no permite separar hits ya ingeridos.
 *
 * ADS_LEAD_LABEL es la etiqueta de la acción de conversión del LEAD de
 * contacto de esta landing — no la del registro de la app (esa vive en
 * frontend/.env.example como VITE_ADS_SIGNUP_LABEL). Son dos acciones de
 * conversión distintas en Google Ads a propósito: fusionarlas dejaría a
 * Google Ads optimizando hacia la más barata de las dos, que es la que vale
 * menos.
 *
 * Ver docs/guia-cuentas-publicidad.md en el repo del CRM para qué crear.
 */
window.CLOSR_CONFIG = {
  // GA4: cuenta "closr" > propiedad "closr.cl" > flujo web "closr.cl web" (ID de flujo 16337698783),
  // creada el 13-nov-2026 con gonzalo@valuedata.cl. Hora de Chile, CLP.
  GA_ID: 'G-54CJCSH83N',
  ADS_ID: '',
  ADS_LEAD_LABEL: '',
  META_PIXEL_ID: '',
  TIKTOK_PIXEL_ID: '',
};
