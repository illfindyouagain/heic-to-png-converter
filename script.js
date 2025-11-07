import heic2any from 'heic2any';

const uploadZone = document.getElementById('uploadZone');
const fileInput = document.getElementById('fileInput');
const filesContainer = document.getElementById('filesContainer');

// Click to upload
uploadZone.addEventListener('click', () => {
    fileInput.click();
});

// Prevent default drag behaviors
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    uploadZone.addEventListener(eventName, preventDefaults, false);
    document.body.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

// Highlight drop zone when item is dragged over it
['dragenter', 'dragover'].forEach(eventName => {
    uploadZone.addEventListener(eventName, () => {
        uploadZone.classList.add('drag-over');
    }, false);
});

['dragleave', 'drop'].forEach(eventName => {
    uploadZone.addEventListener(eventName, () => {
        uploadZone.classList.remove('drag-over');
    }, false);
});

// Handle dropped files
uploadZone.addEventListener('drop', (e) => {
    const files = e.dataTransfer.files;
    handleFiles(files);
}, false);

// Handle selected files
fileInput.addEventListener('change', (e) => {
    handleFiles(e.target.files);
});

function handleFiles(files) {
    [...files].forEach(file => {
        if (file.type === 'image/heic' || file.type === 'image/heif' || 
            file.name.toLowerCase().endsWith('.heic') || 
            file.name.toLowerCase().endsWith('.heif')) {
            processFile(file);
        } else {
            alert(`${file.name} is not a HEIC file`);
        }
    });
}

function processFile(file) {
    const fileId = Date.now() + Math.random();
    const fileItem = createFileItem(file, fileId);
    filesContainer.appendChild(fileItem);
    
    convertToPNG(file, fileId);
}

function createFileItem(file, fileId) {
    const item = document.createElement('div');
    item.className = 'file-item';
    item.id = `file-${fileId}`;
    
    item.innerHTML = `
        <div class="file-icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
        </div>
        <div class="file-info">
            <div class="file-name">${file.name}</div>
            <div class="file-status converting">Converting...</div>
            <div class="progress-bar">
                <div class="progress-fill"></div>
            </div>
        </div>
        <div class="file-action">
            <div class="spinner"></div>
        </div>
    `;
    
    return item;
}

async function convertToPNG(file, fileId) {
    const fileItem = document.getElementById(`file-${fileId}`);
    const statusEl = fileItem.querySelector('.file-status');
    const progressFill = fileItem.querySelector('.progress-fill');
    const actionEl = fileItem.querySelector('.file-action');
    
    try {
        // Animate progress
        progressFill.style.width = '30%';
        
        // Convert HEIC to PNG
        const convertedBlob = await heic2any({
            blob: file,
            toType: 'image/png',
            quality: 1
        });
        
        progressFill.style.width = '100%';
        
        // Create download button
        const downloadBtn = document.createElement('button');
        downloadBtn.className = 'download-btn';
        downloadBtn.textContent = 'Download';
        downloadBtn.onclick = () => downloadFile(convertedBlob, file.name);
        
        actionEl.innerHTML = '';
        actionEl.appendChild(downloadBtn);
        
        statusEl.textContent = 'Ready to download';
        statusEl.className = 'file-status success';
        
    } catch (error) {
        console.error('Conversion error:', error);
        progressFill.style.width = '100%';
        progressFill.style.background = 'var(--error)';
        statusEl.textContent = 'Conversion failed';
        statusEl.className = 'file-status error';
        actionEl.innerHTML = '';
    }
}

function downloadFile(blob, originalName) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = originalName.replace(/\.(heic|heif)$/i, '.png');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
