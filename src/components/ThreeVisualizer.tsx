import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Sparkles, Brain, Award, TrendingUp, CheckCircle, BarChart3, GraduationCap } from 'lucide-react';

// Node data definitions
interface LearningNode {
  title: string;
  category: string;
  icon: React.ReactNode;
  angle: number;
  radius: number;
  heightOffset: number;
  color: string;
}

const NODES_DATA: LearningNode[] = [
  { title: 'BOOTCAMP', category: 'Foundation', icon: <GraduationCap size={16} />, angle: 0, radius: 4.8, heightOffset: 0.8, color: '#00f0ff' },
  { title: 'SKILLS', category: 'Core Matrix', icon: <Brain size={16} />, angle: Math.PI / 3, radius: 5.2, heightOffset: -0.6, color: '#00f0ff' },
  { title: 'ASSESSMENTS', category: 'Evaluation', icon: <BarChart3 size={16} />, angle: (2 * Math.PI) / 3, radius: 4.6, heightOffset: 1.2, color: '#00f0ff' },
  { title: 'FEEDBACK', category: 'Continuous Loop', icon: <Sparkles size={16} />, angle: Math.PI, radius: 5.0, heightOffset: -1.0, color: '#00f0ff' },
  { title: 'CERTIFICATIONS', category: 'Validation', icon: <Award size={16} />, angle: (4 * Math.PI) / 3, radius: 4.9, heightOffset: 0.9, color: '#00f0ff' },
  { title: 'UPSKILLING', category: 'Growth Engine', icon: <TrendingUp size={16} />, angle: (5 * Math.PI) / 3, radius: 5.3, heightOffset: -0.4, color: '#00f0ff' },
];

const LIFECYCLE_STEPS = [
  { label: 'Learn', icon: <GraduationCap size={14} /> },
  { label: 'Assess', icon: <BarChart3 size={14} /> },
  { label: 'Analyze', icon: <Brain size={14} /> },
  { label: 'Improve', icon: <TrendingUp size={14} /> },
  { label: 'Certify', icon: <Award size={14} /> },
  { label: 'Upskill', icon: <CheckCircle size={14} /> },
];

