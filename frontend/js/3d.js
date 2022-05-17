import * as THREE from "three";
import { MTLLoaderG } from "/js/MTLLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
export { phoneLoaded, startAnimation };

let phoneLoaded = false;

// Setup
function startAnimation() {
  const scene = new THREE.Scene();

  const canvas = document.querySelector("#bg");

  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    1,
    1000
  );

  var invisibleGeometry = new THREE.BoxGeometry(0.55, 0.55, 0.6);
  var invisibleMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.0,
    wireframe: true,
  });

  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true,
  });

  const raycaster = new THREE.Raycaster();
  raycaster.prec;

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
  const count = 500;
  const box = new THREE.BoxGeometry();
  const radius = 4.75;
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
    mesh.scale.set(0.16, 0.6, 0.02);
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

  const background = new THREE.TextureLoader().load("/assets/bg.jpg");
  scene.background = background;

  // Phone

  let phone;

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
  let gitHubLogoHitbox;
  let gitHubLogoLoaded = false;

  mtlLoader.load("/models/gitHubLogo/obj.mtl", function (materials) {
    materials.preload();

    const objLoader = new OBJLoader();
    objLoader.setMaterials(materials);
    objLoader.load("/models/gitHubLogo/tinker.obj", function (obj) {
      gitHubLogo = obj;
      gitHubLogoHitbox = new THREE.Mesh(invisibleGeometry, invisibleMaterial);

      scene.add(gitHubLogoHitbox);
      gitHubLogoHitbox.add(gitHubLogo);

      gitHubLogo.castShadow = false;
      gitHubLogoHitbox.castShadow = false;

      gitHubLogo.scale.set(0.004, 0.004, 0.004);

      gitHubLogoHitbox.position.set(-4.25, -0.7, -6.5);

      gitHubLogo.rotation.x = -0.2;

      gitHubLogoHitbox.name = "gitHubLogoHitbox";

      gitHubLogoLoaded = true;
    });
  });

  // Linkedin logo
  let linkedinLogo;
  let linkedinLogoHitbox;
  let linkedinLogoLoaded = false;

  mtlLoader.load("/models/linkedinLogo/obj.mtl", function (materials) {
    materials.preload();

    const objLoader = new OBJLoader();
    objLoader.setMaterials(materials);
    objLoader.load("/models/linkedinLogo/tinker.obj", function (obj) {
      linkedinLogo = obj;
      linkedinLogoHitbox = new THREE.Mesh(invisibleGeometry, invisibleMaterial);

      scene.add(linkedinLogoHitbox);
      linkedinLogoHitbox.add(linkedinLogo);

      linkedinLogo.castShadow = false;
      linkedinLogoHitbox.castShadow = false;

      linkedinLogo.scale.set(0.004, 0.004, 0.004);

      linkedinLogoHitbox.position.set(-4.26, -1.45, -6.5);

      linkedinLogo.rotation.x = -0.2;

      linkedinLogoHitbox.name = "linkedinLogoHitbox";

      linkedinLogoLoaded = true;
    });
  });

  // Twitter logo
  let twitterLogo;
  let twitterLogoHitbox;
  let twitterLogoLoaded = false;

  mtlLoader.load("/models/twitterLogo/obj.mtl", function (materials) {
    materials.preload();

    const objLoader = new OBJLoader();
    objLoader.setMaterials(materials);
    objLoader.load("/models/twitterLogo/tinker.obj", function (obj) {
      twitterLogo = obj;
      twitterLogoHitbox = new THREE.Mesh(invisibleGeometry, invisibleMaterial);

      scene.add(twitterLogoHitbox);
      twitterLogoHitbox.add(twitterLogo);

      twitterLogo.castShadow = false;
      twitterLogoHitbox.castShadow = false;

      twitterLogo.scale.set(0.004, 0.004, 0.004);

      twitterLogoHitbox.position.set(-4.3, -2.2, -6.5);

      twitterLogo.rotation.x = -0.2;

      twitterLogoHitbox.name = "twitterLogoHitbox";

      twitterLogoLoaded = true;
    });
  });

  // Email logo
  let emailLogo;
  let emailLogoHitbox;
  let emailLogoLoaded = false;

  mtlLoader.load("/models/emailLogo/obj.mtl", function (materials) {
    materials.preload();

    const objLoader = new OBJLoader();
    objLoader.setMaterials(materials);
    objLoader.load("/models/emailLogo/tinker.obj", function (obj) {
      emailLogo = obj;
      emailLogoHitbox = new THREE.Mesh(invisibleGeometry, invisibleMaterial);

      scene.add(emailLogoHitbox);
      emailLogoHitbox.add(emailLogo);

      emailLogo.castShadow = false;
      emailLogoHitbox.castShadow = false;

      emailLogo.scale.set(0.005, 0.005, 0.005);

      emailLogoHitbox.position.set(-4.33, -2.95, -6.5);

      emailLogo.rotation.x = -0.2;

      emailLogoHitbox.name = "emailLogoHitbox";

      emailLogoLoaded = true;
    });
  });

  // Welcome Text

  /*
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
  */

  // Positions

  strip.position.z = -7;
  strip.position.x = -2;
  strip.rotation.x = 0.6;

  // Add clickgroup to scene

  // Scroll Animation

  let t;
  function moveCamera() {
    t = window.scrollY;
    console.log(t);
    if (t < 700) {
      camera.position.z = 1.5 + ~t * -0.01;
    }
  }

  document.body.onscroll = moveCamera;
  moveCamera();

  // Animation Loop

  function animate() {
    setTimeout(function () {
      requestAnimationFrame(animate);
    }, 1000 / 30);

    strip.rotation.y += 0.01;

    render();
  }

  function render() {
    raycaster.setFromCamera(pointer, camera);

    if (
      gitHubLogoLoaded &&
      linkedinLogoLoaded &&
      twitterLogoLoaded &&
      emailLogoLoaded &&
      t < 600
    ) {
      var intersects = raycaster.intersectObjects([
        twitterLogoHitbox,
        gitHubLogoHitbox,
        linkedinLogoHitbox,
        emailLogoHitbox,
      ]);

      if (intersects.length > 0) {
        if (INTERSECTED != intersects[0].object) {
          if (INTERSECTED) INTERSECTED.children[0].material.opacity = 1;
          INTERSECTED = intersects[0].object.children[0];
          INTERSECTED.children[0].material.opacity = 0;
        }
      } else {
        if (INTERSECTED) INTERSECTED.children[0].material.opacity = 1;
        INTERSECTED = null;
      }
    }

    renderer.render(scene, camera);
  }

  function onPointerMove(event) {
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
  }

  function onMouseClick() {
    if (INTERSECTED) {
      switch (INTERSECTED.parent.name) {
        case "gitHubLogoHitbox":
          window.open("https://github.com/cassanof", "_blank");
          break;
        case "linkedinLogoHitbox":
          window.open("https://www.linkedin.com/in/federicocassano/", "_blank");
          break;
        case "twitterLogoHitbox":
          window.open("https://twitter.com/FedericoCassa17", "_blank");
          break;
        case "emailLogoHitbox":
          window.open("mailto:federico.cassano@federico.codes");
          break;
        default:
        // do nuttin
      }
    }
  }

  animate();
}
