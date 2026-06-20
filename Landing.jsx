import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Camera, FileText, Map, Clock, MessageSquare, Compass, Search, BookOpen, ArrowRight, ShieldAlert } from 'lucide-react';
import DiggingLab from '../components/DiggingLab';

// Custom 3D Tilt Card for Fossil Showcase (Sleek, uncluttered, premium design)
const MuseumVitrineCard = ({ title, era, catalogNo, location, age, description, onClick }) => {
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5; // -0.5 to 0.5
    setTilt({ x: x * 12, y: -y * 12 });
  };

  const handleMouseLeave = () => {
    setHovered(false);
    setTilt({ x: 0, y: 0 });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className="museum-vitrine glass-sheen-wrapper"
      style={{
        transform: `perspective(1000px) rotateY(${tilt.x}deg) rotateX(${tilt.y}deg) translateY(${hovered ? -6 : 0}px)`,
        transition: hovered ? 'transform 0.08s ease-out' : 'transform 0.5s ease',
        cursor: 'pointer',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '30px 35px'
      }}
    >
      {/* Dynamic light reflection in the glass showcase */}
      <div
        style={{
          position: 'absolute',
          top: 0, left: 0, width: '100%', height: '100%',
          background: hovered
            ? `radial-gradient(circle at ${(tilt.x + 12) * 4}% ${(tilt.y + 12) * 4}%, rgba(212, 163, 115, 0.06) 0%, transparent 60%)`
            : 'none',
          pointerEvents: 'none',
          zIndex: 4
        }}
      />

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', borderBottom: '1px solid rgba(212, 163, 115, 0.05)', paddingBottom: '12px' }}>
          <span className="catalog-tag" style={{ margin: 0 }}>{catalogNo}</span>
          <span style={{ fontSize: '9px', fontFamily: 'var(--font-number)', color: 'var(--earth-sand)' }}>{age}</span>
        </div>

        <h3 style={{ fontSize: '1.45rem', fontFamily: 'var(--font-display)', marginBottom: '8px', color: '#ffffff', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
          {title}
        </h3>
        <span className="utility-text" style={{ fontSize: '7.5px', color: 'var(--earth-sand-muted)', display: 'block', marginBottom: '20px' }}>
          {era} // {location}
        </span>
        <p style={{ fontSize: '0.88rem', fontFamily: 'var(--font-editorial)', color: 'var(--text-muted)', lineHeight: '1.8', fontWeight: 300 }}>
          {description}
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--earth-sand)', fontSize: '9px', fontWeight: 700, letterSpacing: '0.15em', marginTop: '35px', textTransform: 'uppercase' }}>
        CATALOG DOSSIER <ArrowRight size={10} style={{ transform: hovered ? 'translateX(4px)' : 'none', transition: 'transform 0.3s ease' }} />
      </div>
    </div>
  );
};

