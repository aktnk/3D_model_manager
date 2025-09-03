document.addEventListener("DOMContentLoaded", () => {
  // --- DOM Elements ---
  const modelListContainer = document.getElementById("model-list-container");
  const newModelBtn = document.getElementById("new-model-btn");
  const newModelInput = document.getElementById("new-model-input");
  const updateModelInput = document.getElementById("update-model-input");
  const updateUsdzInput = document.getElementById("update-usdz-input");
  const searchInput = document.getElementById("search-input");
  const searchBtn = document.getElementById("search-btn");
  const clearSearchBtn = document.getElementById("clear-search-btn");

  // --- Constants ---
  const PREFERENCE_KEY_PREFIX = "display-preference-";

  // --- Functions ---

  const createThumbnailElement = (model, preference) => {
    const currentTitle = model.title || "N/A";
    // Default to 'image' if thumbnail exists and no preference is set
    const view =
      preference || (model.thumbnail_path ? "image" : "3d");

    if (view === "3d" || !model.thumbnail_path) {
      const modelViewer = document.createElement("model-viewer");
      modelViewer.src = model.file_path;
      modelViewer.alt = currentTitle;
      modelViewer.cameraControls = true;
      modelViewer.disableZoom = true;
      modelViewer.shadowIntensity = 1;
      modelViewer.loading = "lazy";
      modelViewer.style.width = "100%";
      modelViewer.style.height = "100%";
      modelViewer.style.backgroundColor = "#343a40";
      return modelViewer;
    } else {
      const thumbnail = document.createElement("img");
      thumbnail.src = model.thumbnail_path;
      thumbnail.alt = currentTitle;
      thumbnail.className = "card-img-top";
      thumbnail.style.width = "100%";
      thumbnail.style.height = "100%";
      thumbnail.style.objectFit = "cover";
      return thumbnail;
    }
  };

  const fetchAndDisplayModels = async (searchTerm = "") => {
    try {
      let url = "/api/models";
      if (searchTerm) {
        url += `?search=${encodeURIComponent(searchTerm)}`;
      }
      const response = await fetch(url);
      const data = await response.json();

      modelListContainer.innerHTML = ""; // Clear existing cards

      if (data.models && data.models.length > 0) {
        data.models.forEach((model) => {
          const currentTitle = model.title || "N/A";
          const preference = localStorage.getItem(PREFERENCE_KEY_PREFIX + model.id);
          const currentView = preference || (model.thumbnail_path ? "image" : "3d");

          const col = document.createElement("div");
          col.className = "col-6 col-md-4 col-lg-3 col-xl-2 mb-4";
          col.dataset.modelId = model.id; // Add model-id to the column for easier targeting

          const card = document.createElement("div");
          card.className = "card text-white bg-dark h-100 model-card";

          const imageContainer = document.createElement("div");
          imageContainer.className = "card-img-top-container"; // Renamed for clarity
          imageContainer.style.height = "150px";
          
          // Add a wrapper for the view trigger to separate it from the content
          const viewTrigger = document.createElement('div');
          viewTrigger.className = 'view-trigger';
          viewTrigger.style.cursor = 'pointer';
          viewTrigger.style.height = '100%';
          viewTrigger.dataset.id = model.id;

          const thumbnailElement = createThumbnailElement(model, preference);
          viewTrigger.appendChild(thumbnailElement);
          imageContainer.appendChild(viewTrigger);

          const cardBody = document.createElement("div");
          const cardBodyContent = document.createElement('div'); // Wrapper for non-clickable area
          cardBody.className = "card-body d-flex flex-column";
          
          cardBodyContent.innerHTML = `
            <h6 class="card-title text-truncate">${currentTitle}</h6>
            <p class="card-text small text-muted text-truncate">${model.original_name}</p>
          `;

          const cardFooter = document.createElement("div");
          cardFooter.className = "card-footer d-flex justify-content-end align-items-center mt-auto";

          // --- View Toggle Button ---
          const toggleBtn = document.createElement("button");
          if (model.thumbnail_path) {
            toggleBtn.className = "btn btn-sm btn-outline-secondary me-auto toggle-view-btn";
            toggleBtn.innerHTML = currentView === '3d' ? '<i class="bi bi-image"></i>' : '<i class="bi bi-box"></i>';
            toggleBtn.dataset.modelId = model.id;
            toggleBtn.dataset.filePath = model.file_path;
            toggleBtn.dataset.thumbnailPath = model.thumbnail_path;
            cardFooter.appendChild(toggleBtn);
          } else {
            // Add a placeholder to keep alignment consistent
            const placeholder = document.createElement('div');
            placeholder.className = 'me-auto';
            cardFooter.appendChild(placeholder);
          }


          const arButton = document.createElement("button");
          arButton.className = "btn btn-sm btn-light ms-2 ar-btn";
          arButton.textContent = "AR";
          arButton.dataset.id = model.id;

          const dropdownDiv = document.createElement("div");
          dropdownDiv.className = "dropdown ms-2";

          dropdownDiv.innerHTML = `
            <button class="btn btn-sm btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">...</button>
            <ul class="dropdown-menu dropdown-menu-dark">
              <li><a class="dropdown-item title-update-btn" href="#" data-id="${model.id}" data-title="${currentTitle}">Edit Title</a></li>
              <li><a class="dropdown-item model-update-btn" href="#" data-id="${model.id}">Update Model</a></li>
              <li><hr class="dropdown-divider"></li>
              <li><a class="dropdown-item delete-btn" href="#" data-id="${model.id}">Delete</a></li>
            </ul>
          `;
          
          cardBody.appendChild(cardBodyContent);
          cardFooter.appendChild(arButton);
          cardFooter.appendChild(dropdownDiv);
          
          card.appendChild(imageContainer);
          card.appendChild(cardBody);
          card.appendChild(cardFooter);

          col.appendChild(card);
          modelListContainer.appendChild(col);
        });

        const dropdownElementList = [].slice.call(
          modelListContainer.querySelectorAll(".dropdown-toggle")
        );
        dropdownElementList.map(
          (dropdownToggleEl) => new bootstrap.Dropdown(dropdownToggleEl)
        );
      } else {
        modelListContainer.innerHTML =
          '<div class="col"><p class="text-light">No models found.</p></div>';
      }
    } catch (error) {
      console.error("Failed to fetch models:", error);
      modelListContainer.innerHTML =
        '<div class="col"><p class="text-danger">Error loading models.</p></div>';
    }
  };

  const handleNewModelUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const title = prompt("Please enter a title for the 3D model:");
    if (!title) {
      alert("Upload cancelled: Title is required.");
      event.target.value = null;
      return;
    }
    const formData = new FormData();
    formData.append("modelFile", file);
    formData.append("title", title);
    try {
      const response = await fetch("/api/models", {
        method: "POST",
        body: formData,
      });
      if (response.ok) {
        alert("Model uploaded successfully!");
        fetchAndDisplayModels();
      } else {
        const errorData = await response.json();
        alert(`Upload failed: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    }
    event.target.value = null;
  };

  const handleUpdateModelUpload = async (event) => {
    const modelId = event.target.dataset.modelIdForUpdate;
    const file = event.target.files[0];
    if (!file || !modelId) return;
    const formData = new FormData();
    formData.append("modelFile", file);
    try {
      const response = await fetch(`/api/models/${modelId}`, {
        method: "POST",
        body: formData,
      });
      if (response.ok) {
        alert("Model updated successfully!");
        fetchAndDisplayModels(searchInput.value.trim());
      } else {
        const errorData = await response.json();
        alert(`Update failed: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error updating file:", error);
    }
    event.target.value = null;
  };

  const handleUpdateUsdzUpload = async (event) => {
    const modelId = event.target.dataset.modelIdForUpdate;
    const file = event.target.files[0];
    if (!file || !modelId) return;
    const formData = new FormData();
    formData.append("usdzFile", file);
    try {
      const response = await fetch(`/api/models/${modelId}/usdz`, {
        method: "POST",
        body: formData,
      });
      if (response.ok) {
        alert("USDZ file updated successfully!");
        fetchAndDisplayModels(searchInput.value.trim());
      } else {
        const errorData = await response.json();
        alert(`USDZ update failed: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error updating USDZ file:", error);
    }
    event.target.value = null;
  };

  const handleTitleUpdate = async (modelId, currentTitle) => {
    const newTitle = prompt("Enter the new title:", currentTitle);
    if (newTitle === null || newTitle.trim() === "") return;
    try {
      const response = await fetch(`/api/models/${modelId}/title`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle }),
      });
      if (response.ok) {
        alert("Title updated successfully!");
        fetchAndDisplayModels(searchInput.value.trim());
      } else {
        const errorData = await response.json();
        alert(`Title update failed: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error updating title:", error);
    }
  };

  const handleDeleteModel = async (modelId) => {
    if (!confirm(`Are you sure you want to delete model ${modelId}?`)) return;
    try {
      const response = await fetch(`/api/models/${modelId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        alert("Model deleted successfully!");
        fetchAndDisplayModels(searchInput.value.trim());
      } else {
        const errorData = await response.json();
        alert(`Deletion failed: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error deleting model:", error);
    }
  };

  // --- Event Listeners ---
  newModelBtn.addEventListener("click", () => newModelInput.click());
  newModelInput.addEventListener("change", handleNewModelUpload);
  updateModelInput.addEventListener("change", handleUpdateModelUpload);
  updateUsdzInput.addEventListener("change", handleUpdateUsdzUpload);

  searchBtn.addEventListener("click", () => {
    fetchAndDisplayModels(searchInput.value.trim());
  });

  clearSearchBtn.addEventListener("click", () => {
    searchInput.value = "";
    fetchAndDisplayModels();
  });

  searchInput.addEventListener("keyup", (event) => {
    if (event.key === "Enter") {
      fetchAndDisplayModels(searchInput.value.trim());
    }
  });

  modelListContainer.addEventListener("click", (event) => {
    const target = event.target;
    const button = target.closest("button, a"); // More robust target finding

    if (!button) {
        // If the click is on the card body for viewing, handle it
        const viewTrigger = target.closest(".view-trigger");
        if (viewTrigger) {
            const id = viewTrigger.dataset.id;
            window.location.href = `/viewer.html?id=${id}`;
        }
        return;
    }

    const modelId = button.dataset.id || button.closest('[data-model-id]')?.dataset.modelId;

    if (button.closest(".toggle-view-btn")) {
        const toggleBtn = button.closest(".toggle-view-btn");
        const modelId = toggleBtn.dataset.modelId;
        const preferenceKey = PREFERENCE_KEY_PREFIX + modelId;
        const currentPreference = localStorage.getItem(preferenceKey) || 'image';
        const newPreference = currentPreference === 'image' ? '3d' : 'image';
        localStorage.setItem(preferenceKey, newPreference);

        // --- Replace the card's thumbnail content ---
        const col = toggleBtn.closest(".col-6");
        const imageContainer = col.querySelector(".card-img-top-container .view-trigger");
        
        const model = {
            id: modelId,
            file_path: toggleBtn.dataset.filePath,
            thumbnail_path: toggleBtn.dataset.thumbnailPath,
            title: col.querySelector('.card-title').textContent
        };

        const newThumbnailElement = createThumbnailElement(model, newPreference);
        imageContainer.innerHTML = ''; // Clear old content
        imageContainer.appendChild(newThumbnailElement);

        // --- Update button icon ---
        toggleBtn.innerHTML = newPreference === '3d' ? '<i class="bi bi-image"></i>' : '<i class="bi bi-box"></i>';

    } else if (button.classList.contains("ar-btn")) {
      window.location.href = `/ar-viewer.html?id=${modelId}`;
    } else if (button.classList.contains("model-update-btn")) {
      updateModelInput.dataset.modelIdForUpdate = modelId;
      updateModelInput.click();
    } else if (button.classList.contains("usdz-update-btn")) {
      updateUsdzInput.dataset.modelIdForUpdate = modelId;
      updateUsdzInput.click();
    } else if (button.classList.contains("title-update-btn")) {
      const currentTitle = button.dataset.title;
      handleTitleUpdate(modelId, currentTitle);
    } else if (button.classList.contains("delete-btn")) {
      handleDeleteModel(modelId);
    }
  });

  // --- Initial Load ---
  fetchAndDisplayModels();
});
