const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const uploadBtn = document.getElementById('upload-btn');
const fileListContainer = document.getElementById('file-list-container');
const fileList = document.getElementById('file-list');

// Supported extensions for display logic (validation is done via accept attribute + JS check)
const SUPPORTED_EXTENSIONS = ['pdf', 'ppt', 'pptx', 'doc', 'docx', 'hwp', 'hwpx'];

// Drag & Drop Events
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, highlight, false);
});

['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, unhighlight, false);
});

function highlight(e) {
    dropZone.classList.add('dragover');
}

function unhighlight(e) {
    dropZone.classList.remove('dragover');
}

dropZone.addEventListener('drop', handleDrop, false);

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles(files);
}

// Button Click Events
uploadBtn.addEventListener('click', () => {
    fileInput.click();
});

fileInput.addEventListener('change', function () {
    handleFiles(this.files);
    // Reset input to allow selecting the same file again if needed
    this.value = '';
});

// Main File Handling
function handleFiles(files) {
    files = [...files];
    const validFiles = files.filter(file => {
        const ext = file.name.split('.').pop().toLowerCase();
        return SUPPORTED_EXTENSIONS.includes(ext);
    });

    if (validFiles.length > 0) {
        fileListContainer.style.display = 'block';
        validFiles.forEach(processFile);
    } // else maybe show a toast for invalid files? (Simplicity for now: just ignore)
}

function getIconClass(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    if (['pdf'].includes(ext)) return 'fa-file-pdf pdf';
    if (['ppt', 'pptx'].includes(ext)) return 'fa-file-powerpoint ppt';
    if (['doc', 'docx'].includes(ext)) return 'fa-file-word doc';
    if (['hwp', 'hwpx'].includes(ext)) return 'fa-file-lines hwp'; // using file-lines as generic doc for hwp
    return 'fa-file';
}

function processFile(file) {
    const li = document.createElement('li');
    li.className = 'file-item';

    // Create elements
    const iconClass = getIconClass(file.name);

    // File content template
    li.innerHTML = `
        <i class="fa-regular ${iconClass} file-icon"></i>
        <div class="file-info">
            <span class="file-name">${file.name}</span>
            <div class="progress-track">
                <div class="progress-bar" style="width: 0%"></div>
            </div>
        </div>
        <span class="status-text">0%</span>
        <button class="action-btn download-btn" title="Download Compressed File">
            <i class="fa-solid fa-download"></i>
        </button>
    `;

    fileList.appendChild(li);

    const progressBar = li.querySelector('.progress-bar');
    const statusText = li.querySelector('.status-text');
    const downloadBtn = li.querySelector('.download-btn');

    simulateCompression(file, progressBar, statusText, downloadBtn);
}

function simulateCompression(file, progressBar, statusText, downloadBtn) {
    let width = 0;
    // Random speed between 20ms and 60ms per tick for realism
    const intervalTime = Math.floor(Math.random() * 40) + 20;

    const interval = setInterval(() => {
        // Increment by random amount
        width += Math.random() * 5;

        if (width >= 100) {
            width = 100;
            clearInterval(interval);
            showComplete(file, progressBar, statusText, downloadBtn);
        }

        progressBar.style.width = width + '%';
        statusText.textContent = Math.floor(width) + '%';
    }, intervalTime);
}

function showComplete(file, progressBar, statusText, downloadBtn) {
    statusText.textContent = "Done";
    statusText.style.color = "var(--success-color)";

    downloadBtn.classList.add('active');

    // Setup download logic
    downloadBtn.onclick = () => {
        const compressedName = `compressed_${file.name}`;
        // Create a blob URL for the file (just the original file in this simulation)
        const url = URL.createObjectURL(file);

        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = compressedName;

        document.body.appendChild(a);
        a.click();

        // Small delay to ensure the download attribute is processed
        setTimeout(() => {
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        }, 100);
    };
}
