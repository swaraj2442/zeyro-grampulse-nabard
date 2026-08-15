export function startSmokyDustTrail(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return () => {};

  let rafId: number;
  let particles: { x: number; y: number; life: number; maxLife: number; size: number; vx: number; vy: number }[] = [];
  
  let pointer = { x: -9999, y: -9999 };
  let lastSpawn = { x: -9999, y: -9999 };
  const minSpawnDist = 8; // spawn dust frequently for smooth trail

  const handlePointerMove = (e: PointerEvent) => {
    const rect = canvas.getBoundingClientRect();
    pointer.x = e.clientX - rect.left;
    pointer.y = e.clientY - rect.top;

    if (lastSpawn.x === -9999) {
      lastSpawn = { ...pointer };
      return;
    }

    const dist = Math.hypot(pointer.x - lastSpawn.x, pointer.y - lastSpawn.y);
    if (dist > minSpawnDist) {
      const steps = Math.ceil(dist / minSpawnDist);
      for(let i=1; i<=steps; i++) {
        particles.push({
          x: lastSpawn.x + (pointer.x - lastSpawn.x) * (i/steps),
          y: lastSpawn.y + (pointer.y - lastSpawn.y) * (i/steps),
          life: 40 + Math.random() * 30, // Random life span
          maxLife: 70,
          size: 15 + Math.random() * 15, // Small dust particles
          vx: (Math.random() - 0.5) * 1.5, // Drift slightly horizontally
          vy: (Math.random() - 0.8) * 1.5  // Drift generally upwards
        });
      }
      lastSpawn = { ...pointer };
    }
  };

  window.addEventListener('pointermove', handlePointerMove);

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
    ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  
  resize();
  window.addEventListener('resize', resize);

  function draw() {
    if (!ctx) return;
    
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    // Clear frame completely
    ctx.clearRect(0, 0, width, height);

    // Update and filter particles
    particles = particles.filter(p => {
      p.life -= 1;
      p.x += p.vx;
      p.y += p.vy;
      p.size += 0.2; // Expand slightly as it drifts
      return p.life > 0;
    });

    ctx.globalCompositeOperation = 'lighter';

    particles.forEach(p => {
      const progress = p.life / p.maxLife; // 1 to 0
      const opacity = Math.pow(progress, 1.2) * 0.4; // Fade out curve
      
      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
      // Soft white/gray smoke
      grad.addColorStop(0, `rgba(255, 255, 255, ${opacity})`);
      grad.addColorStop(0.5, `rgba(255, 255, 255, ${opacity * 0.3})`);
      grad.addColorStop(1, `rgba(255, 255, 255, 0)`);
      
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });

    rafId = requestAnimationFrame(draw);
  }

  rafId = requestAnimationFrame(draw);

  return () => {
    cancelAnimationFrame(rafId);
    window.removeEventListener('pointermove', handlePointerMove);
    window.removeEventListener('resize', resize);
  };
}
