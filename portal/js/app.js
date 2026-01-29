/**
 * TechBuddy4Biz Portal - Main App
 * Initializes authentication and routing
 */

const App = {
  isAuthenticated: false,
  user: null,
  
  async init() {
    console.log('🚀 TechBuddy4Biz Portal initializing...');
    
    // Setup sidebar toggle for mobile
    this.setupSidebar();
    
    // Check for auth callback
    if (window.location.hash.includes('access_token') || window.location.hash.includes('error')) {
      await this.handleAuthCallback();
      return;
    }
    
    // Initialize Supabase auth
    await this.checkAuth();
    
    // Setup auth listeners
    Auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event);
      if (event === 'SIGNED_IN' && session) {
        this.handleSignIn(session);
      } else if (event === 'SIGNED_OUT') {
        this.handleSignOut();
      }
    });
    
    // Initial render
    this.render();
  },
  
  setupSidebar() {
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    
    if (menuToggle && sidebar) {
      menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('-translate-x-full');
        overlay?.classList.toggle('hidden');
      });
    }
    
    if (overlay) {
      overlay.addEventListener('click', () => {
        sidebar?.classList.add('-translate-x-full');
        overlay.classList.add('hidden');
      });
    }
    
    // Close sidebar on nav link click (mobile)
    document.querySelectorAll('#sidebar a').forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth < 1024) {
          sidebar?.classList.add('-translate-x-full');
          overlay?.classList.add('hidden');
        }
      });
    });
  },
  
  async checkAuth() {
    try {
      const session = Auth.getSession();
      if (session) {
        this.isAuthenticated = true;
        this.user = session.user;
        
        // Verify session with backend
        try {
          const me = await API.getMe();
          if (me?.user) {
            this.user = { ...this.user, ...me.user };
          }
        } catch (e) {
          console.warn('Could not verify session with backend:', e);
        }
      }
    } catch (e) {
      console.error('Auth check failed:', e);
      this.isAuthenticated = false;
      this.user = null;
    }
  },
  
  async handleAuthCallback() {
    console.log('Handling auth callback...');
    
    // Parse hash fragment for tokens
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    const refreshToken = hashParams.get('refresh_token');
    const error = hashParams.get('error');
    const errorDescription = hashParams.get('error_description');
    
    if (error) {
      console.error('Auth error:', error, errorDescription);
      UI.toast(errorDescription || 'Authentication failed', 'error');
      window.location.hash = '';
      this.render();
      return;
    }
    
    if (accessToken) {
      try {
        // Set session in Supabase client
        const { data, error: sessionError } = await Auth.supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        });
        
        if (sessionError) throw sessionError;
        
        this.isAuthenticated = true;
        this.user = data.session?.user;
        
        UI.toast('Welcome back!', 'success');
        
        // Clear hash and navigate to dashboard
        window.location.hash = '/dashboard';
        
      } catch (e) {
        console.error('Session setup failed:', e);
        UI.toast('Failed to complete sign in', 'error');
        window.location.hash = '';
      }
    }
    
    this.render();
  },
  
  handleSignIn(session) {
    this.isAuthenticated = true;
    this.user = session.user;
    this.render();
    
    // Navigate to dashboard if on login screen
    if (!window.location.hash || window.location.hash === '#/') {
      window.location.hash = '/dashboard';
    }
  },
  
  handleSignOut() {
    this.isAuthenticated = false;
    this.user = null;
    this.render();
    window.location.hash = '';
  },
  
  render() {
    const authScreen = document.getElementById('auth-screen');
    const mainApp = document.getElementById('main-app');
    
    if (this.isAuthenticated) {
      // Show main app
      authScreen?.classList.add('hidden');
      mainApp?.classList.remove('hidden');
      
      // Update user info in sidebar
      this.updateUserInfo();
      
      // Initialize router
      Router.init();
      
    } else {
      // Show login screen
      authScreen?.classList.remove('hidden');
      mainApp?.classList.add('hidden');
      
      // Setup login form
      this.setupLoginForm();
    }
  },
  
  updateUserInfo() {
    const userEmail = document.getElementById('user-email');
    if (userEmail && this.user?.email) {
      userEmail.textContent = this.user.email;
    }
  },
  
  setupLoginForm() {
    const form = document.getElementById('login-form');
    const emailInput = document.getElementById('login-email');
    const submitBtn = form?.querySelector('button[type="submit"]');
    const successMsg = document.getElementById('login-success');
    
    if (!form) return;
    
    // Remove old listener and add new one
    const newForm = form.cloneNode(true);
    form.parentNode.replaceChild(newForm, form);
    
    newForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const email = newForm.querySelector('#login-email').value.trim();
      if (!email) {
        UI.toast('Please enter your email', 'error');
        return;
      }
      
      const btn = newForm.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.innerHTML = '<span class="loading-spinner inline-block mr-2"></span> Sending...';
      
      try {
        await Auth.signInWithMagicLink(email);
        
        // Show success message
        newForm.classList.add('hidden');
        const success = document.getElementById('login-success');
        if (success) {
          success.classList.remove('hidden');
          success.querySelector('p').textContent = `We sent a magic link to ${email}`;
        }
        
      } catch (error) {
        UI.toast(error.message || 'Failed to send magic link', 'error');
        btn.disabled = false;
        btn.innerHTML = '<i data-lucide="send" class="w-5 h-5"></i> Send Magic Link';
        lucide.createIcons();
      }
    });
  },
  
  async logout() {
    try {
      await Auth.signOut();
      UI.toast('Signed out', 'success');
    } catch (e) {
      console.error('Logout error:', e);
      // Force logout anyway
      this.handleSignOut();
    }
  }
};

// Global logout function for sidebar button
window.logout = () => App.logout();

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
