/**
 * Three.js 3D WebGL Futuristic Environment & Full-Page Scroll Choreography
 * Creates an expansive, full-viewport 3D cyber universe in the background of the
 * WHOLE page:
 * - Centered Grand Cybernetic Core with 3 Concentric Orbital Rings
 * - 14 Floating Geometric Satellites distributed across the entire viewport
 * - 2,000 Particle Cyber Starfield spanning edge-to-edge
 * - Cyber Grid Horizon
 * - Continuous scroll-driven 3D rotation & Section Camera Choreography
 * - Interactive pointer parallax & dynamic theme synchronization
 */
(() => {
  if (typeof THREE === "undefined") {
    console.warn("Three.js not loaded. WebGL background disabled.");
    return;
  }

  const canvas = document.getElementById("webgl-canvas");
  if (!canvas) return;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // -------------------------------------------------------------
  // 1. SCENE, CAMERA, RENDERER
  // -------------------------------------------------------------
  const scene = new THREE.Scene();
  const fov = 55;
  const camera = new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 0, 13);

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance"
    });
  } catch (e) {
    console.warn("WebGL initialization failed:", e);
    return;
  }

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));

  // -------------------------------------------------------------
  // 2. THEME COLOR PALETTES
  // -------------------------------------------------------------
  const themes = {
    dark: {
      coreWire: 0x00f2fe,
      coreInner: 0x8b5cf6,
      ring1: 0x00f2fe,
      ring2: 0xa855f7,
      ring3: 0x38bdf8,
      nodes: 0x00f2fe,
      satellites: 0x6366f1,
      particles: 0x818cf8,
      light1: 0x00f2fe,
      light2: 0x9333ea,
      grid: 0x1e1b4b
    },
    light: {
      coreWire: 0x4f46e5,
      coreInner: 0x06b6d4,
      ring1: 0x4f46e5,
      ring2: 0x0284c7,
      ring3: 0x6366f1,
      nodes: 0x4f46e5,
      satellites: 0x0284c7,
      particles: 0x6366f1,
      light1: 0x4f46e5,
      light2: 0x0ea5e9,
      grid: 0xc7d2fe
    }
  };

  const getActiveThemeKey = () => {
    return document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
  };

  let currentTheme = themes[getActiveThemeKey()];

  // -------------------------------------------------------------
  // 3. LIGHTING
  // -------------------------------------------------------------
  const ambientLight = new THREE.AmbientLight(0xffffff, 1.1);
  scene.add(ambientLight);

  const pointLight1 = new THREE.PointLight(currentTheme.light1, 3.2, 50);
  pointLight1.position.set(8, 8, 8);
  scene.add(pointLight1);

  const pointLight2 = new THREE.PointLight(currentTheme.light2, 2.8, 50);
  pointLight2.position.set(-8, -8, 6);
  scene.add(pointLight2);

  // -------------------------------------------------------------
  // 4. GRAND CENTRAL CYBER STRUCTURE (Anchored in Background Center)
  // -------------------------------------------------------------
  const centralGroup = new THREE.Group();
  centralGroup.position.set(0, 0, 0);
  scene.add(centralGroup);

  // Outer Wireframe Icosahedron (Large, visible across whole screen)
  const outerGeo = new THREE.IcosahedronGeometry(4.2, 1);
  const outerMat = new THREE.MeshStandardMaterial({
    color: currentTheme.coreWire,
    wireframe: true,
    transparent: true,
    opacity: 0.75,
    roughness: 0.15,
    metalness: 0.85
  });
  const outerMesh = new THREE.Mesh(outerGeo, outerMat);
  centralGroup.add(outerMesh);

  // Glowing Points on Vertices
  const vertMat = new THREE.PointsMaterial({
    color: currentTheme.nodes,
    size: 0.16,
    transparent: true,
    opacity: 0.95
  });
  const vertPoints = new THREE.Points(outerGeo, vertMat);
  centralGroup.add(vertPoints);

  // Inner Quantum Polyhedron
  const innerGeo = new THREE.OctahedronGeometry(2.3, 2);
  const innerMat = new THREE.MeshStandardMaterial({
    color: currentTheme.coreInner,
    wireframe: false,
    transparent: true,
    opacity: 0.5,
    roughness: 0.1,
    metalness: 0.9
  });
  const innerMesh = new THREE.Mesh(innerGeo, innerMat);
  centralGroup.add(innerMesh);

  // Concentric Orbital Rings (Spanning large width across viewport)
  // Ring 1 (Inner Torus)
  const ring1Geo = new THREE.TorusGeometry(6.4, 0.045, 16, 110);
  const ring1Mat = new THREE.MeshBasicMaterial({
    color: currentTheme.ring1,
    transparent: true,
    opacity: 0.8
  });
  const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
  ring1.rotation.x = Math.PI / 3;
  centralGroup.add(ring1);

  // Ring 2 (Middle Torus)
  const ring2Geo = new THREE.TorusGeometry(8.5, 0.035, 16, 120);
  const ring2Mat = new THREE.MeshBasicMaterial({
    color: currentTheme.ring2,
    transparent: true,
    opacity: 0.7
  });
  const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
  ring2.rotation.y = Math.PI / 4;
  ring2.rotation.x = -Math.PI / 5;
  centralGroup.add(ring2);

  // Ring 3 (Outer Wide Torus)
  const ring3Geo = new THREE.TorusGeometry(10.8, 0.025, 16, 140);
  const ring3Mat = new THREE.MeshBasicMaterial({
    color: currentTheme.ring3,
    transparent: true,
    opacity: 0.55
  });
  const ring3 = new THREE.Mesh(ring3Geo, ring3Mat);
  ring3.rotation.x = Math.PI / 2.2;
  centralGroup.add(ring3);

  // Orbiting Satellite Nodes on Rings
  const orbitNodesCount = 10;
  const orbitNodes = [];
  const nodeGeo = new THREE.SphereGeometry(0.14, 12, 12);
  const nodeMat = new THREE.MeshStandardMaterial({
    color: currentTheme.nodes,
    emissive: currentTheme.nodes,
    emissiveIntensity: 0.9,
    roughness: 0.1
  });

  for (let i = 0; i < orbitNodesCount; i++) {
    const node = new THREE.Mesh(nodeGeo, nodeMat);
    centralGroup.add(node);
    const ringRadius = i % 3 === 0 ? 6.4 : i % 3 === 1 ? 8.5 : 10.8;
    orbitNodes.push({
      mesh: node,
      radius: ringRadius,
      speed: (i % 2 === 0 ? 0.014 : -0.012) * (1 + (i % 3) * 0.2),
      angle: (i / orbitNodesCount) * Math.PI * 2,
      axis: i % 3
    });
  }

  // -------------------------------------------------------------
  // 5. AMBIENT FLOATING SATELLITE GEOMETRIES (Distributed Across Viewport)
  // -------------------------------------------------------------
  // These float on left, right, top, and bottom so the whole background has 3D depth!
  const satellitesGroup = new THREE.Group();
  scene.add(satellitesGroup);

  const satelliteGeos = [
    new THREE.OctahedronGeometry(1.2, 0),
    new THREE.TetrahedronGeometry(1.4, 0),
    new THREE.IcosahedronGeometry(1.1, 0),
    new THREE.DodecahedronGeometry(1.0, 0),
    new THREE.TorusGeometry(1.2, 0.08, 12, 32)
  ];

  const satelliteMat = new THREE.MeshStandardMaterial({
    color: currentTheme.satellites,
    wireframe: true,
    transparent: true,
    opacity: 0.5,
    roughness: 0.2,
    metalness: 0.8
  });

  const satellites = [];
  const satelliteConfigs = [
    { x: -14, y: 7, z: -4, speedRot: 0.01, driftSpeed: 0.008, scale: 1.1 },
    { x: 15, y: 8, z: -5, speedRot: -0.012, driftSpeed: 0.009, scale: 1.2 },
    { x: -16, y: -2, z: -2, speedRot: 0.015, driftSpeed: 0.007, scale: 0.9 },
    { x: 16, y: -4, z: -3, speedRot: -0.01, driftSpeed: 0.011, scale: 1.0 },
    { x: -12, y: -10, z: -5, speedRot: 0.012, driftSpeed: 0.008, scale: 1.3 },
    { x: 13, y: -11, z: -4, speedRot: -0.014, driftSpeed: 0.009, scale: 1.1 },
    { x: -8, y: 12, z: -6, speedRot: 0.008, driftSpeed: 0.006, scale: 0.85 },
    { x: 8, y: 13, z: -7, speedRot: -0.009, driftSpeed: 0.007, scale: 0.95 },
    { x: -18, y: 3, z: -8, speedRot: 0.011, driftSpeed: 0.01, scale: 1.0 },
    { x: 19, y: 2, z: -7, speedRot: -0.013, driftSpeed: 0.008, scale: 1.05 }
  ];

  satelliteConfigs.forEach((cfg, idx) => {
    const geo = satelliteGeos[idx % satelliteGeos.length];
    const mesh = new THREE.Mesh(geo, satelliteMat);
    mesh.position.set(cfg.x, cfg.y, cfg.z);
    mesh.scale.set(cfg.scale, cfg.scale, cfg.scale);
    satellitesGroup.add(mesh);
    satellites.push({
      mesh: mesh,
      baseX: cfg.x,
      baseY: cfg.y,
      baseZ: cfg.z,
      speedRot: cfg.speedRot,
      driftSpeed: cfg.driftSpeed,
      phase: idx * 0.7
    });
  });

  // -------------------------------------------------------------
  // 6. EXPANSIVE PARTICLE STARFIELD (Covers Entire Screen)
  // -------------------------------------------------------------
  const particleCount = 2000;
  const particleGeo = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount * 3; i += 3) {
    positions[i] = (Math.random() - 0.5) * 70;
    positions[i + 1] = (Math.random() - 0.5) * 70;
    positions[i + 2] = (Math.random() - 0.5) * 45;
  }

  particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  const particleMat = new THREE.PointsMaterial({
    color: currentTheme.particles,
    size: 0.11,
    transparent: true,
    opacity: 0.85
  });

  const particleSystem = new THREE.Points(particleGeo, particleMat);
  scene.add(particleSystem);

  // -------------------------------------------------------------
  // 7. CYBER HORIZON GRID
  // -------------------------------------------------------------
  let gridHelper = new THREE.GridHelper(80, 50, currentTheme.coreWire, currentTheme.grid);
  gridHelper.position.y = -10;
  gridHelper.material.opacity = 0.28;
  gridHelper.material.transparent = true;
  scene.add(gridHelper);

  // -------------------------------------------------------------
  // 8. SCROLL CHOREOGRAPHY & TARGETS
  // -------------------------------------------------------------
  // Responsive check
  const isMobile = () => window.innerWidth < 768;

  // Base target camera & group transforms
  const currentCam = { x: 0, y: 0, z: 13 };
  const targetCam = { x: 0, y: 0, z: 13 };

  const currentGroupRot = { x: 0, y: 0, z: 0 };
  const targetGroupRot = { x: 0, y: 0, z: 0 };

  let currentScale = 1.0;
  let targetScale = 1.0;

  // Section-specific camera depths and focal adjustments
  const sectionWaypoints = {
    home: { camY: 0, camZ: 13, scale: 1.0, tiltX: 0.1 },
    about: { camY: -0.4, camZ: 12.2, scale: 1.1, tiltX: 0.2 },
    skills: { camY: 0.2, camZ: 11.5, scale: 1.25, tiltX: -0.15 },
    experience: { camY: -0.6, camZ: 12.5, scale: 1.1, tiltX: 0.25 },
    education: { camY: 0.1, camZ: 12.0, scale: 1.05, tiltX: -0.1 },
    projects: { camY: -0.5, camZ: 13.5, scale: 1.2, tiltX: 0.3 },
    contact: { camY: -1.0, camZ: 12.0, scale: 1.3, tiltX: 0.1 }
  };

  const sectionsList = ["home", "about", "skills", "experience", "education", "projects", "contact"];

  // Pointer tracking for reactive parallax
  const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };

  window.addEventListener("pointermove", (e) => {
    mouse.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouse.targetY = -(e.clientY / window.innerHeight - 0.5) * 2;
  });

  function updateScrollState() {
    const scrollY = window.scrollY;
    const windowH = window.innerHeight;
    const docH = document.documentElement.scrollHeight - windowH;
    const scrollRatio = Math.max(0, Math.min(1, scrollY / (docH || 1)));

    // Continuous 3D rotation driven directly by scroll position!
    targetGroupRot.y = scrollY * 0.0028;
    targetGroupRot.x = Math.sin(scrollY * 0.001) * 0.35 + 0.1;
    targetGroupRot.z = scrollY * 0.0008;

    // Detect which section is currently centered
    let activeSec = "home";
    for (let i = 0; i < sectionsList.length; i++) {
      const el = document.getElementById(sectionsList[i]);
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= windowH * 0.5 && rect.bottom >= windowH * 0.2) {
          activeSec = sectionsList[i];
          break;
        }
      }
    }

    const wp = sectionWaypoints[activeSec] || sectionWaypoints.home;

    if (isMobile()) {
      targetCam.z = wp.camZ + 3;
      targetCam.y = wp.camY * 0.5;
      targetScale = wp.scale * 0.75;
    } else {
      targetCam.z = wp.camZ;
      targetCam.y = wp.camY;
      targetScale = wp.scale;
    }

    targetGroupRot.x += wp.tiltX;
  }

  window.addEventListener("scroll", updateScrollState, { passive: true });
  updateScrollState();

  // -------------------------------------------------------------
  // 9. ANIMATION LOOP (60 FPS)
  // -------------------------------------------------------------
  let clock = new THREE.Clock();
  let isVisible = true;

  document.addEventListener("visibilitychange", () => {
    isVisible = !document.hidden;
  });

  function animate() {
    requestAnimationFrame(animate);
    if (!isVisible) return;

    const delta = clock.getDelta();
    const elapsedTime = clock.getElapsedTime();

    // Lerp pointer parallax
    mouse.x += (mouse.targetX - mouse.x) * 0.05;
    mouse.y += (mouse.targetY - mouse.y) * 0.05;

    // Lerp group rotations & scale
    const lerpSpeed = prefersReducedMotion ? 0.03 : 0.06;
    currentGroupRot.x += (targetGroupRot.x - currentGroupRot.x) * lerpSpeed;
    currentGroupRot.y += (targetGroupRot.y - currentGroupRot.y) * lerpSpeed;
    currentGroupRot.z += (targetGroupRot.z - currentGroupRot.z) * lerpSpeed;

    currentScale += (targetScale - currentScale) * lerpSpeed;
    centralGroup.scale.set(currentScale, currentScale, currentScale);

    // Apply continuous rotation + mouse parallax to central group
    centralGroup.rotation.x = currentGroupRot.x + mouse.y * 0.25;
    centralGroup.rotation.y = currentGroupRot.y + (prefersReducedMotion ? 0 : elapsedTime * 0.12) + mouse.x * 0.35;
    centralGroup.rotation.z = currentGroupRot.z;

    // Camera lerp
    currentCam.y += (targetCam.y - currentCam.y) * lerpSpeed;
    currentCam.z += (targetCam.z - currentCam.z) * lerpSpeed;

    camera.position.set(
      mouse.x * 0.7,
      currentCam.y + mouse.y * 0.5,
      currentCam.z
    );
    camera.lookAt(0, 0, 0);

    // Quantum core animations
    if (!prefersReducedMotion) {
      // Counter-rotating rings
      ring1.rotation.z += 0.009;
      ring2.rotation.z -= 0.007;
      ring3.rotation.z += 0.005;

      // Pulse inner crystal
      const pulse = 1 + Math.sin(elapsedTime * 2.2) * 0.09;
      innerMesh.scale.set(pulse, pulse, pulse);
      innerMesh.rotation.y = -elapsedTime * 0.25;
      innerMesh.rotation.x = elapsedTime * 0.15;

      // Orbiting satellite nodes on rings
      orbitNodes.forEach((item) => {
        item.angle += item.speed;
        if (item.axis === 0) {
          item.mesh.position.x = Math.cos(item.angle) * item.radius;
          item.mesh.position.y = Math.sin(item.angle) * item.radius * 0.5;
          item.mesh.position.z = Math.sin(item.angle) * item.radius * 0.86;
        } else if (item.axis === 1) {
          item.mesh.position.x = Math.cos(item.angle) * item.radius * 0.75;
          item.mesh.position.y = Math.sin(item.angle) * item.radius;
          item.mesh.position.z = Math.cos(item.angle) * item.radius * 0.5;
        } else {
          item.mesh.position.x = Math.cos(item.angle) * item.radius;
          item.mesh.position.y = Math.sin(item.angle) * 0.6;
          item.mesh.position.z = Math.sin(item.angle) * item.radius;
        }
      });

      // Floating background satellites animation
      const scrollY = window.scrollY;
      satellites.forEach((sat) => {
        sat.mesh.rotation.x += sat.speedRot;
        sat.mesh.rotation.y += sat.speedRot * 1.3;
        // Float with sinusoidal drift + parallax from scroll
        const floatY = Math.sin(elapsedTime * 1.2 + sat.phase) * 0.6;
        const scrollOffset = (scrollY * 0.003) * (sat.baseZ < -5 ? 0.6 : 1.2);
        sat.mesh.position.y = sat.baseY + floatY - (scrollOffset % 15);
      });

      // Gentle starfield drift
      particleSystem.rotation.y = elapsedTime * 0.02 + mouse.x * 0.04;
      particleSystem.rotation.x = mouse.y * 0.03;
    }

    renderer.render(scene, camera);
  }

  animate();

  // -------------------------------------------------------------
  // 10. RESIZE & VIEWPORT HANDLER
  // -------------------------------------------------------------
  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    updateScrollState();
  });

  // -------------------------------------------------------------
  // 11. DYNAMIC THEME UPDATE HOOK
  // -------------------------------------------------------------
  window.updateThreeTheme = function (themeKey) {
    const t = themes[themeKey] || themes.dark;
    currentTheme = t;

    outerMat.color.setHex(t.coreWire);
    vertMat.color.setHex(t.nodes);
    innerMat.color.setHex(t.coreInner);
    ring1Mat.color.setHex(t.ring1);
    ring2Mat.color.setHex(t.ring2);
    ring3Mat.color.setHex(t.ring3);
    nodeMat.color.setHex(t.nodes);
    nodeMat.emissive.setHex(t.nodes);
    satelliteMat.color.setHex(t.satellites);
    particleMat.color.setHex(t.particles);
    pointLight1.color.setHex(t.light1);
    pointLight2.color.setHex(t.light2);

    scene.remove(gridHelper);
    gridHelper = new THREE.GridHelper(80, 50, t.coreWire, t.grid);
    gridHelper.position.y = -10;
    gridHelper.material.opacity = 0.28;
    gridHelper.material.transparent = true;
    scene.add(gridHelper);
  };
})();
