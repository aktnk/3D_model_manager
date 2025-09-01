document.addEventListener("DOMContentLoaded", () => {
  // --- DOM Elements ---
  const modelListContainer = document.getElementById("model-list-container");
  const newModelBtn = document.getElementById("new-model-btn");
  const newModelInput = document.getElementById("new-model-input");
  const updateModelInput = document.getElementById("update-model-input");
  const updateUsdzInput = document.getElementById("update-usdz-input"); // Added
  const searchInput = document.getElementById("search-input");
  const searchBtn = document.getElementById("search-btn");
  const clearSearchBtn = document.getElementById("clear-search-btn");

  // --- Functions ---

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
          const usdzPath = model.usdz_file_path || "";

          // --- Create Column ---
          const col = document.createElement("div");
          col.className = "col-6 col-md-4 col-lg-3 col-xl-2 mb-4";

          // --- Create Card ---
          const card = document.createElement("div");
          card.className = "card text-white bg-dark h-100 model-card";

          // --- Create Image Container (as click trigger) ---
          const imageContainer = document.createElement("div");
          imageContainer.className = "card-img-top view-trigger";
          imageContainer.style.height = "150px";
          imageContainer.style.cursor = "pointer";
          imageContainer.dataset.id = model.id;

          // --- Create Model Viewer ---
          const modelViewer = document.createElement("model-viewer");
          modelViewer.src = model.file_path;
          modelViewer.alt = currentTitle;
          modelViewer.cameraControls = true;
          modelViewer.disableZoom = true;
          modelViewer.shadowIntensity = 1;
          // Re-enable lazy loading for performance
          modelViewer.loading = "lazy";
          // modelViewer.reveal = "interaction"; // Keep this commented out
          modelViewer.style.width = "100%";
          modelViewer.style.height = "100%";
          modelViewer.style.backgroundColor = "#343a40";

          imageContainer.appendChild(modelViewer);

          // --- Create Card Body (as click trigger) ---
          const cardBody = document.createElement("div");
          cardBody.className = "card-body view-trigger";
          cardBody.dataset.id = model.id;

          const cardTitle = document.createElement("h6");
          cardTitle.className = "card-title text-truncate";
          cardTitle.textContent = currentTitle;

          const cardText = document.createElement("p");
          cardText.className = "card-text small text-muted text-truncate";
          cardText.textContent = model.original_name;

          cardBody.appendChild(cardTitle);
          cardBody.appendChild(cardText);

          // --- Create Card Footer ---
          const cardFooter = document.createElement("div");
          cardFooter.className = "card-footer d-flex justify-content-end";

          const arButton = document.createElement("button");
          arButton.className = "btn btn-sm btn-light me-2 ar-btn";
          arButton.textContent = "AR";
          arButton.dataset.id = model.id;

          const dropdownDiv = document.createElement("div");
          dropdownDiv.className = "dropdown";

          const dropdownButton = document.createElement("button");
          dropdownButton.className = "btn btn-sm btn-secondary dropdown-toggle";
          dropdownButton.type = "button";
          dropdownButton.setAttribute("data-bs-toggle", "dropdown");
          dropdownButton.setAttribute("aria-expanded", "false");
          dropdownButton.textContent = "...";

          const dropdownMenu = document.createElement("ul");
          dropdownMenu.className = "dropdown-menu dropdown-menu-dark";

          dropdownMenu.innerHTML = `
            <li><a class="dropdown-item title-update-btn" href="#" data-id="${model.id}" data-title="${currentTitle}">Edit Title</a></li>
            <li><a class="dropdown-item model-update-btn" href="#" data-id="${model.id}">Update Model</a></li>
            <li><hr class="dropdown-divider"></li>
            <li><a class="dropdown-item delete-btn" href="#" data-id="${model.id}">Delete</a></li>
          `;

          dropdownDiv.appendChild(dropdownButton);
          dropdownDiv.appendChild(dropdownMenu);

          cardFooter.appendChild(arButton);
          cardFooter.appendChild(dropdownDiv);

          // --- Assemble Card ---
          card.appendChild(imageContainer);
          card.appendChild(cardBody);
          card.appendChild(cardFooter);

          // --- Append to Column and Container ---
          col.appendChild(card);
          modelListContainer.appendChild(col);
        });

        // Initialize dropdowns for the newly created cards
        const dropdownElementList = [].slice.call(
          modelListContainer.querySelectorAll(".dropdown-toggle")
        );
        dropdownElementList.map(function (dropdownToggleEl) {
          return new bootstrap.Dropdown(dropdownToggleEl);
        });
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
        method: "POST", // This should likely be PUT or PATCH in a real app
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

  // Added for USDZ upload
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
  updateUsdzInput.addEventListener("change", handleUpdateUsdzUpload); // Added

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
    const modelId = target.dataset.id;

    // --- Card click to view model ---
    const viewTrigger = target.closest(".view-trigger");
    if (viewTrigger) {
      const id = viewTrigger.dataset.id;
      const path = viewTrigger.dataset.path;
      const usdzPath = viewTrigger.dataset.usdzPath;
      const title = viewTrigger.dataset.title;
      window.location.href = `/viewer.html?id=${id}`;
      return; // Stop further processing
    }

    // --- Button clicks ---
    if (target.classList.contains("ar-btn")) {
      const id = target.dataset.id;
      window.location.href = `/ar-viewer.html?id=${id}`;
    } else if (target.classList.contains("model-update-btn")) {
      updateModelInput.dataset.modelIdForUpdate = modelId;
      updateModelInput.click();
    } else if (target.classList.contains("usdz-update-btn")) {
      // Added
      updateUsdzInput.dataset.modelIdForUpdate = modelId;
      updateUsdzInput.click();
    } else if (target.classList.contains("title-update-btn")) {
      const currentTitle = target.dataset.title;
      handleTitleUpdate(modelId, currentTitle);
    } else if (target.classList.contains("delete-btn")) {
      handleDeleteModel(modelId);
    }
  });

  // --- Initial Load ---
  fetchAndDisplayModels();

  // Bootstrap dropdown initialization
  const dropdownElementList = [].slice.call(
    document.querySelectorAll(".dropdown-toggle")
  );
  const dropdownList = dropdownElementList.map(function (dropdownToggleEl) {
    return new bootstrap.Dropdown(dropdownToggleEl);
  });
});
