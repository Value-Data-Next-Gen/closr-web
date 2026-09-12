/* Primer contacto: de qué campaña vino esta persona.
 *
 * Se guarda la PRIMERA campaña que la trajo y no se pisa nunca. El último
 * contacto le daría el crédito al retargeting, que es barato y llega cuando el
 * trabajo de generar la demanda ya está hecho.
 *
 * closr.cl y app.closr.cl son orígenes distintos y no comparten almacenamiento,
 * así que el dato viaja al registro por query string.
 */
(function () {
  'use strict';

  var CLAVE = 'closr_attr_v1';
  var VENCE_EN_DIAS = 90;
  var LARGO = 255;
  var LARGO_REFERRER = 500;

  var CAMPOS = [
    ['utm_source', 'utm_source'],
    ['utm_medium', 'utm_medium'],
    ['utm_campaign', 'utm_campaign'],
    ['utm_term', 'utm_term'],
    ['utm_content', 'utm_content'],
    ['gclid', 'gclid'],
    ['fbclid', 'fbclid'],
    ['ttclid', 'ttclid'],
    ['referrer', 'cl_ref'],
    ['landing_path', 'cl_lp'],
    ['first_seen_at', 'cl_fs'],
  ];

  function recortar(valor, campo) {
    if (typeof valor !== 'string') return '';
    var largo = campo === 'referrer' ? LARGO_REFERRER : LARGO;
    return valor.trim().slice(0, largo);
  }

  function leerAlmacen() {
    try {
      var crudo = localStorage.getItem(CLAVE);
      if (!crudo) return null;
      var dato = JSON.parse(crudo);
      // Sin vencimiento, una campaña de enero cobraría un registro de diciembre.
      var nacido = Date.parse(dato.first_seen_at);
      if (!nacido) return null;
      var dias = (Date.now() - nacido) / 86400000;
      if (dias > VENCE_EN_DIAS || dias < 0) return null;
      return dato;
    } catch (e) {
      return null;
    }
  }

  function capturar() {
    var params = new URLSearchParams(window.location.search);
    var dato = {};
    var hayAlgo = false;

    for (var i = 0; i < CAMPOS.length; i++) {
      var campo = CAMPOS[i][0];
      if (campo === 'referrer' || campo === 'landing_path' || campo === 'first_seen_at') continue;
      var valor = recortar(params.get(campo), campo);
      if (valor) { dato[campo] = valor; hayAlgo = true; }
    }

    // Un referrer del propio sitio no es un origen: es navegación interna.
    var ref = document.referrer || '';
    if (ref && ref.indexOf(window.location.host) === -1) {
      dato.referrer = recortar(ref, 'referrer');
      hayAlgo = true;
    }

    if (!hayAlgo) return null;

    dato.landing_path = recortar(window.location.pathname, 'landing_path');
    dato.first_seen_at = new Date().toISOString();
    return dato;
  }

  function guardar(dato) {
    try { localStorage.setItem(CLAVE, JSON.stringify(dato)); } catch (e) { /* modo privado */ }
  }

  // Primer contacto: lo guardado manda. Solo se escribe si no había nada.
  var origen = leerAlmacen();
  if (!origen) {
    origen = capturar();
    if (origen) guardar(origen);
  }

  function aQueryString(dato) {
    var params = new URLSearchParams();
    for (var i = 0; i < CAMPOS.length; i++) {
      var campo = CAMPOS[i][0];
      var param = CAMPOS[i][1];
      if (dato[campo]) params.set(param, dato[campo]);
    }
    var consentimiento = window.ClosrConsent && window.ClosrConsent.valor();
    if (consentimiento !== null && consentimiento !== undefined) {
      params.set('cl_consent', consentimiento ? '1' : '0');
    }
    return params.toString();
  }

  // Se llama tanto al cargar la página como cuando el usuario decide sobre
  // el consentimiento (ver consent.js), para que cl_consent quede en el link
  // sin esperar a una segunda visita. Idempotente: cada link recuerda su
  // href original en un data-attribute y siempre reconstruye desde ahí, así
  // una segunda llamada no duplica parámetros ni deja un cl_consent viejo.
  function decorarEnlaces() {
    if (!origen && !(window.ClosrConsent && window.ClosrConsent.valor() !== null)) return;
    var qs = aQueryString(origen || {});
    if (!qs) return;
    var enlaces = document.querySelectorAll('a[href*="app.closr.cl/register"]');
    for (var i = 0; i < enlaces.length; i++) {
      var el = enlaces[i];
      var base = el.getAttribute('data-closr-base-href');
      if (base === null) {
        base = el.getAttribute('href');
        el.setAttribute('data-closr-base-href', base);
      }
      el.setAttribute('href', base + (base.indexOf('?') === -1 ? '?' : '&') + qs);
    }
  }

  function rellenarFormulario() {
    if (!origen) return;
    var form = document.getElementById('ctaForm');
    if (!form) return;
    for (var i = 0; i < CAMPOS.length; i++) {
      var campo = CAMPOS[i][0];
      if (!origen[campo]) continue;
      var input = document.createElement('input');
      input.type = 'hidden';
      input.name = campo;
      input.value = origen[campo];
      form.appendChild(input);
    }
  }

  window.ClosrAttr = { leer: function () { return origen; }, decorarEnlaces: decorarEnlaces };

  // Este script va con `defer`, asi que para cuando se ejecuta el documento
  // ya esta parseado y readyState es 'interactive', no 'loading'. El chequeo
  // `=== 'loading'` nunca es cierto en ejecucion diferida, asi que el
  // addEventListener('DOMContentLoaded', ...) era codigo muerto: siempre se
  // tomaba la rama inmediata, en el mismo orden en que los scripts se van
  // ejecutando. Solo 'complete' garantiza que DOMContentLoaded ya paso y no
  // va a volver a disparar; para cualquier otro valor ('loading' o
  // 'interactive') hay que esperarlo con el listener.
  if (document.readyState === 'complete') {
    decorarEnlaces(); rellenarFormulario();
  } else {
    document.addEventListener('DOMContentLoaded', function () {
      decorarEnlaces(); rellenarFormulario();
    });
  }
})();
