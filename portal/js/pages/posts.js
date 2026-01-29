/**
 * Posts List Page
 * Shows all posts with filtering, search, and bulk actions
 */

window.Posts = {
  filters: {
    status: '',
    platform: ''
  },
  selectedPosts: new Set(),
  allPosts: [],
  
  async render(container) {
    container.innerHTML = `
      <div class="space-y-6">
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 class="text-2xl lg:text-3xl font-bold">Posts</h1>
            <p class="text-gray-400 mt-1">Manage your scheduled and published content</p>
          </div>
          <a href="#/posts/new" class="flex items-center gap-2 px-4 py-2 bg-brandBlue hover:bg-sky-600 rounded-lg transition-colors w-fit">
            <i data-lucide="plus" class="w-4 h-4"></i>
            New Post
          </a>
        </div>
        
        <!-- Filters -->
        <div class="flex flex-wrap gap-3">
          <select id="filter-status" class="px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg focus:ring-2 focus:ring-brandBlue focus:border-transparent">
            <option value="">All Statuses</option>
            <option value="ready">Ready</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="publishing">Publishing</option>
            <option value="posted">Posted</option>
            <option value="failed">Failed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          
          <select id="filter-platform" class="px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg focus:ring-2 focus:ring-brandBlue focus:border-transparent">
            <option value="">All Platforms</option>
            ${PortalConfig.getEnabledPlatforms().map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
          </select>
          
          <button id="refresh-posts" class="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors flex items-center gap-2">
            <i data-lucide="refresh-cw" class="w-4 h-4"></i>
            Refresh
          </button>
        </div>
        
        <!-- Bulk Actions Bar (hidden by default) -->
        <div id="bulk-actions-bar" class="hidden bg-brandBlue/20 border border-brandBlue/50 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <span id="selection-count" class="font-medium">0 selected</span>
            <button id="clear-selection" class="text-sm text-gray-400 hover:text-white underline">Clear</button>
          </div>
          <div class="flex flex-wrap gap-2">
            <button id="bulk-approve" class="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg transition-colors flex items-center gap-2">
              <i data-lucide="check-circle" class="w-4 h-4"></i>
              Approve
            </button>
            <button id="bulk-skip" class="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 rounded-lg transition-colors flex items-center gap-2">
              <i data-lucide="skip-forward" class="w-4 h-4"></i>
              Skip
            </button>
            <button id="bulk-delete" class="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg transition-colors flex items-center gap-2">
              <i data-lucide="trash-2" class="w-4 h-4"></i>
              Delete
            </button>
          </div>
        </div>
        
        <!-- Posts List -->
        <div id="posts-list" class="bg-slate-800/50 rounded-xl border border-slate-700">
          <div class="p-8 text-center">
            <div class="loading-spinner mx-auto"></div>
          </div>
        </div>
      </div>
    `;
    
    lucide.createIcons();
    
    // Reset selection
    this.selectedPosts.clear();
    
    // Bind events
    document.getElementById('filter-status').addEventListener('change', (e) => {
      this.filters.status = e.target.value;
      this.selectedPosts.clear();
      this.loadPosts();
    });
    
    document.getElementById('filter-platform').addEventListener('change', (e) => {
      this.filters.platform = e.target.value;
      this.selectedPosts.clear();
      this.loadPosts();
    });
    
    document.getElementById('refresh-posts').addEventListener('click', () => {
      this.selectedPosts.clear();
      this.loadPosts();
    });
    
    // Bulk action handlers
    document.getElementById('clear-selection').addEventListener('click', () => {
      this.selectedPosts.clear();
      this.updateSelectionUI();
    });
    
    document.getElementById('bulk-approve').addEventListener('click', () => this.performBulkAction('approve'));
    document.getElementById('bulk-skip').addEventListener('click', () => this.performBulkAction('skip'));
    document.getElementById('bulk-delete').addEventListener('click', () => this.performBulkAction('delete'));
    
    // Load posts
    await this.loadPosts();
  },
  
  async loadPosts() {
    const listContainer = document.getElementById('posts-list');
    listContainer.innerHTML = `
      <div class="p-8 text-center">
        <div class="loading-spinner mx-auto"></div>
      </div>
    `;
    
    try {
      const data = await API.listPosts(this.filters);
      const posts = data?.posts || [];
      this.allPosts = posts;
      
      if (posts.length === 0) {
        listContainer.innerHTML = `
          <div class="p-12 text-center text-gray-400">
            <i data-lucide="inbox" class="w-16 h-16 mx-auto mb-4 opacity-50"></i>
            <h3 class="text-lg font-medium mb-2">No posts found</h3>
            <p class="text-sm mb-4">Try adjusting your filters or create a new post</p>
            <a href="#/posts/new" class="inline-flex items-center gap-2 px-4 py-2 bg-brandBlue hover:bg-sky-600 rounded-lg transition-colors">
              <i data-lucide="plus" class="w-4 h-4"></i>
              Create Post
            </a>
          </div>
        `;
        lucide.createIcons();
        this.updateSelectionUI();
        return;
      }
      
      // Get selectable posts (not posted or publishing)
      const selectablePosts = posts.filter(p => !['posted', 'publishing'].includes(p.status));
      
      listContainer.innerHTML = `
        <!-- Select All Header -->
        <div class="p-3 border-b border-slate-700 bg-slate-800/80 flex items-center gap-3">
          <input type="checkbox" id="select-all-posts" 
            class="w-5 h-5 rounded border-slate-500 bg-slate-700 text-brandBlue focus:ring-brandBlue cursor-pointer"
            ${selectablePosts.length > 0 && selectablePosts.every(p => this.selectedPosts.has(p.post_id)) ? 'checked' : ''}>
          <label for="select-all-posts" class="text-sm text-gray-400 cursor-pointer">
            Select all (${selectablePosts.length} selectable)
          </label>
        </div>
        <div class="divide-y divide-slate-700">
          ${posts.map(post => this.renderPostRow(post)).join('')}
        </div>
      `;
      
      lucide.createIcons();
      
      // Bind select all checkbox
      document.getElementById('select-all-posts').addEventListener('change', (e) => {
        if (e.target.checked) {
          selectablePosts.forEach(p => this.selectedPosts.add(p.post_id));
        } else {
          this.selectedPosts.clear();
        }
        this.updateSelectionUI();
      });
      
      // Bind individual checkboxes
      listContainer.querySelectorAll('.post-checkbox').forEach(cb => {
        cb.addEventListener('change', (e) => {
          const postId = e.target.dataset.postId;
          if (e.target.checked) {
            this.selectedPosts.add(postId);
          } else {
            this.selectedPosts.delete(postId);
          }
          this.updateSelectionUI();
        });
      });
      
      // Bind delete buttons
      listContainer.querySelectorAll('.delete-post-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.deletePost(btn.dataset.postId);
        });
      });
      
      this.updateSelectionUI();
      
    } catch (error) {
      listContainer.innerHTML = `
        <div class="p-8 text-center text-red-400">
          <i data-lucide="alert-circle" class="w-12 h-12 mx-auto mb-3"></i>
          <p>Failed to load posts: ${error.message}</p>
          <button onclick="Posts.loadPosts()" class="mt-4 text-brandBlue hover:underline">Try again</button>
        </div>
      `;
      lucide.createIcons();
    }
  },
  
  renderPostRow(post) {
    const scheduledDate = post.scheduled_at ? new Date(post.scheduled_at) : null;
    const isPast = scheduledDate && scheduledDate < new Date();
    const canEdit = !['posted', 'publishing', 'cancelled'].includes(post.status);
    const canSelect = !['posted', 'publishing'].includes(post.status);
    const isSelected = this.selectedPosts.has(post.post_id);
    
    return `
      <div class="p-4 hover:bg-slate-700/30 transition-colors ${isSelected ? 'bg-brandBlue/10' : ''}">
        <div class="flex items-start gap-4">
          <!-- Checkbox -->
          ${canSelect ? `
            <input type="checkbox" 
              class="post-checkbox w-5 h-5 mt-1 rounded border-slate-500 bg-slate-700 text-brandBlue focus:ring-brandBlue cursor-pointer flex-shrink-0"
              data-post-id="${post.post_id}"
              ${isSelected ? 'checked' : ''}>
          ` : `
            <div class="w-5 h-5 mt-1 flex-shrink-0"></div>
          `}
          
          <!-- Media Preview -->
          ${post.media_urls?.[0]?.url ? `
            <img src="${post.media_urls[0].url}" class="w-16 h-16 rounded-lg object-cover flex-shrink-0">
          ` : `
            <div class="w-16 h-16 bg-slate-700 rounded-lg flex items-center justify-center flex-shrink-0">
              <i data-lucide="file-text" class="w-6 h-6 text-gray-500"></i>
            </div>
          `}
          
          <!-- Content -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1">
              ${UI.platformIcon(post.platform)}
              <a href="#/posts/${post.post_id}" class="font-medium hover:text-brandBlue transition-colors">
                ${post.subject || 'Untitled Post'}
              </a>
              ${post.post_type === 'carousel' ? '<span class="text-xs bg-slate-700 px-2 py-0.5 rounded">Carousel</span>' : ''}
            </div>
            <p class="text-sm text-gray-400 line-clamp-2 mb-2">${UI.truncate(post.caption, 120)}</p>
            <div class="flex flex-wrap items-center gap-3 text-xs text-gray-500">
              <span class="flex items-center gap-1">
                <i data-lucide="calendar" class="w-3 h-3"></i>
                ${scheduledDate ? UI.formatDate(post.scheduled_at) : 'Not scheduled'}
              </span>
              ${scheduledDate ? `
                <span class="${isPast ? 'text-gray-500' : 'text-brandBlue'}">${UI.formatRelativeTime(post.scheduled_at)}</span>
              ` : ''}
            </div>
          </div>
          
          <!-- Status & Actions -->
          <div class="flex items-center gap-3 flex-shrink-0">
            <div class="text-right">
              ${UI.statusBadge(post.status)}
              ${post.approval_status !== post.status ? `<div class="mt-1">${UI.statusBadge(post.approval_status)}</div>` : ''}
            </div>
            
            <div class="flex items-center gap-1">
              <a href="#/posts/${post.post_id}" class="p-2 hover:bg-slate-700 rounded-lg transition-colors" title="View/Edit">
                <i data-lucide="${canEdit ? 'edit' : 'eye'}" class="w-4 h-4"></i>
              </a>
              ${canEdit ? `
                <button class="delete-post-btn p-2 hover:bg-red-500/20 text-gray-400 hover:text-red-400 rounded-lg transition-colors" data-post-id="${post.post_id}" title="Delete">
                  <i data-lucide="trash-2" class="w-4 h-4"></i>
                </button>
              ` : ''}
            </div>
          </div>
        </div>
      </div>
    `;
  },
  
  async deletePost(postId) {
    const confirmed = await UI.confirm(
      'Are you sure you want to delete this post? This action cannot be undone.',
      'Delete Post'
    );
    
    if (!confirmed) return;
    
    try {
      await API.deletePost(postId);
      UI.toast('Post deleted', 'success');
      this.selectedPosts.delete(postId);
      this.loadPosts();
    } catch (error) {
      UI.toast('Failed to delete post: ' + error.message, 'error');
    }
  },
  
  updateSelectionUI() {
    const bulkBar = document.getElementById('bulk-actions-bar');
    const countSpan = document.getElementById('selection-count');
    const selectAllCb = document.getElementById('select-all-posts');
    
    const count = this.selectedPosts.size;
    
    if (count > 0) {
      bulkBar?.classList.remove('hidden');
      if (countSpan) countSpan.textContent = `${count} selected`;
    } else {
      bulkBar?.classList.add('hidden');
    }
    
    // Update select all checkbox state
    if (selectAllCb) {
      const selectablePosts = this.allPosts.filter(p => !['posted', 'publishing'].includes(p.status));
      selectAllCb.checked = selectablePosts.length > 0 && selectablePosts.every(p => this.selectedPosts.has(p.post_id));
      selectAllCb.indeterminate = count > 0 && count < selectablePosts.length;
    }
    
    // Update individual checkboxes
    document.querySelectorAll('.post-checkbox').forEach(cb => {
      cb.checked = this.selectedPosts.has(cb.dataset.postId);
      const row = cb.closest('.p-4');
      if (row) {
        row.classList.toggle('bg-brandBlue/10', cb.checked);
      }
    });
    
    lucide.createIcons();
  },
  
  async performBulkAction(action) {
    const count = this.selectedPosts.size;
    if (count === 0) return;
    
    const actionLabels = {
      approve: 'approve',
      skip: 'skip',
      delete: 'delete'
    };
    
    const confirmed = await UI.confirm(
      `Are you sure you want to ${actionLabels[action]} ${count} post${count > 1 ? 's' : ''}?`,
      `Bulk ${action.charAt(0).toUpperCase() + action.slice(1)}`
    );
    
    if (!confirmed) return;
    
    try {
      const postIds = Array.from(this.selectedPosts);
      const result = await API.bulkPostAction(action, postIds);
      
      if (result.success_count > 0) {
        UI.toast(`${result.success_count} post${result.success_count > 1 ? 's' : ''} ${action}${action === 'skip' ? 'ped' : action === 'approve' ? 'd' : 'd'}`, 'success');
      }
      
      if (result.failed_count > 0) {
        UI.toast(`${result.failed_count} post${result.failed_count > 1 ? 's' : ''} failed`, 'warning');
        console.warn('Bulk action failures:', result.failed);
      }
      
      this.selectedPosts.clear();
      this.loadPosts();
      
      // Refresh approval badge
      if (typeof refreshApprovalBadge === 'function') refreshApprovalBadge();
    } catch (error) {
      UI.toast('Bulk action failed: ' + error.message, 'error');
    }
  }
};
