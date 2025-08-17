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
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&videoCategoryId=10&maxResults=40&key=${API_KEY}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch tracks');
      }
      
      const data = await response.json();
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
      
      setTracks(fetchedTracks);
      // Randomly select first track for variety using time + season + puzzle version for more randomness
      const timeSeed = Date.now();
      const seasonSeed = season.charCodeAt(0) + season.charCodeAt(1);
      const puzzleVersion = Math.floor(Math.random() * 1000); // Add extra randomness
      const combinedSeed = timeSeed + seasonSeed + puzzleVersion;
      const randomIndex = Math.floor((combinedSeed % Math.min(fetchedTracks.length, 40)));
      setCurrentTrackIndex(randomIndex);
      console.log(`🎲 Random track selected: ${randomIndex + 1}/${fetchedTracks.length} for ${season}`);
    } catch (error) {
      console.error('Error fetching lofi tracks:', error);
      // Fallback to default tracks if API fails
      setTracks([
        { id: '1', title: 'Lofi Vibes', artist: 'Lofi Garden', duration: '3:00', thumbnail: '🎵', videoId: 'jfKfPfyJRdk' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const currentTrack = tracks[currentTrackIndex] || { id: '1', title: 'Loading...', artist: '...', duration: '0:00', thumbnail: '🎵', videoId: 'jfKfPfyJRdk' };

  // Function to get current track's high-res thumbnail for puzzle
  const getCurrentTrackThumbnail = (): string | null => {
    if (tracks.length > 0 && tracks[currentTrackIndex]) {
      return tracks[currentTrackIndex].highResThumbnail || null;
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

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-3 shadow-lg border border-emerald-200/50 hover:shadow-xl transition-all duration-300">
      {/* Ultra-Compact Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center shadow-sm">
            <span className="text-white text-sm">🎧</span>
          </div>
          <div>
            <h3 className="text-xs font-bold text-gray-800 tracking-wide">MUSIC PLAYER</h3>
            <p className="text-xs text-emerald-600 font-medium">{currentSeason.charAt(0).toUpperCase() + currentSeason.slice(1)} Vibes • {tracks.length} Tracks</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowPlaylist(!showPlaylist)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 hover:scale-105 ${
              showPlaylist 
                ? 'bg-emerald-100 text-emerald-700 border border-emerald-200 shadow-sm' 
                : 'bg-blue-100 text-blue-600 hover:bg-blue-200 hover:text-blue-700'
            }`}
          >
            {showPlaylist ? '📁 Playlist' : '🎵 Tracks'}
          </button>
          <button
            onClick={() => {
              const thumbnail = getCurrentTrackThumbnail();
              if (thumbnail) {
                // Emit custom event for puzzle system to use this thumbnail
                // If lofi backdrop is already active, this will toggle it off
                window.dispatchEvent(new CustomEvent('useLofiThumbnail', { 
                  detail: { thumbnail, trackTitle: currentTrack.title, toggle: true } 
                }));
              }
            }}
            disabled={!getCurrentTrackThumbnail()}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 hover:scale-105 ${
              getCurrentTrackThumbnail() 
                ? isLofiBackdropActive 
                  ? 'bg-emerald-100 text-emerald-700 border border-emerald-200 shadow-sm' 
                  : 'bg-purple-100 text-purple-700 hover:bg-purple-200 hover:text-purple-800'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
            title={getCurrentTrackThumbnail() ? `Use "${currentTrack.title}" backdrop as puzzle` : 'No thumbnail available'}
          >
            {isLofiBackdropActive ? '🖼️ Active' : '🖼️ Puzzle'}
          </button>
        </div>
      </div>

                         {/* Ultra-Compact Track Info */}
      <div className="mb-2">
        <div className="flex items-center gap-2 p-2.5 bg-gradient-to-r from-slate-50/90 to-gray-50/90 rounded-lg border border-slate-200/60">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm">🎼</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-800 truncate">
              {isLoading ? 'Loading...' : currentTrack.title}
            </p>
            <p className="text-xs text-purple-600 truncate">
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
            className="w-9 h-9 bg-blue-100 hover:bg-blue-200 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
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
            className="w-9 h-9 bg-blue-100 hover:bg-blue-200 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
          >
            <span className="text-sm">⏭️</span>
          </button>
        </div>
        
        {/* Volume Row */}
        <div className="flex items-center gap-3 justify-center">
          <button
            onClick={toggleMute}
            className="w-7 h-7 bg-orange-100 hover:bg-orange-200 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
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
               <div className="border-t border-emerald-100 pt-1.5">
                 <h4 className="font-medium text-emerald-800 mb-1.5 text-xs flex items-center gap-1">
                   <span>📁</span> Tracks
                 </h4>
                 <div className="space-y-0.5 max-h-16 overflow-y-auto">
                   {isLoading ? (
                     <div className="text-xs text-gray-500 text-center py-1.5 bg-gray-50 rounded-md">🔄 Loading...</div>
                   ) : (
                     tracks.map((track, index) => (
                       <div
                         key={track.id}
                         onClick={() => setCurrentTrackIndex(index)}
                         className={`flex items-center gap-2 p-1 rounded-md cursor-pointer transition-all duration-200 text-xs ${
                           index === currentTrackIndex
                             ? 'bg-emerald-100 text-emerald-800'
                             : 'hover:bg-emerald-50'
                         }`}
                       >
                         <span className="text-xs">🎵</span>
                         <div className="flex-1 min-w-0">
                           <p className="font-medium truncate text-xs">{track.title}</p>
                         </div>
                         {index === currentTrackIndex && (
                           <span className="text-emerald-600 text-xs">▶️</span>
                         )}
                       </div>
                     ))
                   )}
                 </div>
               </div>
             )}

                   {/* Ultra-Compact Status */}
             <div className="text-xs text-center text-emerald-600 mt-1.5 py-1 bg-emerald-50/50 rounded-md border border-emerald-100/30 font-medium">
               {isLoading ? '🔄 Loading' : (isPlaying ? '🎵 Playing' : '⏸️ Paused')}
             </div>
    </div>
  );
};

export default LofiPlayer;
