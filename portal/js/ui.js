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
   */
  platformIcon(platformId) {
    const platform = PortalConfig.PLATFORMS.find(p => p.id === platformId);
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
  }
};
