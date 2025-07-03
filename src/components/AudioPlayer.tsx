import { useState, useRef, useEffect } from "react";
import { Play, Pause } from "lucide-react";
import Button from "./ui/Button";
import Slider from "./ui/Slider";

interface AudioPlayerProps {
  src: string;
  title: string;
  subtitle?: string;
  duration?: number;
  onEnded?: () => void;
}

export default function AudioPlayer({ src, title, subtitle, duration: propDuration, onEnded }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Format time in MM:SS format
  const formatTime = (time: number) => {
    if (!isFinite(time) || isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // Handle play/pause toggle
  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().catch(console.error);
        setIsPlaying(true);
      }
    }
  };

  // Auto-play when component mounts (since user clicked to show the player)
  useEffect(() => {
    const audio = audioRef.current;
    if (audio && duration > 0) {
      // Start playing automatically when the player is shown
      audio.play().catch(console.error);
      setIsPlaying(true);
    }
  }, [duration]); // Trigger when duration is available

  // Handle seeking
  const handleSeek = (value: number[]) => {
    const newTime = value[0];
    if (audioRef.current && isFinite(duration) && duration > 0 && isFinite(newTime)) {
      const clampedTime = Math.max(0, Math.min(duration, newTime));
      audioRef.current.currentTime = clampedTime;
      setCurrentTime(clampedTime);
    }
  };

  // Set up audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => {
      if (audio.currentTime && isFinite(audio.currentTime)) {
        setCurrentTime(audio.currentTime);
      }
    };
    
    const updateDuration = () => {
      if (isFinite(audio.duration) && !isNaN(audio.duration) && audio.duration > 0) {
        setDuration(audio.duration);
      }
    };
    
    const handleLoadedData = () => {
      // Try to get duration from loadeddata event as well
      if (isFinite(audio.duration) && !isNaN(audio.duration) && audio.duration > 0) {
        setDuration(audio.duration);
      }
    };
    
    const handleCanPlay = () => {
      // Final attempt to get duration when audio can play
      if (isFinite(audio.duration) && !isNaN(audio.duration) && audio.duration > 0) {
        setDuration(audio.duration);
      }
    };
    
    const handlePlay = () => {
      setIsPlaying(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      if (onEnded) onEnded();
    };

    const handleError = (e: Event) => {
      console.error('Audio loading error:', e);
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
    };

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("loadeddata", handleLoadedData);
    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("loadeddata", handleLoadedData);
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
    };
  }, [onEnded]);

  // Reset state when src changes
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.pause();
      // Force reload to ensure new src is loaded properly
      audioRef.current.load();
    }
  }, [src]);

  // Use prop duration as fallback when audio doesn't provide duration
  useEffect(() => {
    const checkDurationFallback = () => {
      // If no duration has been set from audio events and we have a prop duration, use it
      if (duration === 0 && propDuration && propDuration > 0) {
        console.log('Using fallback duration from props:', propDuration);
        setDuration(propDuration);
      }
    };

    // Check after a short delay to allow audio events to fire first
    const timer = setTimeout(checkDurationFallback, 1000);
    return () => clearTimeout(timer);
  }, [duration, propDuration]);

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-slate-700/50">
      <div className="space-y-6">
        {/* Audio element */}
        <audio
          ref={audioRef}
          src={src}
          preload="metadata"
          crossOrigin="anonymous"
          onLoadedMetadata={() => {
            const audio = audioRef.current;
            if (audio && isFinite(audio.duration) && audio.duration > 0) {
              console.log('Audio duration detected:', audio.duration);
              setDuration(audio.duration);
            } else {
              console.log('Duration not available in loadedmetadata:', audio?.duration);
            }
          }}
          onCanPlay={() => {
            const audio = audioRef.current;
            console.log('Audio can play - duration:', audio?.duration, 'readyState:', audio?.readyState);
            if (audio && isFinite(audio.duration) && audio.duration > 0) {
              setDuration(audio.duration);
            }
          }}
          onError={(e) => {
            console.error('Audio element error:', e.currentTarget.error);
          }}
        />

        {/* Track info */}
        <div className="text-center">
          <h3 className="font-semibold text-lg text-white mb-1">
            {title}
          </h3>
          {subtitle && <p className="text-sm text-slate-400">{subtitle}</p>}
        </div>

        {/* Progress slider */}
        <div className="space-y-3">
          <Slider
            value={[currentTime]}
            max={duration || 100}
            min={0}
            step={1}
            onValueChange={handleSeek}
            className="w-full"
            disabled={!duration || duration === 0}
          />
          <div className="flex justify-between text-xs text-slate-400">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center">
          <Button
            onClick={togglePlayPause}
            size="lg"
            className="rounded-full w-12 h-12 p-0"
            disabled={!duration || duration === 0}
          >
            {isPlaying ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5 ml-0.5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
