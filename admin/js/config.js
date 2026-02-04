/**
 * TBB Admin Configuration Dashboard
 * JavaScript for /admin/config.html
 */

// ============================================================================
// GLOBAL STATE
// ============================================================================

let currentUser = null;
let accessToken = null;
let selectedClientId = null;
let clientsCache = [];
let rulesEditor = null;
let promptEditor = null;

// Data caches per client
const dataCache = {
  overview: null,
  schedules: [],
  themes: [],
  prompts: [],
  rules: null,
  branding: null,
  hashtags: []
};

// ============================================================================
// INITIALIZATION
// ============================================================================

document.addEventListener('DOMContentLoaded', async () => {
  console.log('🔧 Admin Config: Initializing...');

  // Check authentication - use same keys as portal (tb_* prefix)
  accessToken = localStorage.getItem('tb_access_token');
  const userJson = localStorage.getItem('tb_user');

  console.log('🔑 Auth check:', { hasToken: !!accessToken, hasUser: !!userJson });

  if (!accessToken || !userJson) {
    console.log('❌ No auth found, redirecting to portal...');
    window.location.href = '/portal/index.html';
    return;
  }

  try {
    currentUser = JSON.parse(userJson);
    console.log('👤 User loaded:', { email: currentUser.email, role: currentUser.role });

    // Verify admin role
    if (currentUser.role !== 'admin') {
      console.log('❌ Not admin role:', currentUser.role);
      showToast('Admin access required', 'error');
      setTimeout(() => window.location.href = '/portal/index.html', 2000);
      return;
    }

    console.log('✅ Admin verified, loading dashboard...');
    document.getElementById('admin-user').textContent = currentUser.email;

    // Load clients
    console.log('📋 Loading clients...');
    await loadClients();
    console.log('✅ Clients loaded');

    // Setup tab navigation
    setupTabs();

    // Initialize Monaco editor
    console.log('📝 Initializing Monaco editor...');
    initMonacoEditor();

    // Show main content
    document.getElementById('loading-screen').classList.add('hidden');
    document.getElementById('main-content').classList.remove('hidden');

    // Initialize Lucide icons
    lucide.createIcons();

    console.log('✅ Admin Config: Ready!');

  } catch (err) {
    console.error('❌ Init error:', err);
    // Show error on page instead of just console
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
      loadingScreen.innerHTML = `
        <div class="text-center p-8">
          <div class="text-red-500 text-xl mb-4">Failed to initialize</div>
          <div class="text-gray-400 text-sm mb-4">${err.message}</div>
          <a href="/portal/index.html" class="text-brandBlue underline">Return to Portal</a>
        </div>
      `;
    }
  }
});

// ============================================================================
// API HELPERS
// ============================================================================

