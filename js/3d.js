import "/css/style.css";
import * as THREE from "three";
import { MTLLoaderG } from "/js/MTLLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import {Object3D} from "three";
export { phoneLoaded };

// Setup

const scene = new THREE.Scene();

const canvas = document.querySelector("#bg");

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  1,
  1000
);

const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
  alpha: true,
});

const raycaster = new THREE.Raycaster();
raycaster.prec

// TODO: here
let pointer = new THREE.Vector2();
let INTERSECTED;

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.sortObjects = false;

document.body.appendChild(renderer.domElement);
document.addEventListener("mousemove", onPointerMove);
document.addEventListener("mousedown", onMouseClick);

// responsiveness
window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;

  camera.updateProjectionMatrix();
});

camera.position.setZ(30);
camera.position.setX(-3);

renderer.render(scene, camera);

// Mobius
const count = 1024;
const box = new THREE.BoxGeometry();
const radius = 5.1;
const strip = new THREE.Object3D();
scene.add(strip);

for (let i = 0; i < count; i++) {
  const a = (Math.PI / count) * 2 * i;
  const o = new THREE.Object3D();
  o.position.set(Math.cos(a), Math.sin(a * 5) / 30, Math.sin(a));
  o.position.multiplyScalar(radius);
  o.lookAt(scene.position);
  strip.add(o);
  const mat = new THREE.MeshPhongMaterial({
    color: new THREE.Color(`hsl(${Math.floor(104 + a * 2)}, 100%, 12%)`),
  });
  const mesh = new THREE.Mesh(box, mat);
  mesh.scale.set(0.06, 0.6, 0.02);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.rotation.x = a / 2;
  o.add(mesh);
}

// Lights

const pointLight = new THREE.PointLight(0xffffff);
pointLight.position.set(2, 5, -8);

const ambientLight = new THREE.AmbientLight(0xffffff);
scene.add(pointLight, ambientLight);

// Helpers

// const lightHelper = new THREE.PointLightHelper(pointLight)
// const gridHelper = new THREE.GridHelper(200, 50);
// scene.add(lightHelper, gridHelper)

// const controls = new OrbitControls(camera, renderer.domElement);

// Background

const background = new THREE.TextureLoader().load("/assets/bg.png");
scene.background = background;

// Phone

let phone;
let phoneLoaded = false;

const mtlLoader = new MTLLoaderG();
mtlLoader.load("/models/phoneModel/phoneModel.mtl", function (materials) {
  materials.preload();

  const objLoader = new OBJLoader();
  objLoader.setMaterials(materials);
  objLoader.load("/models/phoneModel/phoneModel.obj", function (obj) {
    scene.add(obj);
    phone = obj;

    phone.scale.set(0.05, 0.05, 0.05);

    phone.position.z = -7;
    phone.position.x = -2;
    phone.position.y = -4;

    phone.rotation.x = -0.2;

    phone.castShadow = true;

    phoneLoaded = true;
  });
});

// GitHub logo
let gitHubLogo;
let gitHubLogoLoaded = false;

mtlLoader.load("/models/gitHubLogo/obj.mtl", function (materials) {
  materials.preload();

  const objLoader = new OBJLoader();
  objLoader.setMaterials(materials);
  objLoader.load("/models/gitHubLogo/tinker.obj", function (obj) {
    gitHubLogo = obj
    scene.add(gitHubLogo);

    gitHubLogo.castShadow = false;

    gitHubLogo.scale.set(0.004, 0.004, 0.004);

    gitHubLogo.position.x = -4.25;
    gitHubLogo.position.z = -6.5;
    gitHubLogo.position.y = -0.7;

    gitHubLogo.rotation.x = -0.2;

    gitHubLogo.name = "gitHubLogo";

    gitHubLogoLoaded = true;
  });
});

// Linkedin logo
let linkedinLogo;
let linkedinLogoLoaded = false;

mtlLoader.load("/models/linkedinLogo/obj.mtl", function (materials) {
  materials.preload();

  const objLoader = new OBJLoader();
  objLoader.setMaterials(materials);
  objLoader.load("/models/linkedinLogo/tinker.obj", function (obj) {
    linkedinLogo = obj;
    scene.add(linkedinLogo);

    linkedinLogo.castShadow = false;

    linkedinLogo.scale.set(0.004, 0.004, 0.004);

    linkedinLogo.position.x = -4.3;
    linkedinLogo.position.z = -6.5;
    linkedinLogo.position.y = -1.5;

    linkedinLogo.rotation.x = -0.2;

    linkedinLogo.name = "linkedinLogo";

    linkedinLogoLoaded = true;
  });
});