const Landing = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  // Scroll logic for vertical Stratigraphy Timeline (Fossils emerge on scroll)
  const timelineRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ["start end", "end start"]
  });

  // Slide factors for fossils sliding out from stone cracks
  const boneSlideLeft = useTransform(scrollYProgress, [0.1, 0.5], [-200, 0]);
  const boneSlideRight = useTransform(scrollYProgress, [0.2, 0.6], [200, 0]);
  const boneOpacity = useTransform(scrollYProgress, [0.1, 0.45], [0, 1]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/assistant?query=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div style={{ padding: '0 0 100px 0', position: 'relative' }}>

      {/* 1. HERO SECTION - Cinematic Museum Entry */}
      <section
        style={{
          position: 'relative',
          height: '76vh', // slightly compact for better layout flow
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden',
          marginTop: '-30px',
          borderBottom: '1px solid rgba(212, 163, 115, 0.08)',
          // Simple, premium, and clean dark gradient background
          background: 'radial-gradient(circle at 50% 45%, #14110f 0%, #080706 100%)'
        }}
      >
        {/* Subtle geometric grid background overlay for designer look */}
        <div
          style={{
            position: 'absolute',
            top: 0, left: 0, width: '100%', height: '100%',
            opacity: 0.02,
            backgroundImage: 'radial-gradient(var(--earth-sand) 1px, transparent 1px)',
            backgroundSize: '30px 30px',
            pointerEvents: 'none'
          }}
        />

        {/* Hero Copy */}
        <div style={{ textAlign: 'center', position: 'relative', zIndex: 3, maxWidth: '900px', padding: '0 20px' }}>

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.0 }}
            className="shimmer-badge"
            style={{ marginBottom: '25px' }}
          >
            <Compass size={11} style={{ color: 'var(--earth-sand)' }} />
            <span className="utility-text" style={{ fontSize: '8px', color: '#ffffff', letterSpacing: '0.3em' }}>
              RESEARCH PROTOCOL LOCATOR // Hell Creek Matrix Block-C
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 35 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.15 }}
            style={{
              fontSize: 'clamp(3.8rem, 8vw, 8.5rem)',
              lineHeight: '0.9',
              fontWeight: 700,
              fontFamily: 'var(--font-display)',
              marginBottom: '35px',
              textTransform: 'uppercase'
            }}
          >
            Fossil<span style={{ color: 'var(--earth-sand)', fontWeight: 400 }}>Net</span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, delay: 0.4 }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', marginBottom: '35px' }}
          >
            <div style={{ width: '45px', height: '1px', background: 'var(--earth-sand)', opacity: 0.5 }}></div>
            <span className="utility-text" style={{ fontSize: 'clamp(9px, 1.5vw, 11px)', letterSpacing: '0.28em', color: 'var(--earth-sand)' }}>
              Core Paleontological Information Platform
            </span>
            <div style={{ width: '45px', height: '1px', background: 'var(--earth-sand)', opacity: 0.5 }}></div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.0, delay: 0.6 }}
            style={{
              fontSize: '1.25rem',
              fontFamily: 'var(--font-editorial)',
              fontStyle: 'italic',
              color: 'var(--text-muted)',
              lineHeight: '1.8',
              maxWidth: '700px',
              margin: '0 auto 45px auto',
              fontWeight: 300
            }}
          >
            "Geological layers hold history locked in shale, mudstone, and sand. We apply transformer-based neural vision to decode excavation hotspots and mineralized fossil specimens."
          </motion.p>

          {/* Sleek, Rounded Pill-Shaped Search Input - Flawlessly Transparent Input */}
          <motion.form
            onSubmit={handleSearchSubmit}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.75 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              maxWidth: '680px',
              margin: '0 auto',
              background: 'rgba(18, 14, 13, 0.85)',
              border: '1px solid rgba(212,163,115,0.22)',
              borderRadius: '50px',
              padding: '6px 6px 6px 24px',
              boxShadow: 'var(--shadow-deep), var(--glass-bevel), 0 0 25px rgba(212,163,115,0.03)'
            }}
          >
            <Search size={14} style={{ color: 'var(--earth-sand)', opacity: 0.7, marginRight: '15px' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="SEARCH CORE FOSSILS, DIG LOCATIONS, OR ASK AI..."
              style={{
                flex: 1,
                background: 'transparent',
                backgroundColor: 'transparent',
                border: 'none',
                outline: 'none',
                boxShadow: 'none',
                color: '#ffffff',
                fontSize: '10.5px',
                fontWeight: 500,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                padding: '0',
                margin: '0'
              }}
              // CSS custom overrides to strictly guarantee zero border overlays
              className="search-input-override"
            />
            <button
              type="submit"
              className="btn-primary"
              style={{
                padding: '12px 28px',
                fontSize: '9px',
                borderRadius: '50px',
                boxShadow: 'none'
              }}
            >
              QUERY LAB
            </button>
          </motion.form>

          {/* Centered, Inline Geochronology & Coordinate telemetry */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.0, delay: 0.85 }}
            style={{
              display: 'flex',
              gap: '30px',
              justifyContent: 'center',
              marginTop: '25px',
              opacity: 0.7,
              flexWrap: 'wrap'
            }}
            className="utility-text"
          >
            <span>LAT: 46°40'N</span>
            <span>LNG: 104°15'W</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              TELEMETRY CONNECTED <span className="system-status-indicator"></span>
            </span>
          </motion.div>

        </div>

      </section>

      {/* Quick Nav Shortcut grid */}
      <div
        className="container"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '20px',
          marginTop: '-40px',
          position: 'relative',
          zIndex: 5,
          marginBottom: '100px'
        }}
      >
        {[
          { to: '/shazam', label: 'Specimen Shazam', icon: Camera, desc: 'Transformer Image Scanner' },
          { to: '/literature', label: 'Literature Mining', icon: FileText, desc: 'BERT Geological extraction' },
          { to: '/prospector', label: 'Prospector Map', icon: Map, desc: 'Hotspot digging scores' },
          { to: '/timeline', label: 'Geological Eras', icon: Clock, desc: 'Chronological time scale' }
        ].map((item, idx) => (
          <div
            key={idx}
            onClick={() => navigate(item.to)}
            className="glass-card glass-sheen-wrapper"
            style={{
              padding: '24px 30px',
              border: '1px solid rgba(212,163,115,0.1)',
              background: 'rgba(18,14,13,0.85)',
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-deep), var(--glass-bevel)'
            }}
          >
            <div style={{ color: 'var(--earth-sand)' }}>
              <item.icon size={22} />
            </div>
            <div>
              <h4 style={{ fontSize: '11px', fontFamily: 'var(--font-display)', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#ffffff' }}>
                {item.label}
              </h4>
              <span style={{ fontSize: '8px', color: 'var(--text-dim)', letterSpacing: '0.05em', display: 'block', marginTop: '2px' }}>
                {item.desc}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* 2. FOSSIL COLLECTION GALLERY - High-end Museum Presentation */}
      <section className="container" style={{ marginBottom: '120px' }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <span className="catalog-tag">COL-9812 // MUSEUM CABINETS</span>
          <h2 style={{ fontSize: '2.8rem', fontFamily: 'var(--font-display)', marginBottom: '15px' }}>
            Specimen <span className="gradient-text">Showcase Vitrines</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-editorial)', fontSize: '1.2rem', maxWidth: '620px', margin: '0 auto', fontWeight: 300 }}>
            Inspect a curated selection of precious paleontological discoveries currently stored in the lab archives. Hover to rotate displays and light up inner shadows.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }} className="perspective-container">

          {/* Vitrine 1: Ammonite */}
          <MuseumVitrineCard
            catalogNo="FSL-451"
            age="112M Y.O."
            title="Suture Ammonite"
            era="CRETACEOUS EPOCH"
            location="Madagascar sedimentary beds"
            description="Perfect suturing fractal patterns preserved in fossilized calcium carbonate shell. Demonstrates marine biological pressure defense strategies of prehistoric cephalopods."
            onClick={() => navigate('/shazam')}
          />

          {/* Vitrine 2: T-Rex Skull */}
          <MuseumVitrineCard
            catalogNo="FSL-902"
            age="66.5M Y.O."
            title="Tyrannosaur Tooth"
            era="LATE CRETACEOUS"
            location="Hell Creek Formation, MT"
            description="Massive fossilized premaxillary slicing tooth of a mature Tyrannosaurus. The enamel exhibits high mineralization and micro-serrated structures used for bone crush crushing."
            onClick={() => navigate('/shazam')}
          />

          {/* Vitrine 3: Raptor Claw */}
          <MuseumVitrineCard
            catalogNo="FSL-104"
            age="75.3M Y.O."
            title="Velociraptor Sickle Claw"
            era="CAMPANIAN ERA"
            location="Djadokhta Fm, Mongolia"
            description="Highly curved second digit pedal claw designed for grappling prey. Shows dense skeletal structural fibers and perfectly preserved flexor tubercle mounting joints."
            onClick={() => navigate('/shazam')}
          />

          {/* Vitrine 4: Megalodon Tooth */}
          <MuseumVitrineCard
            catalogNo="FSL-338"
            age="15.6M Y.O."
            title="Megalodon Enamel Tooth"
            era="MIOCENE PERIOD"
            location="Calvert Cliffs, MD"
            description="Enormous shark tooth showing rich obsidian-amber staining and flawless serrations. Sourced from deep sub-surface marine strata. Represents peak oceanic predators."
            onClick={() => navigate('/shazam')}
          />

        </div>
      </section>

      {/* 3. DINOSAUR TIMELINE STRATIGRAPHY - Emerging Fossils on scroll */}
      <section
        ref={timelineRef}
        className="container"
        style={{
          marginBottom: '130px',
          position: 'relative',
          background: 'rgba(10, 8, 7, 0.3)',
          border: '1px solid rgba(212, 163, 115, 0.05)',
          padding: '80px 40px',
          overflow: 'hidden'
        }}
      >
        {/* Layered Earth Sedimentary background visuals */}
        <div style={{ position: 'absolute', top: 0, right: 0, width: '450px', height: '100%', opacity: 0.03, pointerEvents: 'none' }}>
          <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', fill: 'currentColor', color: 'var(--earth-sand)' }}>
            <path d="M0 10 Q 30 15, 60 8 T 100 12 L 100 100 L 0 100 Z" />
            <path d="M0 40 Q 20 45, 50 38 T 100 42 L 100 100 L 0 100 Z" opacity="0.5" />
            <path d="M0 70 Q 40 75, 80 68 T 100 72 L 100 100 L 0 100 Z" opacity="0.3" />
          </svg>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '60px', alignItems: 'center' }}>
          <div>
            <span className="catalog-tag">STR-7612 // STRATIGRAPHY</span>
            <h2 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-display)', marginBottom: '20px' }}>
              Sedimentary <span className="gradient-text">Stratigraphy</span>
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: '1.8', marginBottom: '35px', fontFamily: 'var(--font-body)', fontWeight: 300 }}>
              Earth's geologic formations stack fossilized history sequentially. As you traverse deep into sedimentary layers, you travel back millions of years, exposing the transition from ocean beds to terrestrial dinosaur domains.
            </p>

            <button
              onClick={() => navigate('/timeline')}
              className="btn-primary"
            >
              EXPLORE FULL TIMELINE
            </button>
          </div>

          {/* Interactive visual stratigraphy graph */}
          <div style={{ position: 'relative', borderLeft: '1px solid rgba(212,163,115,0.15)', paddingLeft: '30px' }}>
            {[
              { depth: 'Surface - 2.5m', period: 'CENOZOIC ERA', age: '0 - 66 Million Years', color: '#8c6239', label: 'Quaternary Sediment' },
              { depth: '2.5m - 12m', period: 'MESOZOIC ERA', age: '66 - 252 Million Years', color: '#a76b43', label: 'K-Pg Boundary // Theropod Fossils' },
              { depth: '12m - 40m', period: 'PALEOZOIC ERA', age: '252 - 541 Million Years', color: '#5c4f46', label: 'Carboniferous Shale // Ferns & Brachiopods' }
            ].map((layer, index) => (
              <div
                key={index}
                style={{
                  padding: '24px',
                  background: 'rgba(36,29,26,0.3)',
                  border: '1px solid rgba(212,163,115,0.06)',
                  marginBottom: '20px',
                  position: 'relative'
                }}
              >
                {/* Visual indicator dot */}
                <div style={{
                  position: 'absolute',
                  left: '-36px',
                  top: '30px',
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: layer.color,
                  border: '2px solid #080706'
                }}></div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', fontFamily: 'var(--font-number)', color: 'var(--earth-sand)', marginBottom: '8px' }}>
                  <span>{layer.depth}</span>
                  <span>{layer.age}</span>
                </div>
                <h4 style={{ fontSize: '13px', fontFamily: 'var(--font-display)', color: '#ffffff', marginBottom: '5px' }}>
                  {layer.period}
                </h4>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-editorial)' }}>
                  {layer.label}
                </p>
              </div>
            ))}

            {/* Slide-out fossils animation triggered on scroll */}
            <motion.div
              style={{
                position: 'absolute',
                right: '20px',
                top: '90px',
                width: '110px',
                height: '70px',
                opacity: boneOpacity,
                x: boneSlideRight,
                color: 'rgba(212, 163, 115, 0.45)',
                pointerEvents: 'none'
              }}
            >
              {/* Little skeleton rib drawing */}
              <svg viewBox="0 0 100 60" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M 10 10 Q 50 10, 90 20" />
                <path d="M 20 20 Q 55 25, 80 40" />
                <path d="M 30 30 Q 60 38, 70 55" />
              </svg>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 4. EXCAVATION EXPERIENCE - The Interactive Sandbox Brushing Game */}
      <section className="container" style={{ marginBottom: '120px' }}>
        <DiggingLab />
      </section>

      {/* 5. DISCOVERY STORIES - Magazine & Journal Editorial logs */}
      <section className="container" style={{ marginBottom: '40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <span className="catalog-tag">LOG-82 // FIELD ARCHIVES</span>
          <h2 style={{ fontSize: '2.8rem', fontFamily: 'var(--font-display)', marginBottom: '15px' }}>
            Expedition <span className="gradient-text">Field Journals</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-editorial)', fontSize: '1.2rem', maxWidth: '620px', margin: '0 auto', fontWeight: 300 }}>
            Read real archaeological logs, site surveys, and structural findings submitted by field researchers during global excavations.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '40px' }}>

          {/* Journal Entry 1 */}
          <div
            className="glass-card"
            style={{
              padding: '40px',
              border: '1px solid rgba(212,163,115,0.08)',
              background: 'radial-gradient(circle at 100% 0%, rgba(36,29,26,0.3) 0%, rgba(18,14,13,0.5) 100%)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <span style={{ fontSize: '9px', fontFamily: 'var(--font-number)', color: 'var(--earth-sand)' }}>LOG DATE: 12.04.2026</span>
                <span className="utility-text" style={{ fontSize: '7px' }}>SITE // MORRISON-FM</span>
              </div>
              <h3 style={{ fontSize: '1.35rem', fontFamily: 'var(--font-display)', marginBottom: '15px', lineHeight: 1.2 }}>
                "Deep Stratum Saurian Femur Recovered"
              </h3>
              <p style={{ fontFamily: 'var(--font-editorial)', color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: '1.75', fontStyle: 'italic', fontWeight: 300 }}>
                "After six days brushing shale blocks at 14 meters, the chisel cleared a large organic dense contour. Measuring 1.8 meters, it matches a Sauropoda femur bone. Enamel preservation is high, showing rich dark iron-oxide stains from underground aquifer cycles..."
              </p>
            </div>

            <div style={{ marginTop: '35px', display: 'flex', alignItems: 'center', gap: '15px', borderTop: '1px solid rgba(212,163,115,0.06)', paddingTop: '20px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--earth-stone)', border: '1px solid var(--earth-sand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 900 }}>
                HA
              </div>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 700, display: 'block', color: '#ffffff' }}>Dr. Helena Vance</span>
                <span style={{ fontSize: '8px', color: 'var(--text-dim)', letterSpacing: '0.05em' }}>EXCAVATION LEADER, SECTOR D</span>
              </div>
            </div>
          </div>

          {/* Journal Entry 2 */}
          <div
            className="glass-card"
            style={{
              padding: '40px',
              border: '1px solid rgba(212,163,115,0.08)',
              background: 'radial-gradient(circle at 100% 0%, rgba(36,29,26,0.3) 0%, rgba(18,14,13,0.5) 100%)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <span style={{ fontSize: '9px', fontFamily: 'var(--font-number)', color: 'var(--earth-sand)' }}>LOG DATE: 28.05.2026</span>
                <span className="utility-text" style={{ fontSize: '7px' }}>SITE // GOBI-MAT</span>
              </div>
              <h3 style={{ fontSize: '1.35rem', fontFamily: 'var(--font-display)', marginBottom: '15px', lineHeight: 1.2 }}>
                "Skeletal Fissures in Red Cliff Formations"
              </h3>
              <p style={{ fontFamily: 'var(--font-editorial)', color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: '1.75', fontStyle: 'italic', fontWeight: 300 }}>
                "Winds cleared a sandstone ridge in the red sandstone sands. Visible organic structures include six articulating vertebrae. High-fidelity visual scanning indicates Oviraptoridae nests. Preserving details of fossilized clutches in sedimentary amber silt..."
              </p>
            </div>

            <div style={{ marginTop: '35px', display: 'flex', alignItems: 'center', gap: '15px', borderTop: '1px solid rgba(212,163,115,0.06)', paddingTop: '20px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--earth-stone)', border: '1px solid var(--earth-sand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 900 }}>
                AK
              </div>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 700, display: 'block', color: '#ffffff' }}>Dr. Alan Krentz</span>
                <span style={{ fontSize: '8px', color: 'var(--text-dim)', letterSpacing: '0.05em' }}>SENIOR FIELD GEOLOGIST</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Local custom CSS overrides to enforce seamless transparent inputs */}
      <style>{`
        .search-input-override {
          background-color: transparent !important;
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          outline: none !important;
        }
        .search-input-override:focus {
          background-color: transparent !important;
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          outline: none !important;
        }
      `}</style>

    </div>
  );
};

export default Landing;
