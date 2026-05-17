import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { state } from "./state";

const $ = <T extends HTMLElement = HTMLElement>(id: string): T => {
  const el = document.getElementById(id);
  if (!el) throw new Error(`#${id} not found`);
  return el as T;
};

function makeTextSprite(text: string, color = "#ffffff"): THREE.Sprite {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = color;
  ctx.font = "bold 72px -apple-system, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, 128, 64);
  const tex = new THREE.CanvasTexture(canvas);
  tex.minFilter = THREE.LinearFilter;
  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false }),
  );
  sprite.scale.set(0.8, 0.4, 1);
  return sprite;
}

export function initScene() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0a12);

  // Cube with colored faces
  const cubeGeom = new THREE.BoxGeometry(1, 1, 1);
  const mats: THREE.Material[] = [
    new THREE.MeshBasicMaterial({ color: 0xf04d63 }),
    new THREE.MeshBasicMaterial({ color: 0x8a2837 }),
    new THREE.MeshBasicMaterial({ color: 0x4dd17a }),
    new THREE.MeshBasicMaterial({ color: 0x2a7448 }),
    new THREE.MeshBasicMaterial({ color: 0x5b8aff }),
    new THREE.MeshBasicMaterial({ color: 0x2e4d99 }),
  ];
  const cube = new THREE.Mesh(cubeGeom, mats);
  scene.add(cube);
  cube.add(
    new THREE.LineSegments(
      new THREE.EdgesGeometry(cubeGeom),
      new THREE.LineBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.7,
      }),
    ),
  );

  scene.add(new THREE.AxesHelper(3));
  scene.add(new THREE.GridHelper(10, 10, 0x2a2a3a, 0x1a1a25));

  const labelX = makeTextSprite("X", "#f04d63");
  labelX.position.set(3.3, 0, 0);
  scene.add(labelX);
  const labelY = makeTextSprite("Y", "#4dd17a");
  labelY.position.set(0, 3.3, 0);
  scene.add(labelY);
  const labelZ = makeTextSprite("Z", "#5b8aff");
  labelZ.position.set(0, 0, 3.3);
  scene.add(labelZ);

  const target = new THREE.Mesh(
    new THREE.SphereGeometry(0.1, 16, 16),
    new THREE.MeshBasicMaterial({ color: 0xffd34d }),
  );
  scene.add(target);

  const sightGeom = new THREE.BufferGeometry();
  sightGeom.setAttribute(
    "position",
    new THREE.BufferAttribute(new Float32Array(6), 3),
  );
  const sightLine = new THREE.Line(
    sightGeom,
    new THREE.LineBasicMaterial({
      color: 0xffd34d,
      transparent: true,
      opacity: 0.6,
    }),
  );
  scene.add(sightLine);

  const camIcon = new THREE.Mesh(
    new THREE.ConeGeometry(0.15, 0.3, 4),
    new THREE.MeshBasicMaterial({ color: 0xffd34d }),
  );
  scene.add(camIcon);

  // ----- the camera  -----
  const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 100);
  const cameraHelper = new THREE.CameraHelper(camera);
  scene.add(cameraHelper);

  // ----- renderers -----
  const mainView = $("main-view");
  const mainRenderer = new THREE.WebGLRenderer({ antialias: true });
  mainRenderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  mainView.appendChild(mainRenderer.domElement);

  const sceneView = $("scene-view");
  const sceneRenderer = new THREE.WebGLRenderer({ antialias: true });
  sceneRenderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  sceneView.appendChild(sceneRenderer.domElement);

  const orbitCamera = new THREE.PerspectiveCamera(45, 1, 0.1, 200);
  orbitCamera.position.set(9, 7, 11);
  orbitCamera.lookAt(0, 0, 0);
  const orbit = new OrbitControls(orbitCamera, sceneRenderer.domElement);
  orbit.target.set(0, 0, 0);
  orbit.enableDamping = true;

  function resize() {
    const m = mainView.getBoundingClientRect();
    if (m.width > 0 && m.height > 0) {
      mainRenderer.setSize(m.width, m.height, false);
      camera.aspect = m.width / m.height;
      camera.updateProjectionMatrix();
    }
    const s = sceneView.getBoundingClientRect();
    if (s.width > 0 && s.height > 0) {
      sceneRenderer.setSize(s.width, s.height, false);
      orbitCamera.aspect = s.width / s.height;
      orbitCamera.updateProjectionMatrix();
    }
  }
  let resizeQueued = false;
  function queueResize() {
    if (resizeQueued) return;
    resizeQueued = true;
    requestAnimationFrame(() => {
      resizeQueued = false;
      resize();
    });
  }
  window.addEventListener("resize", queueResize);
  new ResizeObserver(queueResize).observe(mainView);
  new ResizeObserver(queueResize).observe(sceneView);
  resize();

  const sightArr = sightLine.geometry.attributes.position!
    .array as Float32Array;

  function tick() {
    requestAnimationFrame(tick);

    cube.position.set(state.pos.x, state.pos.y, state.pos.z);
    cube.rotation.set(state.rot.x, state.rot.y, state.rot.z);
    cube.scale.set(state.scale.x, state.scale.y, state.scale.z);

    camera.position.set(state.cam.x, state.cam.y, state.cam.z);
    camera.fov = state.fov;
    camera.lookAt(state.lookAt.x, state.lookAt.y, state.lookAt.z);
    camera.updateProjectionMatrix();
    cameraHelper.update();

    target.position.set(state.lookAt.x, state.lookAt.y, state.lookAt.z);
    camIcon.position.set(state.cam.x, state.cam.y, state.cam.z);
    camIcon.lookAt(state.lookAt.x, state.lookAt.y, state.lookAt.z);
    camIcon.rotateX(Math.PI / 2);

    sightArr[0] = state.cam.x;
    sightArr[1] = state.cam.y;
    sightArr[2] = state.cam.z;
    sightArr[3] = state.lookAt.x;
    sightArr[4] = state.lookAt.y;
    sightArr[5] = state.lookAt.z;
    sightLine.geometry.attributes.position!.needsUpdate = true;

    cameraHelper.visible = false;
    target.visible = false;
    sightLine.visible = false;
    camIcon.visible = false;
    mainRenderer.render(scene, camera);

    cameraHelper.visible = true;
    target.visible = true;
    sightLine.visible = true;
    camIcon.visible = true;
    orbit.update();
    sceneRenderer.render(scene, orbitCamera);
  }
  tick();
}
