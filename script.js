(() => {
  'use strict';

  const HEADER_OFFSET = 76;

  // ---------- Smooth scroll for anchors ----------
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const id = link.getAttribute('href');
      if (id.length <= 1) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  // ---------- Scroll progress bar + header state ----------
  const progressBar = document.getElementById('scrollProgress');
  const header = document.getElementById('siteHeader');
  let ticking = false;

  const onScroll = () => {
    const scrollTop = window.scrollY;
    const total = document.documentElement.scrollHeight - window.innerHeight;
    if (progressBar && total > 0) {
      progressBar.style.width = ((scrollTop / total) * 100) + '%';
    }
    if (header) {
      header.classList.toggle('scrolled', scrollTop > 10);
    }
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(onScroll);
      ticking = true;
    }
  }, { passive: true });

  // ---------- Reveal on scroll (IntersectionObserver) ----------
  if ('IntersectionObserver' in window) {
    const reveal = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          reveal.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

    document.querySelectorAll('.reveal').forEach(el => reveal.observe(el));
  } else {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('is-visible'));
  }

  // ---------- Animated counters (supports decimals via data-decimal) ----------
  const animateCounter = (el) => {
    const target = parseFloat(el.dataset.counter);
    if (isNaN(target)) return;
    const decimals = parseInt(el.dataset.decimal || '0', 10);
    const duration = 1500;
    const start = performance.now();
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const val = target * eased;
      el.textContent = decimals > 0 ? val.toFixed(decimals) : Math.round(val);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  if ('IntersectionObserver' in window) {
    const counterObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    document.querySelectorAll('[data-counter]').forEach(el => counterObs.observe(el));
  }

  // ---------- FAQ accordion (close others on open) ----------
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    item.addEventListener('toggle', () => {
      if (item.open) {
        faqItems.forEach(other => {
          if (other !== item && other.open) other.open = false;
        });
      }
    });
  });

  // ---------- Live chat demo ----------
  const demoBody = document.getElementById('demoBody');
  const demoSticker = document.getElementById('demoSticker');
  const replayBtn = document.getElementById('replayDemo');

  const SCRIPT = [
    { side: 'in',  ai: false, time: '23:47', text: 'Hola! Tienen el polerón rojo talla M?', delay: 700 },
    { side: 'out', ai: true,  time: '23:47', text: '¡Sí! Queda 1 en stock. ¿Te lo aparto hasta mañana?', delay: 1400, typingMs: 1300 },
    { side: 'in',  ai: false, time: '23:48', text: 'Sí porfa 🙏', delay: 1500 },
    { side: 'out', ai: true,  time: '23:48', text: 'Apartado ✓ Te espero mañana 9 AM. ¿Pago en local o transferencia?', delay: 1300, typingMs: 1100 },
    { side: 'in',  ai: false, time: '23:49', text: 'Transferencia, gracias!', delay: 1400 },
    { side: 'out', ai: true,  time: '23:49', text: 'Te enviamos los datos. Reserva: $24.990 confirmada ✅', delay: 1200, typingMs: 1000 },
  ];

  let demoTimers = [];
  const clearDemo = () => {
    demoTimers.forEach(t => clearTimeout(t));
    demoTimers = [];
    if (demoBody) {
      const datePill = demoBody.querySelector('.demo-date-pill');
      demoBody.innerHTML = '';
      if (datePill) demoBody.appendChild(datePill);
    }
    if (demoSticker) demoSticker.classList.remove('show');
  };

  const buildMsg = ({ side, ai, time, text }) => {
    const wrap = document.createElement('div');
    wrap.className = `demo-msg ${side}`;
    const bubble = document.createElement('div');
    bubble.className = 'demo-bubble';
    if (ai) {
      const tag = document.createElement('span');
      tag.className = 'demo-ia-tag';
      tag.textContent = 'IA';
      bubble.appendChild(tag);
    }
    bubble.appendChild(document.createTextNode(text + ' '));
    const t = document.createElement('span');
    t.className = 'demo-time';
    t.textContent = time;
    bubble.appendChild(t);
    wrap.appendChild(bubble);
    return wrap;
  };

  const buildTyping = () => {
    const t = document.createElement('div');
    t.className = 'demo-typing';
    t.dataset.role = 'typing';
    t.innerHTML = '<span></span><span></span><span></span>';
    return t;
  };

  const playDemo = () => {
    if (!demoBody) return;
    clearDemo();
    let elapsed = 400;
    SCRIPT.forEach((line, i) => {
      if (line.ai && line.typingMs) {
        const startTyping = elapsed;
        const endTyping = elapsed + line.typingMs;
        demoTimers.push(setTimeout(() => {
          const typing = buildTyping();
          demoBody.appendChild(typing);
          requestAnimationFrame(() => typing.classList.add('show'));
          demoBody.scrollTop = demoBody.scrollHeight;
        }, startTyping));
        demoTimers.push(setTimeout(() => {
          const typing = demoBody.querySelector('[data-role="typing"]');
          if (typing) typing.remove();
        }, endTyping));
        elapsed = endTyping;
      }
      elapsed += line.delay;
      demoTimers.push(setTimeout(() => {
        const msg = buildMsg(line);
        demoBody.appendChild(msg);
        requestAnimationFrame(() => msg.classList.add('show'));
        demoBody.scrollTop = demoBody.scrollHeight;
        if (i === SCRIPT.length - 1 && demoSticker) {
          demoTimers.push(setTimeout(() => demoSticker.classList.add('show'), 700));
        }
      }, elapsed));
    });
  };

  if (demoBody && 'IntersectionObserver' in window) {
    const demoObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          playDemo();
          demoObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    demoObs.observe(demoBody);
  }

  if (replayBtn) replayBtn.addEventListener('click', playDemo);

  // ---------- Netlify Forms — AJAX submit ----------
  const ctaForm = document.getElementById('ctaForm');
  const ctaSuccess = document.getElementById('ctaSuccess');
  const ctaError = document.getElementById('ctaError');
  const ctaSubmitBtn = document.getElementById('ctaSubmitBtn');

  if (ctaForm) {
    ctaForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      ctaSuccess?.classList.remove('show');
      ctaError?.classList.remove('show');
      ctaSubmitBtn?.classList.add('loading');
      ctaSubmitBtn?.setAttribute('disabled', 'true');

      try {
        const formData = new FormData(ctaForm);
        // Netlify expects URL-encoded body
        const body = new URLSearchParams(formData).toString();

        const res = await fetch(ctaForm.getAttribute('action') || '/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body,
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        ctaSuccess?.classList.add('show');
        ctaForm.reset();
        if (window.ClosrTags) window.ClosrTags.conversion('generate_lead');
      } catch (err) {
        console.warn('Form submit failed:', err);
        ctaError?.classList.add('show');
      } finally {
        ctaSubmitBtn?.classList.remove('loading');
        ctaSubmitBtn?.removeAttribute('disabled');
      }
    });
  }

  // ---------- Hero carousel ----------
  const carousel = document.getElementById('heroCarousel');
  if (carousel) {
    const slides = carousel.querySelectorAll('.slide');
    const dots   = carousel.querySelectorAll('.carousel-dots .dot');
    const tagEl  = document.getElementById('slideTag');
    const autoplay = parseInt(carousel.dataset.autoplay, 10) || 4500;
    let idx = 0;
    let intervalId = null;

    const goTo = (next) => {
      const newIdx = ((next % slides.length) + slides.length) % slides.length;
      if (newIdx === idx) return;
      slides[idx].classList.remove('active');
      dots[idx]?.classList.remove('active');
      idx = newIdx;
      slides[idx].classList.add('active');
      dots[idx]?.classList.add('active');
      if (tagEl) {
        tagEl.style.opacity = '0';
        setTimeout(() => {
          tagEl.textContent = slides[idx].dataset.tag || '';
          tagEl.style.opacity = '1';
        }, 200);
      }
    };

    const start = () => {
      stop();
      intervalId = setInterval(() => goTo(idx + 1), autoplay);
    };
    const stop = () => {
      if (intervalId) clearInterval(intervalId);
      intervalId = null;
    };

    dots.forEach((d, i) => {
      d.addEventListener('click', () => {
        stop();
        goTo(i);
        start();
      });
    });

    // Pause on hover (desktop)
    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);

    // Pause when tab is hidden
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stop(); else start();
    });

    // Only autoplay when visible
    if ('IntersectionObserver' in window) {
      const visObs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) start();
          else stop();
        });
      }, { threshold: 0.25 });
      visObs.observe(carousel);
    } else {
      start();
    }
  }
})();

