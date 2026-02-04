/**
 * Settings Page
 * Client portal configuration settings
 * Sections: Branding, Schedule, Approval, Hashtags, Themes
 */

window.Settings = {
  activeTab: 'branding',
  data: {
    settings: null,
    branding: null,
    schedules: [],
    limits: null,
    hashtags: [],
    themes: []
  },

  // Helper function for translations
  t(key, fallback) {
    return window.PortalI18n ? PortalI18n.t(key, fallback) : fallback || key;
  },

  async render(container) {
    const t = this.t.bind(this);

    container.innerHTML = `
      <div class="space-y-6">
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 class="text-2xl lg:text-3xl font-bold">${t('settings.title', 'Settings')}</h1>
            <p class="text-gray-400 mt-1">${t('settings.subtitle', 'Configure your account preferences')}</p>
          </div>
        </div>

        <!-- Loading -->
        <div id="settings-loading" class="p-8 text-center">
          <div class="loading-spinner mx-auto"></div>
          <p class="text-gray-400 mt-3">${t('loading.settings', 'Loading settings...')}</p>
        </div>

        <!-- Settings Content -->
        <div id="settings-content" class="hidden">
          <!-- Tabs -->
          <div class="border-b border-slate-700 mb-6">
            <nav class="flex gap-1 overflow-x-auto pb-px" id="settings-tabs">
              <button data-tab="branding" class="tab-btn px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 transition-colors whitespace-nowrap">
                <i data-lucide="palette" class="w-4 h-4 inline mr-2"></i>${t('settings.branding', 'Branding')}
              </button>
              <button data-tab="schedule" class="tab-btn px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 transition-colors whitespace-nowrap">
                <i data-lucide="clock" class="w-4 h-4 inline mr-2"></i>${t('settings.schedule', 'Schedule')}
              </button>
              <button data-tab="approval" class="tab-btn px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 transition-colors whitespace-nowrap">
                <i data-lucide="check-circle" class="w-4 h-4 inline mr-2"></i>${t('settings.approval', 'Approval')}
              </button>
              <button data-tab="hashtags" class="tab-btn px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 transition-colors whitespace-nowrap">
                <i data-lucide="hash" class="w-4 h-4 inline mr-2"></i>${t('settings.hashtags', 'Hashtags')}
              </button>
              <button data-tab="themes" class="tab-btn px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 transition-colors whitespace-nowrap">
                <i data-lucide="sparkles" class="w-4 h-4 inline mr-2"></i>${t('settings.themes', 'Themes')}
              </button>
            </nav>
          </div>

          <!-- Tab Panels -->
          <div id="tab-panels">
            <!-- Content rendered by tab handlers -->
          </div>
        </div>
      </div>
    `;

    lucide.createIcons();
    this.bindTabEvents();
    await this.loadAllData();
  },

  bindTabEvents() {
    document.getElementById('settings-tabs')?.addEventListener('click', (e) => {
      const btn = e.target.closest('.tab-btn');
      if (btn) {
        this.switchTab(btn.dataset.tab);
      }
    });
  },

  switchTab(tabId) {
    this.activeTab = tabId;

    // Update tab button styles
    document.querySelectorAll('.tab-btn').forEach(btn => {
      if (btn.dataset.tab === tabId) {
        btn.classList.add('border-brandBlue', 'text-brandBlue', 'bg-brandBlue/10');
        btn.classList.remove('border-transparent', 'text-gray-400', 'hover:text-white');
      } else {
        btn.classList.remove('border-brandBlue', 'text-brandBlue', 'bg-brandBlue/10');
        btn.classList.add('border-transparent', 'text-gray-400', 'hover:text-white');
      }
    });

    // Render tab content
    this.renderTabContent(tabId);
  },

  async loadAllData() {
    const loading = document.getElementById('settings-loading');
    const content = document.getElementById('settings-content');

    try {
      // Load all data in parallel
      const [settingsRes, brandingRes, schedulesRes, hashtagsRes, themesRes] = await Promise.all([
        API.request('/api/portal/settings'),
        API.request('/api/portal/branding'),
        API.request('/api/portal/schedules'),
        API.request('/api/portal/hashtags'),
        API.request('/api/portal/themes')
      ]);

      this.data.settings = settingsRes?.settings || {};
      this.data.branding = brandingRes?.branding || {};
      this.data.schedules = schedulesRes?.schedules || [];
      this.data.limits = schedulesRes?.limits || {
        max_posts_per_day_allowed: 3,
        max_posts_per_week_allowed: 14,
        max_posting_times_allowed: 5
      };
      this.data.hashtags = hashtagsRes?.hashtags || [];
      this.data.themes = themesRes?.themes || [];

      loading.classList.add('hidden');
      content.classList.remove('hidden');
      lucide.createIcons();

      // Switch to initial tab
      this.switchTab(this.activeTab);

    } catch (error) {
      const t = this.t.bind(this);
      console.error('Failed to load settings:', error);
      loading.innerHTML = `
        <i data-lucide="alert-circle" class="w-12 h-12 mx-auto text-red-400"></i>
        <p class="text-red-400 mt-3">${t('error.loadSettings', 'Failed to load settings:')} ${error.message}</p>
        <button onclick="Settings.loadAllData()" class="mt-4 px-4 py-2 bg-slate-700 rounded-lg hover:bg-slate-600">${t('common.tryAgain', 'Try Again')}</button>
      `;
      lucide.createIcons();
    }
  },

  renderTabContent(tabId) {
    const panel = document.getElementById('tab-panels');

    switch (tabId) {
      case 'branding':
        this.renderBrandingTab(panel);
        break;
      case 'schedule':
        this.renderScheduleTab(panel);
        break;
      case 'approval':
        this.renderApprovalTab(panel);
        break;
      case 'hashtags':
        this.renderHashtagsTab(panel);
        break;
      case 'themes':
        this.renderThemesTab(panel);
        break;
    }

    lucide.createIcons();
  },

  // ==========================================
  // BRANDING TAB
  // ==========================================

  // Helper to get logo as data URI
  getLogoDataUri(branding) {
    if (!branding?.logo_base64) return null;
    // If already a data URI, return as-is
    if (branding.logo_base64.startsWith('data:')) return branding.logo_base64;
    // Construct data URI from raw base64 and mime type
    const mimeType = branding.logo_mime_type || 'image/png';
    return `data:${mimeType};base64,${branding.logo_base64}`;
  },

  renderBrandingTab(panel) {
    const t = this.t.bind(this);
    const branding = this.data.branding || {};
    const logoUri = this.getLogoDataUri(branding);

    panel.innerHTML = `
      <form id="branding-form" class="space-y-6">
        <!-- Logo -->
        <div class="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
          <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
            <i data-lucide="image" class="w-5 h-5 text-brandBlue"></i>
            ${t('settings.logo', 'Logo')}
          </h3>
          <div class="flex items-start gap-6">
            <div id="logo-preview" class="w-24 h-24 bg-slate-900 rounded-lg flex items-center justify-center border border-slate-600 overflow-hidden">
              ${logoUri
                ? `<img src="${logoUri}" alt="Logo" class="w-full h-full object-contain">`
                : `<i data-lucide="image-off" class="w-8 h-8 text-gray-500"></i>`
              }
            </div>
            <div class="flex-1">
              <input type="file" id="logo-upload" accept="image/png,image/jpeg,image/svg+xml" class="hidden">
              <button type="button" id="upload-logo-btn" class="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm flex items-center gap-2">
                <i data-lucide="upload" class="w-4 h-4"></i>
                ${t('settings.uploadLogo', 'Upload Logo')}
              </button>
              <p class="text-sm text-gray-400 mt-2">${t('settings.logoHelp', 'PNG, JPG, or SVG. Max 500KB. Will be stored as base64.')}</p>
              ${logoUri ? `
                <button type="button" id="remove-logo-btn" class="mt-2 text-sm text-red-400 hover:text-red-300">${t('settings.removeLogo', 'Remove logo')}</button>
              ` : ''}
            </div>
          </div>
        </div>

        <!-- Colors -->
        <div class="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
          <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
            <i data-lucide="palette" class="w-5 h-5 text-brandBlue"></i>
            ${t('settings.brandColors', 'Brand Colors')}
          </h3>
          <div class="grid sm:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm text-gray-400 mb-2">${t('settings.primaryColor', 'Primary Color')}</label>
              <div class="flex items-center gap-3">
                <input type="color" id="primary-color" value="${branding.primary_color || '#0ea5e9'}"
                  class="w-12 h-10 rounded cursor-pointer bg-transparent border-0">
                <input type="text" id="primary-color-text" value="${branding.primary_color || '#0ea5e9'}"
                  class="flex-1 px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-sm font-mono"
                  pattern="^#[0-9A-Fa-f]{6}$" maxlength="7">
              </div>
            </div>
            <div>
              <label class="block text-sm text-gray-400 mb-2">${t('settings.secondaryColor', 'Secondary Color')}</label>
              <div class="flex items-center gap-3">
                <input type="color" id="secondary-color" value="${branding.secondary_color || '#fb923c'}"
                  class="w-12 h-10 rounded cursor-pointer bg-transparent border-0">
                <input type="text" id="secondary-color-text" value="${branding.secondary_color || '#fb923c'}"
                  class="flex-1 px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-sm font-mono"
                  pattern="^#[0-9A-Fa-f]{6}$" maxlength="7">
              </div>
            </div>
          </div>
        </div>

        <!-- Tagline -->
        <div class="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
          <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
            <i data-lucide="type" class="w-5 h-5 text-brandBlue"></i>
            ${t('settings.companyTagline', 'Company Tagline')}
          </h3>
          <div>
            <input type="text" id="company-tagline" value="${branding.company_tagline || ''}"
              placeholder="${t('settings.taglinePlaceholder', 'Your company tagline or slogan')}"
              class="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg focus:ring-2 focus:ring-brandBlue">
          </div>
        </div>

        <!-- Save Button -->
        <div class="flex justify-end">
          <button type="submit" class="px-6 py-3 bg-brandBlue hover:bg-sky-600 rounded-lg font-medium transition-colors flex items-center gap-2">
            <i data-lucide="save" class="w-4 h-4"></i>
            ${t('settings.saveBranding', 'Save Branding')}
          </button>
        </div>
      </form>
    `;

    this.bindBrandingEvents();
  },

  bindBrandingEvents() {
    // Logo upload
    const uploadBtn = document.getElementById('upload-logo-btn');
    const logoInput = document.getElementById('logo-upload');
    const removeBtn = document.getElementById('remove-logo-btn');

    uploadBtn?.addEventListener('click', () => logoInput?.click());

    logoInput?.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (file) {
        this.handleLogoUpload(file);
      }
    });

    removeBtn?.addEventListener('click', () => {
      this.data.branding.logo_base64 = null;
      document.getElementById('logo-preview').innerHTML = `<i data-lucide="image-off" class="w-8 h-8 text-gray-500"></i>`;
      lucide.createIcons();
    });

    // Color pickers sync with text inputs
    const primaryColor = document.getElementById('primary-color');
    const primaryText = document.getElementById('primary-color-text');
    const secondaryColor = document.getElementById('secondary-color');
    const secondaryText = document.getElementById('secondary-color-text');

    primaryColor?.addEventListener('input', () => primaryText.value = primaryColor.value);
    primaryText?.addEventListener('input', () => {
      if (/^#[0-9A-Fa-f]{6}$/.test(primaryText.value)) {
        primaryColor.value = primaryText.value;
      }
    });

    secondaryColor?.addEventListener('input', () => secondaryText.value = secondaryColor.value);
    secondaryText?.addEventListener('input', () => {
      if (/^#[0-9A-Fa-f]{6}$/.test(secondaryText.value)) {
        secondaryColor.value = secondaryText.value;
      }
    });

    // Form submit
    document.getElementById('branding-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveBranding();
    });
  },

  async handleLogoUpload(file) {
    const t = this.t.bind(this);
    // Validate file
    if (file.size > 500 * 1024) {
      UI.toast(t('settings.logoTooLarge', 'Logo must be less than 500KB'), 'error');
      return;
    }

    const validTypes = ['image/png', 'image/jpeg', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      UI.toast(t('settings.logoInvalidType', 'Logo must be PNG, JPG, or SVG'), 'error');
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUri = e.target.result;
      // Parse data URI to extract raw base64 and mime type
      const matches = dataUri.match(/^data:([^;]+);base64,(.+)$/);
      if (matches) {
        this.data.branding.logo_mime_type = matches[1];
        this.data.branding.logo_base64 = matches[2]; // raw base64 only
      }

      // Update preview
      document.getElementById('logo-preview').innerHTML = `
        <img src="${dataUri}" alt="Logo" class="w-full h-full object-contain">
      `;
    };
    reader.readAsDataURL(file);
  },

  async saveBranding() {
    const brandingData = {
      logo_base64: this.data.branding.logo_base64,
      logo_mime_type: this.data.branding.logo_mime_type,
      primary_color: document.getElementById('primary-color').value,
      secondary_color: document.getElementById('secondary-color').value,
      company_tagline: document.getElementById('company-tagline').value.trim() || null
    };

    try {
      await API.request('/api/portal/branding', {
        method: 'PUT',
        body: JSON.stringify(brandingData)
      });

      this.data.branding = { ...this.data.branding, ...brandingData };
      UI.toast(this.t('settings.brandingSaved', 'Branding saved successfully!'), 'success');
    } catch (error) {
      UI.toast(`${this.t('error.saveFailed', 'Failed to save:')} ${error.message}`, 'error');
    }
  },

  // ==========================================
  // SCHEDULE TAB
  // ==========================================

  renderScheduleTab(panel) {
    const t = this.t.bind(this);
    const schedules = this.data.schedules || [];
    const settings = this.data.settings || {};
    const isActive = settings.posting_active !== false;

    panel.innerHTML = `
      <div class="space-y-6">
        <!-- Posting Status -->
        <div class="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
          <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
            <i data-lucide="power" class="w-5 h-5 text-brandBlue"></i>
            ${t('settings.postingStatus', 'Posting Status')}
          </h3>
          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium ${isActive ? 'text-green-400' : 'text-yellow-400'}">
                ${isActive ? t('settings.postingActive', 'Posting is ACTIVE') : t('settings.postingPaused', 'Posting is PAUSED')}
              </p>
              <p class="text-sm text-gray-400 mt-1">
                ${isActive
                  ? t('settings.postingActiveDesc', 'Posts will be published according to your schedule')
                  : t('settings.postingPausedDesc', 'Scheduled posts will not be published until you resume')}
              </p>
            </div>
            <button id="toggle-posting-btn" class="px-4 py-2 ${isActive ? 'bg-yellow-600 hover:bg-yellow-500' : 'bg-green-600 hover:bg-green-500'} rounded-lg font-medium flex items-center gap-2">
              <i data-lucide="${isActive ? 'pause' : 'play'}" class="w-4 h-4"></i>
              ${isActive ? t('settings.pausePosting', 'Pause Posting') : t('settings.resumePosting', 'Resume Posting')}
            </button>
          </div>
        </div>

        <!-- Timezone -->
        <div class="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
          <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
            <i data-lucide="globe" class="w-5 h-5 text-brandBlue"></i>
            ${t('settings.timezone', 'Timezone')}
          </h3>
          <select id="settings-timezone" class="w-full md:w-1/2 px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg focus:ring-2 focus:ring-brandBlue">
            <option value="America/New_York" ${settings.timezone === 'America/New_York' ? 'selected' : ''}>${t('tz.eastern', 'Eastern Time (ET)')}</option>
            <option value="America/Chicago" ${settings.timezone === 'America/Chicago' ? 'selected' : ''}>${t('tz.central', 'Central Time (CT)')}</option>
            <option value="America/Denver" ${settings.timezone === 'America/Denver' ? 'selected' : ''}>${t('tz.mountain', 'Mountain Time (MT)')}</option>
            <option value="America/Los_Angeles" ${settings.timezone === 'America/Los_Angeles' ? 'selected' : ''}>${t('tz.pacific', 'Pacific Time (PT)')}</option>
            <option value="America/Sao_Paulo" ${settings.timezone === 'America/Sao_Paulo' ? 'selected' : ''}>${t('tz.brazil', 'Brazil (BRT)')}</option>
            <option value="Europe/London" ${settings.timezone === 'Europe/London' ? 'selected' : ''}>${t('tz.london', 'London (GMT/BST)')}</option>
            <option value="Europe/Paris" ${settings.timezone === 'Europe/Paris' ? 'selected' : ''}>${t('tz.paris', 'Paris (CET)')}</option>
            <option value="Asia/Tokyo" ${settings.timezone === 'Asia/Tokyo' ? 'selected' : ''}>${t('tz.tokyo', 'Tokyo (JST)')}</option>
            <option value="UTC" ${settings.timezone === 'UTC' ? 'selected' : ''}>${t('tz.utc', 'UTC')}</option>
          </select>
        </div>

        <!-- Platform Schedules -->
        <div class="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
          <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
            <i data-lucide="calendar" class="w-5 h-5 text-brandBlue"></i>
            ${t('settings.platformSchedules', 'Platform Schedules')}
          </h3>
          <div id="platform-schedules" class="space-y-4">
            ${schedules.length > 0 ? schedules.map(sched => this.renderScheduleCard(sched)).join('') : `
              <p class="text-gray-400 text-center py-4">${t('settings.noSchedules', 'No schedules configured. Contact admin to set up schedules.')}</p>
            `}
          </div>
        </div>

        <!-- Save Button -->
        <div class="flex justify-end">
          <button id="save-schedule-btn" class="px-6 py-3 bg-brandBlue hover:bg-sky-600 rounded-lg font-medium transition-colors flex items-center gap-2">
            <i data-lucide="save" class="w-4 h-4"></i>
            ${t('settings.saveSchedule', 'Save Schedule Settings')}
          </button>
        </div>
      </div>
    `;

    this.bindScheduleEvents();
  },

  // Helper to parse JSON fields that may be strings
  parseJsonField(value, defaultValue = []) {
    if (!value) return defaultValue;
    if (Array.isArray(value)) return value;
    try {
      return JSON.parse(value);
    } catch {
      return defaultValue;
    }
  },

  renderScheduleCard(schedule) {
    const t = this.t.bind(this);
    const platform = PortalConfig.getPlatformById(schedule.platform);
    const limits = this.data.limits || {};
    // Parse JSON strings - DB stores as "[1, 2, 3]" and "[\"08:00\"]"
    const days = this.parseJsonField(schedule.posting_days, []);
    const times = this.parseJsonField(schedule.posting_times, []);
    const isActive = schedule.is_active;
    const maxPostsPerDay = schedule.max_posts_per_day || 1;
    const maxPostsPerWeek = schedule.max_posts_per_week || 7;

    // Day values: 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat, 0 or 7=Sun
    const dayLabels = [t('day.mon', 'Mon'), t('day.tue', 'Tue'), t('day.wed', 'Wed'), t('day.thu', 'Thu'), t('day.fri', 'Fri'), t('day.sat', 'Sat'), t('day.sun', 'Sun')];
    const dayValues = [1, 2, 3, 4, 5, 6, 0]; // DB uses 1-6 for Mon-Sat, 0 for Sun

    // Generate options based on plan limits
    const dayOptions = Array.from({ length: limits.max_posts_per_day_allowed || 3 }, (_, i) => i + 1);
    const weekOptions = Array.from({ length: limits.max_posts_per_week_allowed || 14 }, (_, i) => i + 1);
    const canAddMoreTimes = times.length < (limits.max_posting_times_allowed || 5);

    // Styles for disabled state
    const disabledClass = !isActive ? 'opacity-50 pointer-events-none' : '';

    return `
      <div class="p-4 bg-slate-900/50 rounded-lg border ${isActive ? 'border-slate-700' : 'border-slate-800'}" data-schedule-id="${schedule.schedule_id}">
        <!-- Header with platform and toggle -->
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg flex items-center justify-center ${!isActive ? 'opacity-50' : ''}" style="background: ${platform?.color || '#666'}20">
              <i data-lucide="${platform?.icon || 'share-2'}" class="w-5 h-5" style="color: ${platform?.color || '#666'}"></i>
            </div>
            <div class="${!isActive ? 'opacity-50' : ''}">
              <p class="font-medium">${platform?.name || schedule.platform}</p>
            </div>
          </div>
          <label class="flex items-center gap-2 cursor-pointer">
            <span class="text-sm ${isActive ? 'text-green-400' : 'text-gray-400'}">
              ${isActive ? t('settings.active', 'Active') : t('settings.inactive', 'Inactive')}
            </span>
            <input type="checkbox" class="schedule-toggle w-5 h-5 rounded bg-slate-900 border-slate-600 text-brandBlue focus:ring-brandBlue"
              data-schedule-id="${schedule.schedule_id}" ${isActive ? 'checked' : ''}>
          </label>
        </div>

        <div class="${disabledClass}">
          <!-- Posting Frequency -->
          <div class="mb-4 p-3 bg-slate-800/50 rounded-lg">
            <div class="flex items-center gap-2 mb-3">
              <span class="text-sm font-medium text-gray-300">${t('settings.postingFrequency', 'Posting Frequency')}</span>
              <button type="button" class="tooltip-trigger" data-tooltip="frequency-${schedule.schedule_id}">
                <i data-lucide="info" class="w-4 h-4 text-gray-500 hover:text-gray-300"></i>
              </button>
            </div>
            <div class="grid sm:grid-cols-2 gap-4">
              <div class="flex items-center gap-2">
                <label class="text-sm text-gray-400 whitespace-nowrap">${t('settings.maxPerDay', 'Max per day:')}</label>
                <select class="max-posts-day flex-1 px-3 py-1.5 bg-slate-900 border border-slate-600 rounded text-sm"
                  data-schedule-id="${schedule.schedule_id}" ${!isActive ? 'disabled' : ''}>
                  ${dayOptions.map(n => `<option value="${n}" ${n === maxPostsPerDay ? 'selected' : ''}>${n}</option>`).join('')}
                </select>
              </div>
              <div class="flex items-center gap-2">
                <label class="text-sm text-gray-400 whitespace-nowrap">${t('settings.maxPerWeek', 'Max per week:')}</label>
                <select class="max-posts-week flex-1 px-3 py-1.5 bg-slate-900 border border-slate-600 rounded text-sm"
                  data-schedule-id="${schedule.schedule_id}" ${!isActive ? 'disabled' : ''}>
                  ${weekOptions.map(n => `<option value="${n}" ${n === maxPostsPerWeek ? 'selected' : ''}>${n}</option>`).join('')}
                </select>
              </div>
            </div>
          </div>

          <!-- Posting Days -->
          <div class="mb-4">
            <label class="block text-sm text-gray-400 mb-2">${t('settings.postingDays', 'Posting Days')}</label>
            <div class="flex flex-wrap gap-1">
              ${dayLabels.map((label, idx) => {
                const dayVal = dayValues[idx];
                const dayActive = days.includes(dayVal);
                return `
                  <button type="button" class="day-toggle px-2.5 py-1.5 text-xs rounded ${dayActive ? 'bg-brandBlue text-white' : 'bg-slate-800 text-gray-400 hover:bg-slate-700'}"
                    data-schedule-id="${schedule.schedule_id}" data-day="${dayVal}" ${!isActive ? 'disabled' : ''}>
                    ${label}
                  </button>
                `;
              }).join('')}
            </div>
          </div>

          <!-- Posting Time Slots -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-2">
                <label class="text-sm text-gray-400">${t('settings.postingTimeSlots', 'Posting Time Slots')}</label>
                <button type="button" class="tooltip-trigger" data-tooltip="times-${schedule.schedule_id}">
                  <i data-lucide="info" class="w-4 h-4 text-gray-500 hover:text-gray-300"></i>
                </button>
              </div>
              <span class="text-xs text-gray-500">${times.length} ${t('settings.slotsOf', 'of')} ${limits.max_posting_times_allowed || 5} ${t('settings.slots', 'slots')}</span>
            </div>
            <div class="flex flex-wrap gap-2 mb-2">
              ${times.map((time, idx) => `
                <div class="flex items-center gap-1 bg-slate-800 rounded border border-slate-600">
                  <input type="time" value="${time}" class="posting-time px-2 py-1.5 bg-transparent border-0 text-sm focus:ring-0"
                    data-schedule-id="${schedule.schedule_id}" data-time-idx="${idx}" ${!isActive ? 'disabled' : ''}>
                  <button type="button" class="remove-time px-2 py-1.5 text-red-400 hover:text-red-300 hover:bg-slate-700 rounded-r"
                    data-schedule-id="${schedule.schedule_id}" data-time-idx="${idx}" ${!isActive ? 'disabled' : ''}>
                    <i data-lucide="x" class="w-3 h-3"></i>
                  </button>
                </div>
              `).join('')}
              ${canAddMoreTimes ? `
                <button type="button" class="add-time px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-dashed border-slate-600 rounded text-sm text-gray-400 hover:text-white flex items-center gap-1"
                  data-schedule-id="${schedule.schedule_id}" ${!isActive ? 'disabled' : ''}>
                  <i data-lucide="plus" class="w-3 h-3"></i>
                  ${t('settings.add', 'Add')}
                </button>
              ` : `
                <span class="text-xs text-amber-500 px-2 py-1.5">${t('settings.maxSlotsReached', 'Max slots reached')}</span>
              `}
            </div>
          </div>
        </div>

        <!-- Tooltips (hidden by default) -->
        <div id="tooltip-frequency-${schedule.schedule_id}" class="hidden fixed z-50 max-w-xs p-3 bg-slate-700 rounded-lg shadow-lg text-sm">
          <p class="text-white mb-2"><strong>Posting Frequency</strong></p>
          <p class="text-gray-300 mb-2"><strong>Max per day:</strong> The maximum posts published in a single day, even with multiple time slots.</p>
          <p class="text-gray-300"><strong>Max per week:</strong> Limits total posts in a 7-day period for consistent content.</p>
          <p class="text-gray-400 text-xs mt-2">Your plan: up to ${limits.max_posts_per_day_allowed}/day, ${limits.max_posts_per_week_allowed}/week</p>
        </div>
        <div id="tooltip-times-${schedule.schedule_id}" class="hidden fixed z-50 max-w-xs p-3 bg-slate-700 rounded-lg shadow-lg text-sm">
          <p class="text-amber-400 mb-2"><strong>Important:</strong> These are <em>potential</em> publishing times.</p>
          <p class="text-gray-300 mb-2">A post will only publish if:</p>
          <ul class="text-gray-300 text-xs list-disc ml-4 mb-2">
            <li>Content has been generated</li>
            <li>The post has been approved (if required)</li>
            <li>Daily/weekly limits haven't been reached</li>
          </ul>
          <p class="text-gray-400 text-xs">Your plan allows up to ${limits.max_posting_times_allowed} time slots.</p>
        </div>
      </div>
    `;
  },

  bindScheduleEvents() {
    // Toggle posting active/paused
    document.getElementById('toggle-posting-btn')?.addEventListener('click', async () => {
      const isCurrentlyActive = this.data.settings.posting_active !== false;
      const newState = !isCurrentlyActive;

      try {
        await API.request('/api/portal/settings', {
          method: 'PUT',
          body: JSON.stringify({ posting_active: newState })
        });

        this.data.settings.posting_active = newState;
        UI.toast(newState ? this.t('settings.resumePosting', 'Posting resumed') : this.t('settings.pausePosting', 'Posting paused'), 'success');
        this.renderScheduleTab(document.getElementById('tab-panels'));
        lucide.createIcons();
      } catch (error) {
        UI.toast(`Failed: ${error.message}`, 'error');
      }
    });

    // Schedule toggles
    document.querySelectorAll('.schedule-toggle').forEach(toggle => {
      toggle.addEventListener('change', async (e) => {
        const scheduleId = e.target.dataset.scheduleId;
        const isActive = e.target.checked;

        try {
          await API.request(`/api/portal/schedules/${scheduleId}`, {
            method: 'PUT',
            body: JSON.stringify({ is_active: isActive })
          });

          // Update local data
          const sched = this.data.schedules.find(s => s.schedule_id === scheduleId);
          if (sched) sched.is_active = isActive;

          UI.toast(isActive ? this.t('settings.scheduleActivated', 'Schedule activated') : this.t('settings.scheduleDeactivated', 'Schedule deactivated'), 'success');

          // Re-render to show/hide disabled state
          this.renderScheduleTab(document.getElementById('tab-panels'));
          lucide.createIcons();
        } catch (error) {
          e.target.checked = !isActive; // Revert
          UI.toast(`Failed: ${error.message}`, 'error');
        }
      });
    });

    // Day toggles
    document.querySelectorAll('.day-toggle').forEach(btn => {
      btn.addEventListener('click', () => {
        // Use btn directly (not e.target) for consistency
        const scheduleId = btn.dataset.scheduleId;
        const dayVal = parseInt(btn.dataset.day); // Now numeric
        const sched = this.data.schedules.find(s => s.schedule_id === scheduleId);

        if (sched) {
          // Ensure posting_days is an array (parse if JSON string)
          sched.posting_days = this.parseJsonField(sched.posting_days, []);
          const idx = sched.posting_days.indexOf(dayVal);

          if (idx >= 0) {
            sched.posting_days.splice(idx, 1);
            btn.classList.remove('bg-brandBlue', 'text-white');
            btn.classList.add('bg-slate-800', 'text-gray-400');
          } else {
            sched.posting_days.push(dayVal);
            btn.classList.add('bg-brandBlue', 'text-white');
            btn.classList.remove('bg-slate-800', 'text-gray-400');
          }
        }
      });
    });

    // Time inputs
    document.querySelectorAll('.posting-time').forEach(input => {
      input.addEventListener('change', (e) => {
        const scheduleId = e.target.dataset.scheduleId;
        const idx = parseInt(e.target.dataset.timeIdx);
        const sched = this.data.schedules.find(s => s.schedule_id === scheduleId);

        if (sched) {
          // Ensure posting_times is an array (parse if JSON string)
          sched.posting_times = this.parseJsonField(sched.posting_times, []);
          sched.posting_times[idx] = e.target.value;
        }
      });
    });

    // Max posts per day dropdown
    document.querySelectorAll('.max-posts-day').forEach(select => {
      select.addEventListener('change', (e) => {
        const scheduleId = e.target.dataset.scheduleId;
        const sched = this.data.schedules.find(s => s.schedule_id === scheduleId);
        if (sched) {
          sched.max_posts_per_day = parseInt(e.target.value);
        }
      });
    });

    // Max posts per week dropdown
    document.querySelectorAll('.max-posts-week').forEach(select => {
      select.addEventListener('change', (e) => {
        const scheduleId = e.target.dataset.scheduleId;
        const sched = this.data.schedules.find(s => s.schedule_id === scheduleId);
        if (sched) {
          sched.max_posts_per_week = parseInt(e.target.value);
        }
      });
    });

    // Add time slot button
    document.querySelectorAll('.add-time').forEach(btn => {
      btn.addEventListener('click', () => {
        // Use btn directly (not e.target) to handle clicks on inner icon
        const scheduleId = btn.dataset.scheduleId;
        const sched = this.data.schedules.find(s => s.schedule_id === scheduleId);
        const limits = this.data.limits || {};

        if (sched) {
          sched.posting_times = this.parseJsonField(sched.posting_times, []);

          if (sched.posting_times.length < (limits.max_posting_times_allowed || 5)) {
            // Add a new default time slot (e.g., 12:00)
            sched.posting_times.push('12:00');

            // Re-render the tab
            this.renderScheduleTab(document.getElementById('tab-panels'));
            lucide.createIcons();
          }
        }
      });
    });

    // Remove time slot button
    document.querySelectorAll('.remove-time').forEach(btn => {
      btn.addEventListener('click', () => {
        // Use btn directly (not e.target) to handle clicks on inner icon
        const scheduleId = btn.dataset.scheduleId;
        const idx = parseInt(btn.dataset.timeIdx);
        const sched = this.data.schedules.find(s => s.schedule_id === scheduleId);

        if (sched) {
          sched.posting_times = this.parseJsonField(sched.posting_times, []);

          if (sched.posting_times.length > 1) {
            sched.posting_times.splice(idx, 1);

            // Re-render the tab
            this.renderScheduleTab(document.getElementById('tab-panels'));
            lucide.createIcons();
          } else {
            UI.toast(this.t('settings.atLeastOneSlot', 'At least one time slot is required'), 'error');
          }
        }
      });
    });

    // Tooltip toggles
    document.querySelectorAll('.tooltip-trigger').forEach(trigger => {
      trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        // Use trigger directly (not e.target) to handle clicks on inner icon
        const tooltipId = `tooltip-${trigger.dataset.tooltip}`;
        const tooltip = document.getElementById(tooltipId);

        if (tooltip) {
          // Hide all other tooltips
          document.querySelectorAll('[id^="tooltip-"]').forEach(t => {
            if (t.id !== tooltipId) t.classList.add('hidden');
          });

          // Toggle this tooltip
          tooltip.classList.toggle('hidden');

          // Position tooltip near the trigger
          if (!tooltip.classList.contains('hidden')) {
            const rect = trigger.getBoundingClientRect();
            tooltip.style.top = `${rect.bottom + 8}px`;
            tooltip.style.left = `${Math.max(10, rect.left - 100)}px`;
          }
        }
      });
    });

    // Close tooltips when clicking elsewhere
    document.addEventListener('click', () => {
      document.querySelectorAll('[id^="tooltip-"]').forEach(t => t.classList.add('hidden'));
    });

    // Save button
    document.getElementById('save-schedule-btn')?.addEventListener('click', async () => {
      try {
        // Save timezone
        const timezone = document.getElementById('settings-timezone').value;

        await API.request('/api/portal/settings', {
          method: 'PUT',
          body: JSON.stringify({ timezone })
        });

        this.data.settings.timezone = timezone;

        // Save each modified schedule
        for (const sched of this.data.schedules) {
          // Ensure arrays are properly parsed before sending
          const postingDays = this.parseJsonField(sched.posting_days, []);
          const postingTimes = this.parseJsonField(sched.posting_times, []);

          await API.request(`/api/portal/schedules/${sched.schedule_id}`, {
            method: 'PUT',
            body: JSON.stringify({
              posting_days: postingDays,
              posting_times: postingTimes,
              max_posts_per_day: sched.max_posts_per_day || 1,
              max_posts_per_week: sched.max_posts_per_week || 7
            })
          });

          // Update local data with parsed arrays
          sched.posting_days = postingDays;
          sched.posting_times = postingTimes;
        }

        UI.toast(this.t('settings.scheduleSaved', 'Schedule settings saved!'), 'success');

        // Re-render the tab to reflect saved changes
        this.renderScheduleTab(document.getElementById('tab-panels'));
        lucide.createIcons();
      } catch (error) {
        UI.toast(`${this.t('error.saveFailed', 'Failed to save:')} ${error.message}`, 'error');
      }
    });
  },

  // ==========================================
  // APPROVAL TAB
  // ==========================================

  renderApprovalTab(panel) {
    const t = this.t.bind(this);
    const settings = this.data.settings || {};
    const postApproval = settings.post_approval || { mode: settings.approval_mode || 'auto' };
    const msgApproval = settings.message_approval || { mode: 'manual' };
    const pendingCount = settings.pending_count || { posts: 0, messages: 0, total: 0 };

    const postMode = postApproval.mode || 'auto';
    const msgMode = msgApproval.mode || 'manual';
    const postNeedsEmail = postMode === 'email' || postMode === 'email_ai_only';
    const msgNeedsEmail = msgMode === 'manual' || msgMode === 'ai_only';

    const channels = [
      { key: 'instagram_comments', label: 'Instagram Comments', icon: 'instagram', hint: t('settings.fasterForPublic', 'Faster for public comments') },
      { key: 'instagram_dm', label: 'Instagram DM', icon: 'instagram', hint: t('settings.privateReviewRecommended', 'Private conversations - review recommended') },
      { key: 'whatsapp', label: 'WhatsApp', icon: 'message-circle', hint: t('settings.instantRepliesExpected', 'Users expect instant replies') }
    ];

    panel.innerHTML = `
      <div class="space-y-6">

        ${pendingCount.total > 0 ? `
        <!-- Pending Items Banner -->
        <div class="bg-amber-900/30 border border-amber-700/50 rounded-xl p-4 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <i data-lucide="alert-circle" class="w-5 h-5 text-amber-400"></i>
            <span class="text-amber-200 text-sm font-medium">
              ${t('settings.pendingItems', 'You have {count} items waiting for approval').replace('{count}', pendingCount.total)}
            </span>
          </div>
          <a href="#/approvals" class="text-sm text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1">
            ${t('settings.goToApprovalCenter', 'Go to Approval Center')}
            <i data-lucide="arrow-right" class="w-4 h-4"></i>
          </a>
        </div>
        ` : ''}

        <!-- Social Posts Approval -->
        <div class="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
          <h3 class="text-lg font-semibold mb-2 flex items-center gap-2">
            <i data-lucide="share-2" class="w-5 h-5 text-brandBlue"></i>
            ${t('settings.socialPostsApproval', 'Social Posts')}
          </h3>
          <p class="text-sm text-gray-400 mb-4">
            ${t('settings.socialPostsApprovalDesc', 'Choose how social media posts are approved before publishing.')}
          </p>

          <div class="grid gap-3">
            <label class="flex items-start gap-4 p-4 bg-slate-900/50 rounded-lg border ${postMode === 'auto' ? 'border-brandBlue' : 'border-slate-700'} cursor-pointer hover:border-slate-500">
              <input type="radio" name="approval_mode" value="auto" ${postMode === 'auto' ? 'checked' : ''}
                class="mt-1 w-5 h-5 text-brandBlue bg-slate-900 border-slate-600 focus:ring-brandBlue">
              <div>
                <span class="font-medium text-green-400">${t('settings.autoApprove', 'Auto-Approve')}</span>
                <p class="text-sm text-gray-400 mt-1">
                  ${t('settings.autoApproveDesc', 'Posts are automatically approved and scheduled for publishing. No manual review required.')}
                </p>
              </div>
            </label>

            <label class="flex items-start gap-4 p-4 bg-slate-900/50 rounded-lg border ${postMode === 'email' ? 'border-brandBlue' : 'border-slate-700'} cursor-pointer hover:border-slate-500">
              <input type="radio" name="approval_mode" value="email" ${postMode === 'email' ? 'checked' : ''}
                class="mt-1 w-5 h-5 text-brandBlue bg-slate-900 border-slate-600 focus:ring-brandBlue">
              <div>
                <span class="font-medium text-blue-400">${t('settings.emailApproval', 'Email Approval (All Posts)')}</span>
                <p class="text-sm text-gray-400 mt-1">
                  ${t('settings.emailApprovalDesc', 'Receive an email with approve/reject links for each post. Approve directly from your inbox.')}
                </p>
              </div>
            </label>

            <label class="flex items-start gap-4 p-4 bg-slate-900/50 rounded-lg border ${postMode === 'email_ai_only' ? 'border-brandBlue' : 'border-slate-700'} cursor-pointer hover:border-slate-500">
              <input type="radio" name="approval_mode" value="email_ai_only" ${postMode === 'email_ai_only' ? 'checked' : ''}
                class="mt-1 w-5 h-5 text-brandBlue bg-slate-900 border-slate-600 focus:ring-brandBlue">
              <div>
                <span class="font-medium text-yellow-400">${t('settings.emailAiOnly', 'Email Approval (AI-Generated Only)')}</span>
                <p class="text-sm text-gray-400 mt-1">
                  ${t('settings.emailAiOnlyDesc', 'Only AI-generated posts require email approval. Manually created posts are auto-approved.')}
                </p>
              </div>
            </label>
          </div>

          <!-- Post email field (conditional) -->
          <div id="post-email-field" class="${postNeedsEmail ? '' : 'hidden'} mt-4 pl-9">
            <label class="block text-sm text-gray-400 mb-1">${t('settings.sendApprovalTo', 'Send approval requests to')}</label>
            <input type="email" id="post-approval-email" value="${postApproval.approval_email || ''}"
              placeholder="you@example.com"
              class="w-full max-w-md px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg focus:ring-2 focus:ring-brandBlue text-sm">
            <p class="text-xs text-gray-500 mt-1">${t('settings.emailHint', 'Must be a valid email you check regularly')}</p>
          </div>
        </div>

        <!-- Messages & Replies Approval -->
        <div class="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
          <h3 class="text-lg font-semibold mb-2 flex items-center gap-2">
            <i data-lucide="message-square" class="w-5 h-5 text-brandBlue"></i>
            ${t('settings.messagesApproval', 'Messages & Replies')}
          </h3>
          <p class="text-sm text-gray-400 mb-4">
            ${t('settings.messagesApprovalDesc', 'Choose how AI-drafted messages and replies are handled before sending.')}
          </p>

          <div class="grid gap-3">
            <label class="flex items-start gap-4 p-4 bg-slate-900/50 rounded-lg border ${msgMode === 'manual' ? 'border-brandBlue' : 'border-slate-700'} cursor-pointer hover:border-slate-500">
              <input type="radio" name="message_approval_mode" value="manual" ${msgMode === 'manual' ? 'checked' : ''}
                class="mt-1 w-5 h-5 text-brandBlue bg-slate-900 border-slate-600 focus:ring-brandBlue">
              <div>
                <span class="font-medium text-blue-400">${t('settings.msgManual', 'Manual Review')}</span>
                <p class="text-sm text-gray-400 mt-1">
                  ${t('settings.msgManualDesc', 'All messages require your approval before being sent. Review each response in the Approval Center.')}
                </p>
              </div>
            </label>

            <label class="flex items-start gap-4 p-4 bg-slate-900/50 rounded-lg border ${msgMode === 'ai_only' ? 'border-brandBlue' : 'border-slate-700'} cursor-pointer hover:border-slate-500">
              <input type="radio" name="message_approval_mode" value="ai_only" ${msgMode === 'ai_only' ? 'checked' : ''}
                class="mt-1 w-5 h-5 text-brandBlue bg-slate-900 border-slate-600 focus:ring-brandBlue">
              <div>
                <span class="font-medium text-yellow-400">${t('settings.msgAiOnly', 'Review AI-Generated Only')}</span>
                <p class="text-sm text-gray-400 mt-1">
                  ${t('settings.msgAiOnlyDesc', 'Only AI-generated responses need approval. Template-based replies are sent automatically.')}
                </p>
              </div>
            </label>

            <label class="flex items-start gap-4 p-4 bg-slate-900/50 rounded-lg border ${msgMode === 'auto' ? 'border-brandBlue' : 'border-slate-700'} cursor-pointer hover:border-slate-500">
              <input type="radio" name="message_approval_mode" value="auto" ${msgMode === 'auto' ? 'checked' : ''}
                class="mt-1 w-5 h-5 text-brandBlue bg-slate-900 border-slate-600 focus:ring-brandBlue">
              <div>
                <span class="font-medium text-green-400">${t('settings.msgAuto', 'Auto-Send')}</span>
                <p class="text-sm text-gray-400 mt-1">
                  ${t('settings.msgAutoDesc', 'All messages are sent automatically without manual review. Use with caution.')}
                </p>
              </div>
            </label>
          </div>

          <!-- Message email field (conditional) -->
          <div id="msg-email-field" class="${msgNeedsEmail ? '' : 'hidden'} mt-4 pl-9">
            <label class="block text-sm text-gray-400 mb-1">${t('settings.sendApprovalTo', 'Send approval requests to')}</label>
            <input type="email" id="msg-approval-email" value="${msgApproval.approval_email || ''}"
              placeholder="you@example.com"
              class="w-full max-w-md px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg focus:ring-2 focus:ring-brandBlue text-sm">
            <p class="text-xs text-gray-500 mt-1">${t('settings.emailHint', 'Must be a valid email you check regularly')}</p>
          </div>

          <!-- Advanced: Per-Channel Settings -->
          <details class="mt-4">
            <summary class="cursor-pointer text-sm text-gray-400 hover:text-gray-300 flex items-center gap-2 select-none">
              <i data-lucide="settings-2" class="w-4 h-4"></i>
              ${t('settings.advancedPerChannel', 'Advanced: Per-Channel Settings')}
            </summary>
            <div class="mt-3 space-y-3 pl-6">
              ${channels.map(ch => {
                const chMode = msgApproval.channels?.[ch.key] || '';
                return `
                <div class="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-slate-700">
                  <div class="flex items-center gap-3">
                    <i data-lucide="${ch.icon}" class="w-4 h-4 text-gray-400"></i>
                    <div>
                      <span class="text-sm font-medium">${ch.label}</span>
                      <p class="text-xs text-gray-500">${ch.hint}</p>
                    </div>
                  </div>
                  <select name="channel_${ch.key}" class="px-3 py-1.5 bg-slate-800 border border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-brandBlue">
                    <option value="" ${!chMode ? 'selected' : ''}>${t('settings.useDefault', 'Use Default')}</option>
                    <option value="manual" ${chMode === 'manual' ? 'selected' : ''}>${t('settings.msgManual', 'Manual Review')}</option>
                    <option value="ai_only" ${chMode === 'ai_only' ? 'selected' : ''}>${t('settings.msgAiOnly', 'Review AI-Generated Only')}</option>
                    <option value="auto" ${chMode === 'auto' ? 'selected' : ''}>${t('settings.msgAuto', 'Auto-Send')}</option>
                  </select>
                </div>`;
              }).join('')}
            </div>
          </details>
        </div>

        <!-- Timeout Settings -->
        <div class="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
          <h3 class="text-lg font-semibold mb-2 flex items-center gap-2">
            <i data-lucide="clock" class="w-5 h-5 text-brandBlue"></i>
            ${t('settings.timeoutSettings', 'Timeout Settings')}
          </h3>

          <!-- Post timeout -->
          <div class="mb-5">
            <p class="text-sm text-gray-300 font-medium mb-2">${t('settings.socialPostsApproval', 'Social Posts')}</p>
            <div class="flex items-center gap-3 flex-wrap">
              <span class="text-sm text-gray-400">${t('settings.ifNotApprovedWithin', 'If not approved within')}</span>
              <input type="number" id="post-timeout-hours" value="${postApproval.timeout_hours || 24}" min="1" max="168"
                class="w-20 px-3 py-1.5 bg-slate-900 border border-slate-600 rounded-lg text-sm text-center focus:ring-2 focus:ring-brandBlue">
              <span class="text-sm text-gray-400">${t('settings.hours', 'hours')}</span>
              <span class="text-sm text-gray-400">${t('settings.then', 'Then')}</span>
              <select id="post-timeout-fallback" class="px-3 py-1.5 bg-slate-900 border border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-brandBlue">
                <option value="discard" ${(postApproval.fallback_on_timeout || 'discard') === 'discard' ? 'selected' : ''}>${t('settings.discard', 'Discard')} (${t('settings.discardDesc', 'safer but may miss opportunities')})</option>
                <option value="send" ${postApproval.fallback_on_timeout === 'send' ? 'selected' : ''}>${t('settings.sendAnyway', 'Send anyway')} (${t('settings.sendAnywayDesc', 'recommended for timely responses')})</option>
                <option value="notify" ${postApproval.fallback_on_timeout === 'notify' ? 'selected' : ''}>${t('settings.notifyMe', 'Notify me to handle manually')}</option>
              </select>
            </div>
          </div>

          <!-- Message timeout -->
          <div>
            <p class="text-sm text-gray-300 font-medium mb-2">${t('settings.messagesApproval', 'Messages & Replies')}</p>
            <div class="flex items-center gap-3 flex-wrap">
              <span class="text-sm text-gray-400">${t('settings.ifNotApprovedWithin', 'If not approved within')}</span>
              <input type="number" id="msg-timeout-hours" value="${msgApproval.timeout_hours || 24}" min="1" max="168"
                class="w-20 px-3 py-1.5 bg-slate-900 border border-slate-600 rounded-lg text-sm text-center focus:ring-2 focus:ring-brandBlue">
              <span class="text-sm text-gray-400">${t('settings.hours', 'hours')}</span>
              <span class="text-sm text-gray-400">${t('settings.then', 'Then')}</span>
              <select id="msg-timeout-fallback" class="px-3 py-1.5 bg-slate-900 border border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-brandBlue">
                <option value="send" ${(msgApproval.fallback_on_timeout || 'send') === 'send' ? 'selected' : ''}>${t('settings.sendAnyway', 'Send anyway')} (${t('settings.sendAnywayDesc', 'recommended for timely responses')})</option>
                <option value="discard" ${msgApproval.fallback_on_timeout === 'discard' ? 'selected' : ''}>${t('settings.discard', 'Discard')} (${t('settings.discardDesc', 'safer but may miss opportunities')})</option>
                <option value="notify" ${msgApproval.fallback_on_timeout === 'notify' ? 'selected' : ''}>${t('settings.notifyMe', 'Notify me to handle manually')}</option>
              </select>
            </div>
            <p class="text-xs text-gray-500 mt-2 flex items-start gap-1">
              <i data-lucide="info" class="w-3 h-3 mt-0.5 shrink-0"></i>
              ${t('settings.timeoutTip', 'For messages, fast response times build trust with leads. We recommend "Send anyway" to avoid missed opportunities.')}
            </p>
          </div>
        </div>

        <!-- Save Button -->
        <div class="flex justify-end">
          <button id="save-approval-btn" class="px-6 py-3 bg-brandBlue hover:bg-sky-600 rounded-lg font-medium transition-colors flex items-center gap-2">
            <i data-lucide="save" class="w-4 h-4"></i>
            ${t('settings.saveChanges', 'Save Changes')}
          </button>
        </div>
      </div>
    `;

    this.bindApprovalEvents();
  },

  bindApprovalEvents() {
    // Helper to bind radio styling for a given group name
    const bindRadioGroup = (name) => {
      document.querySelectorAll(`input[name="${name}"]`).forEach(radio => {
        radio.addEventListener('change', () => {
          document.querySelectorAll(`input[name="${name}"]`).forEach(r => {
            const label = r.closest('label');
            if (r.checked) {
              label.classList.add('border-brandBlue');
              label.classList.remove('border-slate-700');
            } else {
              label.classList.remove('border-brandBlue');
              label.classList.add('border-slate-700');
            }
          });
        });
      });
    };

    bindRadioGroup('approval_mode');
    bindRadioGroup('message_approval_mode');

    // Show/hide email fields based on mode selection
    const postEmailField = document.getElementById('post-email-field');
    document.querySelectorAll('input[name="approval_mode"]').forEach(radio => {
      radio.addEventListener('change', () => {
        const mode = document.querySelector('input[name="approval_mode"]:checked')?.value;
        const needsEmail = mode === 'email' || mode === 'email_ai_only';
        postEmailField?.classList.toggle('hidden', !needsEmail);
      });
    });

    const msgEmailField = document.getElementById('msg-email-field');
    document.querySelectorAll('input[name="message_approval_mode"]').forEach(radio => {
      radio.addEventListener('change', () => {
        const mode = document.querySelector('input[name="message_approval_mode"]:checked')?.value;
        const needsEmail = mode === 'manual' || mode === 'ai_only';
        msgEmailField?.classList.toggle('hidden', !needsEmail);
      });
    });

    // Save button
    const saveBtn = document.getElementById('save-approval-btn');
    saveBtn?.addEventListener('click', async () => {
      const postMode = document.querySelector('input[name="approval_mode"]:checked')?.value;
      const msgMode = document.querySelector('input[name="message_approval_mode"]:checked')?.value;

      if (!postMode || !msgMode) {
        UI.toast(this.t('settings.selectMode', 'Please select an approval mode'), 'error');
        return;
      }

      // Validate email fields when email-based modes are selected
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const postNeedsEmail = postMode === 'email' || postMode === 'email_ai_only';
      const postEmail = document.getElementById('post-approval-email')?.value?.trim() || '';
      if (postNeedsEmail && !postEmail) {
        UI.toast(this.t('settings.emailRequired', 'Email is required when using email approval'), 'error');
        document.getElementById('post-approval-email')?.focus();
        return;
      }
      if (postNeedsEmail && postEmail && !emailRegex.test(postEmail)) {
        UI.toast(this.t('settings.emailInvalid', 'Please enter a valid email address'), 'error');
        document.getElementById('post-approval-email')?.focus();
        return;
      }

      const msgNeedsEmail = msgMode === 'manual' || msgMode === 'ai_only';
      const msgEmail = document.getElementById('msg-approval-email')?.value?.trim() || '';
      if (msgNeedsEmail && !msgEmail) {
        UI.toast(this.t('settings.emailRequired', 'Email is required when using email approval'), 'error');
        document.getElementById('msg-approval-email')?.focus();
        return;
      }
      if (msgNeedsEmail && msgEmail && !emailRegex.test(msgEmail)) {
        UI.toast(this.t('settings.emailInvalid', 'Please enter a valid email address'), 'error');
        document.getElementById('msg-approval-email')?.focus();
        return;
      }

      // Collect per-channel settings
      const channels = {};
      ['instagram_comments', 'instagram_dm', 'whatsapp'].forEach(key => {
        const val = document.querySelector(`select[name="channel_${key}"]`)?.value;
        if (val) channels[key] = val;
      });

      // Show loading state
      const originalContent = saveBtn.innerHTML;
      saveBtn.disabled = true;
      saveBtn.innerHTML = '<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i> Saving...';
      lucide.createIcons({ nodes: [saveBtn] });

      try {
        const result = await API.request('/api/portal/settings', {
          method: 'PUT',
          body: JSON.stringify({
            social_posts: {
              mode: postMode,
              approval_email: postNeedsEmail ? postEmail : null,
              timeout_hours: parseInt(document.getElementById('post-timeout-hours')?.value) || 24,
              fallback_on_timeout: document.getElementById('post-timeout-fallback')?.value || 'discard'
            },
            messages: {
              mode: msgMode,
              approval_email: msgNeedsEmail ? msgEmail : null,
              timeout_hours: parseInt(document.getElementById('msg-timeout-hours')?.value) || 24,
              fallback_on_timeout: document.getElementById('msg-timeout-fallback')?.value || 'send',
              channels: Object.keys(channels).length > 0 ? channels : {}
            }
          })
        });

        // Update local data with response
        if (result.settings) {
          Object.assign(this.data.settings, result.settings);
        }
        UI.toast(this.t('settings.approvalSaved', 'Approval settings saved!'), 'success');
      } catch (err) {
        UI.toast(`${this.t('error.saveFailed', 'Failed to save:')} ${err.message}`, 'error');
      } finally {
        saveBtn.disabled = false;
        saveBtn.innerHTML = originalContent;
        lucide.createIcons({ nodes: [saveBtn] });
      }
    });
  },

  // ==========================================
  // HASHTAGS TAB
  // ==========================================

  renderHashtagsTab(panel) {
    const t = this.t.bind(this);
    const hashtags = this.data.hashtags || [];

    panel.innerHTML = `
      <div class="space-y-6">
        <!-- Add New -->
        <div class="flex justify-end">
          <button id="add-hashtag-btn" class="px-4 py-2 bg-brandBlue hover:bg-sky-600 rounded-lg font-medium flex items-center gap-2">
            <i data-lucide="plus" class="w-4 h-4"></i>
            ${t('settings.addHashtagPack', 'Add Hashtag Pack')}
          </button>
        </div>

        <!-- Hashtag List -->
        <div id="hashtag-list" class="space-y-4">
          ${hashtags.length > 0 ? hashtags.map(h => this.renderHashtagCard(h)).join('') : `
            <div class="bg-slate-800/50 rounded-xl p-8 border border-slate-700 text-center">
              <i data-lucide="hash" class="w-12 h-12 mx-auto text-gray-500 mb-3"></i>
              <p class="text-gray-400">${t('settings.noHashtags', 'No hashtag packs yet')}</p>
              <p class="text-sm text-gray-500 mt-1">${t('settings.hashtagsHelp', 'Create a hashtag pack to organize hashtags for your posts')}</p>
            </div>
          `}
        </div>

        <!-- Hashtag Modal -->
        <div id="hashtag-modal" class="hidden fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div class="bg-slate-800 rounded-xl w-full max-w-lg border border-slate-600">
            <div class="p-4 border-b border-slate-700 flex items-center justify-between">
              <h3 id="hashtag-modal-title" class="text-lg font-semibold">${t('settings.addHashtagPack', 'Add Hashtag Pack')}</h3>
              <button id="close-hashtag-modal" class="p-2 hover:bg-slate-700 rounded-lg">
                <i data-lucide="x" class="w-5 h-5"></i>
              </button>
            </div>
            <form id="hashtag-form" class="p-4 space-y-4">
              <input type="hidden" id="hashtag-pack-id">
              <div>
                <label class="block text-sm text-gray-400 mb-2">${t('settings.packLabel', 'Pack Label')}</label>
                <input type="text" id="hashtag-label" required
                  placeholder="${t('settings.packLabelPlaceholder', 'e.g., Brand Awareness')}"
                  class="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg focus:ring-2 focus:ring-brandBlue">
              </div>
              <div>
                <label class="block text-sm text-gray-400 mb-2">${t('settings.hashtagsList', 'Hashtags (one per line, include #)')}</label>
                <textarea id="hashtag-tags" rows="6" required
                  placeholder="#brand&#10;#marketing&#10;#socialmedia"
                  class="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg focus:ring-2 focus:ring-brandBlue font-mono text-sm"></textarea>
              </div>
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" id="hashtag-active" checked
                  class="w-5 h-5 rounded bg-slate-900 border-slate-600 text-brandBlue focus:ring-brandBlue">
                <span class="text-sm">${t('settings.hashtagActive', 'Active (include in post generation)')}</span>
              </label>
              <div class="flex justify-end gap-3 pt-2">
                <button type="button" id="cancel-hashtag" class="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg">
                  ${t('settings.cancel', 'Cancel')}
                </button>
                <button type="submit" class="px-4 py-2 bg-brandBlue hover:bg-sky-600 rounded-lg font-medium">
                  ${t('settings.save', 'Save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;

    this.bindHashtagEvents();
  },

  renderHashtagCard(hashtag) {
    // DB columns: pack_id, pack_key, label, category, platform, locale, hashtags, is_active
    return `
      <div class="bg-slate-800/50 rounded-xl p-4 border border-slate-700" data-pack-id="${hashtag.pack_id}">
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center gap-2">
              <h4 class="font-medium">${hashtag.label}</h4>
              ${hashtag.category ? `<span class="text-xs px-2 py-0.5 bg-slate-700 text-gray-300 rounded">${hashtag.category}</span>` : ''}
              ${!hashtag.is_active ? '<span class="text-xs px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded">Inactive</span>' : ''}
            </div>
            <div class="mt-2 flex flex-wrap gap-1">
              ${(hashtag.hashtags || []).slice(0, 5).map(tag => `
                <span class="text-xs px-2 py-1 bg-slate-700 rounded">${tag}</span>
              `).join('')}
              ${(hashtag.hashtags || []).length > 5 ? `<span class="text-xs text-gray-400">+${hashtag.hashtags.length - 5} more</span>` : ''}
            </div>
          </div>
          <div class="flex items-center gap-1">
            <button class="edit-hashtag p-2 hover:bg-slate-700 rounded-lg" data-pack-id="${hashtag.pack_id}">
              <i data-lucide="edit" class="w-4 h-4"></i>
            </button>
            <button class="delete-hashtag p-2 hover:bg-slate-700 rounded-lg text-red-400" data-pack-id="${hashtag.pack_id}">
              <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  },

  bindHashtagEvents() {
    const modal = document.getElementById('hashtag-modal');
    const form = document.getElementById('hashtag-form');

    // Open modal - add new
    document.getElementById('add-hashtag-btn')?.addEventListener('click', () => {
      document.getElementById('hashtag-modal-title').textContent = this.t('settings.addHashtagPack', 'Add Hashtag Pack');
      document.getElementById('hashtag-pack-id').value = '';
      document.getElementById('hashtag-label').value = '';
      document.getElementById('hashtag-tags').value = '';
      document.getElementById('hashtag-active').checked = true;
      modal.classList.remove('hidden');
      lucide.createIcons();
    });

    // Edit hashtag
    document.querySelectorAll('.edit-hashtag').forEach(btn => {
      btn.addEventListener('click', () => {
        const packId = btn.dataset.packId;
        const hashtag = this.data.hashtags.find(h => h.pack_id === packId);
        if (!hashtag) return;

        document.getElementById('hashtag-modal-title').textContent = this.t('settings.editHashtagPack', 'Edit Hashtag Pack');
        document.getElementById('hashtag-pack-id').value = packId;
        document.getElementById('hashtag-label').value = hashtag.label || '';
        document.getElementById('hashtag-tags').value = (hashtag.hashtags || []).join('\n');
        document.getElementById('hashtag-active').checked = hashtag.is_active !== false;
        modal.classList.remove('hidden');
        lucide.createIcons();
      });
    });

    // Delete hashtag
    document.querySelectorAll('.delete-hashtag').forEach(btn => {
      btn.addEventListener('click', async () => {
        const packId = btn.dataset.packId;
        if (!confirm(this.t('settings.deleteHashtag', 'Delete this hashtag pack?'))) return;

        try {
          await API.request(`/api/portal/hashtags/${packId}`, { method: 'DELETE' });
          this.data.hashtags = this.data.hashtags.filter(h => h.pack_id !== packId);
          UI.toast(this.t('settings.hashtagDeleted', 'Hashtag pack deleted'), 'success');
          this.renderHashtagsTab(document.getElementById('tab-panels'));
          lucide.createIcons();
        } catch (error) {
          UI.toast(`Failed to delete: ${error.message}`, 'error');
        }
      });
    });

    // Close modal
    document.getElementById('close-hashtag-modal')?.addEventListener('click', () => modal.classList.add('hidden'));
    document.getElementById('cancel-hashtag')?.addEventListener('click', () => modal.classList.add('hidden'));

    // Save form
    form?.addEventListener('submit', async (e) => {
      e.preventDefault();

      const packId = document.getElementById('hashtag-pack-id').value;
      const label = document.getElementById('hashtag-label').value.trim();
      const hashtags = document.getElementById('hashtag-tags').value
        .split('\n')
        .map(t => t.trim())
        .filter(t => t && t.startsWith('#'));
      const is_active = document.getElementById('hashtag-active').checked;

      if (hashtags.length === 0) {
        UI.toast(this.t('settings.addHashtagError', 'Please add at least one hashtag starting with #'), 'error');
        return;
      }

      try {
        if (packId) {
          // Update
          const result = await API.request(`/api/portal/hashtags/${packId}`, {
            method: 'PUT',
            body: JSON.stringify({ label, hashtags, is_active })
          });

          const idx = this.data.hashtags.findIndex(h => h.pack_id === packId);
          if (idx >= 0) this.data.hashtags[idx] = result.hashtag;
          UI.toast(this.t('settings.hashtagUpdated', 'Hashtag pack updated'), 'success');
        } else {
          // Create
          const result = await API.request('/api/portal/hashtags', {
            method: 'POST',
            body: JSON.stringify({ label, hashtags, is_active })
          });

          this.data.hashtags.push(result.hashtag);
          UI.toast(this.t('settings.hashtagCreated', 'Hashtag pack created'), 'success');
        }

        modal.classList.add('hidden');
        this.renderHashtagsTab(document.getElementById('tab-panels'));
        lucide.createIcons();
      } catch (error) {
        UI.toast(`Failed to save: ${error.message}`, 'error');
      }
    });
  },

  // ==========================================
  // THEMES TAB
  // ==========================================

  renderThemesTab(panel) {
    const t = this.t.bind(this);
    const themes = this.data.themes || [];

    panel.innerHTML = `
      <div class="space-y-6">
        <div class="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
          <h3 class="text-lg font-semibold mb-2 flex items-center gap-2">
            <i data-lucide="sparkles" class="w-5 h-5 text-brandBlue"></i>
            ${t('settings.contentThemes', 'Content Themes')}
          </h3>
          <p class="text-sm text-gray-400 mb-4">${t('settings.themesHelp', 'Enable or disable themes for your content generation. Active themes will be used when creating posts.')}</p>

          ${themes.length > 0 ? `
            <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4" id="themes-grid">
              ${themes.map(theme => this.renderThemeCard(theme)).join('')}
            </div>
          ` : `
            <div class="text-center py-8">
              <i data-lucide="sparkles" class="w-12 h-12 mx-auto text-gray-500 mb-3"></i>
              <p class="text-gray-400">${t('settings.noThemes', 'No themes configured')}</p>
              <p class="text-sm text-gray-500 mt-1">${t('settings.themesContactAdmin', 'Contact your admin to set up content themes')}</p>
            </div>
          `}
        </div>

        ${themes.length > 0 ? `
          <div class="flex justify-end gap-3">
            <button id="enable-all-themes" class="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm">
              ${t('settings.enableAll', 'Enable All')}
            </button>
            <button id="disable-all-themes" class="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm">
              ${t('settings.disableAll', 'Disable All')}
            </button>
          </div>
        ` : ''}
      </div>
    `;

    this.bindThemeEvents();
  },

  renderThemeCard(theme) {
    // DB columns: theme_id, theme_key, label, category, is_active, priority
    const categoryColors = {
      'pain_point': { bg: '#ef444420', text: '#ef4444', icon: 'alert-triangle' },
      'success_story': { bg: '#22c55e20', text: '#22c55e', icon: 'trophy' },
      'educational': { bg: '#3b82f620', text: '#3b82f6', icon: 'book-open' },
      'behind_scenes': { bg: '#f59e0b20', text: '#f59e0b', icon: 'eye' },
      'trending': { bg: '#8b5cf620', text: '#8b5cf6', icon: 'trending-up' },
      'promotional': { bg: '#ec489920', text: '#ec4899', icon: 'megaphone' }
    };
    const cat = categoryColors[theme.category] || { bg: '#64748b20', text: '#64748b', icon: 'tag' };

    return `
      <div class="p-4 bg-slate-900/50 rounded-lg border ${theme.is_active ? 'border-brandBlue' : 'border-slate-700'}"
        data-theme-id="${theme.theme_id}">
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg flex items-center justify-center" style="background: ${cat.bg}">
              <i data-lucide="${cat.icon}" class="w-5 h-5" style="color: ${cat.text}"></i>
            </div>
            <div>
              <p class="font-medium">${theme.label}</p>
              ${theme.category ? `<p class="text-xs text-gray-400 mt-0.5 capitalize">${theme.category.replace('_', ' ')}</p>` : ''}
            </div>
          </div>
          <label class="cursor-pointer">
            <input type="checkbox" class="theme-toggle w-5 h-5 rounded bg-slate-900 border-slate-600 text-brandBlue focus:ring-brandBlue"
              data-theme-id="${theme.theme_id}" ${theme.is_active ? 'checked' : ''}>
          </label>
        </div>
      </div>
    `;
  },

  bindThemeEvents() {
    // Individual toggles
    document.querySelectorAll('.theme-toggle').forEach(toggle => {
      toggle.addEventListener('change', async (e) => {
        const themeId = e.target.dataset.themeId;
        const isActive = e.target.checked;
        const card = e.target.closest('[data-theme-id]');

        try {
          await API.request(`/api/portal/themes/${themeId}`, {
            method: 'PUT',
            body: JSON.stringify({ is_active: isActive })
          });

          // Update local data
          const theme = this.data.themes.find(t => t.theme_id === themeId);
          if (theme) theme.is_active = isActive;

          // Update card style
          if (isActive) {
            card.classList.remove('border-slate-700');
            card.classList.add('border-brandBlue');
          } else {
            card.classList.add('border-slate-700');
            card.classList.remove('border-brandBlue');
          }

          UI.toast(isActive ? this.t('settings.themeEnabled', 'Theme enabled') : this.t('settings.themeDisabled', 'Theme disabled'), 'success');
        } catch (error) {
          e.target.checked = !isActive; // Revert
          UI.toast(`Failed: ${error.message}`, 'error');
        }
      });
    });

    // Enable all
    document.getElementById('enable-all-themes')?.addEventListener('click', async () => {
      try {
        const updates = this.data.themes.map(t => ({ theme_id: t.theme_id, is_active: true }));
        await API.request('/api/portal/themes/bulk', {
          method: 'PATCH',
          body: JSON.stringify({ updates })
        });

        this.data.themes.forEach(th => th.is_active = true);
        UI.toast(this.t('settings.allThemesEnabled', 'All themes enabled'), 'success');
        this.renderThemesTab(document.getElementById('tab-panels'));
        lucide.createIcons();
      } catch (error) {
        UI.toast(`Failed: ${error.message}`, 'error');
      }
    });

    // Disable all
    document.getElementById('disable-all-themes')?.addEventListener('click', async () => {
      try {
        const updates = this.data.themes.map(t => ({ theme_id: t.theme_id, is_active: false }));
        await API.request('/api/portal/themes/bulk', {
          method: 'PATCH',
          body: JSON.stringify({ updates })
        });

        this.data.themes.forEach(th => th.is_active = false);
        UI.toast(this.t('settings.allThemesDisabled', 'All themes disabled'), 'success');
        this.renderThemesTab(document.getElementById('tab-panels'));
        lucide.createIcons();
      } catch (error) {
        UI.toast(`Failed: ${error.message}`, 'error');
      }
    });
  }
};
