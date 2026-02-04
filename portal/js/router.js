/**
 * Simple Hash-based Router
 * Handles SPA navigation within the portal
 */

window.Router = {
  currentPage: null,
  
  /**
   * Route definitions
   */
  routes: {
    'dashboard': { title: 'Dashboard', handler: 'Dashboard' },
    'approvals': { title: 'Approvals', handler: 'Approvals' },
    'posts': { title: 'Posts', handler: 'Posts' },
    'posts/new': { title: 'Create Post', handler: 'PostForm' },
    'posts/:id': { title: 'Post Details', handler: 'PostForm' },
    'calendar': { title: 'Calendar', handler: 'Calendar' },
    'analytics': { title: 'Analytics', handler: 'Analytics' },
    'batches/new': { title: 'Create Batch', handler: 'BatchForm' },
    'batches/:id': { title: 'Batch Details', handler: 'BatchForm' },
    'media': { title: 'Media Library', handler: 'Media' },
    'settings': { title: 'Settings', handler: 'Settings' },
    'schedule': { title: 'Schedule', handler: 'Settings' }  // Alias for settings
  },
  
  /**
   * Initialize router
   */
  init() {
    window.addEventListener('hashchange', () => this.handleRoute());
    this.handleRoute();
  },
  
  /**
   * Navigate to a route
   * @param {string} path - Route path
   * @param {boolean} force - Skip unsaved changes check
   */
  async navigate(path, force = false) {
    if (!force && window._hasUnsavedChanges && typeof UI !== 'undefined' && UI.confirm) {
      const confirmed = await UI.confirm(
        'You have unsaved changes. Are you sure you want to leave this page?',
        'Unsaved Changes'
      );
      if (!confirmed) return;
    }
    if (typeof UI !== 'undefined' && UI.setUnsavedChanges) {
      UI.setUnsavedChanges(false);
    }
    window.location.hash = `/${path}`;
  },
  
  /**
   * Handle current route
   */
  handleRoute() {
    const hash = window.location.hash.slice(2) || 'dashboard'; // Remove #/

    // Legacy redirect: #/posts/pending → #/approvals?type=posts
    if (hash === 'posts/pending') {
      window.location.hash = '#/approvals?type=posts';
      return;
    }

    // Find matching route
    let route = this.routes[hash];
    let params = {};
    
    if (!route) {
      // Try dynamic routes
      for (const [pattern, routeConfig] of Object.entries(this.routes)) {
        if (pattern.includes(':')) {
          const patternParts = pattern.split('/');
          const hashParts = hash.split('/');
          
          if (patternParts.length === hashParts.length) {
            let match = true;
            params = {};
            
            for (let i = 0; i < patternParts.length; i++) {
              if (patternParts[i].startsWith(':')) {
                params[patternParts[i].slice(1)] = hashParts[i];
              } else if (patternParts[i] !== hashParts[i]) {
                match = false;
                break;
              }
            }
            
            if (match) {
              route = routeConfig;
              break;
            }
          }
        }
      }
    }
    
    if (!route) {
      // Default to dashboard (or admin landing for admins)
      const isAdminNoClient = typeof Auth !== 'undefined' && Auth.user?.role === 'admin' && !Auth.user?.client_id;
      route = isAdminNoClient ? null : this.routes['dashboard'];
    }

    // Guard: admin users without client_id cannot access client-dependent pages
    const isAdminNoClient = typeof Auth !== 'undefined' && Auth.user?.role === 'admin' && !Auth.user?.client_id;
    if (isAdminNoClient && route) {
      this.renderAdminLanding(document.getElementById('page-content'));
      return;
    }

    this.currentPage = hash;
    this.updateActiveNav(hash);

    // Clear unsaved changes flag when navigating
    if (typeof UI !== 'undefined' && UI.setUnsavedChanges) {
      UI.setUnsavedChanges(false);
    }

    if (!route) {
      this.renderAdminLanding(document.getElementById('page-content'));
      return;
    }

    this.renderPage(route, params);
  },
  
  /**
   * Update active navigation link
   */
  updateActiveNav(hash) {
    document.querySelectorAll('.nav-link').forEach(link => {
      const linkPage = link.dataset.page;
      // Handle schedule -> settings alias
      const normalizedHash = hash === 'schedule' ? 'settings' : hash;
      if (linkPage === normalizedHash || normalizedHash.startsWith(linkPage + '/')) {
        link.classList.add('bg-brandBlue/20', 'text-brandBlue');
      } else {
        link.classList.remove('bg-brandBlue/20', 'text-brandBlue');
      }
    });
  },
  
  /**
   * Render page content
   */
  async renderPage(route, params) {
    const container = document.getElementById('page-content');
    const handler = window[route.handler];
    
    // Update page title
    document.title = `${route.title} | TechBuddy4Biz Portal`;
    
    // Show loading state
    container.innerHTML = `
      <div class="flex items-center justify-center py-20">
        <div class="loading-spinner"></div>
      </div>
    `;
    
    // Render page
    if (handler && typeof handler.render === 'function') {
      try {
        await handler.render(container, params);
      } catch (error) {
        console.error('Page render error:', error);
        container.innerHTML = `
          <div class="text-center py-20">
            <div class="text-red-400 mb-4">
              <i data-lucide="alert-circle" class="w-12 h-12 mx-auto"></i>
            </div>
            <h2 class="text-xl font-semibold mb-2">Error loading page</h2>
            <p class="text-gray-400">${error.message}</p>
          </div>
        `;
        lucide.createIcons();
      }
    } else {
      container.innerHTML = `
        <div class="text-center py-20">
          <p class="text-gray-400">Page not found</p>
        </div>
      `;
    }
  },

  /**
   * Render admin landing page (for admins without a client_id)
   */
  renderAdminLanding(container) {
    const t = typeof PortalI18n !== 'undefined' ? (k, fb) => PortalI18n.t(k, fb) : (k, fb) => fb;
    document.title = 'Admin | TechBuddy4Biz Portal';

    container.innerHTML = `
      <div class="max-w-2xl mx-auto py-16 text-center">
        <div class="bg-slate-800/50 rounded-xl p-8 border border-slate-700">
          <div class="w-16 h-16 bg-brandOrange/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <i data-lucide="shield" class="w-8 h-8 text-brandOrange"></i>
          </div>
          <h1 class="text-2xl font-bold mb-3">${t('admin.welcome', 'Admin Panel')}</h1>
          <p class="text-gray-400 mb-6">
            ${t('admin.noClientMsg', 'Your account is not linked to a specific client. Use the Admin Config panel to manage clients and their settings.')}
          </p>
          <a href="/admin/config.html"
            class="inline-flex items-center gap-2 px-6 py-3 bg-brandOrange hover:bg-orange-600 rounded-lg font-medium transition-colors">
            <i data-lucide="settings" class="w-5 h-5"></i>
            ${t('nav.adminConfig', 'Admin Config')}
          </a>
        </div>
      </div>
    `;
    lucide.createIcons();
  }
};
