/**
 * Media Library Page
 * Upload and manage media assets
 */

window.Media = {
  assets: [],
  
  async render(container) {
    container.innerHTML = `
      <div class="space-y-6">
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 class="text-2xl lg:text-3xl font-bold">Media Library</h1>
            <p class="text-gray-400 mt-1">Upload and manage your images and videos</p>
          </div>
        </div>
        
        <!-- Upload Area -->
        <div id="upload-dropzone" class="bg-slate-800/50 border-2 border-dashed border-slate-600 rounded-xl p-8 text-center cursor-pointer hover:border-brandBlue transition-colors">
          <input type="file" id="media-input" accept="image/*,video/*" multiple class="hidden">
          <i data-lucide="upload-cloud" class="w-16 h-16 mx-auto mb-4 text-gray-500"></i>
          <p class="text-lg font-medium mb-2">Drop files here to upload</p>
          <p class="text-gray-400">or <span class="text-brandBlue">browse</span> from your computer</p>
          <p class="text-xs text-gray-500 mt-2">Supports: JPG, PNG, GIF, MP4 (max 10MB)</p>
        </div>
        
        <!-- Upload Progress -->
        <div id="upload-progress" class="hidden bg-slate-800/50 rounded-xl p-4">
          <div class="flex items-center gap-4">
            <div class="loading-spinner"></div>
            <div class="flex-1">
              <p id="upload-status" class="font-medium">Uploading...</p>
              <div class="w-full bg-slate-700 rounded-full h-2 mt-2">
                <div id="upload-bar" class="bg-brandBlue h-2 rounded-full transition-all" style="width: 0%"></div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Filter -->
        <div class="flex gap-3">
          <select id="filter-type" class="px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg focus:ring-2 focus:ring-brandBlue">
            <option value="">All Types</option>
            <option value="image">Images</option>
            <option value="video">Videos</option>
          </select>
          <button id="refresh-media" class="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors flex items-center gap-2">
            <i data-lucide="refresh-cw" class="w-4 h-4"></i>
            Refresh
          </button>
        </div>
        
        <!-- Media Grid -->
        <div id="media-grid" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <div class="col-span-full p-8 text-center">
            <div class="loading-spinner mx-auto"></div>
          </div>
        </div>
      </div>
      
      <!-- Media Detail Modal -->
      <div id="media-modal" class="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 hidden">
        <div class="bg-slate-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden border border-slate-700">
          <div class="flex items-center justify-between p-4 border-b border-slate-700">
            <h3 class="font-semibold">Media Details</h3>
            <button id="close-media-modal" class="p-2 hover:bg-slate-700 rounded-lg">
              <i data-lucide="x" class="w-5 h-5"></i>
            </button>
          </div>
          <div id="media-modal-content" class="p-4">
            <!-- Content loaded dynamically -->
          </div>
        </div>
      </div>
    `;
    
    lucide.createIcons();
    this.bindEvents();
    await this.loadMedia();
  },
  
  bindEvents() {
    const dropzone = document.getElementById('upload-dropzone');
    const mediaInput = document.getElementById('media-input');
    
    // Upload dropzone
    dropzone.addEventListener('click', () => mediaInput.click());
    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.classList.add('border-brandBlue', 'bg-brandBlue/5');
    });
    dropzone.addEventListener('dragleave', () => {
      dropzone.classList.remove('border-brandBlue', 'bg-brandBlue/5');
    });
    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('border-brandBlue', 'bg-brandBlue/5');
      this.handleUpload(e.dataTransfer.files);
    });
    mediaInput.addEventListener('change', () => {
      this.handleUpload(mediaInput.files);
      mediaInput.value = '';
    });
    
    // Filter
    document.getElementById('filter-type').addEventListener('change', () => {
      this.loadMedia();
    });
    
    // Refresh
    document.getElementById('refresh-media').addEventListener('click', () => {
      this.loadMedia();
    });
    
    // Modal close
    const modal = document.getElementById('media-modal');
    document.getElementById('close-media-modal').addEventListener('click', () => {
      modal.classList.add('hidden');
    });
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.add('hidden');
    });
  },
  
  async handleUpload(files) {
    const progress = document.getElementById('upload-progress');
    const progressBar = document.getElementById('upload-bar');
    const status = document.getElementById('upload-status');
    
    progress.classList.remove('hidden');
    
    let uploaded = 0;
    const total = files.length;
    
    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) {
        UI.toast(`${file.name} is too large (max 10MB)`, 'error');
        continue;
      }
      
      status.textContent = `Uploading ${file.name}...`;
      
      try {
        // Upload to Cloudinary
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', PortalConfig.CLOUDINARY_UPLOAD_PRESET);
        
        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${PortalConfig.CLOUDINARY_CLOUD_NAME}/auto/upload`,
          { method: 'POST', body: formData }
        );
        
        if (!response.ok) throw new Error('Upload failed');
        
        const data = await response.json();
        
        // Save record to our database
        await API.saveMediaRecord({
          cloudinary_url: data.secure_url,
          cloudinary_public_id: data.public_id,
          filename: file.name,
          mime_type: file.type,
          size_bytes: file.size
        });
        
        uploaded++;
        progressBar.style.width = `${(uploaded / total) * 100}%`;
        
      } catch (error) {
        UI.toast(`Failed to upload ${file.name}`, 'error');
      }
    }
    
    progress.classList.add('hidden');
    progressBar.style.width = '0%';
    
    if (uploaded > 0) {
      UI.toast(`${uploaded} file(s) uploaded`, 'success');
      this.loadMedia();
    }
  },
  
  async loadMedia() {
    const grid = document.getElementById('media-grid');
    const filterType = document.getElementById('filter-type').value;
    
    grid.innerHTML = `
      <div class="col-span-full p-8 text-center">
        <div class="loading-spinner mx-auto"></div>
      </div>
    `;
    
    try {
      const data = await API.listMedia({ type: filterType });
      this.assets = data?.assets || [];
      
      if (this.assets.length === 0) {
        grid.innerHTML = `
          <div class="col-span-full p-12 text-center text-gray-400">
            <i data-lucide="image" class="w-16 h-16 mx-auto mb-4 opacity-50"></i>
            <h3 class="text-lg font-medium mb-2">No media files</h3>
            <p class="text-sm">Upload your first image or video to get started</p>
          </div>
        `;
        lucide.createIcons();
        return;
      }
      
      grid.innerHTML = this.assets.map(asset => this.renderAssetCard(asset)).join('');
      lucide.createIcons();
      
      // Bind click events
      grid.querySelectorAll('.media-card').forEach(card => {
        card.addEventListener('click', () => {
          this.showMediaDetail(card.dataset.assetId);
        });
      });
      
    } catch (error) {
      grid.innerHTML = `
        <div class="col-span-full p-8 text-center text-red-400">
          <i data-lucide="alert-circle" class="w-12 h-12 mx-auto mb-3"></i>
          <p>Failed to load media: ${error.message}</p>
        </div>
      `;
      lucide.createIcons();
    }
  },
  
  renderAssetCard(asset) {
    const isVideo = asset.mime_type?.startsWith('video');
    
    return `
      <div class="media-card relative aspect-square rounded-xl overflow-hidden cursor-pointer group border border-slate-700 hover:border-brandBlue transition-colors" data-asset-id="${asset.asset_id}">
        ${isVideo ? `
          <video src="${asset.cloudinary_url}" class="w-full h-full object-cover"></video>
          <div class="absolute inset-0 flex items-center justify-center bg-black/30">
            <i data-lucide="play-circle" class="w-12 h-12 text-white"></i>
          </div>
        ` : `
          <img src="${asset.cloudinary_url}" alt="${asset.filename || 'Media'}" class="w-full h-full object-cover">
        `}
        <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
          <p class="text-sm truncate text-white">${asset.filename || 'Untitled'}</p>
        </div>
      </div>
    `;
  },
  
  showMediaDetail(assetId) {
    const asset = this.assets.find(a => a.asset_id === assetId);
    if (!asset) return;
    
    const modal = document.getElementById('media-modal');
    const content = document.getElementById('media-modal-content');
    const isVideo = asset.mime_type?.startsWith('video');
    
    content.innerHTML = `
      <div class="grid md:grid-cols-2 gap-6">
        <div class="aspect-square rounded-xl overflow-hidden bg-slate-900">
          ${isVideo ? `
            <video src="${asset.cloudinary_url}" controls class="w-full h-full object-contain"></video>
          ` : `
            <img src="${asset.cloudinary_url}" alt="${asset.filename || 'Media'}" class="w-full h-full object-contain">
          `}
        </div>
        <div class="space-y-4">
          <div>
            <label class="block text-sm text-gray-400 mb-1">Filename</label>
            <p class="font-medium">${asset.filename || 'Untitled'}</p>
          </div>
          <div>
            <label class="block text-sm text-gray-400 mb-1">Type</label>
            <p>${asset.mime_type || 'Unknown'}</p>
          </div>
          <div>
            <label class="block text-sm text-gray-400 mb-1">Size</label>
            <p>${asset.size_bytes ? this.formatBytes(asset.size_bytes) : 'Unknown'}</p>
          </div>
          <div>
            <label class="block text-sm text-gray-400 mb-1">Uploaded</label>
            <p>${UI.formatDate(asset.created_at)}</p>
          </div>
          <div>
            <label class="block text-sm text-gray-400 mb-1">URL</label>
            <div class="flex gap-2">
              <input type="text" value="${asset.cloudinary_url}" readonly class="flex-1 px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-sm truncate">
              <button id="copy-url" class="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg" data-url="${asset.cloudinary_url}">
                <i data-lucide="copy" class="w-4 h-4"></i>
              </button>
            </div>
          </div>
          <div class="pt-4 flex gap-3">
            <a href="${asset.cloudinary_url}" target="_blank" class="flex-1 py-2 px-4 bg-brandBlue hover:bg-sky-600 rounded-lg text-center transition-colors">
              Open Original
            </a>
            <a href="#/posts/new?media=${encodeURIComponent(asset.cloudinary_url)}" class="flex-1 py-2 px-4 bg-slate-700 hover:bg-slate-600 rounded-lg text-center transition-colors">
              Use in Post
            </a>
          </div>
        </div>
      </div>
    `;
    
    lucide.createIcons();
    modal.classList.remove('hidden');
    
    // Copy URL button
    content.querySelector('#copy-url').addEventListener('click', (e) => {
      navigator.clipboard.writeText(e.currentTarget.dataset.url);
      UI.toast('URL copied!', 'success');
    });
  },
  
  formatBytes(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }
};
