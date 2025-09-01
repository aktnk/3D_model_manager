import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// --- DOM Elements ---
const titleElement = document.getElementById('model-title');
const viewerContainer = document.getElementById('viewer-container');

// --- Scene Setup ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, viewerContainer.clientWidth / viewerContainer.clientHeight, 0.1, 1000);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(viewerContainer.clientWidth, viewerContainer.clientHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;
viewerContainer.appendChild(renderer.domElement);

// --- Lighting ---
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 7.5);
scene.add(directionalLight);

// --- Controls ---
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.screenSpacePanning = false;
controls.minDistance = 1;
controls.maxDistance = 500;

// --- Model Loading & Title Display ---
const loader = new GLTFLoader();
const urlParams = new URLSearchParams(window.location.search);
const modelId = urlParams.get('id');

const loadModel = async (id) => {
    try {
        const response = await fetch(`/api/models/${id}`);
        if (!response.ok) {
            throw new Error('Model not found');
        }
        const { model } = await response.json();

        titleElement.textContent = model.title || 'Untitled';

        loader.load(
            model.file_path,
            function (gltf) {
                const box = new THREE.Box3().setFromObject(gltf.scene);
                const center = box.getCenter(new THREE.Vector3());
                gltf.scene.position.sub(center);
                scene.add(gltf.scene);
            },
            (xhr) => console.log((xhr.loaded / xhr.total * 100) + '% loaded'),
            (error) => {
                console.error('An error happened', error);
                titleElement.textContent = 'Error loading model';
                alert('Failed to load model. See console for details.');
            }
        );
    } catch (error) {
        console.error('Failed to fetch model data:', error);
        titleElement.textContent = 'Error: Model not found.';
        alert('Failed to fetch model data.');
    }
};

if (modelId) {
    loadModel(modelId);
} else {
    const errorMsg = 'No model specified!';
    console.error('No model ID specified in URL');
    titleElement.textContent = errorMsg;
    alert(errorMsg);
}

// --- Animation Loop ---
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();

// --- Handle Window Resize ---
window.addEventListener('resize', () => {
    camera.aspect = viewerContainer.clientWidth / viewerContainer.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(viewerContainer.clientWidth, viewerContainer.clientHeight);
});