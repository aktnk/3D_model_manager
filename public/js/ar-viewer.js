document.addEventListener('DOMContentLoaded', async () => {
    const modelViewer = document.getElementById('ar-viewer');
    const titleElement = document.getElementById('model-title');
    const arButton = document.getElementById('custom-ar-button'); // Get the custom button

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

        // Prepend a slash to make the path absolute from the root
        const glbPath = `/${model.file_path}`;
        modelViewer.src = glbPath;

        // Set ios-src only if usdz_path exists and is not null
        if (model.usdz_path) {
            const usdzPath = `/${model.usdz_path}`;
            modelViewer.iosSrc = usdzPath;
        }

        // Show the custom AR button and add click listener
        arButton.style.display = 'block';
        arButton.addEventListener('click', () => {
            try {
                modelViewer.activateAR();
            } catch (error) {
                console.error('Failed to activate AR:', error);
                alert('ARの起動に失敗しました。デバイスが対応していない可能性があります。');
            }
        });

    } catch (error) {
        console.error('Failed to load model:', error);
        titleElement.textContent = 'Error loading model';
        alert(error.message);
    }
});