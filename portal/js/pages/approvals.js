/**
 * Approvals Page
 * View and approve/reject pending posts
 */

window.Approvals = {
  posts: [],
  
  async render(container) {
    container.innerHTML = `
      <div class="space-y-6">
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 class="text-2xl lg:text-3xl font-bold">Pending Approvals</h1>
            <p class="text-gray-400 mt-1">Review and approve posts before they go live</p>
          </div>
          <div class="flex items-center gap-3">
            <button id="refresh-approvals" class="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors flex items-center gap-2">
              <i data-lucide="refresh-cw" class="w-4 h-4"></i>
              Refresh
            </button>
          </div>
        </div>
        
        <!-- Stats Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 text-center">
            <div id="stat-pending" class="text-3xl font-bold text-yellow-400">-</div>
            <div class="text-sm text-gray-400">Pending Review</div>
          </div>
          <div class="bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-center">
            <div id="stat-approved" class="text-3xl font-bold text-green-400">-</div>
            <div class="text-sm text-gray-400">Approved Today</div>
          </div>
          <div class="bg-slate-700/50 border border-slate-600 rounded-xl p-4 text-center">
            <div id="stat-scheduled" class="text-3xl font-bold text-brandBlue">-</div>
            <div class="text-sm text-gray-400">Scheduled This Week</div>
          </div>
        </div>
        
        <!-- Pending Posts List -->
        <div id="approvals-list" class="space-y-4">
          <div class="p-8 text-center">
            <div class="loading-spinner mx-auto"></div>
          </div>
        </div>
      </div>
    `;
    
    lucide.createIcons();
    
    // Bind events
    document.getElementById('refresh-approvals').addEventListener('click', () => this.loadApprovals());
    
    // Load data
    await this.loadApprovals();
  },
  
  async loadApprovals() {
    const listContainer = document.getElementById('approvals-list');
    listContainer.innerHTML = `
      <div class="p-8 text-center">
        <div class="loading-spinner mx-auto"></div>
      </div>
    `;
    
    try {
      // Get pending approval posts
      const data = await API.listPosts({ approval_status: 'pending' });
      this.posts = data?.posts || [];
      
      // Update stats
      document.getElementById('stat-pending').textContent = this.posts.length;
      
      // Get today's approved count
      // Check both approved_at (auto-approval) and approval_responded_at (manual approval)
      const today = new Date().toISOString().slice(0, 10);
      const allPosts = await API.listPosts({ limit: 100 });
      const approvedToday = (allPosts?.posts || []).filter(p => {
        if (p.approval_status !== 'approved') return false;
        // Check approved_at first (set by system), then approval_responded_at (manual)
        const approvalDate = p.approved_at || p.approval_responded_at || p.updated_at;
        return approvalDate?.slice(0, 10) === today;
      }).length;
      document.getElementById('stat-approved').textContent = approvedToday;
      
      // Get scheduled this week (status 'ready' means scheduled and waiting to publish)
      const now = new Date();
      const weekFromNow = new Date();
      weekFromNow.setDate(weekFromNow.getDate() + 7);
      const scheduledThisWeek = (allPosts?.posts || []).filter(p => 
        p.status === 'ready' && 
        p.approval_status === 'approved' &&
        p.scheduled_at &&
        new Date(p.scheduled_at) >= now &&
        new Date(p.scheduled_at) <= weekFromNow
      ).length;
      document.getElementById('stat-scheduled').textContent = scheduledThisWeek;
      
      if (this.posts.length === 0) {
        listContainer.innerHTML = `
          <div class="bg-slate-800/50 rounded-xl border border-slate-700 p-12 text-center">
            <i data-lucide="check-circle-2" class="w-16 h-16 mx-auto mb-4 text-green-400 opacity-50"></i>
            <h3 class="text-lg font-medium mb-2">All caught up!</h3>
            <p class="text-gray-400">No posts pending approval right now.</p>
            <a href="#/posts" class="inline-block mt-4 text-brandBlue hover:underline">View all posts →</a>
          </div>
        `;
        lucide.createIcons();
        return;
      }
      
      listContainer.innerHTML = this.posts.map(post => this.renderApprovalCard(post)).join('');
      lucide.createIcons();
      
      // Bind action buttons
      this.bindActionButtons();
      
    } catch (error) {
      listContainer.innerHTML = `
        <div class="p-8 text-center text-red-400">
          <i data-lucide="alert-circle" class="w-12 h-12 mx-auto mb-3"></i>
          <p>Failed to load approvals: ${error.message}</p>
          <button onclick="Approvals.loadApprovals()" class="mt-4 text-brandBlue hover:underline">Try again</button>
        </div>
      `;
      lucide.createIcons();
    }
  },
  
  renderApprovalCard(post) {
    const scheduledDate = post.scheduled_at ? new Date(post.scheduled_at) : null;
    const isCarousel = post.post_type === 'carousel';
    const mediaCount = post.media_urls?.length || 0;
    const firstMedia = post.media_urls?.[0];
    
    return `
      <div class="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden hover:border-slate-600 transition-colors" data-post-id="${post.post_id}">
        <div class="p-5">
          <div class="flex gap-4">
            <!-- Media Preview -->
            <div class="flex-shrink-0">
              ${firstMedia?.url ? `
                <div class="relative w-32 h-32 rounded-lg overflow-hidden bg-slate-700">
                  ${firstMedia.type === 'video' ? `
                    <video src="${firstMedia.url}" class="w-full h-full object-cover"></video>
                    <div class="absolute inset-0 flex items-center justify-center bg-black/30">
                      <i data-lucide="play-circle" class="w-10 h-10 text-white"></i>
                    </div>
                  ` : `
                    <img src="${firstMedia.url}" alt="" class="w-full h-full object-cover">
                  `}
                  ${isCarousel ? `
                    <div class="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-2 py-0.5 rounded-full">
                      1/${mediaCount}
                    </div>
                  ` : ''}
                </div>
              ` : `
                <div class="w-32 h-32 rounded-lg bg-slate-700 flex items-center justify-center">
                  <i data-lucide="file-text" class="w-8 h-8 text-gray-500"></i>
                </div>
              `}
            </div>
            
            <!-- Content -->
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between gap-3 mb-2">
                <div>
                  <div class="flex items-center gap-2 mb-1">
                    ${UI.platformIcon(post.platform)}
                    <span class="font-medium">${post.subject || 'Untitled Post'}</span>
                    ${isCarousel ? '<span class="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded">Carousel</span>' : ''}
                  </div>
                  <div class="flex items-center gap-3 text-sm text-gray-400">
                    <span class="flex items-center gap-1">
                      <i data-lucide="calendar" class="w-3 h-3"></i>
                      ${scheduledDate ? UI.formatDate(post.scheduled_at) : 'Not scheduled'}
                    </span>
                    ${scheduledDate ? `
                      <span class="text-brandBlue">${UI.formatRelativeTime(post.scheduled_at)}</span>
                    ` : ''}
                  </div>
                </div>
                ${UI.statusBadge(post.approval_status || 'pending')}
              </div>
              
              <!-- Caption Preview -->
              <p class="text-sm text-gray-300 line-clamp-3 mb-4">${post.caption || 'No caption'}</p>
              
              <!-- Actions -->
              <div class="flex flex-wrap items-center gap-2">
                <button class="preview-btn px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition-colors flex items-center gap-1" data-post-id="${post.post_id}">
                  <i data-lucide="eye" class="w-4 h-4"></i>
                  Preview
                </button>
                <a href="#/posts/${post.post_id}" class="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition-colors flex items-center gap-1">
                  <i data-lucide="edit" class="w-4 h-4"></i>
                  Edit
                </a>
                <div class="flex-1"></div>
                <button class="approve-btn px-4 py-1.5 bg-green-600 hover:bg-green-500 rounded-lg text-sm font-medium transition-colors flex items-center gap-1" data-post-id="${post.post_id}">
                  <i data-lucide="check" class="w-4 h-4"></i>
                  Approve
                </button>
                <button class="reject-btn px-4 py-1.5 bg-red-600/80 hover:bg-red-600 rounded-lg text-sm font-medium transition-colors flex items-center gap-1" data-post-id="${post.post_id}">
                  <i data-lucide="x" class="w-4 h-4"></i>
                  Skip
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Carousel Preview Strip -->
        ${isCarousel && mediaCount > 1 ? `
          <div class="bg-slate-900/50 px-5 py-3 border-t border-slate-700">
            <div class="flex gap-2 overflow-x-auto pb-1">
              ${post.media_urls.map((m, i) => `
                <img src="${m.url}" alt="Slide ${i + 1}" class="w-12 h-12 rounded object-cover flex-shrink-0 ${i === 0 ? 'ring-2 ring-brandBlue' : 'opacity-60 hover:opacity-100'}">
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `;
  },
  
  bindActionButtons() {
    // Preview buttons
    document.querySelectorAll('.preview-btn').forEach(btn => {
      btn.addEventListener('click', () => this.showPreview(btn.dataset.postId));
    });
    
    // Approve buttons
    document.querySelectorAll('.approve-btn').forEach(btn => {
      btn.addEventListener('click', () => this.approvePost(btn.dataset.postId));
    });
    
    // Reject buttons
    document.querySelectorAll('.reject-btn').forEach(btn => {
      btn.addEventListener('click', () => this.rejectPost(btn.dataset.postId));
    });
  },
  
  async showPreview(postId) {
    const post = this.posts.find(p => p.post_id === postId);
    if (!post) return;
    
    const isCarousel = post.post_type === 'carousel';
    const mediaCount = post.media_urls?.length || 0;
    
    const overlay = document.createElement('div');
    overlay.id = 'preview-modal';
    overlay.className = 'fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4';
    overlay.innerHTML = `
      <div class="bg-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden border border-slate-700">
        <!-- Header -->
        <div class="flex items-center justify-between p-4 border-b border-slate-700">
          <div class="flex items-center gap-2">
            ${UI.platformIcon(post.platform)}
            <span class="font-medium">${post.subject || 'Post Preview'}</span>
          </div>
          <button id="close-preview" class="p-2 hover:bg-slate-700 rounded-lg transition-colors">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
        </div>
        
        <!-- Content -->
        <div class="overflow-y-auto max-h-[70vh]">
          <!-- Media -->
          ${post.media_urls?.length ? `
            <div class="relative bg-black">
              ${isCarousel ? `
                <div id="carousel-container" class="relative">
                  <div id="carousel-slides" class="flex transition-transform duration-300" style="width: ${mediaCount * 100}%">
                    ${post.media_urls.map(m => `
                      <div class="flex-shrink-0" style="width: ${100/mediaCount}%">
                        ${m.type === 'video' ? `
                          <video src="${m.url}" class="w-full aspect-square object-contain" controls></video>
                        ` : `
                          <img src="${m.url}" alt="" class="w-full aspect-square object-contain">
                        `}
                      </div>
                    `).join('')}
                  </div>
                  <!-- Navigation -->
                  <button id="carousel-prev" class="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-colors">
                    <i data-lucide="chevron-left" class="w-6 h-6"></i>
                  </button>
                  <button id="carousel-next" class="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-colors">
                    <i data-lucide="chevron-right" class="w-6 h-6"></i>
                  </button>
                  <!-- Dots -->
                  <div class="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                    ${post.media_urls.map((_, i) => `
                      <div class="carousel-dot w-2 h-2 rounded-full ${i === 0 ? 'bg-white' : 'bg-white/40'}" data-index="${i}"></div>
                    `).join('')}
                  </div>
                </div>
              ` : `
                ${post.media_urls[0].type === 'video' ? `
                  <video src="${post.media_urls[0].url}" class="w-full aspect-square object-contain" controls></video>
                ` : `
                  <img src="${post.media_urls[0].url}" alt="" class="w-full aspect-square object-contain">
                `}
              `}
            </div>
          ` : ''}
          
          <!-- Caption -->
          <div class="p-4">
            <p class="whitespace-pre-wrap text-gray-200">${post.caption || 'No caption'}</p>
            
            <div class="mt-4 pt-4 border-t border-slate-700 flex items-center gap-4 text-sm text-gray-400">
              <span class="flex items-center gap-1">
                <i data-lucide="calendar" class="w-4 h-4"></i>
                ${post.scheduled_at ? UI.formatDate(post.scheduled_at) : 'Not scheduled'}
              </span>
              ${post.scheduled_at ? `<span class="text-brandBlue">${UI.formatRelativeTime(post.scheduled_at)}</span>` : ''}
            </div>
          </div>
        </div>
        
        <!-- Footer Actions -->
        <div class="flex items-center justify-end gap-3 p-4 border-t border-slate-700 bg-slate-900/50">
          <a href="#/posts/${post.post_id}" class="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors">
            Edit Post
          </a>
          <button id="modal-reject" class="px-4 py-2 bg-red-600/80 hover:bg-red-600 rounded-lg transition-colors">
            Skip
          </button>
          <button id="modal-approve" class="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg font-medium transition-colors">
            Approve
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(overlay);
    lucide.createIcons({ nodes: [overlay] });
    
    // Close button
    overlay.querySelector('#close-preview').onclick = () => overlay.remove();
    overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
    
    // Carousel navigation
    if (isCarousel) {
      let currentSlide = 0;
      const slides = overlay.querySelector('#carousel-slides');
      const dots = overlay.querySelectorAll('.carousel-dot');
      
      const goToSlide = (index) => {
        currentSlide = Math.max(0, Math.min(index, mediaCount - 1));
        slides.style.transform = `translateX(-${currentSlide * (100 / mediaCount)}%)`;
        dots.forEach((dot, i) => {
          dot.classList.toggle('bg-white', i === currentSlide);
          dot.classList.toggle('bg-white/40', i !== currentSlide);
        });
      };
      
      overlay.querySelector('#carousel-prev').onclick = () => goToSlide(currentSlide - 1);
      overlay.querySelector('#carousel-next').onclick = () => goToSlide(currentSlide + 1);
      dots.forEach(dot => {
        dot.onclick = () => goToSlide(parseInt(dot.dataset.index));
        dot.style.cursor = 'pointer';
      });
    }
    
    // Action buttons in modal
    overlay.querySelector('#modal-approve').onclick = async () => {
      overlay.remove();
      await this.approvePost(postId);
    };
    overlay.querySelector('#modal-reject').onclick = async () => {
      overlay.remove();
      await this.rejectPost(postId);
    };
  },
  
  async approvePost(postId) {
    try {
      await API.bulkPostAction('approve', [postId]);
      UI.toast('Post approved!', 'success');
      this.loadApprovals();
      // Refresh badge
      if (typeof refreshApprovalBadge === 'function') refreshApprovalBadge();
    } catch (error) {
      UI.toast('Failed to approve: ' + error.message, 'error');
    }
  },
  
  async rejectPost(postId) {
    const confirmed = await UI.confirm(
      'Are you sure you want to skip this post? It won\'t be published.',
      'Skip Post'
    );
    
    if (!confirmed) return;
    
    try {
      await API.bulkPostAction('skip', [postId]);
      UI.toast('Post skipped', 'success');
      this.loadApprovals();
      // Refresh badge
      if (typeof refreshApprovalBadge === 'function') refreshApprovalBadge();
    } catch (error) {
      UI.toast('Failed to skip: ' + error.message, 'error');
    }
  }
};
