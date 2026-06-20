import React, { useRef, useEffect } from 'react';

const AtmosphereEffect = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * DPR;
      canvas.height = rect.height * DPR;
      ctx.scale(dpr, dpr);
    };

    const DPR = window.devicePixelRatio || 1;
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Floating Dust Particles
    const dustParticles = [];
    const maxDust = 45;

    // Soft Mist clouds
    const mistClouds = [];
    const maxMist = 6;

    const createDust = (w, h, initial = false) => ({
      x: Math.random() * w,
      y: initial ? Math.random() * h : h + 20,
      size: Math.random() * 2 + 0.5,
      vx: (Math.random() - 0.5) * 0.4,
      vy: -Math.random() * 0.5 - 0.2,
      alpha: Math.random() * 0.5 + 0.1,
      maxAlpha: Math.random() * 0.5 + 0.2,
      fadeSpeed: 0.002 + Math.random() * 0.003
    });

    const createMist = (w, h, initial = false) => ({
      x: Math.random() * w,
      y: initial ? Math.random() * h : h + 150,
      radius: Math.random() * 200 + 150,
      vx: (Math.random() - 0.5) * 0.15,
      vy: -Math.random() * 0.1 - 0.05,
      alpha: 0,
      maxAlpha: Math.random() * 0.06 + 0.015,
      fadeSpeed: 0.0005 + Math.random() * 0.0005,
      driftTime: Math.random() * 100
    });

    // Populate initial state
    const w = canvas.width / DPR;
    const h = canvas.height / DPR;
    for (let i = 0; i < maxDust; i++) {
      dustParticles.push(createDust(w, h, true));
    }
    for (let i = 0; i < maxMist; i++) {
      mistClouds.push(createMist(w, h, true));
    }

    const draw = () => {
      const w = canvas.width / DPR;
      const h = canvas.height / DPR;
      ctx.clearRect(0, 0, w, h);

      // --- 1. RENDER SOFT DRIFTING MIST CLOUDS ---
      mistClouds.forEach((m, idx) => {
        m.x += m.vx;
        m.y += m.vy;
        m.driftTime += 0.01;

        // Fade in/out cycle
        if (m.y < -m.radius) {
          mistClouds[idx] = createMist(w, h, false);
        }

        if (m.alpha < m.maxAlpha) {
          m.alpha += m.fadeSpeed * 2;
        }

        const xDrift = m.x + Math.sin(m.driftTime) * 30;

        // Radial gradient mist cloud
        const grad = ctx.createRadialGradient(
          xDrift, m.y, 0,
          xDrift, m.y, m.radius
        );
        // Earthy ambient silt fog colors
        grad.addColorStop(0, `rgba(36, 29, 26, ${m.alpha * 0.95})`);
        grad.addColorStop(0.5, `rgba(18, 14, 13, ${m.alpha * 0.55})`);
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(xDrift, m.y, m.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // --- 2. RENDER FLOATING DUST AMBERS ---
      dustParticles.forEach((p, idx) => {
        p.x += p.vx;
        p.y += p.vy;

        // Fade out as it rises near top
        if (p.y < 30) {
          p.alpha -= 0.01;
        }

        // Spawn new dust if out of screen bounds or fully faded
        if (p.y < 0 || p.x < -10 || p.x > w + 10 || p.alpha <= 0) {
          dustParticles[idx] = createDust(w, h, false);
        }

        // Soft shimmer/twinkle
        const glowVal = p.alpha + Math.sin(p.y * 0.05 + p.x * 0.05) * 0.12;
        const opacity = Math.max(0.02, Math.min(1.0, glowVal));

        // Warm light amber color
        ctx.fillStyle = `rgba(212, 163, 115, ${opacity * 0.8})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        // Tiny radial bloom for larger particles
        if (p.size > 1.8) {
          ctx.fillStyle = `rgba(217, 119, 6, ${opacity * 0.22})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 2.8, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 2,
        pointerEvents: 'none',
        mixBlendMode: 'screen'
      }}
    />
  );
};

export default AtmosphereEffect;
