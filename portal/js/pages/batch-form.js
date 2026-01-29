/**
 * Batch Form Page
 * Create multiple posts at once (influencer workflow)
 */

window.BatchForm = {
  posts: [],
  platform: 'instagram',
  
  async render(container, params) {
    // Check if viewing existing batch
    if (params?.id) {
      return this.renderBatchDetails(container, params.id);
    }
    
    this.posts = [];
    this.platform = 'instagram';
    
    container.innerHTML = `
      <div class="max-w-4xl mx-auto">
        <!-- Header -->
        <div class="mb-8">
          <a href="#/dashboard" class="text-gray-400 hover:text-white flex items-center gap-2 mb-4">
            <i data-lucide="arrow-left" class="w-4 h-4"></i>
            Back to dashboard
          </a>
          <h1 class="text-2xl lg:text-3xl font-bold">Create Batch</h1>
          <p class="text-gray-400 mt-1">Schedule multiple posts at once</p>
        </div>
        
        <!-- Platform Selection -->
        <div class="bg-slate-800/50 rounded-xl border border-slate-700 p-6 mb-6">
          <label class="block text-sm font-medium text-gray-300 mb-3">Platform</label>
          <div class="flex flex-wrap gap-3">
            ${PortalConfig.PLATFORMS.map(p => `
              <label class="relative cursor-pointer">
                <input type="radio" name="batch-platform" value="${p.id}" ${p.id === 'instagram' ? 'checked' : ''} class="peer sr-only">
                <div class="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-600 peer-checked:border-brandBlue peer-checked:bg-brandBlue/10 hover:border-slate-500 transition-all">
                  <i data-lucide="${p.icon}" class="w-5 h-5" style="color: ${p.color}"></i>
                  <span>${p.name}</span>
                </div>
              </label>
            `).join('')}
          </div>
        </div>
        
        <!-- Import Options -->
        <div class="grid md:grid-cols-2 gap-6 mb-6">
          <!-- CSV Upload -->
          <div class="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
            <h3 class="font-semibold mb-3 flex items-center gap-2">
              <i data-lucide="file-spreadsheet" class="w-5 h-5 text-green-400"></i>
              Import from CSV
            </h3>
            <p class="text-sm text-gray-400 mb-4">Upload a CSV file with columns: scheduled_at, caption, media_url (optional)</p>
            <div id="csv-dropzone" class="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center cursor-pointer hover:border-brandBlue transition-colors">
              <input type="file" id="csv-input" accept=".csv" class="hidden">
              <i data-lucide="upload" class="w-8 h-8 mx-auto mb-2 text-gray-500"></i>
              <p class="text-sm text-gray-400">Drop CSV here or <span class="text-brandBlue">browse</span></p>
            </div>
            <a href="#" id="download-template" class="text-sm text-brandBlue hover:underline mt-3 inline-block">
              Download CSV template
            </a>
          </div>
          
          <!-- Manual Entry -->
          <div class="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
            <h3 class="font-semibold mb-3 flex items-center gap-2">
              <i data-lucide="edit-3" class="w-5 h-5 text-blue-400"></i>
              Add Manually
            </h3>
            <p class="text-sm text-gray-400 mb-4">Add posts one by one with the form below</p>
            <button id="add-post-btn" class="w-full py-3 px-4 bg-brandBlue hover:bg-sky-600 rounded-lg transition-colors flex items-center justify-center gap-2">
              <i data-lucide="plus" class="w-5 h-5"></i>
              Add Post
            </button>
          </div>
        </div>
        
        <!-- Posts List -->
        <div id="posts-list-container" class="mb-6 ${this.posts.length === 0 ? 'hidden' : ''}">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-semibold">Posts to Schedule (<span id="posts-count">${this.posts.length}</span>)</h3>
            <button id="clear-all-btn" class="text-sm text-red-400 hover:text-red-300">Clear All</button>
          </div>
          <div id="posts-list" class="space-y-3">
            <!-- Posts rendered here -->
          </div>
        </div>
        
        <!-- Empty State -->
        <div id="empty-state" class="bg-slate-800/50 rounded-xl border border-slate-700 p-12 text-center ${this.posts.length > 0 ? 'hidden' : ''}">
          <i data-lucide="layers" class="w-16 h-16 mx-auto mb-4 text-gray-500"></i>
          <h3 class="text-lg font-medium mb-2">No posts added yet</h3>
          <p class="text-gray-400">Import a CSV or add posts manually to get started</p>
        </div>
        
        <!-- Submit -->
        <div id="submit-section" class="bg-slate-800/50 rounded-xl border border-slate-700 p-6 ${this.posts.length === 0 ? 'hidden' : ''}">
          <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p class="font-medium">Ready to schedule <span id="total-posts">${this.posts.length}</span> posts?</p>
              <p class="text-sm text-gray-400">Posts will be queued for processing</p>
            </div>
            <button id="submit-batch-btn" class="px-6 py-3 bg-brandBlue hover:bg-sky-600 rounded-lg transition-colors font-semibold flex items-center gap-2">
              <i data-lucide="send" class="w-5 h-5"></i>
              Schedule Batch
            </button>
          </div>
        </div>
      </div>
      
      <!-- Add Post Modal -->
      <div id="add-post-modal" class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 hidden">
        <div class="bg-slate-800 rounded-2xl p-6 max-w-lg w-full border border-slate-700 max-h-[90vh] overflow-y-auto">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl font-semibold">Add Post</h3>
            <button id="close-modal" class="p-2 hover:bg-slate-700 rounded-lg">
              <i data-lucide="x" class="w-5 h-5"></i>
            </button>
          </div>
          <form id="add-post-form" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Caption *</label>
              <textarea id="modal-caption" rows="3" required class="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg focus:ring-2 focus:ring-brandBlue resize-none" placeholder="Write your caption..."></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Schedule Date/Time *</label>
              <input type="datetime-local" id="modal-scheduled-at" required class="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg focus:ring-2 focus:ring-brandBlue">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Media URL (optional)</label>
              <input type="url" id="modal-media-url" class="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg focus:ring-2 focus:ring-brandBlue" placeholder="https://...">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Subject (optional)</label>
              <input type="text" id="modal-subject" class="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg focus:ring-2 focus:ring-brandBlue" placeholder="e.g., Morning Post">
            </div>
            <div class="flex gap-3 pt-4">
              <button type="submit" class="flex-1 py-3 bg-brandBlue hover:bg-sky-600 rounded-lg font-semibold">
                Add Post
              </button>
              <button type="button" id="cancel-modal" class="py-3 px-6 bg-slate-700 hover:bg-slate-600 rounded-lg">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
    
    lucide.createIcons();
    this.bindEvents();
  },
  
  bindEvents() {
    // Platform selection
    document.querySelectorAll('input[name="batch-platform"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        this.platform = e.target.value;
      });
    });
    
    // CSV upload
    const csvDropzone = document.getElementById('csv-dropzone');
    const csvInput = document.getElementById('csv-input');
    
    csvDropzone.addEventListener('click', () => csvInput.click());
    csvDropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      csvDropzone.classList.add('border-brandBlue');
    });
    csvDropzone.addEventListener('dragleave', () => {
      csvDropzone.classList.remove('border-brandBlue');
    });
    csvDropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      csvDropzone.classList.remove('border-brandBlue');
      if (e.dataTransfer.files[0]) {
        this.parseCSV(e.dataTransfer.files[0]);
      }
    });
    csvInput.addEventListener('change', () => {
      if (csvInput.files[0]) {
        this.parseCSV(csvInput.files[0]);
      }
    });
    
    // Download template
    document.getElementById('download-template').addEventListener('click', (e) => {
      e.preventDefault();
      this.downloadTemplate();
    });
    
    // Add post modal
    const modal = document.getElementById('add-post-modal');
    document.getElementById('add-post-btn').addEventListener('click', () => {
      modal.classList.remove('hidden');
      // Set default datetime to tomorrow 9am
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(9, 0, 0, 0);
      document.getElementById('modal-scheduled-at').value = tomorrow.toISOString().slice(0, 16);
    });
    
    document.getElementById('close-modal').addEventListener('click', () => modal.classList.add('hidden'));
    document.getElementById('cancel-modal').addEventListener('click', () => modal.classList.add('hidden'));
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.add('hidden');
    });
    
    // Add post form
    document.getElementById('add-post-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.addPostFromModal();
    });
    
    // Clear all
    document.getElementById('clear-all-btn').addEventListener('click', () => {
      this.posts = [];
      this.renderPostsList();
    });
    
    // Submit batch
    document.getElementById('submit-batch-btn').addEventListener('click', () => {
      this.submitBatch();
    });
  },
  
  parseCSV(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const lines = text.split('\n');
      const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
      
      // Validate headers
      if (!headers.includes('scheduled_at') || !headers.includes('caption')) {
        UI.toast('CSV must have "scheduled_at" and "caption" columns', 'error');
        return;
      }
      
      const scheduledAtIdx = headers.indexOf('scheduled_at');
      const captionIdx = headers.indexOf('caption');
      const mediaUrlIdx = headers.indexOf('media_url');
      const subjectIdx = headers.indexOf('subject');
      
      let imported = 0;
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        // Simple CSV parsing (doesn't handle quoted commas)
        const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
        
        const scheduledAt = values[scheduledAtIdx];
        const caption = values[captionIdx];
        
        if (!scheduledAt || !caption) continue;
        
        const post = {
          scheduled_at: new Date(scheduledAt).toISOString(),
          caption,
          subject: subjectIdx >= 0 ? values[subjectIdx] : null,
          media_urls: []
        };
        
        if (mediaUrlIdx >= 0 && values[mediaUrlIdx]) {
          post.media_urls.push({ url: values[mediaUrlIdx], type: 'image' });
        }
        
        this.posts.push(post);
        imported++;
      }
      
      UI.toast(`Imported ${imported} posts from CSV`, 'success');
      this.renderPostsList();
    };
    reader.readAsText(file);
  },
  
  downloadTemplate() {
    const csv = 'scheduled_at,caption,media_url,subject\n2026-01-30T09:00:00,Morning motivation! ☀️ #blessed,https://example.com/image1.jpg,Morning Post\n2026-01-30T15:00:00,Afternoon vibes 🌤️,,Afternoon Post';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'batch-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  },
  
  addPostFromModal() {
    const caption = document.getElementById('modal-caption').value;
    const scheduledAt = document.getElementById('modal-scheduled-at').value;
    const mediaUrl = document.getElementById('modal-media-url').value;
    const subject = document.getElementById('modal-subject').value;
    
    if (new Date(scheduledAt) < new Date()) {
      UI.toast('Schedule time must be in the future', 'error');
      return;
    }
    
    const post = {
      scheduled_at: new Date(scheduledAt).toISOString(),
      caption,
      subject: subject || null,
      media_urls: mediaUrl ? [{ url: mediaUrl, type: 'image' }] : []
    };
    
    this.posts.push(post);
    this.renderPostsList();
    
    // Reset and close modal
    document.getElementById('add-post-form').reset();
    document.getElementById('add-post-modal').classList.add('hidden');
    
    UI.toast('Post added', 'success');
  },
  
  renderPostsList() {
    const container = document.getElementById('posts-list-container');
    const emptyState = document.getElementById('empty-state');
    const submitSection = document.getElementById('submit-section');
    const postsList = document.getElementById('posts-list');
    
    if (this.posts.length === 0) {
      container.classList.add('hidden');
      emptyState.classList.remove('hidden');
      submitSection.classList.add('hidden');
      return;
    }
    
    container.classList.remove('hidden');
    emptyState.classList.add('hidden');
    submitSection.classList.remove('hidden');
    
    document.getElementById('posts-count').textContent = this.posts.length;
    document.getElementById('total-posts').textContent = this.posts.length;
    
    // Sort by scheduled date
    this.posts.sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at));
    
    postsList.innerHTML = this.posts.map((post, index) => `
      <div class="bg-slate-800 rounded-lg p-4 border border-slate-700">
        <div class="flex items-start gap-3">
          <div class="w-8 h-8 bg-brandBlue/20 rounded-full flex items-center justify-center text-sm font-medium text-brandBlue">
            ${index + 1}
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1 text-sm text-gray-400">
              <i data-lucide="calendar" class="w-3 h-3"></i>
              ${UI.formatDate(post.scheduled_at)}
            </div>
            <p class="text-sm line-clamp-2">${UI.truncate(post.caption, 100)}</p>
            ${post.media_urls.length > 0 ? `
              <div class="flex items-center gap-1 mt-2 text-xs text-gray-500">
                <i data-lucide="image" class="w-3 h-3"></i>
                ${post.media_urls.length} media
              </div>
            ` : ''}
          </div>
          <button class="remove-post p-2 hover:bg-red-500/20 text-gray-400 hover:text-red-400 rounded-lg" data-index="${index}">
            <i data-lucide="trash-2" class="w-4 h-4"></i>
          </button>
        </div>
      </div>
    `).join('');
    
    lucide.createIcons();
    
    // Bind remove buttons
    postsList.querySelectorAll('.remove-post').forEach(btn => {
      btn.addEventListener('click', () => {
        const index = parseInt(btn.dataset.index);
        this.posts.splice(index, 1);
        this.renderPostsList();
      });
    });
  },
  
  async submitBatch() {
    if (this.posts.length === 0) {
      UI.toast('No posts to schedule', 'error');
      return;
    }
    
    const submitBtn = document.getElementById('submit-batch-btn');
    UI.setButtonLoading(submitBtn, true);
    
    try {
      const batchData = {
        platform: this.platform,
        batch_type: 'manual',
        posts: this.posts.map((post, index) => ({
          scheduled_at: post.scheduled_at,
          caption: post.caption,
          subject: post.subject || `Post ${index + 1}`,
          media_urls: post.media_urls,
          post_type: post.media_urls.length > 1 ? 'carousel' : 'single_image'
        }))
      };
      
      const result = await API.createBatch(batchData);
      UI.toast(`Batch of ${this.posts.length} posts scheduled!`, 'success');
      
      // Navigate to batch details or posts list
      Router.navigate('posts');
    } catch (error) {
      UI.toast(error.message, 'error');
    } finally {
      UI.setButtonLoading(submitBtn, false);
    }
  },
  
  async renderBatchDetails(container, batchId) {
    try {
      const data = await API.getBatch(batchId);
      const batch = data.batch;
      const posts = data.posts || [];
      
      container.innerHTML = `
        <div class="max-w-4xl mx-auto">
          <div class="mb-8">
            <a href="#/posts" class="text-gray-400 hover:text-white flex items-center gap-2 mb-4">
              <i data-lucide="arrow-left" class="w-4 h-4"></i>
              Back to posts
            </a>
            <h1 class="text-2xl lg:text-3xl font-bold">Batch Details</h1>
          </div>
          
          <div class="bg-slate-800/50 rounded-xl border border-slate-700 p-6 mb-6">
            <div class="grid sm:grid-cols-4 gap-4">
              <div>
                <p class="text-sm text-gray-400">Platform</p>
                <p class="font-medium capitalize">${batch.platform}</p>
              </div>
              <div>
                <p class="text-sm text-gray-400">Status</p>
                ${UI.statusBadge(batch.status)}
              </div>
              <div>
                <p class="text-sm text-gray-400">Posts</p>
                <p class="font-medium">${batch.posts_created} / ${batch.batch_size}</p>
              </div>
              <div>
                <p class="text-sm text-gray-400">Created</p>
                <p class="font-medium">${UI.formatDate(batch.created_at)}</p>
              </div>
            </div>
          </div>
          
          <div class="bg-slate-800/50 rounded-xl border border-slate-700">
            <div class="p-4 border-b border-slate-700">
              <h3 class="font-semibold">Posts in this Batch</h3>
            </div>
            <div class="divide-y divide-slate-700">
              ${posts.length === 0 ? `
                <div class="p-8 text-center text-gray-400">
                  <p>Posts are being generated...</p>
                </div>
              ` : posts.map(post => `
                <a href="#/posts/${post.post_id}" class="block p-4 hover:bg-slate-700/50 transition-colors">
                  <div class="flex items-center gap-4">
                    <div class="flex-1">
                      <p class="font-medium">${post.subject || 'Untitled'}</p>
                      <p class="text-sm text-gray-400 truncate">${UI.truncate(post.caption, 80)}</p>
                    </div>
                    <div class="text-right">
                      <p class="text-sm text-gray-400">${UI.formatDate(post.scheduled_at)}</p>
                      ${UI.statusBadge(post.status)}
                    </div>
                  </div>
                </a>
              `).join('')}
            </div>
          </div>
        </div>
      `;
      
      lucide.createIcons();
    } catch (error) {
      container.innerHTML = `
        <div class="text-center py-20">
          <div class="text-red-400 mb-4">
            <i data-lucide="alert-circle" class="w-12 h-12 mx-auto"></i>
          </div>
          <h2 class="text-xl font-semibold mb-2">Batch not found</h2>
          <a href="#/posts" class="text-brandBlue hover:underline">Back to posts</a>
        </div>
      `;
      lucide.createIcons();
    }
  }
};
