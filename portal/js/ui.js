/**
 * UI Utilities
 * Toast notifications, modals, helpers
 */

window.UI = {
  /**
   * Show toast notification
   */
  toast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const id = 'toast-' + Date.now();
    
    const colors = {
      success: 'bg-green-500',
      error: 'bg-red-500',
      warning: 'bg-yellow-500',
      info: 'bg-brandBlue'
    };
    
    const icons = {
      success: 'check-circle',
      error: 'x-circle',
      warning: 'alert-triangle',
      info: 'info'
    };
    
    const toast = document.createElement('div');
    toast.id = id;
    toast.className = `toast flex items-center gap-3 px-4 py-3 rounded-lg ${colors[type]} text-white shadow-lg max-w-sm`;
    toast.innerHTML = `
      <i data-lucide="${icons[type]}" class="w-5 h-5 flex-shrink-0"></i>
      <span class="flex-1">${message}</span>
      <button onclick="UI.dismissToast('${id}')" class="hover:opacity-70">
        <i data-lucide="x" class="w-4 h-4"></i>
      </button>
    `;
    
    container.appendChild(toast);
    lucide.createIcons({ nodes: [toast] });
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => this.dismissToast(id), 5000);
  },
  
  /**
   * Dismiss toast
   */
  dismissToast(id) {
    const toast = document.getElementById(id);
    if (toast) {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => toast.remove(), 300);
    }
  },
  
  /**
   * Confirm dialog
   */
  async confirm(message, title = 'Confirm') {
    return new Promise((resolve) => {
      const overlay = document.createElement('div');
      overlay.className = 'fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4';
      overlay.innerHTML = `
        <div class="bg-slate-800 rounded-2xl p-6 max-w-md w-full border border-slate-700">
          <h3 class="text-xl font-semibold mb-2">${title}</h3>
          <p class="text-gray-400 mb-6">${message}</p>
          <div class="flex gap-3 justify-end">
            <button id="confirm-cancel" class="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors">
              Cancel
            </button>
            <button id="confirm-ok" class="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg transition-colors">
              Confirm
            </button>
          </div>
        </div>
      `;
      
      document.body.appendChild(overlay);
      
      overlay.querySelector('#confirm-cancel').onclick = () => {
        overlay.remove();
        resolve(false);
      };
      
      overlay.querySelector('#confirm-ok').onclick = () => {
        overlay.remove();
        resolve(true);
      };
      
      overlay.onclick = (e) => {
        if (e.target === overlay) {
          overlay.remove();
          resolve(false);
        }
      };
    });
  },
  
  /**
   * Format date for display
   */
  formatDate(dateString, includeTime = true) {
    const date = new Date(dateString);
    const options = {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    };
    
    if (includeTime) {
      options.hour = '2-digit';
      options.minute = '2-digit';
    }
    
    return date.toLocaleDateString('en-US', options);
  },
  
  /**
   * Format relative time
   */
  formatRelativeTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = date - now;
    const absDiff = Math.abs(diff);
    
    const minutes = Math.floor(absDiff / 60000);
    const hours = Math.floor(absDiff / 3600000);
    const days = Math.floor(absDiff / 86400000);
    
    if (diff > 0) {
      // Future
      if (days > 0) return `in ${days} day${days > 1 ? 's' : ''}`;
      if (hours > 0) return `in ${hours} hour${hours > 1 ? 's' : ''}`;
      if (minutes > 0) return `in ${minutes} min`;
      return 'now';
    } else {
      // Past
      if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
      if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
      if (minutes > 0) return `${minutes} min ago`;
      return 'just now';
    }
  },
  
  /**
   * Get status badge HTML
   */
  statusBadge(status) {
    const colorClass = PortalConfig.STATUS_COLORS[status] || 'bg-gray-500/20 text-gray-400';
    return `<span class="px-2 py-1 rounded-full text-xs font-medium ${colorClass}">${status}</span>`;
  },
  
  /**
   * Get platform icon
   * Uses full PLATFORMS list (not filtered) to show icons for all posts including disabled platforms
   */
  platformIcon(platformId) {
    const platform = PortalConfig.getPlatformById(platformId);
    if (!platform) return '';
    return `<i data-lucide="${platform.icon}" class="w-4 h-4" style="color: ${platform.color}"></i>`;
  },
  
  /**
   * Truncate text
   */
  truncate(text, maxLength = 100) {
    if (!text || text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  },
  
  /**
   * Set loading state on button
   */
  setButtonLoading(button, loading) {
    if (loading) {
      button.disabled = true;
      button.dataset.originalText = button.innerHTML;
      button.innerHTML = '<div class="loading-spinner mx-auto"></div>';
    } else {
      button.disabled = false;
      if (button.dataset.originalText) {
        button.innerHTML = button.dataset.originalText;
      }
    }
  },
  
  /**
   * Show full-screen loading overlay for long operations
   */
  showLoadingOverlay(message = 'Please wait...') {
    // Remove existing overlay first
    this.hideLoadingOverlay();
    
    const overlay = document.createElement('div');
    overlay.id = 'loading-overlay';
    overlay.className = 'fixed inset-0 bg-black/80 flex items-center justify-center z-[100] backdrop-blur-sm';
    overlay.innerHTML = `
      <div class="bg-slate-800 rounded-2xl p-8 max-w-sm w-full mx-4 text-center border border-slate-700 shadow-xl">
        <div class="loading-spinner mx-auto mb-4 w-12 h-12 border-4"></div>
        <p class="text-lg font-medium" id="loading-message">${message}</p>
        <p class="text-sm text-gray-400 mt-2">This may take a moment</p>
      </div>
    `;
    
    document.body.appendChild(overlay);
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
  },
  
  /**
   * Update loading overlay message
   */
  updateLoadingMessage(message) {
    const msgEl = document.getElementById('loading-message');
    if (msgEl) msgEl.textContent = message;
  },
  
  /**
   * Hide loading overlay
   */
  hideLoadingOverlay() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
      overlay.remove();
      document.body.style.overflow = '';
    }
  },
  
  /**
   * Show offline warning banner
   */
  showOfflineBanner() {
    if (document.getElementById('offline-banner')) return;
    
    const banner = document.createElement('div');
    banner.id = 'offline-banner';
    banner.className = 'fixed top-0 left-0 right-0 bg-red-600 text-white py-3 px-4 text-center z-[90] shadow-lg';
    banner.innerHTML = `
      <div class="flex items-center justify-center gap-2">
        <i data-lucide="wifi-off" class="w-5 h-5"></i>
        <span><strong>You're offline.</strong> Please check your internet connection.</span>
      </div>
    `;
    document.body.appendChild(banner);
    lucide.createIcons({ nodes: [banner] });
  },
  
  /**
   * Hide offline warning banner
   */
  hideOfflineBanner() {
    const banner = document.getElementById('offline-banner');
    if (banner) banner.remove();
  },
  
  /**
   * Show session expiry warning
   */
  showSessionWarning() {
    const existingWarning = document.getElementById('session-warning');
    if (existingWarning) return;
    
    const warning = document.createElement('div');
    warning.id = 'session-warning';
    warning.className = 'fixed bottom-4 right-4 bg-yellow-600 text-white py-3 px-4 rounded-lg z-50 shadow-lg max-w-sm';
    warning.innerHTML = `
      <div class="flex items-start gap-3">
        <i data-lucide="clock" class="w-5 h-5 flex-shrink-0 mt-0.5"></i>
        <div>
          <p class="font-medium">Session expiring soon</p>
          <p class="text-sm opacity-90 mt-1">Your session will expire in a few minutes. Save your work.</p>
          <button id="extend-session-btn" class="mt-2 text-sm underline hover:no-underline">Extend Session</button>
        </div>
        <button onclick="UI.dismissSessionWarning()" class="hover:opacity-70">
          <i data-lucide="x" class="w-4 h-4"></i>
        </button>
      </div>
    `;
    document.body.appendChild(warning);
    lucide.createIcons({ nodes: [warning] });
    
    // Bind extend session button
    warning.querySelector('#extend-session-btn').onclick = async () => {
      try {
        await Auth.refreshAccessToken();
        UI.toast('Session extended', 'success');
        UI.dismissSessionWarning();
      } catch (e) {
        UI.toast('Could not extend session', 'error');
      }
    };
  },
  
  /**
   * Dismiss session warning
   */
  dismissSessionWarning() {
    const warning = document.getElementById('session-warning');
    if (warning) warning.remove();
  },
  
  /**
   * Initialize UI safeguards (online/offline detection, etc.)
   */
  initSafeguards() {
    // Online/offline detection
    window.addEventListener('online', () => {
      this.hideOfflineBanner();
      this.toast('You\'re back online!', 'success');
    });
    
    window.addEventListener('offline', () => {
      this.showOfflineBanner();
    });
    
    // Show banner if already offline
    if (!navigator.onLine) {
      this.showOfflineBanner();
    }
    
    // Warn before leaving page with unsaved changes
    window.addEventListener('beforeunload', (e) => {
      if (window._hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    });
    
    // Session expiry check (warn 5 minutes before)
    this._sessionCheckInterval = setInterval(() => {
      if (Auth.accessToken && Auth.tokenExpiry) {
        const timeLeft = Auth.tokenExpiry - Date.now();
        const fiveMinutes = 5 * 60 * 1000;
        
        if (timeLeft > 0 && timeLeft < fiveMinutes) {
          this.showSessionWarning();
        }
      }
    }, 60000); // Check every minute
    
    console.log('✅ UI safeguards initialized');
  },
  
  /**
   * Mark form as having unsaved changes
   */
  setUnsavedChanges(hasChanges) {
    window._hasUnsavedChanges = hasChanges;
  },
  
  /**
   * Show prompt dialog with input field
   */
  async prompt(message, title = 'Input', defaultValue = '') {
    return new Promise((resolve) => {
      const overlay = document.createElement('div');
      overlay.className = 'fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4';
      overlay.innerHTML = `
        <div class="bg-slate-800 rounded-2xl p-6 max-w-md w-full border border-slate-700">
          <h3 class="text-xl font-semibold mb-2">${title}</h3>
          <p class="text-gray-400 mb-4">${message}</p>
          <input type="text" id="prompt-input" value="${defaultValue}" 
            class="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-brandBlue focus:border-transparent mb-4">
          <div class="flex gap-3 justify-end">
            <button id="prompt-cancel" class="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors">
              Cancel
            </button>
            <button id="prompt-ok" class="px-4 py-2 bg-brandBlue hover:bg-sky-600 rounded-lg transition-colors">
              OK
            </button>
          </div>
        </div>
      `;
      
      document.body.appendChild(overlay);
      
      const input = overlay.querySelector('#prompt-input');
      input.focus();
      input.select();
      
      // Handle Enter key
      input.onkeydown = (e) => {
        if (e.key === 'Enter') {
          overlay.remove();
          resolve(input.value);
        }
        if (e.key === 'Escape') {
          overlay.remove();
          resolve(null);
        }
      };
      
      overlay.querySelector('#prompt-cancel').onclick = () => {
        overlay.remove();
        resolve(null);
      };
      
      overlay.querySelector('#prompt-ok').onclick = () => {
        overlay.remove();
        resolve(input.value);
      };
      
      overlay.onclick = (e) => {
        if (e.target === overlay) {
          overlay.remove();
          resolve(null);
        }
      };
    });
  },
  
  /**
   * Show alert dialog (info message)
   */
  async alert(message, title = 'Notice') {
    return new Promise((resolve) => {
      const overlay = document.createElement('div');
      overlay.className = 'fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4';
      overlay.innerHTML = `
        <div class="bg-slate-800 rounded-2xl p-6 max-w-md w-full border border-slate-700">
          <h3 class="text-xl font-semibold mb-2">${title}</h3>
          <p class="text-gray-400 mb-6">${message}</p>
          <div class="flex gap-3 justify-end">
            <button id="alert-ok" class="px-4 py-2 bg-brandBlue hover:bg-sky-600 rounded-lg transition-colors">
              OK
            </button>
          </div>
        </div>
      `;
      
      document.body.appendChild(overlay);
      
      overlay.querySelector('#alert-ok').onclick = () => {
        overlay.remove();
        resolve(true);
      };
      
      overlay.onclick = (e) => {
        if (e.target === overlay) {
          overlay.remove();
          resolve(true);
        }
      };
      
      // Handle Escape/Enter keys
      const handleKey = (e) => {
        if (e.key === 'Escape' || e.key === 'Enter') {
          document.removeEventListener('keydown', handleKey);
          overlay.remove();
          resolve(true);
        }
      };
      document.addEventListener('keydown', handleKey);
    });
  }
};
