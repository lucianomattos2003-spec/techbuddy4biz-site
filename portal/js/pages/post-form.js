/**
 * Post Form Page
 * Create or edit a single post with carousel support
 */

window.PostForm = {
  post: null,
  isEdit: false,
  mediaUrls: [],
  currentPostType: 'single_image',
  carouselPreviewIndex: 0,
  draggedItem: null,
  
  async render(container, params) {
    this.isEdit = !!params?.id;
    this.post = null;
    this.mediaUrls = [];
    this.currentPostType = 'single_image';
    this.carouselPreviewIndex = 0;
    
    // Load existing post if editing
    if (this.isEdit) {
      try {
        this.post = await API.getPost(params.id);
        this.mediaUrls = this.post.media_urls || [];
        this.currentPostType = this.post.post_type || 'single_image';
      } catch (error) {
        container.innerHTML = `
          <div class="text-center py-20">
            <div class="text-red-400 mb-4">
              <i data-lucide="alert-circle" class="w-12 h-12 mx-auto"></i>
            </div>
            <h2 class="text-xl font-semibold mb-2">Post not found</h2>
            <a href="#/posts" class="text-brandBlue hover:underline">Back to posts</a>
          </div>
        `;
        lucide.createIcons();
        return;
      }
    }
    
    const canEdit = !this.post || !['posted', 'publishing', 'cancelled'].includes(this.post.status);
    
    // Get default scheduled time (tomorrow at 9am)
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 1);
    defaultDate.setHours(9, 0, 0, 0);
    const defaultDateStr = defaultDate.toISOString().slice(0, 16);
    
    container.innerHTML = `
      <div class="max-w-3xl mx-auto">
        <!-- Header -->
        <div class="mb-8">
          <a href="#/posts" class="text-gray-400 hover:text-white flex items-center gap-2 mb-4">
            <i data-lucide="arrow-left" class="w-4 h-4"></i>
            Back to posts
          </a>
          <h1 class="text-2xl lg:text-3xl font-bold">
            ${this.isEdit ? (canEdit ? 'Edit Post' : 'View Post') : 'Create New Post'}
          </h1>
        </div>
        
        <form id="post-form" class="space-y-6">
          <!-- Post Type Selector -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Post Type *</label>
            <div class="grid grid-cols-3 gap-3">
              <label class="relative">
                <input type="radio" name="post_type" value="single_image" ${this.currentPostType === 'single_image' ? 'checked' : ''} ${!canEdit ? 'disabled' : ''} class="peer sr-only post-type-radio">
                <div class="p-4 rounded-lg border border-slate-600 cursor-pointer hover:border-slate-500 peer-checked:border-brandBlue peer-checked:bg-brandBlue/10 transition-all text-center ${!canEdit ? 'opacity-50 cursor-not-allowed' : ''}">
                  <i data-lucide="image" class="w-8 h-8 mx-auto mb-2 text-gray-400"></i>
                  <span class="text-sm font-medium">Single Image</span>
                  <p class="text-xs text-gray-500 mt-1">One image or video</p>
                </div>
              </label>
              <label class="relative">
                <input type="radio" name="post_type" value="carousel" ${this.currentPostType === 'carousel' ? 'checked' : ''} ${!canEdit ? 'disabled' : ''} class="peer sr-only post-type-radio">
                <div class="p-4 rounded-lg border border-slate-600 cursor-pointer hover:border-slate-500 peer-checked:border-purple-500 peer-checked:bg-purple-500/10 transition-all text-center ${!canEdit ? 'opacity-50 cursor-not-allowed' : ''}">
                  <i data-lucide="layers" class="w-8 h-8 mx-auto mb-2 text-purple-400"></i>
                  <span class="text-sm font-medium">Carousel</span>
                  <p class="text-xs text-gray-500 mt-1">2-10 images/videos</p>
                </div>
              </label>
              <label class="relative">
                <input type="radio" name="post_type" value="video" ${this.currentPostType === 'video' ? 'checked' : ''} ${!canEdit ? 'disabled' : ''} class="peer sr-only post-type-radio">
                <div class="p-4 rounded-lg border border-slate-600 cursor-pointer hover:border-slate-500 peer-checked:border-pink-500 peer-checked:bg-pink-500/10 transition-all text-center ${!canEdit ? 'opacity-50 cursor-not-allowed' : ''}">
                  <i data-lucide="video" class="w-8 h-8 mx-auto mb-2 text-pink-400"></i>
                  <span class="text-sm font-medium">Video/Reel</span>
                  <p class="text-xs text-gray-500 mt-1">Single video clip</p>
                </div>
              </label>
            </div>
          </div>
          
          <!-- Platform -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Platform *</label>
            <div class="grid grid-cols-2 sm:grid-cols-5 gap-3">
              ${PortalConfig.getEnabledPlatforms().map(p => `
                <label class="relative">
                  <input type="radio" name="platform" value="${p.id}" ${this.post?.platform === p.id ? 'checked' : ''} ${!canEdit ? 'disabled' : ''} class="peer sr-only">
                  <div class="p-3 rounded-lg border border-slate-600 cursor-pointer hover:border-slate-500 peer-checked:border-brandBlue peer-checked:bg-brandBlue/10 transition-all text-center ${!canEdit ? 'opacity-50 cursor-not-allowed' : ''}">
                    <i data-lucide="${p.icon}" class="w-6 h-6 mx-auto mb-1" style="color: ${p.color}"></i>
                    <span class="text-sm">${p.name}</span>
                  </div>
                </label>
              `).join('')}
            </div>
          </div>
          
          <!-- Subject -->
          <div>
            <label for="subject" class="block text-sm font-medium text-gray-300 mb-2">Subject / Title</label>
            <input 
              type="text" 
              id="subject" 
              name="subject"
              value="${this.post?.subject || ''}"
              placeholder="e.g., Monday Motivation"
              ${!canEdit ? 'disabled' : ''}
              class="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg focus:ring-2 focus:ring-brandBlue focus:border-transparent transition-all disabled:opacity-50"
            >
          </div>
          
          <!-- Caption -->
          <div>
            <label for="caption" class="block text-sm font-medium text-gray-300 mb-2">Caption *</label>
            <textarea 
              id="caption" 
              name="caption"
              rows="4"
              required
              placeholder="Write your post caption..."
              ${!canEdit ? 'disabled' : ''}
              class="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg focus:ring-2 focus:ring-brandBlue focus:border-transparent transition-all resize-none disabled:opacity-50"
            >${this.post?.caption || ''}</textarea>
            <div class="flex justify-between mt-1 text-xs text-gray-500">
              <span>Include hashtags for better reach</span>
              <span id="char-count">0 / 2200</span>
            </div>
          </div>
          
          <!-- Media Upload / Carousel Builder -->
          <div id="media-section">
            <div class="flex items-center justify-between mb-2">
              <label class="block text-sm font-medium text-gray-300">
                Media <span id="media-count-badge" class="text-xs bg-slate-700 px-2 py-0.5 rounded ml-2">${this.mediaUrls.length} / <span id="media-max">1</span></span>
              </label>
              <span id="carousel-hint" class="text-xs text-purple-400 hidden">
                <i data-lucide="info" class="w-3 h-3 inline"></i> Drag to reorder slides
              </span>
            </div>
            
            <!-- Carousel Preview (shown when carousel type selected with 2+ images) -->
            <div id="carousel-preview-container" class="hidden mb-4">
              <div class="bg-slate-800 rounded-xl overflow-hidden">
                <div class="relative aspect-square">
                  <div id="carousel-preview-slides" class="w-full h-full">
                    <!-- Slides rendered dynamically -->
                  </div>
                  <!-- Navigation arrows -->
                  <button type="button" id="carousel-prev-btn" class="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-colors z-10">
                    <i data-lucide="chevron-left" class="w-6 h-6"></i>
                  </button>
                  <button type="button" id="carousel-next-btn" class="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-colors z-10">
                    <i data-lucide="chevron-right" class="w-6 h-6"></i>
                  </button>
                  <!-- Slide counter -->
                  <div class="absolute top-3 right-3 bg-black/60 px-3 py-1 rounded-full text-sm font-medium">
                    <span id="carousel-slide-num">1</span> / <span id="carousel-slide-total">0</span>
                  </div>
                </div>
                <!-- Dot indicators -->
                <div id="carousel-dots" class="flex justify-center gap-1.5 py-3 bg-slate-900/50">
                  <!-- Dots rendered dynamically -->
                </div>
              </div>
            </div>
            
            <!-- Media Grid (draggable for carousel) -->
            <div id="media-preview" class="grid grid-cols-4 sm:grid-cols-5 gap-2 mb-3">
              ${this.renderMediaItems(canEdit)}
            </div>
            
            ${canEdit ? `
              <div id="upload-dropzone" class="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center cursor-pointer hover:border-brandBlue transition-colors">
                <input type="file" id="media-input" accept="image/*,video/*" multiple class="hidden">
                <i data-lucide="upload-cloud" class="w-10 h-10 mx-auto mb-2 text-gray-500"></i>
                <p class="text-gray-400 text-sm">Drag & drop or <span class="text-brandBlue">browse</span></p>
                <p class="text-xs text-gray-500 mt-1">JPG, PNG, GIF, MP4 • Max 10MB each</p>
              </div>
              <div id="upload-progress" class="hidden mt-3">
                <div class="flex items-center gap-3">
                  <div class="loading-spinner"></div>
                  <span class="text-sm text-gray-400">Uploading...</span>
                </div>
              </div>
              <p id="media-error" class="text-red-400 text-sm mt-2 hidden"></p>
            ` : ''}
          </div>
          
          <!-- Schedule -->
          <div>
            <label for="scheduled-at" class="block text-sm font-medium text-gray-300 mb-2">Schedule for *</label>
            <input 
              type="datetime-local" 
              id="scheduled-at" 
              name="scheduled_at"
              required
              value="${this.post?.scheduled_at ? this.post.scheduled_at.slice(0, 16) : defaultDateStr}"
              ${!canEdit ? 'disabled' : ''}
              class="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg focus:ring-2 focus:ring-brandBlue focus:border-transparent disabled:opacity-50"
            >
          </div>
          
          ${this.post ? `
            <!-- Status Info (Edit mode only) -->
            <div class="bg-slate-800 rounded-lg p-4 space-y-2">
              <div class="flex justify-between">
                <span class="text-gray-400">Status:</span>
                ${UI.statusBadge(this.post.status)}
              </div>
              <div class="flex justify-between">
                <span class="text-gray-400">Approval:</span>
                ${UI.statusBadge(this.post.approval_status)}
              </div>
              <div class="flex justify-between">
                <span class="text-gray-400">Created:</span>
                <span>${UI.formatDate(this.post.created_at)}</span>
              </div>
            </div>
          ` : ''}
          
          <!-- Actions -->
          ${canEdit ? `
            <div class="flex gap-3 pt-4">
              <button type="submit" id="submit-btn" class="flex-1 py-3 px-4 bg-brandBlue hover:bg-sky-600 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2">
                <i data-lucide="${this.isEdit ? 'save' : 'send'}" class="w-5 h-5"></i>
                ${this.isEdit ? 'Save Changes' : 'Schedule Post'}
              </button>
              <a href="#/posts" class="py-3 px-6 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors">
                Cancel
              </a>
            </div>
          ` : `
            <div class="pt-4">
              <a href="#/posts" class="block text-center py-3 px-6 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors">
                Back to Posts
              </a>
            </div>
          `}
        </form>
      </div>
    `;
    
    lucide.createIcons();
    this.bindEvents(canEdit);
    this.updateUIForPostType();
  },
  
  // Render media items for the grid
  renderMediaItems(canEdit) {
    return this.mediaUrls.map((m, i) => `
      <div class="media-item relative aspect-square group ${canEdit && this.currentPostType === 'carousel' ? 'cursor-grab' : ''}" 
           draggable="${canEdit && this.currentPostType === 'carousel'}" 
           data-index="${i}">
        ${m.type === 'video' ? `
          <video src="${m.url}" class="w-full h-full object-cover rounded-lg"></video>
          <div class="absolute inset-0 flex items-center justify-center">
            <div class="w-8 h-8 bg-black/50 rounded-full flex items-center justify-center">
              <i data-lucide="play" class="w-4 h-4"></i>
            </div>
          </div>
        ` : `
          <img src="${m.url}" class="w-full h-full object-cover rounded-lg" alt="Slide ${i + 1}">
        `}
        <div class="absolute bottom-1 left-1 bg-black/60 text-xs px-1.5 py-0.5 rounded">${i + 1}</div>
        ${canEdit ? `
          <button type="button" class="remove-media absolute top-1 right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity" data-index="${i}">
            <i data-lucide="x" class="w-4 h-4"></i>
          </button>
        ` : ''}
      </div>
    `).join('');
  },
  
  bindEvents(canEdit) {
    const form = document.getElementById('post-form');
    const caption = document.getElementById('caption');
    const charCount = document.getElementById('char-count');
    
    // Character count
    const updateCharCount = () => {
      const len = caption.value.length;
      charCount.textContent = `${len} / 2200`;
      charCount.classList.toggle('text-red-400', len > 2200);
    };
    caption.addEventListener('input', updateCharCount);
    updateCharCount();
    
    if (!canEdit) return;
    
    // Track unsaved changes
    const trackChanges = () => {
      UI.setUnsavedChanges(true);
    };
    form.querySelectorAll('input, textarea, select').forEach(input => {
      input.addEventListener('input', trackChanges);
      input.addEventListener('change', trackChanges);
    });
    
    // Post type change
    document.querySelectorAll('.post-type-radio').forEach(radio => {
      radio.addEventListener('change', (e) => {
        this.currentPostType = e.target.value;
        this.updateUIForPostType();
        this.updateMediaPreview();
      });
    });
    
    // Media upload
    const dropzone = document.getElementById('upload-dropzone');
    const mediaInput = document.getElementById('media-input');
    
    if (dropzone) {
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
        // Check if this is a file drop (not a reorder drag)
        if (e.dataTransfer.files.length > 0) {
          this.handleFiles(e.dataTransfer.files);
        }
      });
      
      mediaInput.addEventListener('change', () => {
        this.handleFiles(mediaInput.files);
      });
    }
    
    // Carousel preview navigation
    document.getElementById('carousel-prev-btn')?.addEventListener('click', () => this.navigateCarousel(-1));
    document.getElementById('carousel-next-btn')?.addEventListener('click', () => this.navigateCarousel(1));
    
    // Remove media buttons
    this.bindRemoveButtons();
    
    // Drag and drop for reordering (carousel)
    this.bindDragEvents();
    
    // Form submit
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.submitForm();
    });
  },
  
  bindRemoveButtons() {
    document.querySelectorAll('.remove-media').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const index = parseInt(btn.dataset.index);
        this.mediaUrls.splice(index, 1);
        this.updateMediaPreview();
      });
    });
  },
  
  bindDragEvents() {
    const items = document.querySelectorAll('.media-item[draggable="true"]');
    
    items.forEach(item => {
      item.addEventListener('dragstart', (e) => {
        this.draggedItem = item;
        item.classList.add('opacity-50');
        e.dataTransfer.effectAllowed = 'move';
      });
      
      item.addEventListener('dragend', () => {
        this.draggedItem?.classList.remove('opacity-50');
        this.draggedItem = null;
        document.querySelectorAll('.media-item').forEach(i => i.classList.remove('ring-2', 'ring-purple-500'));
      });
      
      item.addEventListener('dragover', (e) => {
        e.preventDefault();
        if (this.draggedItem && this.draggedItem !== item) {
          item.classList.add('ring-2', 'ring-purple-500');
        }
      });
      
      item.addEventListener('dragleave', () => {
        item.classList.remove('ring-2', 'ring-purple-500');
      });
      
      item.addEventListener('drop', (e) => {
        e.preventDefault();
        item.classList.remove('ring-2', 'ring-purple-500');
        
        if (this.draggedItem && this.draggedItem !== item) {
          const fromIndex = parseInt(this.draggedItem.dataset.index);
          const toIndex = parseInt(item.dataset.index);
          
          // Reorder the array
          const [moved] = this.mediaUrls.splice(fromIndex, 1);
          this.mediaUrls.splice(toIndex, 0, moved);
          
          // Update positions
          this.mediaUrls.forEach((m, i) => m.position = i + 1);
          
          this.updateMediaPreview();
          UI.setUnsavedChanges(true);
        }
      });
    });
  },
  
  updateUIForPostType() {
    const maxEl = document.getElementById('media-max');
    const hintEl = document.getElementById('carousel-hint');
    const previewContainer = document.getElementById('carousel-preview-container');
    
    switch (this.currentPostType) {
      case 'carousel':
        maxEl.textContent = '10';
        hintEl?.classList.remove('hidden');
        break;
      case 'video':
        maxEl.textContent = '1';
        hintEl?.classList.add('hidden');
        previewContainer?.classList.add('hidden');
        break;
      default: // single_image
        maxEl.textContent = '1';
        hintEl?.classList.add('hidden');
        previewContainer?.classList.add('hidden');
    }
    
    this.updateCarouselPreview();
  },
  
  navigateCarousel(direction) {
    const newIndex = this.carouselPreviewIndex + direction;
    if (newIndex >= 0 && newIndex < this.mediaUrls.length) {
      this.carouselPreviewIndex = newIndex;
      this.updateCarouselPreview();
    }
  },
  
  updateCarouselPreview() {
    const container = document.getElementById('carousel-preview-container');
    const slidesEl = document.getElementById('carousel-preview-slides');
    const dotsEl = document.getElementById('carousel-dots');
    const slideNum = document.getElementById('carousel-slide-num');
    const slideTotal = document.getElementById('carousel-slide-total');
    
    // Show carousel preview only for carousel type with 2+ images
    const showPreview = this.currentPostType === 'carousel' && this.mediaUrls.length >= 2;
    container?.classList.toggle('hidden', !showPreview);
    
    if (!showPreview || !slidesEl) return;
    
    // Clamp index
    if (this.carouselPreviewIndex >= this.mediaUrls.length) {
      this.carouselPreviewIndex = this.mediaUrls.length - 1;
    }
    if (this.carouselPreviewIndex < 0) this.carouselPreviewIndex = 0;
    
    const current = this.mediaUrls[this.carouselPreviewIndex];
    
    // Update slide
    slidesEl.innerHTML = current.type === 'video' 
      ? `<video src="${current.url}" class="w-full h-full object-cover" controls></video>`
      : `<img src="${current.url}" class="w-full h-full object-cover" alt="Preview">`;
    
    // Update counter
    slideNum.textContent = this.carouselPreviewIndex + 1;
    slideTotal.textContent = this.mediaUrls.length;
    
    // Update dots
    dotsEl.innerHTML = this.mediaUrls.map((_, i) => `
      <button type="button" class="carousel-dot w-2 h-2 rounded-full transition-all ${i === this.carouselPreviewIndex ? 'bg-white w-4' : 'bg-white/40 hover:bg-white/60'}" data-index="${i}"></button>
    `).join('');
    
    // Bind dot clicks
    dotsEl.querySelectorAll('.carousel-dot').forEach(dot => {
      dot.addEventListener('click', () => {
        this.carouselPreviewIndex = parseInt(dot.dataset.index);
        this.updateCarouselPreview();
      });
    });
  },
  
  async handleFiles(files) {
    const progress = document.getElementById('upload-progress');
    const errorEl = document.getElementById('media-error');
    errorEl?.classList.add('hidden');
    
    // Check max files limit
    const maxFiles = this.currentPostType === 'carousel' ? 10 : 1;
    const remainingSlots = maxFiles - this.mediaUrls.length;
    
    if (remainingSlots <= 0) {
      const msg = this.currentPostType === 'carousel' 
        ? 'Maximum 10 images for carousel' 
        : 'Only 1 media file allowed for this post type';
      if (errorEl) {
        errorEl.textContent = msg;
        errorEl.classList.remove('hidden');
      }
      UI.toast(msg, 'error');
      return;
    }
    
    const filesToUpload = Array.from(files).slice(0, remainingSlots);
    
    progress?.classList.remove('hidden');
    
    for (const file of filesToUpload) {
      if (file.size > 10 * 1024 * 1024) {
        UI.toast(`File ${file.name} is too large (max 10MB)`, 'error');
        continue;
      }
      
      // Check file type based on post type
      const isVideo = file.type.startsWith('video');
      if (this.currentPostType === 'single_image' && isVideo) {
        UI.toast('Select "Video/Reel" post type for videos', 'warning');
        continue;
      }
      
      try {
        const url = await this.uploadToCloudinary(file);
        this.mediaUrls.push({
          url,
          type: isVideo ? 'video' : 'image',
          position: this.mediaUrls.length + 1
        });
      } catch (error) {
        UI.toast(`Failed to upload ${file.name}`, 'error');
      }
    }
    
    progress?.classList.add('hidden');
    this.updateMediaPreview();
  },
  
  async uploadToCloudinary(file) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', PortalConfig.CLOUDINARY_UPLOAD_PRESET);
    
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${PortalConfig.CLOUDINARY_CLOUD_NAME}/auto/upload`,
      { method: 'POST', body: formData }
    );
    
    if (!response.ok) throw new Error('Upload failed');
    
    const data = await response.json();
    return data.secure_url;
  },
  
  updateMediaPreview() {
    const preview = document.getElementById('media-preview');
    const countBadge = document.getElementById('media-count-badge');
    const maxFiles = this.currentPostType === 'carousel' ? 10 : 1;
    
    // Update positions
    this.mediaUrls.forEach((m, i) => m.position = i + 1);
    
    // Render media grid
    const canEdit = !this.post || !['posted', 'publishing', 'cancelled'].includes(this.post?.status);
    preview.innerHTML = this.renderMediaItems(canEdit);
    
    // Update count badge
    if (countBadge) {
      countBadge.innerHTML = `${this.mediaUrls.length} / <span id="media-max">${maxFiles}</span>`;
      countBadge.classList.toggle('bg-green-500/20', this.mediaUrls.length > 0);
      countBadge.classList.toggle('text-green-400', this.mediaUrls.length > 0);
      countBadge.classList.toggle('bg-slate-700', this.mediaUrls.length === 0);
    }
    
    lucide.createIcons();
    
    // Rebind events
    this.bindRemoveButtons();
    this.bindDragEvents();
    
    // Update carousel preview
    this.updateCarouselPreview();
  },
  
  async submitForm() {
    const form = document.getElementById('post-form');
    const submitBtn = document.getElementById('submit-btn');
    const formData = new FormData(form);
    
    // Validate
    const platform = formData.get('platform');
    const caption = formData.get('caption');
    const scheduledAt = formData.get('scheduled_at');
    const postType = formData.get('post_type') || this.currentPostType;
    
    if (!platform) {
      UI.toast('Please select a platform', 'error');
      return;
    }
    
    if (!caption) {
      UI.toast('Caption is required', 'error');
      return;
    }
    
    if (!scheduledAt) {
      UI.toast('Please select a schedule date/time', 'error');
      return;
    }
    
    // Check if scheduled time is in the future
    if (new Date(scheduledAt) < new Date()) {
      UI.toast('Schedule time must be in the future', 'error');
      return;
    }
    
    // Validate media based on post type
    if (postType === 'carousel') {
      if (this.mediaUrls.length < 2) {
        UI.toast('Carousel requires at least 2 images', 'error');
        return;
      }
      if (this.mediaUrls.length > 10) {
        UI.toast('Carousel allows maximum 10 images', 'error');
        return;
      }
    } else if (postType === 'video') {
      if (this.mediaUrls.length === 0) {
        UI.toast('Please upload a video', 'error');
        return;
      }
      if (this.mediaUrls.length > 1) {
        UI.toast('Video post allows only 1 file', 'error');
        return;
      }
    }
    
    UI.setButtonLoading(submitBtn, true);
    
    try {
      const postData = {
        platform,
        caption,
        subject: formData.get('subject') || null,
        post_type: postType,
        scheduled_at: new Date(scheduledAt).toISOString(),
        media_urls: this.mediaUrls
      };
      
      if (this.isEdit) {
        await API.updatePost(this.post.post_id, postData);
        UI.toast('Post updated!', 'success');
      } else {
        await API.createPost(postData);
        UI.toast('Post scheduled!', 'success');
      }
      
      // Clear unsaved changes flag
      UI.setUnsavedChanges(false);
      
      Router.navigate('posts');
    } catch (error) {
      UI.toast(error.message, 'error');
    } finally {
      UI.setButtonLoading(submitBtn, false);
    }
  }
};
