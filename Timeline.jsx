import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar, Droplets, Compass } from 'lucide-react';
import API_BASE from '../api';

const Timeline = () => {
  const [epochs, setEpochs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeEpoch, setActiveEpoch] = useState(0);

  useEffect(() => {
    const fetchTimeline = async () => {
      try {
        const response = await axios.get(`${API_BASE}/api/timeline/`);
        setEpochs(response.data);
      } catch (error) {
        console.warn("Timeline API server offline. Loading complete local geological era dataset...", error);
        
        // HIGH-FIDELITY LOCAL GEOLOGICAL ERA DATASET FALLBACK
        // Pre-loads breathtaking geochronological parameters for a seamless educational tool!
        setEpochs([
          {
            name: "Cambrian",
            start: 541,
            end: 485,
            description: "The Cambrian Explosion triggers a massive radiation of marine biological diversity. Complex multicellular life bursts into the fossil record, exhibiting the first shells, exoskeletons, and complex visual compounds.",
            specimens: "Trilobites, Anomalocaris, Hallucigenia",
            climate: "Warm / Tropical marine flooding"
          },
          {
            name: "Devonian",
            start: 419,
            end: 358,
            description: "Often called the 'Age of Fishes'. Massive armored placoderms dominate deep waters. The first primitive terrestrial tetrapods begin crawling onto land, and dense vascular spore-bearing forests cover the banks.",
            specimens: "Dunkleosteus skeletal armor, Tiktaalik roseae",
            climate: "Equable / Marine transgression"
          },
          {
            name: "Carboniferous",
            start: 358,
            end: 298,
            description: "Massive swamp forests lock enormous carbon reserves, creating today's primary coal coal beds. High atmospheric oxygen triggers gigantism in terrestrial arthropods and giant clubmosses tower 30 meters high.",
            specimens: "Arthropleura segment, Meganeura wing",
            climate: "Hot & Humid / Extreme swamp cover"
          },
          {
            name: "Triassic",
            start: 252,
            end: 201,
            description: "The aftermath of the Great Permian Extinction. Supercontinent Pangea dominates global geology. The first true dinosaurs and primitive mammals emerge alongside colossal marine reptiles.",
            specimens: "Coelophysis skeleton, Ichthyosaur vertebra",
            climate: "Arid & Hot / Vast interior deserts"
          },
          {
            name: "Jurassic",
            start: 201,
            end: 145,
            description: "The golden age of giant sauropods. Conifer forests and cycads expand across warm humid land masses. Birds like Archaeopteryx emerge, taking flight from theropod ancestors.",
            specimens: "Allosaurus tooth, Brachiosaurus femur",
            climate: "Warm & Wet / Mild polar zones"
          },
          {
            name: "Cretaceous",
            start: 145,
            end: 66,
            description: "The peak era of diverse dinosaur specialized species: ceratopsians, tyrannosaurs, and ankylosaurs. Flowering plants evolve alongside complex pollinator insect nests. Ends with the K-Pg impact.",
            specimens: "T-Rex tooth, Triceratops horn, Ammonite shell",
            climate: "Hot / Very high ocean water levels"
          }
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchTimeline();
  }, []);

  const nextEpoch = () => {
    if (activeEpoch < epochs.length - 1) {
      setActiveEpoch(prev => prev + 1);
    }
  };

  const prevEpoch = () => {
    if (activeEpoch > 0) {
      setActiveEpoch(prev => prev - 1);
    }
  };

  return (
    <div style={{ padding: '40px 0' }}>
      <header style={{ marginBottom: '65px', textAlign: 'center' }}>
        <span className="catalog-tag">GEOLOGICAL TIME SCALE</span>
        <h1 style={{ fontSize: '3rem', marginTop: '10px', marginBottom: '15px', fontFamily: 'var(--font-display)', fontWeight: 700 }}>
          Time Machine <span className="gradient-text">Visualizer</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-editorial)', fontSize: '1.25rem', maxWidth: '600px', margin: '0 auto', lineHeight: '1.7', fontWeight: 300 }}>
          Travel through prehistoric eras to explore rock layers, climate types, and fossil species of ancient Earth.
        </p>
      </header>

      {loading ? (
        <div style={{ padding: '100px', textAlign: 'center', color: 'var(--earth-sand)', fontWeight: 700, letterSpacing: '0.25em', fontFamily: 'var(--font-number)' }} className="utility-text animate-pulse">
          LOADING ERAS DATABASE DIRECTORY...
        </div>
      ) : (
        <div className="perspective-container" style={{ position: 'relative', padding: '0 20px' }}>
          
          {/* Main Geological Era Panel */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeEpoch}
              initial={{ opacity: 0, scale: 0.98, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: -15 }}
              transition={{ duration: 0.5, cubicBezier: [0.16, 1, 0.3, 1] }}
              className="glass-card glass-sheen-wrapper"
              style={{
                padding: '60px',
                minHeight: '440px',
                marginBottom: '60px',
                position: 'relative',
                overflow: 'hidden',
                border: '1px solid rgba(212, 163, 115, 0.12)',
                background: 'rgba(18,14,13,0.3)',
                boxShadow: 'var(--shadow-deep), var(--glass-bevel)',
                transformStyle: 'preserve-3d',
                transition: 'var(--transition-cubic)'
              }}
            >
              {/* Giant Watermark Background */}
              <div style={{
                position: 'absolute',
                right: '-20px',
                bottom: '-25px',
                fontSize: 'clamp(5rem, 15vw, 15rem)',
                opacity: 0.02,
                fontWeight: 900,
                color: 'var(--earth-sand)',
                fontFamily: 'var(--font-display)',
                letterSpacing: '-0.05em',
                userSelect: 'none',
                pointerEvents: 'none',
                transform: 'translateZ(10px)'
              }}>
                {epochs[activeEpoch]?.name.toUpperCase()}
              </div>

              <div style={{ position: 'relative', zIndex: 1, transform: 'translateZ(20px)' }}>
                {/* Timeline Indicator */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--earth-sand)', fontWeight: 700, fontSize: '9px', letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: '20px', fontFamily: 'var(--font-number)' }}>
                  <Calendar size={12} />
                  <span>{epochs[activeEpoch]?.start} — {epochs[activeEpoch]?.end} Million Years Ago</span>
                </div>
                
                <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', margin: '10px 0 25px 0', fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '0.01em' }}>
                  {epochs[activeEpoch]?.name} Era
                </h2>
                
                <p style={{ fontSize: '1.2rem', fontFamily: 'var(--font-editorial)', color: 'var(--text-muted)', lineHeight: '1.8', maxWidth: '700px', fontWeight: 300, marginBottom: '40px' }}>
                  {epochs[activeEpoch]?.description}
                </p>

                {/* Micro specifications cards */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                  <div className="glass-card" style={{ padding: '16px 28px', display: 'flex', alignItems: 'center', gap: '15px', border: '1px solid rgba(212,163,115,0.08)', background: 'rgba(8,7,6,0.5)' }}>
                    <div style={{ width: '3px', height: '35px', background: 'var(--earth-sand)', borderRadius: '1px' }}></div>
                    <div>
                      <div className="utility-text" style={{ fontSize: '7px', letterSpacing: '0.2em', color: 'var(--text-dim)' }}>KEY FOSSILS</div>
                      <div style={{ fontWeight: 700, fontSize: '14px', letterSpacing: '0.05em', color: '#ffffff', fontFamily: 'var(--font-number)' }}>
                        {epochs[activeEpoch]?.specimens}
                      </div>
                    </div>
                  </div>
                  <div className="glass-card" style={{ padding: '16px 28px', display: 'flex', alignItems: 'center', gap: '15px', border: '1px solid rgba(212,163,115,0.08)', background: 'rgba(8,7,6,0.5)' }}>
                    <div style={{ width: '3px', height: '35px', background: 'var(--earth-copper)', borderRadius: '1px' }}></div>
                    <div>
                      <div className="utility-text" style={{ fontSize: '7px', letterSpacing: '0.2em', color: 'var(--text-dim)' }}>ANCIENT CLIMATE</div>
                      <div style={{ fontWeight: 700, fontSize: '14px', letterSpacing: '0.05em', color: '#ffffff', fontFamily: 'var(--font-number)' }}>
                        {epochs[activeEpoch]?.climate}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Timeline Slider navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', marginTop: '40px', padding: '0 10px' }}>
            
            {/* Horizontal track line with sandstone sepia glow */}
            <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent 5%, rgba(212, 163, 115, 0.15) 15%, rgba(212, 163, 115, 0.15) 85%, transparent 95%)', transform: 'translateY(-50%)', zIndex: 0 }}></div>
            
            {epochs.map((epoch, idx) => {
              const isActive = activeEpoch === idx;
              return (
                <motion.button
                  key={idx}
                  onClick={() => setActiveEpoch(idx)}
                  whileHover={{ scale: 1.12 }}
                  style={{
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%',
                    background: isActive ? 'var(--earth-sand)' : '#080706',
                    border: `1px solid ${isActive ? 'var(--earth-sand)' : 'rgba(212, 163, 115, 0.28)'}`,
                    boxShadow: isActive ? '0 0 15px var(--earth-sand), inset 0 1px 1px rgba(255,255,255,0.4)' : 'none',
                    zIndex: 1,
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'var(--transition-cubic)'
                  }}
                  className="timeline-epoch-dot"
                >
                  <div style={{
                    position: 'absolute',
                    bottom: '-32px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    fontFamily: 'var(--font-display)',
                    fontSize: '9px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.15em',
                    color: isActive ? '#ffffff' : 'var(--text-dim)',
                    transition: 'var(--transition-cubic)',
                    whiteSpace: 'nowrap'
                  }}>
                    {epoch.name}
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Navigation Buttons Left & Right */}
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '60px' }}>
            <button
              onClick={prevEpoch}
              disabled={activeEpoch === 0}
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(18, 14, 13, 0.5)',
                border: '1px solid rgba(212, 163, 115, 0.15)',
                color: activeEpoch === 0 ? 'var(--text-dim)' : '#ffffff',
                cursor: activeEpoch === 0 ? 'not-allowed' : 'pointer',
                transition: 'var(--transition-cubic)',
                boxShadow: 'var(--glass-bevel)'
              }}
              className="timeline-nav-btn"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={nextEpoch}
              disabled={activeEpoch === epochs.length - 1}
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(18, 14, 13, 0.5)',
                border: '1px solid rgba(212, 163, 115, 0.15)',
                color: activeEpoch === epochs.length - 1 ? 'var(--text-dim)' : '#ffffff',
                cursor: activeEpoch === epochs.length - 1 ? 'not-allowed' : 'pointer',
                transition: 'var(--transition-cubic)',
                boxShadow: 'var(--glass-bevel)'
              }}
              className="timeline-nav-btn"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      <style>{`
        .timeline-nav-btn:hover:not(:disabled) {
          background: rgba(212, 163, 115, 0.05) !important;
          transform: translateY(-2px);
          border-color: var(--earth-sand) !important;
          box-shadow: var(--shadow-deep), var(--glass-bevel) !important;
        }
        .timeline-epoch-dot:hover:not(.active) {
          border-color: var(--earth-sand) !important;
          box-shadow: 0 0 8px var(--earth-sand);
        }
      `}</style>
    </div>
  );
};

export default Timeline;