// ---------- Hero: de noche sin closr, de día con closr (v2d, 13-nov-2026) ----------
// Dos actos que se alternan solos y también con los botones de #phaseSwitch:
//  - noche: llegan mensajes por WhatsApp e Instagram y quedan sin responder.
//  - día: abres en la mañana y la IA ya respondió, creó una tarea, pasó a una persona
//    lo que no le corresponde decidir y cerró una venta.
// La sección #hero lleva data-phase="noche|dia" y el CSS hace el fundido entre las dos fotos.
// Con movimiento reducido no hay animación: se muestra el estado final de cada acto.
// Sin JS queda el estado estático que trae el HTML.
(() => {
  const hero = document.getElementById('hero');
  const list = document.getElementById('liveList');
  const clock = document.getElementById('liveClock');
  const title = document.getElementById('liveTitle');
  const box = document.getElementById('liveInbox');
  const sw = document.getElementById('phaseSwitch');
  if (!hero || !list || !clock || !box) return;
  const reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  const ICONS = 'images/icons-v1.svg';
  const CHANNELS = { wa: { icon: 'i-wa', label: 'WhatsApp' }, ig: { icon: 'i-ig', label: 'Instagram' } };
  const CHATS = [
    { ch: 'wa', who: 'Carolina', at: '23:47',
      msg: 'hola!! el polerón rojo en M lo tienen? es para regalo, si no le queda lo puedo cambiar?',
      reply: '¡Hola Carolina! Sí, queda uno en M. Tienes 30 días para cambiarlo con la boleta y te lo envolvemos para regalo sin costo. ¿Te lo aparto?' },
    { ch: 'ig', who: '@vale.mendez', at: '23:49',
      msg: 'vi las zapatillas blancas del último post, hay en 38? cuánto sale el envío a Temuco y cuándo llega?',
      reply: 'Hola Vale, sí hay en 38 a $39.990. El envío a Temuco cuesta $4.500 y llega en 2 a 4 días hábiles. ¿Te mando el link de pago?' },
    { ch: 'wa', who: 'Javier', at: '23:52',
      msg: 'necesito 12 poleras con el logo bordado para mi equipo pero tienen que estar antes del viernes, alcanzan?',
      reply: 'Hola Javier. El bordado toma 3 días hábiles, así que si confirmas hoy llegamos al viernes. Le pido la cotización al encargado y te escribe a primera hora.' },
    { ch: 'ig', who: '@pedro.ferre', at: '00:14', handoff: true,
      msg: 'en otra tienda me dejan el mismo modelo 15% más barato, me lo igualan?',
      reply: 'Entiendo, Pedro. El precio no lo defino yo: le paso tu consulta a una persona del equipo para que te responda hoy mismo.' },
  ];
  const ACTS = {
    noche: {
      title: 'Tu WhatsApp, sin closr',
      clock: CHATS[0].at,
      max: 4,
      steps: [
        { kind: 'wait', chat: 0 }, { kind: 'wait', chat: 1 }, { kind: 'wait', chat: 2 }, { kind: 'wait', chat: 3 },
        { kind: 'lost', title: '4 clientes sin respuesta', text: 'Los vas a ver mañana. Para entonces, alguno ya le compró a otro.' },
      ],
    },
    dia: {
      title: 'Bandeja de closr',
      clock: '09:00',
      max: 3,
      steps: [
        { kind: 'chat', chat: 0 }, { kind: 'chat', chat: 1 }, { kind: 'chat', chat: 2 },
        { kind: 'task', title: 'Tarea creada por la IA', text: 'Cotizar 12 poleras bordadas para Javier antes de las 9:30' },
        { kind: 'chat', chat: 3 },
        { kind: 'won', title: 'Venta cerrada', text: 'Carolina · $24.990 · retira hoy a las 10:00' },
      ],
    },
  };

  let timers = [];
  let running = false;
  let phase = 'noche';
  let step = 0;

  const later = (fn, ms) => { timers.push(setTimeout(fn, ms)); };
  const clear = () => { timers.forEach(clearTimeout); timers = []; };
  const icon = (name) => {
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('width', '14');
    svg.setAttribute('height', '14');
    svg.setAttribute('aria-hidden', 'true');
    const use = document.createElementNS(ns, 'use');
    use.setAttribute('href', ICONS + '#' + name);
    svg.appendChild(use);
    return svg;
  };
  const el = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text) n.textContent = text;
    return n;
  };
  const push = (card) => {
    list.prepend(card);
    while (list.children.length > ACTS[phase].max) list.lastElementChild.remove();
  };

  const setPhase = (p) => {
    phase = p;
    hero.dataset.phase = p;
    if (title) title.textContent = ACTS[p].title;
    clock.textContent = ACTS[p].clock;
    if (sw) {
      sw.querySelectorAll('.phase-btn').forEach((b) => {
        b.setAttribute('aria-pressed', String(b.dataset.phase === p));
      });
    }
  };

  // Tarjeta de conversación: hora, quién, canal y el mensaje del cliente.
  const chatCard = (c) => {
    const chan = CHANNELS[c.ch] || CHANNELS.wa;
    const card = el('div', 'live-card live-' + c.ch);
    const meta = el('div', 'live-meta');
    meta.append(icon(chan.icon), document.createTextNode(' ' + c.at + ' · ' + c.who + ' · ' + chan.label));
    card.append(meta, el('p', 'live-in', c.msg));
    return card;
  };
  const addReply = (card, c) => {
    const out = el('p', 'live-out');
    out.append(el('span', 'ai-tag', 'IA'), document.createTextNode(c.reply));
    card.append(out);
  };
  const addDone = (card, c) => {
    card.append(c.handoff
      ? el('span', 'live-done live-handoff', 'Pasado a una persona del equipo')
      : el('span', 'live-done', 'Respondido por la IA'));
  };
  const noteCard = (s) => {
    const card = el('div', 'live-card live-' + s.kind);
    const meta = el('div', 'live-meta');
    const ic = { won: 't-check', task: 't-clock', lost: 't-alert-circle' }[s.kind];
    meta.append(icon(ic), document.createTextNode(' ' + s.title));
    card.append(meta, el('p', 'live-strong', s.text));
    return card;
  };
  const waitCard = (c) => {
    const card = chatCard(c);
    const pending = el('span', 'live-pending');
    pending.append(icon('t-clock'), document.createTextNode(' Sin responder'));
    card.append(pending);
    return card;
  };

  // Estado final de un acto, sin animación.
  const renderStatic = (p) => {
    clear();
    list.innerHTML = '';
    setPhase(p);
    ACTS[p].steps.forEach((s) => {
      if (s.kind === 'wait') {
        push(waitCard(CHATS[s.chat]));
      } else if (s.kind === 'chat') {
        const card = chatCard(CHATS[s.chat]);
        addReply(card, CHATS[s.chat]);
        addDone(card, CHATS[s.chat]);
        push(card);
      } else {
        push(noteCard(s));
      }
    });
    if (p === 'noche') clock.textContent = CHATS[CHATS.length - 1].at;
  };

  const next = () => {
    const act = ACTS[phase];
    const s = act.steps[step];
    let wait;

    if (s.kind === 'wait') {
      const c = CHATS[s.chat];
      clock.textContent = c.at;
      push(waitCard(c));
      wait = 1900;
    } else if (s.kind === 'chat') {
      const c = CHATS[s.chat];
      const card = chatCard(c);
      push(card);
      later(() => {
        addReply(card, c);
        later(() => addDone(card, c), 350);
      }, 800);
      wait = 4000;
    } else {
      push(noteCard(s));
      wait = s.kind === 'won' ? 4600 : s.kind === 'lost' ? 4200 : 2400;
    }

    step += 1;
    if (step >= act.steps.length) {
      later(() => {
        Array.from(list.children).forEach((c) => c.classList.add('is-leaving'));
        later(() => playAct(phase === 'noche' ? 'dia' : 'noche'), 450);
      }, wait);
    } else {
      later(next, wait);
    }
  };

  // Empieza un acto desde cero. El de día espera un poco para que se vea el fundido de la foto.
  const playAct = (p) => {
    clear();
    list.innerHTML = '';
    setPhase(p);
    step = 0;
    later(next, p === 'dia' ? 1100 : 400);
  };

  if (sw) {
    sw.addEventListener('click', (e) => {
      const b = e.target.closest('.phase-btn');
      if (!b || !ACTS[b.dataset.phase]) return;
      if (reduce) { renderStatic(b.dataset.phase); return; }
      running = true;
      playAct(b.dataset.phase);
    });
  }

  if (reduce) {
    renderStatic('dia');
    return;
  }

  const start = () => {
    if (running) return;
    running = true;
    playAct('noche');
  };
  // Mientras la bandeja no está en pantalla, muestra el final del acto de noche (coincide con la foto).
  renderStatic('noche');
  const stop = () => { clear(); running = false; };

  // Corre solo mientras la bandeja está en pantalla y la pestaña visible.
  let inView = !('IntersectionObserver' in window);
  if (!inView) {
    new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        inView = e.isIntersecting;
        if (inView && !document.hidden) start(); else stop();
      });
    }, { threshold: 0.25 }).observe(box);
  } else {
    start();
  }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else if (inView) start();
  });
})();

