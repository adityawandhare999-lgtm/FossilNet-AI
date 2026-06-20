import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

const FossilViewer3D = ({ fossilType }) => {
  const containerRef = useRef(null);
  const [wireframe, setWireframe] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const rendererRef = useRef(null);
  const animationFrameRef = useRef(null);
  const meshGroupRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // 1. Scene Setup
    const width = containerRef.current.clientWidth || 400;
    const height = containerRef.current.clientHeight || 400;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x080706); // Matching obsidian background

    // 2. Camera Setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 5);

    // 3. Renderer Setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    
    // Clear previous canvas
    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.15);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.0);
    dirLight1.position.set(5, 5, 5);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xd4a373, 0.75); // Warm gold accent light
    dirLight2.position.set(-5, -5, 2);
    scene.add(dirLight2);

    const pointLight = new THREE.PointLight(0xffffff, 0.4, 10);
    pointLight.position.set(0, 2, 2);
    scene.add(pointLight);

    // 5. Build Procedural Fossil Model
    const group = new THREE.Group();
    meshGroupRef.current = group;
    
    // Custom premium fossil rock materials
    const fossilMaterial = new THREE.MeshStandardMaterial({
      color: 0x8c7864, // Earthy fossil brown
      roughness: 0.85,
      metalness: 0.15,
      wireframe: wireframe,
      flatShading: true
    });

    const highlightMaterial = new THREE.MeshStandardMaterial({
      color: 0xd4a373, // Warm gold highlights
      roughness: 0.4,
      metalness: 0.6,
      wireframe: wireframe
    });

    const boneMaterial = new THREE.MeshStandardMaterial({
      color: 0xdfd5c6, // Aged bone white
      roughness: 0.7,
      metalness: 0.1,
      wireframe: wireframe,
      flatShading: true
    });

    const toothMaterial = new THREE.MeshStandardMaterial({
      color: 0x2e2d2c, // Dark shiny enamel gray
      roughness: 0.35,
      metalness: 0.5,
      wireframe: wireframe
    });

    const labelLower = (fossilType || '').toLowerCase();

    if (labelLower.includes('ammonite') || labelLower.includes('shell')) {
      // Procedural logarithmic spiral tube for Ammonite
      class LogarithmicSpiralCurve extends THREE.Curve {
        getPoint(t) {
          const theta = t * Math.PI * 7.5; // 3.75 spirals
          const a = 0.08;
          const b = 0.11;
          const r = a * Math.exp(b * theta);
          const x = r * Math.cos(theta) - 0.2;
          const y = r * Math.sin(theta);
          // Ribbed surface effect along the spiral
          const z = 0.04 * Math.sin(t * Math.PI * 64) * (r * 0.4);
          return new THREE.Vector3(x, y, z);
        }
      }

      const path = new LogarithmicSpiralCurve();
      const geom = new THREE.TubeGeometry(path, 160, 0.18, 16, false);
      const mainMesh = new THREE.Mesh(geom, fossilMaterial);
      group.add(mainMesh);

      // Add central core cap
      const centerGeom = new THREE.SphereGeometry(0.12, 16, 16);
      const centerMesh = new THREE.Mesh(centerGeom, highlightMaterial);
      centerMesh.position.set(-0.2, 0, 0);
      group.add(centerMesh);

    } else if (labelLower.includes('trilobite')) {
      // Procedural multi-segmented Trilobite model
      // 1. Cephalon (Head shield)
      const headGeom = new THREE.SphereGeometry(0.6, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
      const head = new THREE.Mesh(headGeom, fossilMaterial);
      head.scale.set(1.4, 0.8, 0.4);
      head.position.set(0, 0.8, 0);
      head.rotation.x = Math.PI * 0.1;
      group.add(head);

      // 2. Eyes
      const eyeGeom = new THREE.SphereGeometry(0.08, 16, 16);
      const leftEye = new THREE.Mesh(eyeGeom, highlightMaterial);
      leftEye.position.set(-0.4, 0.85, 0.2);
      const rightEye = leftEye.clone();
      rightEye.position.x = 0.4;
      group.add(leftEye, rightEye);

      // 3. Central Axis Lobe (Spine)
      const axisGeom = new THREE.SphereGeometry(0.3, 16, 32);
      const axis = new THREE.Mesh(axisGeom, fossilMaterial);
      axis.scale.set(0.9, 2.4, 0.5);
      axis.position.set(0, -0.1, 0.1);
      group.add(axis);

      // 4. Pleural Ribs (Lateral body segments)
      const ribCount = 8;
      for (let i = 0; i < ribCount; i++) {
        const yOffset = 0.5 - (i * 0.22);
        const ribWidth = 1.2 * Math.sin((i + 2) / (ribCount + 2) * Math.PI);
        const ribGeom = new THREE.CylinderGeometry(0.05, 0.05, ribWidth, 12);
        const rib = new THREE.Mesh(ribGeom, fossilMaterial);
        rib.rotation.z = Math.PI / 2;
        rib.position.set(0, yOffset, 0);
        // Bend ribs backward
        rib.scale.set(1, 1, 0.3);
        group.add(rib);
      }

      // 5. Pygidium (Tail shield)
      const tailGeom = new THREE.SphereGeometry(0.4, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
      const tail = new THREE.Mesh(tailGeom, fossilMaterial);
      tail.scale.set(1.1, 0.7, 0.3);
      tail.position.set(0, -1.0, 0);
      tail.rotation.x = -Math.PI * 0.05;
      group.add(tail);

    } else if (labelLower.includes('bone') || labelLower.includes('femur') || labelLower.includes('skeleton') || labelLower.includes('vertebra')) {
      // Procedural dinosaur femur bone
      const shaftGeom = new THREE.CylinderGeometry(0.18, 0.18, 2.2, 16);
      const shaft = new THREE.Mesh(shaftGeom, boneMaterial);
      group.add(shaft);

      // Joint lobes (condyles)
      const lobeGeom = new THREE.SphereGeometry(0.4, 16, 16);
      
      const topLeftLobe = new THREE.Mesh(lobeGeom, boneMaterial);
      topLeftLobe.position.set(-0.25, 1.1, 0);
      topLeftLobe.scale.set(1, 0.8, 1);

      const topRightLobe = topLeftLobe.clone();
      topRightLobe.position.x = 0.25;

      const bottomLeftLobe = topLeftLobe.clone();
      bottomLeftLobe.position.set(-0.25, -1.1, 0);

      const bottomRightLobe = topRightLobe.clone();
      bottomRightLobe.position.set(0.25, -1.1, 0);

      group.add(topLeftLobe, topRightLobe, bottomLeftLobe, bottomRightLobe);

    } else if (labelLower.includes('tooth') || labelLower.includes('claw') || labelLower.includes('megalodon')) {
      // Procedural Megalodon/Shark Tooth
      const shape = new THREE.Shape();
      shape.moveTo(0, 1.2);
      shape.quadraticCurveTo(0.6, 0.2, 0.7, -0.6);
      shape.quadraticCurveTo(0, -0.8, -0.7, -0.6);
      shape.quadraticCurveTo(-0.6, 0.2, 0, 1.2);

      const extrudeSettings = {
        steps: 1,
        depth: 0.15,
        bevelEnabled: true,
        bevelThickness: 0.04,
        bevelSize: 0.03,
        bevelSegments: 4
      };

      const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
      geom.center();
      const blade = new THREE.Mesh(geom, toothMaterial);
      group.add(blade);

      // Tooth Root
      const rootGeom = new THREE.BoxGeometry(1.3, 0.35, 0.25);
      const root = new THREE.Mesh(rootGeom, fossilMaterial);
      root.position.set(0, 0.65, 0);
      root.rotation.x = 0.1;
      group.add(root);

      // Root split (bifurcated lobes)
      const rootLobeGeom = new THREE.SphereGeometry(0.25, 16, 16);
      const leftLobe = new THREE.Mesh(rootLobeGeom, fossilMaterial);
      leftLobe.position.set(-0.55, 0.8, 0);
      const rightLobe = leftLobe.clone();
      rightLobe.position.x = 0.55;
      group.add(leftLobe, rightLobe);

    } else {
      // Default / Generic Ancient Shell (e.g. Clam shell valve)
      const shellShape = new THREE.CylinderGeometry(0.01, 1.2, 0.8, 24, 12, false, 0, Math.PI);
      const shellMesh = new THREE.Mesh(shellShape, fossilMaterial);
      shellMesh.rotation.x = Math.PI / 2;
      shellMesh.scale.set(1.2, 0.2, 1);
      group.add(shellMesh);

      // Rib ridges
      for (let i = -4; i <= 4; i++) {
        const ridgeGeom = new THREE.CylinderGeometry(0.02, 0.02, 1.1, 8);
        const ridge = new THREE.Mesh(ridgeGeom, highlightMaterial);
        ridge.position.set(0, 0, 0.1 * Math.cos(i * 0.3));
        ridge.rotation.z = i * 0.18;
        ridge.scale.set(1, 1, 0.2);
        group.add(ridge);
      }
    }

    scene.add(group);

    // 6. Interactive Mouse Orbit Logic
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const handleMouseDown = () => { isDragging = true; };
    const handleMouseMove = (e) => {
      const deltaMove = {
        x: e.clientX - previousMousePosition.x,
        y: e.clientY - previousMousePosition.y
      };

      if (isDragging && meshGroupRef.current) {
        meshGroupRef.current.rotation.y += deltaMove.x * 0.008;
        meshGroupRef.current.rotation.x += deltaMove.y * 0.008;
      }

      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => { isDragging = false; };
    
    // Zoom control
    const handleWheel = (e) => {
      e.preventDefault();
      camera.position.z = Math.max(2, Math.min(10, camera.position.z + e.deltaY * 0.005));
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    domElement.addEventListener('wheel', handleWheel, { passive: false });

    // 7. Animation Loop
    const animate = () => {
      if (autoRotate && group && !isDragging) {
        group.rotation.y += 0.006;
      }
      renderer.render(scene, camera);
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameRef.current);
      window.removeEventListener('resize', handleResize);
      domElement.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      domElement.removeEventListener('wheel', handleWheel);
      
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, [fossilType, wireframe, autoRotate]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', height: '100%', width: '100%' }}>
      {/* 3D Viewport */}
      <div 
        ref={containerRef} 
        style={{ 
          flex: 1, 
          minHeight: '320px', 
          borderRadius: '2px', // Sharp museum vitrine style
          overflow: 'hidden', 
          border: '1px solid rgba(212, 163, 115, 0.15)',
          background: '#080706',
          position: 'relative',
          cursor: 'grab',
          boxShadow: 'inset 0 0 40px rgba(0,0,0,0.95)'
        }} 
      />
      
      {/* Control Buttons */}
      <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
        <button 
          onClick={() => setWireframe(!wireframe)}
          style={{
            background: 'rgba(18, 14, 13, 0.7)',
            border: '1px solid rgba(212, 163, 115, 0.25)',
            color: 'var(--earth-sand)',
            padding: '8px 16px',
            borderRadius: '2px',
            cursor: 'pointer',
            fontSize: '9px',
            fontFamily: 'var(--font-display)',
            fontWeight: '700',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            transition: 'var(--transition-fast)'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(212, 163, 115, 0.05)';
            e.target.style.color = '#ffffff';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(18, 14, 13, 0.7)';
            e.target.style.color = 'var(--earth-sand)';
          }}
        >
          {wireframe ? 'Solid Model' : 'Wireframe Grid'}
        </button>
        <button 
          onClick={() => setAutoRotate(!autoRotate)}
          style={{
            background: 'rgba(18, 14, 13, 0.7)',
            border: '1px solid rgba(212, 163, 115, 0.25)',
            color: 'var(--earth-sand)',
            padding: '8px 16px',
            borderRadius: '2px',
            cursor: 'pointer',
            fontSize: '9px',
            fontFamily: 'var(--font-display)',
            fontWeight: '700',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            transition: 'var(--transition-fast)'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(212, 163, 115, 0.05)';
            e.target.style.color = '#ffffff';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(18, 14, 13, 0.7)';
            e.target.style.color = 'var(--earth-sand)';
          }}
        >
          {autoRotate ? 'Pause Rotation' : 'Auto Rotate'}
        </button>
      </div>
    </div>
  );
};

export default FossilViewer3D;
