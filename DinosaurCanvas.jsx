import React, { useRef, useEffect } from 'react';

const DinosaurCanvas = ({ isRunning = false }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;

    // Canvas size adjustment
    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Skeleton Animation States
    let time = 0;
    const particles = []; // Dust kicked up by foot steps

    // Skeleton position relative to center of screen
    const dinoPos = { x: 0.5, y: 0.65 }; 
    const stepSpeed = isRunning ? 0.08 : 0.038;

    const drawDino = (ctx, cx, cy, scale) => {
      time += stepSpeed;

      // 1. GAIT CYCLE CALCULATION (Out of phase by PI for far/near leg)
      const phase1 = time;
      const phase2 = time + Math.PI;

      // Hip joint relative to center
      const hipX = cx - 18 * scale;
      const hipY = cy - 2 * scale;

      const calcLegJoints = (phase) => {
        const thighLen = 35 * scale;
        const shinLen = 30 * scale;
        
        // Thigh angle swings back and forth
        const thighAngle = Math.sin(phase) * 0.45 + (isRunning ? 0.2 : 0.1);
        
        // Knee flexes mostly when swinging forward
        const kneeAngle = (Math.cos(phase + 0.5) * 0.4 + 0.45) * (isRunning ? 1.4 : 1.0);
        
        // Knee coordinates
        const kneeX = hipX + Math.sin(thighAngle) * thighLen;
        const kneeY = hipY + Math.cos(thighAngle) * thighLen;
        
        // Ankle joint coordinates
        const ankleAngle = thighAngle - kneeAngle;
        const ankleX = kneeX - Math.sin(ankleAngle) * shinLen;
        const ankleY = kneeY + Math.cos(ankleAngle) * shinLen;
        
        // Foot claws coordinates
        const footX = ankleX + 16 * scale;
        const footY = ankleY + 2 * scale;

        // Kick up subtle dust particles on step impacts
        const groundLevel = cy + 63 * scale;
        if (ankleY >= groundLevel - 2 && Math.cos(phase) > 0.8) {
          if (Math.random() < 0.2) {
            particles.push({
              x: ankleX,
              y: groundLevel,
              vx: (Math.random() - 0.5) * 1.5 - (isRunning ? 3 : 0.8),
              vy: -Math.random() * 1.5 - 0.2,
              alpha: 0.5,
              size: Math.random() * 2 + 1
            });
          }
        }

        return { hipX, hipY, kneeX, kneeY, ankleX, ankleY, footX, footY };
      };

      const leg1 = calcLegJoints(phase1);   // Near side leg
      const leg2 = calcLegJoints(phase2);   // Far side leg

      // 2. TORSO & BREATHING BOBBING
      const bobY = Math.sin(time * 2) * 2.8 * scale;
      const chestBob = Math.sin(time) * 1.5 * scale;
      
      const spineStartX = cx - 55 * scale;
      const spineStartY = cy - bobY;
      
      const spineMidX = cx;
      const spineMidY = cy - 8 * scale - bobY;
      
      const spineEndX = cx + 50 * scale;
      const spineEndY = cy - 4 * scale - bobY;

      // Draw dust particles
      particles.forEach((p, index) => {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.015;
        p.size *= 0.98;

        ctx.fillStyle = `rgba(212, 163, 115, ${p.alpha * 0.4})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        if (p.alpha <= 0) {
          particles.splice(index, 1);
        }
      });

      // 3. DRAW DUSK TRANSPARENT WATERMARK SKELETON
      ctx.lineWidth = 1.8 * scale;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Soft copper watermark color
      const boneStrokeColor = 'rgba(212, 163, 115, 0.12)'; 
      const boneStrokeColorFar = 'rgba(212, 163, 115, 0.05)';

      // --- BACK LEG (LEG 2) ---
      ctx.strokeStyle = boneStrokeColorFar;
      ctx.beginPath();
      ctx.moveTo(leg2.hipX, leg2.hipY);
      ctx.lineTo(leg2.kneeX, leg2.kneeY);
      ctx.lineTo(leg2.ankleX, leg2.ankleY);
      ctx.lineTo(leg2.footX, leg2.footY);
      ctx.stroke();

      // --- TAIL WHIP ---
      ctx.strokeStyle = boneStrokeColor;
      ctx.beginPath();
      ctx.moveTo(spineStartX, spineStartY);
      
      const tailSegmentCount = 12;
      for (let i = 1; i <= tailSegmentCount; i++) {
        const segRatio = i / tailSegmentCount;
        const tailWhip = Math.sin(time - segRatio * 3.5) * 8 * segRatio * scale;
        const tx = spineStartX - i * 9 * scale;
        const ty = spineStartY + Math.pow(segRatio, 1.8) * 16 * scale + tailWhip;
        ctx.lineTo(tx, ty);
        
        ctx.moveTo(tx, ty);
        ctx.lineTo(tx + 1*scale, ty - (5 * (1 - segRatio) * scale));
        ctx.moveTo(tx, ty);
      }
      ctx.stroke();

      // --- TORSO SPINE & RIBCAGE ---
      ctx.beginPath();
      ctx.moveTo(spineStartX, spineStartY);
      ctx.quadraticCurveTo(spineMidX, spineMidY, spineEndX, spineEndY);
      ctx.stroke();

      const ribCount = 6;
      for (let i = 0; i < ribCount; i++) {
        const t = 0.2 + (i / ribCount) * 0.6;
        const rx = (1-t)*(1-t)*spineStartX + 2*(1-t)*t*spineMidX + t*t*spineEndX;
        const ry = (1-t)*(1-t)*spineStartY + 2*(1-t)*t*spineMidY + t*t*spineEndY;
        const ribLen = (32 - Math.abs(i - 2) * 4.5) * scale + chestBob;
        ctx.beginPath();
        ctx.moveTo(rx, ry);
        ctx.quadraticCurveTo(rx - 4 * scale, ry + ribLen * 0.5, rx - 8 * scale, ry + ribLen);
        ctx.stroke();
      }

      // --- FOREARMS ---
      const shoulderX = spineEndX - 8 * scale;
      const shoulderY = spineEndY + 4 * scale;
      const armSwing = Math.sin(time * 2.5) * 5 * scale;
      ctx.beginPath();
      ctx.moveTo(shoulderX, shoulderY);
      ctx.lineTo(shoulderX + 10 * scale, shoulderY + 8 * scale + armSwing);
      ctx.lineTo(shoulderX + 16 * scale, shoulderY + 6 * scale + armSwing);
      ctx.stroke();

      // --- FORE LEG (LEG 1) ---
      ctx.strokeStyle = 'rgba(212, 163, 115, 0.16)'; // slightly thicker foreground
      ctx.beginPath();
      ctx.moveTo(leg1.hipX, leg1.hipY);
      ctx.lineTo(leg1.kneeX, leg1.kneeY);
      ctx.lineTo(leg1.ankleX, leg1.ankleY);
      ctx.lineTo(leg1.footX, leg1.footY);
      ctx.stroke();

      // --- NECK & SKULL ---
      const neckEndX = spineEndX + 16 * scale;
      const neckEndY = spineEndY - 15 * scale + Math.sin(time) * 2 * scale;
      ctx.strokeStyle = boneStrokeColor;
      ctx.beginPath();
      ctx.moveTo(spineEndX, spineEndY);
      ctx.quadraticCurveTo(spineEndX + 8*scale, spineEndY - 12*scale, neckEndX, neckEndY);
      ctx.stroke();

      ctx.save();
      ctx.translate(neckEndX, neckEndY);
      ctx.rotate(Math.sin(time)*0.08 - 0.05);

      ctx.strokeStyle = 'rgba(212, 163, 115, 0.18)';
      ctx.beginPath();
      ctx.arc(10 * scale, -8 * scale, 12 * scale, Math.PI, Math.PI * 2.2);
      ctx.lineTo(42 * scale, -8 * scale);
      ctx.lineTo(44 * scale, 0);
      ctx.lineTo(20 * scale, 2 * scale);
      ctx.lineTo(0, 0);
      ctx.closePath();
      ctx.stroke();

      // Jaw Snapping
      const jawRotation = Math.max(0, Math.sin(time * 2 + 1) * 0.15);
      ctx.save();
      ctx.translate(4 * scale, 2 * scale);
      ctx.rotate(jawRotation);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(38 * scale, 0);
      ctx.lineTo(36 * scale, 5 * scale);
      ctx.lineTo(0, 3 * scale);
      ctx.closePath();
      ctx.stroke();
      ctx.restore();

      ctx.restore();
    };

    // Main Draw Loop
    const draw = () => {
      const w = canvas.width / DPR;
      const h = canvas.height / DPR;
      ctx.clearRect(0, 0, w, h);

      const cx = w * dinoPos.x;
      const cy = h * dinoPos.y;
      const scale = Math.min(w, h) * 0.0028;

      // Draw ground track lines
      ctx.strokeStyle = 'rgba(212, 163, 115, 0.03)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(w * 0.05, cy + 63 * scale);
      ctx.lineTo(w * 0.95, cy + 63 * scale);
      ctx.stroke();

      ctx.setLineDash([12, 12]);
      ctx.strokeStyle = 'rgba(212, 163, 115, 0.06)';
      ctx.beginPath();
      ctx.moveTo(w * 0.15, cy + 63 * scale);
      ctx.lineTo(w * 0.85, cy + 63 * scale);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw the beautiful translucent watermark skeleton directly
      drawDino(ctx, cx, cy, scale);

      animationId = requestAnimationFrame(draw);
    };

    const DPR = window.devicePixelRatio || 1;
    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [isRunning]);

  return (
    <div 
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 1,
        overflow: 'hidden',
        pointerEvents: 'none', /* Crucial: clicks go through to inputs/buttons */
        background: 'radial-gradient(circle at 50% 50%, rgba(20, 16, 14, 0.22) 0%, rgba(8, 7, 6, 0.45) 100%)'
      }}
    >
      <canvas 
        ref={canvasRef} 
        style={{
          width: '100%',
          height: '100%',
          display: 'block'
        }}
      />
    </div>
  );
};

export default DinosaurCanvas;
