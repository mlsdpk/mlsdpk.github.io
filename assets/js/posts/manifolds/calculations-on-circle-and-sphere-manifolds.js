// TODO:
// 1) add riemannian mean
// 2) add buttons to add new points randomly (w/ reset button)
// 3) another example that finds geodesic distance between points
// 4) extend it into S2

const cfg = {
  circle: {
    // --- ring style ---
    color: 0x000000, // hex color
    thickness: 1 // lineWidth (WebGL support varies)
  },
  radial: {
    color: 0x000000,
    linewidth: 0.005,
    dashed: true,
    dashScale: 1,
    dashSize: 0.05,
    gapSize: 0.025
  },
  points: {
    // --- spheres ---
    radius: 0.04, // sphere radius
    p1Color: 0x000000,
    p2Color: 0x000000,
    p3Color: 0x000000,
    euclideanColor: 0x1694ec,
    projectedColor: 0xec2616,
    riemannianColor: 0x16ec77
  }
};

import * as THREE from 'three';
import { Line2 } from 'three/addons/lines/Line2.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';

import HypersphereModuleInit from '/assets/wasm/posts/manifolds/hypersphere.js';

/* wait for WASM to initialise */
const Hypersphere = await HypersphereModuleInit();

/*** wrap the C functions ***/
const __cpp_project_point = Hypersphere.cwrap('apply_projection_2d', null, [
  'number',
  'number'
]);

const __cpp_euclidean_mean = Hypersphere.cwrap(
  'compute_euclidean_mean_2d',
  null,
  ['number', 'number', 'number']
);

/*** Allocate memory buffers once (inside WASM memory) ***/
const ptr = {
  in1: Hypersphere._malloc(2 * 8), // 2 doubles  (used for project_point)
  arr: Hypersphere._malloc(6 * 8), // 6 doubles  (three points for euclidean_mean)
  out: Hypersphere._malloc(2 * 8) // 2 doubles  (shared output)
};
const view = new Float64Array(Hypersphere.HEAPF64.buffer); // single typed-array

window.addEventListener('unload', () => {
  Hypersphere._free(ptr.in1);
  Hypersphere._free(ptr.arr);
  Hypersphere._free(ptr.out);
});

function project_point(v) {
  view.set([v.x, v.y], ptr.in1 / 8);
  __cpp_project_point(ptr.in1, ptr.out); // call c++ function
  return new THREE.Vector2(view[ptr.out / 8], view[ptr.out / 8 + 1]);
}

function euclidean_mean(a, b, c) {
  view.set([a.x, a.y, b.x, b.y, c.x, c.y], ptr.arr / 8);
  __cpp_euclidean_mean(ptr.arr, 3, ptr.out); // call c++ function
  return new THREE.Vector2(view[ptr.out / 8], view[ptr.out / 8 + 1]);
}

let scene, camera, renderer, container;
let canvas;
const radius = 1.0;

