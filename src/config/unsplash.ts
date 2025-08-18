// Unsplash API Configuration
export const UNSPLASH_CONFIG = {
  // Get your free API key from: https://unsplash.com/developers
  ACCESS_KEY: process.env.REACT_APP_UNSPLASH_ACCESS_KEY || 'YOUR_UNSPLASH_ACCESS_KEY',
  
  // API endpoints
  BASE_URL: 'https://api.unsplash.com',
  SEARCH_ENDPOINT: '/search/photos',
  
  // API limits (free tier)
  RATE_LIMIT: {
    REQUESTS_PER_HOUR: 50,
    REQUESTS_PER_MONTH: 5000
  },
  
  // Search parameters
  SEARCH_PARAMS: {
    PER_PAGE: 20,
    ORIENTATION: 'landscape',
    CONTENT_FILTER: 'high'
  },
  
  // Seasonal search queries optimized for garden/nature images
  SEASONAL_QUERIES: {
    spring: 'spring garden cherry blossoms flowers nature landscape peaceful',
    summer: 'summer garden green nature landscape vibrant colorful',
    autumn: 'autumn garden fall leaves landscape colors golden',
    winter: 'winter garden snow peaceful landscape serene white'
  }
};

// Helper function to check if API key is configured
export const isUnsplashConfigured = (): boolean => {
  return UNSPLASH_CONFIG.ACCESS_KEY !== 'YOUR_UNSPLASH_ACCESS_KEY' && 
         UNSPLASH_CONFIG.ACCESS_KEY.length > 0;
};

// Helper function to get search query for a season
export const getSeasonalQuery = (season: 'spring' | 'summer' | 'autumn' | 'winter'): string => {
  return UNSPLASH_CONFIG.SEASONAL_QUERIES[season] || 'garden nature landscape';
};
