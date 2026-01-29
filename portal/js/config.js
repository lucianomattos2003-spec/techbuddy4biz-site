/**
 * Portal Configuration
 * Update SUPABASE_URL and SUPABASE_ANON_KEY with your project values
 */

window.PortalConfig = {
  // Supabase configuration
  // Replace these with your actual Supabase project values
  SUPABASE_URL: 'https://your-project.supabase.co',
  SUPABASE_ANON_KEY: 'your-anon-key',
  
  // Cloudinary configuration
  CLOUDINARY_CLOUD_NAME: 'dfqbqbhcr',
  CLOUDINARY_UPLOAD_PRESET: 'techbuddy_unsigned',
  
  // API base URL (empty for same-origin)
  API_BASE: '',
  
  // Supported platforms
  PLATFORMS: [
    { id: 'instagram', name: 'Instagram', icon: 'instagram', color: '#E4405F' },
    { id: 'linkedin', name: 'LinkedIn', icon: 'linkedin', color: '#0A66C2' },
    { id: 'facebook', name: 'Facebook', icon: 'facebook', color: '#1877F2' },
    { id: 'twitter', name: 'X (Twitter)', icon: 'twitter', color: '#1DA1F2' },
    { id: 'tiktok', name: 'TikTok', icon: 'music', color: '#000000' }
  ],
  
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
