/**
 * TechBuddy4Biz Portal - Main App
 * Initializes authentication and routing
 */

const App = {
  isAuthenticated: false,
  user: null,
  
  async init() {
    console.log('🚀 TechBuddy4Biz Portal initializing...');

    try {
      // Load Cloudinary config from database
      await PortalConfig.loadCloudinaryConfig();

      // Initialize UI safeguards (online/offline detection, etc.)
      console.log('🛡️ Initializing UI safeguards...');
      UI.initSafeguards();

      // Initialize Auth module first
      console.log('📦 Initializing Auth module...');
      Auth.init();
      
      // Setup sidebar toggle for mobile
      this.setupSidebar();
      
      // Check existing session (from stored tokens)
      console.log('🔍 Checking existing session...');
      await this.checkAuth();
      
    } catch (e) {
      console.error('❌ App init error:', e);
      this.isAuthenticated = false;
    }
    
    // Always render (show login if not authenticated)
    console.log('🎨 Initial render...');
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
    console.log('🔐 checkAuth() starting...');
    try {
      // Check if we have a valid token
      const isValid = await Auth.checkAuth();
      console.log('📋 Session check result:', { isValid, hasToken: !!Auth.accessToken });
      
      if (isValid) {
        console.log('✅ Valid session found for:', Auth.user?.email);
        this.isAuthenticated = true;
        this.user = Auth.user;
        
        // Load enabled platforms for this client
        await API.loadEnabledPlatforms();
      } else {
        console.log('ℹ️ No active session');
        this.isAuthenticated = false;
        this.user = null;
      }
    } catch (e) {
      console.error('❌ Auth check failed:', e);
      this.isAuthenticated = false;
      this.user = null;
    }
  },
  
  async handleSignIn(userData) {
    this.isAuthenticated = true;
    this.user = userData;

    // Load enabled platforms for this client before rendering
    // Use .catch to prevent errors from blocking login
    await API.loadEnabledPlatforms().catch(err => {
      console.warn('Could not load enabled platforms:', err);
    });

    this.render();
    
    // Navigate to dashboard if on login screen
    if (!window.location.hash || window.location.hash === '#/') {
      window.location.hash = '/dashboard';
    }
  },
  
  handleSignOut() {
    this.isAuthenticated = false;
    this.user = null;
    PortalConfig.clearEnabledPlatforms(); // Clear enabled platforms on logout
    this.render();
    window.location.hash = '';
  },
  
  render() {
    console.log('🎨 render() called, isAuthenticated:', this.isAuthenticated);
    
    // Hide loading screen
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
      console.log('🔄 Hiding loading screen...');
      loadingScreen.classList.add('hidden');
    }
    
    const authScreen = document.getElementById('auth-screen');
    const mainApp = document.getElementById('main-app');
    
    console.log('📍 DOM elements found:', { authScreen: !!authScreen, mainApp: !!mainApp });
    
    if (this.isAuthenticated) {
      console.log('✅ Showing main app (authenticated)');
      // Show main app
      authScreen?.classList.add('hidden');
      mainApp?.classList.remove('hidden');
      
      // Update user info in sidebar
      this.updateUserInfo();
      
      // Initialize router
      console.log('🔗 Initializing router...');
      Router.init();
      
      // Refresh approval badge
      setTimeout(() => {
        if (typeof refreshApprovalBadge === 'function') {
          refreshApprovalBadge();
        }
      }, 500);
      
    } else {
      console.log('🔑 Showing login screen (not authenticated)');
      // Show login screen
      authScreen?.classList.remove('hidden');
      mainApp?.classList.add('hidden');
      
      // Setup login form
      console.log('📝 Setting up login form...');
      this.setupLoginForm();
    }
    
    console.log('✅ render() complete');
  },
  
  updateUserInfo() {
    const userName = document.getElementById('user-name');
    const userEmail = document.getElementById('user-email');
    const logoutBtn = document.getElementById('logout-btn');

    if (userName) {
      userName.textContent = Auth.getDisplayName() || 'User';
    }
    if (userEmail && this.user?.email) {
      userEmail.textContent = this.user.email;
    }
    if (logoutBtn) {
      logoutBtn.onclick = () => this.logout();
    }

    // Role-based nav visibility
    const isAdmin = Auth.user?.role === 'admin';
    const hasClientId = !!Auth.user?.client_id;

    // Show admin config link only for admins
    const adminLink = document.getElementById('admin-config-link');
    if (adminLink) {
      adminLink.classList.toggle('hidden', !isAdmin);
    }

    // Hide client-dependent nav items for admin users without a client_id
    if (isAdmin && !hasClientId) {
      document.querySelectorAll('[data-requires="client"]').forEach(el => {
        el.classList.add('hidden');
      });
    } else {
      document.querySelectorAll('[data-requires="client"]').forEach(el => {
        el.classList.remove('hidden');
      });
    }
  },
  
  setupLoginForm() {
    // Get all form elements
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const forgotForm = document.getElementById('forgot-form');
    const otpForm = document.getElementById('otp-form');
    const resetForm = document.getElementById('reset-form');
    
    // Form toggle buttons
    const showSignup = document.getElementById('show-signup');
    const showForgot = document.getElementById('show-forgot');
    const showLoginFromSignup = document.getElementById('show-login-from-signup');
    const showLoginFromForgot = document.getElementById('show-login-from-forgot');
    const resendOtp = document.getElementById('resend-otp');
    
    // Helper to show only one form
    const showForm = (formId) => {
      [loginForm, signupForm, forgotForm, otpForm, resetForm].forEach(f => f?.classList.add('hidden'));
      document.getElementById(formId)?.classList.remove('hidden');
      lucide.createIcons();
    };
    
    // Toggle between forms
    showSignup?.addEventListener('click', () => showForm('signup-form'));
    showForgot?.addEventListener('click', () => showForm('forgot-form'));
    showLoginFromSignup?.addEventListener('click', () => showForm('login-form'));
    showLoginFromForgot?.addEventListener('click', () => showForm('login-form'));
    
    // ========== LOGIN FORM ==========
    loginForm?.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const email = document.getElementById('login-email').value.trim();
      const password = document.getElementById('login-password').value;
      
      if (!email || !password) {
        UI.toast('Please enter email and password', 'error');
        return;
      }
      
      const btn = document.getElementById('login-btn');
      btn.disabled = true;
      btn.innerHTML = '<span class="loading-spinner inline-block mr-2"></span> Signing in...';
      
      try {
        const result = await Auth.signIn(email, password);
        UI.toast('Welcome back!', 'success');
        // Update app state and render dashboard
        this.handleSignIn(result.user);
      } catch (error) {
        console.error('Login failed:', error);
        UI.toast(error.message || 'Invalid email or password', 'error');
        btn.disabled = false;
        btn.innerHTML = '<i data-lucide="log-in" class="w-5 h-5"></i> Sign In';
        lucide.createIcons();
      }
    });
    
    // ========== SIGNUP FORM ==========
    signupForm?.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const email = document.getElementById('signup-email').value.trim();
      const password = document.getElementById('signup-password').value;
      const confirm = document.getElementById('signup-confirm').value;
      
      if (!email || !password) {
        UI.toast('Please fill in all fields', 'error');
        return;
      }
      
      if (password !== confirm) {
        UI.toast('Passwords do not match', 'error');
        return;
      }
      
      if (password.length < 6) {
        UI.toast('Password must be at least 6 characters', 'error');
        return;
      }
      
      const btn = document.getElementById('signup-btn');
      btn.disabled = true;
      btn.innerHTML = '<span class="loading-spinner inline-block mr-2"></span> Creating account...';
      
      try {
        const result = await Auth.signUp(email, password);
        UI.toast('Account created successfully!', 'success');
        // Auto-login after signup
        this.handleSignIn(result.user);
      } catch (error) {
        console.error('Signup failed:', error);
        UI.toast(error.message || 'Failed to create account', 'error');
        btn.disabled = false;
        btn.innerHTML = '<i data-lucide="user-plus" class="w-5 h-5"></i> Create Account';
        lucide.createIcons();
      }
    });
    
    // ========== FORGOT PASSWORD FORM ==========
    forgotForm?.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const email = document.getElementById('forgot-email').value.trim();
      
      if (!email) {
        UI.toast('Please enter your email', 'error');
        return;
      }
      
      const btn = document.getElementById('forgot-btn');
      btn.disabled = true;
      btn.innerHTML = '<span class="loading-spinner inline-block mr-2"></span> Sending code...';
      
      try {
        await Auth.requestPasswordReset(email);
        
        // Show OTP form
        document.getElementById('otp-email').textContent = email;
        showForm('otp-form');
        UI.toast('Reset code sent to your email', 'success');
      } catch (error) {
        console.error('Reset request failed:', error);
        UI.toast(error.message || 'Failed to send reset code', 'error');
      } finally {
        btn.disabled = false;
        btn.innerHTML = '<i data-lucide="key" class="w-5 h-5"></i> Send Reset Code';
        lucide.createIcons();
      }
    });
    
    // ========== OTP VERIFICATION FORM ==========
    otpForm?.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const code = document.getElementById('otp-code').value.trim();
      
      if (!code || code.length !== 6) {
        UI.toast('Please enter the 6-digit code', 'error');
        return;
      }
      
      const btn = document.getElementById('otp-btn');
      btn.disabled = true;
      btn.innerHTML = '<span class="loading-spinner inline-block mr-2"></span> Verifying...';
      
      try {
        await Auth.verifyOTP(code);
        
        // Show reset password form
        showForm('reset-form');
        UI.toast('Code verified!', 'success');
      } catch (error) {
        console.error('OTP verification failed:', error);
        UI.toast(error.message || 'Invalid or expired code', 'error');
      } finally {
        btn.disabled = false;
        btn.innerHTML = '<i data-lucide="check-circle" class="w-5 h-5"></i> Verify Code';
        lucide.createIcons();
      }
    });
    
    // Resend OTP
    resendOtp?.addEventListener('click', async () => {
      if (!Auth.resetEmail) {
        showForm('forgot-form');
        return;
      }
      
      try {
        await Auth.requestPasswordReset(Auth.resetEmail);
        UI.toast('New code sent!', 'success');
      } catch (error) {
        UI.toast(error.message || 'Failed to resend code', 'error');
      }
    });
    
    // ========== RESET PASSWORD FORM ==========
    resetForm?.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const password = document.getElementById('reset-password').value;
      const confirm = document.getElementById('reset-confirm').value;
      
      if (!password || password.length < 6) {
        UI.toast('Password must be at least 6 characters', 'error');
        return;
      }
      
      if (password !== confirm) {
        UI.toast('Passwords do not match', 'error');
        return;
      }
      
      const btn = document.getElementById('reset-btn');
      btn.disabled = true;
      btn.innerHTML = '<span class="loading-spinner inline-block mr-2"></span> Updating...';
      
      try {
        await Auth.resetPassword(password);
        
        UI.toast('Password updated! Please sign in.', 'success');
        showForm('login-form');
        
        // Pre-fill email
        const loginEmail = document.getElementById('login-email');
        if (loginEmail && Auth.resetEmail) {
          loginEmail.value = Auth.resetEmail;
        }
      } catch (error) {
        console.error('Password reset failed:', error);
        UI.toast(error.message || 'Failed to update password', 'error');
      } finally {
        btn.disabled = false;
        btn.innerHTML = '<i data-lucide="save" class="w-5 h-5"></i> Update Password';
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
  App.init().catch(e => {
    console.error('❌ Fatal init error:', e);
    // Force show login screen on any error
    document.getElementById('loading-screen')?.classList.add('hidden');
    document.getElementById('auth-screen')?.classList.remove('hidden');
  });
});

// Safety fallback - hide loading screen after 5 seconds no matter what
setTimeout(() => {
  const loadingScreen = document.getElementById('loading-screen');
  if (loadingScreen && !loadingScreen.classList.contains('hidden')) {
    console.warn('⚠️ Loading timeout - forcing login screen');
    loadingScreen.classList.add('hidden');
    document.getElementById('auth-screen')?.classList.remove('hidden');
  }
}, 5000);
