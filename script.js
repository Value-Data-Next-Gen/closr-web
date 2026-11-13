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

// ---------- Bandeja en vivo del hero (v2b, 13-nov-2026) ----------
// Mensajes de ejemplo que llegan de noche; la IA responde, crea una tarea y cierra una venta.
// Con movimiento reducido o sin JS queda el estado estático que trae el HTML.
(() => {
  const list = document.getElementById('liveList');
  const clock = document.getElementById('liveClock');
  const box = document.getElementById('liveInbox');
  if (!list || !clock || !box) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const ICONS = 'images/icons-v1.svg';
  const EVENTS = [
    { kind: 'chat', ch: 'wa', who: 'Carolina',
      msg: 'hola!! el polerón rojo en M lo tienen? es para regalo, si no le queda lo puedo cambiar?',
      reply: '¡Hola Carolina! Sí, queda uno en M. Tienes 30 días para cambiarlo con la boleta y te lo envolvemos para regalo sin costo. ¿Te lo aparto?',
      mins: 0 },
    { kind: 'chat', ch: 'ig', who: '@vale.mendez',
      msg: 'vi las zapatillas blancas del último post, hay en 38? cuánto sale el envío a Temuco y cuándo llega?',
      reply: 'Hola Vale, sí hay en 38 a $39.990. El envío a Temuco cuesta $4.500 y llega en 2 a 4 días hábiles. ¿Te mando el link de pago?',
      mins: 2 },
    { kind: 'chat', ch: 'wa', who: 'Javier',
      msg: 'necesito 12 poleras con el logo bordado para mi equipo pero tienen que estar antes del viernes, alcanzan?',
      reply: 'Hola Javier. El bordado toma 3 días hábiles, así que si confirmas hoy llegamos al viernes. Le pido la cotización al encargado y te escribe a primera hora.',
      mins: 3 },
    { kind: 'task', title: 'Tarea creada por la IA', text: 'Cotizar 12 poleras bordadas para Javier antes de las 9:30', mins: 0 },
    { kind: 'chat', ch: 'ig', who: '@pedro.ferre', handoff: true,
      msg: 'en otra tienda me dejan el mismo modelo 15% más barato, me lo igualan?',
      reply: 'Entiendo, Pedro. El precio no lo defino yo: le paso tu consulta a una persona del equipo para que te responda hoy mismo.',
      mins: 2 },
    { kind: 'won', title: 'Venta cerrada', text: 'Carolina · $24.990 · retira mañana a las 10:00', mins: 1 },
  ];
  const CHANNELS = { wa: { icon: 'i-wa', label: 'WhatsApp' }, ig: { icon: 'i-ig', label: 'Instagram' } };
  const START = 23 * 60 + 47;
  const MAX_CARDS = 3;

  let minutes = START;
  let i = 0;
  let timers = [];
  let running = false;

  const later = (fn, ms) => { timers.push(setTimeout(fn, ms)); };
  const stop = () => { timers.forEach(clearTimeout); timers = []; running = false; };
  const fmt = (m) => {
    const h = Math.floor(m / 60) % 24;
    const mm = m % 60;
    return String(h).padStart(2, '0') + ':' + String(mm).padStart(2, '0');
  };
  const icon = (name) => {
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('width', '14');
    svg.setAttribute('height', '14');
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
    while (list.children.length > MAX_CARDS) list.lastElementChild.remove();
  };

  const play = () => {
    const ev = EVENTS[i];
    minutes += ev.mins;
    clock.textContent = fmt(minutes);
    let wait = 2400;

    if (ev.kind === 'chat') {
      const chan = CHANNELS[ev.ch] || CHANNELS.wa;
      const card = el('div', 'live-card live-' + ev.ch);
      const meta = el('div', 'live-meta');
      meta.append(icon(chan.icon), document.createTextNode(' ' + ev.who + ' · ' + chan.label));
      card.append(meta, el('p', 'live-in', ev.msg));
      push(card);
      later(() => {
        const typing = el('div', 'live-typing');
        typing.append(el('span'), el('span'), el('span'));
        card.append(typing);
        later(() => {
          typing.remove();
          const out = el('p', 'live-out');
          out.append(el('span', 'ai-tag', 'IA'), document.createTextNode(ev.reply));
          card.append(out);
          later(() => card.append(ev.handoff
            ? el('span', 'live-done live-handoff', 'Pasado a una persona del equipo')
            : el('span', 'live-done', 'Respondido por la IA')), 350);
        }, 1600);
      }, 900);
      wait = 5200;
    } else {
      const card = el('div', 'live-card ' + (ev.kind === 'won' ? 'live-won' : 'live-task'));
      const meta = el('div', 'live-meta');
      meta.append(icon(ev.kind === 'won' ? 't-check' : 't-clock'), document.createTextNode(' ' + ev.title));
      card.append(meta, el('p', 'live-strong', ev.text));
      push(card);
      wait = ev.kind === 'won' ? 4200 : 2600;
    }

    i += 1;
    if (i >= EVENTS.length) {
      later(() => {
        Array.from(list.children).forEach((c) => c.classList.add('is-leaving'));
        later(() => { list.innerHTML = ''; i = 0; minutes = START; play(); }, 450);
      }, wait);
    } else {
      later(play, wait);
    }
  };

  const start = () => {
    if (running) return;
    running = true;
    list.innerHTML = '';
    i = 0;
    minutes = START;
    play();
  };

  if ('IntersectionObserver' in window) {
    new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) start(); else stop(); });
    }, { threshold: 0.3 }).observe(box);
  } else {
    start();
  }
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
})();
