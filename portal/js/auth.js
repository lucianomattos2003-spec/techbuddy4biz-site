/**
 * Authentication Module
 * Handles Supabase Auth with magic links
 */

window.Auth = {
  supabase: null,
  user: null,
  client: null,
  
  /**
   * Initialize Supabase client
   */
  init() {
    if (!window.supabase) {
      console.error('Supabase client not loaded');
      return;
    }
    
    this.supabase = supabase.createClient(
      PortalConfig.SUPABASE_URL,
      PortalConfig.SUPABASE_ANON_KEY
    );
    
    // Listen for auth state changes
    this.supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth event:', event);
      if (event === 'SIGNED_IN' && session) {
        this.handleSignIn(session);
      } else if (event === 'SIGNED_OUT') {
        this.handleSignOut();
      }
    });
  },
  
  /**
   * Check if user is authenticated
   */
  async checkAuth() {
    const { data: { session } } = await this.supabase.auth.getSession();
    
    if (session) {
      this.user = session.user;
      // Load additional user info from API
      try {
        const meData = await API.getMe();
        if (meData) {
          this.client = meData.client;
          this.user.role = meData.role;
        }
      } catch (e) {
        console.warn('Could not load user info:', e);
      }
      return true;
    }
    
    return false;
  },
  
  /**
   * Get current access token
   */
  async getToken() {
    const { data: { session } } = await this.supabase.auth.getSession();
    return session?.access_token || null;
  },
  
  /**
   * Request magic link
   */
  async requestMagicLink(email) {
    const redirectTo = `${window.location.origin}/portal/auth/callback`;
    
    const { error } = await this.supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo
      }
    });
    
    if (error) throw error;
    return true;
  },
  
  /**
   * Handle successful sign in
   */
  async handleSignIn(session) {
    this.user = session.user;
    
    // Load additional user info
    try {
      const meData = await API.getMe();
      if (meData) {
        this.client = meData.client;
        this.user.role = meData.role;
      }
    } catch (e) {
      console.warn('Could not load user info:', e);
    }
    
    // Update UI
    App.showMainApp();
    Router.navigate('dashboard');
  },
  
  /**
   * Handle sign out
   */
  handleSignOut() {
    this.user = null;
    this.client = null;
    App.showAuthScreen();
  },
  
  /**
   * Sign out user
   */
  async logout() {
    await this.supabase.auth.signOut();
    this.user = null;
    this.client = null;
    window.location.hash = '';
    App.showAuthScreen();
  },
  
  /**
   * Get display name
   */
  getDisplayName() {
    if (this.client?.name) return this.client.name;
    if (this.user?.email) return this.user.email.split('@')[0];
    return 'User';
  }
};
