import * as THREE from 'three';

export function initThreeScene() {
  const canvas = document.getElementById('three-canvas');
  if (!canvas) return;

  // --- Scene Setup ---
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 30;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // --- Mouse tracking ---
  const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };

  document.addEventListener('mousemove', (e) => {
    mouse.targetX = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
  });

  // --- Procedural Fluffy Cloud Texture ---
  function createCloudTexture() {
    const cloudCanvas = document.createElement('canvas');
    cloudCanvas.width = 256;
    cloudCanvas.height = 128;
    const ctx = cloudCanvas.getContext('2d');

    ctx.fillStyle = '#ffffff';
    // Draw 3-puff Mario cloud shape
    ctx.beginPath();
    ctx.arc(75, 75, 40, 0, Math.PI * 2);
    ctx.arc(128, 50, 52, 0, Math.PI * 2);
    ctx.arc(181, 75, 40, 0, Math.PI * 2);
    ctx.fill();

    return new THREE.CanvasTexture(cloudCanvas);
  }

  const cloudTexture = createCloudTexture();
  const cloudMaterial = new THREE.MeshBasicMaterial({
    map: cloudTexture,
    transparent: true,
    opacity: 0.35,
    depthWrite: false,
  });

  // --- Floating Cloud Meshes ---
  const cloudCount = 10;
  const clouds = [];

  for (let i = 0; i < cloudCount; i++) {
    const scale = 1.2 + Math.random() * 1.5;
    const geometry = new THREE.PlaneGeometry(12 * scale, 6 * scale);
    const mesh = new THREE.Mesh(geometry, cloudMaterial.clone());

    const posX = (Math.random() - 0.5) * 70;
    const posY = (Math.random() - 0.5) * 45;
    const posZ = (Math.random() - 0.5) * 25 - 5;

    mesh.position.set(posX, posY, posZ);
    mesh.material.opacity = 0.2 + Math.random() * 0.25;

    mesh.userData = {
      speed: 0.015 + Math.random() * 0.02,
      baseY: posY,
      offset: Math.random() * Math.PI * 2,
    };

    scene.add(mesh);
    clouds.push(mesh);
  }

  // --- Scroll tracking ---
  let scrollY = 0;
  window.addEventListener('scroll', () => {
    scrollY = window.scrollY;
  });

  // --- Animation Loop ---
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);

    const elapsedTime = clock.getElapsedTime();

    // Smooth mouse parallax
    mouse.x += (mouse.targetX - mouse.x) * 0.03;
    mouse.y += (mouse.targetY - mouse.y) * 0.03;

    // Animate Clouds: Horizontal drift + soft floating bob
    clouds.forEach((cloud) => {
      cloud.position.x += cloud.userData.speed;
      if (cloud.position.x > 40) {
        cloud.position.x = -40; // Loop seamlessly
      }
      cloud.position.y = cloud.userData.baseY + Math.sin(elapsedTime * 0.4 + cloud.userData.offset) * 0.6;
    });

    // Scroll parallax
    const scrollFactor = scrollY * 0.0006;
    camera.position.y = -scrollFactor * 3.5;

    renderer.render(scene, camera);
  }

  animate();

  // --- Resize Handler ---
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  });
}



