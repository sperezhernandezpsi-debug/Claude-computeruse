// Efecto de confeti con canvas — sin librerías externas.
const Confetti = (() => {
  const canvas = document.getElementById('confetti-canvas');
  const ctx = canvas.getContext('2d');
  let particles = [];
  let animating = false;
  const colors = ['#f97316', '#ec4899', '#8b5cf6', '#22c55e', '#eab308', '#3b82f6'];

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  function makeParticle() {
    return {
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * canvas.height * 0.3,
      w: 6 + Math.random() * 6,
      h: 8 + Math.random() * 8,
      color: colors[Math.floor(Math.random() * colors.length)],
      speedY: 2 + Math.random() * 3,
      speedX: -2 + Math.random() * 4,
      rotation: Math.random() * 360,
      rotSpeed: -8 + Math.random() * 16,
      life: 0,
      maxLife: 140 + Math.random() * 60
    };
  }

  function step() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.x += p.speedX;
      p.y += p.speedY;
      p.rotation += p.rotSpeed;
      p.life++;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, 1 - p.life / p.maxLife);
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    });
    particles = particles.filter(p => p.life < p.maxLife && p.y < canvas.height + 40);
    if (particles.length > 0) {
      requestAnimationFrame(step);
    } else {
      animating = false;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  return {
    burst(count = 90) {
      for (let i = 0; i < count; i++) particles.push(makeParticle());
      if (!animating) {
        animating = true;
        requestAnimationFrame(step);
      }
    }
  };
})();
