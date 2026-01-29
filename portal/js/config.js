/**
 * Portal Configuration
 * Update SUPABASE_URL and SUPABASE_ANON_KEY with your project values
 */

window.PortalConfig = {
  // Supabase configuration
  // SUPABASE_URL should be: https://your-project-id.supabase.co
  // SUPABASE_ANON_KEY should be the anon/public key (starts with eyJ...)
  // Find these in: Supabase Dashboard > Project Settings > API
  SUPABASE_URL: 'https://saoybhrksshcjnidlfdb.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNhb3liaHJrc3NoY2puaWRsZmRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5ODU0MjYsImV4cCI6MjA4MTU2MTQyNn0.uH0Yt_FrSzKBddBH7HMp4ZyvYgpQbaEzgMIcCq1JSFk',  // Get from Supabase Dashboard > Settings > API > anon public
  
  // Cloudinary configuration
  CLOUDINARY_CLOUD_NAME: 'dfqbqbhcr',
  CLOUDINARY_UPLOAD_PRESET: 'techbuddy_unsigned',
  
  // API base URL (empty for same-origin)
  API_BASE: '',
  
  // All supported platforms (full list)
  PLATFORMS: [
    { id: 'instagram', name: 'Instagram', icon: 'instagram', color: '#E4405F' },
    { id: 'linkedin', name: 'LinkedIn', icon: 'linkedin', color: '#0A66C2' },
    { id: 'facebook', name: 'Facebook', icon: 'facebook', color: '#1877F2' },
    { id: 'twitter', name: 'X (Twitter)', icon: 'twitter', color: '#1DA1F2' },
    { id: 'tiktok', name: 'TikTok', icon: 'music', color: '#000000' }
  ],
  
  // Enabled platforms for current client (populated on auth)
  _enabledPlatformIds: null,
  
  /**
   * Get only the platforms enabled for the current client
   * Falls back to all platforms if not yet loaded
   */
  getEnabledPlatforms() {
    if (!this._enabledPlatformIds) {
      // Not loaded yet - return all platforms as fallback
      return this.PLATFORMS;
    }
    return this.PLATFORMS.filter(p => this._enabledPlatformIds.includes(p.id));
  },
  
  /**
   * Set the enabled platform IDs for the current client
   */
  setEnabledPlatforms(platformIds) {
    this._enabledPlatformIds = platformIds;
    console.log('📱 Enabled platforms:', platformIds);
  },
  
  /**
   * Clear enabled platforms (on logout)
   */
  clearEnabledPlatforms() {
    this._enabledPlatformIds = null;
  },
  
  /**
   * Get platform info by ID (from full list, not filtered)
   */
  getPlatformById(platformId) {
    return this.PLATFORMS.find(p => p.id === platformId);
  },
  
  // Post types
  POST_TYPES: [
    { id: 'single_image', name: 'Single Image' },
    { id: 'carousel', name: 'Carousel' },
    { id: 'video', name: 'Video' },
    { id: 'text', name: 'Text Only' }
  ],
  
  // Status badges
  STATUS_COLORS: {
    'scheduled': 'bg-blue-500/20 text-blue-400',
    'ready': 'bg-yellow-500/20 text-yellow-400',
    'pending': 'bg-gray-500/20 text-gray-400',
    'approved': 'bg-green-500/20 text-green-400',
    'publishing': 'bg-purple-500/20 text-purple-400',
    'posted': 'bg-green-500/20 text-green-400',
    'failed': 'bg-red-500/20 text-red-400',
    'cancelled': 'bg-gray-500/20 text-gray-400'
  }
};