async function apiCall(endpoint, options = {}) {
  const response = await fetch(`/api${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
      ...options.headers
    }
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || data.message || 'Request failed');
  }

  return data;
}

// ============================================================================
// CLIENT MANAGEMENT
// ============================================================================

async function loadClients() {
  try {
    console.log('📡 Calling /admin/clients API...');
    const data = await apiCall('/admin/clients');
    console.log('📋 Clients response:', data);

    const clients = data.clients || [];
    clientsCache = clients;

    const selector = document.getElementById('client-selector');
    selector.innerHTML = '<option value="">Select a client...</option>';

    clients.forEach(client => {
      const option = document.createElement('option');
      option.value = client.client_id;
      option.textContent = `${client.name || 'Unnamed'} (${client.client_key || client.client_id?.slice(0, 8) || 'no id'})`;
      selector.appendChild(option);
    });

    console.log(`✅ Loaded ${clients.length} clients`);

  } catch (err) {
    console.error('❌ Load clients error:', err);
    showToast(`Failed to load clients: ${err.message}`, 'error');
    throw err; // Re-throw to be caught by init
  }
}

function onClientChange() {
  const selector = document.getElementById('client-selector');
  selectedClientId = selector.value;

  // Clear caches
  Object.keys(dataCache).forEach(key => {
    dataCache[key] = Array.isArray(dataCache[key]) ? [] : null;
  });

  if (selectedClientId) {
    const client = clientsCache.find(c => c.client_id === selectedClientId);
    if (client) {
      document.getElementById('client-status').classList.remove('hidden');
      const badge = document.getElementById('client-status-badge');
      const isActive = client.status === 'active';
      badge.textContent = isActive ? 'Active' : 'Inactive';
      badge.className = `badge ${isActive ? 'badge-green' : 'badge-red'}`;
    }
    loadCurrentTab();
  } else {
    document.getElementById('client-status').classList.add('hidden');
    showPlaceholders();
  }
}

// ============================================================================
// TAB NAVIGATION
// ============================================================================

function setupTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.dataset.tab;
      switchTab(tabId);
    });
  });
}

function switchTab(tabId) {
  // Update buttons
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabId);
  });

  // Update content
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.add('hidden');
  });
  document.getElementById(`tab-${tabId}`).classList.remove('hidden');

  // Load data if client selected
  if (selectedClientId) {
    loadCurrentTab();
  }

  lucide.createIcons();
}

function loadCurrentTab() {
  const activeTab = document.querySelector('.tab-btn.active');
  if (!activeTab) return;

  const tabId = activeTab.dataset.tab;

  switch (tabId) {
    case 'overview': loadOverview(); break;
    case 'schedule': loadSchedules(); break;
    case 'themes': loadThemes(); break;
    case 'prompts': loadPrompts(); break;
    case 'rules': loadRules(); break;
    case 'branding': loadBranding(); break;
    case 'hashtags': loadHashtags(); break;
    case 'system': loadSystemConfig(); break;
    case 'audit': loadAuditLog(); break;
  }
}

function showPlaceholders() {
  ['overview', 'schedule', 'themes', 'prompts', 'rules', 'branding', 'hashtags'].forEach(tab => {
    const placeholder = document.getElementById(`${tab}-placeholder`);
    const content = document.getElementById(`${tab}-content`);
    if (placeholder) placeholder.classList.remove('hidden');
    if (content) content.classList.add('hidden');
  });
}

// ============================================================================
// OVERVIEW TAB
// ============================================================================

async function loadOverview() {
  if (!selectedClientId) return;

  try {
    const data = await apiCall(`/admin/clients/${selectedClientId}/overview`);
    dataCache.overview = data;

    // Update UI
    document.getElementById('overview-placeholder').classList.add('hidden');
    document.getElementById('overview-content').classList.remove('hidden');

    const { client, stats } = data;

    // Client info
    document.getElementById('info-client-id').textContent = client.client_id;
    document.getElementById('info-client-key').textContent = client.client_key || 'N/A';
    document.getElementById('info-business-name').textContent = client.name;

    // Status with toggle (uses 'status' field: 'active' | 'inactive' | 'suspended')
    const isActive = client.status === 'active';
    document.getElementById('info-status').innerHTML = `
      <div class="flex items-center gap-3">
        <span class="badge ${isActive ? 'badge-green' : 'badge-red'}">${isActive ? 'Active' : client.status || 'Inactive'}</span>
        <button onclick="toggleClientStatus()" class="text-xs px-2 py-1 rounded ${isActive ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'} text-white transition-colors">
          ${isActive ? 'Deactivate' : 'Activate'}
        </button>
      </div>
    `;

    document.getElementById('info-industry').textContent = client.industry || 'N/A';
    document.getElementById('info-timezone').textContent = client.timezone || 'N/A';
    document.getElementById('info-created').textContent = formatDate(client.created_at);

    // Onboarding with toggle
    document.getElementById('info-onboarding').innerHTML = `
      <div class="flex items-center gap-3">
        <span class="badge ${client.onboarding_completed ? 'badge-green' : 'badge-yellow'}">${client.onboarding_completed ? 'Completed' : 'Pending'}</span>
        <button onclick="toggleOnboardingStatus()" class="text-xs px-2 py-1 rounded ${client.onboarding_completed ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'} text-white transition-colors">
          ${client.onboarding_completed ? 'Mark Pending' : 'Mark Complete'}
        </button>
      </div>
    `;

    // Stats
    document.getElementById('stat-themes').textContent = `${stats.themes.active}/${stats.themes.total}`;
    document.getElementById('stat-prompts').textContent = `${stats.prompts.active}/${stats.prompts.total}`;
    document.getElementById('stat-pending').textContent = stats.pendingPosts;
    document.getElementById('stat-failed').textContent = stats.failedTasks;

    lucide.createIcons();

  } catch (err) {
    console.error('Load overview error:', err);
    showToast('Failed to load overview', 'error');
  }
}

async function resetFailedTasks() {
  if (!selectedClientId) return;

  try {
    const result = await apiCall(`/admin/clients/${selectedClientId}/actions/reset-failed-tasks`, {
      method: 'POST'
    });
    showToast(result.message, 'success');
    loadOverview();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function toggleClientStatus() {
  if (!selectedClientId || !dataCache.overview) return;

  const currentStatus = dataCache.overview.client.status;
  const isCurrentlyActive = currentStatus === 'active';
  const newStatus = isCurrentlyActive ? 'inactive' : 'active';
  const action = isCurrentlyActive ? 'deactivate' : 'activate';

  if (!confirm(`Are you sure you want to ${action} this client?`)) {
    return;
  }

  try {
    await apiCall(`/admin/clients/${selectedClientId}`, {
      method: 'PUT',
      body: JSON.stringify({ status: newStatus })
    });
    showToast(`Client ${isCurrentlyActive ? 'deactivated' : 'activated'} successfully`, 'success');

    // Update local cache and UI
    dataCache.overview.client.status = newStatus;
    loadOverview();

    // Update header badge
    const badge = document.getElementById('client-status-badge');
    const isNowActive = newStatus === 'active';
    badge.textContent = isNowActive ? 'Active' : 'Inactive';
    badge.className = `badge ${isNowActive ? 'badge-green' : 'badge-red'}`;
  } catch (err) {
    showToast(`Failed to ${action} client: ${err.message}`, 'error');
  }
}

async function toggleOnboardingStatus() {
  if (!selectedClientId || !dataCache.overview) return;

  const currentStatus = dataCache.overview.client.onboarding_completed;
  const newStatus = !currentStatus;

  try {
    await apiCall(`/admin/clients/${selectedClientId}`, {
      method: 'PUT',
      body: JSON.stringify({ onboarding_completed: newStatus })
    });
    showToast(`Onboarding marked as ${newStatus ? 'completed' : 'pending'}`, 'success');

    // Update local cache and refresh
    dataCache.overview.client.onboarding_completed = newStatus;
    loadOverview();
  } catch (err) {
    showToast(`Failed to update onboarding status: ${err.message}`, 'error');
  }
}

// ============================================================================
// SCHEDULE TAB
// ============================================================================

async function loadSchedules() {
  if (!selectedClientId) return;

  try {
    const { schedules } = await apiCall(`/admin/clients/${selectedClientId}/schedules`);
    dataCache.schedules = schedules;

    document.getElementById('schedule-placeholder').classList.add('hidden');
    document.getElementById('schedule-content').classList.remove('hidden');

    renderSchedulesList(schedules);

  } catch (err) {
    console.error('Load schedules error:', err);
    showToast('Failed to load schedules', 'error');
  }
}

function renderSchedulesList(schedules) {
  const container = document.getElementById('schedules-list');

  if (schedules.length === 0) {
    container.innerHTML = `
      <div class="card text-center py-8 text-gray-400">
        No schedules configured. Click "Add Platform" to create one.
      </div>
    `;
    return;
  }

  container.innerHTML = schedules.map(schedule => `
    <div class="card" data-schedule-id="${schedule.schedule_id}">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-3">
          <span class="text-lg font-semibold capitalize">${schedule.platform}</span>
          <span class="badge ${schedule.is_active ? 'badge-green' : 'badge-red'}">
            ${schedule.is_active ? 'Active' : 'Inactive'}
          </span>
        </div>
        <div class="flex items-center gap-2">
          <button onclick="toggleScheduleActive('${schedule.schedule_id}', ${!schedule.is_active})" class="btn btn-secondary text-sm">
            ${schedule.is_active ? 'Pause' : 'Activate'}
          </button>
          <button onclick="editSchedule('${schedule.schedule_id}')" class="btn btn-secondary text-sm">Edit</button>
          <button onclick="deleteSchedule('${schedule.schedule_id}')" class="btn btn-danger text-sm">Delete</button>
        </div>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div>
          <span class="text-gray-400">Posting Times:</span>
          <div class="mt-1">${(schedule.posting_times || []).join(', ') || 'Not set'}</div>
        </div>
        <div>
          <span class="text-gray-400">Days:</span>
          <div class="mt-1">${formatDays(schedule.posting_days)}</div>
        </div>
        <div>
          <span class="text-gray-400">Approval:</span>
          <div class="mt-1 capitalize">${schedule.approval_mode || 'email'}</div>
        </div>
        <div>
          <span class="text-gray-400">Limits:</span>
          <div class="mt-1">${schedule.max_posts_per_day || 1}/day, ${schedule.max_posts_per_week || 7}/week</div>
        </div>
      </div>
    </div>
  `).join('');

  lucide.createIcons();
}

async function toggleScheduleActive(scheduleId, isActive) {
  try {
    await apiCall(`/admin/clients/${selectedClientId}/schedules/${scheduleId}`, {
      method: 'PUT',
      body: JSON.stringify({ is_active: isActive })
    });
    showToast('Schedule updated', 'success');
    loadSchedules();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function editSchedule(scheduleId) {
  const schedule = dataCache.schedules.find(s => s.schedule_id === scheduleId);
  if (!schedule) return;

  openScheduleModal(schedule);
}

async function deleteSchedule(scheduleId) {
  if (!confirm('Are you sure you want to delete this schedule?')) return;

  try {
    await apiCall(`/admin/clients/${selectedClientId}/schedules/${scheduleId}`, {
      method: 'DELETE'
    });
    showToast('Schedule deleted', 'success');
    loadSchedules();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function openAddScheduleModal() {
  openScheduleModal(null);
}

function openScheduleModal(schedule) {
  const isEdit = !!schedule;
  const title = isEdit ? `Edit Schedule: ${schedule.platform}` : 'Add Schedule';

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const selectedDays = schedule?.posting_days || [1, 2, 3, 4, 5];

  const html = `
    <div class="fixed inset-0 bg-black/70 flex items-center justify-center z-50" id="schedule-modal">
      <div class="bg-slate-800 rounded-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b border-slate-700 flex items-center justify-between">
          <h2 class="text-xl font-semibold">${title}</h2>
          <button onclick="closeModal('schedule-modal')" class="text-gray-400 hover:text-white">
            <i data-lucide="x" class="w-6 h-6"></i>
          </button>
        </div>
        <form id="schedule-form" onsubmit="saveSchedule(event, '${schedule?.schedule_id || ''}')" class="p-6 space-y-4">
          ${!isEdit ? `
            <div>
              <label class="form-label">Platform</label>
              <select name="platform" class="form-input" required>
                <option value="instagram">Instagram</option>
                <option value="linkedin">LinkedIn</option>
                <option value="tiktok">TikTok</option>
                <option value="facebook">Facebook</option>
              </select>
            </div>
          ` : ''}

          <div>
            <label class="form-label">Posting Times (comma-separated, HH:MM format)</label>
            <input type="text" name="posting_times" class="form-input"
              value="${(schedule?.posting_times || ['09:00', '18:00']).join(', ')}"
              placeholder="09:00, 18:00">
          </div>

          <div>
            <label class="form-label">Posting Days</label>
            <div class="flex flex-wrap gap-2 mt-2">
              ${dayNames.map((day, idx) => `
                <label class="flex items-center gap-2 bg-slate-900 px-3 py-2 rounded cursor-pointer">
                  <input type="checkbox" name="posting_days" value="${idx}"
                    ${selectedDays.includes(idx) ? 'checked' : ''}>
                  <span>${day}</span>
                </label>
              `).join('')}
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="form-label">Max Posts/Day</label>
              <input type="number" name="max_posts_per_day" class="form-input"
                value="${schedule?.max_posts_per_day || 1}" min="1" max="10">
            </div>
            <div>
              <label class="form-label">Max Posts/Week</label>
              <input type="number" name="max_posts_per_week" class="form-input"
                value="${schedule?.max_posts_per_week || 7}" min="1" max="30">
            </div>
          </div>

          <div>
            <label class="form-label">Approval Mode</label>
            <div class="flex gap-4 mt-2">
              ${['auto', 'email', 'dashboard'].map(mode => `
                <label class="flex items-center gap-2">
                  <input type="radio" name="approval_mode" value="${mode}"
                    ${(schedule?.approval_mode || 'email') === mode ? 'checked' : ''}>
                  <span class="capitalize">${mode}</span>
                </label>
              `).join('')}
            </div>
          </div>

          <div>
            <label class="form-label">Approval Email (required if mode is "email")</label>
            <input type="email" name="approval_email" class="form-input"
              value="${schedule?.approval_email || ''}" placeholder="email@example.com">
          </div>

          <div>
            <label class="form-label">Locale</label>
            <select name="locale" class="form-input">
              <option value="en" ${schedule?.locale === 'en' ? 'selected' : ''}>English</option>
              <option value="pt-BR" ${schedule?.locale === 'pt-BR' ? 'selected' : ''}>Português (BR)</option>
              <option value="es" ${schedule?.locale === 'es' ? 'selected' : ''}>Spanish</option>
            </select>
          </div>

          <div class="flex items-center gap-2">
            <input type="checkbox" name="is_active" id="schedule-active"
              ${schedule?.is_active !== false ? 'checked' : ''}>
            <label for="schedule-active">Active</label>
          </div>

          <div class="flex justify-end gap-3 pt-4">
            <button type="button" onclick="closeModal('schedule-modal')" class="btn btn-secondary">Cancel</button>
            <button type="submit" class="btn btn-primary">Save Schedule</button>
          </div>
        </form>
      </div>
    </div>
  `;

  document.getElementById('modals-container').innerHTML = html;
  lucide.createIcons();
}

async function saveSchedule(event, scheduleId) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);

  const postingTimesStr = formData.get('posting_times');
  const postingTimes = postingTimesStr.split(',').map(t => t.trim()).filter(t => t);

  const postingDays = [];
  form.querySelectorAll('input[name="posting_days"]:checked').forEach(cb => {
    postingDays.push(parseInt(cb.value));
  });

  const data = {
    posting_times: postingTimes,
    posting_days: postingDays,
    max_posts_per_day: parseInt(formData.get('max_posts_per_day')),
    max_posts_per_week: parseInt(formData.get('max_posts_per_week')),
    approval_mode: formData.get('approval_mode'),
    approval_email: formData.get('approval_email') || null,
    locale: formData.get('locale'),
    is_active: form.querySelector('#schedule-active').checked
  };

  if (!scheduleId) {
    data.platform = formData.get('platform');
  }

  try {
    if (scheduleId) {
      await apiCall(`/admin/clients/${selectedClientId}/schedules/${scheduleId}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    } else {
      await apiCall(`/admin/clients/${selectedClientId}/schedules`, {
        method: 'POST',
        body: JSON.stringify(data)
      });
    }

    closeModal('schedule-modal');
    showToast('Schedule saved', 'success');
    loadSchedules();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ============================================================================
// THEMES TAB
// ============================================================================

async function loadThemes() {
  if (!selectedClientId) return;

  try {
    const { themes } = await apiCall(`/admin/clients/${selectedClientId}/themes`);
    dataCache.themes = themes;

    document.getElementById('themes-placeholder').classList.add('hidden');
    document.getElementById('themes-content').classList.remove('hidden');

    renderThemesTable(themes);

  } catch (err) {
    console.error('Load themes error:', err);
    showToast('Failed to load themes', 'error');
  }
}

function renderThemesTable(themes) {
  const tbody = document.getElementById('themes-table-body');
  const filter = document.getElementById('themes-filter').value;

  let filtered = themes;
  if (filter === 'active') filtered = themes.filter(t => t.is_active);
  if (filter === 'inactive') filtered = themes.filter(t => !t.is_active);

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center text-gray-400 py-8">No themes found</td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map(theme => `
    <tr>
      <td><input type="checkbox" class="theme-checkbox" value="${theme.theme_id}"></td>
      <td>
        <div class="font-medium">${theme.label}</div>
        <div class="text-xs text-gray-400">${theme.theme_key}</div>
      </td>
      <td><span class="badge badge-blue">${theme.category}</span></td>
      <td class="text-center">${theme.times_used || 0}</td>
      <td class="text-center">${theme.priority}</td>
      <td class="text-center">
        <span class="badge ${theme.is_active ? 'badge-green' : 'badge-red'}">
          ${theme.is_active ? 'Yes' : 'No'}
        </span>
      </td>
      <td class="text-right">
        <button onclick="editTheme('${theme.theme_id}')" class="text-brandBlue hover:text-brandBlue/80 text-sm mr-2">Edit</button>
        <button onclick="deleteTheme('${theme.theme_id}')" class="text-red-400 hover:text-red-300 text-sm">Delete</button>
      </td>
    </tr>
  `).join('');
}

function filterThemes() {
  renderThemesTable(dataCache.themes);
}

function toggleAllThemes() {
  const selectAll = document.getElementById('themes-select-all');
  document.querySelectorAll('.theme-checkbox').forEach(cb => {
    cb.checked = selectAll.checked;
  });
}

function getSelectedThemeIds() {
  return Array.from(document.querySelectorAll('.theme-checkbox:checked')).map(cb => cb.value);
}

async function bulkEnableThemes() {
  const ids = getSelectedThemeIds();
  if (ids.length === 0) return showToast('Select themes first', 'warning');

  try {
    await apiCall(`/admin/clients/${selectedClientId}/themes/bulk`, {
      method: 'PATCH',
      body: JSON.stringify({ theme_ids: ids, action: 'enable' })
    });
    showToast('Themes enabled', 'success');
    loadThemes();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function bulkDisableThemes() {
  const ids = getSelectedThemeIds();
  if (ids.length === 0) return showToast('Select themes first', 'warning');

  try {
    await apiCall(`/admin/clients/${selectedClientId}/themes/bulk`, {
      method: 'PATCH',
      body: JSON.stringify({ theme_ids: ids, action: 'disable' })
    });
    showToast('Themes disabled', 'success');
    loadThemes();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function bulkResetUsage() {
  const ids = getSelectedThemeIds();
  if (ids.length === 0) return showToast('Select themes first', 'warning');

  try {
    await apiCall(`/admin/clients/${selectedClientId}/themes/bulk`, {
      method: 'PATCH',
      body: JSON.stringify({ theme_ids: ids, action: 'reset_usage' })
    });
    showToast('Usage counts reset', 'success');
    loadThemes();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function editTheme(themeId) {
  const theme = dataCache.themes.find(t => t.theme_id === themeId);
  if (!theme) return;
  openThemeModal(theme);
}

async function deleteTheme(themeId) {
  if (!confirm('Are you sure you want to delete this theme?')) return;

  try {
    await apiCall(`/admin/clients/${selectedClientId}/themes/${themeId}`, {
      method: 'DELETE'
    });
    showToast('Theme deleted', 'success');
    loadThemes();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function openAddThemeModal() {
  openThemeModal(null);
}

function openThemeModal(theme) {
  const isEdit = !!theme;
  const title = isEdit ? `Edit Theme: ${theme.label}` : 'Add Theme';

  const categories = ['pain_point', 'success_story', 'educational', 'behind_scenes', 'trending', 'promotional'];
  const ctaTypes = ['dm_keyword', 'link_bio', 'comment', 'share', 'save'];

  const html = `
    <div class="fixed inset-0 bg-black/70 flex items-center justify-center z-50" id="theme-modal">
      <div class="bg-slate-800 rounded-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b border-slate-700 flex items-center justify-between">
          <h2 class="text-xl font-semibold">${title}</h2>
          <button onclick="closeModal('theme-modal')" class="text-gray-400 hover:text-white">
            <i data-lucide="x" class="w-6 h-6"></i>
          </button>
        </div>
        <form id="theme-form" onsubmit="saveTheme(event, '${theme?.theme_id || ''}')" class="p-6 space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="form-label">Theme Key</label>
              <input type="text" name="theme_key" class="form-input"
                value="${theme?.theme_key || ''}" ${isEdit ? 'readonly' : 'required'}
                placeholder="email_triage">
            </div>
            <div>
              <label class="form-label">Label</label>
              <input type="text" name="label" class="form-input"
                value="${theme?.label || ''}" required
                placeholder="Email Inbox Triage">
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="form-label">Category</label>
              <select name="category" class="form-input">
                ${categories.map(cat => `
                  <option value="${cat}" ${theme?.category === cat ? 'selected' : ''}>${cat}</option>
                `).join('')}
              </select>
            </div>
            <div>
              <label class="form-label">CTA Type</label>
              <select name="cta_type" class="form-input">
                ${ctaTypes.map(cta => `
                  <option value="${cta}" ${theme?.cta_type === cta ? 'selected' : ''}>${cta}</option>
                `).join('')}
              </select>
            </div>
          </div>

          <div>
            <label class="form-label">Target Audience</label>
            <textarea name="target_audience" class="form-input h-20"
              placeholder="Busy business owners drowning in email...">${theme?.target_audience || ''}</textarea>
          </div>

          <div>
            <label class="form-label">Pain Point</label>
            <textarea name="pain_point" class="form-input h-20"
              placeholder="Inbox chaos, important emails buried...">${theme?.pain_point || ''}</textarea>
          </div>

          <div>
            <label class="form-label">Solution Hint</label>
            <textarea name="solution_hint" class="form-input h-20"
              placeholder="AI-powered sorting, priority flagging...">${theme?.solution_hint || ''}</textarea>
          </div>

          <div>
            <label class="form-label">Tone</label>
            <input type="text" name="tone" class="form-input"
              value="${theme?.tone || ''}" placeholder="empathetic, practical">
          </div>

          <div>
            <label class="form-label">Example Hooks (one per line)</label>
            <textarea name="example_hooks" class="form-input h-24"
              placeholder="Your inbox isn't the problem...">${(theme?.example_hooks || []).join('\n')}</textarea>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="form-label">Priority (1-100)</label>
              <input type="number" name="priority" class="form-input"
                value="${theme?.priority || 50}" min="1" max="100">
            </div>
            <div>
              <label class="form-label">Min Days Between Uses</label>
              <input type="number" name="min_days_between_uses" class="form-input"
                value="${theme?.min_days_between_uses || 5}" min="0">
            </div>
          </div>

          <div class="flex items-center gap-2">
            <input type="checkbox" name="is_active" id="theme-active"
              ${theme?.is_active !== false ? 'checked' : ''}>
            <label for="theme-active">Active</label>
          </div>

          <div class="flex justify-end gap-3 pt-4">
            <button type="button" onclick="closeModal('theme-modal')" class="btn btn-secondary">Cancel</button>
            <button type="submit" class="btn btn-primary">Save Theme</button>
          </div>
        </form>
      </div>
    </div>
  `;

  document.getElementById('modals-container').innerHTML = html;
  lucide.createIcons();
}

async function saveTheme(event, themeId) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);

  const exampleHooksStr = formData.get('example_hooks');
  const exampleHooks = exampleHooksStr.split('\n').map(h => h.trim()).filter(h => h);

  const data = {
    theme_key: formData.get('theme_key'),
    label: formData.get('label'),
    category: formData.get('category'),
    cta_type: formData.get('cta_type'),
    target_audience: formData.get('target_audience'),
    pain_point: formData.get('pain_point'),
    solution_hint: formData.get('solution_hint'),
    tone: formData.get('tone'),
    example_hooks: exampleHooks,
    priority: parseInt(formData.get('priority')),
    min_days_between_uses: parseInt(formData.get('min_days_between_uses')),
    is_active: form.querySelector('#theme-active').checked
  };

  try {
    if (themeId) {
      await apiCall(`/admin/clients/${selectedClientId}/themes/${themeId}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    } else {
      await apiCall(`/admin/clients/${selectedClientId}/themes`, {
        method: 'POST',
        body: JSON.stringify(data)
      });
    }

    closeModal('theme-modal');
    showToast('Theme saved', 'success');
    loadThemes();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ============================================================================
// PROMPTS TAB
// ============================================================================

async function loadPrompts() {
  if (!selectedClientId) return;

  try {
    const { prompts } = await apiCall(`/admin/clients/${selectedClientId}/prompts`);
    dataCache.prompts = prompts;

    document.getElementById('prompts-placeholder').classList.add('hidden');
    document.getElementById('prompts-content').classList.remove('hidden');

    renderPromptsTable(prompts);

  } catch (err) {
    console.error('Load prompts error:', err);
    showToast('Failed to load prompts', 'error');
  }
}

function renderPromptsTable(prompts) {
  const tbody = document.getElementById('prompts-table-body');

  if (prompts.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="text-center text-gray-400 py-8">No prompts configured</td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = prompts.map(prompt => `
    <tr>
      <td class="font-medium">${prompt.prompt_type}</td>
      <td>${prompt.platform || '(global)'}</td>
      <td class="text-center">${prompt.prompt_text?.length || 0}</td>
      <td class="text-center">
        <span class="badge ${prompt.is_active ? 'badge-green' : 'badge-red'}">
          ${prompt.is_active ? 'Yes' : 'No'}
        </span>
      </td>
      <td class="text-right">
        <button onclick="editPrompt('${prompt.prompt_id}')" class="text-brandBlue hover:text-brandBlue/80 text-sm mr-2">Edit</button>
        <button onclick="viewPrompt('${prompt.prompt_id}')" class="text-gray-400 hover:text-gray-300 text-sm mr-2">View</button>
        <button onclick="deletePrompt('${prompt.prompt_id}')" class="text-red-400 hover:text-red-300 text-sm">Delete</button>
      </td>
    </tr>
  `).join('');
}

function editPrompt(promptId) {
  const prompt = dataCache.prompts.find(p => p.prompt_id === promptId);
  if (!prompt) return;
  openPromptModal(prompt);
}

function viewPrompt(promptId) {
  const prompt = dataCache.prompts.find(p => p.prompt_id === promptId);
  if (!prompt) return;

  const html = `
    <div class="fixed inset-0 bg-black/70 flex items-center justify-center z-50" id="prompt-view-modal">
      <div class="bg-slate-800 rounded-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b border-slate-700 flex items-center justify-between">
          <h2 class="text-xl font-semibold">Prompt: ${prompt.prompt_type}</h2>
          <button onclick="closeModal('prompt-view-modal')" class="text-gray-400 hover:text-white">
            <i data-lucide="x" class="w-6 h-6"></i>
          </button>
        </div>
        <div class="p-6">
          <pre class="bg-slate-900 p-4 rounded text-sm overflow-x-auto whitespace-pre-wrap">${escapeHtml(prompt.prompt_text)}</pre>
        </div>
      </div>
    </div>
  `;

  document.getElementById('modals-container').innerHTML = html;
  lucide.createIcons();
}

async function deletePrompt(promptId) {
  if (!confirm('Are you sure you want to delete this prompt?')) return;

  try {
    await apiCall(`/admin/clients/${selectedClientId}/prompts/${promptId}`, {
      method: 'DELETE'
    });
    showToast('Prompt deleted', 'success');
    loadPrompts();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function openAddPromptModal() {
  openPromptModal(null);
}

function openPromptModal(prompt) {
  const isEdit = !!prompt;
  const title = isEdit ? `Edit Prompt: ${prompt.prompt_type}` : 'Add Prompt';

  const html = `
    <div class="fixed inset-0 bg-black/70 flex items-center justify-center z-50" id="prompt-modal">
      <div class="bg-slate-800 rounded-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b border-slate-700 flex items-center justify-between">
          <h2 class="text-xl font-semibold">${title}</h2>
          <button onclick="closeModal('prompt-modal')" class="text-gray-400 hover:text-white">
            <i data-lucide="x" class="w-6 h-6"></i>
          </button>
        </div>
        <form id="prompt-form" onsubmit="savePrompt(event, '${prompt?.prompt_id || ''}')" class="p-6 space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="form-label">Prompt Type</label>
              <select name="prompt_type" class="form-input" ${isEdit ? 'disabled' : ''}>
                <option value="caption_system" ${prompt?.prompt_type === 'caption_system' ? 'selected' : ''}>caption_system</option>
                <option value="image_system" ${prompt?.prompt_type === 'image_system' ? 'selected' : ''}>image_system</option>
                <option value="carousel_system" ${prompt?.prompt_type === 'carousel_system' ? 'selected' : ''}>carousel_system</option>
              </select>
            </div>
            <div>
              <label class="form-label">Platform (optional)</label>
              <select name="platform" class="form-input">
                <option value="">Global (all platforms)</option>
                <option value="instagram" ${prompt?.platform === 'instagram' ? 'selected' : ''}>Instagram</option>
                <option value="linkedin" ${prompt?.platform === 'linkedin' ? 'selected' : ''}>LinkedIn</option>
                <option value="tiktok" ${prompt?.platform === 'tiktok' ? 'selected' : ''}>TikTok</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-3 gap-4">
            <div>
              <label class="form-label">Model</label>
              <select name="model" class="form-input">
                <option value="gpt-4o" ${prompt?.model === 'gpt-4o' ? 'selected' : ''}>gpt-4o</option>
                <option value="gpt-4o-mini" ${prompt?.model === 'gpt-4o-mini' ? 'selected' : ''}>gpt-4o-mini</option>
              </select>
            </div>
            <div>
              <label class="form-label">Temperature</label>
              <input type="number" name="temperature" class="form-input"
                value="${prompt?.temperature || 0.8}" min="0" max="2" step="0.1">
            </div>
            <div>
              <label class="form-label">Max Tokens</label>
              <input type="number" name="max_tokens" class="form-input"
                value="${prompt?.max_tokens || 1500}" min="100" max="8000">
            </div>
          </div>

          <div>
            <label class="form-label">Prompt Text</label>
            <textarea name="prompt_text" class="form-input h-64 font-mono text-sm" required
              placeholder="You are TechBuddy4Biz, an AI automation consultant...">${escapeHtml(prompt?.prompt_text || '')}</textarea>
            <div class="text-xs text-gray-400 mt-1">Characters: <span id="prompt-char-count">${prompt?.prompt_text?.length || 0}</span></div>
          </div>

          <div class="flex items-center gap-2">
            <input type="checkbox" name="is_active" id="prompt-active"
              ${prompt?.is_active !== false ? 'checked' : ''}>
            <label for="prompt-active">Active</label>
          </div>

          <div class="flex justify-end gap-3 pt-4">
            <button type="button" onclick="closeModal('prompt-modal')" class="btn btn-secondary">Cancel</button>
            <button type="submit" class="btn btn-primary">Save Prompt</button>
          </div>
        </form>
      </div>
    </div>
  `;

  document.getElementById('modals-container').innerHTML = html;
  lucide.createIcons();

  // Character count update
  const textarea = document.querySelector('#prompt-form textarea[name="prompt_text"]');
  textarea.addEventListener('input', () => {
    document.getElementById('prompt-char-count').textContent = textarea.value.length;
  });
}

async function savePrompt(event, promptId) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);

  const data = {
    prompt_type: formData.get('prompt_type'),
    platform: formData.get('platform') || null,
    model: formData.get('model'),
    temperature: parseFloat(formData.get('temperature')),
    max_tokens: parseInt(formData.get('max_tokens')),
    prompt_text: formData.get('prompt_text'),
    is_active: form.querySelector('#prompt-active').checked
  };

  try {
    if (promptId) {
      await apiCall(`/admin/clients/${selectedClientId}/prompts/${promptId}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    } else {
      await apiCall(`/admin/clients/${selectedClientId}/prompts`, {
        method: 'POST',
        body: JSON.stringify(data)
      });
    }

    closeModal('prompt-modal');
    showToast('Prompt saved', 'success');
    loadPrompts();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ============================================================================
// RULES TAB
// ============================================================================

async function loadRules() {
  if (!selectedClientId) return;

  try {
    const { rules } = await apiCall(`/admin/clients/${selectedClientId}/rules`);
    dataCache.rules = rules;

    document.getElementById('rules-placeholder').classList.add('hidden');
    document.getElementById('rules-content').classList.remove('hidden');

    // Update form fields from rules
    if (rules?.rules) {
      const r = rules.rules;
      document.getElementById('rules-ai-model').value = r.ai?.model || 'gpt-4o';
      document.getElementById('rules-ai-temp').value = r.ai?.temperature || 0.7;
      document.getElementById('rules-ai-tokens').value = r.ai?.max_tokens || 1000;
      document.getElementById('rules-max-tasks').value = r.limits?.max_tasks_per_run || 25;
      document.getElementById('rules-dedupe').value = r.limits?.task_dedupe_seconds || 86400;
      document.getElementById('rules-followup-cooldown').value = r.limits?.followup_cooldown_seconds || 86400;

      // Update Monaco editor
      if (rulesEditor) {
        rulesEditor.setValue(JSON.stringify(rules.rules, null, 2));
      }
    }

    lucide.createIcons();

  } catch (err) {
    console.error('Load rules error:', err);
    showToast('Failed to load rules', 'error');
  }
}

function validateRulesJson() {
  if (!rulesEditor) return;

  try {
    JSON.parse(rulesEditor.getValue());
    showToast('JSON is valid', 'success');
  } catch (err) {
    showToast(`Invalid JSON: ${err.message}`, 'error');
  }
}

async function saveRules() {
  if (!selectedClientId || !rulesEditor) return;

  let rulesJson;
  try {
    rulesJson = JSON.parse(rulesEditor.getValue());
  } catch (err) {
    showToast(`Invalid JSON: ${err.message}`, 'error');
    return;
  }

  try {
    await apiCall(`/admin/clients/${selectedClientId}/rules`, {
      method: 'PUT',
      body: JSON.stringify({ rules: rulesJson })
    });
    showToast('Rules saved', 'success');
    loadRules();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ============================================================================
// BRANDING TAB
// ============================================================================

async function loadBranding() {
  if (!selectedClientId) return;

  try {
    const { branding } = await apiCall(`/admin/clients/${selectedClientId}/branding`);
    dataCache.branding = branding;

    document.getElementById('branding-placeholder').classList.add('hidden');
    document.getElementById('branding-content').classList.remove('hidden');

    if (branding) {
      document.getElementById('branding-primary-color').value = branding.primary_color || '#0ea5e9';
      document.getElementById('branding-primary-hex').value = branding.primary_color || '#0ea5e9';
      document.getElementById('branding-secondary-color').value = branding.secondary_color || '#fb923c';
      document.getElementById('branding-secondary-hex').value = branding.secondary_color || '#fb923c';
      // DB uses company_tagline, not tagline
      document.getElementById('branding-tagline').value = branding.company_tagline || branding.tagline || '';
      // DB uses email_footer_html, not email_footer
      document.getElementById('branding-footer').value = branding.email_footer_html || branding.email_footer || '';

      // Store logo data in hidden fields
      document.getElementById('branding-logo-base64').value = branding.logo_base64 || '';
      document.getElementById('branding-logo-mime-type').value = branding.logo_mime_type || '';

      // Update logo preview - check for logo_base64
      updateLogoPreview();
    }

    // Sync color pickers with hex inputs
    document.getElementById('branding-primary-color').addEventListener('input', (e) => {
      document.getElementById('branding-primary-hex').value = e.target.value;
    });
    document.getElementById('branding-secondary-color').addEventListener('input', (e) => {
      document.getElementById('branding-secondary-hex').value = e.target.value;
    });

    lucide.createIcons();

  } catch (err) {
    console.error('Load branding error:', err);
    showToast('Failed to load branding', 'error');
  }
}

/**
 * Update logo preview based on hidden field values
 */
function updateLogoPreview() {
  const logoPreview = document.getElementById('logo-preview');
  const base64 = document.getElementById('branding-logo-base64').value;
  const mimeType = document.getElementById('branding-logo-mime-type').value || 'image/png';

  if (base64) {
    logoPreview.innerHTML = `<img src="data:${mimeType};base64,${base64}" class="w-full h-full object-contain">`;
  } else {
    // Reset to placeholder icon
    logoPreview.innerHTML = '<i data-lucide="image" class="w-8 h-8 text-gray-500"></i>';
    lucide.createIcons({ nodes: [logoPreview] });
  }
}

/**
 * Handle logo file selection - convert to base64
 */
function handleLogoFileSelect(event) {
  const file = event.target.files[0];
  if (!file) return;

  // Validate file size (max 2MB)
  const maxSize = 2 * 1024 * 1024;
  if (file.size > maxSize) {
    showToast('Logo file must be less than 2MB', 'error');
    event.target.value = '';
    return;
  }

  // Validate file type
  const validTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    showToast('Logo must be PNG, JPG, GIF, or WebP', 'error');
    event.target.value = '';
    return;
  }

  // Convert to base64
  const reader = new FileReader();
  reader.onload = function(e) {
    // Extract base64 data (remove data:image/xxx;base64, prefix)
    const dataUrl = e.target.result;
    const base64 = dataUrl.split(',')[1];

    // Store in hidden fields
    document.getElementById('branding-logo-base64').value = base64;
    document.getElementById('branding-logo-mime-type').value = file.type;

    // Update preview
    updateLogoPreview();
    showToast('Logo loaded - click Save to apply', 'success');
  };
  reader.onerror = function() {
    showToast('Failed to read logo file', 'error');
  };
  reader.readAsDataURL(file);
}

/**
 * Remove logo
 */
function removeLogo() {
  document.getElementById('branding-logo-base64').value = '';
  document.getElementById('branding-logo-mime-type').value = '';
  document.getElementById('branding-logo-file').value = '';
  updateLogoPreview();
  showToast('Logo removed - click Save to apply', 'info');
}

async function saveBranding() {
  if (!selectedClientId) return;

  // Use correct DB field names: logo_base64, logo_mime_type, company_tagline, email_footer_html
  const data = {
    primary_color: document.getElementById('branding-primary-hex').value,
    secondary_color: document.getElementById('branding-secondary-hex').value,
    company_tagline: document.getElementById('branding-tagline').value || null,
    email_footer_html: document.getElementById('branding-footer').value || null
  };

  // Include logo data if present
  const logoBase64 = document.getElementById('branding-logo-base64').value;
  const logoMimeType = document.getElementById('branding-logo-mime-type').value;

  // Always send logo fields (even if empty, to allow removal)
  data.logo_base64 = logoBase64 || null;
  data.logo_mime_type = logoMimeType || null;

  try {
    await apiCall(`/admin/clients/${selectedClientId}/branding`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    showToast('Branding saved successfully', 'success');
    loadBranding();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ============================================================================
// HASHTAGS TAB
// ============================================================================

async function loadHashtags() {
  if (!selectedClientId) return;

  try {
    const { hashtags } = await apiCall(`/admin/clients/${selectedClientId}/hashtags`);
    dataCache.hashtags = hashtags;

    document.getElementById('hashtags-placeholder').classList.add('hidden');
    document.getElementById('hashtags-content').classList.remove('hidden');

    renderHashtagsTable(hashtags);

  } catch (err) {
    console.error('Load hashtags error:', err);
    showToast('Failed to load hashtags', 'error');
  }
}

function renderHashtagsTable(hashtags) {
  const tbody = document.getElementById('hashtags-table-body');

  if (hashtags.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="text-center text-gray-400 py-8">No hashtag packs configured</td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = hashtags.map(pack => `
    <tr>
      <td>
        <div class="font-medium">${pack.label}</div>
        <div class="text-xs text-gray-400">${pack.pack_key}</div>
      </td>
      <td><span class="badge badge-blue">${pack.category}</span></td>
      <td>${pack.platform || 'All'}</td>
      <td class="text-center">${pack.hashtags?.length || 0}</td>
      <td class="text-center">
        <span class="badge ${pack.is_active ? 'badge-green' : 'badge-red'}">
          ${pack.is_active ? 'Yes' : 'No'}
        </span>
      </td>
      <td class="text-right">
        <button onclick="editHashtag('${pack.pack_id}')" class="text-brandBlue hover:text-brandBlue/80 text-sm mr-2">Edit</button>
        <button onclick="deleteHashtag('${pack.pack_id}')" class="text-red-400 hover:text-red-300 text-sm">Delete</button>
      </td>
    </tr>
  `).join('');
}

function editHashtag(packId) {
  const pack = dataCache.hashtags.find(h => h.pack_id === packId);
  if (!pack) return;
  openHashtagModal(pack);
}

async function deleteHashtag(packId) {
  if (!confirm('Are you sure you want to delete this hashtag pack?')) return;

  try {
    await apiCall(`/admin/clients/${selectedClientId}/hashtags/${packId}`, {
      method: 'DELETE'
    });
    showToast('Hashtag pack deleted', 'success');
    loadHashtags();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function openAddHashtagModal() {
  openHashtagModal(null);
}

function openHashtagModal(pack) {
  const isEdit = !!pack;
  const title = isEdit ? `Edit Hashtag Pack: ${pack.label}` : 'Add Hashtag Pack';

  const categories = ['branded', 'engagement', 'niche', 'broad'];

  const html = `
    <div class="fixed inset-0 bg-black/70 flex items-center justify-center z-50" id="hashtag-modal">
      <div class="bg-slate-800 rounded-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b border-slate-700 flex items-center justify-between">
          <h2 class="text-xl font-semibold">${title}</h2>
          <button onclick="closeModal('hashtag-modal')" class="text-gray-400 hover:text-white">
            <i data-lucide="x" class="w-6 h-6"></i>
          </button>
        </div>
        <form id="hashtag-form" onsubmit="saveHashtag(event, '${pack?.pack_id || ''}')" class="p-6 space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="form-label">Pack Key</label>
              <input type="text" name="pack_key" class="form-input"
                value="${pack?.pack_key || ''}" ${isEdit ? 'readonly' : 'required'}
                placeholder="tbb_branded">
            </div>
            <div>
              <label class="form-label">Label</label>
              <input type="text" name="label" class="form-input"
                value="${pack?.label || ''}" required
                placeholder="TBB Branded">
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="form-label">Category</label>
              <select name="category" class="form-input">
                ${categories.map(cat => `
                  <option value="${cat}" ${pack?.category === cat ? 'selected' : ''}>${cat}</option>
                `).join('')}
              </select>
            </div>
            <div>
              <label class="form-label">Platform</label>
              <select name="platform" class="form-input">
                <option value="">All Platforms</option>
                <option value="instagram" ${pack?.platform === 'instagram' ? 'selected' : ''}>Instagram</option>
                <option value="linkedin" ${pack?.platform === 'linkedin' ? 'selected' : ''}>LinkedIn</option>
                <option value="tiktok" ${pack?.platform === 'tiktok' ? 'selected' : ''}>TikTok</option>
              </select>
            </div>
          </div>

          <div>
            <label class="form-label">Locale</label>
            <select name="locale" class="form-input">
              <option value="*" ${pack?.locale === '*' ? 'selected' : ''}>All Languages</option>
              <option value="en" ${pack?.locale === 'en' ? 'selected' : ''}>English</option>
              <option value="pt-BR" ${pack?.locale === 'pt-BR' ? 'selected' : ''}>Português (BR)</option>
              <option value="es" ${pack?.locale === 'es' ? 'selected' : ''}>Spanish</option>
            </select>
          </div>

          <div>
            <label class="form-label">Hashtags (one per line, without #)</label>
            <textarea name="hashtags" class="form-input h-32"
              placeholder="TechBuddy4Biz&#10;TBBAutomation&#10;SmallBusiness">${(pack?.hashtags || []).join('\n')}</textarea>
            <div class="text-xs text-gray-400 mt-1">Count: <span id="hashtag-count">${pack?.hashtags?.length || 0}</span></div>
          </div>

          <div class="flex items-center gap-2">
            <input type="checkbox" name="is_active" id="hashtag-active"
              ${pack?.is_active !== false ? 'checked' : ''}>
            <label for="hashtag-active">Active</label>
          </div>

          <div class="flex justify-end gap-3 pt-4">
            <button type="button" onclick="closeModal('hashtag-modal')" class="btn btn-secondary">Cancel</button>
            <button type="submit" class="btn btn-primary">Save Pack</button>
          </div>
        </form>
      </div>
    </div>
  `;

  document.getElementById('modals-container').innerHTML = html;
  lucide.createIcons();

  // Hashtag count update
  const textarea = document.querySelector('#hashtag-form textarea[name="hashtags"]');
  textarea.addEventListener('input', () => {
    const count = textarea.value.split('\n').filter(h => h.trim()).length;
    document.getElementById('hashtag-count').textContent = count;
  });
}

async function saveHashtag(event, packId) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);

  const hashtagsStr = formData.get('hashtags');
  const hashtags = hashtagsStr.split('\n').map(h => h.trim()).filter(h => h);

  const data = {
    pack_key: formData.get('pack_key'),
    label: formData.get('label'),
    category: formData.get('category'),
    platform: formData.get('platform') || null,
    locale: formData.get('locale'),
    hashtags: hashtags,
    is_active: form.querySelector('#hashtag-active').checked
  };

  try {
    if (packId) {
      await apiCall(`/admin/clients/${selectedClientId}/hashtags/${packId}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    } else {
      await apiCall(`/admin/clients/${selectedClientId}/hashtags`, {
        method: 'POST',
        body: JSON.stringify(data)
      });
    }

    closeModal('hashtag-modal');
    showToast('Hashtag pack saved', 'success');
    loadHashtags();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ============================================================================
// SYSTEM TAB
// ============================================================================

// Store system config data
let systemConfigCache = [];

async function loadSystemConfig() {
  // System tab doesn't require a selected client
  const container = document.getElementById('system-config-container');

  try {
    const { config } = await apiCall('/admin/system/config');
    systemConfigCache = config || [];

    // Render config entries
    renderSystemConfigEntries(config);

    // Load default platform
    loadPlatformConfig();

    lucide.createIcons();

  } catch (err) {
    console.error('Load system config error:', err);
    container.innerHTML = `
      <div class="card text-center py-8">
        <i data-lucide="alert-circle" class="w-12 h-12 mx-auto mb-4 text-red-400"></i>
        <p class="text-red-400">Failed to load system config: ${err.message}</p>
        <button onclick="loadSystemConfig()" class="btn btn-secondary mt-4">Try Again</button>
      </div>
    `;
    lucide.createIcons();
    showToast('Failed to load system config', 'error');
  }
}

/**
 * Render all system config entries
 */
function renderSystemConfigEntries(configs) {
  const container = document.getElementById('system-config-container');

  if (!configs || configs.length === 0) {
    container.innerHTML = `
      <div class="card text-center py-8">
        <i data-lucide="settings" class="w-12 h-12 mx-auto mb-4 text-gray-500"></i>
        <p class="text-gray-400">No system configuration entries found.</p>
        <button onclick="openAddConfigModal()" class="btn btn-primary mt-4">Add First Config</button>
      </div>
    `;
    return;
  }

  container.innerHTML = configs.map(item => {
    const isJson = isJsonString(item.config_value);
    const formattedValue = isJson ? JSON.stringify(JSON.parse(item.config_value), null, 2) : item.config_value;
    const inputType = isJson ? 'textarea' : 'input';

    return `
      <div class="card" data-config-key="${escapeHtml(item.config_key)}">
        <div class="flex items-start justify-between mb-3">
          <div>
            <h3 class="font-semibold text-brandBlue">${escapeHtml(item.config_key)}</h3>
            <p class="text-xs text-gray-400 mt-1">${escapeHtml(item.description || 'No description')}</p>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs text-gray-500">Updated: ${formatDate(item.updated_at)}</span>
            <button onclick="deleteSystemConfig('${escapeHtml(item.config_key)}')" class="text-red-400 hover:text-red-300 p-1" title="Delete">
              <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
          </div>
        </div>
        ${isJson ? `
          <textarea
            id="config-value-${escapeHtml(item.config_key)}"
            class="form-input font-mono text-sm h-32 mb-3"
            spellcheck="false"
          >${escapeHtml(formattedValue)}</textarea>
          <p class="text-xs text-gray-500 mb-3">
            <i data-lucide="info" class="inline w-3 h-3 mr-1"></i>JSON format detected
          </p>
        ` : `
          <input
            type="text"
            id="config-value-${escapeHtml(item.config_key)}"
            class="form-input mb-3"
            value="${escapeHtml(item.config_value || '')}"
          >
        `}
        <div class="flex items-center justify-between">
          <div>
            <label class="form-label text-xs mb-1">Description</label>
            <input
              type="text"
              id="config-desc-${escapeHtml(item.config_key)}"
              class="form-input text-sm w-80"
              value="${escapeHtml(item.description || '')}"
              placeholder="Optional description"
            >
          </div>
          <button onclick="saveSystemConfigItem('${escapeHtml(item.config_key)}')" class="btn btn-primary">
            <i data-lucide="save" class="w-4 h-4 mr-2"></i>Save
          </button>
        </div>
      </div>
    `;
  }).join('');
}

/**
 * Check if a string is valid JSON
 */
function isJsonString(str) {
  if (!str || typeof str !== 'string') return false;
  try {
    const parsed = JSON.parse(str);
    return typeof parsed === 'object' && parsed !== null;
  } catch {
    return false;
  }
}

/**
 * Save a single system config item
 */
async function saveSystemConfigItem(configKey) {
  const valueEl = document.getElementById(`config-value-${configKey}`);
  const descEl = document.getElementById(`config-desc-${configKey}`);

  if (!valueEl) {
    showToast('Config value element not found', 'error');
    return;
  }

  let value = valueEl.value;

  // Validate JSON if it looks like JSON
  if (value.trim().startsWith('{') || value.trim().startsWith('[')) {
    try {
      JSON.parse(value);
    } catch (e) {
      showToast(`Invalid JSON: ${e.message}`, 'error');
      return;
    }
  }

  try {
    await apiCall(`/admin/system/config/${encodeURIComponent(configKey)}`, {
      method: 'PUT',
      body: JSON.stringify({
        value: value,
        description: descEl?.value || null
      })
    });
    showToast(`Config "${configKey}" saved successfully`, 'success');
    loadSystemConfig();
  } catch (err) {
    showToast(`Failed to save: ${err.message}`, 'error');
  }
}

/**
 * Delete a system config item
 */
async function deleteSystemConfig(configKey) {
  if (!confirm(`Are you sure you want to delete the config "${configKey}"?\n\nThis action cannot be undone.`)) {
    return;
  }

  try {
    await apiCall(`/admin/system/config/${encodeURIComponent(configKey)}`, {
      method: 'DELETE'
    });
    showToast(`Config "${configKey}" deleted`, 'success');
    loadSystemConfig();
  } catch (err) {
    showToast(`Failed to delete: ${err.message}`, 'error');
  }
}

/**
 * Open modal to add new config entry
 */
function openAddConfigModal() {
  const html = `
    <div class="fixed inset-0 bg-black/70 flex items-center justify-center z-50" id="add-config-modal">
      <div class="bg-slate-800 rounded-xl max-w-lg w-full mx-4">
        <div class="p-6 border-b border-slate-700 flex items-center justify-between">
          <h2 class="text-xl font-semibold">Add System Config</h2>
          <button onclick="closeModal('add-config-modal')" class="text-gray-400 hover:text-white">
            <i data-lucide="x" class="w-6 h-6"></i>
          </button>
        </div>
        <form id="add-config-form" onsubmit="saveNewConfig(event)" class="p-6 space-y-4">
          <div>
            <label class="form-label">Config Key <span class="text-red-400">*</span></label>
            <input type="text" name="config_key" class="form-input" required
              placeholder="e.g., openai_api_key, feature_flags"
              pattern="^[a-z][a-z0-9_]*$"
              title="Lowercase letters, numbers, and underscores only. Must start with a letter.">
            <p class="text-xs text-gray-400 mt-1">Lowercase letters, numbers, and underscores only</p>
          </div>
          <div>
            <label class="form-label">Value <span class="text-red-400">*</span></label>
            <textarea name="config_value" class="form-input h-24 font-mono text-sm" required
              placeholder='Plain text or JSON object, e.g., {"key": "value"}'></textarea>
          </div>
          <div>
            <label class="form-label">Description</label>
            <input type="text" name="description" class="form-input"
              placeholder="Brief description of this config">
          </div>
          <div class="flex justify-end gap-3 pt-4">
            <button type="button" onclick="closeModal('add-config-modal')" class="btn btn-secondary">Cancel</button>
            <button type="submit" class="btn btn-primary">Add Config</button>
          </div>
        </form>
      </div>
    </div>
  `;

  document.getElementById('modals-container').innerHTML = html;
  lucide.createIcons();
}

/**
 * Save new config entry
 */
async function saveNewConfig(event) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);

  const configKey = formData.get('config_key');
  let configValue = formData.get('config_value');
  const description = formData.get('description');

  // Check if key already exists
  if (systemConfigCache.some(c => c.config_key === configKey)) {
    showToast(`Config "${configKey}" already exists`, 'error');
    return;
  }

  // Validate JSON if it looks like JSON
  if (configValue.trim().startsWith('{') || configValue.trim().startsWith('[')) {
    try {
      JSON.parse(configValue);
    } catch (e) {
      showToast(`Invalid JSON: ${e.message}`, 'error');
      return;
    }
  }

  try {
    await apiCall(`/admin/system/config/${encodeURIComponent(configKey)}`, {
      method: 'PUT',
      body: JSON.stringify({
        value: configValue,
        description: description || null
      })
    });
    closeModal('add-config-modal');
    showToast(`Config "${configKey}" created successfully`, 'success');
    loadSystemConfig();
  } catch (err) {
    showToast(`Failed to create: ${err.message}`, 'error');
  }
}

async function loadPlatformConfig() {
  const platform = document.getElementById('system-platform-select').value;

  try {
    const { platforms } = await apiCall('/admin/system/platforms');
    const config = platforms.find(p => p.platform === platform);

    if (config) {
      document.getElementById('platform-max-caption').value = config.max_caption_length || 2200;
      document.getElementById('platform-max-hashtags').value = config.max_hashtags || 30;
      document.getElementById('platform-max-slides').value = config.max_carousel_slides || 10;
      document.getElementById('platform-optimal-hashtags').value = config.optimal_hashtag_count || 8;
    }

  } catch (err) {
    console.error('Load platform config error:', err);
  }
}

async function savePlatformConfig() {
  const platform = document.getElementById('system-platform-select').value;

  const data = {
    max_caption_length: parseInt(document.getElementById('platform-max-caption').value),
    max_hashtags: parseInt(document.getElementById('platform-max-hashtags').value),
    max_carousel_slides: parseInt(document.getElementById('platform-max-slides').value),
    optimal_hashtag_count: parseInt(document.getElementById('platform-optimal-hashtags').value)
  };

  try {
    await apiCall(`/admin/system/platforms/${platform}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    showToast('Platform config saved', 'success');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ============================================================================
// AUDIT LOG TAB
// ============================================================================

// Audit log state
let auditLogCache = {
  entries: [],
  total: 0,
  offset: 0,
  hasMore: false
};

/**
 * Load audit log entries
 * @param {string} direction - 'prev', 'next', or undefined for fresh load
 */
async function loadAuditLog(direction) {
  try {
    // Populate client filter dropdown on first load
    if (!direction) {
      populateAuditClientFilter();
      auditLogCache.offset = 0;
    } else if (direction === 'prev') {
      auditLogCache.offset = Math.max(0, auditLogCache.offset - 100);
    } else if (direction === 'next') {
      // offset already points to next batch
    }

    // Build query params from filters
    const params = new URLSearchParams();

    const clientFilter = document.getElementById('audit-filter-client')?.value;
    const actionFilter = document.getElementById('audit-filter-action')?.value;
    const entityFilter = document.getElementById('audit-filter-entity')?.value;
    const daysFilter = document.getElementById('audit-filter-date')?.value;

    if (clientFilter) params.append('client_id', clientFilter);
    if (actionFilter) params.append('action', actionFilter);
    if (entityFilter) params.append('entity_type', entityFilter);
    if (daysFilter) params.append('days', daysFilter);
    params.append('limit', '50');
    params.append('offset', auditLogCache.offset.toString());

    const data = await apiCall(`/admin/audit-log?${params.toString()}`);

    auditLogCache.entries = data.entries;
    auditLogCache.total = data.total;
    auditLogCache.hasMore = data.hasMore;
    auditLogCache.offset = data.offset + data.entries.length;

    renderAuditLogTable();
    updateAuditLogPagination();

    lucide.createIcons();

  } catch (err) {
    console.error('Load audit log error:', err);
    showToast('Failed to load audit log', 'error');
  }
}

/**
 * Populate client filter dropdown with cached clients
 */
function populateAuditClientFilter() {
  const select = document.getElementById('audit-filter-client');
  if (!select) return;

  // Keep the "All Clients" option
  select.innerHTML = '<option value="">All Clients</option>';

  // Add clients from cache
  clientsCache.forEach(client => {
    const option = document.createElement('option');
    option.value = client.client_id;
    option.textContent = client.name || client.client_key || client.client_id.slice(0, 8);
    select.appendChild(option);
  });
}

/**
 * Render audit log table
 */
function renderAuditLogTable() {
  const tbody = document.getElementById('audit-log-body');
  if (!tbody) return;

  if (auditLogCache.entries.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="text-center text-gray-400 py-8">
          No audit log entries found matching the current filters.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = auditLogCache.entries.map(entry => {
    // Get client name from cache
    const client = clientsCache.find(c => c.client_id === entry.client_id);
    const clientName = client?.name || entry.client_id?.slice(0, 8) || 'System';

    // Format action nicely
    const actionBadgeClass = getActionBadgeClass(entry.action);

    return `
      <tr class="hover:bg-slate-700/50">
        <td class="text-xs text-gray-400">${formatDateTime(entry.created_at)}</td>
        <td>
          <span class="badge ${actionBadgeClass}">${formatAction(entry.action)}</span>
        </td>
        <td class="text-sm">${entry.entity_type || '-'}</td>
        <td class="text-sm text-gray-300">${clientName}</td>
        <td class="text-sm text-gray-400">${entry.actor_email || 'Unknown'}</td>
        <td class="text-right">
          <button onclick="viewAuditDetails('${entry.log_id}')" class="text-brandBlue hover:text-brandBlue/80 text-sm">
            View
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

/**
 * Get badge class based on action type
 */
function getActionBadgeClass(action) {
  if (!action) return 'badge-gray';
  if (action.startsWith('create')) return 'badge-green';
  if (action.startsWith('update')) return 'badge-blue';
  if (action.startsWith('delete')) return 'badge-red';
  if (action.startsWith('bulk')) return 'badge-yellow';
  return 'badge-gray';
}

/**
 * Format action for display
 */
function formatAction(action) {
  if (!action) return '-';
  // Convert snake_case to Title Case
  return action.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

/**
 * Format datetime for display
 */
function formatDateTime(dateStr) {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Update pagination controls
 */
function updateAuditLogPagination() {
  const infoEl = document.getElementById('audit-pagination-info');
  const prevBtn = document.getElementById('audit-prev-btn');
  const nextBtn = document.getElementById('audit-next-btn');

  const startIdx = auditLogCache.offset - auditLogCache.entries.length + 1;
  const endIdx = auditLogCache.offset;

  if (infoEl) {
    infoEl.textContent = `Showing ${startIdx}-${endIdx} of ${auditLogCache.total} entries`;
  }

  if (prevBtn) {
    prevBtn.disabled = startIdx <= 1;
  }

  if (nextBtn) {
    nextBtn.disabled = !auditLogCache.hasMore;
  }
}

/**
 * Reset audit log filters
 */
function resetAuditFilters() {
  document.getElementById('audit-filter-client').value = '';
  document.getElementById('audit-filter-action').value = '';
  document.getElementById('audit-filter-entity').value = '';
  document.getElementById('audit-filter-date').value = '7';
  loadAuditLog();
}

/**
 * View audit entry details in modal
 */
function viewAuditDetails(logId) {
  const entry = auditLogCache.entries.find(e => e.log_id === logId);
  if (!entry) return;

  const client = clientsCache.find(c => c.client_id === entry.client_id);
  const clientName = client?.name || entry.client_id?.slice(0, 8) || 'System';

  const html = `
    <div class="fixed inset-0 bg-black/70 flex items-center justify-center z-50" id="audit-detail-modal">
      <div class="bg-slate-800 rounded-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b border-slate-700 flex items-center justify-between">
          <h2 class="text-xl font-semibold">Audit Log Entry</h2>
          <button onclick="closeModal('audit-detail-modal')" class="text-gray-400 hover:text-white">
            <i data-lucide="x" class="w-6 h-6"></i>
          </button>
        </div>
        <div class="p-6 space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <span class="text-sm text-gray-400">Timestamp</span>
              <p class="font-medium">${formatDateTime(entry.created_at)}</p>
            </div>
            <div>
              <span class="text-sm text-gray-400">Action</span>
              <p><span class="badge ${getActionBadgeClass(entry.action)}">${formatAction(entry.action)}</span></p>
            </div>
            <div>
              <span class="text-sm text-gray-400">Entity Type</span>
              <p class="font-medium">${entry.entity_type || '-'}</p>
            </div>
            <div>
              <span class="text-sm text-gray-400">Entity ID</span>
              <p class="font-mono text-sm">${entry.entity_id || '-'}</p>
            </div>
            <div>
              <span class="text-sm text-gray-400">Client</span>
              <p class="font-medium">${clientName}</p>
            </div>
            <div>
              <span class="text-sm text-gray-400">Actor</span>
              <p class="font-medium">${entry.actor_email || 'Unknown'}</p>
            </div>
            <div>
              <span class="text-sm text-gray-400">IP Address</span>
              <p class="font-mono text-sm">${entry.ip_address || 'N/A'}</p>
            </div>
            <div>
              <span class="text-sm text-gray-400">Actor Type</span>
              <p class="font-medium capitalize">${entry.actor_type || 'N/A'}</p>
            </div>
          </div>

          ${entry.old_value ? `
            <div>
              <span class="text-sm text-gray-400">Old Value</span>
              <pre class="mt-1 bg-slate-900 p-3 rounded text-xs overflow-x-auto max-h-40">${escapeHtml(JSON.stringify(entry.old_value, null, 2))}</pre>
            </div>
          ` : ''}

          ${entry.new_value ? `
            <div>
              <span class="text-sm text-gray-400">New Value</span>
              <pre class="mt-1 bg-slate-900 p-3 rounded text-xs overflow-x-auto max-h-40">${escapeHtml(JSON.stringify(entry.new_value, null, 2))}</pre>
            </div>
          ` : ''}

          <div class="pt-4 border-t border-slate-700 flex justify-end">
            <button onclick="closeModal('audit-detail-modal')" class="btn btn-secondary">Close</button>
          </div>
        </div>
      </div>
    </div>
  `;

  document.getElementById('modals-container').innerHTML = html;
  lucide.createIcons();
}

// ============================================================================
// MONACO EDITOR
// ============================================================================

function initMonacoEditor() {
  require.config({ paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs' } });

  require(['vs/editor/editor.main'], function () {
    // Define dark theme
    monaco.editor.defineTheme('tbb-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#0f172a',
        'editor.foreground': '#e2e8f0'
      }
    });

    // Create rules editor
    const rulesContainer = document.getElementById('rules-editor');
    if (rulesContainer) {
      rulesEditor = monaco.editor.create(rulesContainer, {
        value: '{}',
        language: 'json',
        theme: 'tbb-dark',
        minimap: { enabled: false },
        lineNumbers: 'on',
        scrollBeyondLastLine: false,
        automaticLayout: true,
        tabSize: 2
      });
    }
  });
}

// ============================================================================
// UTILITIES
// ============================================================================

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');

  const colors = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    warning: 'bg-yellow-600',
    info: 'bg-blue-600'
  };

  toast.className = `toast px-4 py-3 rounded-lg ${colors[type]} text-white shadow-lg`;
  toast.textContent = message;

  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 4000);
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.remove();
}

function toggleCollapsible(header) {
  const content = header.nextElementSibling;
  const icon = header.querySelector('[data-lucide="chevron-down"]');

  content.classList.toggle('open');

  if (icon) {
    icon.style.transform = content.classList.contains('open') ? 'rotate(180deg)' : '';
  }
}

function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function formatDays(days) {
  if (!days || days.length === 0) return 'None';
  const names = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days.map(d => names[d]).join(', ');
}

function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    showToast('Copied to clipboard', 'success');
  });
}

function logout() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  window.location.href = '/portal/index.html';
}

// Placeholder functions for unimplemented features
function resendWelcomeEmail() {
  showToast('Feature coming soon', 'info');
}

function confirmDeleteClient() {
  showToast('Delete client functionality is disabled for safety', 'warning');
}
