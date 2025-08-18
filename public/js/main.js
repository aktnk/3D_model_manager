document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const modelsTableBody = document.querySelector('#models-table tbody');
    const newModelBtn = document.getElementById('new-model-btn');
    const newModelInput = document.getElementById('new-model-input');
    const updateModelInput = document.getElementById('update-model-input');
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const clearSearchBtn = document.getElementById('clear-search-btn');

    // --- Functions ---

    const fetchAndDisplayModels = async (searchTerm = '') => {
        try {
            let url = '/api/models';
            if (searchTerm) {
                url += `?search=${encodeURIComponent(searchTerm)}`;
            }
            const response = await fetch(url);
            const data = await response.json();

            modelsTableBody.innerHTML = ''; // Clear existing rows

            if (data.models && data.models.length > 0) {
                data.models.forEach(model => {
                    const row = document.createElement('tr');
                    const currentTitle = model.title || '';
                    const timeZoneOptions = { timeZone: 'Asia/Tokyo' };
                    const createdAt = new Date(model.created_at + 'Z').toLocaleString('ja-JP', timeZoneOptions);
                    const updatedAt = model.updated_at ? new Date(model.updated_at + 'Z').toLocaleString('ja-JP', timeZoneOptions) : 'N/A';

                    row.innerHTML = `
                        <td>${model.id}</td>
                        <td>${model.title || 'N/A'}</td>
                        <td>${model.original_name}</td>
                        <td>${createdAt}</td>
                        <td>${updatedAt}</td>
                        <td class="action-buttons">
                            <button class="view-btn btn btn-sm btn-info" data-id="${model.id}" data-path="${model.file_path}" data-title="${encodeURIComponent(currentTitle)}">表示</button>
                            <button class="model-update-btn btn btn-sm btn-warning" data-id="${model.id}">モデル更新</button>
                            <button class="title-update-btn btn btn-sm btn-secondary" data-id="${model.id}" data-title="${currentTitle}">タイトル更新</button>
                            <button class="delete-btn btn btn-sm btn-danger" data-id="${model.id}">削除</button>
                        </td>
                    `;
                    modelsTableBody.appendChild(row);
                });
            } else {
                modelsTableBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No models found.</td></tr>';
            }
        } catch (error) {
            console.error('Failed to fetch models:', error);
            modelsTableBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Error loading models.</td></tr>';
        }
    };

    const handleNewModelUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        const title = prompt('Please enter a title for the 3D model:');
        if (!title) {
            alert('Upload cancelled: Title is required.');
            event.target.value = null;
            return;
        }
        const formData = new FormData();
        formData.append('modelFile', file);
        formData.append('title', title);
        try {
            const response = await fetch('/api/models', { method: 'POST', body: formData });
            if (response.ok) {
                alert('Model uploaded successfully!');
                fetchAndDisplayModels();
            } else {
                const errorData = await response.json();
                alert(`Upload failed: ${errorData.error}`);
            }
        } catch (error) {
            console.error('Error uploading file:', error);
        }
        event.target.value = null;
    };

    const handleUpdateModelUpload = async (event) => {
        const modelId = event.target.dataset.modelIdForUpdate;
        const file = event.target.files[0];
        if (!file || !modelId) return;
        const formData = new FormData();
        formData.append('modelFile', file);
        try {
            const response = await fetch(`/api/models/${modelId}`, { method: 'POST', body: formData });
            if (response.ok) {
                alert('Model updated successfully!');
                fetchAndDisplayModels(searchInput.value.trim());
            } else {
                const errorData = await response.json();
                alert(`Update failed: ${errorData.error}`);
            }
        } catch (error) {
            console.error('Error updating file:', error);
        }
        event.target.value = null;
    };

    const handleTitleUpdate = async (modelId, currentTitle) => {
        const newTitle = prompt('Enter the new title:', currentTitle);
        if (newTitle === null || newTitle.trim() === '') return;
        try {
            const response = await fetch(`/api/models/${modelId}/title`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: newTitle })
            });
            if (response.ok) {
                alert('Title updated successfully!');
                fetchAndDisplayModels(searchInput.value.trim());
            } else {
                const errorData = await response.json();
                alert(`Title update failed: ${errorData.error}`);
            }
        } catch (error) {
            console.error('Error updating title:', error);
        }
    };

    const handleDeleteModel = async (modelId) => {
        if (!confirm(`Are you sure you want to delete model ${modelId}?`)) return;
        try {
            const response = await fetch(`/api/models/${modelId}`, { method: 'DELETE' });
            if (response.ok) {
                alert('Model deleted successfully!');
                fetchAndDisplayModels(searchInput.value.trim());
            } else {
                const errorData = await response.json();
                alert(`Deletion failed: ${errorData.error}`);
            }
        } catch (error) {
            console.error('Error deleting model:', error);
        }
    };

    // --- Event Listeners ---
    newModelBtn.addEventListener('click', () => newModelInput.click());
    newModelInput.addEventListener('change', handleNewModelUpload);
    updateModelInput.addEventListener('change', handleUpdateModelUpload);

    searchBtn.addEventListener('click', () => {
        fetchAndDisplayModels(searchInput.value.trim());
    });

    clearSearchBtn.addEventListener('click', () => {
        searchInput.value = '';
        fetchAndDisplayModels();
    });

    searchInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            fetchAndDisplayModels(searchInput.value.trim());
        }
    });

    modelsTableBody.addEventListener('click', (event) => {
        const target = event.target;
        const modelId = target.dataset.id;
        if (target.classList.contains('view-btn')) {
            const modelPath = target.dataset.path;
            const modelTitle = target.dataset.title;
            window.location.href = `/viewer.html?model=${encodeURIComponent(modelPath)}&title=${modelTitle}`;
        } else if (target.classList.contains('model-update-btn')) {
            updateModelInput.dataset.modelIdForUpdate = modelId;
            updateModelInput.click();
        } else if (target.classList.contains('title-update-btn')) {
            const currentTitle = target.dataset.title;
            handleTitleUpdate(modelId, currentTitle);
        } else if (target.classList.contains('delete-btn')) {
            handleDeleteModel(modelId);
        }
    });

    // --- Initial Load ---
    fetchAndDisplayModels();
});