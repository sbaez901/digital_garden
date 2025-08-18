import React, { useState, useEffect } from 'react';
import { ImageService, UnsplashImage } from '../services/imageService';
import { isUnsplashConfigured } from '../config/unsplash';

interface UnsplashDemoProps {
  currentSeason: 'spring' | 'summer' | 'autumn' | 'winter';
}

const UnsplashDemo: React.FC<UnsplashDemoProps> = ({ currentSeason }) => {
  const [images, setImages] = useState<(UnsplashImage | string)[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<UnsplashImage | string | null>(null);

  const fetchImages = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`🌱 Fetching ${currentSeason} images...`);
      const seasonalImages = await ImageService.fetchSeasonalImages(currentSeason);
      setImages(seasonalImages);
      console.log(`✅ Loaded ${seasonalImages.length} images for ${currentSeason}`);
    } catch (err) {
      console.error('❌ Error fetching images:', err);
      setError('Failed to fetch images. Using local fallbacks.');
      // Fallback to local images
      const localImages = ImageService['getLocalFallbackImages'](currentSeason);
      setImages(localImages);
    } finally {
      setIsLoading(false);
    }
  };

  const getRandomImage = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const randomImage = await ImageService.getRandomSeasonalImage(currentSeason);
      setSelectedImage(randomImage);
      console.log('🎲 Random image selected:', randomImage);
    } catch (err) {
      console.error('❌ Error getting random image:', err);
      setError('Failed to get random image.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, [currentSeason]);

  const isConfigured = isUnsplashConfigured();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
        🌱 Unsplash API Demo - {currentSeason.charAt(0).toUpperCase() + currentSeason.slice(1)}
      </h3>
      
      {/* API Status */}
      <div className="mb-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
        <div className="flex items-center gap-2 mb-2">
          <span className={`w-3 h-3 rounded-full ${isConfigured ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
          <span className="text-sm font-medium">
            {isConfigured ? '✅ API Configured' : '⚠️ API Not Configured'}
          </span>
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          {isConfigured 
            ? 'Unsplash API is ready to fetch high-quality seasonal images!'
            : 'Get your free API key from https://unsplash.com/developers to enable live images.'
          }
        </p>
      </div>

      {/* Controls */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={fetchImages}
          disabled={isLoading}
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-400 text-white rounded-lg text-sm font-medium transition-colors"
        >
          {isLoading ? '🔄 Loading...' : '🔄 Refresh Images'}
        </button>
        <button
          onClick={getRandomImage}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg text-sm font-medium transition-colors"
        >
          🎲 Random Image
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Random Image Display */}
      {selectedImage && (
        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">🎲 Selected Random Image:</h4>
          <div className="flex items-center gap-3">
            <img 
              src={ImageService.getImageUrl(selectedImage)} 
              alt={ImageService.getImageAlt(selectedImage)}
              className="w-16 h-16 object-cover rounded-lg"
            />
            <div>
              <p className="text-sm text-gray-800 dark:text-gray-200">
                {ImageService.isUnsplashImage(selectedImage) ? (
                  <>
                    <span className="font-medium">📸 Unsplash Image</span>
                    <br />
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      by {selectedImage.photographer}
                    </span>
                  </>
                ) : (
                  <span className="font-medium">🏠 Local Image</span>
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Image Grid */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">
          📸 Available Images ({images.length})
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <img 
                src={ImageService.getImageUrl(image)} 
                alt={ImageService.getImageAlt(image)}
                className="w-full h-20 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => setSelectedImage(image)}
              />
              <div className="absolute top-1 right-1">
                {ImageService.isUnsplashImage(image) ? (
                  <span className="text-xs bg-blue-500 text-white px-1 py-0.5 rounded">API</span>
                ) : (
                  <span className="text-xs bg-gray-500 text-white px-1 py-0.5 rounded">Local</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Image Details */}
      {selectedImage && (
        <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">📋 Image Details:</h4>
          <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
            {ImageService.isUnsplashImage(selectedImage) ? (
              <>
                <p><strong>ID:</strong> {selectedImage.id}</p>
                <p><strong>Photographer:</strong> {selectedImage.photographer}</p>
                <p><strong>Alt Text:</strong> {selectedImage.alt}</p>
                <p><strong>Source:</strong> Unsplash API</p>
                <a 
                  href={selectedImage.photographerUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  View Photographer Profile →
                </a>
              </>
            ) : (
              <>
                <p><strong>Path:</strong> {selectedImage}</p>
                <p><strong>Source:</strong> Local Image</p>
                <p><strong>Alt Text:</strong> {ImageService.getImageAlt(selectedImage)}</p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UnsplashDemo;
