# 🌱 Unsplash API Integration Setup Guide

## 🚀 What This Gives You

- **Automatic seasonal images** - No more manual uploads!
- **High-quality content** - Professional photos from Unsplash
- **Fresh variety** - Different images every time
- **Fallback system** - Local images if API fails
- **Seasonal themes** - Perfect garden/nature images for each season

## 📋 Prerequisites

1. **Unsplash Developer Account** (Free)
2. **API Access Key** (Free tier: 50 requests/hour, 5,000/month)
3. **React app** (Already have this!)

## 🔑 Step 1: Get Your Unsplash API Key

### 1.1 Sign Up
- Go to [https://unsplash.com/developers](https://unsplash.com/developers)
- Click "Register as a developer"
- Sign in with your Unsplash account (or create one)

### 1.2 Create Application
- Click "New Application"
- Fill in the form:
  - **Application name**: `Digital Garden App`
  - **Description**: `Seasonal garden puzzle game with dynamic images`
  - **What are you building?**: `Web application`
  - **Will your app be open source?**: `Yes` (if applicable)

### 1.3 Get Your Access Key
- After approval, you'll see your **Access Key**
- Copy this key - you'll need it in the next step

## ⚙️ Step 2: Configure Your App

### 2.1 Environment Variable (Recommended)
Create a `.env` file in your project root:

```bash
# .env
REACT_APP_UNSPLASH_ACCESS_KEY=your_actual_access_key_here
```

### 2.2 Direct Configuration (Alternative)
Edit `src/config/unsplash.ts`:

```typescript
export const UNSPLASH_CONFIG = {
  ACCESS_KEY: 'your_actual_access_key_here', // Replace this
  // ... rest of config
};
```

## 🧪 Step 3: Test the Integration

### 3.1 Add Demo Component
The demo component is already created at `src/components/UnsplashDemo.tsx`

### 3.2 Test in Your App
You can temporarily add it to your main App.tsx to test:

```typescript
import UnsplashDemo from './components/UnsplashDemo';

// Add this somewhere in your JSX
<UnsplashDemo currentSeason={currentSeason} />
```

### 3.3 Check Console
Open browser console to see:
- ✅ API connection status
- 🌱 Image fetching progress
- 📸 Number of images loaded
- 🔄 Fallback behavior

## 🎯 Step 4: Integration Points

### 4.1 Replace Static Image Arrays
In your main App.tsx, replace the static image arrays:

```typescript
// OLD: Static arrays
const getSeasonImages = (season: string) => {
  switch (season) {
    case 'spring': return ['/images/spring/...', ...];
    // ...
  }
};

// NEW: Dynamic API calls
import { ImageService } from './services/imageService';

const [seasonalImages, setSeasonalImages] = useState<string[]>([]);

useEffect(() => {
  const loadImages = async () => {
    const images = await ImageService.fetchSeasonalImages(currentSeason);
    const imageUrls = images.map(img => ImageService.getImageUrl(img));
    setSeasonalImages(imageUrls);
  };
  loadImages();
}, [currentSeason]);
```

### 4.2 Update Puzzle System
Update your puzzle component to use the new image service:

```typescript
// In ReactPuzzle.tsx or similar
const [puzzleImage, setPuzzleImage] = useState<string>('');

useEffect(() => {
  const loadPuzzleImage = async () => {
    const randomImage = await ImageService.getRandomSeasonalImage(currentSeason);
    setPuzzleImage(ImageService.getImageUrl(randomImage));
  };
  loadPuzzleImage();
}, [currentSeason]);
```

## 🔧 API Features

### Search Queries
- **Spring**: `spring garden cherry blossoms flowers nature landscape peaceful`
- **Summer**: `summer garden green nature landscape vibrant colorful`
- **Autumn**: `autumn garden fall leaves landscape colors golden`
- **Winter**: `winter garden snow peaceful landscape serene white`

### Image Quality
- **Resolution**: Up to 4K
- **Orientation**: Landscape (optimized for puzzles)
- **Content Filter**: High quality only
- **Per Page**: 20 images per season

## 🚨 Rate Limits & Best Practices

### Free Tier Limits
- **50 requests per hour**
- **5,000 requests per month**
- **Enough for**: ~1,000 seasonal changes per month

### Best Practices
1. **Cache images** - Don't refetch on every render
2. **Use fallbacks** - Local images when API fails
3. **Respect limits** - Don't spam the API
4. **Error handling** - Graceful degradation

## 🐛 Troubleshooting

### Common Issues

#### "API Not Configured"
- ✅ Check your `.env` file
- ✅ Verify the access key is correct
- ✅ Restart your development server

#### "Rate Limit Exceeded"
- ✅ Wait for the hour to reset
- ✅ Check your usage in Unsplash dashboard
- ✅ Use local fallback images

#### "No Images Found"
- ✅ Check your internet connection
- ✅ Verify API key permissions
- ✅ Check console for error details

### Debug Mode
Enable detailed logging in the console:
- Open browser DevTools
- Check Console tab
- Look for 🌱, ✅, ❌, and 🔄 emojis

## 🎉 What You'll See

### Before (Static)
- Same images every time
- Limited variety
- Manual management required

### After (Dynamic)
- Fresh images every season
- Unlimited variety
- Professional quality
- Automatic updates

## 🔮 Next Steps

1. **Test the demo** - Make sure it works
2. **Integrate with puzzle system** - Replace static arrays
3. **Add caching** - Store images locally
4. **Optimize queries** - Fine-tune search terms
5. **Add more APIs** - Pexels, Pixabay fallbacks

## 📞 Support

- **Unsplash API Docs**: [https://unsplash.com/documentation](https://unsplash.com/documentation)
- **Rate Limits**: [https://unsplash.com/documentation#rate-limiting](https://unsplash.com/documentation#rate-limiting)
- **Best Practices**: [https://unsplash.com/documentation#guidelines](https://unsplash.com/documentation#guidelines)

---

**Happy coding! 🌱✨**

Your seasonal garden will now have fresh, beautiful images every time users switch seasons or complete puzzles!
