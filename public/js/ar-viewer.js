document.addEventListener('DOMContentLoaded', async () => {
    const modelViewer = document.getElementById('ar-viewer');
    const titleElement = document.getElementById('model-title');

    const urlParams = new URLSearchParams(window.location.search);
    const modelId = urlParams.get('id');

    if (!modelId) {
        const errorMsg = 'No model ID specified!';
        console.error(errorMsg);
        titleElement.textContent = errorMsg;
        alert(errorMsg);
        return;
    }

    try {
        const response = await fetch(`/api/models/${modelId}`);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Model with ID ${modelId} not found.`);
        }
        const { model } = await response.json();

        titleElement.textContent = model.title || 'Untitled';
        modelViewer.src = model.file_path;

        // Set ios-src only if usdz_path exists and is not null
        if (model.usdz_path) {
            modelViewer.iosSrc = model.usdz_path;
        }

    } catch (error) {
        console.error('Failed to load model:', error);
        titleElement.textContent = 'Error loading model';
        alert(error.message);
    }
});
