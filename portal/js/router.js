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
    'schedule': { title: 'Settings', handler: 'Schedule' }
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
      // Default to dashboard
      route = this.routes['dashboard'];
    }
    
    this.currentPage = hash;
    this.updateActiveNav(hash);
    
    // Clear unsaved changes flag when navigating
    if (typeof UI !== 'undefined' && UI.setUnsavedChanges) {
      UI.setUnsavedChanges(false);
    }
    
    this.renderPage(route, params);
  },
  
  /**
   * Update active navigation link
   */
  updateActiveNav(hash) {
    document.querySelectorAll('.nav-link').forEach(link => {
      const linkPage = link.dataset.page;
      if (linkPage === hash || hash.startsWith(linkPage + '/')) {
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
  }
};
