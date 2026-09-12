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

    if (meta) {
      window.fbq = window.fbq || function () { (window.fbq.queue = window.fbq.queue || []).push(arguments); };
      inyectar('https://connect.facebook.net/en_US/fbevents.js');
      window.fbq('init', meta);
      window.fbq('track', 'PageView');
    }

    if (tiktok) {
      inyectar('https://analytics.tiktok.com/i18n/pixel/events.js?sdkid=' + encodeURIComponent(tiktok));
    }
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
