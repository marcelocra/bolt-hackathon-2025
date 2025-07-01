import { useState, useRef, useEffect } from "react";
import { Play, Pause } from "lucide-react";
import { Button, Slider } from "./ui";

export default function AudioPlayer() {
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
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Handle seeking
  const handleSeek = (value: number[]) => {
    const newTime = value[0];
    if (audioRef.current && isFinite(duration) && duration > 0) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  // Set up audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => {
      // It was only this. Verify if the rest is necessary.
      // setDuration(audio.duration);

      if (isFinite(audio.duration) && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-slate-700/50">
      <div className="space-y-6">
        {/* Audio element */}
        <audio
          ref={audioRef}
          src="https://www.soundjay.com/misc/sounds/bell-ringing-05.wav"
          preload="metadata"
        />

        {/* Track info */}
        <div className="text-center">
          <h3 className="font-semibold text-lg text-white mb-1">
            Sample Audio Track
          </h3>
          <p className="text-sm text-slate-400">Demo Audio Player</p>
        </div>

        {/* Progress slider */}
        <div className="space-y-3">
          <Slider
            value={[currentTime]}
            max={duration || 100}
            min={0} // Didn't have this.
            step={1}
            onValueChange={handleSeek}
            className="w-full"
            disabled={!duration || duration === 0} // Didn't have this.
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
            disabled={!duration || duration === 0} // Didn't have this.
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
