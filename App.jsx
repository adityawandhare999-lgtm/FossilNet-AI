import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Camera, FileText, Map, Clock, MessageSquare, Compass, Sparkles, Brain } from 'lucide-react';
import Landing from './pages/Landing';
import Shazam from './pages/Shazam';
import Literature from './pages/Literature';
import Prospector from './pages/Prospector';
import Timeline from './pages/Timeline';
import Assistant from './pages/Assistant';
import RAG from './pages/RAG';

function NavLink({ to, children, icon: Icon }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link to={to} className={`nav-link ${isActive ? 'active' : ''}`}>
      {Icon && <Icon size={12} style={{ color: isActive ? 'var(--earth-sand)' : 'inherit', transition: 'var(--transition-cubic)' }} />}
      {children}
    </Link>
  );
}

function Navbar() {
  return (
    <nav className="glass-card" style={{
      margin: '30px 40px',
      padding: '20px 40px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'sticky',
      top: '30px',
      zIndex: 1000,
      borderRadius: '2px', // Sharp premium editorial border
      border: '1px solid rgba(212, 163, 115, 0.08)',
      boxShadow: '0 30px 60px rgba(0, 0, 0, 0.6), var(--glass-bevel)'
    }}>
      {/* Logo Side */}
      <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '15px' }}>
        <div style={{
          width: '32px',
          height: '32px',
          border: '1px solid rgba(212, 163, 115, 0.3)',
          background: 'linear-gradient(135deg, var(--earth-copper), var(--earth-sand))',
          transform: 'rotate(45deg)',
          borderRadius: '1px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 15px rgba(212, 163, 115, 0.15)'
        }}>
          {/* Inner pivot to counter rotate */}
          <div style={{
            transform: 'rotate(-45deg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Compass size={14} style={{ color: '#080706' }} />
          </div>
        </div>
        <span className="utility-text" style={{ fontSize: '11px', color: '#ffffff', letterSpacing: '0.35em', fontWeight: 700 }}>
          FOSSILNET  <span style={{ color: 'var(--earth-sand)' }}>AI</span>
        </span>
      </Link>

      {/* Nav Links - Hidden on Mobile */}
      <div className="nav-links-container">
        <NavLink to="/shazam" icon={Camera}>Scanners</NavLink>
        <NavLink to="/literature" icon={FileText}>Archives</NavLink>
        <NavLink to="/rag" icon={Brain}>RAG Paper</NavLink>
        <NavLink to="/prospector" icon={Map}>Prospector</NavLink>
        <NavLink to="/timeline" icon={Clock}>Eras</NavLink>
        {/* <NavLink to="/assistant" icon={MessageSquare}></NavLink> */}
      </div>

      {/* Right Side Action Button */}
      <Link to="/assistant" style={{ textDecoration: 'none' }}>
        <div className="nav-action-btn" style={{
          padding: '10px 18px',
          borderRadius: '2px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: 'var(--earth-sand)',
          border: '1px solid rgba(212, 163, 115, 0.25)',
          cursor: 'pointer',
          fontFamily: 'var(--font-display)',
          fontSize: '9px',
          fontWeight: 700,
          letterSpacing: '0.15em',
          transition: 'var(--transition-cubic)'
        }}>
          <Sparkles size={11} />
          <span>ASK AI</span>
        </div>
      </Link>

      <style>{`
        .nav-links-container {
          display: flex;
          gap: 30px;
          align-items: center;
        }
        @media (max-width: 850px) {
          .nav-links-container {
            display: none !important;
          }
        }
        .nav-link {
          font-family: var(--font-number);
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          color: var(--text-muted);
          text-decoration: none;
          font-weight: 500;
          transition: var(--transition-cubic);
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .nav-link:hover, .nav-link.active {
          color: #ffffff;
          text-shadow: 0 0 12px rgba(212, 163, 115, 0.35);
        }
        .nav-action-btn:hover {
          background: rgba(212, 163, 115, 0.05);
          transform: translateY(-2px);
          border-color: var(--earth-sand);
          color: #ffffff;
          box-shadow: 0 5px 15px rgba(212, 163, 115, 0.1);
        }
      `}</style>
    </nav>
  );
}

function App() {
  return (
    <Router>
      {/* Background shapes for depth */}
      <div className="bg-mesh-container">
        <div className="bg-mesh-shape bg-mesh-top-left"></div>
        <div className="bg-mesh-shape bg-mesh-bottom-right"></div>
        <div className="bg-mesh-shape bg-mesh-accent"></div>
      </div>

      <Navbar />

      <div className="container" style={{ paddingBottom: '80px', position: 'relative', zIndex: 1 }}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/shazam" element={<Shazam />} />
          <Route path="/literature" element={<Literature />} />
          <Route path="/rag" element={<RAG />} />
          <Route path="/prospector" element={<Prospector />} />
          <Route path="/timeline" element={<Timeline />} />
          <Route path="/assistant" element={<Assistant />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
