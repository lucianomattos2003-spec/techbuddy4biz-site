/**
 * Content Calendar Page
 * Visual calendar view of scheduled posts
 */

window.Calendar = {
  currentDate: new Date(),
  posts: [],
  view: 'month', // 'month' or 'week'

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
            <h1 class="text-2xl lg:text-3xl font-bold">${t('calendar.title', 'Content Calendar')}</h1>
            <p class="text-gray-400 mt-1">${t('calendar.subtitle', 'View and manage your posting schedule')}</p>
          </div>
          <div class="flex items-center gap-3">
            <div class="flex items-center bg-slate-800 rounded-lg p-1">
              <button id="view-month" class="px-3 py-1.5 rounded-md text-sm font-medium ${this.view === 'month' ? 'bg-brandBlue' : 'hover:bg-slate-700'}">${t('calendar.month', 'Month')}</button>
              <button id="view-week" class="px-3 py-1.5 rounded-md text-sm font-medium ${this.view === 'week' ? 'bg-brandBlue' : 'hover:bg-slate-700'}">${t('calendar.week', 'Week')}</button>
            </div>
            <a href="#/posts/new" class="px-4 py-2 bg-brandBlue hover:bg-sky-600 rounded-lg transition-colors flex items-center gap-2">
              <i data-lucide="plus" class="w-4 h-4"></i>
              ${t('calendar.newPost', 'New Post')}
            </a>
          </div>
        </div>

        <!-- Calendar Navigation -->
        <div class="flex items-center justify-between bg-slate-800/50 rounded-xl p-4 border border-slate-700">
          <button id="prev-period" class="p-2 hover:bg-slate-700 rounded-lg transition-colors">
            <i data-lucide="chevron-left" class="w-5 h-5"></i>
          </button>
          <div class="flex items-center gap-3">
            <h2 id="calendar-title" class="text-xl font-semibold"></h2>
            <button id="today-btn" class="px-3 py-1 text-sm bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors">${t('calendar.today', 'Today')}</button>
          </div>
          <button id="next-period" class="p-2 hover:bg-slate-700 rounded-lg transition-colors">
            <i data-lucide="chevron-right" class="w-5 h-5"></i>
          </button>
        </div>

        <!-- Legend -->
        <div class="flex flex-wrap items-center gap-4 text-sm">
          <span class="flex items-center gap-2">
            <span class="w-3 h-3 rounded-full bg-green-500"></span> ${t('calendar.posted', 'Posted')}
          </span>
          <span class="flex items-center gap-2">
            <span class="w-3 h-3 rounded-full bg-brandBlue"></span> ${t('calendar.scheduled', 'Scheduled')}
          </span>
          <span class="flex items-center gap-2">
            <span class="w-3 h-3 rounded-full bg-yellow-500"></span> ${t('calendar.pending', 'Pending')}
          </span>
          <span class="flex items-center gap-2">
            <span class="w-3 h-3 rounded-full bg-red-500"></span> ${t('calendar.failed', 'Failed')}
          </span>
        </div>

        <!-- Calendar Grid -->
        <div id="calendar-container" class="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
          <div class="p-8 text-center">
            <div class="loading-spinner mx-auto"></div>
          </div>
        </div>

        <!-- Day Detail Modal -->
        <div id="day-modal" class="hidden fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div class="bg-slate-800 rounded-2xl max-w-lg w-full max-h-[80vh] overflow-hidden border border-slate-700">
            <div class="p-4 border-b border-slate-700 flex items-center justify-between">
              <h3 id="day-modal-title" class="font-semibold"></h3>
              <button id="close-day-modal" class="p-2 hover:bg-slate-700 rounded-lg">
                <i data-lucide="x" class="w-5 h-5"></i>
              </button>
            </div>
            <div id="day-modal-content" class="p-4 overflow-y-auto max-h-96">
            </div>
            <div class="p-4 border-t border-slate-700 bg-slate-900/50">
              <a id="add-post-for-day" href="#/posts/new" class="block text-center py-2 px-4 bg-brandBlue hover:bg-sky-600 rounded-lg transition-colors">
                <i data-lucide="plus" class="w-4 h-4 inline mr-1"></i>
                ${t('calendar.addPostForDay', 'Add Post for This Day')}
              </a>
            </div>
          </div>
        </div>
      </div>
    `;
    
    lucide.createIcons();
    
    // Bind navigation events
    document.getElementById('prev-period').addEventListener('click', () => this.navigate(-1));
    document.getElementById('next-period').addEventListener('click', () => this.navigate(1));
    document.getElementById('today-btn').addEventListener('click', () => {
      this.currentDate = new Date();
      this.loadCalendar();
    });
    
    // View toggle
    document.getElementById('view-month').addEventListener('click', () => {
      this.view = 'month';
      this.updateViewButtons();
      this.loadCalendar();
    });
    document.getElementById('view-week').addEventListener('click', () => {
      this.view = 'week';
      this.updateViewButtons();
      this.loadCalendar();
    });
    
    // Close modal
    document.getElementById('close-day-modal').addEventListener('click', () => this.closeDayModal());
    document.getElementById('day-modal').addEventListener('click', (e) => {
      if (e.target.id === 'day-modal') this.closeDayModal();
    });
    
    // Load data
    await this.loadCalendar();
  },
  
  updateViewButtons() {
    document.getElementById('view-month').classList.toggle('bg-brandBlue', this.view === 'month');
    document.getElementById('view-week').classList.toggle('bg-brandBlue', this.view === 'week');
  },
  
  navigate(direction) {
    if (this.view === 'month') {
      this.currentDate.setMonth(this.currentDate.getMonth() + direction);
    } else {
      this.currentDate.setDate(this.currentDate.getDate() + (direction * 7));
    }
    this.loadCalendar();
  },
  
  getMonthNames() {
    const t = this.t.bind(this);
    return [
      t('calendar.january', 'January'),
      t('calendar.february', 'February'),
      t('calendar.march', 'March'),
      t('calendar.april', 'April'),
      t('calendar.may', 'May'),
      t('calendar.june', 'June'),
      t('calendar.july', 'July'),
      t('calendar.august', 'August'),
      t('calendar.september', 'September'),
      t('calendar.october', 'October'),
      t('calendar.november', 'November'),
      t('calendar.december', 'December')
    ];
  },

  getDayNamesShort() {
    const t = this.t.bind(this);
    return [
      t('calendar.sun', 'Sun'),
      t('calendar.mon', 'Mon'),
      t('calendar.tue', 'Tue'),
      t('calendar.wed', 'Wed'),
      t('calendar.thu', 'Thu'),
      t('calendar.fri', 'Fri'),
      t('calendar.sat', 'Sat')
    ];
  },

  getDayNamesFull() {
    const t = this.t.bind(this);
    return [
      t('calendar.sunday', 'Sunday'),
      t('calendar.monday', 'Monday'),
      t('calendar.tuesday', 'Tuesday'),
      t('calendar.wednesday', 'Wednesday'),
      t('calendar.thursday', 'Thursday'),
      t('calendar.friday', 'Friday'),
      t('calendar.saturday', 'Saturday')
    ];
  },

  async loadCalendar() {
    const t = this.t.bind(this);
    const container = document.getElementById('calendar-container');
    container.innerHTML = `
      <div class="p-8 text-center">
        <div class="loading-spinner mx-auto"></div>
      </div>
    `;

    // Update title
    const title = document.getElementById('calendar-title');
    const monthNames = this.getMonthNames();

    if (this.view === 'month') {
      title.textContent = `${monthNames[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
    } else {
      const weekStart = this.getWeekStart(this.currentDate);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      title.textContent = `${monthNames[weekStart.getMonth()]} ${weekStart.getDate()} - ${weekEnd.getDate()}, ${weekStart.getFullYear()}`;
    }

    try {
      // Get date range for API call
      let startDate, endDate;
      if (this.view === 'month') {
        startDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
        endDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0);
      } else {
        startDate = this.getWeekStart(this.currentDate);
        endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 6);
      }

      // Fetch posts
      const data = await API.listPosts({
        from: startDate.toISOString(),
        to: endDate.toISOString(),
        limit: 200
      });
      this.posts = data?.posts || [];

      // Render calendar
      if (this.view === 'month') {
        this.renderMonthView(startDate, endDate);
      } else {
        this.renderWeekView(startDate);
      }

    } catch (error) {
      container.innerHTML = `
        <div class="p-8 text-center text-red-400">
          <i data-lucide="alert-circle" class="w-12 h-12 mx-auto mb-3"></i>
          <p>${t('calendar.failedLoad', 'Failed to load calendar')}: ${error.message}</p>
          <button onclick="Calendar.loadCalendar()" class="mt-4 text-brandBlue hover:underline">${t('calendar.tryAgain', 'Try again')}</button>
        </div>
      `;
      lucide.createIcons();
    }
  },
  
  getWeekStart(date) {
    const d = new Date(date);
    const day = d.getDay();
    d.setDate(d.getDate() - day);
    return d;
  },
  
  getPostsForDate(dateStr) {
    return this.posts.filter(p => {
      const postDate = p.scheduled_at?.slice(0, 10);
      return postDate === dateStr;
    });
  },
  
  getStatusColor(status) {
    switch (status) {
      case 'posted': return 'bg-green-500';
      case 'scheduled': return 'bg-brandBlue';
      case 'pending': return 'bg-yellow-500';
      case 'failed': return 'bg-red-500';
      case 'cancelled': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  },
  
  renderMonthView(startDate, endDate) {
    const t = this.t.bind(this);
    const container = document.getElementById('calendar-container');
    const today = new Date().toISOString().slice(0, 10);

    // Get first day of month's weekday (0 = Sunday)
    const firstDayOfMonth = new Date(startDate);
    const startWeekday = firstDayOfMonth.getDay();

    // Calculate grid start date (might be previous month)
    const gridStart = new Date(firstDayOfMonth);
    gridStart.setDate(gridStart.getDate() - startWeekday);

    // Generate 6 weeks (42 days) for consistent grid
    const days = [];
    const current = new Date(gridStart);
    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    const dayNames = this.getDayNamesShort();
    const weekendDays = [dayNames[0], dayNames[6]]; // Sun and Sat

    container.innerHTML = `
      <!-- Day headers -->
      <div class="grid grid-cols-7 border-b border-slate-700">
        ${dayNames.map(d => `
          <div class="p-3 text-center text-sm font-medium text-gray-400 ${weekendDays.includes(d) ? 'bg-slate-900/30' : ''}">${d}</div>
        `).join('')}
      </div>

      <!-- Days grid -->
      <div class="grid grid-cols-7">
        ${days.map(date => {
          const dateStr = date.toISOString().slice(0, 10);
          const isCurrentMonth = date.getMonth() === this.currentDate.getMonth();
          const isToday = dateStr === today;
          const isWeekend = [0, 6].includes(date.getDay());
          const dayPosts = this.getPostsForDate(dateStr);

          return `
            <div
              class="min-h-24 p-2 border-b border-r border-slate-700 cursor-pointer hover:bg-slate-700/30 transition-colors ${isWeekend ? 'bg-slate-900/20' : ''} ${!isCurrentMonth ? 'opacity-40' : ''}"
              data-date="${dateStr}"
              onclick="Calendar.openDayModal('${dateStr}')"
            >
              <div class="flex items-center justify-between mb-1">
                <span class="text-sm ${isToday ? 'w-7 h-7 flex items-center justify-center bg-brandBlue rounded-full font-bold' : ''}">${date.getDate()}</span>
                ${dayPosts.length > 0 ? `<span class="text-xs text-gray-500">${dayPosts.length}</span>` : ''}
              </div>

              <div class="space-y-1">
                ${dayPosts.slice(0, 3).map(post => `
                  <div class="flex items-center gap-1 text-xs p-1 rounded ${this.getStatusColor(post.status)}/20 truncate">
                    <span class="w-1.5 h-1.5 rounded-full ${this.getStatusColor(post.status)} flex-shrink-0"></span>
                    <span class="truncate">${post.subject || t('calendar.post', 'Post')}</span>
                  </div>
                `).join('')}
                ${dayPosts.length > 3 ? `
                  <div class="text-xs text-gray-500 pl-2">+${dayPosts.length - 3} ${t('calendar.more', 'more')}</div>
                ` : ''}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  },
  
  renderWeekView(startDate) {
    const t = this.t.bind(this);
    const container = document.getElementById('calendar-container');
    const today = new Date().toISOString().slice(0, 10);

    // Generate 7 days starting from Sunday
    const days = [];
    const current = new Date(startDate);
    for (let i = 0; i < 7; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    const dayNames = this.getDayNamesFull();

    container.innerHTML = `
      <div class="divide-y divide-slate-700">
        ${days.map((date, i) => {
          const dateStr = date.toISOString().slice(0, 10);
          const isToday = dateStr === today;
          const isWeekend = [0, 6].includes(i);
          const dayPosts = this.getPostsForDate(dateStr);

          return `
            <div class="flex ${isWeekend ? 'bg-slate-900/20' : ''} ${isToday ? 'bg-brandBlue/10' : ''}">
              <!-- Day label -->
              <div class="w-32 p-4 border-r border-slate-700 flex-shrink-0">
                <div class="text-sm font-medium ${isToday ? 'text-brandBlue' : 'text-gray-400'}">${dayNames[i]}</div>
                <div class="text-2xl font-bold ${isToday ? 'text-brandBlue' : ''}">${date.getDate()}</div>
              </div>

              <!-- Posts -->
              <div class="flex-1 p-3 min-h-24">
                ${dayPosts.length === 0 ? `
                  <div class="h-full flex items-center justify-center">
                    <button
                      onclick="Calendar.openDayModal('${dateStr}')"
                      class="text-gray-500 hover:text-brandBlue transition-colors text-sm"
                    >
                      <i data-lucide="plus" class="w-4 h-4 inline"></i> ${t('calendar.addPost', 'Add post')}
                    </button>
                  </div>
                ` : `
                  <div class="space-y-2">
                    ${dayPosts.map(post => `
                      <a href="#/posts/${post.post_id}" class="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-700/50 transition-colors group">
                        <!-- Time -->
                        <div class="w-16 text-sm text-gray-400">
                          ${new Date(post.scheduled_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                        </div>

                        <!-- Status dot -->
                        <span class="w-2 h-2 rounded-full ${this.getStatusColor(post.status)} flex-shrink-0"></span>

                        <!-- Thumbnail -->
                        ${post.media_urls?.[0]?.url ? `
                          <img src="${post.media_urls[0].url}" class="w-10 h-10 rounded object-cover flex-shrink-0">
                        ` : `
                          <div class="w-10 h-10 rounded bg-slate-700 flex items-center justify-center flex-shrink-0">
                            <i data-lucide="file-text" class="w-4 h-4 text-gray-500"></i>
                          </div>
                        `}

                        <!-- Info -->
                        <div class="flex-1 min-w-0">
                          <div class="flex items-center gap-2">
                            ${UI.platformIcon(post.platform)}
                            <span class="font-medium truncate group-hover:text-brandBlue">${post.subject || t('calendar.untitled', 'Untitled')}</span>
                          </div>
                          <p class="text-xs text-gray-400 truncate">${post.caption?.slice(0, 40) || t('calendar.noCaption', 'No caption')}...</p>
                        </div>

                        ${UI.statusBadge(post.status)}
                      </a>
                    `).join('')}

                    <button
                      onclick="Calendar.openDayModal('${dateStr}')"
                      class="w-full text-center text-sm text-gray-500 hover:text-brandBlue py-1 transition-colors"
                    >
                      <i data-lucide="plus" class="w-3 h-3 inline"></i> ${t('calendar.addMore', 'Add more')}
                    </button>
                  </div>
                `}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    lucide.createIcons({ nodes: [container] });
  },
  
  openDayModal(dateStr) {
    const t = this.t.bind(this);
    const modal = document.getElementById('day-modal');
    const title = document.getElementById('day-modal-title');
    const content = document.getElementById('day-modal-content');
    const addLink = document.getElementById('add-post-for-day');

    const date = new Date(dateStr);
    // Use localized date format based on current language
    const lang = window.PortalI18n?.currentLang || 'en';
    const locale = lang === 'pt-BR' ? 'pt-BR' : lang === 'es' ? 'es-ES' : 'en-US';
    title.textContent = date.toLocaleDateString(locale, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Store date for add post link
    addLink.href = `#/posts/new?date=${dateStr}`;

    const dayPosts = this.getPostsForDate(dateStr);

    if (dayPosts.length === 0) {
      content.innerHTML = `
        <div class="text-center py-8 text-gray-400">
          <i data-lucide="calendar-x" class="w-12 h-12 mx-auto mb-3 opacity-50"></i>
          <p>${t('calendar.noPostsDay', 'No posts scheduled for this day')}</p>
        </div>
      `;
    } else {
      content.innerHTML = `
        <div class="space-y-3">
          ${dayPosts.map(post => `
            <a href="#/posts/${post.post_id}" class="flex items-center gap-3 p-3 rounded-lg bg-slate-700/50 hover:bg-slate-700 transition-colors">
              <!-- Time -->
              <div class="text-sm font-medium w-20">
                ${new Date(post.scheduled_at).toLocaleTimeString(locale, { hour: 'numeric', minute: '2-digit' })}
              </div>

              <!-- Thumbnail -->
              ${post.media_urls?.[0]?.url ? `
                <img src="${post.media_urls[0].url}" class="w-12 h-12 rounded-lg object-cover">
              ` : `
                <div class="w-12 h-12 rounded-lg bg-slate-600 flex items-center justify-center">
                  <i data-lucide="file-text" class="w-5 h-5 text-gray-500"></i>
                </div>
              `}

              <!-- Info -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  ${UI.platformIcon(post.platform)}
                  <span class="font-medium truncate">${post.subject || t('calendar.untitled', 'Untitled')}</span>
                </div>
                <p class="text-xs text-gray-400 truncate">${post.caption?.slice(0, 50) || t('calendar.noCaption', 'No caption')}</p>
              </div>

              ${UI.statusBadge(post.status)}
            </a>
          `).join('')}
        </div>
      `;
    }

    lucide.createIcons({ nodes: [modal] });
    modal.classList.remove('hidden');
  },
  
  closeDayModal() {
    document.getElementById('day-modal').classList.add('hidden');
  }
};
