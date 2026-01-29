/**
 * App-Level Authentication Module
 * Handles login, registration, and token management
 * No Supabase Auth dependency - tokens managed by our API
 */

window.Auth = {
  user: null,
  client: null,
  accessToken: null,
  refreshToken: null,
  tokenExpiry: null, // Token expiry timestamp (ms) for session warning
  resetEmail: null,
  resetToken: null,
  tokenRefreshTimer: null,
  
  // Storage keys
  STORAGE_KEYS: {
    ACCESS_TOKEN: 'tb_access_token',
    REFRESH_TOKEN: 'tb_refresh_token',
    USER: 'tb_user'
  },
  
  /**
   * Initialize auth module
   * Loads tokens from storage and validates session
   */
  init() {
    console.log('🔐 Auth.init() starting...');
    
    // Load tokens from storage
    this.accessToken = localStorage.getItem(this.STORAGE_KEYS.ACCESS_TOKEN);
    this.refreshToken = localStorage.getItem(this.STORAGE_KEYS.REFRESH_TOKEN);
    
    const storedUser = localStorage.getItem(this.STORAGE_KEYS.USER);
    if (storedUser) {
      try {
        this.user = JSON.parse(storedUser);
      } catch (e) {
        console.warn('Failed to parse stored user:', e);
      }
    }
    
    console.log('✅ Auth initialized, hasToken:', !!this.accessToken);
    
    // Update token expiry for session warnings
    this.updateTokenExpiry();
    
    // Setup token refresh if we have a refresh token
    if (this.refreshToken) {
      this.scheduleTokenRefresh();
    }
  },
  
  /**
   * Check if user is authenticated
   * Validates token with API
   */
  async checkAuth() {
    if (!this.accessToken) {
      console.log('No access token found');
      return false;
    }
    
    try {
      // Validate token with API
      const meData = await API.getMe();
      if (meData?.user) {
        this.user = meData.user;
        this.client = meData.client;
        this.user.role = meData.role;
        this.saveUserToStorage();
        return true;
      }
    } catch (e) {
      console.warn('Token validation failed:', e.message);
      
      // Try to refresh token
      if (this.refreshToken && e.message?.includes('expired')) {
        const refreshed = await this.refreshAccessToken();
        if (refreshed) {
          return this.checkAuth();
        }
      }
      
      // Clear invalid tokens
      this.clearAuth();
    }
    
    return false;
  },
  
  /**
   * Get current access token
   */
  async getToken() {
    // Check if token might be expired (simple check)
    if (this.accessToken && this.isTokenExpiringSoon()) {
      await this.refreshAccessToken();
    }
    return this.accessToken;
  },
  
  /**
   * Check if token is expiring within 5 minutes
   */
  isTokenExpiringSoon() {
    if (!this.accessToken) return true;
    
    try {
      // Decode JWT payload (base64)
      const parts = this.accessToken.split('.');
      if (parts.length !== 3) return true;
      
      const payload = JSON.parse(atob(parts[1]));
      const exp = payload.exp * 1000; // Convert to milliseconds
      const fiveMinutes = 5 * 60 * 1000;
      
      return Date.now() > (exp - fiveMinutes);
    } catch (e) {
      return true;
    }
  },
  
  /**
   * Update token expiry timestamp (for session warning)
   */
  updateTokenExpiry() {
    if (!this.accessToken) {
      this.tokenExpiry = null;
      return;
    }
    
    try {
      const parts = this.accessToken.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        this.tokenExpiry = payload.exp * 1000; // Convert to ms
      }
    } catch (e) {
      console.warn('Could not parse token expiry:', e);
      this.tokenExpiry = null;
    }
  },
  
  /**
   * Sign in with email and password
   */
  async signIn(email, password) {
    const response = await fetch(`${PortalConfig.API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Login failed');
    }
    
    // Store tokens
    this.accessToken = data.accessToken;
    this.refreshToken = data.refreshToken;
    this.user = data.user;
    this.client = { client_id: data.user.client_id, name: data.user.client_name };
    this.updateTokenExpiry();
    
    this.saveToStorage();
    this.scheduleTokenRefresh();
    
    return data;
  },
  
  /**
   * Register new account
   */
  async signUp(email, password) {
    const response = await fetch(`${PortalConfig.API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Registration failed');
    }
    
    // Auto-login after registration
    this.accessToken = data.accessToken;
    this.refreshToken = data.refreshToken;
    this.user = data.user;
    
    this.saveToStorage();
    this.scheduleTokenRefresh();
    
    return data;
  },
  
  /**
   * Refresh the access token
   */
  async refreshAccessToken() {
    if (!this.refreshToken) {
      console.log('No refresh token available');
      return false;
    }
    
    try {
      const response = await fetch(`${PortalConfig.API_BASE}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: this.refreshToken })
      });
      
      if (!response.ok) {
        throw new Error('Token refresh failed');
      }
      
      const data = await response.json();
      this.accessToken = data.accessToken;
      localStorage.setItem(this.STORAGE_KEYS.ACCESS_TOKEN, this.accessToken);
      this.updateTokenExpiry();
      
      // Dismiss session warning if showing
      if (window.UI && typeof UI.dismissSessionWarning === 'function') {
        UI.dismissSessionWarning();
      }
      
      this.scheduleTokenRefresh();
      console.log('✅ Token refreshed successfully');
      return true;
      
    } catch (e) {
      console.error('Token refresh failed:', e);
      this.clearAuth();
      return false;
    }
  },
  
  /**
   * Schedule automatic token refresh
   */
  scheduleTokenRefresh() {
    // Clear any existing timer
    if (this.tokenRefreshTimer) {
      clearTimeout(this.tokenRefreshTimer);
    }
    
    // Refresh 5 minutes before expiry (token expires in 1 hour)
    const refreshIn = 55 * 60 * 1000; // 55 minutes
    
    this.tokenRefreshTimer = setTimeout(() => {
      this.refreshAccessToken();
    }, refreshIn);
  },
  
  /**
   * Request password reset OTP
   */
  async requestPasswordReset(email) {
    this.resetEmail = email;
    
    const response = await fetch(`${PortalConfig.API_BASE}/api/auth/request-reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to send reset code');
    }
    
    // In development, the API returns the OTP
    if (data._dev_otp) {
      console.log('🔐 DEV OTP:', data._dev_otp);
    }
    
    return data;
  },
  
  /**
   * Verify OTP code
   */
  async verifyOTP(code) {
    if (!this.resetEmail) {
      throw new Error('No reset email set');
    }
    
    const response = await fetch(`${PortalConfig.API_BASE}/api/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email: this.resetEmail, 
        code 
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Invalid or expired code');
    }
    
    this.resetToken = data.resetToken;
    return data;
  },
  
  /**
   * Reset password after OTP verification
   */
  async resetPassword(newPassword) {
    if (!this.resetToken || !this.resetEmail) {
      throw new Error('Invalid reset session');
    }
    
    const response = await fetch(`${PortalConfig.API_BASE}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email: this.resetEmail,
        resetToken: this.resetToken,
        newPassword 
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to reset password');
    }
    
    // Clear reset state
    this.resetEmail = null;
    this.resetToken = null;
    
    return data;
  },
  
  /**
   * Logout user
   */
  async logout() {
    // Call logout API to invalidate session
    if (this.refreshToken) {
      try {
        await fetch(`${PortalConfig.API_BASE}/api/auth/logout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: this.refreshToken })
        });
      } catch (e) {
        console.warn('Logout API call failed:', e);
      }
    }
    
    this.clearAuth();
  },
  
  /**
   * Clear all auth state
   */
  clearAuth() {
    this.accessToken = null;
    this.refreshToken = null;
    this.user = null;
    this.client = null;
    
    if (this.tokenRefreshTimer) {
      clearTimeout(this.tokenRefreshTimer);
      this.tokenRefreshTimer = null;
    }
    
    localStorage.removeItem(this.STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(this.STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(this.STORAGE_KEYS.USER);
  },
  
  /**
   * Save tokens and user to storage
   */
  saveToStorage() {
    if (this.accessToken) {
      localStorage.setItem(this.STORAGE_KEYS.ACCESS_TOKEN, this.accessToken);
    }
    if (this.refreshToken) {
      localStorage.setItem(this.STORAGE_KEYS.REFRESH_TOKEN, this.refreshToken);
    }
    this.saveUserToStorage();
  },
  
  /**
   * Save user to storage
   */
  saveUserToStorage() {
    if (this.user) {
      localStorage.setItem(this.STORAGE_KEYS.USER, JSON.stringify(this.user));
    }
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
