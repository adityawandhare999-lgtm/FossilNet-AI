import React, { useRef, useEffect, useState } from 'react';
import { Sparkles, Trash2, Hammer, Droplets } from 'lucide-react';

const DiggingLab = () => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [clearedPercentage, setClearedPercentage] = useState(0);
  const [activeTool, setActiveTool] = useState('brush'); // 'brush' or 'chisel'
  const [discoveryState, setDiscoveryState] = useState('digging'); // 'digging', 'uncovered'
  const [particles, setParticles] = useState([]);

  // Fossil configuration - drawing coordinates for a beautiful fossil skeleton
  // We place a SVG representing the fossil directly behind the canvas!
  const RaptorSkeletonSVG = () => (
    <svg 
      viewBox="0 0 400 240" 
      fill="none" 
      stroke="#eae3db" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      style={{
        width: '85%',
        height: '85%',
        opacity: 0.85,
        filter: 'drop-shadow(0 10px 18px rgba(0,0,0,0.8)) drop-shadow(0 0 10px rgba(212,163,115,0.25))',
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1,
        pointerEvents: 'none'
      }}
    >
      {/* Skull */}
      <path d="M 310 100 C 310 90, 340 70, 360 80 C 375 88, 380 105, 365 110 C 345 110, 335 105, 320 115 C 312 118, 310 112, 310 100 Z" fill="rgba(36,29,26,0.3)" />
      <circle cx="330" cy="90" r="3" fill="#080706" />
      <path d="M 330 110 L 333 114 L 336 110 L 339 114 L 342 110 L 345 114 L 348 110 L 351 114 L 354 110" />
      
      {/* Lower jaw */}
      <path d="M 320 115 C 330 120, 355 122, 360 122 C 350 126, 330 125, 322 120 Z" />
      
      {/* Neck */}
      <path d="M 310 100 Q 285 90, 275 110 Q 268 125, 255 125" />
      <path d="M 300 105 Q 285 100, 275 115" />
      
      {/* Spine / Torso */}
      <path d="M 255 125 C 220 120, 180 130, 145 150" strokeWidth="2.5" />
      
      {/* Ribs */}
      <path d="M 245 125 Q 248 150, 235 155" />
      <path d="M 233 125 Q 235 154, 222 158" />
      <path d="M 221 126 Q 223 158, 209 162" />
      <path d="M 209 127 Q 210 160, 196 164" />
      <path d="M 197 129 Q 197 160, 184 163" />
      <path d="M 185 132 Q 183 158, 172 158" />
      
      {/* Arms / Claws */}
      <path d="M 250 135 L 268 152 L 285 148 L 290 154" />
      <path d="M 268 152 L 280 162 L 284 168" />
      
      {/* Pelvis */}
      <path d="M 152 148 C 145 140, 130 148, 125 160 C 130 168, 148 165, 152 148 Z" fill="rgba(36,29,26,0.3)" />
      
      {/* Tail - long, articulated */}
      <path d="M 125 152 Q 90 152, 60 140 Q 30 128, 15 130" strokeWidth="2" />
      <path d="M 115 151 L 114 143" />
      <path d="M 100 150 L 98 141" />
      <path d="M 85 148 L 82 139" />
      <path d="M 70 145 L 67 137" />
      <path d="M 55 140 L 52 133" />
      <path d="M 40 134 L 38 128" />
      
      {/* Back leg (Far) */}
      <path d="M 148 155 L 175 192 L 165 220 L 180 224" opacity="0.4" />
      
      {/* Front leg (Near) */}
      <path d="M 142 155 L 168 190 L 155 222 C 155 222, 172 225, 176 226 M 155 222 L 165 228" strokeWidth="2.5" />
      {/* The famous raptor killing claw! */}
      <path d="M 155 222 Q 140 216, 144 205" strokeWidth="2.5" stroke="#d4a373" />
      
      {/* Stone outline grid background */}
      <circle cx="200" cy="120" r="115" stroke="rgba(212,163,115,0.06)" strokeDasharray="3 6" />
    </svg>
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Draw the excavation soil layer on canvas
    const drawSandLayer = () => {
      const w = canvas.width;
      const h = canvas.height;
      
      // Clear
      ctx.globalCompositeOperation = 'source-over';
      
      // Base sandstone soil gradient
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, '#2c2520'); // Sedimentary rock
      grad.addColorStop(0.4, '#382f2a');
      grad.addColorStop(0.7, '#241d1a');
      grad.addColorStop(1, '#1a1412');
      
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Add dynamic sand particles texture directly to canvas
      ctx.fillStyle = 'rgba(212, 163, 115, 0.08)';
      for (let i = 0; i < 2200; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const size = Math.random() * 2 + 0.5;
        ctx.fillRect(x, y, size, size);
      }

      // Draw subtle cracks in the stone layer to show fractures
      ctx.strokeStyle = 'rgba(10, 8, 7, 0.6)';
      ctx.lineWidth = 1.5;
      
      const drawCrack = (sx, sy, segments) => {
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        let cx = sx;
        let cy = sy;
        for (let i = 0; i < segments; i++) {
          cx += (Math.random() - 0.5) * 25 + 5;
          cy += (Math.random() - 0.2) * 15 + 8;
          ctx.lineTo(cx, cy);
        }
        ctx.stroke();
      };

      drawCrack(50, 40, 8);
      drawCrack(w - 180, 30, 6);
      drawCrack(120, h - 90, 7);

      // Draw coordinate tags
      ctx.font = '7px Courier New';
      ctx.fillStyle = 'rgba(212, 163, 115, 0.25)';
      ctx.fillText("EXCAVATION GRID // BLOCK-D7", 20, 25);
      ctx.fillText("MATRIX LAYER: SEDIMENTARY II", 20, 38);
      ctx.fillText("DEP: 8.4M", w - 80, 25);
    };

    drawSandLayer();
  }, []);

  // Handle particle physics looping
  useEffect(() => {
    if (particles.length === 0) return;

    let frameId;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const updateParticles = () => {
      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vy: p.vy + 0.16, // gravity
            alpha: p.alpha - 0.035,
            size: p.size * 0.95
          }))
          .filter((p) => p.alpha > 0)
      );

      frameId = requestAnimationFrame(updateParticles);
    };

    frameId = requestAnimationFrame(updateParticles);
    return () => cancelAnimationFrame(frameId);
  }, [particles]);

  const handleDig = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();

    // Support both mouse and touch coordinates
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);

    if (!clientX || !clientY) return;

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    // Trigger "destination-out" erasing
    ctx.globalCompositeOperation = 'destination-out';
    
    // Customize radius depending on tool
    const radius = activeTool === 'chisel' ? 24 : 32;
    
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    // Spawn sand/rock flying particles
    const newParticles = [];
    const particleCount = activeTool === 'chisel' ? 12 : 5;
    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 4 + (activeTool === 'chisel' ? (Math.random() - 0.5) * 3 : 0),
        vy: -Math.random() * 3 - 1,
        size: Math.random() * (activeTool === 'chisel' ? 5 : 2.5) + 1,
        alpha: 0.9,
        color: activeTool === 'chisel' ? '#5c4f46' : '#d4a373'
      });
    }

    setParticles((prev) => [...prev, ...newParticles].slice(-100)); // cap at 100 particles

    // Recalculate cleared percentage (sample grid points to optimize)
    checkClearedPercentage(ctx, canvas.width, canvas.height);
  };

  const checkClearedPercentage = (ctx, w, h) => {
    // Sample a 12x12 grid to check transparent pixels
    const sampleSize = 12;
    let transparentCount = 0;
    const totalSamples = sampleSize * sampleSize;

    for (let i = 0; i < sampleSize; i++) {
      for (let j = 0; j < sampleSize; j++) {
        const sx = Math.floor((i / sampleSize) * w);
        const sy = Math.floor((j / sampleSize) * h);
        const pixel = ctx.getImageData(sx, sy, 1, 1).data;
        // alpha pixel index is 3
        if (pixel[3] === 0) {
          transparentCount++;
        }
      }
    }

    const percentage = Math.round((transparentCount / totalSamples) * 100);
    setClearedPercentage(percentage);

    if (percentage > 68 && discoveryState === 'digging') {
      setDiscoveryState('uncovered');
    }
  };

  const resetDigsite = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Draw opaque layer back
    ctx.globalCompositeOperation = 'source-over';
    
    const w = canvas.width;
    const h = canvas.height;
    
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#2c2520');
    grad.addColorStop(0.4, '#382f2a');
    grad.addColorStop(0.7, '#241d1a');
    grad.addColorStop(1, '#1a1412');
    
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = 'rgba(212, 163, 115, 0.08)';
    for (let i = 0; i < 2200; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      const size = Math.random() * 2 + 0.5;
      ctx.fillRect(x, y, size, size);
    }

    // Cracks
    ctx.strokeStyle = 'rgba(10, 8, 7, 0.6)';
    ctx.lineWidth = 1.5;
    const drawCrack = (sx, sy, segments) => {
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      let cx = sx;
      let cy = sy;
      for (let i = 0; i < segments; i++) {
        cx += (Math.random() - 0.5) * 25 + 5;
        cy += (Math.random() - 0.2) * 15 + 8;
        ctx.lineTo(cx, cy);
      }
      ctx.stroke();
    };
    drawCrack(50, 40, 8);
    drawCrack(w - 180, 30, 6);
    drawCrack(120, h - 90, 7);

    ctx.font = '7px Courier New';
    ctx.fillStyle = 'rgba(212, 163, 115, 0.25)';
    ctx.fillText("EXCAVATION GRID // BLOCK-D7", 20, 25);
    ctx.fillText("MATRIX LAYER: SEDIMENTARY II", 20, 38);
    ctx.fillText("DEP: 8.4M", w - 80, 25);

    setClearedPercentage(0);
    setDiscoveryState('digging');
  };

  // Draw fly particles on absolute overlay canvas
  const renderOverlayParticles = () => {
    return particles.map((p, idx) => (
      <div
        key={idx}
        style={{
          position: 'absolute',
          left: p.x,
          top: p.y,
          width: p.size,
          height: p.size,
          borderRadius: '50%',
          backgroundColor: p.color,
          opacity: p.alpha,
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
          zIndex: 5
        }}
      />
    ));
  };

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {/* Section Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '35px', gap: '20px' }}>
        <div>
          <span className="catalog-tag">EXC-902 // LAB MATRIX</span>
          <h2 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-display)', color: '#ffffff', lineHeight: 1.1 }}>
            Archaeological <span className="gradient-text">Excavation Lab</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-editorial)', fontSize: '1.15rem', marginTop: '8px', maxWidth: '580px' }}>
            Grab a tool and drag across the sedimentary matrix block below to brush away coordinates and analyze underlying prehistorical fossilized specimens in real-time.
          </p>
        </div>

        {/* Toolbar & Progress */}
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          {/* Tool selectors */}
          <div className="glass-card" style={{ display: 'flex', padding: '6px', border: '1px solid rgba(212,163,115,0.1)' }}>
            <button
              onClick={() => setActiveTool('brush')}
              style={{
                background: activeTool === 'brush' ? 'var(--earth-sand)' : 'transparent',
                color: activeTool === 'brush' ? '#080706' : 'var(--earth-sand)',
                border: 'none',
                padding: '8px 16px',
                fontFamily: 'var(--font-display)',
                fontSize: '10px',
                fontWeight: 700,
                letterSpacing: '0.1em',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'var(--transition-fast)'
              }}
            >
              <Droplets size={12} />
              CURATOR'S BRUSH
            </button>
            <button
              onClick={() => setActiveTool('chisel')}
              style={{
                background: activeTool === 'chisel' ? 'var(--earth-sand)' : 'transparent',
                color: activeTool === 'chisel' ? '#080706' : 'var(--earth-sand)',
                border: 'none',
                padding: '8px 16px',
                fontFamily: 'var(--font-display)',
                fontSize: '10px',
                fontWeight: 700,
                letterSpacing: '0.1em',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'var(--transition-fast)'
              }}
            >
              <Hammer size={12} />
              EXCAVATION CHISEL
            </button>
          </div>

          <button
            onClick={resetDigsite}
            className="btn-secondary"
            style={{ padding: '10px 18px', fontSize: '9px' }}
          >
            <Trash2 size={12} />
            RESET MATRIX
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '30px', alignItems: 'stretch' }} className="perspective-container">
        
        {/* The Matrix Sandbox container */}
        <div 
          ref={containerRef}
          className="glass-card"
          style={{
            position: 'relative',
            height: '420px',
            border: '1px solid rgba(212,163,115,0.12)',
            background: 'radial-gradient(circle, #1c1412 0%, #0d0b0a 100%)',
            boxShadow: 'var(--shadow-deep), var(--glass-bevel)',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {/* Overlay flying sand particles */}
          {renderOverlayParticles()}

          {/* Underlay: Dinosaur skeleton SVG. Exposed when canvas is erased! */}
          <RaptorSkeletonSVG />

          {/* Foreground: Sedimentary layer canvas erased via destination-out */}
          <canvas
            ref={canvasRef}
            width={680}
            height={420}
            onMouseMove={(e) => {
              if (e.buttons === 1) handleDig(e);
            }}
            onTouchMove={handleDig}
            onMouseDown={handleDig}
            style={{
              position: 'relative',
              zIndex: 2,
              width: '100%',
              height: '100%',
              cursor: activeTool === 'chisel' ? 'crosshair' : 'default',
              display: 'block'
            }}
          />
        </div>

        {/* Telemetry sidebar */}
        <div 
          className="glass-card"
          style={{
            padding: '30px',
            border: '1px solid rgba(212,163,115,0.12)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            background: 'rgba(18, 14, 13, 0.4)'
          }}
        >
          <div>
            <span className="utility-text" style={{ fontSize: '8px', color: 'var(--earth-sand)' }}>TELEMETRY READOUT</span>
            <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-display)', margin: '8px 0 20px 0' }}>Matrix Clear Index</h3>

            {/* Circular Progress Gauge */}
            <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
              <div 
                style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  background: `conic-gradient(var(--earth-sand) ${clearedPercentage}%, var(--earth-stone) ${clearedPercentage}%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'inset 0 0 15px rgba(0,0,0,0.8), var(--shadow-deep)',
                  border: '1px solid rgba(212, 163, 115, 0.1)'
                }}
              >
                <div 
                  style={{
                    width: '94px',
                    height: '94px',
                    borderRadius: '50%',
                    backgroundColor: '#120e0d',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 10px rgba(0,0,0,0.8)'
                  }}
                >
                  <span style={{ fontSize: '24px', fontFamily: 'var(--font-number)', fontWeight: 700, color: '#ffffff' }}>{clearedPercentage}%</span>
                  <span style={{ fontSize: '7px', color: 'var(--text-dim)', letterSpacing: '0.1em' }}>EXPOSURE</span>
                </div>
              </div>
            </div>

            {/* Specimen Telemetry */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '20px' }}>
              <div style={{ borderBottom: '1px dashed rgba(212,163,115,0.1)', paddingBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                <span className="utility-text" style={{ fontSize: '7px' }}>MATRIX SECTOR</span>
                <span style={{ fontFamily: 'var(--font-number)', fontSize: '10px', fontWeight: 700 }}>SEC-D7-HELLCREEK</span>
              </div>
              <div style={{ borderBottom: '1px dashed rgba(212,163,115,0.1)', paddingBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                <span className="utility-text" style={{ fontSize: '7px' }}>EST. SPECIMEN</span>
                <span style={{ fontFamily: 'var(--font-number)', fontSize: '10px', fontWeight: 700, color: clearedPercentage > 15 ? '#ffffff' : 'var(--text-dim)' }}>
                  {clearedPercentage > 15 ? 'VELOCIRAPTOR MONGOLIENSIS' : 'MUTED SIGNAL'}
                </span>
              </div>
              <div style={{ borderBottom: '1px dashed rgba(212,163,115,0.1)', paddingBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                <span className="utility-text" style={{ fontSize: '7px' }}>GEOLOGICAL EPOCH</span>
                <span style={{ fontFamily: 'var(--font-number)', fontSize: '10px', fontWeight: 700, color: clearedPercentage > 30 ? '#ffffff' : 'var(--text-dim)' }}>
                  {clearedPercentage > 30 ? 'LATE CRETACEOUS // 71MA' : 'MUTED SIGNAL'}
                </span>
              </div>
            </div>
          </div>

          {/* Discovery Output status */}
          <div style={{ marginTop: '20px' }}>
            {discoveryState === 'digging' ? (
              <div style={{ border: '1px solid rgba(212,163,115,0.1)', padding: '15px', background: 'rgba(0,0,0,0.15)', textAlign: 'center' }}>
                <span className="utility-text" style={{ fontSize: '8px', display: 'block', marginBottom: '5px' }}>DETERMINISTIC SCANNER</span>
                <span style={{ fontSize: '10px', fontFamily: 'var(--font-editorial)', fontStyle: 'italic', color: 'var(--text-muted)' }}>
                  "Sweep sand grid systematically to capture structural outline."
                </span>
              </div>
            ) : (
              <div style={{ border: '1px solid var(--earth-sand)', padding: '15px', background: 'rgba(212,163,115,0.06)', animation: 'pulse-slow 2s infinite' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--earth-sand)', marginBottom: '5px' }}>
                  <Sparkles size={14} />
                  <span className="utility-text" style={{ fontSize: '8px', fontWeight: 900, color: 'var(--earth-sand)' }}>VERIFIED EXPOSURE</span>
                </div>
                <p style={{ fontSize: '10px', fontFamily: 'var(--font-body)', lineHeight: 1.4, color: '#ffffff' }}>
                  <strong>Curator Dossier:</strong> Complete Dromaeosauridae articulating skeleton recovered. Structural matrix cleared successfully. 
                </p>
              </div>
            )}
          </div>
        </div>

      </div>

      <style>{`
        @keyframes pulse-slow {
          0%, 100% { border-color: rgba(212, 163, 115, 0.4); }
          50% { border-color: rgba(212, 163, 115, 1.0); }
        }
      `}</style>
    </div>
  );
};

export default DiggingLab;
