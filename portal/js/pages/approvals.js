/**
 * Unified Approval Center
 * View and approve/reject pending posts and messages
 */

window.Approvals = {
  items: [],
  stats: {},
  currentTab: 'all',
  currentSort: 'urgent',
  selectedItems: [],
  searchQuery: '',

  // Helper function for translations
  t(key, fallback) {
    return window.PortalI18n ? PortalI18n.t(key, fallback) : fallback || key;
  },

  // HTML escape to prevent XSS
  escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },

  // Channel label lookup
  getChannelLabel(item) {
    if (item.type === 'post' && item.platform) {
      const key = `approvals.channel${item.platform.charAt(0).toUpperCase() + item.platform.slice(1)}`;
      return this.t(key, item.platform);
    }
    if (item.type === 'message' && item.channel) {
      const channelMap = {
        instagram_dm: 'approvals.channelInstagramDm',
        facebook_dm: 'approvals.channelFacebookDm',
        instagram_comment: 'approvals.channelInstagramComment',
        facebook_comment: 'approvals.channelFacebookComment',
        email: 'approvals.channelEmail',
        whatsapp: 'approvals.channelWhatsapp',
        sms: 'approvals.channelSms'
      };
      const key = channelMap[item.channel] || null;
      return key ? this.t(key, item.channel) : item.channel;
    }
    return '';
  },

  // Icon based on type + channel/platform
  getItemIcon(item) {
    if (item.type === 'post') {
      return { instagram: 'instagram', facebook: 'facebook', linkedin: 'linkedin' }[item.platform] || 'file-text';
    }
    return {
      instagram_dm: 'message-circle', facebook_dm: 'message-circle',
      instagram_comment: 'message-square', facebook_comment: 'message-square',
      email: 'mail', whatsapp: 'phone', sms: 'smartphone'
    }[item.channel] || 'message-circle';
  },

  // Time left display
  getTimeLeft(expiresAt) {
    if (!expiresAt) return { text: '', isExpired: false };
    const now = new Date();
    const exp = new Date(expiresAt);
    const diffMs = exp - now;

    if (diffMs <= 0) {
      return { text: this.t('approvals.expired', 'Expired'), isExpired: true };
    }

    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    let text = this.t('approvals.expiresIn', 'Expires in') + ' ';
    if (diffDays > 0) {
      text += `${diffDays}d`;
    } else if (diffHours > 0) {
      text += `${diffHours}h`;
    } else {
      text += `${diffMins}m`;
    }

    return { text, isExpired: false, isUrgent: diffHours < 4 };
  },

  async render(container) {
    const t = this.t.bind(this);
    this.selectedItems = [];
    this.searchQuery = '';

    // Check URL for type filter from redirect
    const urlParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
    if (urlParams.get('type')) {
      this.currentTab = urlParams.get('type');
    }

    container.innerHTML = `
      <div class="space-y-6">
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 class="text-2xl lg:text-3xl font-bold">${t('approvals.title', 'Approval Center')}</h1>
            <p class="text-gray-400 mt-1">${t('approvals.subtitle', 'Review and approve posts and messages')}</p>
          </div>
          <div class="flex items-center gap-3">
            <button id="toggle-select-mode" class="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors flex items-center gap-2 text-sm">
              <i data-lucide="check-square" class="w-4 h-4"></i>
              ${t('approvals.selectAll', 'Select')}
            </button>
            <button id="refresh-approvals" class="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors flex items-center gap-2">
              <i data-lucide="refresh-cw" class="w-4 h-4"></i>
              ${t('approvals.refresh', 'Refresh')}
            </button>
          </div>
        </div>

        <!-- Stats Bar -->
        <div class="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <div class="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            <span class="flex items-center gap-2">
              <span id="stat-pending-posts" class="text-lg font-bold text-yellow-400">-</span>
              <span class="text-gray-400">${t('approvals.pendingPosts', 'posts pending')}</span>
            </span>
            <span class="text-slate-600">|</span>
            <span class="flex items-center gap-2">
              <span id="stat-pending-messages" class="text-lg font-bold text-blue-400">-</span>
              <span class="text-gray-400">${t('approvals.pendingMessages', 'messages pending')}</span>
            </span>
            <span class="text-slate-600">|</span>
            <span class="flex items-center gap-2">
              <span id="stat-approved-today" class="text-lg font-bold text-green-400">-</span>
              <span class="text-gray-400">${t('approvals.approvedToday', 'approved today')}</span>
            </span>
          </div>
        </div>

        <!-- Tabs + Filters -->
        <div class="bg-slate-800/50 border border-slate-700 rounded-xl p-4 space-y-3">
          <div class="flex flex-col sm:flex-row sm:items-center gap-3">
            <!-- Tabs -->
            <div class="flex gap-1 bg-slate-900 rounded-lg p-1">
              <button class="tab-btn px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${this.currentTab === 'all' ? 'bg-brandBlue text-white' : 'text-gray-400 hover:text-white'}" data-tab="all">
                ${t('approvals.tabAll', 'All')} <span id="tab-count-all" class="ml-1 opacity-70">(-)</span>
              </button>
              <button class="tab-btn px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${this.currentTab === 'posts' ? 'bg-brandBlue text-white' : 'text-gray-400 hover:text-white'}" data-tab="posts">
                ${t('approvals.tabPosts', 'Posts')} <span id="tab-count-posts" class="ml-1 opacity-70">(-)</span>
              </button>
              <button class="tab-btn px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${this.currentTab === 'messages' ? 'bg-brandBlue text-white' : 'text-gray-400 hover:text-white'}" data-tab="messages">
                ${t('approvals.tabMessages', 'Messages')} <span id="tab-count-messages" class="ml-1 opacity-70">(-)</span>
              </button>
            </div>

            <!-- Search -->
            <div class="flex-1">
              <div class="relative">
                <i data-lucide="search" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"></i>
                <input id="approval-search" type="text" placeholder="${t('approvals.search', 'Search...')}" class="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-sm text-white placeholder-gray-500 focus:ring-2 focus:ring-brandBlue focus:border-transparent">
              </div>
            </div>
          </div>

          <!-- Filter row -->
          <div class="flex flex-wrap items-center gap-3">
            <select id="filter-platform" class="px-3 py-1.5 bg-slate-900 border border-slate-600 rounded-lg text-sm text-gray-300 focus:ring-2 focus:ring-brandBlue">
              <option value="">${t('approvals.allPlatforms', 'All Platforms')}</option>
              <option value="instagram">Instagram</option>
              <option value="facebook">Facebook</option>
              <option value="linkedin">LinkedIn</option>
            </select>
            <select id="filter-channel" class="px-3 py-1.5 bg-slate-900 border border-slate-600 rounded-lg text-sm text-gray-300 focus:ring-2 focus:ring-brandBlue">
              <option value="">${t('approvals.allChannels', 'All Channels')}</option>
              <option value="instagram_dm">Instagram DM</option>
              <option value="facebook_dm">Facebook DM</option>
              <option value="email">Email</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="sms">SMS</option>
            </select>
            <select id="filter-sort" class="px-3 py-1.5 bg-slate-900 border border-slate-600 rounded-lg text-sm text-gray-300 focus:ring-2 focus:ring-brandBlue">
              <option value="urgent" ${this.currentSort === 'urgent' ? 'selected' : ''}>${t('approvals.sortUrgent', 'Most Urgent')}</option>
              <option value="newest" ${this.currentSort === 'newest' ? 'selected' : ''}>${t('approvals.sortNewest', 'Newest First')}</option>
            </select>
          </div>
        </div>

        <!-- Bulk Action Bar (hidden by default) -->
        <div id="bulk-action-bar" class="hidden sticky top-0 z-20 bg-brandBlue/90 backdrop-blur border border-brandBlue rounded-xl p-3 flex items-center justify-between">
          <span class="text-sm font-medium">
            <span id="bulk-count">0</span> ${t('approvals.selected', 'selected')}
          </span>
          <div class="flex items-center gap-2">
            <button id="bulk-approve-btn" class="px-4 py-1.5 bg-green-600 hover:bg-green-500 rounded-lg text-sm font-medium transition-colors">
              ${t('approvals.approveSelected', 'Approve')}
            </button>
            <button id="bulk-reject-btn" class="px-4 py-1.5 bg-red-600 hover:bg-red-500 rounded-lg text-sm font-medium transition-colors">
              ${t('approvals.rejectSelected', 'Reject')}
            </button>
            <button id="bulk-clear-btn" class="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition-colors">
              ${t('approvals.clearSelection', 'Clear')}
            </button>
          </div>
        </div>

        <!-- Approval Items List -->
        <div id="approvals-list" class="space-y-4">
          <div class="p-8 text-center">
            <div class="loading-spinner mx-auto"></div>
          </div>
        </div>
      </div>
    `;

    lucide.createIcons();

    // Bind events
    this.bindEvents();

    // Load data
    await this.loadApprovals();
  },

  bindEvents() {
    document.getElementById('refresh-approvals').addEventListener('click', () => this.loadApprovals());

    // Tab clicks
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.currentTab = btn.dataset.tab;
        this.updateTabUI();
        this.loadApprovals();
      });
    });

    // Search (debounced)
    let searchTimeout;
    document.getElementById('approval-search').addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        this.searchQuery = e.target.value.trim();
        this.loadApprovals();
      }, 300);
    });

    // Sort filter
    document.getElementById('filter-sort').addEventListener('change', (e) => {
      this.currentSort = e.target.value;
      this.loadApprovals();
    });

    // Platform filter
    document.getElementById('filter-platform').addEventListener('change', () => this.loadApprovals());

    // Channel filter
    document.getElementById('filter-channel').addEventListener('change', () => this.loadApprovals());

    // Select mode toggle
    document.getElementById('toggle-select-mode').addEventListener('click', () => this.toggleSelectMode());

    // Bulk actions
    document.getElementById('bulk-approve-btn').addEventListener('click', () => this.bulkApprove());
    document.getElementById('bulk-reject-btn').addEventListener('click', () => this.bulkReject());
    document.getElementById('bulk-clear-btn').addEventListener('click', () => this.clearSelection());
  },

  updateTabUI() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
      if (btn.dataset.tab === this.currentTab) {
        btn.classList.add('bg-brandBlue', 'text-white');
        btn.classList.remove('text-gray-400');
      } else {
        btn.classList.remove('bg-brandBlue', 'text-white');
        btn.classList.add('text-gray-400');
      }
    });
  },

  async loadApprovals() {
    const listContainer = document.getElementById('approvals-list');
    listContainer.innerHTML = `
      <div class="p-8 text-center">
        <div class="loading-spinner mx-auto"></div>
      </div>
    `;

    const platformFilter = document.getElementById('filter-platform')?.value || '';
    const channelFilter = document.getElementById('filter-channel')?.value || '';

    try {
      const filters = {
        type: this.currentTab,
        sort: this.currentSort,
        limit: 50
      };
      if (platformFilter) filters.platform = platformFilter;
      if (channelFilter) filters.channel = channelFilter;
      if (this.searchQuery) filters.search = this.searchQuery;

      const data = await API.listApprovals(filters);
      this.items = data?.items || [];
      this.stats = data?.stats || {};

      // Update stats
      document.getElementById('stat-pending-posts').textContent = this.stats.pending_posts ?? 0;
      document.getElementById('stat-pending-messages').textContent = this.stats.pending_messages ?? 0;
      document.getElementById('stat-approved-today').textContent = this.stats.approved_today ?? 0;

      // Update tab counts
      const totalCount = (this.stats.pending_posts ?? 0) + (this.stats.pending_messages ?? 0);
      document.getElementById('tab-count-all').textContent = `(${totalCount})`;
      document.getElementById('tab-count-posts').textContent = `(${this.stats.pending_posts ?? 0})`;
      document.getElementById('tab-count-messages').textContent = `(${this.stats.pending_messages ?? 0})`;

      // Update sidebar badge
      this.updateBadge(totalCount);

      if (this.items.length === 0) {
        this.renderEmptyState(listContainer);
        return;
      }

      listContainer.innerHTML = this.items.map(item => this.renderApprovalCard(item)).join('');
      lucide.createIcons();
      this.bindCardActions();

    } catch (err) {
      const t = this.t.bind(this);
      listContainer.innerHTML = `
        <div class="p-8 text-center text-red-400">
          <i data-lucide="alert-circle" class="w-12 h-12 mx-auto mb-3"></i>
          <p>${t('approvals.failedLoad', 'Failed to load approvals')}: ${this.escapeHtml(err.message)}</p>
          <button onclick="Approvals.loadApprovals()" class="mt-4 text-brandBlue hover:underline">${t('approvals.tryAgain', 'Try again')}</button>
        </div>
      `;
      lucide.createIcons();
    }
  },

  renderEmptyState(container) {
    const t = this.t.bind(this);
    let emptyMsg = t('approvals.noItemsDesc', 'All caught up! New items will appear here when they need your review.');
    if (this.currentTab === 'posts') {
      emptyMsg = t('approvals.noPostsDesc', 'No posts waiting for approval.');
    } else if (this.currentTab === 'messages') {
      emptyMsg = t('approvals.noMessagesDesc', 'No messages waiting for approval.');
    }

    container.innerHTML = `
      <div class="bg-slate-800/50 rounded-xl border border-slate-700 p-12 text-center">
        <i data-lucide="check-circle-2" class="w-16 h-16 mx-auto mb-4 text-green-400 opacity-50"></i>
        <h3 class="text-lg font-medium mb-2">${t('approvals.noItems', 'No pending approvals')}</h3>
        <p class="text-gray-400">${emptyMsg}</p>
      </div>
    `;
    lucide.createIcons();
  },

  renderApprovalCard(item) {
    const t = this.t.bind(this);
    const isPost = item.type === 'post';
    const isMessage = item.type === 'message';
    const icon = this.getItemIcon(item);
    const typeLabel = isPost ? t('approvals.typePost', 'POST') : t('approvals.typeMessage', 'MESSAGE');
    const channelLabel = this.getChannelLabel(item);
    const timeLeft = this.getTimeLeft(item.expires_at);
    const isSelected = this.selectedItems.some(s => s.type === item.type && s.id === item.id);
    const selectMode = document.body.classList.contains('select-mode');

    return `
      <div class="approval-card bg-slate-800/50 rounded-xl border ${isSelected ? 'border-brandBlue' : 'border-slate-700'} overflow-hidden hover:border-slate-600 transition-colors" data-type="${item.type}" data-id="${item.id}">
        <div class="p-5">
          <!-- Card Header -->
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2">
              ${selectMode ? `
                <input type="checkbox" class="card-checkbox w-4 h-4 rounded border-slate-500 text-brandBlue focus:ring-brandBlue bg-slate-900" ${isSelected ? 'checked' : ''} data-type="${item.type}" data-id="${item.id}">
              ` : ''}
              <i data-lucide="${icon}" class="w-4 h-4 ${isPost ? 'text-purple-400' : 'text-blue-400'}"></i>
              <span class="text-xs font-bold uppercase tracking-wide ${isPost ? 'text-purple-400' : 'text-blue-400'}">${typeLabel}</span>
              <span class="text-slate-600">&#8226;</span>
              <span class="text-sm text-gray-300">${channelLabel}</span>
            </div>
            ${timeLeft.text ? `
              <span class="text-xs px-2 py-1 rounded-full ${timeLeft.isExpired ? 'bg-red-500/20 text-red-400' : timeLeft.isUrgent ? 'bg-yellow-500/20 text-yellow-400' : 'bg-slate-700 text-gray-400'}">
                ${timeLeft.text}
              </span>
            ` : ''}
          </div>

          <!-- Content -->
          ${isMessage ? this.renderMessageContent(item) : ''}
          ${isPost ? this.renderPostContent(item) : ''}

          <!-- Actions -->
          <div class="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-slate-700">
            <button class="approve-btn px-4 py-1.5 bg-green-600 hover:bg-green-500 rounded-lg text-sm font-medium transition-colors flex items-center gap-1" data-type="${item.type}" data-id="${item.id}">
              <i data-lucide="check" class="w-4 h-4"></i>
              ${isPost ? t('approvals.approveAndSchedule', 'Approve & Schedule') : t('approvals.approveAndSend', 'Approve & Send')}
            </button>
            <button class="edit-btn px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition-colors flex items-center gap-1" data-type="${item.type}" data-id="${item.id}">
              <i data-lucide="edit" class="w-4 h-4"></i>
              ${t('approvals.edit', 'Edit')}
            </button>
            <button class="reject-btn px-3 py-1.5 bg-red-600/80 hover:bg-red-600 rounded-lg text-sm transition-colors flex items-center gap-1" data-type="${item.type}" data-id="${item.id}">
              <i data-lucide="x" class="w-4 h-4"></i>
              ${t('approvals.reject', 'Reject')}
            </button>
            ${isPost && item.scheduled_at ? `
              <span class="ml-auto text-xs text-gray-500 flex items-center gap-1">
                <i data-lucide="calendar" class="w-3 h-3"></i>
                ${UI.formatDate(item.scheduled_at)}
              </span>
            ` : ''}
          </div>
        </div>

        <!-- Carousel Strip for multi-image posts -->
        ${isPost && item.context?.post_type === 'carousel' && item.media_urls?.length > 1 ? `
          <div class="bg-slate-900/50 px-5 py-3 border-t border-slate-700">
            <div class="flex gap-2 overflow-x-auto pb-1">
              ${item.media_urls.map((m, i) => `
                <img src="${m.url}" alt="Slide ${i + 1}" class="w-12 h-12 rounded object-cover flex-shrink-0 ${i === 0 ? 'ring-2 ring-brandBlue' : 'opacity-60 hover:opacity-100'}">
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `;
  },

  renderMessageContent(item) {
    const t = this.t.bind(this);
    return `
      <div class="space-y-3">
        <div class="text-sm">
          <span class="text-gray-500">${t('approvals.to', 'To')}:</span>
          <span class="text-gray-200 ml-1">${this.escapeHtml(item.recipient || '')}${item.recipient_name ? ` (${this.escapeHtml(item.recipient_name)})` : ''}</span>
        </div>
        ${item.subject ? `
          <div class="text-sm">
            <span class="text-gray-500">${t('approvals.subject', 'Subject')}:</span>
            <span class="text-gray-200 ml-1">${this.escapeHtml(item.subject)}</span>
          </div>
        ` : ''}
        ${item.context?.their_message ? `
          <div class="bg-slate-900/60 rounded-lg p-3 border-l-2 border-slate-600">
            <div class="text-xs text-gray-500 mb-1">${t('approvals.theirMessage', 'Their message')}:</div>
            <p class="text-sm text-gray-300">${this.escapeHtml(item.context.their_message)}</p>
          </div>
        ` : ''}
        <div class="bg-green-500/5 rounded-lg p-3 border-l-2 border-green-600/40">
          <div class="text-xs text-gray-500 mb-1">${t('approvals.aiResponse', 'AI response')}:</div>
          <p class="text-sm text-gray-200">${this.escapeHtml(item.content_preview || '')}</p>
        </div>
      </div>
    `;
  },

  renderPostContent(item) {
    const hasImage = item.media_urls && item.media_urls.length > 0;
    const firstMedia = hasImage ? item.media_urls[0] : null;
    const isCarousel = item.context?.post_type === 'carousel';
    const mediaCount = item.media_urls?.length || 0;

    return `
      <div class="flex gap-4">
        ${hasImage ? `
          <div class="flex-shrink-0">
            <div class="relative w-28 h-28 rounded-lg overflow-hidden bg-slate-700">
              ${firstMedia.type === 'video' ? `
                <video src="${firstMedia.url}" class="w-full h-full object-cover"></video>
                <div class="absolute inset-0 flex items-center justify-center bg-black/30">
                  <i data-lucide="play-circle" class="w-8 h-8 text-white"></i>
                </div>
              ` : `
                <img src="${firstMedia.url}" alt="" class="w-full h-full object-cover">
              `}
              ${isCarousel ? `
                <div class="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded-full">
                  1/${mediaCount}
                </div>
              ` : ''}
            </div>
          </div>
        ` : ''}
        <div class="flex-1 min-w-0">
          ${item.subject ? `<div class="font-medium text-gray-200 mb-1">${this.escapeHtml(item.subject)}</div>` : ''}
          <p class="text-sm text-gray-300 line-clamp-3">${this.escapeHtml(item.content_preview || 'No caption')}</p>
          ${item.context?.hashtags?.length ? `
            <div class="mt-2 text-xs text-brandBlue">${item.context.hashtags.map(h => h.startsWith('#') ? h : '#' + h).join(' ')}</div>
          ` : ''}
        </div>
      </div>
    `;
  },

  bindCardActions() {
    // Approve buttons
    document.querySelectorAll('.approve-btn').forEach(btn => {
      btn.addEventListener('click', () => this.approveItem(btn.dataset.type, btn.dataset.id));
    });

    // Reject buttons
    document.querySelectorAll('.reject-btn').forEach(btn => {
      btn.addEventListener('click', () => this.rejectItem(btn.dataset.type, btn.dataset.id));
    });

    // Edit buttons
    document.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', () => this.openEditModal(btn.dataset.type, btn.dataset.id));
    });

    // Checkboxes
    document.querySelectorAll('.card-checkbox').forEach(cb => {
      cb.addEventListener('change', () => this.toggleItemSelection(cb.dataset.type, cb.dataset.id));
    });
  },

  async approveItem(type, id) {
    const t = this.t.bind(this);
    const isPost = type === 'post';
    const confirmMsg = isPost
      ? t('approvals.confirmApprovePost', 'Approve and schedule this post?')
      : t('approvals.confirmApproveMessage', 'Approve and send this message?');

    const confirmed = await UI.confirm(confirmMsg, t('approvals.title', 'Approval Center'));
    if (!confirmed) return;

    try {
      await API.approveApprovalItem(type, id);
      const successMsg = isPost
        ? t('approvals.postApproved', 'Post approved and scheduled!')
        : t('approvals.messageApproved', 'Message approved and sent!');
      UI.toast(successMsg, 'success');
      this.loadApprovals();
      if (typeof refreshApprovalBadge === 'function') refreshApprovalBadge();
    } catch (err) {
      UI.toast(t('approvals.failedApprove', 'Failed to approve') + ': ' + err.message, 'error');
    }
  },

  async rejectItem(type, id) {
    const t = this.t.bind(this);
    const confirmed = await UI.confirm(
      t('approvals.confirmRejectDesc', 'This action cannot be undone.'),
      t('approvals.confirmReject', 'Reject this item?')
    );
    if (!confirmed) return;

    try {
      await API.rejectApprovalItem(type, id);
      UI.toast(t('approvals.itemRejected', 'Item rejected'), 'success');
      this.loadApprovals();
      if (typeof refreshApprovalBadge === 'function') refreshApprovalBadge();
    } catch (err) {
      UI.toast(t('approvals.failedReject', 'Failed to reject') + ': ' + err.message, 'error');
    }
  },

  openEditModal(type, id) {
    const item = this.items.find(i => i.type === type && i.id === id);
    if (!item) return;

    const t = this.t.bind(this);
    const isPost = type === 'post';
    const title = isPost ? t('approvals.editPost', 'Edit Post') : t('approvals.editMessage', 'Edit Message');

    const overlay = document.createElement('div');
    overlay.id = 'edit-modal';
    overlay.className = 'fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4';
    overlay.innerHTML = `
      <div class="bg-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden border border-slate-700">
        <div class="flex items-center justify-between p-4 border-b border-slate-700">
          <h3 class="text-lg font-medium">${title}</h3>
          <button id="close-edit-modal" class="p-2 hover:bg-slate-700 rounded-lg transition-colors">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
        </div>

        <div class="p-4 overflow-y-auto max-h-[60vh] space-y-4">
          ${isPost ? this.renderPostEditForm(item) : this.renderMessageEditForm(item)}
        </div>

        <div class="flex items-center justify-between p-4 border-t border-slate-700 bg-slate-900/50">
          <button id="reset-original-btn" class="text-sm text-gray-400 hover:text-white transition-colors">
            ${t('approvals.resetToOriginal', 'Reset to Original')}
          </button>
          <div class="flex items-center gap-3">
            <button id="cancel-edit-btn" class="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors text-sm">
              ${t('approvals.cancel', 'Cancel')}
            </button>
            <button id="save-approve-btn" class="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg font-medium transition-colors text-sm">
              ${t('approvals.saveAndApprove', 'Save & Approve')}
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    lucide.createIcons({ nodes: [overlay] });

    // Store original content for reset
    const originalContent = item.content_preview || '';

    // Close handlers
    const closeModal = () => overlay.remove();
    overlay.querySelector('#close-edit-modal').onclick = closeModal;
    overlay.querySelector('#cancel-edit-btn').onclick = closeModal;
    overlay.onclick = (e) => { if (e.target === overlay) closeModal(); };

    // Reset to original
    overlay.querySelector('#reset-original-btn').onclick = () => {
      const textarea = overlay.querySelector('#edited-content');
      if (textarea) textarea.value = originalContent;
    };

    // Save & Approve
    overlay.querySelector('#save-approve-btn').onclick = async () => {
      const editedContent = overlay.querySelector('#edited-content')?.value || '';
      closeModal();
      try {
        await API.approveApprovalItem(type, id, editedContent !== originalContent ? editedContent : null);
        const successMsg = isPost
          ? t('approvals.postApproved', 'Post approved and scheduled!')
          : t('approvals.messageApproved', 'Message approved and sent!');
        UI.toast(successMsg, 'success');
        this.loadApprovals();
        if (typeof refreshApprovalBadge === 'function') refreshApprovalBadge();
      } catch (err) {
        UI.toast(t('approvals.failedApprove', 'Failed to approve') + ': ' + err.message, 'error');
      }
    };
  },

  renderMessageEditForm(item) {
    const t = this.t.bind(this);
    return `
      <div class="space-y-4">
        <div class="text-sm">
          <span class="text-gray-500">${t('approvals.to', 'To')}:</span>
          <span class="text-gray-200 ml-1">${this.escapeHtml(item.recipient || '')}</span>
        </div>
        ${item.subject ? `
          <div class="text-sm">
            <span class="text-gray-500">${t('approvals.subject', 'Subject')}:</span>
            <span class="text-gray-200 ml-1">${this.escapeHtml(item.subject)}</span>
          </div>
        ` : ''}
        ${item.context?.their_message ? `
          <div>
            <label class="block text-sm text-gray-400 mb-1">${t('approvals.theirMessage', 'Their message')}:</label>
            <div class="bg-slate-900 rounded-lg p-3 text-sm text-gray-300 border border-slate-700">${this.escapeHtml(item.context.their_message)}</div>
          </div>
        ` : ''}
        <div>
          <label class="block text-sm text-gray-400 mb-1">${t('approvals.originalContent', 'Original AI Content')}:</label>
          <div class="bg-slate-900 rounded-lg p-3 text-sm text-gray-300 border border-slate-700">${this.escapeHtml(item.content_preview || '')}</div>
        </div>
        <div>
          <label class="block text-sm text-gray-400 mb-1">${t('approvals.yourVersion', 'Your Edited Version')}:</label>
          <textarea id="edited-content" rows="6" class="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-brandBlue focus:border-transparent">${this.escapeHtml(item.content_preview || '')}</textarea>
        </div>
      </div>
    `;
  },

  renderPostEditForm(item) {
    const t = this.t.bind(this);
    const firstImage = item.media_urls?.[0];

    return `
      <div class="space-y-4">
        ${firstImage ? `
          <div class="flex justify-center">
            <img src="${firstImage.url}" alt="" class="max-h-48 rounded-lg object-contain">
          </div>
        ` : ''}
        <div>
          <label class="block text-sm text-gray-400 mb-1">${t('approvals.originalContent', 'Original AI Content')}:</label>
          <div class="bg-slate-900 rounded-lg p-3 text-sm text-gray-300 border border-slate-700">${this.escapeHtml(item.content_preview || '')}</div>
        </div>
        <div>
          <label class="block text-sm text-gray-400 mb-1">${t('approvals.yourVersion', 'Your Edited Version')}:</label>
          <textarea id="edited-content" rows="6" class="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-brandBlue focus:border-transparent">${this.escapeHtml(item.content_preview || '')}</textarea>
        </div>
        ${item.context?.hashtags?.length ? `
          <div>
            <label class="block text-sm text-gray-400 mb-1">Hashtags:</label>
            <input type="text" id="edited-hashtags" value="${item.context.hashtags.join(' ')}" class="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-brandBlue focus:border-transparent">
          </div>
        ` : ''}
      </div>
    `;
  },

  // --- Bulk Selection ---

  toggleSelectMode() {
    const isSelectMode = document.body.classList.toggle('select-mode');
    if (!isSelectMode) {
      this.clearSelection();
    }
    // Re-render to show/hide checkboxes
    if (this.items.length > 0) {
      const listContainer = document.getElementById('approvals-list');
      listContainer.innerHTML = this.items.map(item => this.renderApprovalCard(item)).join('');
      lucide.createIcons();
      this.bindCardActions();
    }
  },

  toggleItemSelection(type, id) {
    const key = `${type}:${id}`;
    const index = this.selectedItems.findIndex(i => `${i.type}:${i.id}` === key);

    if (index >= 0) {
      this.selectedItems.splice(index, 1);
    } else {
      this.selectedItems.push({ type, id });
    }

    this.updateSelectionUI();
  },

  updateSelectionUI() {
    const bar = document.getElementById('bulk-action-bar');
    const count = this.selectedItems.length;

    if (count > 0) {
      bar.classList.remove('hidden');
      document.getElementById('bulk-count').textContent = count;
    } else {
      bar.classList.add('hidden');
    }

    // Update card borders
    document.querySelectorAll('.approval-card').forEach(card => {
      const key = `${card.dataset.type}:${card.dataset.id}`;
      const isSelected = this.selectedItems.some(i => `${i.type}:${i.id}` === key);
      card.classList.toggle('border-brandBlue', isSelected);
      card.classList.toggle('border-slate-700', !isSelected);
    });
  },

  clearSelection() {
    this.selectedItems = [];
    this.updateSelectionUI();
    document.querySelectorAll('.card-checkbox').forEach(cb => cb.checked = false);
  },

  async bulkApprove() {
    const t = this.t.bind(this);
    if (this.selectedItems.length === 0) return;

    const confirmed = await UI.confirm(
      t('approvals.confirmBulkApprove', 'Approve selected items?'),
      t('approvals.title', 'Approval Center')
    );
    if (!confirmed) return;

    try {
      const result = await API.bulkApproveItems(this.selectedItems);
      const count = result?.approved_count || this.selectedItems.length;
      UI.toast(`${count} ${t('approvals.bulkApproved', 'items approved!')}`, 'success');
      this.clearSelection();
      document.body.classList.remove('select-mode');
      this.loadApprovals();
      if (typeof refreshApprovalBadge === 'function') refreshApprovalBadge();
    } catch (err) {
      UI.toast(t('approvals.failedApprove', 'Failed to approve') + ': ' + err.message, 'error');
    }
  },

  async bulkReject() {
    const t = this.t.bind(this);
    if (this.selectedItems.length === 0) return;

    const confirmed = await UI.confirm(
      t('approvals.confirmBulkReject', 'Reject selected items?'),
      t('approvals.title', 'Approval Center')
    );
    if (!confirmed) return;

    try {
      const result = await API.bulkRejectItems(this.selectedItems);
      const count = result?.rejected_count || this.selectedItems.length;
      UI.toast(`${count} ${t('approvals.bulkRejected', 'items rejected')}`, 'success');
      this.clearSelection();
      document.body.classList.remove('select-mode');
      this.loadApprovals();
      if (typeof refreshApprovalBadge === 'function') refreshApprovalBadge();
    } catch (err) {
      UI.toast(t('approvals.failedReject', 'Failed to reject') + ': ' + err.message, 'error');
    }
  },

  // --- Badge ---

  updateBadge(count) {
    const badge = document.getElementById('approval-badge');
    if (badge) {
      if (count > 0) {
        badge.textContent = count;
        badge.classList.remove('hidden');
      } else {
        badge.classList.add('hidden');
      }
    }
  }
};
