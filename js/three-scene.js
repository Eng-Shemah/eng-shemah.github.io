/**
 * Three.js 3D WebGL Futuristic Environment & Scroll Choreography
 * Creates an interactive Cyber Core, orbiting data rings, particle fields,
 * and camera path driven by section scroll positions.
 */
(() => {
  // Check if THREE is available
  if (typeof THREE === "undefined") {
    console.warn("Three.js not loaded. WebGL background disabled.");
    return;
  }

  const canvas = document.getElementById("webgl-canvas");
  if (!canvas) return;

  // Reduced motion preference
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Scene, Camera, Renderer
  const scene = new THREE.Scene();
  const fov = 55;
  const camera = new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 0, 12);

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
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));

  // Theme Colors
  const themes = {
    dark: {
      coreWire: 0x00f2fe,
      coreInner: 0x7928ca,
      ring1: 0x00f2fe,
      ring2: 0x9061f9,
      nodes: 0x38bdf8,
      particles: 0x818cf8,
      light1: 0x00f2fe,
      light2: 0x8b5cf6,
      grid: 0x1e1b4b,
      fog: 0x060a17
    },
    light: {
      coreWire: 0x4f46e5,
      coreInner: 0x06b6d4,
      ring1: 0x4f46e5,
      ring2: 0x0284c7,
      nodes: 0x6366f1,
      particles: 0x4f46e5,
      light1: 0x6366f1,
      light2: 0x0ea5e9,
      grid: 0xc7d2fe,
      fog: 0xf4f6fb
    }
  };

  const getActiveThemeKey = () => {
    return document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
  };

  let currentTheme = themes[getActiveThemeKey()];

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambientLight);

  const pointLight1 = new THREE.PointLight(currentTheme.light1, 2.5, 30);
  pointLight1.position.set(5, 5, 5);
  scene.add(pointLight1);

  const pointLight2 = new THREE.PointLight(currentTheme.light2, 2.5, 30);
  pointLight2.position.set(-5, -5, 3);
  scene.add(pointLight2);

  // -------------------------------------------------------------
  // 1. CYBER CORE GROUP
  // -------------------------------------------------------------
  const cyberGroup = new THREE.Group();
  scene.add(cyberGroup);

  // Outer Wireframe Polyhedron
  const outerGeo = new THREE.IcosahedronGeometry(3.0, 1);
  const outerMat = new THREE.MeshStandardMaterial({
    color: currentTheme.coreWire,
    wireframe: true,
    transparent: true,
    opacity: 0.65,
    roughness: 0.2,
    metalness: 0.8
  });
  const outerMesh = new THREE.Mesh(outerGeo, outerMat);
  cyberGroup.add(outerMesh);

  // Glowing Points on Vertices
  const vertMat = new THREE.PointsMaterial({
    color: currentTheme.nodes,
    size: 0.14,
    transparent: true,
    opacity: 0.95
  });
  const vertPoints = new THREE.Points(outerGeo, vertMat);
  cyberGroup.add(vertPoints);

  // Inner Quantum Core
  const innerGeo = new THREE.OctahedronGeometry(1.6, 2);
  const innerMat = new THREE.MeshStandardMaterial({
    color: currentTheme.coreInner,
    wireframe: false,
    transparent: true,
    opacity: 0.55,
    roughness: 0.1,
    metalness: 0.9
  });
  const innerMesh = new THREE.Mesh(innerGeo, innerMat);
  cyberGroup.add(innerMesh);

  // Orbital Rings
  const ring1Geo = new THREE.TorusGeometry(4.8, 0.035, 16, 90);
  const ring1Mat = new THREE.MeshBasicMaterial({
    color: currentTheme.ring1,
    transparent: true,
    opacity: 0.75
  });
  const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
  ring1.rotation.x = Math.PI / 3;
  cyberGroup.add(ring1);

  const ring2Geo = new THREE.TorusGeometry(5.8, 0.025, 16, 100);
  const ring2Mat = new THREE.MeshBasicMaterial({
    color: currentTheme.ring2,
    transparent: true,
    opacity: 0.65
  });
  const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
  ring2.rotation.y = Math.PI / 4;
  ring2.rotation.x = -Math.PI / 6;
  cyberGroup.add(ring2);

  // Orbiting Satellite Nodes
  const orbitNodesCount = 8;
  const orbitNodes = [];
  const nodeGeo = new THREE.SphereGeometry(0.12, 12, 12);
  const nodeMat = new THREE.MeshStandardMaterial({
    color: currentTheme.nodes,
    emissive: currentTheme.nodes,
    emissiveIntensity: 0.8,
    roughness: 0.1
  });

  for (let i = 0; i < orbitNodesCount; i++) {
    const node = new THREE.Mesh(nodeGeo, nodeMat);
    cyberGroup.add(node);
    orbitNodes.push({
      mesh: node,
      radius: i % 2 === 0 ? 4.8 : 5.8,
      speed: (i % 2 === 0 ? 0.015 : -0.012) * (1 + (i % 3) * 0.2),
      angle: (i / orbitNodesCount) * Math.PI * 2,
      axis: i % 2 === 0 ? 1 : 2
    });
  }

  // -------------------------------------------------------------
  // 2. PARTICLES STARFIELD & CYBER DUST
  // -------------------------------------------------------------
  const particleCount = 1400;
  const particleGeo = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const originalPositions = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount * 3; i += 3) {
    const x = (Math.random() - 0.5) * 45;
    const y = (Math.random() - 0.5) * 45;
    const z = (Math.random() - 0.5) * 35;

    positions[i] = x;
    positions[i + 1] = y;
    positions[i + 2] = z;

    originalPositions[i] = x;
    originalPositions[i + 1] = y;
    originalPositions[i + 2] = z;
  }

  particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  const particleMat = new THREE.PointsMaterial({
    color: currentTheme.particles,
    size: 0.09,
    transparent: true,
    opacity: 0.75
  });

  const particleSystem = new THREE.Points(particleGeo, particleMat);
  scene.add(particleSystem);

  // -------------------------------------------------------------
  // 3. CYBER GRID (Lower Floor Horizon)
  // -------------------------------------------------------------
  const gridHelper = new THREE.GridHelper(60, 40, currentTheme.coreWire, currentTheme.grid);
  gridHelper.position.y = -9;
  gridHelper.material.opacity = 0.22;
  gridHelper.material.transparent = true;
  scene.add(gridHelper);

  // -------------------------------------------------------------
  // 4. SCROLL INTERPOLATION & TARGETS
  // -------------------------------------------------------------
  // Target states for cyberGroup and camera per section
  const sectionStates = {
    home: {
      groupPos: { x: 2.2, y: 0.3, z: 0.5 },
      groupRot: { x: 0.1, y: 0.2, z: 0 },
      scale: 1.0,
      camPos: { x: 0, y: 0, z: 11.5 }
    },
    about: {
      groupPos: { x: -3.2, y: -0.4, z: 1.2 },
      groupRot: { x: 0.3, y: -0.6, z: 0.2 },
      scale: 1.15,
      camPos: { x: 0, y: -0.5, z: 12 }
    },
    skills: {
      groupPos: { x: 0, y: 0.6, z: 2.8 },
      groupRot: { x: -0.2, y: 1.2, z: -0.1 },
      scale: 1.3,
      camPos: { x: 0, y: 0, z: 13 }
    },
    experience: {
      groupPos: { x: 3.4, y: -0.2, z: 1.0 },
      groupRot: { x: 0.4, y: -0.8, z: 0.3 },
      scale: 1.1,
      camPos: { x: 0, y: -0.2, z: 12 }
    },
    education: {
      groupPos: { x: -3.0, y: 0.4, z: 0.8 },
      groupRot: { x: -0.3, y: 0.5, z: -0.2 },
      scale: 1.05,
      camPos: { x: 0, y: 0, z: 12 }
    },
    projects: {
      groupPos: { x: 0, y: -0.8, z: 0.5 },
      groupRot: { x: 0.6, y: 1.8, z: 0.1 },
      scale: 1.2,
      camPos: { x: 0, y: -0.4, z: 13.5 }
    },
    contact: {
      groupPos: { x: 0, y: -1.2, z: 3.2 },
      groupRot: { x: 0.1, y: 2.4, z: 0 },
      scale: 1.35,
      camPos: { x: 0, y: -0.6, z: 12.5 }
    }
  };

  // Adjust coordinates if on mobile / narrow screen
  const isMobile = () => window.innerWidth < 768;

  const currentCam = { x: 0, y: 0, z: 11.5 };
  const targetCam = { x: 0, y: 0, z: 11.5 };

  const currentGroupPos = { x: 2.2, y: 0.3, z: 0.5 };
  const targetGroupPos = { x: 2.2, y: 0.3, z: 0.5 };

  const currentGroupRot = { x: 0, y: 0, z: 0 };
  const targetGroupRot = { x: 0, y: 0, z: 0 };

  let currentScale = 1.0;
  let targetScale = 1.0;

  // Pointer tracking for reactive parallax
  const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };

  window.addEventListener("pointermove", (e) => {
    mouse.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouse.targetY = -(e.clientY / window.innerHeight - 0.5) * 2;
  });

  // Calculate current target based on scroll position across sections
  const sections = ["home", "about", "skills", "experience", "education", "projects", "contact"];

  function updateScrollTargets() {
    const scrollY = window.scrollY;
    const windowH = window.innerHeight;
    const docH = document.documentElement.scrollHeight - windowH;
    const scrollRatio = Math.max(0, Math.min(1, scrollY / (docH || 1)));

    // Find active section or calculate blend
    let activeSec = "home";
    for (let i = 0; i < sections.length; i++) {
      const el = document.getElementById(sections[i]);
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= windowH * 0.45 && rect.bottom >= windowH * 0.2) {
          activeSec = sections[i];
          break;
        }
      }
    }

    const state = sectionStates[activeSec] || sectionStates.home;

    if (isMobile()) {
      // Mobile: center the core slightly behind the cards with smaller scale
      targetGroupPos.x = 0;
      targetGroupPos.y = state.groupPos.y * 0.5;
      targetGroupPos.z = Math.min(state.groupPos.z, 0.5);
      targetScale = state.scale * 0.65;
    } else {
      targetGroupPos.x = state.groupPos.x;
      targetGroupPos.y = state.groupPos.y;
      targetGroupPos.z = state.groupPos.z;
      targetScale = state.scale;
    }

    targetGroupRot.x = state.groupRot.x;
    targetGroupRot.y = state.groupRot.y + scrollRatio * Math.PI * 2;
    targetGroupRot.z = state.groupRot.z;

    targetCam.x = state.camPos.x;
    targetCam.y = state.camPos.y;
    targetCam.z = state.camPos.z;
  }

  window.addEventListener("scroll", updateScrollTargets, { passive: true });
  updateScrollTargets();

  // -------------------------------------------------------------
  // 5. ANIMATION LOOP
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

    // Smooth lerp pointer
    mouse.x += (mouse.targetX - mouse.x) * 0.05;
    mouse.y += (mouse.targetY - mouse.y) * 0.05;

    // Smooth lerp positions & camera
    const lerpSpeed = prefersReducedMotion ? 0.03 : 0.055;
    currentGroupPos.x += (targetGroupPos.x - currentGroupPos.x) * lerpSpeed;
    currentGroupPos.y += (targetGroupPos.y - currentGroupPos.y) * lerpSpeed;
    currentGroupPos.z += (targetGroupPos.z - currentGroupPos.z) * lerpSpeed;

    cyberGroup.position.set(
      currentGroupPos.x + mouse.x * 0.4,
      currentGroupPos.y + mouse.y * 0.3,
      currentGroupPos.z
    );

    currentGroupRot.x += (targetGroupRot.x - currentGroupRot.x) * lerpSpeed;
    currentGroupRot.y += (targetGroupRot.y - currentGroupRot.y) * lerpSpeed;
    currentGroupRot.z += (targetGroupRot.z - currentGroupRot.z) * lerpSpeed;

    currentScale += (targetScale - currentScale) * lerpSpeed;
    cyberGroup.scale.set(currentScale, currentScale, currentScale);

    currentCam.x += (targetCam.x - currentCam.x) * lerpSpeed;
    currentCam.y += (targetCam.y - currentCam.y) * lerpSpeed;
    currentCam.z += (targetCam.z - currentCam.z) * lerpSpeed;

    camera.position.set(
      currentCam.x + mouse.x * 0.6,
      currentCam.y + mouse.y * 0.4,
      currentCam.z
    );
    camera.lookAt(0, 0, 0);

    // Continuous 3D rotation & quantum pulse
    if (!prefersReducedMotion) {
      outerMesh.rotation.x = currentGroupRot.x + elapsedTime * 0.15;
      outerMesh.rotation.y = currentGroupRot.y + elapsedTime * 0.2;
      vertPoints.rotation.x = outerMesh.rotation.x;
      vertPoints.rotation.y = outerMesh.rotation.y;

      innerMesh.rotation.x = -elapsedTime * 0.3;
      innerMesh.rotation.y = -elapsedTime * 0.25;

      ring1.rotation.z += 0.008;
      ring2.rotation.z -= 0.006;

      // Pulse inner core
      const pulse = 1 + Math.sin(elapsedTime * 2.5) * 0.08;
      innerMesh.scale.set(pulse, pulse, pulse);

      // Orbiting data nodes
      orbitNodes.forEach((item) => {
        item.angle += item.speed;
        if (item.axis === 1) {
          item.mesh.position.x = Math.cos(item.angle) * item.radius;
          item.mesh.position.y = Math.sin(item.angle) * item.radius * 0.5;
          item.mesh.position.z = Math.sin(item.angle) * item.radius * 0.86;
        } else {
          item.mesh.position.x = Math.cos(item.angle) * item.radius * 0.8;
          item.mesh.position.y = Math.sin(item.angle) * item.radius;
          item.mesh.position.z = Math.cos(item.angle) * item.radius * 0.4;
        }
      });

      // Subtle particle drift
      particleSystem.rotation.y = elapsedTime * 0.02 + mouse.x * 0.05;
      particleSystem.rotation.x = mouse.y * 0.04;
    }

    renderer.render(scene, camera);
  }

  animate();

  // -------------------------------------------------------------
  // 6. RESIZE HANDLER
  // -------------------------------------------------------------
  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
    updateScrollTargets();
  });

  // -------------------------------------------------------------
  // 7. DYNAMIC THEME SYNCHRONIZATION
  // -------------------------------------------------------------
  window.updateThreeTheme = function (themeKey) {
    const t = themes[themeKey] || themes.dark;
    currentTheme = t;

    outerMat.color.setHex(t.coreWire);
    vertMat.color.setHex(t.nodes);
    innerMat.color.setHex(t.coreInner);
    ring1Mat.color.setHex(t.ring1);
    ring2Mat.color.setHex(t.ring2);
    nodeMat.color.setHex(t.nodes);
    nodeMat.emissive.setHex(t.nodes);
    particleMat.color.setHex(t.particles);
    pointLight1.color.setHex(t.light1);
    pointLight2.color.setHex(t.light2);

    // Update grid helper colors
    scene.remove(gridHelper);
    const newGrid = new THREE.GridHelper(60, 40, t.coreWire, t.grid);
    newGrid.position.y = -9;
    newGrid.material.opacity = 0.22;
    newGrid.material.transparent = true;
    scene.add(newGrid);
  };
})();
