import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

// --- DOM Elements ---
const titleElement = document.getElementById("model-title");
const viewerContainer = document.getElementById("viewer-container");
const thumbnailPreview = document.getElementById("thumbnail-preview");
const uploadThumbnailBtn = document.getElementById("upload-thumbnail-btn");
const thumbnailFileInput = document.getElementById("thumbnail-file-input");

// --- Scene Setup ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  viewerContainer.clientWidth / viewerContainer.clientHeight,
  0.1,
  1000
);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(viewerContainer.clientWidth, viewerContainer.clientHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.8; // 再調整: 露出を 1から 1.8 に引き上げます
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
const modelId = urlParams.get("id");

const handleLoadError = (message) => {
  titleElement.textContent = "Error: Model not found.";
  // Remove the Three.js canvas
  while (viewerContainer.firstChild) {
    viewerContainer.removeChild(viewerContainer.firstChild);
  }
  // Display error message in the viewer container
  const errorDiv = document.createElement("div");
  errorDiv.className = "text-center text-white-50 p-5";
  errorDiv.innerHTML = `
    <p><i class="bi bi-exclamation-triangle-fill" style="font-size: 3rem;"></i></p>
    <p>${message}</p>
    <a href="/" class="btn btn-secondary">モデル一覧に戻る</a>
  `;
  viewerContainer.appendChild(errorDiv);
};

const loadModel = async (id) => {
  try {
    const response = await fetch(`/api/models/${id}`);
    if (!response.ok) {
      // Even if the server gives a specific error, we'll use a generic "not found" for the user.
      throw new Error("Model not found");
    }
    const { model } = await response.json();

    titleElement.textContent = model.title || "Untitled";

    // Display thumbnail if it exists
    if (model.thumbnail_path) {
      thumbnailPreview.src = `/${model.thumbnail_path}`;
      thumbnailPreview.style.display = "block";
    }

    loader.load(
      `/${model.file_path}`,
      function (gltf) {
        const box = new THREE.Box3().setFromObject(gltf.scene);
        const center = box.getCenter(new THREE.Vector3());
        gltf.scene.position.sub(center);
        scene.add(gltf.scene);
      },
      (xhr) => console.log((xhr.loaded / xhr.total) * 100 + "% loaded"),
      (error) => {
        console.error("An error happened during model loading:", error);
        handleLoadError("モデルの読み込みに失敗しました。");
      }
    );
  } catch (error) {
    console.error("Failed to fetch model data:", error);
    handleLoadError(
      "指定されたIDのモデルは存在しないか、削除された可能性があります。<br>IDを確認して再読み込みするか、一覧に戻ってください。"
    );
  }
};

// --- Thumbnail Upload ---
const handleThumbnailUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append("thumbnailFile", file);

  try {
    const response = await fetch(`/api/models/${modelId}/thumbnail`, {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      const data = await response.json();
      alert("Thumbnail updated successfully!");
      // Update the preview image
      thumbnailPreview.src = `/${data.thumbnail_path}`;
      thumbnailPreview.style.display = "block";
    } else {
      const errorData = await response.json();
      alert(`Upload failed: ${errorData.error}`);
    }
  } catch (error) {
    console.error("Error uploading thumbnail:", error);
    alert("An error occurred during upload.");
  }
};

// --- Event Listeners ---
uploadThumbnailBtn.addEventListener("click", () => thumbnailFileInput.click());
thumbnailFileInput.addEventListener("change", handleThumbnailUpload);

if (modelId) {
  loadModel(modelId);
} else {
  handleLoadError("モデルIDが指定されていません。");
}

// --- Animation Loop ---
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();

// --- Handle Window Resize ---
window.addEventListener("resize", () => {
  camera.aspect = viewerContainer.clientWidth / viewerContainer.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(viewerContainer.clientWidth, viewerContainer.clientHeight);
});
