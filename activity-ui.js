(function () {
  'use strict';

  const MIN_CELEBRATION_MS = 5000;
  const TARGET_FRAME_MS = 1000 / 60;
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

  function celebrationElapsed(start) {
    return performance.now() - start;
  }

  function celebrationFrameDelta(lastTime) {
    return Math.min((performance.now() - lastTime) / TARGET_FRAME_MS, 2);
  }

  function drawFivePointStar(ctx, x, y, outerRadius, innerRadius, rotation = -Math.PI / 2) {
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = rotation + i * Math.PI / 5;
      const px = x + Math.cos(angle) * radius;
      const py = y + Math.sin(angle) * radius;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
  }

  function makeBurst(x, y, count, colors, options = {}) {
    const minSpeed = options.minSpeed || 1.8;
    const maxSpeed = options.maxSpeed || 6;
    const minSize = options.minSize || 2;
    const maxSize = options.maxSize || 6;
    const life = options.life || 230;
    const shapes = options.shapes || ['dot'];
    return Array.from({ length: count }, () => {
      const angle = Math.random() * Math.PI * 2;
      const speed = minSpeed + Math.random() * (maxSpeed - minSpeed);
      const particleLife = life + Math.random() * life * 0.35;
      return {
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: particleLife,
        maxLife: particleLife,
        size: minSize + Math.random() * (maxSize - minSize),
        spin: Math.random() * Math.PI * 2,
        spinSpeed: (Math.random() - 0.5) * 0.28,
        color: colors[Math.floor(Math.random() * colors.length)],
        shape: shapes[Math.floor(Math.random() * shapes.length)]
      };
    });
  }

  function drawSpark(ctx, p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.spin || 0);
    ctx.fillStyle = p.color;
    if (p.shape === 'star') {
      drawFivePointStar(ctx, 0, 0, p.size * 1.9, p.size * 0.78);
    } else if (p.shape === 'flare') {
      ctx.fillRect(-p.size * 1.8, -1, p.size * 3.6, 2);
      ctx.fillRect(-1, -p.size * 1.8, 2, p.size * 3.6);
    } else {
      ctx.beginPath();
      ctx.arc(0, 0, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function runConfetti() {
    const canvas = makeCanvas();
    const ctx = canvas.getContext('2d');
    const start = performance.now();
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
    let lastTime = start;
    function draw() {
      const delta = celebrationFrameDelta(lastTime);
      lastTime = performance.now();
      resizeCanvas(canvas, ctx);
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      pieces.forEach(p => {
        p.x += p.vx * delta;
        p.y += p.vy * delta;
        p.vy += 0.04 * delta;
        p.spin += 0.18 * delta;
        if (celebrationElapsed(start) < MIN_CELEBRATION_MS && p.y > window.innerHeight + 30) {
          p.x = Math.random() * window.innerWidth;
          p.y = -20 - Math.random() * window.innerHeight * 0.25;
          p.vy = 2 + Math.random() * 4;
        }
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.spin);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.65);
        ctx.restore();
      });
      if (celebrationElapsed(start) < MIN_CELEBRATION_MS) requestAnimationFrame(draw);
      else canvas.remove();
    }
    draw();
  }

  function runFireworks() {
    const canvas = makeCanvas();
    const ctx = canvas.getContext('2d');
    const start = performance.now();
    const colors = ['#facc15', '#fde68a', '#f59e0b', '#22c55e', '#38bdf8', '#f472b6', '#fb7185'];
    const bursts = Array.from({ length: 10 }, (_, burst) => {
      const x = window.innerWidth * (0.15 + Math.random() * 0.7);
      const y = window.innerHeight * (0.18 + Math.random() * 0.45);
      return makeBurst(x, y, 44, colors, {
        minSpeed: 1.7,
        maxSpeed: 6.4,
        minSize: 2,
        maxSize: 5,
        life: 250,
        shapes: ['dot', 'dot', 'star', 'flare']
      }).map(p => ({ ...p, delay: burst * 22 }));
    }).flat();
    let frame = 0;
    let lastTime = start;
    function draw() {
      const delta = celebrationFrameDelta(lastTime);
      lastTime = performance.now();
      resizeCanvas(canvas, ctx);
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      bursts.forEach(p => {
        if (frame < p.delay || p.life <= 0) return;
        p.x += p.vx * delta;
        p.y += p.vy * delta;
        p.vy += 0.035 * delta;
        p.life -= delta;
        p.spin += p.spinSpeed * delta;
        ctx.globalAlpha = Math.max(p.life / p.maxLife, 0);
        drawSpark(ctx, p);
        ctx.globalAlpha = 1;
      });
      frame++;
      if (celebrationElapsed(start) < MIN_CELEBRATION_MS) requestAnimationFrame(draw);
      else canvas.remove();
    }
    draw();
  }

  function runShootingStars() {
    const canvas = makeCanvas();
    const ctx = canvas.getContext('2d');
    const start = performance.now();
    const stars = Array.from({ length: 26 }, (_, i) => ({
      x: -120 - Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight * 0.55,
      delay: i * 5,
      speed: 10 + Math.random() * 7,
      size: 5 + Math.random() * 5,
      spin: Math.random() * Math.PI * 2
    }));
    let bursts = [];
    let frame = 0;
    let lastTime = start;
    function draw() {
      const delta = celebrationFrameDelta(lastTime);
      lastTime = performance.now();
      resizeCanvas(canvas, ctx);
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      stars.forEach(s => {
        if (frame < s.delay) return;
        s.x += s.speed * delta;
        s.y += s.speed * 0.32 * delta;
        if (celebrationElapsed(start) < MIN_CELEBRATION_MS && s.x > window.innerWidth + 140) {
          s.x = -120 - Math.random() * window.innerWidth * 0.3;
          s.y = Math.random() * window.innerHeight * 0.55;
          s.spin = Math.random() * Math.PI * 2;
        }
        if (Math.random() < 0.035 * delta) {
          bursts.push(...makeBurst(s.x, s.y, 18, ['#facc15', '#fde68a', '#f59e0b'], {
            minSpeed: 0.8,
            maxSpeed: 3.4,
            minSize: 1.5,
            maxSize: 3.5,
            life: 120,
            shapes: ['dot', 'star']
          }));
        }
        const trail = 110;
        const grad = ctx.createLinearGradient(s.x - trail, s.y - trail * 0.32, s.x, s.y);
        grad.addColorStop(0, 'rgba(250,204,21,0)');
        grad.addColorStop(0.6, 'rgba(253,230,138,0.45)');
        grad.addColorStop(1, 'rgba(250,204,21,0.95)');
        ctx.strokeStyle = grad;
        ctx.lineWidth = Math.max(2, s.size * 0.45);
        ctx.beginPath();
        ctx.moveTo(s.x - trail, s.y - trail * 0.32);
        ctx.lineTo(s.x, s.y);
        ctx.stroke();
        ctx.shadowColor = '#facc15';
        ctx.shadowBlur = 18;
        ctx.fillStyle = '#fff7ad';
        s.spin += 0.12 * delta;
        drawFivePointStar(ctx, s.x, s.y, s.size, s.size * 0.42, s.spin);
        ctx.shadowBlur = 0;
      });
      bursts = bursts.filter(p => p.life > 0);
      bursts.forEach(p => {
        p.x += p.vx * delta;
        p.y += p.vy * delta;
        p.vy += 0.03 * delta;
        p.life -= delta;
        p.spin += p.spinSpeed * delta;
        ctx.globalAlpha = Math.max(p.life / p.maxLife, 0);
        drawSpark(ctx, p);
        ctx.globalAlpha = 1;
      });
      frame++;
      if (celebrationElapsed(start) < MIN_CELEBRATION_MS) requestAnimationFrame(draw);
      else canvas.remove();
    }
    draw();
  }

  function runBadgePop() {
    const badge = document.createElement('div');
    badge.className = 'activity-ui-celebration';
    badge.textContent = '100%';
    badge.style.cssText = 'position:fixed;left:50%;top:46%;transform:translate(-50%,-50%) scale(.35);z-index:10000;pointer-events:none;background:radial-gradient(circle at 35% 30%,#fff7ad 0,#facc15 48%,#f59e0b 100%);color:#111;border:5px solid #fff;border-radius:999px;width:190px;height:190px;display:grid;place-items:center;font-weight:900;font-size:3rem;box-shadow:0 0 0 10px rgba(250,204,21,.22),0 22px 70px rgba(0,0,0,.42),0 0 70px rgba(250,204,21,.85);opacity:0;transition:transform .55s cubic-bezier(.2,1.4,.3,1),opacity .25s;';
    document.body.appendChild(badge);
    runCelebrationBurstLayer({
      centerText: false,
      burstCount: 12,
      centralExplosions: true,
      zIndex: 9999,
      duration: MIN_CELEBRATION_MS
    });
    requestAnimationFrame(() => {
      badge.style.opacity = '1';
      badge.style.transform = 'translate(-50%,-50%) scale(1) rotate(8deg)';
    });
    setTimeout(() => {
      badge.style.opacity = '0';
      badge.style.transform = 'translate(-50%,-55%) scale(.85) rotate(-6deg)';
    }, MIN_CELEBRATION_MS - 500);
    setTimeout(() => badge.remove(), MIN_CELEBRATION_MS);
  }

  function runXpBurst() {
    const canvas = makeCanvas();
    const ctx = canvas.getContext('2d');
    const start = performance.now();
    const bits = Array.from({ length: 52 }, () => {
      const life = 270 + Math.random() * 80;
      return { x: window.innerWidth / 2 + (Math.random() - .5) * 320, y: window.innerHeight * .66 + Math.random() * 60, vx: (Math.random() - .5) * 4.2, vy: -5 - Math.random() * 6, life, maxLife: life, text: Math.random() > .25 ? '+XP' : '+100' };
    });
    const stars = Array.from({ length: 18 }, (_, i) => ({
      x: -80 - Math.random() * window.innerWidth * 0.7,
      y: window.innerHeight * (0.12 + Math.random() * 0.58),
      delay: i * 9,
      speed: 8 + Math.random() * 6,
      size: 5 + Math.random() * 5,
      spin: Math.random() * Math.PI * 2
    }));
    let sparks = makeBurst(window.innerWidth / 2, window.innerHeight * .62, 80, ['#facc15', '#fde68a', '#38bdf8', '#f472b6'], {
      minSpeed: 1.6,
      maxSpeed: 6.2,
      minSize: 1.8,
      maxSize: 4.2,
      life: 210,
      shapes: ['dot', 'star', 'flare']
    });
    let frame = 0;
    let lastTime = start;
    function draw() {
      const delta = celebrationFrameDelta(lastTime);
      lastTime = performance.now();
      resizeCanvas(canvas, ctx);
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      ctx.font = '800 22px sans-serif';
      ctx.textAlign = 'center';
      bits.forEach(p => {
        p.x += p.vx * delta;
        p.y += p.vy * delta;
        p.vy += .05 * delta;
        p.life -= delta;
        ctx.globalAlpha = Math.max(p.life / 270, 0);
        ctx.shadowColor = '#facc15';
        ctx.shadowBlur = 12;
        ctx.fillStyle = '#facc15';
        ctx.strokeStyle = 'rgba(17,24,39,.55)';
        ctx.lineWidth = 3;
        ctx.strokeText(p.text, p.x, p.y);
        ctx.fillText(p.text, p.x, p.y);
      });
      ctx.shadowBlur = 0;
      stars.forEach(s => {
        if (frame < s.delay) return;
        s.x += s.speed * delta;
        s.y += s.speed * 0.34 * delta;
        s.spin += 0.14 * delta;
        if (celebrationElapsed(start) < MIN_CELEBRATION_MS && s.x > window.innerWidth + 120) {
          s.x = -80 - Math.random() * window.innerWidth * 0.4;
          s.y = window.innerHeight * (0.12 + Math.random() * 0.58);
        }
        const trail = 90;
        const grad = ctx.createLinearGradient(s.x - trail, s.y - trail * 0.34, s.x, s.y);
        grad.addColorStop(0, 'rgba(250,204,21,0)');
        grad.addColorStop(1, 'rgba(250,204,21,.9)');
        ctx.strokeStyle = grad;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(s.x - trail, s.y - trail * 0.34);
        ctx.lineTo(s.x, s.y);
        ctx.stroke();
        ctx.fillStyle = '#fff7ad';
        drawFivePointStar(ctx, s.x, s.y, s.size, s.size * 0.42, s.spin);
      });
      sparks = sparks.filter(p => p.life > 0);
      if (Math.random() < 0.04 * delta) {
        sparks.push(...makeBurst(window.innerWidth / 2 + (Math.random() - .5) * 260, window.innerHeight * (0.38 + Math.random() * .28), 22, ['#facc15', '#fde68a', '#f59e0b'], {
          minSpeed: 1,
          maxSpeed: 4,
          minSize: 1.8,
          maxSize: 3.8,
          life: 150,
          shapes: ['dot', 'star']
        }));
      }
      sparks.forEach(p => {
        p.x += p.vx * delta;
        p.y += p.vy * delta;
        p.vy += 0.035 * delta;
        p.life -= delta;
        p.spin += p.spinSpeed * delta;
        ctx.globalAlpha = Math.max(p.life / p.maxLife, 0);
        drawSpark(ctx, p);
      });
      ctx.globalAlpha = 1;
      frame++;
      if (celebrationElapsed(start) < MIN_CELEBRATION_MS) requestAnimationFrame(draw);
      else canvas.remove();
    }
    draw();
  }

  function runPixelSparkle() {
    const canvas = makeCanvas();
    const ctx = canvas.getContext('2d');
    const start = performance.now();
    const colors = ['#facc15', '#fde68a', '#38bdf8', '#22c55e', '#f472b6'];
    const sparkles = Array.from({ length: 95 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.8,
      vy: -0.45 - Math.random() * 1.4,
      size: 3 + Math.random() * 7,
      life: 230 + Math.random() * 110,
      maxLife: 300,
      pulseOffset: Math.random() * Math.PI * 2,
      spin: Math.random() * Math.PI * 2,
      spinSpeed: (Math.random() - 0.5) * 0.16,
      color: colors[Math.floor(Math.random() * colors.length)]
    }));
    const fountains = [
      { x: window.innerWidth * 0.22, y: window.innerHeight * 0.78 },
      { x: window.innerWidth * 0.5, y: window.innerHeight * 0.72 },
      { x: window.innerWidth * 0.78, y: window.innerHeight * 0.78 }
    ];
    let bursts = fountains.flatMap(origin => makeBurst(origin.x, origin.y, 34, colors, {
      minSpeed: 1.4,
      maxSpeed: 5.2,
      minSize: 1.8,
      maxSize: 4.4,
      life: 210,
      shapes: ['star', 'star', 'dot', 'flare']
    }));
    let frame = 0;
    let lastTime = start;
    function draw() {
      const delta = celebrationFrameDelta(lastTime);
      lastTime = performance.now();
      resizeCanvas(canvas, ctx);
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      sparkles.forEach(p => {
        p.x += p.vx * delta;
        p.y += p.vy * delta;
        p.spin += p.spinSpeed * delta;
        p.life -= delta;
        if (celebrationElapsed(start) < MIN_CELEBRATION_MS && p.life <= 0) {
          p.x = Math.random() * window.innerWidth;
          p.y = window.innerHeight * (0.18 + Math.random() * 0.72);
          p.vx = (Math.random() - 0.5) * 0.8;
          p.vy = -0.45 - Math.random() * 1.4;
          p.life = 230 + Math.random() * 110;
          p.maxLife = p.life;
        }
        const pulse = Math.sin(frame * 0.12 + p.pulseOffset) * 0.45 + 0.55;
        ctx.globalAlpha = Math.max(p.life / p.maxLife, 0) * pulse;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 16;
        ctx.fillStyle = p.color;
        drawFivePointStar(ctx, p.x, p.y, p.size, p.size * 0.38, p.spin);
        ctx.shadowBlur = 0;
      });
      if (celebrationElapsed(start) < MIN_CELEBRATION_MS - 800 && frame % 28 === 0) {
        const origin = fountains[Math.floor(Math.random() * fountains.length)];
        bursts.push(...makeBurst(origin.x, origin.y, 24, colors, {
          minSpeed: 1.1,
          maxSpeed: 4.8,
          minSize: 1.8,
          maxSize: 4,
          life: 190,
          shapes: ['star', 'dot', 'flare']
        }));
      }
      bursts = bursts.filter(p => p.life > 0);
      bursts.forEach(p => {
        p.x += p.vx * delta;
        p.y += p.vy * delta;
        p.vy += 0.045 * delta;
        p.life -= delta;
        p.spin += p.spinSpeed * delta;
        ctx.globalAlpha = Math.max(p.life / p.maxLife, 0);
        ctx.shadowColor = p.color;
        ctx.shadowBlur = p.shape === 'star' ? 10 : 5;
        drawSpark(ctx, p);
        ctx.shadowBlur = 0;
      });
      ctx.globalAlpha = 1;
      frame++;
      if (celebrationElapsed(start) < MIN_CELEBRATION_MS) requestAnimationFrame(draw);
      else canvas.remove();
    }
    draw();
  }

  function runLevelUpFlash() {
    const wrap = document.createElement('div');
    wrap.className = 'activity-ui-celebration';
    wrap.innerHTML = '<div><span>LEVEL COMPLETE</span><strong>100%</strong></div>';
    wrap.style.cssText = 'position:fixed;inset:0;z-index:10000;pointer-events:none;display:grid;place-items:center;text-align:center;background:radial-gradient(circle at center,rgba(250,204,21,.28),rgba(0,0,0,.72) 55%,rgba(0,0,0,.86));color:white;font-family:sans-serif;font-weight:900;letter-spacing:.08em;text-shadow:0 4px 24px rgba(0,0,0,.55),0 0 38px rgba(250,204,21,.8);opacity:0;transition:opacity .2s;';
    wrap.firstChild.style.cssText = 'transform:scale(.72);animation:activityUiLevelSlam .8s cubic-bezier(.16,1.3,.3,1) forwards,activityUiLevelPulse 1.2s ease-in-out .8s infinite;';
    wrap.querySelector('span').style.cssText = 'display:block;font-size:clamp(2.4rem,8vw,6.5rem);';
    wrap.querySelector('strong').style.cssText = 'display:block;font-size:clamp(3.4rem,13vw,10rem);color:#facc15;-webkit-text-stroke:2px #fff;';
    const style = document.createElement('style');
    style.className = 'activity-ui-celebration-style';
    style.textContent = '@keyframes activityUiLevelSlam{0%{transform:scale(.45) rotate(-5deg);filter:blur(5px)}72%{transform:scale(1.08) rotate(1deg);filter:blur(0)}100%{transform:scale(1) rotate(0)}}@keyframes activityUiLevelPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.045)}}';
    document.body.appendChild(wrap);
    document.head.appendChild(style);
    runCelebrationBurstLayer({
      centerText: false,
      burstCount: 16,
      centralExplosions: true,
      zIndex: 9999,
      duration: MIN_CELEBRATION_MS
    });
    requestAnimationFrame(() => { wrap.style.opacity = '1'; });
    setTimeout(() => { wrap.style.opacity = '0'; }, MIN_CELEBRATION_MS - 500);
    setTimeout(() => { wrap.remove(); style.remove(); }, MIN_CELEBRATION_MS);
  }

  function runMatrixTick() {
    const canvas = makeCanvas();
    const ctx = canvas.getContext('2d');
    canvas.style.background = '#020617';
    const start = performance.now();
    let drops = [];
    let columns = 0;
    let frame = 0;
    let lastTime = start;
    function draw() {
      const delta = celebrationFrameDelta(lastTime);
      lastTime = performance.now();
      resizeCanvas(canvas, ctx);
      const columnWidth = 14;
      const nextColumns = Math.ceil(window.innerWidth / columnWidth) + 6;
      if (!drops.length || columns !== nextColumns) {
        columns = nextColumns;
        drops = Array.from({ length: columns }, () => Math.random() * -window.innerHeight);
      }
      ctx.fillStyle = 'rgba(2,6,23,.18)';
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
      ctx.font = '18px monospace';
      drops.forEach((y, i) => {
        const x = i * columnWidth - 28;
        const glyph = Math.random() > .82 ? ['+', '*', '1', '0'][Math.floor(Math.random() * 4)] : (Math.random() > .5 ? '1' : '0');
        ctx.fillStyle = Math.random() > .9 ? '#bbf7d0' : '#22c55e';
        ctx.globalAlpha = 0.55 + Math.random() * 0.45;
        ctx.fillText(glyph, x, y);
        if (Math.random() > .78) ctx.fillText(Math.random() > .5 ? '1' : '0', x, y - 28);
        drops[i] = y > window.innerHeight + 36 ? Math.random() * -120 : y + (18 + Math.random() * 8) * delta;
      });
      ctx.globalAlpha = 1;
      if (frame > 70) {
        ctx.shadowColor = '#22c55e';
        ctx.shadowBlur = 28;
        ctx.strokeStyle = 'rgba(34,197,94,.7)';
        ctx.lineWidth = 6;
        const fontSize = Math.max(86, Math.min(160, window.innerWidth * 0.14));
        ctx.font = '900 ' + fontSize + 'px sans-serif';
        ctx.textAlign = 'center';
        ctx.strokeText('100%', window.innerWidth / 2, window.innerHeight / 2);
        ctx.fillStyle = '#facc15';
        ctx.fillText('100%', window.innerWidth / 2, window.innerHeight / 2);
        ctx.shadowBlur = 0;
      }
      frame++;
      if (celebrationElapsed(start) < MIN_CELEBRATION_MS) requestAnimationFrame(draw);
      else canvas.remove();
    }
    draw();
  }

  function runCelebrationBurstLayer(options = {}) {
    const canvas = makeCanvas('activity-ui-burst-layer');
    const ctx = canvas.getContext('2d');
    if (options.zIndex) canvas.style.zIndex = String(options.zIndex);
    const start = performance.now();
    const duration = options.duration || MIN_CELEBRATION_MS;
    const colors = ['#facc15', '#fde68a', '#f59e0b', '#fb7185', '#38bdf8', '#22c55e'];
    let particles = [];
    const addBurst = (x, y, count = 52) => {
      particles.push(...makeBurst(x, y, count, colors, {
        minSpeed: 1.8,
        maxSpeed: 7.2,
        minSize: 2,
        maxSize: 5.8,
        life: 250,
        shapes: ['dot', 'dot', 'star', 'flare']
      }));
    };
    for (let i = 0; i < (options.burstCount || 10); i++) {
      addBurst(window.innerWidth * (0.12 + Math.random() * 0.76), window.innerHeight * (0.14 + Math.random() * 0.52), 42);
    }
    if (options.centralExplosions) {
      addBurst(window.innerWidth / 2, window.innerHeight * 0.46, 90);
      addBurst(window.innerWidth / 2, window.innerHeight * 0.58, 70);
    }
    let lastTime = start;
    function draw() {
      const delta = celebrationFrameDelta(lastTime);
      lastTime = performance.now();
      resizeCanvas(canvas, ctx);
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      particles = particles.filter(p => p.life > 0);
      if (celebrationElapsed(start) < duration - 900 && Math.random() < 0.05 * delta) {
        addBurst(window.innerWidth * (0.1 + Math.random() * 0.8), window.innerHeight * (0.14 + Math.random() * 0.56), 34);
      }
      particles.forEach(p => {
        p.x += p.vx * delta;
        p.y += p.vy * delta;
        p.vy += 0.04 * delta;
        p.vx *= Math.pow(0.994, delta);
        p.life -= delta;
        p.spin += p.spinSpeed * delta;
        ctx.globalAlpha = Math.max(p.life / p.maxLife, 0);
        drawSpark(ctx, p);
      });
      ctx.globalAlpha = 1;
      if (celebrationElapsed(start) < duration) requestAnimationFrame(draw);
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