// Twitter logo
let twitterLogo;
let twitterLogoLoaded = false;

mtlLoader.load("/models/twitterLogo/obj.mtl", function (materials) {
  materials.preload();

  const objLoader = new OBJLoader();
  objLoader.setMaterials(materials);
  objLoader.load("/models/twitterLogo/tinker.obj", function (obj) {
    twitterLogo = obj;
    scene.add(twitterLogo);

    twitterLogo.castShadow = false;

    twitterLogo.scale.set(0.004, 0.004, 0.004);

    twitterLogo.position.x = -4.3;
    twitterLogo.position.z = -6.5;
    twitterLogo.position.y = -2.2;

    twitterLogo.rotation.x = -0.2;

    twitterLogo.name = "twitterLogo";

    twitterLogoLoaded = true;
  });
});

// Email logo
let emailLogo;
let emailLogoLoaded = false;

mtlLoader.load("/models/emailLogo/obj.mtl", function (materials) {
  materials.preload();

  const objLoader = new OBJLoader();
  objLoader.setMaterials(materials);
  objLoader.load("/models/emailLogo/tinker.obj", function (obj) {
    emailLogo = obj;
    scene.add(emailLogo);

    emailLogo.castShadow = false;

    emailLogo.scale.set(0.005, 0.005, 0.005);

    emailLogo.position.x = -4.35;
    emailLogo.position.z = -6.5;
    emailLogo.position.y = -3;

    emailLogo.rotation.x = -0.2;

    emailLogo.name = "twitterLogo";

    emailLogoLoaded = true;
  });
});

// Welcome Text

const fontLoader = new THREE.FontLoader();

fontLoader.load("/assets/garoa.json", function (font) {
  const geometry = new THREE.TextGeometry("Welcome to my\n   Portfolio!", {
    font: font,
    size: 1,
    height: 1,
    curveSegments: 12,
  });
  geometry.center();
  const material = new THREE.MeshStandardMaterial({ color: "#FF7F50" });
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  mesh.position.x = -2.5;
  mesh.position.y = 11;
  mesh.position.z = -20;

  mesh.rotation.x = 0.3;
});

// Positions

strip.position.z = -7;
strip.position.x = -2;
strip.rotation.x = 0.6;

// Add clickgroup to scene

// Scroll Animation

function moveCamera() {
  const t = document.body.getBoundingClientRect().top;
  camera.position.z = 1.50 + t * -0.01;
}

document.body.onscroll = moveCamera;
moveCamera();

// Animation Loop

function animate() {
  requestAnimationFrame(animate);

  strip.rotation.y += 0.01;

  render();
}

function render() {
  raycaster.setFromCamera(pointer, camera);

  if (gitHubLogoLoaded && linkedinLogoLoaded && twitterLogoLoaded) {
    var intersects = raycaster.intersectObjects(gitHubLogo.children.concat(
      linkedinLogo.children, 
      twitterLogo.children,
      emailLogo.children
    ));

    if (intersects.length > 0) {
      if (INTERSECTED != intersects[0].object) {
        if (INTERSECTED) INTERSECTED.parent.material.opacity = 1;
        INTERSECTED = intersects[0].object;
        INTERSECTED.material.opacity = 0.5;
      }
    } else {
      if (INTERSECTED) INTERSECTED.material.opacity = 1;
      INTERSECTED = null;
    }
  }

  renderer.render(scene, camera);
}

function onPointerMove(event) {
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function onMouseClick(event) {
  if (INTERSECTED) {
    switch (INTERSECTED.parent.name) {
      case "gitHubLogo":
        window.open("https://github.com/elleven11", "_blank");
        break;
      case "linkedinLogo":
        window.open("https://www.linkedin.com/in/federicocassano/", "_blank");
        break;
      case "twitterLogo":
        window.open("https://twitter.com/FedericoCassa17", "_blank");
        break;
      default:
      // do nuttin
    }
  }
}

animate();
