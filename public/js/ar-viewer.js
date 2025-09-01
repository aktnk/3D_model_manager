document.addEventListener("DOMContentLoaded", async () => {
  const modelViewer = document.getElementById("ar-viewer");
  const titleElement = document.getElementById("model-title");
  const arButton = document.getElementById("custom-ar-button"); // Get the custom button

  const urlParams = new URLSearchParams(window.location.search);
  const modelId = urlParams.get("id");

  if (!modelId) {
    const errorMsg = "No model ID specified!";
    console.error(errorMsg);
    titleElement.textContent = errorMsg;
    alert(errorMsg);
    return;
  }

  try {
    const response = await fetch(`/api/models/${modelId}`);
    if (!response.ok) {
      throw new Error("Model not found");
    }
    const { model } = await response.json();

    titleElement.textContent = model.title || "Untitled";
    modelViewer.setAttribute("src", model.file_path);
    if (model.usdz_file_path) {
      modelViewer.setAttribute("ios-src", model.usdz_file_path);
    }
  } catch (error) {
    console.error("Failed to fetch model data:", error);
    const errorMsg = "Error: Model not found.";
    titleElement.textContent = errorMsg;
    alert(errorMsg);
  }
});
