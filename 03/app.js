import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Part 1: radius, tube radius, tubular segments, radial segments, p, q.
const TUBULAR = 96, RADIAL = 12;
const HOTPINK = 0xff69b4, GRASSGREEN = 0x7cfc00;
const geometry = new THREE.TorusKnotGeometry(7, 2, TUBULAR, RADIAL, 2, 3);
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x100f17);
const camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.1, 2000);
camera.position.set(0, 0, 110);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
document.querySelector('#stage').appendChild(renderer.domElement);
const controls = new OrbitControls(camera, renderer.domElement);
controls.minDistance = 10;
controls.maxDistance = 500;
controls.saveState();
scene.add(new THREE.AmbientLight(0xffffff, 1.5));
const key = new THREE.DirectionalLight(0xffffff, 3);
key.position.set(-30, 50, 60);
scene.add(key);
const rim = new THREE.DirectionalLight(0xc9d6ff, 2);
rim.position.set(40, -20, -30);
scene.add(rim);

const toruses = [];
let LASTOBJECT = null, SCALING = false, FLICKERING = false, WIREFRAME = false;
let lastY = 0;
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
// A camera-facing invisible plane through the orbit target keeps placement
// under the cursor even after the scene has been rotated or panned.
const placementPlane = new THREE.Plane();
const normal = new THREE.Vector3();
const status = document.querySelector('#status');

function updateStats() {
  const n = toruses.length, v = TUBULAR * RADIAL;
  document.querySelector('#stats').textContent = `${n} toruses · ${(n * v).toLocaleString()} vertices · ${(n * 3 * v).toLocaleString()} edges · ${(n * 2 * v).toLocaleString()} triangular faces (seams welded)`;
}

function setScale(torus, scale) {
  torus.scale.setScalar(scale);
  // At exactly zero, retain the previous color until the sign is known.
  if (scale !== 0) torus.material.color.set(scale < 0 ? GRASSGREEN : HOTPINK);
}

function addTorus(position, scale = 1) {
  // Each object needs its own material so opacity and color are independent.
  const material = new THREE.MeshStandardMaterial({
    color: HOTPINK, roughness: 0.3, metalness: 0.15,
    wireframe: WIREFRAME, transparent: FLICKERING,
  });
  const torus = new THREE.Mesh(geometry, material);
  torus.position.copy(position);
  setScale(torus, scale);
  scene.add(torus);
  toruses.push(torus);
  LASTOBJECT = torus;
  updateStats();
  return torus;
}

// OrbitControls listens to pointerdown before mousedown. Disable it in the
// capture phase so a Shift-click cannot also start a camera pan.
renderer.domElement.addEventListener('pointerdown', event => {
  if (event.shiftKey && event.button === 0) controls.enabled = false;
}, true);

renderer.domElement.onmousedown = event => {
  if (!event.shiftKey || event.button !== 0) return;
  controls.enabled = false;
  const rect = renderer.domElement.getBoundingClientRect();
  mouse.set((event.clientX - rect.left) / rect.width * 2 - 1,
    -(event.clientY - rect.top) / rect.height * 2 + 1);
  camera.updateMatrixWorld();
  camera.getWorldDirection(normal);
  placementPlane.setFromNormalAndCoplanarPoint(normal, controls.target);
  raycaster.setFromCamera(mouse, camera);
  const point = raycaster.ray.intersectPlane(placementPlane, new THREE.Vector3());
  if (!point) { finishScaling(); return; }
  addTorus(point);
  SCALING = true;
  lastY = event.clientY;
  status.textContent = 'Drag up to grow; drag down through zero to flip green.';
};

// Window listeners also handle dragging/releasing outside the canvas.
window.addEventListener('mousemove', event => {
  if (!SCALING || !LASTOBJECT) return;
  if (!(event.buttons & 1)) { finishScaling(); return; }
  const delta = (lastY - event.clientY) * 0.015;
  lastY = event.clientY;
  setScale(LASTOBJECT, LASTOBJECT.scale.x + delta);
});
function finishScaling() {
  SCALING = false;
  controls.enabled = true;
  status.textContent = 'Hold Shift and drag anywhere to add a torus.';
}
renderer.domElement.onmouseup = finishScaling;
window.addEventListener('mouseup', finishScaling);
window.addEventListener('pointercancel', finishScaling);
window.addEventListener('blur', finishScaling);

function toggleFlicker() {
  FLICKERING = !FLICKERING;
  for (const torus of toruses) {
    torus.material.transparent = FLICKERING;
    torus.material.opacity = 1;
    torus.material.needsUpdate = true;
  }
  document.querySelector('#flicker').setAttribute('aria-pressed', String(FLICKERING));
}
function toggleWireframe() {
  WIREFRAME = !WIREFRAME;
  for (const torus of toruses) torus.material.wireframe = WIREFRAME;
  document.querySelector('#wireframe').setAttribute('aria-pressed', String(WIREFRAME));
}
window.addEventListener('keydown', event => {
  if (event.repeat || event.ctrlKey || event.metaKey || event.altKey) return;
  if (event.key.toLowerCase() === 'f') toggleFlicker();
  if (event.key.toLowerCase() === 'w') toggleWireframe();
});
document.querySelector('#flicker').onclick = toggleFlicker;
document.querySelector('#wireframe').onclick = toggleWireframe;
function clearScene() {
  finishScaling();
  for (const torus of toruses) { scene.remove(torus); torus.material.dispose(); }
  toruses.length = 0;
  LASTOBJECT = null;
  updateStats();
}
document.querySelector('#clear').onclick = clearScene;
document.querySelector('#reset').onclick = () => { finishScaling(); controls.reset(); };
function compose() {
  clearScene();
  controls.reset();
  const centerX = innerWidth > 700 ? 12 : 0;
  for (let i = 0; i < 8; i++) {
    const angle = i * Math.PI / 4;
    const torus = addTorus(new THREE.Vector3(centerX + Math.cos(angle) * 18, Math.sin(angle) * 18 + 5, Math.sin(angle * 2) * 5), i % 2 ? -0.85 : 0.85);
    torus.rotation.set(Math.sin(angle) * 0.65, Math.cos(angle) * 0.65, angle);
  }
  addTorus(new THREE.Vector3(centerX, 5, 8), 1.2);
}
document.querySelector('#compose').onclick = compose;
document.querySelector('#capture').onclick = () => {
  renderer.render(scene, camera);
  renderer.domElement.toBlob(blob => {
    if (!blob) { status.textContent = 'Could not save the image. Please try again.'; return; }
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = WIREFRAME ? 'torusworld-wireframe.png' : 'torusworld.png';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    status.textContent = 'PNG saved. Geometry counts are shown above.';
  }, 'image/png');
};
window.addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
// Start with the single solid torus required in Part 2. The composition button
// offers an optional arrangement; Clear provides an empty canvas for drawing.
addTorus(new THREE.Vector3(10, 5, 0));
finishScaling();
function animate() {
  requestAnimationFrame(animate);
  if (FLICKERING) for (const torus of toruses) torus.material.opacity = Math.random();
  controls.update();
  renderer.render(scene, camera);
}
animate();
