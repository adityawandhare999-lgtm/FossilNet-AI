import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FileText, Cpu, Brain, Tag, Network, Sparkles } from 'lucide-react';
import cytoscape from 'cytoscape';
import API_BASE from '../api';

// ─── Entity category colours / labels ──────────────────────────────────────
const ENTITY_META = {
  LOC:     { label: 'EXCAVATION SITE',   bg: 'rgba(212,163,115,0.08)', border: 'rgba(212,163,115,0.4)',  text: '#D4A373', node: 'rgba(212,163,115,0.85)' },
  PER:     { label: 'INVESTIGATOR',      bg: 'rgba(167,107,67,0.08)',  border: 'rgba(167,107,67,0.4)',   text: '#A76B43', node: 'rgba(167,107,67,0.85)'  },
  ORG:     { label: 'INSTITUTION',       bg: 'rgba(120,100,80,0.08)',  border: 'rgba(120,100,80,0.4)',   text: '#B09070', node: 'rgba(120,100,80,0.85)'  },
  MISC:    { label: 'TAXONOMIC / MISC',  bg: 'rgba(217,119,6,0.07)',   border: 'rgba(217,119,6,0.4)',    text: '#D97706', node: 'rgba(217,119,6,0.85)'   },
  SPEC_ID: { label: 'SPECIMEN ID',       bg: 'rgba(100,200,140,0.07)', border: 'rgba(100,200,140,0.4)',  text: '#64C88C', node: 'rgba(100,200,140,0.85)' },
};

const getMeta = (type) => ENTITY_META[type?.toUpperCase()] ?? ENTITY_META.MISC;

// ─── Relationship labels between entity type pairs ──────────────────────────
const RELATION = (src, tgt) => {
  const k = `${src}_${tgt}`;
  return {
    LOC_PER:     'EXCAVATED BY',
    PER_LOC:     'EXCAVATED AT',
    MISC_LOC:    'FOUND AT',
    LOC_MISC:    'YIELDS',
    SPEC_ID_LOC: 'RECOVERED FROM',
    PER_ORG:     'AFFILIATED WITH',
    ORG_LOC:     'MANAGES SITE',
    MISC_PER:    'STUDIED BY',
  }[k] ?? 'RELATED TO';
};