export const ThreeVisualizer: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  useEffect(() => {
    // Check user preference for reduced motion
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(motionQuery.matches);
    const handleMotionChange = (e: MediaQueryListEvent) => setIsReducedMotion(e.matches);
    motionQuery.addEventListener('change', handleMotionChange);

    const container = mountRef.current;
    if (!container) return;

    // Detect mobile viewport for performance optimization
    const isMobile = window.innerWidth <= 768;
    const particleCount = isMobile ? 80 : 250;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x05070a, 0.04);

    const width = container.clientWidth || window.innerWidth / 2;
    const height = container.clientHeight || window.innerHeight;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 14);

    let renderer: THREE.WebGLRenderer | null = null;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isMobile,
        alpha: true,
        powerPreference: 'high-performance',
      });

      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.2;
      container.appendChild(renderer.domElement);
    } catch (err) {
      console.warn('WebGL Renderer initialization warning:', err);
    }

    // Group to hold all 3D scene elements for easy parallax manipulation
    const mainGroup = new THREE.Group();
    mainGroup.position.set(0, 0.9, 0);
    scene.add(mainGroup);

    // 2. Lighting Setup (Soft Electric Cyan & Ambient Graphite Depth)
    const ambientLight = new THREE.AmbientLight(0x0c1626, 2.5);
    scene.add(ambientLight);

    const cyanPointLight = new THREE.PointLight(0x00f0ff, 4, 25);
    cyanPointLight.position.set(0, 0, 3);
    mainGroup.add(cyanPointLight);

    const rimLight = new THREE.PointLight(0x00a8ff, 2, 30);
    rimLight.position.set(5, 5, -5);
    mainGroup.add(rimLight);

    // 3. Central AI Neural Intelligence Sphere (Core)
    const geometriesToDispose: THREE.BufferGeometry[] = [];
    const materialsToDispose: THREE.Material[] = [];

    // Inner glowing sphere core
    const coreGeo = new THREE.SphereGeometry(1.4, 32, 32);
    geometriesToDispose.push(coreGeo);

    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x001524,
      emissive: 0x00f0ff,
      emissiveIntensity: 0.6,
      roughness: 0.1,
      metalness: 0.9,
      wireframe: false,
    });
    materialsToDispose.push(coreMat);

    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    mainGroup.add(coreMesh);

    // Outer Glass Holographic Sphere Mesh
    const outerGeo = new THREE.IcosahedronGeometry(2.0, 2);
    geometriesToDispose.push(outerGeo);

    const outerMat = new THREE.MeshPhysicalMaterial({
      color: 0x00f0ff,
      transmission: 0.85,
      opacity: 0.8,
      transparent: true,
      roughness: 0.1,
      ior: 1.4,
      reflectivity: 0.7,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      wireframe: true,
    });
    materialsToDispose.push(outerMat);

    const outerMesh = new THREE.Mesh(outerGeo, outerMat);
    mainGroup.add(outerMesh);

    // Concentric Glass Orbital Rings
    const ringGroup = new THREE.Group();
    mainGroup.add(ringGroup);

    const createRing = (radius: number, rotationX: number, rotationY: number) => {
      const ringGeo = new THREE.TorusGeometry(radius, 0.025, 16, 100);
      geometriesToDispose.push(ringGeo);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x00f0ff,
        transparent: true,
        opacity: 0.4,
      });
      materialsToDispose.push(ringMat);
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = rotationX;
      ringMesh.rotation.y = rotationY;
      ringGroup.add(ringMesh);
      return ringMesh;
    };

    const ring1 = createRing(2.8, Math.PI / 4, 0);
    const ring2 = createRing(3.4, -Math.PI / 6, Math.PI / 3);
    const ring3 = createRing(4.0, Math.PI / 3, -Math.PI / 4);

    // 4. Orbiting 3D Nodes (Geometry placeholders in WebGL + synchronized overlay markers)
    const nodeMeshes: { mesh: THREE.Mesh; angle: number; radius: number; heightOffset: number }[] = [];

    NODES_DATA.forEach((nodeData) => {
      const nodeGeo = new THREE.DodecahedronGeometry(0.35, 1);
      geometriesToDispose.push(nodeGeo);
      const nodeMat = new THREE.MeshPhysicalMaterial({
        color: 0x00f0ff,
        emissive: 0x006680,
        emissiveIntensity: 0.5,
        transmission: 0.9,
        opacity: 0.9,
        transparent: true,
        roughness: 0.2,
        clearcoat: 1.0,
      });
      materialsToDispose.push(nodeMat);

      const nodeMesh = new THREE.Mesh(nodeGeo, nodeMat);
      const x = Math.cos(nodeData.angle) * nodeData.radius;
      const z = Math.sin(nodeData.angle) * nodeData.radius;
      nodeMesh.position.set(x, nodeData.heightOffset, z);

      mainGroup.add(nodeMesh);
      nodeMeshes.push({
        mesh: nodeMesh,
        angle: nodeData.angle,
        radius: nodeData.radius,
        heightOffset: nodeData.heightOffset,
      });

      // Connecting neural line to core
      const points = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(x, nodeData.heightOffset, z)];
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
      geometriesToDispose.push(lineGeo);
      const lineMat = new THREE.LineDashedMaterial({
        color: 0x00f0ff,
        dashSize: 0.2,
        gapSize: 0.1,
        opacity: 0.25,
        transparent: true,
      });
      materialsToDispose.push(lineMat);
      const line = new THREE.Line(lineGeo, lineMat);
      line.computeLineDistances();
      mainGroup.add(line);
    });

    // 5. Sparse Background Particle Field
    const particlesGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleScales = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 30;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 30;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 20 - 5;
      particleScales[i] = Math.random() * 2 + 1;
    }

    particlesGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particlesGeo.setAttribute('scale', new THREE.BufferAttribute(particleScales, 1));
    geometriesToDispose.push(particlesGeo);

    const particlesMat = new THREE.PointsMaterial({
      color: 0x00f0ff,
      size: 0.08,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
    });
    materialsToDispose.push(particlesMat);

    const particleSystem = new THREE.Points(particlesGeo, particlesMat);
    mainGroup.add(particleSystem);

    // 6. Smooth Mouse Parallax Tracking
    let targetMouseX = 0;
    let targetMouseY = 0;
    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      if (motionQuery.matches) return; // Skip mouse parallax if reduced motion preferred
      const rect = container.getBoundingClientRect();
      const relativeX = event.clientX - rect.left;
      const relativeY = event.clientY - rect.top;
      targetMouseX = (relativeX / width - 0.5) * 0.8;
      targetMouseY = (relativeY / height - 0.5) * 0.8;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Handle Window Resize
    const handleResize = () => {
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      if (newW === 0 || newH === 0) return;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      if (renderer) {
        renderer.setSize(newW, newH);
      }
    };

    window.addEventListener('resize', handleResize);

    // 7. Animation Loop with FPS Limiter & Memory Safety
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();
      const delta = clock.getDelta();

      // Skip dynamic updates if reduced motion is enabled
      if (!motionQuery.matches) {
        // Rotate Central AI Core
        coreMesh.rotation.y += 0.005;
        outerMesh.rotation.y -= 0.008;
        outerMesh.rotation.x += 0.004;

        // Rotate Rings at varied speeds
        ring1.rotation.z += 0.006;
        ring2.rotation.y += 0.008;
        ring3.rotation.x -= 0.005;

        // Orbiting node positions
        nodeMeshes.forEach((item, index) => {
          const currentAngle = item.angle + elapsedTime * 0.15;
          item.mesh.position.x = Math.cos(currentAngle) * item.radius;
          item.mesh.position.z = Math.sin(currentAngle) * item.radius;
          item.mesh.position.y = item.heightOffset + Math.sin(elapsedTime * 1.5 + index) * 0.2;
          item.mesh.rotation.x += 0.01;
          item.mesh.rotation.y += 0.015;
        });

        // Background Particles Floating
        particleSystem.rotation.y = elapsedTime * 0.02;

        // Smooth Mouse Parallax Interpolation (Lerp)
        mouseX += (targetMouseX - mouseX) * 0.05;
        mouseY += (targetMouseY - mouseY) * 0.05;

        mainGroup.rotation.y = mouseX * 0.5;
        mainGroup.rotation.x = -mouseY * 0.5;
      }

      if (renderer) {
        renderer.render(scene, camera);
      }
    };

    animate();

    // 8. Strict WebGL Memory & Listener Cleanup on Component Unmount
    return () => {
      motionQuery.removeEventListener('change', handleMotionChange);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);

      cancelAnimationFrame(animationFrameId);

      // Dispose Geometries & Materials
      geometriesToDispose.forEach((geo) => geo.dispose());
      materialsToDispose.forEach((mat) => mat.dispose());

      if (renderer) {
        if (container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
        renderer.dispose();
      }
    };
  }, []);

  return (
    <div className="visualizer-container">
      {/* 3D WebGL Canvas Container */}
      <div ref={mountRef} className="webgl-canvas" />

      {/* Atmospheric Ambient Glow Backdrop */}
      <div className="cyan-ambient-glow" />

      {/* Floating 3D Node Overlay Badges for Seamless Interactivity */}
      <div className="node-overlay-container">
        {NODES_DATA.map((node) => {
          const isActive = activeNode === node.title;
          return (
            <div
              key={node.title}
              className={`node-badge ${isActive ? 'active' : ''}`}
              onMouseEnter={() => setActiveNode(node.title)}
              onMouseLeave={() => setActiveNode(null)}
            >
              <div className="node-icon">{node.icon}</div>
              <div className="node-info">
                <span className="node-title">{node.title}</span>
                <span className="node-category">{node.category}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Learning Intelligence Lifecycle Stepper Bar */}
      <div className="lifecycle-stepper-card">
        <div className="stepper-header">
          <div className="stepper-title">
            <span className="cyan-pulse-dot" />
            <span>LEARNING INTELLIGENCE LIFECYCLE</span>
          </div>
        </div>

        <div className="stepper-pipeline">
          {LIFECYCLE_STEPS.map((step, idx) => (
            <React.Fragment key={step.label}>
              <div className="stepper-node">
                <div className="step-badge">{step.icon}</div>
                <span className="step-label">{step.label}</span>
              </div>
              {idx < LIFECYCLE_STEPS.length - 1 && (
                <div className="stepper-arrow">
                  <div className="arrow-line" />
                  <span className="arrow-head">›</span>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};
