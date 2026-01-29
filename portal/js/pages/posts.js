/**
 * Posts List Page
 * Shows all posts with filtering and search
 */

window.Posts = {
  filters: {
    status: '',
    platform: ''
  },
  
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
            ${PortalConfig.PLATFORMS.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
          </select>
          
          <button id="refresh-posts" class="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors flex items-center gap-2">
            <i data-lucide="refresh-cw" class="w-4 h-4"></i>
            Refresh
          </button>
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
    
    // Bind events
    document.getElementById('filter-status').addEventListener('change', (e) => {
      this.filters.status = e.target.value;
      this.loadPosts();
    });
    
    document.getElementById('filter-platform').addEventListener('change', (e) => {
      this.filters.platform = e.target.value;
      this.loadPosts();
    });
    
    document.getElementById('refresh-posts').addEventListener('click', () => {
      this.loadPosts();
    });
    
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
        return;
      }
      
      listContainer.innerHTML = `
        <div class="divide-y divide-slate-700">
          ${posts.map(post => this.renderPostRow(post)).join('')}
        </div>
      `;
      
      lucide.createIcons();
      
      // Bind delete buttons
      listContainer.querySelectorAll('.delete-post-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.deletePost(btn.dataset.postId);
        });
      });
      
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
    
    return `
      <div class="p-4 hover:bg-slate-700/30 transition-colors">
        <div class="flex items-start gap-4">
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
      this.loadPosts();
    } catch (error) {
      UI.toast('Failed to delete post: ' + error.message, 'error');
    }
  }
};
