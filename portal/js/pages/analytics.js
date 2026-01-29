/**
 * Analytics Page
 * Show post performance metrics and insights
 */

window.Analytics = {
  period: 'month',
  
  async render(container) {
    container.innerHTML = `
      <div class="space-y-6">
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 class="text-2xl lg:text-3xl font-bold">Analytics</h1>
            <p class="text-gray-400 mt-1">Track your social media posting performance</p>
          </div>
          <div class="flex items-center gap-3">
            <select id="period-select" class="px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg focus:ring-2 focus:ring-brandBlue">
              <option value="week">This Week</option>
              <option value="month" selected>This Month</option>
              <option value="quarter">Last 3 Months</option>
              <option value="year">This Year</option>
            </select>
            <button id="refresh-analytics" class="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors flex items-center gap-2">
              <i data-lucide="refresh-cw" class="w-4 h-4"></i>
              Refresh
            </button>
          </div>
        </div>
        
        <!-- Loading -->
        <div id="analytics-loading" class="p-8 text-center">
          <div class="loading-spinner mx-auto"></div>
          <p class="text-gray-400 mt-3">Loading analytics...</p>
        </div>
        
        <!-- Analytics Content -->
        <div id="analytics-content" class="hidden space-y-6">
          <!-- Main Stats -->
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="bg-slate-800/50 rounded-xl p-5 border border-slate-700">
              <div class="flex items-center gap-3 mb-3">
                <div class="w-10 h-10 bg-brandBlue/20 rounded-lg flex items-center justify-center">
                  <i data-lucide="send" class="w-5 h-5 text-brandBlue"></i>
                </div>
                <span class="text-gray-400 text-sm">Total Posts</span>
              </div>
              <div id="stat-total" class="text-3xl font-bold">0</div>
            </div>
            
            <div class="bg-slate-800/50 rounded-xl p-5 border border-slate-700">
              <div class="flex items-center gap-3 mb-3">
                <div class="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <i data-lucide="check-circle" class="w-5 h-5 text-green-400"></i>
                </div>
                <span class="text-gray-400 text-sm">Posted</span>
              </div>
              <div id="stat-posted" class="text-3xl font-bold text-green-400">0</div>
            </div>
            
            <div class="bg-slate-800/50 rounded-xl p-5 border border-slate-700">
              <div class="flex items-center gap-3 mb-3">
                <div class="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                  <i data-lucide="clock" class="w-5 h-5 text-yellow-400"></i>
                </div>
                <span class="text-gray-400 text-sm">Scheduled</span>
              </div>
              <div id="stat-scheduled" class="text-3xl font-bold text-yellow-400">0</div>
            </div>
            
            <div class="bg-slate-800/50 rounded-xl p-5 border border-slate-700">
              <div class="flex items-center gap-3 mb-3">
                <div class="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <i data-lucide="thumbs-up" class="w-5 h-5 text-purple-400"></i>
                </div>
                <span class="text-gray-400 text-sm">Approval Rate</span>
              </div>
              <div id="stat-approval-rate" class="text-3xl font-bold text-purple-400">0%</div>
            </div>
          </div>
          
          <!-- Charts Row -->
          <div class="grid lg:grid-cols-2 gap-6">
            <!-- Posts by Platform -->
            <div class="bg-slate-800/50 rounded-xl p-5 border border-slate-700">
              <h3 class="font-semibold mb-4 flex items-center gap-2">
                <i data-lucide="pie-chart" class="w-5 h-5 text-brandBlue"></i>
                Posts by Platform
              </h3>
              <div id="platform-chart" class="space-y-3">
                <!-- Rendered dynamically -->
              </div>
            </div>
            
            <!-- Posts by Status -->
            <div class="bg-slate-800/50 rounded-xl p-5 border border-slate-700">
              <h3 class="font-semibold mb-4 flex items-center gap-2">
                <i data-lucide="bar-chart-3" class="w-5 h-5 text-brandBlue"></i>
                Posts by Status
              </h3>
              <div id="status-chart" class="space-y-3">
                <!-- Rendered dynamically -->
              </div>
            </div>
          </div>
          
          <!-- Activity Chart -->
          <div class="bg-slate-800/50 rounded-xl p-5 border border-slate-700">
            <h3 class="font-semibold mb-4 flex items-center gap-2">
              <i data-lucide="activity" class="w-5 h-5 text-brandBlue"></i>
              Posting Activity
            </h3>
            <div id="activity-chart" class="h-48">
              <!-- Activity bar chart -->
            </div>
          </div>
          
          <!-- Recent Posts Table -->
          <div class="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
            <div class="p-5 border-b border-slate-700">
              <h3 class="font-semibold flex items-center gap-2">
                <i data-lucide="list" class="w-5 h-5 text-brandBlue"></i>
                Recent Posts
              </h3>
            </div>
            <div id="recent-posts" class="divide-y divide-slate-700">
              <!-- Rendered dynamically -->
            </div>
          </div>
        </div>
      </div>
    `;
    
    lucide.createIcons();
    
    // Bind events
    document.getElementById('period-select').addEventListener('change', (e) => {
      this.period = e.target.value;
      this.loadAnalytics();
    });
    
    document.getElementById('refresh-analytics').addEventListener('click', () => this.loadAnalytics());
    
    // Load data
    await this.loadAnalytics();
  },
  
  async loadAnalytics() {
    const loading = document.getElementById('analytics-loading');
    const content = document.getElementById('analytics-content');
    
    loading.classList.remove('hidden');
    content.classList.add('hidden');
    
    try {
      // Get period dates
      const now = new Date();
      let startDate;
      switch (this.period) {
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'quarter':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      }
      
      // Fetch all posts for the period
      const data = await API.listPosts({
        from: startDate.toISOString(),
        limit: 500
      });
      const posts = data?.posts || [];
      
      // Calculate stats
      const stats = this.calculateStats(posts);
      
      // Update UI
      this.updateStats(stats);
      this.renderPlatformChart(stats.byPlatform);
      this.renderStatusChart(stats.byStatus);
      this.renderActivityChart(posts, startDate, now);
      this.renderRecentPosts(posts.slice(0, 10));
      
      loading.classList.add('hidden');
      content.classList.remove('hidden');
      
    } catch (error) {
      loading.innerHTML = `
        <div class="text-red-400">
          <i data-lucide="alert-circle" class="w-12 h-12 mx-auto mb-3"></i>
          <p>Failed to load analytics: ${error.message}</p>
          <button onclick="Analytics.loadAnalytics()" class="mt-4 text-brandBlue hover:underline">Try again</button>
        </div>
      `;
      lucide.createIcons();
    }
  },
  
  calculateStats(posts) {
    const byPlatform = {};
    const byStatus = {};
    let approved = 0;
    let totalApprovalDecisions = 0;
    
    posts.forEach(post => {
      // By platform
      byPlatform[post.platform] = (byPlatform[post.platform] || 0) + 1;
      
      // By status
      byStatus[post.status] = (byStatus[post.status] || 0) + 1;
      
      // Approval rate
      if (post.approval_status === 'approved') {
        approved++;
        totalApprovalDecisions++;
      } else if (['rejected', 'skipped'].includes(post.approval_status)) {
        totalApprovalDecisions++;
      }
    });
    
    return {
      total: posts.length,
      posted: byStatus.posted || 0,
      scheduled: byStatus.scheduled || 0,
      failed: byStatus.failed || 0,
      approvalRate: totalApprovalDecisions > 0 
        ? Math.round((approved / totalApprovalDecisions) * 100) 
        : 100,
      byPlatform,
      byStatus
    };
  },
  
  updateStats(stats) {
    document.getElementById('stat-total').textContent = stats.total;
    document.getElementById('stat-posted').textContent = stats.posted;
    document.getElementById('stat-scheduled').textContent = stats.scheduled;
    document.getElementById('stat-approval-rate').textContent = stats.approvalRate + '%';
  },
  
  renderPlatformChart(byPlatform) {
    const container = document.getElementById('platform-chart');
    const total = Object.values(byPlatform).reduce((a, b) => a + b, 0) || 1;
    
    const platforms = PortalConfig.getEnabledPlatforms();
    const bars = platforms.map(p => {
      const count = byPlatform[p.id] || 0;
      const percent = Math.round((count / total) * 100);
      return `
        <div class="flex items-center gap-3">
          <div class="w-20 flex items-center gap-2">
            <i data-lucide="${p.icon}" class="w-4 h-4" style="color: ${p.color}"></i>
            <span class="text-sm">${p.name.slice(0, 2)}</span>
          </div>
          <div class="flex-1 h-6 bg-slate-700 rounded-full overflow-hidden">
            <div class="h-full rounded-full transition-all duration-500" style="width: ${percent}%; background-color: ${p.color}"></div>
          </div>
          <span class="w-16 text-right text-sm text-gray-400">${count} (${percent}%)</span>
        </div>
      `;
    }).join('');
    
    container.innerHTML = bars || '<p class="text-gray-400 text-center py-4">No data</p>';
    lucide.createIcons({ nodes: [container] });
  },
  
  renderStatusChart(byStatus) {
    const container = document.getElementById('status-chart');
    const total = Object.values(byStatus).reduce((a, b) => a + b, 0) || 1;
    
    const statuses = [
      { id: 'posted', label: 'Posted', color: '#22c55e' },
      { id: 'scheduled', label: 'Scheduled', color: '#0ea5e9' },
      { id: 'pending', label: 'Pending', color: '#eab308' },
      { id: 'failed', label: 'Failed', color: '#ef4444' },
      { id: 'cancelled', label: 'Cancelled', color: '#6b7280' }
    ];
    
    const bars = statuses.map(s => {
      const count = byStatus[s.id] || 0;
      if (count === 0) return '';
      const percent = Math.round((count / total) * 100);
      return `
        <div class="flex items-center gap-3">
          <div class="w-24 text-sm">${s.label}</div>
          <div class="flex-1 h-6 bg-slate-700 rounded-full overflow-hidden">
            <div class="h-full rounded-full transition-all duration-500" style="width: ${percent}%; background-color: ${s.color}"></div>
          </div>
          <span class="w-16 text-right text-sm text-gray-400">${count} (${percent}%)</span>
        </div>
      `;
    }).filter(Boolean).join('');
    
    container.innerHTML = bars || '<p class="text-gray-400 text-center py-4">No data</p>';
  },
  
  renderActivityChart(posts, startDate, endDate) {
    const container = document.getElementById('activity-chart');
    
    // Group posts by date
    const byDate = {};
    posts.forEach(post => {
      const date = post.created_at?.slice(0, 10);
      if (date) {
        byDate[date] = (byDate[date] || 0) + 1;
      }
    });
    
    // Generate date range
    const dates = [];
    const current = new Date(startDate);
    while (current <= endDate) {
      dates.push(current.toISOString().slice(0, 10));
      current.setDate(current.getDate() + 1);
    }
    
    // Limit to last 30 days for display
    const displayDates = dates.slice(-30);
    const maxCount = Math.max(...displayDates.map(d => byDate[d] || 0), 1);
    
    const bars = displayDates.map((date, i) => {
      const count = byDate[date] || 0;
      const height = Math.round((count / maxCount) * 100);
      const dayLabel = new Date(date).getDate();
      const isWeekend = [0, 6].includes(new Date(date).getDay());
      
      return `
        <div class="flex flex-col items-center flex-1 min-w-0 group" title="${date}: ${count} posts">
          <div class="w-full max-w-3 h-32 bg-slate-700 rounded-t relative flex items-end">
            <div 
              class="w-full rounded-t transition-all duration-300 ${count > 0 ? 'bg-brandBlue group-hover:bg-sky-400' : 'bg-transparent'}" 
              style="height: ${height}%"
            ></div>
          </div>
          <span class="text-[10px] mt-1 ${isWeekend ? 'text-gray-500' : 'text-gray-400'}">${i % 3 === 0 ? dayLabel : ''}</span>
        </div>
      `;
    }).join('');
    
    container.innerHTML = `
      <div class="flex items-end gap-0.5 h-full">
        ${bars}
      </div>
    `;
  },
  
  renderRecentPosts(posts) {
    const container = document.getElementById('recent-posts');
    
    if (posts.length === 0) {
      container.innerHTML = '<p class="text-gray-400 text-center py-8">No posts found</p>';
      return;
    }
    
    container.innerHTML = posts.map(post => `
      <a href="#/posts/${post.post_id}" class="flex items-center gap-4 p-4 hover:bg-slate-700/30 transition-colors">
        <!-- Thumbnail -->
        ${post.media_urls?.[0]?.url ? `
          <img src="${post.media_urls[0].url}" class="w-12 h-12 rounded-lg object-cover flex-shrink-0">
        ` : `
          <div class="w-12 h-12 bg-slate-700 rounded-lg flex items-center justify-center flex-shrink-0">
            <i data-lucide="file-text" class="w-5 h-5 text-gray-500"></i>
          </div>
        `}
        
        <!-- Info -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2">
            ${UI.platformIcon(post.platform)}
            <span class="font-medium truncate">${post.subject || 'Untitled'}</span>
          </div>
          <p class="text-sm text-gray-400 truncate">${post.caption?.slice(0, 50) || 'No caption'}...</p>
        </div>
        
        <!-- Status & Date -->
        <div class="text-right flex-shrink-0">
          ${UI.statusBadge(post.status)}
          <div class="text-xs text-gray-500 mt-1">${UI.formatDate(post.created_at, false)}</div>
        </div>
      </a>
    `).join('');
    
    lucide.createIcons({ nodes: [container] });
  }
};
