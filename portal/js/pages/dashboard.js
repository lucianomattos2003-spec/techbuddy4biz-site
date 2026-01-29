/**
 * Dashboard Page
 * Shows overview: upcoming posts, recent history, quick actions
 */

window.Dashboard = {
  async render(container) {
    const clientName = Auth.getDisplayName();
    
    // Fetch upcoming and recent posts in parallel
    const [upcomingData, recentData] = await Promise.all([
      API.listPosts({ status: 'ready', limit: 10 }),
      API.listPosts({ limit: 10 })
    ]).catch(() => [{ posts: [] }, { posts: [] }]);
    
    const upcomingPosts = upcomingData?.posts || [];
    const recentPosts = recentData?.posts?.filter(p => 
      ['posted', 'failed', 'cancelled'].includes(p.status)
    ).slice(0, 5) || [];
    
    container.innerHTML = `
      <div class="space-y-8">
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 class="text-2xl lg:text-3xl font-bold">Welcome back, ${clientName}!</h1>
            <p class="text-gray-400 mt-1">Here's what's happening with your content</p>
          </div>
          <div class="flex gap-3">
            <a href="#/posts/new" class="flex items-center gap-2 px-4 py-2 bg-brandBlue hover:bg-sky-600 rounded-lg transition-colors">
              <i data-lucide="plus" class="w-4 h-4"></i>
              New Post
            </a>
            <a href="#/batches/new" class="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors">
              <i data-lucide="layers" class="w-4 h-4"></i>
              New Batch
            </a>
          </div>
        </div>
        
        <!-- Stats Cards -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <i data-lucide="calendar" class="w-5 h-5 text-blue-400"></i>
              </div>
              <div>
                <p class="text-2xl font-bold">${upcomingPosts.length}</p>
                <p class="text-sm text-gray-400">Scheduled</p>
              </div>
            </div>
          </div>
          
          <div class="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <i data-lucide="check-circle" class="w-5 h-5 text-green-400"></i>
              </div>
              <div>
                <p class="text-2xl font-bold">${recentPosts.filter(p => p.status === 'posted').length}</p>
                <p class="text-sm text-gray-400">Posted</p>
              </div>
            </div>
          </div>
          
          <div class="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <i data-lucide="clock" class="w-5 h-5 text-yellow-400"></i>
              </div>
              <div>
                <p class="text-2xl font-bold">${upcomingPosts.filter(p => p.approval_status === 'pending').length}</p>
                <p class="text-sm text-gray-400">Pending</p>
              </div>
            </div>
          </div>
          
          <div class="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                <i data-lucide="alert-circle" class="w-5 h-5 text-red-400"></i>
              </div>
              <div>
                <p class="text-2xl font-bold">${recentPosts.filter(p => p.status === 'failed').length}</p>
                <p class="text-sm text-gray-400">Failed</p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Main Grid -->
        <div class="grid lg:grid-cols-2 gap-6">
          <!-- Upcoming Posts -->
          <div class="bg-slate-800/50 rounded-xl border border-slate-700">
            <div class="p-4 border-b border-slate-700 flex items-center justify-between">
              <h2 class="font-semibold flex items-center gap-2">
                <i data-lucide="calendar" class="w-5 h-5 text-brandBlue"></i>
                Upcoming Posts
              </h2>
              <a href="#/posts" class="text-sm text-brandBlue hover:underline">View all</a>
            </div>
            <div class="divide-y divide-slate-700">
              ${upcomingPosts.length === 0 ? `
                <div class="p-8 text-center text-gray-400">
                  <i data-lucide="inbox" class="w-12 h-12 mx-auto mb-3 opacity-50"></i>
                  <p>No scheduled posts</p>
                  <a href="#/posts/new" class="text-brandBlue hover:underline text-sm">Create your first post</a>
                </div>
              ` : upcomingPosts.slice(0, 5).map(post => `
                <a href="#/posts/${post.post_id}" class="block p-4 hover:bg-slate-700/50 transition-colors">
                  <div class="flex items-start gap-3">
                    ${post.media_urls?.[0]?.url ? `
                      <img src="${post.media_urls[0].url}" class="w-12 h-12 rounded-lg object-cover flex-shrink-0">
                    ` : `
                      <div class="w-12 h-12 bg-slate-700 rounded-lg flex items-center justify-center flex-shrink-0">
                        <i data-lucide="file-text" class="w-5 h-5 text-gray-500"></i>
                      </div>
                    `}
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2 mb-1">
                        ${UI.platformIcon(post.platform)}
                        <span class="text-sm font-medium">${post.subject || 'Untitled'}</span>
                      </div>
                      <p class="text-sm text-gray-400 truncate">${UI.truncate(post.caption, 60)}</p>
                      <p class="text-xs text-gray-500 mt-1">${UI.formatRelativeTime(post.scheduled_at)}</p>
                    </div>
                    ${UI.statusBadge(post.approval_status)}
                  </div>
                </a>
              `).join('')}
            </div>
          </div>
          
          <!-- Recent Activity -->
          <div class="bg-slate-800/50 rounded-xl border border-slate-700">
            <div class="p-4 border-b border-slate-700 flex items-center justify-between">
              <h2 class="font-semibold flex items-center gap-2">
                <i data-lucide="activity" class="w-5 h-5 text-brandOrange"></i>
                Recent Activity
              </h2>
            </div>
            <div class="divide-y divide-slate-700">
              ${recentPosts.length === 0 ? `
                <div class="p-8 text-center text-gray-400">
                  <i data-lucide="clock" class="w-12 h-12 mx-auto mb-3 opacity-50"></i>
                  <p>No recent activity</p>
                </div>
              ` : recentPosts.map(post => `
                <div class="p-4">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full flex items-center justify-center ${
                      post.status === 'posted' ? 'bg-green-500/20' : 
                      post.status === 'failed' ? 'bg-red-500/20' : 'bg-gray-500/20'
                    }">
                      <i data-lucide="${
                        post.status === 'posted' ? 'check' : 
                        post.status === 'failed' ? 'x' : 'minus'
                      }" class="w-4 h-4 ${
                        post.status === 'posted' ? 'text-green-400' : 
                        post.status === 'failed' ? 'text-red-400' : 'text-gray-400'
                      }"></i>
                    </div>
                    <div class="flex-1">
                      <p class="text-sm">
                        <span class="font-medium">${post.subject || 'Post'}</span>
                        <span class="text-gray-400">was ${post.status}</span>
                      </p>
                      <p class="text-xs text-gray-500">${UI.formatRelativeTime(post.posted_at || post.created_at)}</p>
                    </div>
                    ${UI.platformIcon(post.platform)}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
        
        <!-- Quick Links -->
        <div class="grid sm:grid-cols-3 gap-4">
          <a href="#/media" class="bg-slate-800/50 rounded-xl p-6 border border-slate-700 hover:border-brandBlue transition-colors group">
            <div class="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-500/30 transition-colors">
              <i data-lucide="image" class="w-6 h-6 text-purple-400"></i>
            </div>
            <h3 class="font-semibold mb-1">Media Library</h3>
            <p class="text-sm text-gray-400">Upload and manage your images</p>
          </a>
          
          <a href="#/schedule" class="bg-slate-800/50 rounded-xl p-6 border border-slate-700 hover:border-brandBlue transition-colors group">
            <div class="w-12 h-12 bg-teal-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-teal-500/30 transition-colors">
              <i data-lucide="settings" class="w-6 h-6 text-teal-400"></i>
            </div>
            <h3 class="font-semibold mb-1">Schedule Settings</h3>
            <p class="text-sm text-gray-400">Configure posting times</p>
          </a>
          
          <a href="#/batches/new" class="bg-slate-800/50 rounded-xl p-6 border border-slate-700 hover:border-brandBlue transition-colors group">
            <div class="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-orange-500/30 transition-colors">
              <i data-lucide="upload" class="w-6 h-6 text-orange-400"></i>
            </div>
            <h3 class="font-semibold mb-1">Bulk Upload</h3>
            <p class="text-sm text-gray-400">Schedule multiple posts at once</p>
          </a>
        </div>
      </div>
    `;
    
    lucide.createIcons();
    
    // Update approval badge in sidebar (fetch actual pending approvals)
    refreshApprovalBadge();
  },
  
  /**
   * Update the approval badge count in the sidebar
   */
  updateApprovalBadge(posts) {
    const badge = document.getElementById('approval-badge');
    if (!badge) return;
    
    // Posts are already filtered by approval_status='pending' from the API
    const pendingCount = posts?.length || 0;
    
    if (pendingCount > 0) {
      badge.textContent = pendingCount;
      badge.classList.remove('hidden');
    } else {
      badge.classList.add('hidden');
    }
  }
};

// Global function to refresh approval badge (can be called from other pages)
window.refreshApprovalBadge = async () => {
  try {
    const data = await API.listPosts({ approval_status: 'pending', limit: 100 });
    const posts = data?.posts || [];
    Dashboard.updateApprovalBadge(posts);
  } catch (e) {
    console.warn('Failed to refresh approval badge:', e);
  }
};
