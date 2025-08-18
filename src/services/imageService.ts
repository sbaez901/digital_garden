import { UNSPLASH_CONFIG, isUnsplashConfigured, getSeasonalQuery } from '../config/unsplash';

export interface UnsplashImage {
  id: string;
  url: string;
  thumb: string;
  alt: string;
  photographer: string;
  photographerUrl: string;
  downloadUrl: string;
}

export class ImageService {

  // Fallback local images in case API fails
  private static readonly LOCAL_FALLBACK_IMAGES = {
    spring: [
      '/images/spring/2151979634.jpg',
      '/images/spring/Copilot_20250815_213440.png',
      '/images/spring/Aug 15, 2025, 09_28_19 PM.png',
      '/images/spring/Spring Garden Serenity.png'
    ],
    summer: [
      '/images/summer/12690066_5024465.jpg',
      '/images/summer/38892778_8684227.jpg',
      '/images/summer/14666573_5487691.jpg',
      '/images/summer/38680622_8658334.jpg',
      '/images/summer/2151464672.jpg',
      '/images/summer/40129509_8728381.jpg',
      '/images/summer/49664024_9210295.jpg'
    ],
    autumn: [
      '/images/autumn/20282241_6241477.jpg',
      '/images/autumn/20547571_6261886.jpg',
      '/images/autumn/20547574_6261887.jpg',
      '/images/autumn/9259712_4103455.jpg',
      '/images/autumn/16390915_5752424.jpg',
      '/images/autumn/16391197_5735750.jpg',
      '/images/autumn/cozy-autumn-scene-house-path-flowers.jpg',
      '/images/autumn/10100663.jpg'
    ],
    winter: [
      '/images/winter/10669206_4531704.jpg',
      '/images/winter/33434512_8041323.jpg',
      '/images/winter/10848949_4564205.jpg',
      '/images/winter/75862082_9838625.jpg',
      '/images/winter/34284850_8111438.jpg',
      '/images/winter/78136140_9874710.jpg',
      '/images/winter/3d-rendering-illustration-botanic-garden (1).jpg',
      '/images/winter/10501569_4484483.jpg',
      '/images/winter/33734518_8081323.jpg',
      '/images/winter/3925076_12866.jpg'
    ]
  };

  /**
   * Fetch seasonal images from Unsplash API
   */
  static async fetchSeasonalImages(season: 'spring' | 'summer' | 'autumn' | 'winter'): Promise<UnsplashImage[]> {
    try {
      console.log(`🌱 Fetching ${season} images from Unsplash...`);
      
      // Check if we have an API key
      if (!isUnsplashConfigured()) {
        console.log('⚠️ No Unsplash API key found, using local fallback images');
        return this.getLocalFallbackImages(season);
      }

      const query = getSeasonalQuery(season);
      const url = `${UNSPLASH_CONFIG.BASE_URL}${UNSPLASH_CONFIG.SEARCH_ENDPOINT}?query=${encodeURIComponent(query)}&per_page=${UNSPLASH_CONFIG.SEARCH_PARAMS.PER_PAGE}&orientation=${UNSPLASH_CONFIG.SEARCH_PARAMS.ORIENTATION}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Client-ID ${UNSPLASH_CONFIG.ACCESS_KEY}`,
          'Accept-Version': 'v1'
        }
      });

      if (!response.ok) {
        throw new Error(`Unsplash API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`✅ Fetched ${data.results?.length || 0} images from Unsplash for ${season}`);

      if (!data.results || data.results.length === 0) {
        throw new Error('No images found in Unsplash response');
      }

      // Transform Unsplash data to our format
      const images: UnsplashImage[] = data.results.map((photo: any) => ({
        id: photo.id,
        url: photo.urls.regular,
        thumb: photo.urls.thumb,
        alt: photo.alt_description || `${season} garden image`,
        photographer: photo.user.name,
        photographerUrl: photo.user.links.html,
        downloadUrl: photo.links.download
      }));

      return images;

    } catch (error) {
      console.error(`❌ Error fetching ${season} images from Unsplash:`, error);
      console.log(`🔄 Falling back to local images for ${season}`);
      return this.getLocalFallbackImages(season);
    }
  }

  /**
   * Get a random seasonal image (either from Unsplash or local fallback)
   */
  static async getRandomSeasonalImage(season: 'spring' | 'summer' | 'autumn' | 'winter'): Promise<UnsplashImage | string> {
    try {
      const images = await this.fetchSeasonalImages(season);
      
      if (images.length > 0) {
        // Return a random Unsplash image
        const randomIndex = Math.floor(Math.random() * images.length);
        return images[randomIndex];
      } else {
        // Fallback to local image
        const localImages = this.getLocalFallbackImages(season);
        const randomIndex = Math.floor(Math.random() * localImages.length);
        return localImages[randomIndex];
      }
    } catch (error) {
      console.error(`❌ Error getting random ${season} image:`, error);
      // Final fallback to local image
      const localImages = this.getLocalFallbackImages(season);
      const randomIndex = Math.floor(Math.random() * localImages.length);
      return localImages[randomIndex];
    }
  }

  /**
   * Get local fallback images for a season
   */
  private static getLocalFallbackImages(season: 'spring' | 'summer' | 'autumn' | 'winter'): string[] {
    return this.LOCAL_FALLBACK_IMAGES[season] || [];
  }

  /**
   * Check if an image is from Unsplash (has id property)
   */
  static isUnsplashImage(image: UnsplashImage | string): image is UnsplashImage {
    return typeof image === 'object' && image !== null && 'id' in image;
  }

  /**
   * Get image URL (works for both Unsplash and local images)
   */
  static getImageUrl(image: UnsplashImage | string): string {
    if (this.isUnsplashImage(image)) {
      return image.url;
    }
    return image; // Local image path
  }

  /**
   * Get image thumbnail URL
   */
  static getImageThumb(image: UnsplashImage | string): string {
    if (this.isUnsplashImage(image)) {
      return image.thumb;
    }
    return image; // Local image path
  }

  /**
   * Get image alt text
   */
  static getImageAlt(image: UnsplashImage | string): string {
    if (this.isUnsplashImage(image)) {
      return image.alt;
    }
    return 'Seasonal garden image'; // Default alt for local images
  }
}
