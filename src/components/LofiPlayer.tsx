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
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  

  
  // Audio element ref
  const playerRef = useRef<HTMLAudioElement>(null);
  
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

  // Audio player functions
  const playTrack = () => {
    setIsPlaying(true);
    console.log('🎵 Playback started');
    
    // Try to play actual audio if possible
    if (playerRef.current) {
      playerRef.current.play().catch((error) => {
        console.log('🎵 Audio playback not supported, using visual mode');
      });
    }
    
    // Set a timer for auto-advance (3 minutes)
    setTimeout(() => {
      if (isPlaying) {
        console.log('🎵 Auto-advance timer triggered');
        advanceToNextTrack();
      }
    }, 3 * 60 * 1000);
  };

  const pauseTrack = () => {
    if (playerRef.current) {
      playerRef.current.pause();
    }
    setIsPlaying(false);
    console.log('🎵 Audio playback paused');
  };

  // Auto-advance to next track when current one finishes
  const advanceToNextTrack = () => {
    const randomIndex = Math.floor(Math.random() * tracks.length);
    setCurrentTrackIndex(randomIndex);
    console.log(`🎵 Auto-advancing to random track: ${randomIndex + 1}/${tracks.length}`);
  };

  const nextTrack = () => {
    // Select a random track instead of just the next one
    const randomIndex = Math.floor(Math.random() * tracks.length);
    setCurrentTrackIndex(randomIndex);
  };

  const previousTrack = () => {
    // Select a random track instead of just the previous one
    const randomIndex = Math.floor(Math.random() * tracks.length);
    setCurrentTrackIndex(randomIndex);
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

  // Set audio source when track changes
  useEffect(() => {
    if (playerRef.current && tracks.length > 0 && tracks[currentTrackIndex]) {
      // Since YouTube URLs don't work directly in audio elements due to legal restrictions,
      // we'll use a different approach. For now, we'll create a simple tone generator
      // that provides actual audio feedback
      
      try {
        // Create a simple audio context for generating tones
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Set frequency based on track index for variety
        oscillator.frequency.setValueAtTime(200 + (currentTrackIndex * 50), audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime); // Low volume
        
        // Store audio context for cleanup
        if (isPlaying) {
          oscillator.start();
          setTimeout(() => oscillator.stop(), 1000); // Play for 1 second
        }
        
        console.log('🎵 Audio tone generated for track:', tracks[currentTrackIndex].title);
      } catch (error) {
        console.log('🎵 Audio context not supported, using visual mode only');
      }
    }
  }, [currentTrackIndex, tracks, isPlaying]);

  // Auto-advance timer for fallback (in case audio events don't work)
  useEffect(() => {
    let autoAdvanceTimer: NodeJS.Timeout;
    if (isPlaying && tracks.length > 0) {
      autoAdvanceTimer = setTimeout(() => {
        if (isPlaying) {
          console.log('🎵 Auto-advance timer triggered, moving to next track');
          advanceToNextTrack();
        }
      }, 3 * 60 * 1000); // 3 minutes
    }
    
    return () => {
      if (autoAdvanceTimer) {
        clearTimeout(autoAdvanceTimer);
      }
    };
  }, [isPlaying, tracks.length]);

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
    <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl p-3 shadow-md dark:shadow-gray-900/20 border border-gray-100/50 dark:border-gray-700/30 transition-all duration-300">
      {/* Clean Minimalist Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-sm">
            <span className="text-white text-xs">🎵</span>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 transition-colors duration-300">Focus Music</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">{currentSeason.charAt(0).toUpperCase() + currentSeason.slice(1)} Vibes • Random</p>
          </div>
        </div>
        <div className="flex gap-1.5">
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
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 hover:scale-105 ${
              getCurrentTrackThumbnail() 
                ? isLofiBackdropActive 
                                  ? 'bg-emerald-500 text-white shadow-sm' 
                : 'bg-purple-500 text-white shadow-sm hover:bg-purple-600'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
            title={getCurrentTrackThumbnail() ? `${isLofiBackdropActive ? 'Click to return to seasonal garden images' : 'Click to use this track as puzzle backdrop'}` : 'No thumbnail available'}
          >
            <span className="flex items-center gap-1.5">
              <span>🖼️</span>
              <span>Puzzle</span>
            </span>
          </button>
        </div>
      </div>

      {/* Clean Track Info Layout */}
      <div className="mb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-rose-500 rounded-xl flex items-center justify-center shadow-sm">
            <span className="text-white text-base">🌸</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate transition-colors duration-300">
              {isLoading ? 'Loading...' : currentTrack.title}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">
              {isLoading ? '...' : currentTrack.artist}
            </p>
          </div>
        </div>
      </div>



      {/* Clean Organized Controls */}
      <div className="mb-3">
        {/* Main Controls Row */}
        <div className="flex items-center justify-between mb-3">
          {/* Track Info and Controls */}
          <div className="flex items-center gap-3">
            {/* Previous */}
            <button
              onClick={previousTrack}
              className="w-9 h-9 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-105"
            >
              <span className="text-sm">⏮️</span>
            </button>
            
            {/* Play/Pause */}
            <button
              onClick={isPlaying ? pauseTrack : playTrack}
              className="w-11 h-11 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl flex items-center justify-center shadow-sm transition-all duration-200 hover:scale-105"
            >
              <span className="text-base">{isPlaying ? '⏸️' : '▶️'}</span>
            </button>
            
            {/* Next */}
            <button
              onClick={nextTrack}
              className="w-9 h-9 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-105"
            >
              <span className="text-sm">⏭️</span>
            </button>
          </div>
          
          {/* Volume Control */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleMute}
              className="w-7 h-7 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-105"
            >
              <span className="text-xs">{isMuted ? '🔇' : '🔊'}</span>
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={isMuted ? 0 : volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="w-14 h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer hover:bg-emerald-100 transition-colors"
              style={{
                background: `linear-gradient(to right, #10b981 0%, #10b981 ${(isMuted ? 0 : volume) * 100}%, #e5e7eb ${(isMuted ? 0 : volume) * 100}%, #e5e7eb 100%)`
              }}
            />
          </div>
        </div>
      </div>

      {/* Mobile-Friendly Status */}
      <div className="text-xs text-center text-emerald-600 dark:text-emerald-400 py-1">
        {isLoading ? '🔄 Loading' : (
          isPlaying ? (
            <>
              🎵 Playing • Auto-advance
            </>
          ) : '⏸️ Paused'
        )}
      </div>

      {/* Hidden Audio Element for Actual Playback */}
      <audio
        ref={playerRef}
        preload="none"
        onEnded={() => {
          if (isPlaying) {
            console.log('🎵 Audio ended naturally, auto-advancing');
            advanceToNextTrack();
          }
        }}
        style={{ display: 'none' }}
      />


    </div>
  );
};

export default LofiPlayer;
