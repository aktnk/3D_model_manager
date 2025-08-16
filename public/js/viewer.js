import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// --- DOM Elements ---
const titleElement = document.getElementById('model-title');

// --- Scene Setup ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x222222);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;
document.body.appendChild(renderer.domElement);

// --- Lighting ---
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 7.5);
scene.add(directionalLight);

// --- Controls ---
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
controls.dampingFactor = 0.05;
controls.screenSpacePanning = false;
controls.minDistance = 1;
controls.maxDistance = 500;

// --- Model Loading & Title Display ---
const loader = new GLTFLoader();
const urlParams = new URLSearchParams(window.location.search);
const modelPath = urlParams.get('model');
const modelTitle = decodeURIComponent(urlParams.get('title') || 'Untitled');

titleElement.textContent = modelTitle;

if (modelPath) {
    loader.load(
        // resource URL
        modelPath,
        // called when the resource is loaded
        function (gltf) {
            // Center the model
            const box = new THREE.Box3().setFromObject(gltf.scene);
            const center = box.getCenter(new THREE.Vector3());
            gltf.scene.position.sub(center); // center the model

            scene.add(gltf.scene);
        },
        // called while loading is progressing
        function (xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        // called when loading has errors
        function (error) {
            console.error('An error happened', error);
            titleElement.textContent = 'Error loading model';
            alert('Failed to load model. See console for details.');
        }
    );
} else {
    const errorMsg = 'No model specified!';
    console.error('No model path specified in URL');
    titleElement.textContent = errorMsg;
    alert(errorMsg);
}

// --- Animation Loop ---
function animate() {
    requestAnimationFrame(animate);
    controls.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = true
    renderer.render(scene, camera);
}
animate();

// --- Handle Window Resize ---
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});