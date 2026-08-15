export function startPremiumFluidMask(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return { stop: () => {}, triggerReveal: () => {} };

  let animationFrameId: number;
  let particles: Particle[] = [];
  let mouse = { x: -1000, y: -1000, vx: 0, vy: 0 };
  let lastMouse = { x: -1000, y: -1000 };
  let width = 0;
  let height = 0;

  const brushCanvas = document.createElement('canvas');
  const brushSize = 256;
  brushCanvas.width = brushSize;
  brushCanvas.height = brushSize;
  const bCtx = brushCanvas.getContext('2d')!;
  
  for (let i = 0; i < 5; i++) {
    const ox = brushSize / 2 + (Math.random() - 0.5) * (brushSize * 0.2);
    const oy = brushSize / 2 + (Math.random() - 0.5) * (brushSize * 0.2);
    const r = (brushSize / 2) * (Math.random() * 0.4 + 0.6);
    
    const grad = bCtx.createRadialGradient(ox, oy, 0, ox, oy, r);
    grad.addColorStop(0, `rgba(255, 255, 255, 0.4)`);
    grad.addColorStop(0.4, `rgba(255, 255, 255, 0.15)`);
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    bCtx.fillStyle = grad;
    bCtx.beginPath();
    bCtx.arc(ox, oy, r, 0, Math.PI * 2);
    bCtx.fill();
  }

  const resizeCanvas = () => {
    const parent = canvas.parentElement;
    if (!parent) return;
    width = parent.clientWidth;
    height = parent.clientHeight;
    
    canvas.width = width;
    canvas.height = height;
    canvas.style.width = `100%`;
    canvas.style.height = `100%`;
    
    permanentCanvas.width = width;
    permanentCanvas.height = height;
  };

  window.addEventListener('resize', resizeCanvas);
  // Initial resize needs a tiny delay to let parent flexbox render bounds
  setTimeout(resizeCanvas, 0);

  class Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    baseSize: number;
    life: number;
    maxLife: number;
    angle: number;

    constructor(x: number, y: number, vx: number, vy: number) {
      this.x = x;
      this.y = y;
      
      const scatter = 0.2;
      this.vx = vx * 0.02 + (Math.random() - 0.5) * scatter;
      this.vy = vy * 0.02 + (Math.random() - 0.5) * scatter;
      
      this.baseSize = Math.random() * 80 + 160; 
      this.life = 0; 
      this.maxLife = Math.random() * 60 + 200; 
      this.angle = Math.random() * Math.PI * 2;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.vx *= 0.90;
      this.vy *= 0.90;
      this.life += 1;
    }

    draw() {
      if (this.life >= this.maxLife) return;

      const progress = this.life / this.maxLife;
      
      let curve = 1;
      if (progress < 0.1) {
        curve = Math.sin((progress / 0.1) * (Math.PI / 2));
      } else if (progress > 0.7) {
        curve = Math.pow(Math.sin(((1 - progress) / 0.3) * (Math.PI / 2)), 0.8);
      } else {
        curve = 1;
      }
      
      const currentSize = this.baseSize * curve;
      const alpha = curve;

      ctx!.globalAlpha = Math.max(0, alpha);
      
      ctx!.translate(this.x, this.y);
      ctx!.rotate(this.angle);
      
      ctx!.drawImage(
        brushCanvas, 
        -currentSize / 2, 
        -currentSize / 2, 
        currentSize, 
        currentSize
      );

      ctx!.rotate(-this.angle);
      ctx!.translate(-this.x, -this.y);
    }
  }

  let currentMaskAlpha = 0.8;
  let targetMaskAlpha = 0.8;
  let revealDelayFrames = 0;

  const handleMouseMove = (e: MouseEvent | PointerEvent | TouchEvent) => {
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as MouseEvent).clientX;
      clientY = (e as MouseEvent).clientY;
    }

    const rect = canvas.getBoundingClientRect();
    mouse.x = clientX - rect.left;
    mouse.y = clientY - rect.top;

    mouse.vx = mouse.x - lastMouse.x;
    mouse.vy = mouse.y - lastMouse.y;
    
    const dist = Math.hypot(mouse.vx, mouse.vy);
    const steps = Math.max(1, Math.floor(dist / 4)); 
    
    if (lastMouse.x !== -1000) {
      for (let i = 0; i < steps; i++) {
        const t = i / steps;
        const ix = lastMouse.x + mouse.vx * t;
        const iy = lastMouse.y + mouse.vy * t;
        particles.push(new Particle(ix, iy, mouse.vx, mouse.vy));
      }
    }

    lastMouse.x = mouse.x;
    lastMouse.y = mouse.y;
  };

  window.addEventListener('mousemove', handleMouseMove);
  window.addEventListener('touchmove', handleMouseMove);

  let explosionFrames = 0;
  
  // Brush typing variables
  const permanentCanvas = document.createElement('canvas');
  const pCtx = permanentCanvas.getContext('2d')!;
  let textPixels: {x: number, y: number}[] = [];
  let textTypingActive = false;
  let textRevealTimer = -1;

  // Sharp brush specifically for the text to keep it legible
  const textBrushCanvas = document.createElement('canvas');
  textBrushCanvas.width = 16;
  textBrushCanvas.height = 16;
  const tbCtx = textBrushCanvas.getContext('2d')!;
  const tbGrad = tbCtx.createRadialGradient(8, 8, 0, 8, 8, 8);
  tbGrad.addColorStop(0, 'rgba(255, 255, 255, 1)');
  tbGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.8)');
  tbGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
  tbCtx.fillStyle = tbGrad;
  tbCtx.beginPath();
  tbCtx.arc(8, 8, 8, 0, Math.PI * 2);
  tbCtx.fill();

  const loop = () => {
    ctx.globalCompositeOperation = 'source-over';
    
    ctx.globalAlpha = 1.0;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = `rgba(255, 255, 255, 0.8)`;
    ctx.fillRect(0, 0, width, height);

    if (explosionFrames > 0) {
      explosionFrames--;
      const cx = width / 2;
      const cy = height / 2;
      
      // spawnTime goes from 0 to 90 as the explosion progresses
      const spawnTime = 90 - explosionFrames; 
      const progress = spawnTime / 90; // goes from 0.0 to 1.0

      for (let i = 0; i < 4; i++) {
        const angle = Math.random() * Math.PI * 2;
        // Spread particles further out over time
        const dist = progress * (Math.max(width, height) * 0.7) + (Math.random() * 80); 
        
        const px = cx + Math.cos(angle) * dist;
        const py = cy + Math.sin(angle) * dist;
        
        const p = new Particle(px, py, 0, 0);
        
        // Very slow outward drift
        const speed = Math.random() * 5 + 1;
        p.vx = Math.cos(angle) * speed;
        p.vy = Math.sin(angle) * speed;
        p.baseSize = Math.random() * 400 + 300; 
        
        // REVERSE HEAL LOGIC:
        // We want the frost to heal from the outside edges back towards the center.
        // This means the outer particles (progress near 1.0) must die FIRST.
        // The inner particles (progress near 0.0) must die LAST.
        // Inner particles get a massive maxLife boost, outer particles get less.
        const reverseHealBoost = (1 - progress) * 180; 
        p.maxLife = 120 + reverseHealBoost + (Math.random() * 40); 
        
        particles.push(p);
      }
    }

    ctx.globalCompositeOperation = 'destination-out';
    
    // Draw the permanent scratches (the brushed text)
    ctx.drawImage(permanentCanvas, 0, 0);
    
    // Animate the brush typing
    if (textRevealTimer > 0) {
      textRevealTimer--;
    } else if (textRevealTimer === 0) {
      textTypingActive = true;
      textRevealTimer = -1;
    }

    if (textTypingActive && textPixels.length > 0) {
      // Draw faster so it finishes in 1.5 seconds
      const pixelsPerFrame = Math.max(1, Math.floor(textPixels.length / 90)); 
      for (let i = 0; i < pixelsPerFrame && textPixels.length > 0; i++) {
        const pLoc = textPixels.shift()!;
        
        const size = Math.random() * 4 + 4; // 4 to 8px sharp brush stamp
        const alpha = Math.random() * 0.4 + 0.6; // High opacity
        pCtx.globalAlpha = alpha;
        pCtx.translate(pLoc.x, pLoc.y);
        pCtx.rotate(Math.random() * Math.PI * 2);
        pCtx.drawImage(textBrushCanvas, -size/2, -size/2, size, size);
        pCtx.setTransform(1, 0, 0, 1, 0, 0);
      }
    }
    
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.update();
      p.draw();
      if (p.life >= p.maxLife) {
        particles.splice(i, 1);
      }
    }

    ctx.globalAlpha = 1.0;
    animationFrameId = requestAnimationFrame(loop);
  };

  loop();

  const triggerReveal = () => {
    // No explosion/heal effect, jump straight to typing
    explosionFrames = 0;
    
    // Start typing the text immediately after the card dissolves (45 frames = 0.75s)
    textRevealTimer = 45;
    
    // Generate the path for the brush to follow!
    const tCanvas = document.createElement('canvas');
    tCanvas.width = width;
    tCanvas.height = height;
    const tCtx = tCanvas.getContext('2d', { willReadFrequently: true });
    if (!tCtx) return;
    
    tCtx.fillStyle = 'white';
    tCtx.textAlign = 'center';
    tCtx.textBaseline = 'middle';
    
    // Use a lighter font weight so the strokes are thin and legible when traced
    if (width < 768) {
      tCtx.font = "300 36px system-ui, -apple-system, sans-serif";
      tCtx.fillText("we'll be in", width / 2, height / 2 - 24);
      tCtx.fillText("touch soon", width / 2, height / 2 + 24);
    } else {
      tCtx.font = "300 72px system-ui, -apple-system, sans-serif";
      tCtx.fillText("we'll be in touch soon", width / 2, height / 2);
    }
    
    const imgData = tCtx.getImageData(0, 0, width, height).data;
    textPixels = [];
    
    // Ultra-high resolution sampling (stride 2) for crisp lines
    for (let y = 0; y < height; y += 2) {
      for (let x = 0; x < width; x += 2) {
        const alpha = imgData[(y * width + x) * 4 + 3];
        if (alpha > 50) {
          // Organic jitter 1-2px
          textPixels.push({ x: x + (Math.random()-0.5)*2, y: y + (Math.random()-0.5)*2 });
        }
      }
    }
    
    // Sort pixels from left to right so the brush types from left to right!
    textPixels.sort((a, b) => a.x - b.x);
  };

  return {
    stop: () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    },
    triggerReveal
  };
}