const Literature = () => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [entities, setEntities] = useState(null);
  const cyRef = useRef(null);

  // Backend now returns already-merged entities.
  // This is a thin normaliser for the offline fallback format.
  const normaliseEntities = (raw) => {
    if (!raw || !Array.isArray(raw)) return [];
    return raw.map(e => ({
      word:     e.word     ?? e.label ?? '',
      entity:   (e.entity ?? 'MISC').toUpperCase(),
      category: e.category ?? getMeta((e.entity ?? 'MISC').toUpperCase()).label,
      score:    e.score    ?? 1.0,
    })).filter(e => e.word.length >= 2);
  };

  const handleAnalyze = async () => {
    if (!text) return;
    setLoading(true);
    setEntities(null);

    try {
      const response = await axios.post(`${API_BASE}/api/mining/`, { text });
      setEntities(response.data);
    } catch (error) {
      console.warn('API offline — using local NLP dictionary fallback', error);

      // Offline fallback dictionary
      const locations = ['Hell Creek', 'Morrison', 'Gobi Desert', 'Calvert Cliffs', 'Montana', 'Wyoming'];
      const species   = ['Tyrannosaurus', 'Triceratops', 'Velociraptor', 'Megalodon', 'Brachiopod', 'Trilobite'];
      const persons   = ['Cope', 'Marsh', 'Osborn', 'Vance', 'Krentz'];
      const strata    = ['Cretaceous', 'Jurassic', 'Triassic', 'Paleozoic', 'Mesozoic', 'Miocene'];

      const words   = text.split(/[\s,.\n"';()]+/);
      const seen    = new Set();
      const extracted = [];

      words.forEach(w => {
        const clean = w.replace(/[^a-zA-Z-]/g, '');
        if (clean.length < 3 || seen.has(clean.toLowerCase())) return;
        if (locations.some(l => l.toLowerCase().includes(clean.toLowerCase()))) {
          extracted.push({ word: clean, entity: 'LOC', category: 'EXCAVATION SITE', score: 1.0 });
          seen.add(clean.toLowerCase());
        } else if (species.some(s => s.toLowerCase().includes(clean.toLowerCase()))) {
          extracted.push({ word: clean, entity: 'MISC', category: 'TAXONOMIC / MISC', score: 1.0 });
          seen.add(clean.toLowerCase());
        } else if (persons.some(p => p.toLowerCase().includes(clean.toLowerCase()))) {
          extracted.push({ word: clean, entity: 'PER', category: 'INVESTIGATOR', score: 1.0 });
          seen.add(clean.toLowerCase());
        } else if (strata.some(st => st.toLowerCase().includes(clean.toLowerCase()))) {
          extracted.push({ word: clean, entity: 'MISC', category: 'TAXONOMIC / MISC', score: 1.0 });
          seen.add(clean.toLowerCase());
        }
      });

      if (extracted.length === 0) {
        extracted.push({ word: 'Hell Creek', entity: 'LOC', category: 'EXCAVATION SITE', score: 1.0 });
      }
      setEntities(extracted);
    } finally {
      setLoading(false);
    }
  };

  // ── Cytoscape graph ─────────────────────────────────────────────────────
  const buildGraphElements = (ents) => {
    const nodes = [];
    const edges = [];
    const seen  = new Set();

    nodes.push({ data: { id: 'doc', label: 'DOCUMENT\nCORE', type: 'DOC' } });

    ents.forEach((ent) => {
      const id = `${ent.entity}_${ent.word.toLowerCase().replace(/\s+/g, '_')}`;
      if (seen.has(id)) return;
      seen.add(id);
      nodes.push({ data: { id, label: ent.word, type: ent.entity } });
      edges.push({ data: { id: `doc_${id}`, source: 'doc', target: id, label: 'MENTIONS' } });
    });

    // Typed cross-edges between entity groups
    const byType = {};
    ents.forEach(e => {
      const t = e.entity;
      if (!byType[t]) byType[t] = [];
      byType[t].push(`${t}_${e.word.toLowerCase().replace(/\s+/g, '_')}`);
    });

    const pairs = [
      ['MISC', 'LOC'], ['LOC', 'PER'], ['SPEC_ID', 'LOC'], ['PER', 'ORG']
    ];

    pairs.forEach(([srcType, tgtType]) => {
      const srcs = byType[srcType] ?? [];
      const tgts = byType[tgtType] ?? [];
      srcs.forEach(src => {
        tgts.forEach(tgt => {
          const eid = `edge_${src}_${tgt}`;
          if (!edges.find(e => e.data.id === eid)) {
            edges.push({ data: { id: eid, source: src, target: tgt, label: RELATION(srcType, tgtType) } });
          }
        });
      });
    });

    return [...nodes, ...edges];
  };

  useEffect(() => {
    if (!cyRef.current || !entities || entities.error || !Array.isArray(entities)) return;
    const ents    = normaliseEntities(entities);
    const elements = buildGraphElements(ents);

    const cy = cytoscape({
      container: cyRef.current,
      elements,
      style: [
        {
          selector: 'node',
          style: {
            'background-color':   '#1a1510',
            'label':              'data(label)',
            'color':              '#e8ddd0',
            'font-family':        'Outfit, sans-serif',
            'font-size':          '9px',
            'font-weight':        'bold',
            'text-valign':        'center',
            'text-halign':        'center',
            'width':              '60px',
            'height':             '60px',
            'border-width':       '1.5px',
            'border-color':       'rgba(212,163,115,0.3)',
            'text-wrap':          'wrap',
            'text-max-width':     '54px',
            'overlay-opacity':    0,
          },
        },
        { selector: 'node[type="DOC"]',     style: { 'background-color': '#0d0b09', 'border-color': '#D4A373', 'border-width': '2px', 'width': '75px', 'height': '75px', 'color': '#D4A373', 'font-size': '8px' } },
        { selector: 'node[type="LOC"]',     style: { 'background-color': 'rgba(212,163,115,0.82)', 'color': '#080706', 'border-color': '#D4A373' } },
        { selector: 'node[type="PER"]',     style: { 'background-color': 'rgba(167,107,67,0.82)',  'color': '#080706', 'border-color': '#A76B43' } },
        { selector: 'node[type="ORG"]',     style: { 'background-color': 'rgba(140,110,80,0.82)',  'color': '#080706', 'border-color': '#B09070' } },
        { selector: 'node[type="MISC"]',    style: { 'background-color': 'rgba(217,119,6,0.82)',   'color': '#080706', 'border-color': '#D97706' } },
        { selector: 'node[type="SPEC_ID"]', style: { 'background-color': 'rgba(80,180,120,0.82)',  'color': '#080706', 'border-color': '#64C88C' } },
        {
          selector: 'edge',
          style: {
            'width':               1.2,
            'line-color':          'rgba(212,163,115,0.18)',
            'target-arrow-color':  'rgba(212,163,115,0.18)',
            'target-arrow-shape': 'triangle',
            'curve-style':         'bezier',
            'label':               'data(label)',
            'font-size':           '6.5px',
            'color':               'rgba(212,163,115,0.6)',
            'text-rotation':       'autorotate',
            'text-margin-y':       -6,
            'font-family':         'Outfit, monospace',
          },
        },
      ],
      layout: { name: 'cose', animate: true, nodeRepulsion: 6000, idealEdgeLength: 120, gravity: 60, numIter: 1200 },
    });

    cy.ready(() => { cy.fit(); cy.center(); });
    return () => cy.destroy();
  }, [entities]);

  const displayList = entities && !entities.error ? normaliseEntities(entities) : [];

  return (
    <div style={{ padding: '40px 0' }}>
      <header style={{ marginBottom: '50px' }}>
        <span className="catalog-tag">NLP-MINING // RESEARCH ARCHIVES</span>
        <h1 style={{ fontSize: '3rem', marginTop: '10px', marginBottom: '15px', fontFamily: 'var(--font-display)', fontWeight: 700 }}>
          Literature <span className="gradient-text">Mining Console</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-editorial)', fontSize: '1.25rem', maxWidth: '650px', lineHeight: '1.7', fontWeight: 300 }}>
          Input excavation field notes, geological logs, or paleontological papers to extract geochronological terms, site indices, and taxonomic classifications using BERT-NER models.
        </p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px' }} className="perspective-container">

        {/* Left: Input + Entity Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>

          {/* Input console */}
          <div className="glass-card" style={{ padding: '40px', border: '1px solid rgba(212,163,115,0.12)', background: 'rgba(18,14,13,0.4)' }}>
            <div style={{ marginBottom: '25px' }}>
              <span className="utility-text" style={{ display: 'block', marginBottom: '12px', fontSize: '9px', color: 'var(--earth-sand)' }}>
                Paste Excavation Field Logs / Literature
              </span>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="PASTE SITE REPORTS, GEOLOGICAL LOGS, OR PALEONTOLOGY PAPERS…"
                style={{
                  width: '100%', height: '240px', padding: '20px',
                  background: 'rgba(8,7,6,0.7)', border: '1px solid rgba(212,163,115,0.15)',
                  color: '#ffffff', outline: 'none', resize: 'none',
                  fontFamily: 'var(--font-editorial)', fontSize: '1.1rem',
                  lineHeight: '1.7', fontWeight: 300,
                  boxShadow: 'inset 0 3px 12px rgba(0,0,0,0.9)',
                }}
              />
            </div>
            <button
              className="btn-primary"
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', minHeight: '54px' }}
              onClick={handleAnalyze}
              disabled={loading || !text.trim()}
            >
              {loading ? <Brain className="animate-spin" size={18} /> : <Cpu size={18} />}
              {loading ? 'Mining Geological Data…' : 'Extract Entities'}
            </button>
          </div>

          {/* Entity cards */}
          <div className="glass-card" style={{ padding: '40px', border: '1px solid rgba(212,163,115,0.12)', background: 'rgba(18,14,13,0.4)' }}>
            <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '10px', fontFamily: 'var(--font-display)', marginBottom: '20px' }}>
              <Tag color="var(--earth-sand)" size={16} /> Classified Entities
            </h3>

            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: '44px', borderRadius: '2px' }} />)}
              </div>
            ) : entities && entities.error ? (
              <div style={{ padding: '20px', border: '1px solid rgba(217,119,6,0.3)', background: 'rgba(217,119,6,0.02)' }}>
                <h4 style={{ color: 'var(--earth-sand)', marginBottom: '8px' }}>Extraction Error</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{entities.error}</p>
              </div>
            ) : displayList.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {displayList.map((item, idx) => {
                  const meta = getMeta(item.entity);
                  return (
                    <motion.div
                      key={idx}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: idx * 0.025, type: 'spring', stiffness: 260, damping: 20 }}
                      style={{
                        background: meta.bg,
                        border: `1px solid ${meta.border}`,
                        padding: '8px 14px',
                        borderRadius: '3px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '3px',
                        maxWidth: '180px',
                      }}
                    >
                      {/* Entity word — full, with word-break */}
                      <span style={{
                        color: '#fff',
                        fontFamily: 'var(--font-number)',
                        fontSize: '0.88rem',
                        fontWeight: 700,
                        wordBreak: 'break-word',
                        overflowWrap: 'break-word',
                        lineHeight: 1.3,
                      }}>
                        {item.word}
                      </span>
                      {/* Category label */}
                      <span style={{
                        color: meta.text,
                        fontSize: '0.62rem',
                        fontFamily: 'var(--font-number)',
                        letterSpacing: '0.08em',
                        opacity: 0.85,
                      }}>
                        {item.category ?? meta.label}
                      </span>
                      {/* Confidence score */}
                      {item.score < 1.0 && (
                        <span style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}>
                          {(item.score * 100).toFixed(0)}% conf
                        </span>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            ) : entities && !entities.error ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>No notable entities detected.</p>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-dim)' }}>
                <FileText size={38} style={{ margin: '0 auto 15px', opacity: 0.3 }} />
                <p style={{ fontSize: '0.88rem', fontFamily: 'var(--font-editorial)', fontStyle: 'italic' }}>
                  Extract entities to populate list.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Knowledge Graph */}
        <div className="glass-card" style={{ padding: '40px', border: '1px solid rgba(212,163,115,0.12)', display: 'flex', flexDirection: 'column', minHeight: '500px', background: 'rgba(18,14,13,0.3)' }}>
          <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '12px', fontFamily: 'var(--font-display)', marginBottom: '25px', borderBottom: '1px solid rgba(212,163,115,0.1)', paddingBottom: '15px' }}>
            <Network color="var(--earth-sand)" size={16} /> Research Knowledge Graph
          </h3>

          {!entities && !loading && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)', textAlign: 'center' }}>
              <Network size={48} style={{ opacity: 0.15, marginBottom: '20px', color: 'var(--earth-sand)' }} />
              <p style={{ fontSize: '0.95rem', maxWidth: '300px', fontFamily: 'var(--font-editorial)', fontStyle: 'italic', lineHeight: '1.6' }}>
                A force-directed Cytoscape network linking Species, Locations, and Geologists will render here once text is processed.
              </p>
            </div>
          )}

          {loading && (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="dot-pulse-lit" style={{ color: 'var(--earth-sand)', fontWeight: 'bold', fontFamily: 'var(--font-number)', fontSize: '9px', letterSpacing: '0.15em' }}>
                CALCULATING PHYSICS FORCES…
              </span>
            </div>
          )}

          {entities && !entities.error && Array.isArray(entities) && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div ref={cyRef} style={{ flex: 1, width: '100%', minHeight: '380px', background: '#080706', borderRadius: '2px', border: '1px solid rgba(212,163,115,0.12)' }} />

              {/* Legend */}
              <div style={{ display: 'flex', gap: '12px', marginTop: '18px', fontSize: '0.7rem', color: 'var(--text-muted)', justifyContent: 'center', flexWrap: 'wrap', fontFamily: 'var(--font-number)', letterSpacing: '0.05em' }}>
                {Object.entries(ENTITY_META).map(([k, v]) => (
                  <span key={k} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span style={{ width: '8px', height: '8px', background: v.node, borderRadius: '50%', flexShrink: 0 }} />
                    {k} ({v.label})
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .dot-pulse-lit { animation: pulse-lit 1.5s infinite; }
        @keyframes pulse-lit { 0%,100% { opacity: 0.4; } 50% { opacity: 1; } }
      `}</style>
    </div>
  );
};

export default Literature;
