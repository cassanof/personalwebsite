import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { MTLLoaderG } from './js/MTLLoader.js'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'

// Setup

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg'),
  antialias: true,
  alpha: true
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement)

// responsiveness
window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight)
  camera.aspect = window.innerWidth / window.innerHeight;

  camera.updateProjectionMatrix()
})

camera.position.setZ(30);
camera.position.setX(-3);

renderer.render(scene, camera);

// Mobius
const count = 1024;
const box = new THREE.BoxGeometry();
const radius = 5.1;
const strip = new THREE.Object3D();
scene.add(strip)

for (let i=0; i<count; i++) {
  const a = Math.PI/count*2*i;
  const o = new THREE.Object3D();
  o.position.set(Math.cos(a), Math.sin(a*5)/30, Math.sin(a))
  o.position.multiplyScalar(radius);
  o.lookAt(scene.position);
  strip.add(o);
  const mat = new THREE.MeshPhongMaterial({
    color: new THREE.Color(`hsl(${Math.floor(104+(a*2))}, 100%, 12%)`)
  });
  const mesh = new THREE.Mesh(box, mat);
  mesh.scale.set(0.06, 0.6, 0.02)
  mesh.castShadow = true;
  mesh.receiveShadow  = true;
  mesh.rotation.x = a/2;
  o.add(mesh)    
}


// Lights

const pointLight = new THREE.PointLight(0xffffff);
pointLight.position.set(2, 5, -8);

const ambientLight = new THREE.AmbientLight(0xffffff);
scene.add(pointLight, ambientLight);

// Helpers

const lightHelper = new THREE.PointLightHelper(pointLight)
const gridHelper = new THREE.GridHelper(200, 50);
scene.add(lightHelper, gridHelper)

// const controls = new OrbitControls(camera, renderer.domElement);

function addStar() {
  const geometry = new THREE.SphereGeometry(0.25, 24, 24);
  const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const star = new THREE.Mesh(geometry, material);

  const [x, y, z] = Array(3)
    .fill()
    .map(() => THREE.MathUtils.randFloatSpread(100));

  star.position.set(x, y, z);
  scene.add(star);
}

Array(200).fill().forEach(addStar);

// Background

const spaceTexture = new THREE.TextureLoader().load('space.jpg');
scene.background = spaceTexture;

// Phone

let phone;
let phoneLoaded=false;

const mtlLoader = new MTLLoaderG();
mtlLoader.load('models/phoneModel/phoneModel.mtl', function (materials) {

  materials.preload();

  const objLoader = new OBJLoader();
  objLoader.setMaterials(materials);
  objLoader.load('models/phoneModel/phoneModel.obj', function (obj) {

    scene.add(obj);
    phone = obj;

    phone.scale.set(0.05,0.05,0.05);

    phone.position.z = -7;
    phone.position.x = -2;
    phone.position.y = -4;

    phone.castShadow = true

    phoneLoaded = true
  })
})

// Moon

const moonTexture = new THREE.TextureLoader().load('moon.jpg');
const normalTexture = new THREE.TextureLoader().load('normal.jpg');

const moon = new THREE.Mesh(
  new THREE.SphereGeometry(3, 32, 32),
  new THREE.MeshStandardMaterial({
    map: moonTexture,
    normalMap: normalTexture,
  })
);

scene.add(moon);


// Positions

moon.position.z = 30;
moon.position.setX(-10);

strip.position.z = -7;
strip.position.x = -2;

// Scroll Animation

let scrollPos = 0;
function moveCamera() {
  const t = document.body.getBoundingClientRect().top;
  moon.rotation.x += 0.05;
  moon.rotation.y += 0.075;
  moon.rotation.z += 0.05;

  if(phoneLoaded) {
    console.log(`scrollPos: ${scrollPos} - t: ${t}`)
    if(document.body.getBoundingClientRect().top > scrollPos) {
      phone.rotation.y += 0.012;
      phone.rotation.z += 0.012;
    } else {
      phone.rotation.y -= 0.012;
      phone.rotation.z -= 0.012;
    }
    scrollPos=document.body.getBoundingClientRect().top;
  }

  camera.position.z = t * -0.01;
}

document.body.onscroll = moveCamera;
moveCamera();


// Animation Loop

function animate() {
  requestAnimationFrame(animate);

  strip.rotation.x += 0.01;
  strip.rotation.y += 0.005;
  strip.rotation.z += 0.01;

  moon.rotation.x += 0.005;

  // controls.update();

  renderer.render(scene, camera);
}

animate();
