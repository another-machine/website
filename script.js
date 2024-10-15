import * as THREE from "three";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";
import { bezier } from "./easing.js";

const fontFile = "./mona-sans-expanded-black-regular.json";
const y1 = 0.7;
const y2 = -0.7;
const x1 = -0.525;
const x2 = 0.525;
const size = window.innerWidth * 0.04;

const charData = {
  a: { y: 0, x: 0 },
  n: { y: 0, x: 0 },
  o: { y: 0, x: 0 },
  t: { y: 0, x: 0 },
  h: { y: 0, x: 0 },
  e: { y: 0, x: 0 },
  r: { y: 0, x: 0 },
  m: { y: 0, x: 0 },
  c: { y: 0, x: 0 },
  i: { y: 0, x: 0 },
  "(": { y: -0.1, x: 0.1 },
  ")": { y: -0.1, x: 0 },
};

const meshes = {};

let camera, scene, renderer;
let groupText;

const positions = [
  {
    position: new THREE.Vector3(0, -240, 1200),
    lookAt: new THREE.Vector3(0, 0, 0),
  },
  {
    position: new THREE.Vector3(0, -90, 500),
    lookAt: new THREE.Vector3(0, 0, 0),
  },
];
positions.forEach((position) => {
  const randomPosition = () => ((Math.random() - 0.5) / 0.5) * 8;
  const randomRotation = () => Math.round(Math.random() * 4) * Math.PI * 2;
  const randomHex = () =>
    "#" + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0");
  position.characters = "a(nother)machine".split("").map(() => {
    const object = {
      position: [randomPosition(), randomPosition(), randomPosition()],
      rotation: [randomRotation(), randomRotation(), randomRotation()],
      color: new THREE.Color(randomHex()),
    };
    return object;
  });
  position.easing = bezier(
    Math.random(),
    Math.random(),
    Math.random(),
    Math.random()
  );
});

init();

async function init() {
  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    1,
    10000
  );

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.getElementById("canvas-container").appendChild(renderer.domElement);

  await setupFontAndText();

  setupLighting();

  window.addEventListener("resize", onWindowResize);
  window.addEventListener("scroll", onScroll);

  animate();

  onScroll();
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

function setupFontAndText() {
  return new Promise((resolve) => {
    const loader = new FontLoader();
    loader.load(fontFile, (font) => {
      createText(font);
      resolve();
    });
  });
}

function createText(font) {
  function generateCharacterMeshes({
    message,
    size,
    positionX = 0,
    positionY = 0,
    positionZ = 0,
  }) {
    let width = 0;
    let height = 0;
    const spacing = 0.1 * size;

    const characters = message.split("");

    const initialMeshes = characters.map((character, i) => {
      const geometry = new TextGeometry(character, {
        font: font,
        size: size,
        depth: size * 0.4,
        curveSegments: 32,
        bevelEnabled: true,
        bevelThickness: Math.ceil(size * 0.08),
        bevelSize: Math.ceil(size * 0.02),
        bevelOffset: 0,
        bevelSegments: Math.ceil(size * 0.1),
      });

      geometry.computeBoundingBox();
      const charWidth = geometry.boundingBox.max.x - geometry.boundingBox.min.x;
      const charHeight =
        geometry.boundingBox.max.y - geometry.boundingBox.min.y;
      width += charWidth;
      if (i > 0) {
        width += spacing;
      }
      height = Math.max(height, charHeight);

      const material = new THREE.MeshStandardMaterial({
        metalness: 0.3,
        roughness: 0.4,
        side: THREE.DoubleSide,
      });

      return new THREE.Mesh(geometry, material);
    });

    let x = width * -0.5;

    initialMeshes.forEach((mesh, i) => {
      const character = characters[i];
      const offsets = charData[character];

      const charWidth =
        mesh.geometry.boundingBox.max.x - mesh.geometry.boundingBox.min.x;
      mesh.position.set(
        offsets.x * size + x,
        positionY * size - height / 2,
        positionZ * size
      );

      meshes[mesh.uuid] = {
        mesh,
        position: { ...mesh.position },
      };

      x += charWidth + spacing;
    });

    return initialMeshes;
  }

  groupText = new THREE.Group();
  groupText.add(
    ...generateCharacterMeshes({
      message: "a(nother)",
      size,
      positionX: x1,
      positionY: y1,
    }),
    ...generateCharacterMeshes({
      message: "machine",
      size,
      positionX: x2,
      positionY: y2,
    })
  );
  scene.add(groupText);
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function setupLighting() {
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
  ambientLight.position.set(0, 0, size * 2);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(0, 0, size * 2);
  scene.add(directionalLight);
}

function onScroll() {
  const scrollY = window.scrollY;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const scrollFraction = scrollY / maxScroll;

  const easedScrollFraction = easeInOutCubic(scrollFraction);

  const index = Math.max(
    0,
    Math.floor(easedScrollFraction * (positions.length - 1))
  );
  const nextIndex = Math.min(positions.length - 1, index + 1);

  const currentRotation = new THREE.Vector3().lerpVectors(
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, Math.PI * 6, 0),
    easedScrollFraction
  );
  const currentPosition = new THREE.Vector3().lerpVectors(
    positions[index].position,
    positions[nextIndex].position,
    easedScrollFraction
  );
  const currentLookAt = new THREE.Vector3().lerpVectors(
    positions[index].lookAt,
    positions[nextIndex].lookAt,
    easedScrollFraction
  );
  const currentColors = positions[index].characters.map((character, i) =>
    new THREE.Color().lerpColors(
      character.color,
      positions[nextIndex].characters[i].color,
      easedScrollFraction
    )
  );

  // Apply the position, lookAt, and color
  camera.position.set(currentPosition.x, currentPosition.y, currentPosition.z);
  camera.lookAt(currentLookAt);
  groupText.rotation.set(
    currentRotation.x,
    currentRotation.y,
    currentRotation.z
  );
  groupText.children.forEach((child, i) => {
    const { position, rotation, color } = positions[index].characters[i];
    const rotationVector = new THREE.Vector3(...rotation);
    const currentRotation = new THREE.Vector3(0, 0, 0).lerp(
      rotationVector,
      easedScrollFraction
    );
    const positionVector = new THREE.Vector3(...position);
    const zeroVector = new THREE.Vector3(0, 0, 0);
    const vStart = easedScrollFraction < 0.5 ? zeroVector : positionVector;
    const vEnd = easedScrollFraction < 0.5 ? positionVector : zeroVector;
    const vControl1 = vStart
      .clone()
      .lerp(vEnd, 0.25)
      .add(new THREE.Vector3(0, 0.05 * size, -0.1 * size));
    const vControl2 = vStart
      .clone()
      .lerp(vEnd, 0.75)
      .add(new THREE.Vector3(0, -0.05 * size, 0.1 * size));
    const curve = new THREE.CubicBezierCurve3(
      vStart,
      vControl1,
      vControl2,
      vEnd
    );

    const [x, y, z] = curve.getPoint(
      easedScrollFraction >= 0.5
        ? (easedScrollFraction - 0.5) / 0.5
        : easedScrollFraction / 0.5
    );
    const data = meshes[child.uuid];
    child.position.set(
      data.position.x + x * size,
      data.position.y + y * size,
      data.position.z + z * size
    );
    child.rotation.set(currentRotation.x, currentRotation.y, currentRotation.z);
    child.material.color.copy(currentColors[i]);
  });
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
