/**
 * API Client for Portal Backend
 * Handles all HTTP requests with authentication
 */

window.API = {
  /**
   * Make an authenticated API request
   */
  async request(endpoint, options = {}) {
    const token = await Auth.getToken();
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${PortalConfig.API_BASE}${endpoint}`, {
      ...options,
      headers
    });
    
    // Handle 401 - redirect to login
    if (response.status === 401) {
      Auth.logout();
      return null;
    }
    
    // Parse JSON response
    if (response.status === 204) {
      return { success: true };
    }
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Request failed');
    }
    
    return data;
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
  }
};
