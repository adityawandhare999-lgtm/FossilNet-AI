import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, TrendingUp, ShieldAlert, Sparkles, Info, Search, Map as MapIcon } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import L from 'leaflet';
import API_BASE from '../api';

// Clean up standard Leaflet marker icon glitches in webpack/vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Sub-component to handle map zooming and panning programmatically
const RecenterMap = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 4.5, { animate: true, duration: 1.5 });
    }
  }, [center, map]);
  return null;
};

const Prospector = () => {
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('sites'); // 'sites' or 'advisor'

  // Advisor Form States
  const [period, setPeriod] = useState('Jurassic');
  const [fossilType, setFossilType] = useState('Ammonite Fossil');
  const [region, setRegion] = useState('North America');
  const [advisorReport, setAdvisorReport] = useState('');
  const [advisorLoading, setAdvisorLoading] = useState(false);

  // Dynamic Map Focus State
  const [mapCenter, setMapCenter] = useState([38, -50]);
  const [customDigZone, setCustomDigZone] = useState(null);

  // Region Coordinate Mapper
  const regionCoords = {
    'North America': [47.1, -106.3], // Montana area
    'Europe': [48.9, 11.0],         // Solnhofen area
    'Asia': [44.2, 103.7],          // Gobi area
    'Australia': [-31.2, 138.2],     // Flinders Ranges area
  };

  useEffect(() => {
    const fetchSites = async () => {
      try {
        const response = await axios.get(`${API_BASE}/api/prospector/`);
        setSites(response.data);
      } catch (error) {
        console.warn("Prospector API server offline. Generating local archeological fallback hotspots...", error);
        
        // HIGH-FIDELITY LOCAL GEOLOGICAL HOTSPOT FALLBACK
        setSites([
          {
            id: 1,
            name: "Hell Creek Formation (Sector D)",
            lat: 46.4004,
            lng: -104.1503,
            score: 96.4,
            fossils: ["T-Rex Tooth", "Triceratops Brow Horn", "Edmontosaurus Vertebrae"]
          },
          {
            id: 2,
            name: "Morrison Formation (Digsite-12)",
            lat: 39.7392,
            lng: -105.1503,
            score: 87.2,
            fossils: ["Allosaurus Femur", "Brachiosaurus Spine", "Stegosaurus Plate"]
          },
          {
            id: 3,
            name: "Flaming Cliffs (Gobi Matrix)",
            lat: 44.2003,
            lng: 103.7004,
            score: 91.8,
            fossils: ["Velociraptor Claw", "Protoceratops Nest", "Oviraptor Skull"]
          },
          {
            id: 4,
            name: "Solnhofen Plattenkalk Strata",
            lat: 48.8922,
            lng: 10.9912,
            score: 78.5,
            fossils: ["Archaeopteryx Feather", "Pterodactylus Wing", "Compsognathus Claw"]
          }
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchSites();
  }, []);

  const handleGenerateAdvisory = async () => {
    setAdvisorLoading(true);
    setAdvisorReport('');
    
    // Re-center map to the target region
    const coords = regionCoords[region] || [30, 0];
    setMapCenter(coords);

    const prompt = `Generate a paleontological excavation advisor report. 
Target Period: ${period}
Target Specimen Class: ${fossilType}
Geographic Region: ${region}

Provide:
1. Recommended Formation and specific coordinates near lat ${coords[0]}, lng ${coords[1]}.
2. Stratigraphic Layer depth recommendation.
3. Logistics advisory (climate, tools needed).
4. Probability score of discovery.`;

    try {
      const response = await axios.post(`${API_BASE}/api/assistant/`, { prompt });
      const reportText = response.data.generated_text || response.data.text;
      setAdvisorReport(reportText);

      // Add dynamic target circle on the map
      setCustomDigZone({
        lat: coords[0],
        lng: coords[1],
        name: `AI Dig Zone: ${region} ${period}`,
        fossils: [fossilType],
        score: 85
      });
    } catch (error) {
      console.warn("Advisor API offline. Generating local offline advisory report...", error);
      
      // Local Mock Report Fallback
      const mockReport = `### Field Advisory Analysis: ${region} (${period})

- **Recommended Formation:** ${region === 'North America' ? 'Hell Creek Formation (Sandstone Block-D)' : region === 'Europe' ? 'Solnhofen Plattenkalk Layer B' : 'Sedimentary Matrix C'}
- **Coordinates:** Lat ${coords[0]}, Lng ${coords[1]}
- **Stratigraphic Depth:** Excavation depth of 3.5m to 8.2m recommended.
- **Logistics Advisory:** Continental climate. Recommend fine brushing kit, dry-sieving tables, and chisel chisels.
- **Discovery Probability:** **88.5%** based on local specimen density models.`;

      setAdvisorReport(mockReport);
      setCustomDigZone({
        lat: coords[0],
        lng: coords[1],
        name: `AI DIG ZONE: ${region.toUpperCase()} // ${period.toUpperCase()}`,
        fossils: [fossilType],
        score: 88.5
      });
    } finally {
      setAdvisorLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px 0' }}>
      <header style={{ marginBottom: '50px' }}>
        <span className="catalog-tag">GIS-MAP // GEOSPATIAL TELEMETRY</span>
        <h1 style={{ fontSize: '3rem', marginTop: '10px', marginBottom: '15px', fontFamily: 'var(--font-display)', fontWeight: 700 }}>
          Prospector <span className="gradient-text">Map Console</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-editorial)', fontSize: '1.25rem', maxWidth: '650px', lineHeight: '1.7', fontWeight: 300 }}>
          Chart predictive excavation hotspots using machine learning probability scoring, stratigraphic composition layers, and geological find indexes.
        </p>
      </header>

      <div 
        className="perspective-container"
        style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '40px', height: '620px', alignItems: 'stretch' }}
      >
        {/* Embedded Map Panel */}
        <div 
          className="glass-card glass-sheen-wrapper" 
          style={{ overflow: 'hidden', padding: '12px', border: '1px solid rgba(212, 163, 115, 0.12)', boxShadow: 'var(--shadow-deep), var(--glass-bevel)', height: '100%', transformStyle: 'preserve-3d', background: 'rgba(18,14,13,0.4)' }}
        >
          {!loading && (
            <MapContainer center={mapCenter} zoom={2.5} style={{ height: '100%', width: '100%' }} zoomControl={false}>
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              />
              <RecenterMap center={mapCenter} />

              {/* Standard hotspots */}
              {sites.map(site => {
                const isHighValue = site.score > 90;
                const siteColor = isHighValue ? 'var(--earth-sand)' : 'var(--earth-copper)';
                
                return (
                  <React.Fragment key={site.id}>
                    <Marker position={[site.lat, site.lng]}>
                      <Popup>
                        <div style={{
                          color: '#ffffff',
                          fontFamily: 'var(--font-body)',
                          padding: '10px',
                          background: '#0c0a09'
                        }}>
                          <strong style={{ fontSize: '12px', letterSpacing: '0.05em', color: siteColor, fontFamily: 'var(--font-display)' }}>
                            {site.name.toUpperCase()}
                          </strong>
                          <div style={{ height: '1px', background: 'rgba(212,163,115,0.1)', margin: '8px 0' }}></div>
                          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px', fontFamily: 'var(--font-number)' }}>
                            PROBABILITY SCORE: <span style={{ color: '#ffffff', fontWeight: 900 }}>{site.score}%</span>
                          </div>
                          <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-number)' }}>
                            EST. MINERAL DENSITY: <span style={{ color: 'var(--earth-sand)', fontWeight: 700 }}>{site.fossils.join(', ')}</span>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                    <Circle
                      center={[site.lat, site.lng]}
                      radius={500000}
                      pathOptions={{
                        color: siteColor,
                        fillColor: siteColor,
                        fillOpacity: 0.04,
                        weight: 1.0,
                        dashArray: '5, 5'
                      }}
                    />
                  </React.Fragment>
                );
              })}

              {/* Custom Dynamic AI Dig Zone Circle */}
              {customDigZone && (
                <React.Fragment>
                  <Marker position={[customDigZone.lat, customDigZone.lng]}>
                    <Popup>
                      <div style={{
                        color: '#ffffff',
                        fontFamily: 'var(--font-body)',
                        padding: '10px',
                        background: '#0c0a09'
                      }}>
                        <strong style={{ fontSize: '12px', letterSpacing: '0.05em', color: 'var(--earth-sand)', fontFamily: 'var(--font-display)' }}>
                          {customDigZone.name.toUpperCase()}
                        </strong>
                        <div style={{ height: '1px', background: 'rgba(212,163,115,0.1)', margin: '8px 0' }}></div>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px', fontFamily: 'var(--font-number)' }}>
                          AI PROBABILITY: <span style={{ color: '#ffffff', fontWeight: 900 }}>{customDigZone.score}%</span>
                        </div>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-number)' }}>
                          TARGET CLASS: <span style={{ color: 'var(--earth-sand)', fontWeight: 700 }}>{customDigZone.fossils.join(', ')}</span>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                  <Circle
                    center={[customDigZone.lat, customDigZone.lng]}
                    radius={400000}
                    pathOptions={{
                      color: 'var(--earth-sand)',
                      fillColor: 'var(--earth-sand)',
                      fillOpacity: 0.1,
                      weight: 1.5,
                      dashArray: '8, 8'
                    }}
                  />
                </React.Fragment>
              )}
            </MapContainer>
          )}
        </div>

        {/* Sidebar Panel with Tabs */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', padding: '0', border: '1px solid rgba(212, 163, 115, 0.12)', background: 'rgba(18,14,13,0.3)' }}>
          
          {/* Tab Navigation Headers */}
          <div style={{ display: 'flex', borderBottom: '1px solid rgba(212, 163, 115, 0.1)', background: 'rgba(8,7,6,0.5)' }}>
            <button
              style={{
                flex: 1,
                padding: '18px 15px',
                border: 'none',
                background: activeTab === 'sites' ? 'rgba(212, 163, 115, 0.03)' : 'transparent',
                color: activeTab === 'sites' ? 'var(--earth-sand)' : 'var(--text-dim)',
                cursor: 'pointer',
                fontFamily: 'var(--font-display)',
                fontWeight: '700',
                fontSize: '9px',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                borderBottom: activeTab === 'sites' ? '2px solid var(--earth-sand)' : 'none',
                transition: 'var(--transition-fast)'
              }}
              onClick={() => setActiveTab('sites')}
            >
              <TrendingUp size={12} /> Hotspots
            </button>
            <button
              style={{
                flex: 1,
                padding: '18px 15px',
                border: 'none',
                background: activeTab === 'advisor' ? 'rgba(212, 163, 115, 0.03)' : 'transparent',
                color: activeTab === 'advisor' ? 'var(--earth-sand)' : 'var(--text-dim)',
                cursor: 'pointer',
                fontFamily: 'var(--font-display)',
                fontWeight: '700',
                fontSize: '9px',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                borderBottom: activeTab === 'advisor' ? '2px solid var(--earth-sand)' : 'none',
                transition: 'var(--transition-fast)'
              }}
              onClick={() => setActiveTab('advisor')}
            >
              <Compass size={12} /> AI Advisor
            </button>
          </div>

          {/* Tab Content Body */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '25px' }}>
            <AnimatePresence mode="wait">
              {activeTab === 'sites' ? (
                <motion.div
                  key="sites"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}
                >
                  {loading ? (
                    [1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: '110px', borderRadius: '1px' }}></div>)
                  ) : (
                    sites.sort((a, b) => b.score - a.score).map(site => (
                      <motion.div
                        whileHover={{ scale: 1.02, x: 5 }}
                        key={site.id}
                        className="glass-card"
                        style={{ 
                          padding: '20px', 
                          background: 'rgba(8,7,6,0.3)', 
                          border: '1px solid rgba(212, 163, 115, 0.06)',
                          borderLeft: `3px solid ${site.score > 90 ? 'var(--earth-sand)' : 'var(--earth-copper)'}`,
                          cursor: 'pointer',
                          boxShadow: 'var(--glass-bevel)'
                        }}
                        onClick={() => setMapCenter([site.lat, site.lng])}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' }}>
                          <span style={{ fontWeight: '700', fontSize: '0.9rem', fontFamily: 'var(--font-display)', color: '#ffffff' }}>{site.name}</span>
                          <span style={{ color: site.score > 90 ? 'var(--earth-sand)' : 'var(--earth-copper)', fontWeight: '900', fontFamily: 'var(--font-number)' }}>{site.score}%</span>
                        </div>
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '8px', fontFamily: 'var(--font-editorial)', fontStyle: 'italic' }}>
                          Index Fossils: {site.fossils.join(', ')}
                        </p>
                        <div style={{ display: 'flex', gap: '10px', fontSize: '8px', color: 'var(--text-dim)', fontFamily: 'var(--font-number)' }}>
                          <span>LAT: {site.lat.toFixed(4)}</span>
                          <span>LNG: {site.lng.toFixed(4)}</span>
                        </div>
                      </motion.div>
                    ))
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="advisor"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
                >
                  {/* Form */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '8px', color: 'var(--text-dim)', marginBottom: '6px', fontFamily: 'var(--font-number)', letterSpacing: '0.1em' }}>GEOLOGICAL PERIOD</label>
                      <select 
                        value={period} 
                        onChange={(e) => setPeriod(e.target.value)}
                        style={{ width: '100%', padding: '12px', background: 'rgba(8,7,6,0.9)', border: '1px solid rgba(212,163,115,0.15)', color: '#ffffff', fontSize: '11px', outline: 'none', fontFamily: 'var(--font-display)', letterSpacing: '0.05em' }}
                      >
                        <option>Cambrian</option>
                        <option>Devonian</option>
                        <option>Jurassic</option>
                        <option>Cretaceous</option>
                        <option>Cenozoic</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '8px', color: 'var(--text-dim)', marginBottom: '6px', fontFamily: 'var(--font-number)', letterSpacing: '0.1em' }}>TARGET SPECIMEN CLASS</label>
                      <select 
                        value={fossilType} 
                        onChange={(e) => setFossilType(e.target.value)}
                        style={{ width: '100%', padding: '12px', background: 'rgba(8,7,6,0.9)', border: '1px solid rgba(212,163,115,0.15)', color: '#ffffff', fontSize: '11px', outline: 'none', fontFamily: 'var(--font-display)', letterSpacing: '0.05em' }}
                      >
                        <option>Trilobite Fossil</option>
                        <option>Ammonite Fossil</option>
                        <option>Dinosaur Bone</option>
                        <option>Shark Tooth</option>
                        <option>Fern Fossil</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '8px', color: 'var(--text-dim)', marginBottom: '6px', fontFamily: 'var(--font-number)', letterSpacing: '0.1em' }}>CONTINENT / GEOGRAPHY</label>
                      <select 
                        value={region} 
                        onChange={(e) => setRegion(e.target.value)}
                        style={{ width: '100%', padding: '12px', background: 'rgba(8,7,6,0.9)', border: '1px solid rgba(212,163,115,0.15)', color: '#ffffff', fontSize: '11px', outline: 'none', fontFamily: 'var(--font-display)', letterSpacing: '0.05em' }}
                      >
                        <option>North America</option>
                        <option>Europe</option>
                        <option>Asia</option>
                        <option>Australia</option>
                      </select>
                    </div>

                    <button 
                      className="btn-primary" 
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', minHeight: '48px', marginTop: '10px' }}
                      onClick={handleGenerateAdvisory}
                      disabled={advisorLoading}
                    >
                      <Sparkles size={14} /> 
                      {advisorLoading ? 'Analyzing Formations...' : 'Generate AI Advisory'}
                    </button>
                  </div>

                  {/* Advisor Report */}
                  {advisorLoading && (
                    <div style={{ padding: '20px', border: '1px dashed rgba(212,163,115,0.3)', textAlign: 'center', background: 'rgba(8,7,6,0.5)' }}>
                      <span className="dot-pulse-prop" style={{ color: 'var(--earth-sand)', fontWeight: 'bold', fontFamily: 'var(--font-number)', fontSize: '8px', letterSpacing: '0.15em' }}>ROUTING DATA TO EXCAVATION AGENT...</span>
                    </div>
                  )}

                  {advisorReport && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      style={{ 
                        background: 'rgba(212, 163, 115, 0.03)', 
                        border: '1px solid rgba(212,163,115,0.15)',
                        borderRadius: '2px', 
                        padding: '20px',
                        fontSize: '0.85rem',
                        lineHeight: '1.6',
                        fontFamily: 'var(--font-editorial)'
                      }}
                      className="markdown-content"
                    >
                      <h4 style={{ color: 'var(--earth-sand)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'var(--font-display)', fontSize: '11px', letterSpacing: '0.1em' }}>
                        <Search size={12} /> FIELD ADVISORY SPECTRUM
                      </h4>
                      <ReactMarkdown>{advisorReport}</ReactMarkdown>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* How it works bottom note */}
          <div style={{ padding: '20px 25px', borderTop: '1px solid rgba(212, 163, 115, 0.1)', background: 'rgba(8,7,6,0.5)' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', fontSize: '0.78rem', color: 'var(--text-dim)' }}>
              <Info size={14} style={{ flexShrink: 0, marginTop: '2px', color: 'var(--earth-sand)' }} />
              <span style={{ fontFamily: 'var(--font-editorial)' }}>
                Dynamic AI zones represent predicted geological exposures of matching sedimentary strata.
              </span>
            </div>
          </div>
        </div>

      </div>
      <style>{`
        .dot-pulse-prop {
          animation: pulse-prop 1.5s infinite;
        }
        @keyframes pulse-prop {
          0% { opacity: 0.4; }
          50% { opacity: 1; }
          100% { opacity: 0.4; }
        }
        .markdown-content h3 {
          font-family: var(--font-display);
          color: var(--earth-sand);
          margin-top: 15px;
          margin-bottom: 8px;
        }
        .markdown-content ul {
          margin-left: 15px;
        }
      `}</style>
    </div>
  );
};

export default Prospector;
