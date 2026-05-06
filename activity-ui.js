(function () {
  'use strict';

  let celebrationShown = false;

  function dispatch(name, detail) {
    window.dispatchEvent(new CustomEvent(name, { detail }));
  }

  function prefersReducedMotion() {
    return !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  }

  function makeCanvas(className) {
    const canvas = document.createElement('canvas');
    canvas.className = className || 'activity-ui-celebration';
    canvas.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:9999;';
    document.body.appendChild(canvas);
    return canvas;
  }

  function resizeCanvas(canvas, ctx) {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function launchCelebration(options = {}) {
    if (celebrationShown && !options.force) return false;
    if (prefersReducedMotion()) return false;

    celebrationShown = true;
    const effects = [
      runConfetti,
      runFireworks,
      runShootingStars,
      runBadgePop,
      runXpBurst,
      runPixelSparkle,
      runLevelUpFlash,
      runMatrixTick
    ];
    const names = ['confetti', 'fireworks', 'shooting-stars', 'badge-pop', 'xp-burst', 'pixel-sparkle', 'level-up-flash', 'matrix-tick'];
    const index = typeof options.effectIndex === 'number'
      ? Math.max(0, Math.min(effects.length - 1, options.effectIndex))
      : Math.floor(Math.random() * effects.length);

    dispatch('activity-ui:celebration-start', { effect: names[index] });
    effects[index](options);
    return true;
  }

  function resetCelebration() {
    celebrationShown = false;
  }

  function showToast(message, type = '', options = {}) {
    let toast = document.querySelector(options.selector || '#toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = (options.selector || '#toast').replace(/^#/, '') || 'toast';
      toast.className = 'ac-toast';
      toast.style.cssText = 'position:fixed;right:18px;bottom:18px;z-index:10000;padding:10px 14px;border-radius:8px;background:#111827;color:#fff;box-shadow:0 8px 26px rgba(0,0,0,.3);font:600 0.9rem system-ui,sans-serif;opacity:0;transform:translateY(8px);transition:opacity .2s,transform .2s;';
      document.body.appendChild(toast);
    }

    const duration = Number.isFinite(options.duration) ? options.duration : 3500;
    toast.textContent = message;
    toast.className = 'ac-toast show' + (type ? ' ' + type : '');
    if (!getComputedStyle(toast).position || getComputedStyle(toast).position === 'static') {
      toast.style.position = 'fixed';
    }
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';

    clearTimeout(toast._activityUiTimer);
    toast._activityUiTimer = setTimeout(() => {
      toast.classList.remove('show');
      if (toast.style.opacity) {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(8px)';
      }
    }, duration);

    dispatch('activity-ui:toast', { message, type });
    return toast;
  }

  function runConfetti() {
    const canvas = makeCanvas();
    const ctx = canvas.getContext('2d');
    const colors = ['#facc15', '#22c55e', '#38bdf8', '#f472b6', '#fb7185'];
    const pieces = Array.from({ length: 120 }, () => ({
      x: Math.random() * window.innerWidth,
      y: -20 - Math.random() * window.innerHeight * 0.35,
      vx: -2 + Math.random() * 4,
      vy: 2 + Math.random() * 4,
      size: 5 + Math.random() * 7,
      spin: Math.random() * Math.PI,
      color: colors[Math.floor(Math.random() * colors.length)]
    }));
    let frame = 0;
    function draw() {
      resizeCanvas(canvas, ctx);
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      pieces.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.04;
        p.spin += 0.18;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.spin);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.65);
        ctx.restore();
      });
      frame++;
      if (frame < 140) requestAnimationFrame(draw);
      else canvas.remove();
    }
    draw();
  }

  function runFireworks() {
    const canvas = makeCanvas();
    const ctx = canvas.getContext('2d');
    const colors = ['#facc15', '#22c55e', '#38bdf8', '#f472b6', '#fb7185'];
    const bursts = Array.from({ length: 6 }, (_, burst) => {
      const x = window.innerWidth * (0.15 + Math.random() * 0.7);
      const y = window.innerHeight * (0.18 + Math.random() * 0.45);
      return Array.from({ length: 28 }, () => {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1.4 + Math.random() * 3.2;
        return { x, y, delay: burst * 18, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: 80, color: colors[Math.floor(Math.random() * colors.length)] };
      });
    }).flat();
    let frame = 0;
    function draw() {
      resizeCanvas(canvas, ctx);
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      bursts.forEach(p => {
        if (frame < p.delay || p.life <= 0) return;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.035;
        p.life--;
        ctx.globalAlpha = Math.max(p.life / 80, 0);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      });
      frame++;
      if (frame < 180) requestAnimationFrame(draw);
      else canvas.remove();
    }
    draw();
  }

  function runShootingStars() {
    const canvas = makeCanvas();
    const ctx = canvas.getContext('2d');
    const stars = Array.from({ length: 18 }, (_, i) => ({
      x: -120 - Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight * 0.55,
      delay: i * 7,
      speed: 9 + Math.random() * 5,
      size: 2 + Math.random() * 2
    }));
    let frame = 0;
    function draw() {
      resizeCanvas(canvas, ctx);
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      stars.forEach(s => {
        if (frame < s.delay) return;
        s.x += s.speed;
        s.y += s.speed * 0.32;
        const trail = 70;
        const grad = ctx.createLinearGradient(s.x - trail, s.y - trail * 0.32, s.x, s.y);
        grad.addColorStop(0, 'rgba(250,204,21,0)');
        grad.addColorStop(1, 'rgba(250,204,21,0.95)');
        ctx.strokeStyle = grad;
        ctx.lineWidth = s.size;
        ctx.beginPath();
        ctx.moveTo(s.x - trail, s.y - trail * 0.32);
        ctx.lineTo(s.x, s.y);
        ctx.stroke();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
      });
      frame++;
      if (frame < 150) requestAnimationFrame(draw);
      else canvas.remove();
    }
    draw();
  }

  function runBadgePop() {
    const badge = document.createElement('div');
    badge.className = 'activity-ui-celebration';
    badge.textContent = '100%';
    badge.style.cssText = 'position:fixed;left:50%;top:46%;transform:translate(-50%,-50%) scale(.4);z-index:9999;pointer-events:none;background:var(--gold,#facc15);color:#111;border:4px solid #fff;border-radius:999px;width:150px;height:150px;display:grid;place-items:center;font-weight:900;font-size:2.4rem;box-shadow:0 18px 50px rgba(0,0,0,.35);opacity:0;transition:transform .55s cubic-bezier(.2,1.4,.3,1),opacity .25s;';
    document.body.appendChild(badge);
    requestAnimationFrame(() => {
      badge.style.opacity = '1';
      badge.style.transform = 'translate(-50%,-50%) scale(1) rotate(8deg)';
    });
    setTimeout(() => {
      badge.style.opacity = '0';
      badge.style.transform = 'translate(-50%,-55%) scale(.85) rotate(-6deg)';
    }, 1300);
    setTimeout(() => badge.remove(), 1800);
  }

  function runXpBurst() {
    const canvas = makeCanvas();
    const ctx = canvas.getContext('2d');
    const bits = Array.from({ length: 34 }, () => ({ x: window.innerWidth / 2 + (Math.random() - .5) * 260, y: window.innerHeight * .62 + Math.random() * 40, vx: (Math.random() - .5) * 3, vy: -4 - Math.random() * 4, life: 70 + Math.random() * 35, text: Math.random() > .25 ? '+XP' : '+100' }));
    let frame = 0;
    function draw() {
      resizeCanvas(canvas, ctx);
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      ctx.font = '800 22px sans-serif';
      ctx.textAlign = 'center';
      bits.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += .05;
        p.life--;
        ctx.globalAlpha = Math.max(p.life / 90, 0);
        ctx.fillStyle = '#facc15';
        ctx.fillText(p.text, p.x, p.y);
      });
      ctx.globalAlpha = 1;
      frame++;
      if (frame < 110) requestAnimationFrame(draw);
      else canvas.remove();
    }
    draw();
  }

  function runPixelSparkle() {
    const canvas = makeCanvas();
    const ctx = canvas.getContext('2d');
    const colors = ['#38bdf8', '#22c55e', '#facc15', '#f472b6'];
    const pixels = Array.from({ length: 150 }, () => ({ x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight, size: 4 + Math.random() * 9, life: 45 + Math.random() * 60, color: colors[Math.floor(Math.random() * colors.length)] }));
    let frame = 0;
    function draw() {
      resizeCanvas(canvas, ctx);
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      pixels.forEach(p => {
        p.life--;
        const pulse = Math.sin((frame + p.size) * .25) * 0.5 + 0.5;
        ctx.globalAlpha = Math.max(p.life / 80, 0) * pulse;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.size, p.size);
      });
      ctx.globalAlpha = 1;
      frame++;
      if (frame < 120) requestAnimationFrame(draw);
      else canvas.remove();
    }
    draw();
  }

  function runLevelUpFlash() {
    const wrap = document.createElement('div');
    wrap.className = 'activity-ui-celebration';
    wrap.innerHTML = '<div>LEVEL COMPLETE</div><strong>100%</strong>';
    wrap.style.cssText = 'position:fixed;inset:0;z-index:9999;pointer-events:none;display:grid;place-items:center;text-align:center;background:rgba(0,0,0,.18);color:white;font-family:sans-serif;font-weight:900;letter-spacing:.08em;text-shadow:0 4px 24px rgba(0,0,0,.4);opacity:0;transition:opacity .2s;';
    wrap.firstChild.style.cssText = 'font-size:clamp(1.6rem,6vw,4.5rem);';
    wrap.lastChild.style.cssText = 'display:block;font-size:clamp(2.2rem,9vw,7rem);color:#facc15;';
    document.body.appendChild(wrap);
    requestAnimationFrame(() => { wrap.style.opacity = '1'; });
    setTimeout(() => { wrap.style.opacity = '0'; }, 1200);
    setTimeout(() => wrap.remove(), 1600);
  }

  function runMatrixTick() {
    const canvas = makeCanvas();
    const ctx = canvas.getContext('2d');
    canvas.style.background = 'rgba(0,0,0,.18)';
    let drops = [];
    let frame = 0;
    function draw() {
      resizeCanvas(canvas, ctx);
      if (!drops.length) drops = Array.from({ length: Math.ceil(window.innerWidth / 18) }, () => Math.random() * -40);
      ctx.fillStyle = 'rgba(0,0,0,.16)';
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
      ctx.fillStyle = '#22c55e';
      ctx.font = '18px monospace';
      drops.forEach((y, i) => {
        const x = i * 18;
        ctx.fillText(Math.random() > .5 ? '1' : '0', x, y);
        drops[i] = y > window.innerHeight + 20 ? 0 : y + 18;
      });
      if (frame > 70) {
        ctx.fillStyle = '#facc15';
        ctx.font = '900 86px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('100%', window.innerWidth / 2, window.innerHeight / 2);
      }
      frame++;
      if (frame < 140) requestAnimationFrame(draw);
      else canvas.remove();
    }
    draw();
  }

  window.ActivityUI = {
    launchCelebration,
    showToast,
    resetCelebration
  };
})();
