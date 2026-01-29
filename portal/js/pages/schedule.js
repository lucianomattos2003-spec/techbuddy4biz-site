/**
 * Schedule Configuration Page
 * Manage posting schedule preferences
 */

window.Schedule = {
  schedule: null,
  
  async render(container) {
    container.innerHTML = `
      <div class="space-y-6">
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 class="text-2xl lg:text-3xl font-bold">Posting Schedule</h1>
            <p class="text-gray-400 mt-1">Configure when your posts are published</p>
          </div>
        </div>
        
        <!-- Loading -->
        <div id="schedule-loading" class="p-8 text-center">
          <div class="loading-spinner mx-auto"></div>
          <p class="text-gray-400 mt-3">Loading schedule...</p>
        </div>
        
        <!-- Schedule Form -->
        <form id="schedule-form" class="hidden space-y-6">
          <!-- Timezone -->
          <div class="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
              <i data-lucide="globe" class="w-5 h-5 text-brandBlue"></i>
              Timezone
            </h3>
            <select id="timezone" name="timezone" class="w-full md:w-1/2 px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg focus:ring-2 focus:ring-brandBlue">
              <option value="America/New_York">Eastern Time (ET)</option>
              <option value="America/Chicago">Central Time (CT)</option>
              <option value="America/Denver">Mountain Time (MT)</option>
              <option value="America/Los_Angeles">Pacific Time (PT)</option>
              <option value="America/Sao_Paulo">Brazil (BRT)</option>
              <option value="Europe/London">London (GMT/BST)</option>
              <option value="Europe/Paris">Paris (CET)</option>
              <option value="Asia/Tokyo">Tokyo (JST)</option>
              <option value="UTC">UTC</option>
            </select>
          </div>
          
          <!-- Weekly Schedule -->
          <div class="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
              <i data-lucide="calendar" class="w-5 h-5 text-brandBlue"></i>
              Weekly Schedule
            </h3>
            <p class="text-sm text-gray-400 mb-4">Select posting days and times for each platform</p>
            
            <div id="weekly-schedule" class="space-y-6">
              <!-- Days will be rendered here -->
            </div>
          </div>
          
          <!-- Posts Per Day -->
          <div class="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
              <i data-lucide="repeat" class="w-5 h-5 text-brandBlue"></i>
              Posting Frequency
            </h3>
            
            <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              ${PortalConfig.getEnabledPlatforms().map(p => `
                <div>
                  <label class="block text-sm text-gray-400 mb-2">${p.icon} ${p.name}</label>
                  <select id="frequency-${p.id}" name="frequency_${p.id}" class="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg focus:ring-2 focus:ring-brandBlue">
                    <option value="1">1 post/day</option>
                    <option value="2">2 posts/day</option>
                    <option value="3">3 posts/day</option>
                    <option value="0">Disabled</option>
                  </select>
                </div>
              `).join('')}
            </div>
          </div>
          
          <!-- Best Times -->
          <div class="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
              <i data-lucide="clock" class="w-5 h-5 text-brandBlue"></i>
              Preferred Posting Times
            </h3>
            <p class="text-sm text-gray-400 mb-4">Select up to 5 preferred times for posting</p>
            
            <div id="posting-times" class="space-y-3">
              <!-- Time slots rendered here -->
            </div>
            
            <button type="button" id="add-time-slot" class="mt-4 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm flex items-center gap-2">
              <i data-lucide="plus" class="w-4 h-4"></i>
              Add Time Slot
            </button>
          </div>
          
          <!-- Auto-Publish -->
          <div class="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
              <i data-lucide="zap" class="w-5 h-5 text-brandBlue"></i>
              Auto-Publish
            </h3>
            
            <label class="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" id="auto-publish" name="auto_publish" class="w-5 h-5 rounded bg-slate-900 border-slate-600 text-brandBlue focus:ring-brandBlue">
              <div>
                <span class="font-medium">Enable automatic publishing</span>
                <p class="text-sm text-gray-400">Posts will be published automatically at scheduled times without requiring approval</p>
              </div>
            </label>
          </div>
          
          <!-- Save Button -->
          <div class="flex justify-end gap-4">
            <button type="button" id="reset-schedule" class="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors">
              Reset to Defaults
            </button>
            <button type="submit" class="px-6 py-3 bg-brandBlue hover:bg-sky-600 rounded-lg font-medium transition-colors flex items-center gap-2">
              <i data-lucide="save" class="w-4 h-4"></i>
              Save Schedule
            </button>
          </div>
        </form>
      </div>
    `;
    
    lucide.createIcons();
    this.bindEvents();
    await this.loadSchedule();
  },
  
  bindEvents() {
    document.getElementById('schedule-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveSchedule();
    });
    
    document.getElementById('add-time-slot').addEventListener('click', () => {
      this.addTimeSlot();
    });
    
    document.getElementById('reset-schedule').addEventListener('click', () => {
      this.resetToDefaults();
    });
  },
  
  async loadSchedule() {
    const loading = document.getElementById('schedule-loading');
    const form = document.getElementById('schedule-form');
    
    try {
      const data = await API.getSchedule();
      this.schedule = data?.schedule || this.getDefaultSchedule();
      
      // Populate form
      this.populateForm();
      
      loading.classList.add('hidden');
      form.classList.remove('hidden');
      lucide.createIcons();
      
    } catch (error) {
      loading.innerHTML = `
        <i data-lucide="alert-circle" class="w-12 h-12 mx-auto text-red-400"></i>
        <p class="text-red-400 mt-3">Failed to load schedule: ${error.message}</p>
        <button onclick="Schedule.loadSchedule()" class="mt-4 px-4 py-2 bg-slate-700 rounded-lg">Try Again</button>
      `;
      lucide.createIcons();
    }
  },
  
  getDefaultSchedule() {
    return {
      timezone: 'America/New_York',
      weekly: {
        monday: { enabled: true, platforms: ['instagram', 'facebook', 'linkedin'] },
        tuesday: { enabled: true, platforms: ['instagram', 'facebook', 'linkedin'] },
        wednesday: { enabled: true, platforms: ['instagram', 'facebook', 'linkedin'] },
        thursday: { enabled: true, platforms: ['instagram', 'facebook', 'linkedin'] },
        friday: { enabled: true, platforms: ['instagram', 'facebook', 'linkedin'] },
        saturday: { enabled: false, platforms: [] },
        sunday: { enabled: false, platforms: [] }
      },
      frequency: {
        instagram: 1,
        facebook: 1,
        linkedin: 1,
        twitter: 1
      },
      posting_times: ['09:00', '12:00', '17:00'],
      auto_publish: false
    };
  },
  
  populateForm() {
    // Timezone
    document.getElementById('timezone').value = this.schedule.timezone;
    
    // Weekly schedule
    const weeklyContainer = document.getElementById('weekly-schedule');
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    weeklyContainer.innerHTML = days.map(day => {
      const dayConfig = this.schedule.weekly?.[day] || { enabled: false, platforms: [] };
      const dayName = day.charAt(0).toUpperCase() + day.slice(1);
      
      return `
        <div class="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
          <div class="flex items-center justify-between mb-3">
            <label class="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" name="day_${day}" ${dayConfig.enabled ? 'checked' : ''} 
                class="w-5 h-5 rounded bg-slate-900 border-slate-600 text-brandBlue focus:ring-brandBlue day-toggle"
                data-day="${day}">
              <span class="font-medium">${dayName}</span>
            </label>
          </div>
          <div class="flex flex-wrap gap-2 day-platforms ${dayConfig.enabled ? '' : 'opacity-50'}" data-day="${day}">
            ${PortalConfig.getEnabledPlatforms().map(p => `
              <label class="flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-full cursor-pointer hover:bg-slate-700 transition-colors">
                <input type="checkbox" name="${day}_${p.id}" ${dayConfig.platforms?.includes(p.id) ? 'checked' : ''}
                  class="w-4 h-4 rounded bg-slate-900 border-slate-600 text-brandBlue focus:ring-brandBlue"
                  ${dayConfig.enabled ? '' : 'disabled'}>
                <span class="text-sm">${p.icon}</span>
              </label>
            `).join('')}
          </div>
        </div>
      `;
    }).join('');
    
    // Bind day toggle events
    weeklyContainer.querySelectorAll('.day-toggle').forEach(toggle => {
      toggle.addEventListener('change', (e) => {
        const day = e.target.dataset.day;
        const platformsDiv = weeklyContainer.querySelector(`.day-platforms[data-day="${day}"]`);
        const checkboxes = platformsDiv.querySelectorAll('input[type="checkbox"]');
        
        if (e.target.checked) {
          platformsDiv.classList.remove('opacity-50');
          checkboxes.forEach(cb => cb.disabled = false);
        } else {
          platformsDiv.classList.add('opacity-50');
          checkboxes.forEach(cb => cb.disabled = true);
        }
      });
    });
    
    // Frequency
    PortalConfig.getEnabledPlatforms().forEach(p => {
      const select = document.getElementById(`frequency-${p.id}`);
      if (select) {
        select.value = this.schedule.frequency?.[p.id] ?? 1;
      }
    });
    
    // Posting times
    this.renderTimeSlots();
    
    // Auto-publish
    document.getElementById('auto-publish').checked = this.schedule.auto_publish || false;
  },
  
  renderTimeSlots() {
    const container = document.getElementById('posting-times');
    const times = this.schedule.posting_times || [];
    
    container.innerHTML = times.map((time, idx) => `
      <div class="flex items-center gap-3" data-time-index="${idx}">
        <input type="time" value="${time}" class="time-slot px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg focus:ring-2 focus:ring-brandBlue">
        <button type="button" class="remove-time p-2 text-gray-400 hover:text-red-400 hover:bg-slate-700 rounded-lg" ${times.length <= 1 ? 'disabled' : ''}>
          <i data-lucide="trash-2" class="w-4 h-4"></i>
        </button>
      </div>
    `).join('');
    
    // Bind remove events
    container.querySelectorAll('.remove-time').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.currentTarget.parentElement.dataset.timeIndex);
        this.schedule.posting_times.splice(idx, 1);
        this.renderTimeSlots();
        lucide.createIcons();
      });
    });
    
    lucide.createIcons();
  },
  
  addTimeSlot() {
    if ((this.schedule.posting_times?.length || 0) >= 5) {
      UI.toast('Maximum 5 time slots allowed', 'error');
      return;
    }
    
    this.schedule.posting_times = this.schedule.posting_times || [];
    this.schedule.posting_times.push('12:00');
    this.renderTimeSlots();
  },
  
  async saveSchedule() {
    // Gather form data
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const weekly = {};
    
    days.forEach(day => {
      const dayEnabled = document.querySelector(`input[name="day_${day}"]`)?.checked || false;
      const platforms = [];
      
      PortalConfig.getEnabledPlatforms().forEach(p => {
        const cb = document.querySelector(`input[name="${day}_${p.id}"]`);
        if (cb?.checked) platforms.push(p.id);
      });
      
      weekly[day] = { enabled: dayEnabled, platforms };
    });
    
    const frequency = {};
    PortalConfig.getEnabledPlatforms().forEach(p => {
      frequency[p.id] = parseInt(document.getElementById(`frequency-${p.id}`)?.value) || 0;
    });
    
    const posting_times = [];
    document.querySelectorAll('.time-slot').forEach(input => {
      if (input.value) posting_times.push(input.value);
    });
    
    const scheduleData = {
      timezone: document.getElementById('timezone').value,
      weekly,
      frequency,
      posting_times,
      auto_publish: document.getElementById('auto-publish').checked
    };
    
    try {
      await API.updateSchedule(scheduleData);
      this.schedule = scheduleData;
      UI.toast('Schedule saved!', 'success');
    } catch (error) {
      UI.toast(`Failed to save: ${error.message}`, 'error');
    }
  },
  
  resetToDefaults() {
    if (confirm('Reset schedule to default settings?')) {
      this.schedule = this.getDefaultSchedule();
      this.populateForm();
      UI.toast('Reset to defaults', 'success');
    }
  }
};
