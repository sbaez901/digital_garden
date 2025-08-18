import React, { useState, useEffect, useRef } from 'react';

interface Track {
  id: string;
  title: string;
  artist: string;
  duration: string;
  thumbnail: string;
  videoId: string;
  viewCount?: string;
  highResThumbnail?: string; // High-resolution thumbnail for puzzle
}

interface LofiPlayerProps {
  currentSeason: 'spring' | 'summer' | 'autumn' | 'winter';
  isLofiBackdropActive?: boolean;
}

const LofiPlayer: React.FC<LofiPlayerProps> = ({ currentSeason, isLofiBackdropActive = false }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // YouTube iframe ref
  const playerRef = useRef<HTMLIFrameElement>(null);
  
  // YouTube API Key
  const API_KEY = 'AIzaSyB_sa4FBPqt8_lbDtcqJeIVvN8kNFray-c';
  
  // Seasonal lofi search queries
  const seasonalQueries = {
    spring: 'lofi spring cherry blossoms peaceful',
    summer: 'lofi summer breeze relaxing',
    autumn: 'lofi autumn leaves cozy',
    winter: 'lofi winter snow peaceful'
  };

  // Fetch lofi tracks from YouTube API
  const fetchLofiTracks = async (season: string) => {
    try {
      setIsLoading(true);
      const query = seasonalQueries[season as keyof typeof seasonalQueries];
      
      console.log(`🎵 Fetching tracks for ${season} with query: ${query}`);
      
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&videoCategoryId=10&maxResults=50&key=${API_KEY}`
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch tracks: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log(`🎵 YouTube API response:`, data);
      
      if (!data.items || data.items.length === 0) {
        throw new Error('No tracks found in API response');
      }
      
      const fetchedTracks: Track[] = data.items.map((item: any, index: number) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        artist: item.snippet.channelTitle,
        duration: '3:00', // Default duration
        thumbnail: item.snippet.thumbnails.default.url,
        videoId: item.id.videoId,
        viewCount: '1M+', // Default view count
        highResThumbnail: item.snippet.thumbnails.maxres?.url || item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default.url
      }));
      
      console.log(`🎵 Successfully fetched ${fetchedTracks.length} tracks for ${season}`);
      setTracks(fetchedTracks);
      console.log(`🎵 Tracks loaded successfully:`, fetchedTracks.length, 'tracks');
      
      // Randomly select first track for variety using time + season + puzzle version for more randomness
      const timeSeed = Date.now();
      const seasonSeed = season.charCodeAt(0) + season.charCodeAt(1);
      const puzzleVersion = Math.floor(Math.random() * 1000); // Add extra randomness
      const combinedSeed = timeSeed + seasonSeed + puzzleVersion;
      const randomIndex = Math.floor((combinedSeed % Math.min(fetchedTracks.length, 50)));
      setCurrentTrackIndex(randomIndex);
      console.log(`🎲 Random track selected: ${randomIndex + 1}/${fetchedTracks.length} for ${season}`);
      
    } catch (error) {
      console.error('Error fetching lofi tracks:', error);
      console.log('🎵 Falling back to default tracks...');
      
      // Enhanced fallback tracks - create a variety of tracks to ensure we have 50+ tracks
      const fallbackTracks: Track[] = [];
      
      // Create seasonal fallback tracks
      const seasonFallbacks = {
        spring: [
          { title: 'Cherry Blossom Dreams', artist: 'Spring Lofi', videoId: 'jfKfPfyJRdk' },
          { title: 'Pink Petals Falling', artist: 'Garden Vibes', videoId: 'DWcJFNfaw9c' },
          { title: 'Morning Dew', artist: 'Nature Sounds', videoId: '7NOSDKb0HlU' },
          { title: 'Blossom Breeze', artist: 'Seasonal Lofi', videoId: 'qt_urUa424w' },
          { title: 'Spring Awakening', artist: 'Lofi Garden', videoId: 'lTRiuFIWV54' }
        ],
        summer: [
          { title: 'Summer Breeze', artist: 'Lofi Vibes', videoId: 'jfKfPfyJRdk' },
          { title: 'Lavender Fields', artist: 'Summer Lofi', videoId: 'DWcJFNfaw9c' },
          { title: 'Warm Sunlight', artist: 'Seasonal Sounds', videoId: '7NOSDKb0HlU' },
          { title: 'Ocean Waves', artist: 'Nature Lofi', videoId: 'qt_urUa424w' },
          { title: 'Summer Nights', artist: 'Garden Vibes', videoId: 'lTRiuFIWV54' }
        ],
        autumn: [
          { title: 'Autumn Leaves', artist: 'Fall Lofi', videoId: 'jfKfPfyJRdk' },
          { title: 'Maple Memories', artist: 'Seasonal Vibes', videoId: 'DWcJFNfaw9c' },
          { title: 'Cozy Afternoon', artist: 'Autumn Sounds', videoId: '7NOSDKb0HlU' },
          { title: 'Golden Hour', artist: 'Fall Garden', videoId: 'qt_urUa424w' },
          { title: 'Harvest Time', artist: 'Lofi Nature', videoId: 'lTRiuFIWV54' }
        ],
        winter: [
          { title: 'Snowfall', artist: 'Winter Lofi', videoId: 'jfKfPfyJRdk' },
          { title: 'Frozen Dreams', artist: 'Winter Vibes', videoId: 'DWcJFNfaw9c' },
          { title: 'Ice Crystals', artist: 'Seasonal Sounds', videoId: '7NOSDKb0HlU' },
          { title: 'Winter Solstice', artist: 'Cold Garden', videoId: 'qt_urUa424w' },
          { title: 'Frosty Morning', artist: 'Lofi Winter', videoId: 'lTRiuFIWV54' }
        ]
      };
      
      const currentSeasonFallbacks = seasonFallbacks[season as keyof typeof seasonFallbacks] || seasonFallbacks.summer;
      
      // Generate 50 tracks by repeating and varying the fallback tracks
      for (let i = 0; i < 50; i++) {
        const baseTrack = currentSeasonFallbacks[i % currentSeasonFallbacks.length];
        fallbackTracks.push({
          id: `fallback-${i}`,
          title: `${baseTrack.title} ${Math.floor(i / currentSeasonFallbacks.length) + 1}`,
          artist: baseTrack.artist,
          duration: '3:00',
          thumbnail: '🎵',
          videoId: baseTrack.videoId,
          viewCount: '1M+',
          highResThumbnail: `https://img.youtube.com/vi/${baseTrack.videoId}/maxresdefault.jpg`
        });
      }
      
      setTracks(fallbackTracks);
      setCurrentTrackIndex(0);
      console.log(`🎵 Using ${fallbackTracks.length} fallback tracks for ${season}`);
      console.log(`🎵 Fallback tracks loaded successfully:`, fallbackTracks.length, 'tracks');
      
    } finally {
      setIsLoading(false);
    }
  };

  const currentTrack = tracks[currentTrackIndex] || { id: '1', title: 'Loading...', artist: '...', duration: '0:00', thumbnail: '🎵', videoId: 'jfKfPfyJRdk' };

  // Function to get current track's high-res thumbnail for puzzle
  const getCurrentTrackThumbnail = (): string | null => {
    if (tracks.length > 0 && tracks[currentTrackIndex]) {
      const track = tracks[currentTrackIndex];
      // Try to get high-res thumbnail, fallback to regular thumbnail, or generate YouTube thumbnail
      if (track.highResThumbnail) {
        return track.highResThumbnail;
      } else if (track.thumbnail && track.thumbnail !== '🎵') {
        return track.thumbnail;
      } else if (track.videoId) {
        // Generate YouTube thumbnail URL as fallback
        return `https://img.youtube.com/vi/${track.videoId}/maxresdefault.jpg`;
      }
    }
    return null;
  };

  // YouTube player functions
  const playTrack = () => {
    setIsPlaying(true);
    // YouTube iframe will handle the actual playback
  };

  const pauseTrack = () => {
    setIsPlaying(false);
    // YouTube iframe will handle the actual pause
  };

  const nextTrack = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % tracks.length);
  };

  const previousTrack = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + tracks.length) % tracks.length);
  };

  // Emit track change event for dynamic backdrop updates
  useEffect(() => {
    if (tracks.length > 0 && tracks[currentTrackIndex]) {
      const currentTrack = tracks[currentTrackIndex];
      window.dispatchEvent(new CustomEvent('trackChanged', {
        detail: { 
          thumbnail: currentTrack.highResThumbnail, 
          trackTitle: currentTrack.title 
        }
      }));
    }
  }, [currentTrackIndex, tracks]);

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  // Fetch tracks when season changes
  useEffect(() => {
    fetchLofiTracks(currentSeason);
  }, [currentSeason]);

  // Debug: Log current state
  useEffect(() => {
    console.log(`🎵 LofiPlayer state:`, {
      tracksLength: tracks.length,
      currentTrackIndex,
      isLofiBackdropActive,
      currentSeason,
      isLoading
    });
  }, [tracks.length, currentTrackIndex, isLofiBackdropActive, currentSeason, isLoading]);

  return (
    <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl p-3 shadow-lg dark:shadow-gray-900/50 border border-emerald-200/50 dark:border-emerald-700/50 hover:shadow-xl transition-all duration-300">
      {/* Ultra-Compact Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center shadow-sm">
            <span className="text-white text-sm">🎧</span>
          </div>
          <div>
            <h3 className="text-xs font-bold text-gray-800 dark:text-gray-100 tracking-wide transition-colors duration-300">MUSIC PLAYER</h3>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium transition-colors duration-300">{currentSeason.charAt(0).toUpperCase() + currentSeason.slice(1)} Vibes</p>
          </div>
        </div>
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setShowPlaylist(!showPlaylist)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 hover:scale-105 ${
              showPlaylist 
                ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700 shadow-sm' 
                : 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-800 hover:text-blue-700 dark:hover:text-blue-300'
            }`}
          >
            <span>{showPlaylist ? '📁' : '🎵'}</span>
            <span>{showPlaylist ? 'Playlist' : 'Tracks'}</span>
          </button>
          <button
            onClick={() => {
              const thumbnail = getCurrentTrackThumbnail();
              console.log(`🎵 Puzzle button clicked:`, { 
                thumbnail, 
                trackTitle: currentTrack.title, 
                isLofiBackdropActive,
                tracksLength: tracks.length,
                currentTrackIndex,
                currentTrack: tracks[currentTrackIndex]
              });
              
              if (thumbnail) {
                // Emit custom event for puzzle system to use this thumbnail
                // Toggle between lofi backdrop and seasonal backdrop
                const shouldToggleOn = !isLofiBackdropActive;
                window.dispatchEvent(new CustomEvent('useLofiThumbnail', { 
                  detail: { thumbnail, trackTitle: currentTrack.title, toggle: shouldToggleOn } 
                }));
                console.log(`🎵 Puzzle toggle clicked: ${shouldToggleOn ? 'turning on' : 'turning off'} lofi backdrop`);
              } else {
                console.log(`🎵 No thumbnail available for puzzle toggle`);
              }
            }}
            disabled={tracks.length === 0 || isLoading}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 hover:scale-105 ${
              getCurrentTrackThumbnail() 
                ? isLofiBackdropActive 
                                  ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700 shadow-sm' 
                : 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-800 hover:text-purple-800 dark:hover:text-purple-200'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
            title={getCurrentTrackThumbnail() ? `${isLofiBackdropActive ? 'Click to return to seasonal garden images' : 'Click to use this track as puzzle backdrop'}` : 'No thumbnail available'}
          >
            <span>{isLofiBackdropActive ? '🖼️' : '🖼️'}</span>
            <span>{isLofiBackdropActive ? 'Active' : 'Puzzle'}</span>
          </button>
        </div>
      </div>

                         {/* Ultra-Compact Track Info */}
      <div className="mb-2">
        <div className="flex items-center justify-center gap-2 p-2.5 bg-gradient-to-r from-slate-50/90 to-gray-50/90 dark:from-slate-800/90 dark:to-gray-800/90 rounded-lg border border-slate-200/60 dark:border-slate-700/60 transition-colors duration-300">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm">🎼</span>
          </div>
          <div className="text-center">
            <p className="text-xs font-semibold text-gray-800 dark:text-gray-100 transition-colors duration-300">
              {isLoading ? 'Loading...' : currentTrack.title}
            </p>
            <p className="text-xs text-purple-600 dark:text-purple-400 transition-colors duration-300">
              {isLoading ? '...' : currentTrack.artist}
            </p>
          </div>
        </div>
      </div>

                   {/* YouTube Player (Hidden) */}
             <div className="hidden">
               <iframe
                 ref={playerRef}
                 width="0"
                 height="0"
                 src={`https://www.youtube.com/embed/${currentTrack.videoId}?autoplay=${isPlaying ? 1 : 0}&controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&cc_load_policy=0&fs=0&loop=1&playlist=${currentTrack.videoId}&mute=${isMuted ? 1 : 0}`}
                 title="Lofi Music Player"
                 allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
               />
             </div>

      {/* Ultra-Compact Modern Controls */}
      <div className="mb-2">
        {/* Main Controls Row */}
        <div className="flex items-center justify-center gap-3 mb-2">
          {/* Previous */}
          <button
            onClick={previousTrack}
            className="w-9 h-9 bg-blue-100 dark:bg-blue-900/50 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
          >
            <span className="text-sm">⏮️</span>
          </button>
          
          {/* Play/Pause */}
          <button
            onClick={isPlaying ? pauseTrack : playTrack}
            className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-xl flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200 hover:scale-110"
          >
            <span className="text-lg">{isPlaying ? '⏸️' : '▶️'}</span>
          </button>
          
          {/* Next */}
          <button
            onClick={nextTrack}
            className="w-9 h-9 bg-blue-100 dark:bg-blue-900/50 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
          >
            <span className="text-sm">⏭️</span>
          </button>
        </div>
        
        {/* Volume Row */}
        <div className="flex items-center gap-3 justify-center">
          <button
            onClick={toggleMute}
            className="w-7 h-7 bg-orange-100 dark:bg-orange-900/50 hover:bg-orange-200 dark:hover:bg-orange-800 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
          >
            <span className="text-sm">{isMuted ? '🔇' : '🔊'}</span>
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={isMuted ? 0 : volume}
            onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
            className="w-16 h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer hover:bg-emerald-100 transition-colors"
            style={{
              background: `linear-gradient(to right, #10b981 0%, #10b981 ${(isMuted ? 0 : volume) * 100}%, #e5e7eb ${(isMuted ? 0 : volume) * 100}%, #e5e7eb 100%)`
            }}
          />
        </div>
      </div>

                   {/* Ultra-Compact Playlist */}
             {showPlaylist && (
               <div className="border-t border-emerald-100 dark:border-emerald-700 pt-1.5 transition-colors duration-300">
                 <h4 className="font-medium text-emerald-800 dark:text-emerald-200 mb-1.5 text-xs flex items-center gap-1 transition-colors duration-300">
                   <span>📁</span> Tracks
                 </h4>
                 <div className="space-y-0.5 max-h-16 overflow-y-auto">
                   {isLoading ? (
                     <div className="text-xs text-gray-500 dark:text-gray-400 text-center py-1.5 bg-gray-50 dark:bg-gray-700 rounded-md transition-colors duration-300">🔄 Loading...</div>
                   ) : (
                     tracks.map((track, index) => (
                       <div
                         key={track.id}
                         onClick={() => setCurrentTrackIndex(index)}
                         className={`flex items-center gap-2 p-1 rounded-md cursor-pointer transition-all duration-200 text-xs ${
                           index === currentTrackIndex
                             ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200'
                             : 'hover:bg-emerald-50 dark:hover:bg-emerald-900/30'
                         }`}
                       >
                         <span className="text-xs">🎵</span>
                         <div className="flex-1 min-w-0">
                           <p className="font-medium truncate text-xs transition-colors duration-300">{track.title}</p>
                         </div>
                         {index === currentTrackIndex && (
                           <span className="text-emerald-600 dark:text-emerald-400 text-xs transition-colors duration-300">▶️</span>
                         )}
                       </div>
                     ))
                   )}
                 </div>
               </div>
             )}

                   {/* Ultra-Compact Status */}
             <div className="text-xs text-center text-emerald-600 dark:text-emerald-400 mt-1.5 py-1 bg-emerald-50/50 dark:bg-emerald-900/30 rounded-md border border-emerald-100/30 dark:border-emerald-700/30 font-medium transition-colors duration-300">
               {isLoading ? '🔄 Loading' : (isPlaying ? '🎵 Playing' : '⏸️ Paused')}
             </div>
    </div>
  );
};

export default LofiPlayer;
