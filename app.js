// Drag & drop logic for #drop-area
const dropArea = document.getElementById('drop-area');
const fileInput = document.getElementById('save-file');

// Highlight drop area on dragover
['dragenter', 'dragover'].forEach(eventName => {
    dropArea.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropArea.classList.add('highlight');
    });
});

// Remove highlight on dragleave or drop
['dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropArea.classList.remove('highlight');
    });
});

function handleFileUpload(file) {
    // Hide drop-area, show editor-section
    dropArea.style.display = 'none';
    document.getElementById('editor-section').style.display = '';
    // Show filename
    document.getElementById('filename-label').textContent = file.name;
    // ...todo: code for processing file...
}

fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        handleFileUpload(file);
    }
});

// Handle file drop
dropArea.addEventListener('drop', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
        fileInput.files = files;
        fileInput.dispatchEvent(new Event('change'));
    }
});

// Optional: allow clicking drop-area to open file dialog
dropArea.addEventListener('click', () => {
    fileInput.click();
});