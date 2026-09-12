/* GA4, Google Ads, Meta Pixel y TikTok Pixel.
 *
 * Con el identificador vacío —que es como nace el repo— no se carga nada y no
 * se envía ningún hit. Solo cargan con consentimiento explícito.
 */
(function () {
  'use strict';

  var cargado = false;

  function id(nombre) {
    var cfg = window.CLOSR_CONFIG || {};
    var valor = (cfg[nombre] || '').trim();
    if (!valor || valor.indexOf('XXXX') !== -1) return null;
    return valor;
  }

  function inyectar(src) {
    var s = document.createElement('script');
    s.async = true;
    s.src = src;
    document.head.appendChild(s);
  }

  // Base code oficial de Meta Pixel (developers.facebook.com/docs/meta-pixel/get-started),
  // adaptado solo para tomar el ID desde window.CLOSR_CONFIG en vez de un literal.
  // El stub no es decorativo: fbevents.js, una vez cargado, engancha su
  // implementación real sobre este MISMO objeto fbq (via callMethod) y drena
  // la cola encolada mientras tanto. Sin callMethod/push/loaded/version tal
  // como los deja el vendor, el script real no reconoce el stub y las
  // llamadas quedan encoladas para siempre.
  function iniciarMeta(pixelId) {
    !function (f, b, e, v, n, t, s) {
      if (f.fbq) return;
      n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n; n.loaded = true; n.version = '2.0'; n.queue = [];
      t = b.createElement(e); t.async = true; t.src = v;
      s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
    }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    window.fbq('init', pixelId);
    window.fbq('track', 'PageView');
  }

  // Base code oficial de TikTok Pixel (business-api.tiktok.com, seccion Pixel),
  // adaptado solo para tomar el ID desde window.CLOSR_CONFIG en vez de un
  // literal. Sin este stub, window.ttq no existe hasta que el script real
  // termina de cargar, y cualquier ttq.track() disparado antes de eso
  // (tipico: el conversion de generate_lead al enviar el formulario) se
  // pierde en silencio.
  function iniciarTiktok(pixelId) {
    !function (w, d, t) {
      w.TiktokAnalyticsObject = t;
      var ttq = w[t] = w[t] || [];
      ttq.methods = ['page', 'track', 'identify', 'instances', 'debug', 'on', 'off', 'once', 'ready', 'alias', 'group', 'enableCookie', 'disableCookie'];
      ttq.setAndDefer = function (t, e) {
        t[e] = function () { t.push([e].concat(Array.prototype.slice.call(arguments, 0))); };
      };
      for (var i = 0; i < ttq.methods.length; i++) ttq.setAndDefer(ttq, ttq.methods[i]);
      ttq.instance = function (t) {
        var e = ttq._i[t] || [];
        for (var n = 0; n < ttq.methods.length; n++) ttq.setAndDefer(e, ttq.methods[n]);
        return e;
      };
      ttq.load = function (e, n) {
        var i = 'https://analytics.tiktok.com/i18n/pixel/events.js';
        ttq._i = ttq._i || {}; ttq._i[e] = []; ttq._i[e]._u = i;
        ttq._t = ttq._t || {}; ttq._t[e] = +new Date();
        ttq._o = ttq._o || {}; ttq._o[e] = n || {};
        var o = document.createElement('script');
        o.type = 'text/javascript'; o.async = true;
        o.src = i + '?sdkid=' + e + '&lib=' + t;
        var a = document.getElementsByTagName('script')[0];
        a.parentNode.insertBefore(o, a);
      };
    }(window, document, 'ttq');
    window.ttq.load(pixelId);
    window.ttq.page();
  }

  function cargar() {
    if (cargado) return;
    if (!window.ClosrConsent || window.ClosrConsent.valor() !== true) return;

    var ga = id('GA_ID'), ads = id('ADS_ID');
    var meta = id('META_PIXEL_ID'), tiktok = id('TIKTOK_PIXEL_ID');
    if (!ga && !ads && !meta && !tiktok) return;
    cargado = true;

    if (ga || ads) {
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () { window.dataLayer.push(arguments); };
      window.gtag('js', new Date());
      if (ga) window.gtag('config', ga);
      if (ads) window.gtag('config', ads);
      inyectar('https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(ga || ads));
    }

    if (meta) iniciarMeta(meta);

    if (tiktok) iniciarTiktok(tiktok);
  }

  function conversion(evento) {
    if (!cargado) return;
    var ga = id('GA_ID'), ads = id('ADS_ID'), label = id('ADS_LABEL');
    if (ga && window.gtag) window.gtag('event', evento);
    if (ads && label && window.gtag) {
      window.gtag('event', 'conversion', { send_to: ads + '/' + label });
    }
    if (id('META_PIXEL_ID') && window.fbq) {
      window.fbq('track', evento === 'sign_up' ? 'CompleteRegistration' : 'Lead');
    }
    if (id('TIKTOK_PIXEL_ID') && window.ttq) {
      window.ttq.track(evento === 'sign_up' ? 'CompleteRegistration' : 'SubmitForm');
    }
  }

  window.ClosrTags = { cargar: cargar, conversion: conversion };
})();
