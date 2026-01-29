/**
 * Post Form Page
 * Create or edit a single post
 */

window.PostForm = {
  post: null,
  isEdit: false,
  mediaUrls: [],
  
  async render(container, params) {
    this.isEdit = !!params?.id;
    this.post = null;
    this.mediaUrls = [];
    
    // Load existing post if editing
    if (this.isEdit) {
      try {
        this.post = await API.getPost(params.id);
        this.mediaUrls = this.post.media_urls || [];
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
          <!-- Platform -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Platform *</label>
            <div class="grid grid-cols-2 sm:grid-cols-5 gap-3">
              ${PortalConfig.PLATFORMS.map(p => `
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
          
          <!-- Media Upload -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Media</label>
            <div id="media-preview" class="grid grid-cols-3 gap-3 mb-3">
              ${this.mediaUrls.map((m, i) => `
                <div class="relative aspect-square">
                  <img src="${m.url}" class="w-full h-full object-cover rounded-lg">
                  ${canEdit ? `
                    <button type="button" class="remove-media absolute top-1 right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600" data-index="${i}">
                      <i data-lucide="x" class="w-4 h-4"></i>
                    </button>
                  ` : ''}
                </div>
              `).join('')}
            </div>
            ${canEdit ? `
              <div id="upload-dropzone" class="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center cursor-pointer hover:border-brandBlue transition-colors">
                <input type="file" id="media-input" accept="image/*,video/*" multiple class="hidden">
                <i data-lucide="upload-cloud" class="w-12 h-12 mx-auto mb-3 text-gray-500"></i>
                <p class="text-gray-400">Drag & drop images here, or <span class="text-brandBlue">browse</span></p>
                <p class="text-xs text-gray-500 mt-1">Supports: JPG, PNG, GIF, MP4 (max 10MB)</p>
              </div>
              <div id="upload-progress" class="hidden mt-3">
                <div class="flex items-center gap-3">
                  <div class="loading-spinner"></div>
                  <span class="text-sm text-gray-400">Uploading...</span>
                </div>
              </div>
            ` : ''}
          </div>
          
          <!-- Post Type -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Post Type</label>
            <select id="post-type" name="post_type" ${!canEdit ? 'disabled' : ''} class="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg focus:ring-2 focus:ring-brandBlue focus:border-transparent disabled:opacity-50">
              ${PortalConfig.POST_TYPES.map(t => `
                <option value="${t.id}" ${this.post?.post_type === t.id ? 'selected' : ''}>${t.name}</option>
              `).join('')}
            </select>
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
        this.handleFiles(e.dataTransfer.files);
      });
      
      mediaInput.addEventListener('change', () => {
        this.handleFiles(mediaInput.files);
      });
    }
    
    // Remove media buttons
    document.querySelectorAll('.remove-media').forEach(btn => {
      btn.addEventListener('click', () => {
        const index = parseInt(btn.dataset.index);
        this.mediaUrls.splice(index, 1);
        this.updateMediaPreview();
      });
    });
    
    // Form submit
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.submitForm();
    });
  },
  
  async handleFiles(files) {
    const progress = document.getElementById('upload-progress');
    progress?.classList.remove('hidden');
    
    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) {
        UI.toast(`File ${file.name} is too large (max 10MB)`, 'error');
        continue;
      }
      
      try {
        const url = await this.uploadToCloudinary(file);
        this.mediaUrls.push({
          url,
          type: file.type.startsWith('video') ? 'video' : 'image',
          position: this.mediaUrls.length + 1
        });
      } catch (error) {
        UI.toast(`Failed to upload ${file.name}`, 'error');
      }
    }
    
    progress?.classList.add('hidden');
    this.updateMediaPreview();
    this.updatePostType();
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
    preview.innerHTML = this.mediaUrls.map((m, i) => `
      <div class="relative aspect-square">
        ${m.type === 'video' ? `
          <video src="${m.url}" class="w-full h-full object-cover rounded-lg"></video>
        ` : `
          <img src="${m.url}" class="w-full h-full object-cover rounded-lg">
        `}
        <button type="button" class="remove-media absolute top-1 right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600" data-index="${i}">
          <i data-lucide="x" class="w-4 h-4"></i>
        </button>
      </div>
    `).join('');
    
    lucide.createIcons();
    
    // Rebind remove buttons
    document.querySelectorAll('.remove-media').forEach(btn => {
      btn.addEventListener('click', () => {
        const index = parseInt(btn.dataset.index);
        this.mediaUrls.splice(index, 1);
        this.updateMediaPreview();
        this.updatePostType();
      });
    });
  },
  
  updatePostType() {
    const postType = document.getElementById('post-type');
    if (this.mediaUrls.length > 1) {
      postType.value = 'carousel';
    } else if (this.mediaUrls.length === 1 && this.mediaUrls[0].type === 'video') {
      postType.value = 'video';
    } else if (this.mediaUrls.length === 1) {
      postType.value = 'single_image';
    }
  },
  
  async submitForm() {
    const form = document.getElementById('post-form');
    const submitBtn = document.getElementById('submit-btn');
    const formData = new FormData(form);
    
    // Validate
    const platform = formData.get('platform');
    const caption = formData.get('caption');
    const scheduledAt = formData.get('scheduled_at');
    
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
    
    UI.setButtonLoading(submitBtn, true);
    
    try {
      const postData = {
        platform,
        caption,
        subject: formData.get('subject') || null,
        post_type: formData.get('post_type'),
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
      
      Router.navigate('posts');
    } catch (error) {
      UI.toast(error.message, 'error');
    } finally {
      UI.setButtonLoading(submitBtn, false);
    }
  }
};
