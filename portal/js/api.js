/**
 * API Client for Portal Backend
 * Handles all HTTP requests with authentication
 * Includes retry logic, timeout handling, and offline detection
 */

window.API = {
  // Configuration
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // ms
  REQUEST_TIMEOUT: 30000, // 30 seconds
  
  // Track if auth is ready
  _authReady: false,
  _authReadyPromise: null,
  
  /**
   * Wait for auth to be initialized before making requests
   */
  async waitForAuth() {
    if (this._authReady) return true;
    
    // Wait for Auth.init() to complete
    if (!this._authReadyPromise) {
      this._authReadyPromise = new Promise((resolve) => {
        const checkAuth = () => {
          if (Auth.accessToken !== undefined) {
            this._authReady = true;
            resolve(true);
          } else {
            setTimeout(checkAuth, 50);
          }
        };
        checkAuth();
        // Timeout after 5 seconds
        setTimeout(() => {
          this._authReady = true;
          resolve(true);
        }, 5000);
      });
    }
    
    return this._authReadyPromise;
  },
  
  /**
   * Check if browser is online
   */
  isOnline() {
    return navigator.onLine !== false;
  },
  
  /**
   * Sleep helper for retry delay
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },
  
  /**
   * Make an authenticated API request with retries and timeout
   */
  async request(endpoint, options = {}) {
    // Check network connectivity
    if (!this.isOnline()) {
      UI.toast('You appear to be offline. Please check your connection.', 'error');
      throw new Error('No internet connection');
    }
    
    // Wait for auth to be ready
    await this.waitForAuth();
    
    const token = await Auth.getToken();
    
    console.log(`📡 API Request: ${options.method || 'GET'} ${endpoint}`);
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Retry loop
    let lastError;
    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        // Create abort controller for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.REQUEST_TIMEOUT);
        
        const response = await fetch(`${PortalConfig.API_BASE}${endpoint}`, {
          ...options,
          headers,
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        console.log(`📡 API Response: ${response.status} ${response.statusText}`);
        
        // Handle 401 - try to refresh token once
        if (response.status === 401 && attempt === 1 && Auth.refreshToken) {
          console.log('🔄 Token expired, attempting refresh...');
          const refreshed = await Auth.refreshAccessToken();
          if (refreshed) {
            // Update token and retry
            const newToken = await Auth.getToken();
            headers['Authorization'] = `Bearer ${newToken}`;
            continue;
          } else {
            console.error('❌ Token refresh failed - logging out');
            Auth.logout();
            window.location.hash = '';
            return null;
          }
        }
        
        // Handle 401 after refresh attempt
        if (response.status === 401) {
          console.error('❌ 401 Unauthorized - logging out');
          Auth.logout();
          window.location.hash = '';
          return null;
        }
        
        // Handle 403 - no access (but auth is valid)
        if (response.status === 403) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Access denied');
        }
        
        // Parse JSON response
        if (response.status === 204) {
          return { success: true };
        }
        
        const data = await response.json();
        
        if (!response.ok) {
          console.error('❌ API Error:', data.error);
          throw new Error(data.error || 'Request failed');
        }
        
        return data;
        
      } catch (error) {
        lastError = error;
        
        // Don't retry on abort (timeout)
        if (error.name === 'AbortError') {
          UI.toast('Request timed out. Please try again.', 'error');
          throw new Error('Request timed out');
        }
        
        // Don't retry on auth errors
        if (error.message?.includes('401') || error.message?.includes('Access denied')) {
          throw error;
        }
        
        // Don't retry on validation errors (4xx)
        if (error.message && !error.message.includes('fetch')) {
          throw error;
        }
        
        // Network error - retry
        if (attempt < this.MAX_RETRIES) {
          console.log(`⚠️ Request failed, retrying (${attempt}/${this.MAX_RETRIES})...`);
          await this.sleep(this.RETRY_DELAY * attempt);
        }
      }
    }
    
    // All retries failed
    console.error('❌ All retries failed:', lastError);
    UI.toast('Connection error. Please try again.', 'error');
    throw lastError;
  },
  
  // ==================
  // Auth Endpoints
  // ==================
  
  async requestMagicLink(email) {
    return this.request('/api/auth/magic-link', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  },
  
  async getMe() {
    return this.request('/api/auth/me');
  },
  
  // ==================
  // Posts Endpoints
  // ==================
  
  async listPosts(filters = {}) {
    const params = new URLSearchParams();
    if (filters.status) params.set('status', filters.status);
    if (filters.approval_status) params.set('approval_status', filters.approval_status);
    if (filters.platform) params.set('platform', filters.platform);
    if (filters.from) params.set('from', filters.from);
    if (filters.to) params.set('to', filters.to);
    if (filters.limit) params.set('limit', filters.limit);
    if (filters.offset) params.set('offset', filters.offset);
    
    const query = params.toString();
    return this.request(`/api/posts${query ? '?' + query : ''}`);
  },
  
  async getPost(postId) {
    return this.request(`/api/posts/${postId}`);
  },
  
  async createPost(postData) {
    return this.request('/api/posts', {
      method: 'POST',
      body: JSON.stringify(postData)
    });
  },
  
  async updatePost(postId, updates) {
    return this.request(`/api/posts/${postId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  },
  
  async deletePost(postId) {
    return this.request(`/api/posts/${postId}`, {
      method: 'DELETE'
    });
  },
  
  async bulkPostAction(action, postIds) {
    return this.request('/api/posts/bulk', {
      method: 'POST',
      body: JSON.stringify({ action, post_ids: postIds })
    });
  },

  async approvePost(postId) {
    return this.request(`/api/posts/${postId}/approve`, {
      method: 'POST'
    });
  },

  async rejectPost(postId) {
    return this.request(`/api/posts/${postId}/reject`, {
      method: 'POST'
    });
  },
  
  // ==================
  // Batches Endpoints
  // ==================
  
  async createBatch(batchData) {
    return this.request('/api/batches', {
      method: 'POST',
      body: JSON.stringify(batchData)
    });
  },
  
  async getBatch(batchId) {
    return this.request(`/api/batches/${batchId}`);
  },
  
  // ==================
  // Media Endpoints
  // ==================
  
  async listMedia(filters = {}) {
    const params = new URLSearchParams();
    if (filters.tags) params.set('tags', filters.tags);
    if (filters.type) params.set('type', filters.type);
    if (filters.limit) params.set('limit', filters.limit);
    
    const query = params.toString();
    return this.request(`/api/media${query ? '?' + query : ''}`);
  },
  
  async saveMediaRecord(mediaData) {
    return this.request('/api/media', {
      method: 'POST',
      body: JSON.stringify(mediaData)
    });
  },
  
  async getSignedUploadParams(options = {}) {
    return this.request('/api/media/sign', {
      method: 'POST',
      body: JSON.stringify(options)
    });
  },
  
  // ==================
  // Schedule Endpoints
  // ==================
  
  async getSchedule(platform = null) {
    const query = platform ? `?platform=${platform}` : '';
    return this.request(`/api/schedule${query}`);
  },
  
  async updateSchedule(scheduleData) {
    return this.request('/api/schedule', {
      method: 'PUT',
      body: JSON.stringify(scheduleData)
    });
  },
  
  /**
   * Get enabled platforms for the current client
   * ✅ ARCHITECTURE COMPLIANCE:
   * Queries social_schedules to get platforms with is_active=true
   */
  async getEnabledPlatforms() {
    return this.request('/api/schedule/platforms');
  },

  /**
   * Load enabled platforms for the current client and store in PortalConfig
   * Returns array of enabled platform IDs
   * ✅ Called on login to filter UI options
   */
  async loadEnabledPlatforms() {
    try {
      const data = await this.getEnabledPlatforms();
      const enabledPlatformIds = data?.enabled_platforms || [];

      console.log('✅ Loaded enabled platforms:', enabledPlatformIds);

      // Store in PortalConfig for use across the app
      PortalConfig.setEnabledPlatforms(enabledPlatformIds);

      return enabledPlatformIds;
    } catch (error) {
      console.error('❌ Failed to load enabled platforms:', error);
      // Don't set anything - getEnabledPlatforms will return all as fallback
      return null;
    }
  }
};
