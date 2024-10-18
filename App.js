import * as THREE from "three";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";

import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { bezier } from "./easing.js";

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
  "(": { y: -0.05, x: 0.05 },
  ")": { y: -0.05, x: 0 },
};

export class App {
  constructor() {
    this.setupScene();
    this.setupDOM();
  }

  setupScene() {
    this.size = window.innerWidth * 0.04;
    this.meshes = {};
    this.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      1,
      10000
    );

    this.scene = new THREE.Scene();
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.composer = new EffectComposer(this.renderer);
    this.renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(this.renderPass);

    this.groupText = new THREE.Group();
    this.scene.add(this.groupText);

    this.scene.background = new THREE.Color(0x333333);

    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.shaderUniforms = {
      time: { value: 0 },
    };

    this.positions = App.generatePositions("a(nother)machine");
  }

  setupDOM() {
    document
      .getElementById("canvas-container")
      .appendChild(this.renderer.domElement);
    window.addEventListener("resize", this.onWindowResize.bind(this));
    window.addEventListener("scroll", this.onScroll.bind(this));
  }

  async initialize() {
    const font = await this.setupFont(
      "./mona-sans-expanded-black-regular.json"
    );
    const texture = await this.setupTexture("./texture.png");
    this.shaderUniforms.noiseTexture = { value: texture };

    [
      {
        message: "a(nother)",
        x: -0.525,
        y: 0.7,
      },
      {
        message: "machine",
        x: 0.525,
        y: -0.7,
      },
    ].forEach(({ message, x, y }) => {
      this.groupText.add(
        ...this.generateCharacterMeshes({
          font,
          size: this.size,
          message,
          positionX: x,
          positionY: y,
        })
      );
    });
    this.setupLighting();
    this.animate();
    this.onScroll();
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));
    // this.shaderUniforms.time.value = performance.now() / 1000;
    this.shaderUniforms.time.value += 0.01; // Increment time

    this.composer.render();
  }

  generateCharacterMeshes({
    font,
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
        // depth: size * 0.4,
        depth: size * 0,
        curveSegments: 12,
        // bevelEnabled: true,
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

      // const material = new THREE.MeshStandardMaterial({
      //   metalness: 0.4,
      //   roughness: 0.7,
      //   side: THREE.DoubleSide,
      //   wireframe: false,
      // });

      const mesh = new THREE.Mesh(
        geometry,
        ShaderMaterials.noiseShaderMaterial(this.shaderUniforms)
      );

      return mesh;
    });

    let x = width * -0.5;

    initialMeshes.forEach((mesh, i) => {
      const character = characters[i];
      const offsets = charData[character];

      const charWidth =
        mesh.geometry.boundingBox.max.x - mesh.geometry.boundingBox.min.x;
      mesh.position.set(
        offsets.x * size + x,
        offsets.y * size + positionY * size - height / 2,
        positionZ * size
      );

      this.meshes[mesh.uuid] = {
        mesh,
        position: { ...mesh.position },
      };

      x += charWidth + spacing;
    });

    return initialMeshes;
  }

  setupFont(filePath) {
    return new Promise((resolve) => {
      new FontLoader().load(filePath, resolve);
    });
  }

  setupTexture(filePath) {
    return new Promise((resolve) => {
      new THREE.TextureLoader().load(filePath, resolve);
    });
  }

  setupLighting() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    ambientLight.position.set(0, 0, this.size * 2);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(0, 0, this.size * 2);
    this.scene.add(directionalLight);
  }

  onScroll() {
    const scrollY = window.scrollY;
    const maxScroll =
      document.documentElement.scrollHeight - window.innerHeight;
    const scrollFraction = scrollY / maxScroll;
    const easedScrollFraction = Easing.inOutCubic(scrollFraction);

    const index = Math.max(
      0,
      Math.floor(easedScrollFraction * (this.positions.length - 1))
    );
    const nextIndex = Math.min(this.positions.length - 1, index + 1);

    const currentRotation = new THREE.Vector3().lerpVectors(
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, Math.PI * 6, 0),
      easedScrollFraction
    );
    const currentPosition = new THREE.Vector3().lerpVectors(
      this.positions[index].position,
      this.positions[nextIndex].position,
      easedScrollFraction
    );
    const currentLookAt = new THREE.Vector3().lerpVectors(
      this.positions[index].lookAt,
      this.positions[nextIndex].lookAt,
      easedScrollFraction
    );
    const currentColors = this.positions[index].characters.map((character, i) =>
      new THREE.Color().lerpColors(
        character.color,
        this.positions[nextIndex].characters[i].color,
        easedScrollFraction
      )
    );

    // Apply the position, lookAt, and color
    this.camera.position.set(
      currentPosition.x,
      currentPosition.y,
      currentPosition.z
    );
    this.camera.lookAt(currentLookAt);
    this.groupText.rotation.set(
      currentRotation.x,
      currentRotation.y,
      currentRotation.z
    );
    this.groupText.children.forEach((child, i) => {
      const { position, rotation, color } = this.positions[index].characters[i];
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
        .add(new THREE.Vector3(0, 0.05 * this.size, -0.1 * this.size));
      const vControl2 = vStart
        .clone()
        .lerp(vEnd, 0.75)
        .add(new THREE.Vector3(0, -0.05 * this.size, 0.1 * this.size));
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
      const data = this.meshes[child.uuid];
      child.position.set(
        data.position.x + x * this.size,
        data.position.y + y * this.size,
        data.position.z + z * this.size
      );
      child.rotation.set(
        currentRotation.x,
        currentRotation.y,
        currentRotation.z
      );
      // child.material.color.copy(currentColors[i]);
    });
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  static generatePositions(text) {
    return [
      {
        position: new THREE.Vector3(0, 0, 1200),
        lookAt: new THREE.Vector3(0, 0, 0),
      },
      {
        position: new THREE.Vector3(0, 0, 500),
        lookAt: new THREE.Vector3(0, 0, 0),
      },
    ].map((position) => {
      const randomDirection = () => (Math.random() > 0.5 ? -1 : 1);
      const randomPosition = () => ((Math.random() - 0.5) / 0.5) * 8;
      const randomRotation = () =>
        Math.round(Math.random() * 4) * Math.PI * 2 * randomDirection();
      const randomHex = () =>
        "#" + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0");
      position.characters = text.split("").map(() => {
        const object = {
          position: [randomPosition(), randomPosition(), randomPosition()],
          rotation: [randomRotation(), randomRotation(), randomRotation()],
          color: new THREE.Color(randomHex()),
          // color: new THREE.Color("#000000"),
        };
        return object;
      });
      position.easing = bezier(
        Math.random(),
        Math.random(),
        Math.random(),
        Math.random()
      );
      return position;
    });
  }
}

class ShaderMaterials {
  static noiseShaderMaterial(uniforms) {
    return new THREE.ShaderMaterial({
      vertexShader: `
      // Vertex Shader
  varying vec2 vUv;
  
  void main() {
      vUv = uv; // Pass UV coordinates to the fragment shader
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
  
    `,
      fragmentShader: `// Fragment Shader
  uniform float time;  // Time for animation
  uniform sampler2D noiseTexture;  // Noise texture for feathering
  varying vec2 vUv;
  
  void main() {
      // Sample the noise texture
      vec2 noiseUV = vUv * 10.0 + time * 0.1; // Scale and animate UVs
      float noise = texture2D(noiseTexture, noiseUV).r; // Get noise value
  
      // Feathering effect: make edges softer
      float feather = smoothstep(0.4, 0.5, noise); // Adjust thresholds as needed
  
      // Set the final color (use white with feathering)
      gl_FragColor = vec4(vec3(1.0) * feather, 1.0);
  }
  
  `,
      uniforms,
      transparent: true, // Enables alpha blending
    });
  }
}

class Easing {
  static inOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }
}
