/**
 * Media Library Page
 * Upload and manage media assets
 */

window.Media = {
  assets: [],
  total: 0,
  offset: 0,
  limit: 20,
  filters: {
    type: '',
    platform: '',
    search: ''
  },

  // Helper function for translations
  t(key, fallback) {
    return window.PortalI18n ? PortalI18n.t(key, fallback) : fallback || key;
  },

  async render(container) {
    const t = this.t.bind(this);
    container.innerHTML = `
      <div class="space-y-6">
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 class="text-2xl lg:text-3xl font-bold">${t('media.title', 'Media Library')}</h1>
            <p class="text-gray-400 mt-1">${t('media.subtitle', 'Upload and manage your images and videos')}</p>
          </div>
          <button id="upload-btn" class="px-4 py-2 bg-brandBlue hover:bg-sky-600 rounded-lg transition-colors flex items-center gap-2">
            <i data-lucide="upload-cloud" class="w-5 h-5"></i>
            ${t('media.uploadImages', 'Upload Images')}
          </button>
        </div>

        <!-- Upload Area (collapsible) -->
        <div id="upload-dropzone" class="hidden bg-slate-800/50 border-2 border-dashed border-slate-600 rounded-xl p-8 text-center cursor-pointer hover:border-brandBlue transition-colors">
          <input type="file" id="media-input" accept="image/*,video/*" multiple class="hidden">
          <i data-lucide="upload-cloud" class="w-16 h-16 mx-auto mb-4 text-gray-500"></i>
          <p class="text-lg font-medium mb-2">${t('media.dropFiles', 'Drop files here to upload')}</p>
          <p class="text-gray-400">${t('media.orBrowse', 'or')} <span class="text-brandBlue">${t('media.browse', 'browse')}</span> ${t('media.fromComputer', 'from your computer')}</p>
          <p class="text-xs text-gray-500 mt-2">${t('media.supportedFormats', 'Supports: JPG, PNG, GIF, WebP, MP4 (max 10MB)')}</p>
        </div>

        <!-- Upload Progress -->
        <div id="upload-progress" class="hidden bg-slate-800/50 rounded-xl p-4">
          <div class="flex items-center gap-4">
            <div class="loading-spinner"></div>
            <div class="flex-1">
              <p id="upload-status" class="font-medium">${t('media.uploading', 'Uploading...')}</p>
              <div class="w-full bg-slate-700 rounded-full h-2 mt-2">
                <div id="upload-bar" class="bg-brandBlue h-2 rounded-full transition-all" style="width: 0%"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Filters -->
        <div class="flex flex-wrap gap-3">
          <select id="filter-type" class="px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg focus:ring-2 focus:ring-brandBlue">
            <option value="">${t('media.allTypes', 'All Types')}</option>
            <option value="image">${t('media.images', 'Images')}</option>
            <option value="video">${t('media.videos', 'Videos')}</option>
          </select>
          <select id="filter-platform" class="px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg focus:ring-2 focus:ring-brandBlue">
            <option value="">${t('media.allPlatforms', 'All Platforms')}</option>
            <option value="instagram">Instagram</option>
            <option value="facebook">Facebook</option>
            <option value="linkedin">LinkedIn</option>
            <option value="twitter">Twitter/X</option>
            <option value="tiktok">TikTok</option>
          </select>
          <div class="flex-1 min-w-[200px]">
            <div class="relative">
              <i data-lucide="search" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"></i>
              <input type="text" id="filter-search" placeholder="${t('media.searchPlaceholder', 'Search by filename...')}"
                class="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-600 rounded-lg focus:ring-2 focus:ring-brandBlue">
            </div>
          </div>
          <button id="refresh-media" class="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors flex items-center gap-2">
            <i data-lucide="refresh-cw" class="w-4 h-4"></i>
            ${t('media.refresh', 'Refresh')}
          </button>
        </div>

        <!-- Stats -->
        <div id="media-stats" class="text-sm text-gray-400"></div>

        <!-- Media Grid -->
        <div id="media-grid" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <div class="col-span-full p-8 text-center">
            <div class="loading-spinner mx-auto"></div>
          </div>
        </div>

        <!-- Load More -->
        <div id="load-more-container" class="hidden text-center py-4">
          <button id="load-more-btn" class="px-6 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors">
            ${t('media.loadMore', 'Load More')}
          </button>
        </div>
      </div>

      <!-- Media Detail Modal -->
      <div id="media-modal" class="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 hidden">
        <div class="bg-slate-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-slate-700">
          <div class="flex items-center justify-between p-4 border-b border-slate-700">
            <h3 class="font-semibold">${t('media.details', 'Media Details')}</h3>
            <button id="close-media-modal" class="p-2 hover:bg-slate-700 rounded-lg">
              <i data-lucide="x" class="w-5 h-5"></i>
            </button>
          </div>
          <div id="media-modal-content" class="p-4">
            <!-- Content loaded dynamically -->
          </div>
        </div>
      </div>

      <!-- Edit Tags Modal -->
      <div id="edit-tags-modal" class="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 hidden">
        <div class="bg-slate-800 rounded-2xl max-w-md w-full border border-slate-700">
          <div class="flex items-center justify-between p-4 border-b border-slate-700">
            <h3 class="font-semibold">${t('media.editTags', 'Edit Tags')}</h3>
            <button id="close-tags-modal" class="p-2 hover:bg-slate-700 rounded-lg">
              <i data-lucide="x" class="w-5 h-5"></i>
            </button>
          </div>
          <div id="edit-tags-content" class="p-4">
            <!-- Content loaded dynamically -->
          </div>
        </div>
      </div>

      <!-- Delete Confirmation Modal -->
      <div id="delete-modal" class="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 hidden">
        <div class="bg-slate-800 rounded-2xl max-w-sm w-full border border-slate-700 p-6">
          <div class="text-center">
            <i data-lucide="trash-2" class="w-12 h-12 mx-auto mb-4 text-red-400"></i>
            <h3 class="text-lg font-semibold mb-2">${t('media.deleteMedia', 'Delete Media?')}</h3>
            <p class="text-gray-400 mb-6">${t('media.deleteWarning', 'This action cannot be undone. The image will be permanently deleted.')}</p>
            <div class="flex gap-3">
              <button id="cancel-delete" class="flex-1 py-2 px-4 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors">
                ${t('media.cancel', 'Cancel')}
              </button>
              <button id="confirm-delete" class="flex-1 py-2 px-4 bg-red-600 hover:bg-red-700 rounded-lg transition-colors">
                ${t('posts.delete', 'Delete')}
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    lucide.createIcons();
    this.bindEvents();
    await this.loadMedia(true);
  },

  bindEvents() {
    const dropzone = document.getElementById('upload-dropzone');
    const mediaInput = document.getElementById('media-input');
    const uploadBtn = document.getElementById('upload-btn');

    // Toggle upload area
    uploadBtn.addEventListener('click', () => {
      dropzone.classList.toggle('hidden');
    });

    // Upload dropzone
    dropzone.addEventListener('click', (e) => {
      if (e.target === dropzone || e.target.closest('#upload-dropzone')) {
        mediaInput.click();
      }
    });
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

    // Filters
    document.getElementById('filter-type').addEventListener('change', (e) => {
      this.filters.type = e.target.value;
      this.loadMedia(true);
    });
    document.getElementById('filter-platform').addEventListener('change', (e) => {
      this.filters.platform = e.target.value;
      this.loadMedia(true);
    });

    // Search with debounce
    let searchTimeout;
    document.getElementById('filter-search').addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        this.filters.search = e.target.value;
        this.loadMedia(true);
      }, 300);
    });

    // Refresh
    document.getElementById('refresh-media').addEventListener('click', () => {
      this.loadMedia(true);
    });

    // Load More
    document.getElementById('load-more-btn').addEventListener('click', () => {
      this.loadMedia(false);
    });

    // Modal close handlers
    const mediaModal = document.getElementById('media-modal');
    document.getElementById('close-media-modal').addEventListener('click', () => {
      mediaModal.classList.add('hidden');
    });
    mediaModal.addEventListener('click', (e) => {
      if (e.target === mediaModal) mediaModal.classList.add('hidden');
    });

    const tagsModal = document.getElementById('edit-tags-modal');
    document.getElementById('close-tags-modal').addEventListener('click', () => {
      tagsModal.classList.add('hidden');
    });
    tagsModal.addEventListener('click', (e) => {
      if (e.target === tagsModal) tagsModal.classList.add('hidden');
    });

    const deleteModal = document.getElementById('delete-modal');
    document.getElementById('cancel-delete').addEventListener('click', () => {
      deleteModal.classList.add('hidden');
    });
    deleteModal.addEventListener('click', (e) => {
      if (e.target === deleteModal) deleteModal.classList.add('hidden');
    });
  },

  async handleUpload(files) {
    const progress = document.getElementById('upload-progress');
    const progressBar = document.getElementById('upload-bar');
    const status = document.getElementById('upload-status');
    const dropzone = document.getElementById('upload-dropzone');

    dropzone.classList.add('hidden');
    progress.classList.remove('hidden');

    let uploaded = 0;
    const total = files.length;

    for (const file of files) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4'];
      if (!validTypes.includes(file.type)) {
        UI.toast(`${file.name}: Invalid file type`, 'error');
        continue;
      }

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

        // Save record to our database with dimensions from Cloudinary
        await API.saveMediaRecord({
          cloudinary_url: data.secure_url,
          cloudinary_public_id: data.public_id,
          filename: file.name,
          mime_type: file.type,
          size_bytes: data.bytes || file.size,
          width: data.width,
          height: data.height
        });

        uploaded++;
        progressBar.style.width = `${(uploaded / total) * 100}%`;

      } catch (error) {
        console.error('Upload error:', error);
        UI.toast(`Failed to upload ${file.name}`, 'error');
      }
    }

    progress.classList.add('hidden');
    progressBar.style.width = '0%';

    if (uploaded > 0) {
      UI.toast(`${uploaded} file(s) uploaded`, 'success');
      this.loadMedia(true);
    }
  },

  async loadMedia(reset = false) {
    const grid = document.getElementById('media-grid');
    const loadMoreContainer = document.getElementById('load-more-container');
    const stats = document.getElementById('media-stats');

    if (reset) {
      this.offset = 0;
      this.assets = [];
      grid.innerHTML = `
        <div class="col-span-full p-8 text-center">
          <div class="loading-spinner mx-auto"></div>
        </div>
      `;
    }

    try {
      const data = await API.listMedia({
        type: this.filters.type,
        platform: this.filters.platform,
        search: this.filters.search,
        limit: this.limit,
        offset: this.offset
      });

      this.total = data?.total || 0;
      const newAssets = data?.assets || [];

      if (reset) {
        this.assets = newAssets;
      } else {
        this.assets = [...this.assets, ...newAssets];
      }

      this.offset += newAssets.length;

      const t = this.t.bind(this);
      // Update stats
      stats.textContent = `${t('media.showing', 'Showing')} ${this.assets.length} ${t('media.of', 'of')} ${this.total} ${t('media.items', 'items')}`;

      // Show/hide load more
      if (this.assets.length < this.total) {
        loadMoreContainer.classList.remove('hidden');
      } else {
        loadMoreContainer.classList.add('hidden');
      }

      if (this.assets.length === 0) {
        grid.innerHTML = `
          <div class="col-span-full p-12 text-center text-gray-400">
            <i data-lucide="image" class="w-16 h-16 mx-auto mb-4 opacity-50"></i>
            <h3 class="text-lg font-medium mb-2">${t('media.noMedia', 'No media files')}</h3>
            <p class="text-sm">${t('media.uploadFirst', 'Upload your first image or video to get started')}</p>
          </div>
        `;
        lucide.createIcons();
        return;
      }

      grid.innerHTML = this.assets.map(asset => this.renderAssetCard(asset)).join('');
      lucide.createIcons();

      // Bind click events
      grid.querySelectorAll('.media-card').forEach(card => {
        card.addEventListener('click', (e) => {
          // Don't open modal if clicking delete button
          if (e.target.closest('.delete-asset-btn')) return;
          this.showMediaDetail(card.dataset.assetId);
        });
      });

      // Bind delete button events
      grid.querySelectorAll('.delete-asset-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.confirmDelete(btn.dataset.assetId);
        });
      });

    } catch (error) {
      console.error('Load media error:', error);
      const t = this.t.bind(this);
      grid.innerHTML = `
        <div class="col-span-full p-8 text-center text-red-400">
          <i data-lucide="alert-circle" class="w-12 h-12 mx-auto mb-3"></i>
          <p>${t('media.failedLoad', 'Failed to load media')}: ${error.message}</p>
        </div>
      `;
      lucide.createIcons();
    }
  },

  renderAssetCard(asset) {
    const isVideo = asset.mime_type?.startsWith('video');
    const thumbnailUrl = asset.thumbnail_url || asset.cloudinary_url;
    const dimensions = asset.width && asset.height ? `${asset.width}x${asset.height}` : '';
    const usedCount = asset.used_count || 0;

    return `
      <div class="media-card relative aspect-square rounded-xl overflow-hidden cursor-pointer group border border-slate-700 hover:border-brandBlue transition-colors" data-asset-id="${asset.asset_id}">
        ${isVideo ? `
          <video src="${asset.cloudinary_url}" class="w-full h-full object-cover" muted></video>
          <div class="absolute inset-0 flex items-center justify-center bg-black/30">
            <i data-lucide="play-circle" class="w-12 h-12 text-white"></i>
          </div>
        ` : `
          <img src="${thumbnailUrl}" alt="${asset.filename || 'Media'}" class="w-full h-full object-cover" loading="lazy">
        `}

        <!-- Hover overlay -->
        <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          <!-- Delete button -->
          <button class="delete-asset-btn absolute top-2 right-2 p-1.5 bg-red-600/80 hover:bg-red-600 rounded-lg transition-colors" data-asset-id="${asset.asset_id}">
            <i data-lucide="trash-2" class="w-4 h-4"></i>
          </button>

          <!-- Info at bottom -->
          <div class="absolute bottom-0 left-0 right-0 p-3">
            <p class="text-sm font-medium truncate text-white">${asset.filename || 'Untitled'}</p>
            <div class="flex items-center gap-2 text-xs text-gray-300 mt-1">
              ${dimensions ? `<span>${dimensions}</span>` : ''}
              ${usedCount > 0 ? `<span class="flex items-center gap-1"><i data-lucide="image" class="w-3 h-3"></i>${usedCount}x</span>` : ''}
            </div>
          </div>
        </div>

        <!-- Platform badges -->
        ${asset.suitable_platforms?.length ? `
          <div class="absolute top-2 left-2 flex gap-1">
            ${asset.suitable_platforms.slice(0, 3).map(p => {
              const platform = PortalConfig.getPlatformById(p);
              return platform ? `
                <div class="w-5 h-5 rounded flex items-center justify-center" style="background: ${platform.color}40">
                  <i data-lucide="${platform.icon}" class="w-3 h-3" style="color: ${platform.color}"></i>
                </div>
              ` : '';
            }).join('')}
          </div>
        ` : ''}
      </div>
    `;
  },

  showMediaDetail(assetId) {
    const asset = this.assets.find(a => a.asset_id === assetId);
    if (!asset) return;

    const modal = document.getElementById('media-modal');
    const content = document.getElementById('media-modal-content');
    const isVideo = asset.mime_type?.startsWith('video');

    const platforms = (asset.suitable_platforms || []).map(p => {
      const platform = PortalConfig.getPlatformById(p);
      return platform ? `
        <span class="inline-flex items-center gap-1 px-2 py-1 rounded text-xs" style="background: ${platform.color}20; color: ${platform.color}">
          <i data-lucide="${platform.icon}" class="w-3 h-3"></i>
          ${platform.name}
        </span>
      ` : '';
    }).join('');

    const tags = (asset.tags || []).map(tag =>
      `<span class="px-2 py-1 bg-slate-700 rounded text-xs">${tag}</span>`
    ).join('');

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
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm text-gray-400 mb-1">Type</label>
              <p>${asset.mime_type || 'Unknown'}</p>
            </div>
            <div>
              <label class="block text-sm text-gray-400 mb-1">Size</label>
              <p>${asset.size_bytes ? this.formatBytes(asset.size_bytes) : 'Unknown'}</p>
            </div>
          </div>
          ${asset.width && asset.height ? `
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm text-gray-400 mb-1">Dimensions</label>
                <p>${asset.width} x ${asset.height}</p>
              </div>
              <div>
                <label class="block text-sm text-gray-400 mb-1">Aspect Ratio</label>
                <p>${asset.aspect_ratio || 'N/A'}</p>
              </div>
            </div>
          ` : ''}
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm text-gray-400 mb-1">Used in Posts</label>
              <p>${asset.used_count || 0} times</p>
            </div>
            <div>
              <label class="block text-sm text-gray-400 mb-1">Uploaded</label>
              <p>${UI.formatDate(asset.created_at)}</p>
            </div>
          </div>
          ${platforms ? `
            <div>
              <label class="block text-sm text-gray-400 mb-2">Suitable Platforms</label>
              <div class="flex flex-wrap gap-2">${platforms}</div>
            </div>
          ` : ''}
          <div>
            <div class="flex items-center justify-between mb-2">
              <label class="text-sm text-gray-400">Tags</label>
              <button id="edit-tags-btn" class="text-xs text-brandBlue hover:text-sky-400" data-asset-id="${asset.asset_id}">
                Edit Tags
              </button>
            </div>
            <div class="flex flex-wrap gap-2">
              ${tags || '<span class="text-gray-500 text-sm">No tags</span>'}
            </div>
          </div>
          ${asset.notes ? `
            <div>
              <label class="block text-sm text-gray-400 mb-1">Notes</label>
              <p class="text-sm">${asset.notes}</p>
            </div>
          ` : ''}
          <div>
            <label class="block text-sm text-gray-400 mb-1">URL</label>
            <div class="flex gap-2">
              <input type="text" value="${asset.cloudinary_url}" readonly class="flex-1 px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-sm truncate">
              <button id="copy-url" class="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg" data-url="${asset.cloudinary_url}">
                <i data-lucide="copy" class="w-4 h-4"></i>
              </button>
            </div>
          </div>
          <div class="pt-4 grid grid-cols-3 gap-3">
            <a href="${asset.cloudinary_url}" target="_blank" class="py-2 px-4 bg-slate-700 hover:bg-slate-600 rounded-lg text-center transition-colors text-sm">
              Open Full
            </a>
            <a href="#/posts/new?media=${asset.asset_id}" class="py-2 px-4 bg-brandBlue hover:bg-sky-600 rounded-lg text-center transition-colors text-sm">
              Use in Post
            </a>
            <button id="delete-from-modal" class="py-2 px-4 bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded-lg transition-colors text-sm" data-asset-id="${asset.asset_id}">
              Delete
            </button>
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

    // Edit tags button
    content.querySelector('#edit-tags-btn').addEventListener('click', () => {
      modal.classList.add('hidden');
      this.showEditTags(assetId);
    });

    // Delete button
    content.querySelector('#delete-from-modal').addEventListener('click', () => {
      modal.classList.add('hidden');
      this.confirmDelete(assetId);
    });
  },

  showEditTags(assetId) {
    const asset = this.assets.find(a => a.asset_id === assetId);
    if (!asset) return;

    const modal = document.getElementById('edit-tags-modal');
    const content = document.getElementById('edit-tags-content');

    const currentTags = asset.tags || [];

    content.innerHTML = `
      <div class="space-y-4">
        <div>
          <label class="block text-sm text-gray-400 mb-2">Current Tags</label>
          <div id="current-tags" class="flex flex-wrap gap-2 min-h-[40px] p-2 bg-slate-900 rounded-lg border border-slate-600">
            ${currentTags.map(tag => `
              <span class="inline-flex items-center gap-1 px-2 py-1 bg-slate-700 rounded text-sm">
                ${tag}
                <button class="remove-tag text-gray-400 hover:text-red-400" data-tag="${tag}">
                  <i data-lucide="x" class="w-3 h-3"></i>
                </button>
              </span>
            `).join('') || '<span class="text-gray-500 text-sm">No tags</span>'}
          </div>
        </div>
        <div>
          <label class="block text-sm text-gray-400 mb-2">Add Tag</label>
          <div class="flex gap-2">
            <input type="text" id="new-tag-input" placeholder="Enter tag..." maxlength="50"
              class="flex-1 px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg focus:ring-2 focus:ring-brandBlue">
            <button id="add-tag-btn" class="px-4 py-2 bg-brandBlue hover:bg-sky-600 rounded-lg transition-colors">
              Add
            </button>
          </div>
          <p class="text-xs text-gray-500 mt-1">Max 10 tags, each up to 50 characters</p>
        </div>
        <div>
          <label class="block text-sm text-gray-400 mb-2">Notes</label>
          <textarea id="asset-notes" rows="3" maxlength="500" placeholder="Optional notes about this image..."
            class="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg focus:ring-2 focus:ring-brandBlue resize-none">${asset.notes || ''}</textarea>
        </div>
        <div class="flex gap-3 pt-2">
          <button id="cancel-edit-tags" class="flex-1 py-2 px-4 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors">
            Cancel
          </button>
          <button id="save-tags-btn" class="flex-1 py-2 px-4 bg-brandBlue hover:bg-sky-600 rounded-lg transition-colors" data-asset-id="${assetId}">
            Save Changes
          </button>
        </div>
      </div>
    `;

    lucide.createIcons();
    modal.classList.remove('hidden');

    // Store current tags locally
    let tags = [...currentTags];

    const renderTags = () => {
      const container = content.querySelector('#current-tags');
      container.innerHTML = tags.map(tag => `
        <span class="inline-flex items-center gap-1 px-2 py-1 bg-slate-700 rounded text-sm">
          ${tag}
          <button class="remove-tag text-gray-400 hover:text-red-400" data-tag="${tag}">
            <i data-lucide="x" class="w-3 h-3"></i>
          </button>
        </span>
      `).join('') || '<span class="text-gray-500 text-sm">No tags</span>';
      lucide.createIcons();

      // Rebind remove events
      container.querySelectorAll('.remove-tag').forEach(btn => {
        btn.addEventListener('click', () => {
          tags = tags.filter(t => t !== btn.dataset.tag);
          renderTags();
        });
      });
    };

    // Initial bind for remove buttons
    content.querySelectorAll('.remove-tag').forEach(btn => {
      btn.addEventListener('click', () => {
        tags = tags.filter(t => t !== btn.dataset.tag);
        renderTags();
      });
    });

    // Add tag
    const addTag = () => {
      const input = content.querySelector('#new-tag-input');
      const newTag = input.value.trim().toLowerCase();
      if (newTag && !tags.includes(newTag) && tags.length < 10) {
        tags.push(newTag);
        input.value = '';
        renderTags();
      } else if (tags.length >= 10) {
        UI.toast('Maximum 10 tags allowed', 'error');
      }
    };

    content.querySelector('#add-tag-btn').addEventListener('click', addTag);
    content.querySelector('#new-tag-input').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        addTag();
      }
    });

    // Cancel
    content.querySelector('#cancel-edit-tags').addEventListener('click', () => {
      modal.classList.add('hidden');
    });

    // Save
    content.querySelector('#save-tags-btn').addEventListener('click', async () => {
      const notes = content.querySelector('#asset-notes').value.trim();

      try {
        await API.updateMedia(assetId, { tags, notes });

        // Update local data
        const assetIndex = this.assets.findIndex(a => a.asset_id === assetId);
        if (assetIndex >= 0) {
          this.assets[assetIndex].tags = tags;
          this.assets[assetIndex].notes = notes;
        }

        modal.classList.add('hidden');
        UI.toast('Tags updated', 'success');
      } catch (error) {
        UI.toast(`Failed to save: ${error.message}`, 'error');
      }
    });
  },

  confirmDelete(assetId) {
    const modal = document.getElementById('delete-modal');
    modal.classList.remove('hidden');
    lucide.createIcons();

    // Remove any existing listener
    const confirmBtn = document.getElementById('confirm-delete');
    const newConfirmBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);

    newConfirmBtn.addEventListener('click', async () => {
      try {
        await API.deleteMedia(assetId);

        // Remove from local array
        this.assets = this.assets.filter(a => a.asset_id !== assetId);
        this.total--;

        // Update UI
        const card = document.querySelector(`[data-asset-id="${assetId}"]`);
        if (card) card.remove();

        document.getElementById('media-stats').textContent =
          `Showing ${this.assets.length} of ${this.total} items`;

        modal.classList.add('hidden');
        UI.toast('Media deleted', 'success');

        // If no more assets, reload
        if (this.assets.length === 0) {
          this.loadMedia(true);
        }
      } catch (error) {
        UI.toast(`Failed to delete: ${error.message}`, 'error');
      }
    });
  },

  formatBytes(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }
};
