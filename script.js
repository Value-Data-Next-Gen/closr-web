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
})();