// ---------- Eventos de GA4 que no son conversiones (v2c, 13-nov-2026) ----------
// Solo se envían si GA4 ya cargó, o sea si el visitante aceptó cookies (tags.js define window.gtag).
// No pasan por ClosrTags.conversion(): esa función también dispara la conversión de lead
// de Google Ads, Meta y TikTok, y estos clics no son leads.
(() => {
  const ga = (nombre, params) => {
    if (typeof window.gtag === 'function' && window.CLOSR_CONFIG && window.CLOSR_CONFIG.GA_ID) {
      window.gtag('event', nombre, Object.assign({ transport_type: 'beacon' }, params || {}));
    }
  };
  // Meta Pixel: eventos personalizados (trackCustom), no "Lead", para no inflar los leads.
  // Sirven para crear conversiones personalizadas en el Administrador de eventos y optimizar
  // los anuncios a clics hacia la prueba. Solo se envían si el píxel cargó (cookies aceptadas
  // y META_PIXEL_ID con valor en config.js).
  const meta = (nombre, params) => {
    if (typeof window.fbq === 'function' && window.CLOSR_CONFIG && window.CLOSR_CONFIG.META_PIXEL_ID) {
      window.fbq('trackCustom', nombre, params || {});
    }
  };
  document.addEventListener('click', (e) => {
    const a = e.target.closest ? e.target.closest('a') : null;
    if (!a) return;
    const href = a.getAttribute('href') || '';
    if (href.indexOf('app.closr.cl/register') !== -1) {
      const ubicacion = a.closest('section, header, footer')?.id || a.closest('section, header, footer')?.className || 'otro';
      ga('clic_registro', { ubicacion });
      meta('ClicPruebaGratis', { ubicacion });
    } else if (a.classList.contains('whatsapp-fab') || href.indexOf('wa.me/') !== -1) {
      ga('clic_whatsapp');
      meta('ClicWhatsApp');
    }
  });
  document.querySelectorAll('form[name="closr-lista-espera"]').forEach((f) => {
    f.addEventListener('submit', () => {
      const canal = f.querySelector('input[name="canal"]');
      ga('lista_espera', { canal: canal ? canal.value : '' });
    });
  });
})();
