document.addEventListener('DOMContentLoaded', () => {
    const modelViewer = document.getElementById('ar-viewer');
    const titleElement = document.getElementById('model-title');

    const urlParams = new URLSearchParams(window.location.search);
    const modelPath = urlParams.get('model');
    const modelTitle = decodeURIComponent(urlParams.get('title') || 'Untitled');

    titleElement.textContent = modelTitle;

    if (modelPath) {
        modelViewer.setAttribute('src', modelPath);
    } else {
        const errorMsg = 'No model specified!';
        console.error('No model path specified in URL');
        titleElement.textContent = errorMsg;
        alert(errorMsg);
    }
});