function init() {
  container = document.getElementById('circle-vis');
  const { clientWidth: width, clientHeight: height } = container;

  scene = new THREE.Scene();

  // orthographic camera so spheres keep constant size
  const view = 1.5;
  const aspect = width / height;
  camera = new THREE.OrthographicCamera(
    -view * aspect,
    view * aspect,
    view,
    -view,
    0.1,
    10
  );
  camera.position.set(0, 0, 5);

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(width, height);
  container.appendChild(renderer.domElement);
  canvas = renderer.domElement;

  /***** unit circle *****/
  const circlePts = Array.from({ length: 128 }, (_, i) => {
    const t = (i / 128) * Math.PI * 2;
    return new THREE.Vector3(Math.cos(t) * radius, Math.sin(t) * radius, 0);
  });
  const circleGeom = new THREE.BufferGeometry().setFromPoints(circlePts);
  circleGeom.setIndex([...Array(128).keys()]);
  const circleMat = new THREE.LineBasicMaterial({
    color: cfg.circle.color,
    linewidth: cfg.circle.thickness
  });
  const circle = new THREE.LineLoop(circleGeom, circleMat);
  scene.add(circle);

  /***** radial line *****/
  const lineGeo = new LineGeometry();
  lineGeo.setPositions([0, 0, 0, 1, 0, 0]);

  const lineMat = new LineMaterial({
    color: cfg.radial.color,
    linewidth: cfg.radial.linewidth,
    dashed: cfg.radial.dashed,
    dashScale: cfg.radial.dashScale,
    dashSize: cfg.radial.dashSize,
    gapSize: cfg.radial.gapSize
  });

  const line = new Line2(lineGeo, lineMat);
  line.computeLineDistances();
  scene.add(line);

  /***** draggable spheres *****/
  const ptGeom = new THREE.SphereGeometry(cfg.points.radius, 16, 16);
  const p1 = new THREE.Mesh(
    ptGeom,
    new THREE.MeshBasicMaterial({ color: cfg.points.p1Color })
  );
  const p2 = new THREE.Mesh(
    ptGeom,
    new THREE.MeshBasicMaterial({ color: cfg.points.p2Color })
  );
  const p3 = new THREE.Mesh(
    ptGeom,
    new THREE.MeshBasicMaterial({ color: cfg.points.p3Color })
  );
  p1.position.set(radius, 0, 0);
  p2.position.set(-radius, 0, 0);
  p3.position.set(-radius, 0, 0);
  scene.add(p1, p2, p3);

  /***** mean spheres *****/
  const euclideanMean = new THREE.Mesh(
    ptGeom.clone(),
    new THREE.MeshBasicMaterial({ color: cfg.points.euclideanColor })
  );
  const projectedMean = new THREE.Mesh(
    ptGeom.clone(),
    new THREE.MeshBasicMaterial({ color: cfg.points.projectedColor })
  );
  const riemannianMean = new THREE.Mesh(
    ptGeom.clone(),
    new THREE.MeshBasicMaterial({ color: cfg.points.riemannianColor })
  );
  scene.add(euclideanMean, projectedMean);

  /***** interaction helpers *****/
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let dragging = null;

  function setPointer(e) {
    const rect = canvas.getBoundingClientRect();
    pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  }

  function onDown(e) {
    setPointer(e);
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects([p1, p2, p3]);
    if (hits.length) {
      dragging = hits[0].object;
      canvas.setPointerCapture(e.pointerId);
      e.preventDefault();
    }
  }
  function onMove(e) {
    if (!dragging) return;
    setPointer(e);
    raycaster.setFromCamera(pointer, camera);
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const hit = new THREE.Vector3();
    raycaster.ray.intersectPlane(plane, hit);
    if (hit.lengthSq() > 0) {
      hit.setLength(radius);
      dragging.position.copy(hit);
    }
  }
  function onUp(e) {
    if (dragging) {
      canvas.releasePointerCapture(e.pointerId);
      dragging = null;
    }
  }

  canvas.addEventListener('pointerdown', onDown);
  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerup', onUp);

  /***** responsive *****/
  window.addEventListener('resize', () => {
    const { clientWidth: w, clientHeight: h } = container;
    const asp = w / h;
    camera.left = -view * asp;
    camera.right = view * asp;
    camera.top = view;
    camera.bottom = -view;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });

  /***** update means each frame *****/
  scene.userData.updateMeans = () => {
    // compute Euclidean Mean
    const euc = euclidean_mean(p1.position, p2.position, p3.position);

    // project this estimated mean onto S¹
    const proj = project_point(euc);

    euclideanMean.position.set(euc.x, euc.y, 0);
    projectedMean.position.set(proj.x, proj.y, 0);

    // update radial line
    line.geometry.setPositions([0, 0, 0, proj.x, proj.y, 0]);
    line.computeLineDistances();
  };
}

function animate() {
  requestAnimationFrame(animate);
  scene.userData.updateMeans();
  renderer.render(scene, camera);
}

init();
animate();
