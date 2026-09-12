/* Consentimiento para los píxeles publicitarios.
 *
 * Ley 21.719, vigente desde el 1-dic-2026. Se implementa antes porque
 * retrofitear la compuerta con campañas vivas obliga a desplegar bajo presión.
 *
 * Lo que se apaga al rechazar es la señal que se le manda a Google, Meta y
 * TikTok. La atribución propia NO depende de esto: no usa cookies de terceros
 * ni comparte datos con nadie, y es la que alimenta el reporte de adquisición.
 * En la práctica, aunque todo el mundo rechace, el reporte sigue completo.
 */
(function () {
  'use strict';

  var CLAVE = 'closr_consent_v1';
  var RECHAZO_VENCE_EN_DIAS = 180;

  function leer() {
    try {
      var crudo = localStorage.getItem(CLAVE);
      if (!crudo) return null;
      var dato = JSON.parse(crudo);
      if (dato.acepta) return true;
      // Un rechazo se respeta medio año y después se vuelve a preguntar.
      var dias = (Date.now() - Date.parse(dato.fecha)) / 86400000;
      return dias > RECHAZO_VENCE_EN_DIAS ? null : false;
    } catch (e) {
      return null;
    }
  }

  function guardar(acepta) {
    try {
      localStorage.setItem(CLAVE, JSON.stringify({
        acepta: acepta, fecha: new Date().toISOString(),
      }));
    } catch (e) { /* modo privado */ }
  }

  var decision = leer();

  function decidir(acepta) {
    decision = acepta;
    guardar(acepta);
    quitarBanner();
    if (acepta && window.ClosrTags) window.ClosrTags.cargar();
  }

  function quitarBanner() {
    var b = document.getElementById('closrConsent');
    if (b && b.parentNode) b.parentNode.removeChild(b);
  }

  function pintarBanner() {
    if (decision !== null) return;
    var b = document.createElement('div');
    b.id = 'closrConsent';
    b.className = 'consent-bar';
    b.setAttribute('role', 'region');
    b.setAttribute('aria-label', 'Consentimiento de cookies');
    b.innerHTML =
      '<p>Usamos cookies de medición y publicidad para saber qué campañas ' +
      'funcionan. Puedes rechazarlas sin perder ninguna función. ' +
      '<a href="/privacidad">Más información</a>.</p>' +
      '<div class="consent-actions">' +
      '<button type="button" class="btn btn-ghost btn-sm" id="closrConsentNo">Rechazar</button>' +
      '<button type="button" class="btn btn-primary btn-sm" id="closrConsentSi">Aceptar</button>' +
      '</div>';
    document.body.appendChild(b);
    document.getElementById('closrConsentNo').addEventListener('click', function () { decidir(false); });
    document.getElementById('closrConsentSi').addEventListener('click', function () { decidir(true); });
  }

  window.ClosrConsent = { valor: function () { return decision; } };

  function arrancar() {
    pintarBanner();
    if (decision === true && window.ClosrTags) window.ClosrTags.cargar();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', arrancar);
  } else {
    arrancar();
  }
})();
