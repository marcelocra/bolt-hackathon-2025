# React Audio Components: Architecture Patterns and Anti-patterns

## Introduction
Building robust audio components in React requires careful consideration of state management, lifecycle handling, and performance optimization. This deep-dive explores proven patterns and common pitfalls in React audio development.

## 1. Component Responsibility Patterns

### 1.1 Container/Presentation Pattern
```tsx
// Pattern 1: Clear separation of logic and presentation
interface AudioData {
  src: string;
  title: string;
  duration: number;
  isPlaying: boolean;
  currentTime: number;
}

// Container: Logic and state management
const AudioContainer: React.FC<{ entry: AudioEntry }> = ({ entry }) => {
  const [audioData, setAudioData] = useState<AudioData>({
    src: '',
    title: entry.title,
    duration: entry.duration || 0,
    isPlaying: false,
    currentTime: 0
  });
  
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  
  // Handle signed URL generation
  useEffect(() => {
    const generateUrl = async () => {
      if (entry.audioPath) {
        const url = await createSignedUrl(entry.audioPath);
        setSignedUrl(url);
        setAudioData(prev => ({ ...prev, src: url }));
      }
    };
    generateUrl();
  }, [entry.audioPath]);
  
  // Audio state management
  const handleAudioStateChange = useCallback((newState: Partial<AudioData>) => {
    setAudioData(prev => ({ ...prev, ...newState }));
  }, []);
  
  if (!signedUrl) return <AudioLoadingState />;
  
  return (
    <AudioPresentation 
      audioData={audioData}
      onStateChange={handleAudioStateChange}
    />
  );
};

// Presentation: Pure UI component
const AudioPresentation: React.FC<{
  audioData: AudioData;
  onStateChange: (state: Partial<AudioData>) => void;
}> = ({ audioData, onStateChange }) => {
  return (
    <div className="audio-player">
      <AudioControls 
        isPlaying={audioData.isPlaying}
        onPlayPause={() => onStateChange({ 
          isPlaying: !audioData.isPlaying 
        })}
      />
      <AudioProgress 
        currentTime={audioData.currentTime}
        duration={audioData.duration}
        onSeek={(time) => onStateChange({ currentTime: time })}
      />
    </div>
  );
};
```

### 1.2 Compound Components Pattern
```tsx
// Pattern 2: Compound components for flexibility
const Audio = ({ children, src, ...props }) => {
  const audioState = useAudioState(src);
  
  return (
    <AudioContext.Provider value={audioState}>
      <div className="audio-component">
        {children}
      </div>
    </AudioContext.Provider>
  );
};

// Sub-components
Audio.Controls = ({ customControls }) => {
  const { isPlaying, play, pause } = useAudioContext();
  
  return (
    <div className="audio-controls">
      <button onClick={isPlaying ? pause : play}>
        {isPlaying ? <PauseIcon /> : <PlayIcon />}
      </button>
      {customControls}
    </div>
  );
};

Audio.Progress = ({ showTimestamps = true }) => {
  const { currentTime, duration, seek } = useAudioContext();
  
  return (
    <div className="audio-progress">
      <Slider 
        value={currentTime}
        max={duration}
        onChange={seek}
      />
      {showTimestamps && (
        <div className="timestamps">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      )}
    </div>
  );
};

Audio.Volume = () => {
  const { volume, muted, setVolume, toggleMute } = useAudioContext();
  
  return (
    <div className="audio-volume">
      <button onClick={toggleMute}>
        {muted ? <MuteIcon /> : <VolumeIcon />}
      </button>
      <Slider
        value={muted ? 0 : volume}
        max={1}
        step={0.1}
        onChange={setVolume}
      />
    </div>
  );
};

// Usage
<Audio src={audioUrl}>
  <Audio.Controls />
  <Audio.Progress showTimestamps={true} />
  <Audio.Volume />
</Audio>
```

### 1.3 Hook-Based Pattern
```tsx
// Pattern 3: Custom hooks for reusable logic
interface UseAudioOptions {
  autoPlay?: boolean;
  loop?: boolean;
  volume?: number;
  onEnded?: () => void;
  onError?: (error: Error) => void;
}

function useAudio(src: string, options: UseAudioOptions = {}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [state, setState] = useState({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: options.volume || 1,
    muted: false,
    loading: true,
    error: null as Error | null
  });
  
  // Audio element setup
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    audio.src = src;
    audio.volume = state.volume;
    audio.loop = options.loop || false;
    
    if (options.autoPlay) {
      audio.play().catch(console.error);
    }
  }, [src, options.autoPlay, options.loop, state.volume]);
  
  // Event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const handlers = {
      loadstart: () => setState(prev => ({ ...prev, loading: true })),
      loadedmetadata: () => setState(prev => ({ 
        ...prev, 
        duration: audio.duration,
        loading: false 
      })),
      timeupdate: () => setState(prev => ({ 
        ...prev, 
        currentTime: audio.currentTime 
      })),
      play: () => setState(prev => ({ ...prev, isPlaying: true })),
      pause: () => setState(prev => ({ ...prev, isPlaying: false })),
      ended: () => {
        setState(prev => ({ ...prev, isPlaying: false }));
        options.onEnded?.();
      },
      error: () => {
        const error = new Error('Audio playback failed');
        setState(prev => ({ ...prev, error, loading: false }));
        options.onError?.(error);
      }
    };
    
    Object.entries(handlers).forEach(([event, handler]) => {
      audio.addEventListener(event, handler);
    });
    
    return () => {
      Object.entries(handlers).forEach(([event, handler]) => {
        audio.removeEventListener(event, handler);
      });
    };
  }, [options.onEnded, options.onError]);
  
  // Control functions
  const controls = useMemo(() => ({
    play: () => audioRef.current?.play(),
    pause: () => audioRef.current?.pause(),
    seek: (time: number) => {
      if (audioRef.current) {
        audioRef.current.currentTime = time;
      }
    },
    setVolume: (volume: number) => {
      setState(prev => ({ ...prev, volume }));
      if (audioRef.current) {
        audioRef.current.volume = volume;
      }
    },
    toggleMute: () => {
      setState(prev => ({ ...prev, muted: !prev.muted }));
      if (audioRef.current) {
        audioRef.current.muted = !audioRef.current.muted;
      }
    }
  }), []);
  
  return {
    audioRef,
    state,
    controls
  };
}

// Usage in component
const AudioPlayer: React.FC<{ src: string }> = ({ src }) => {
  const { audioRef, state, controls } = useAudio(src, {
    onEnded: () => console.log('Audio ended'),
    onError: (error) => console.error('Audio error:', error)
  });
  
  return (
    <div>
      <audio ref={audioRef} />
      <button onClick={state.isPlaying ? controls.pause : controls.play}>
        {state.isPlaying ? 'Pause' : 'Play'}
      </button>
      {/* Additional UI */}
    </div>
  );
};
```

## 2. State Management Strategies

### 2.1 Local State with useReducer
```tsx
// Complex state management with useReducer
type AudioAction = 
  | { type: 'PLAY' }
  | { type: 'PAUSE' }
  | { type: 'SEEK'; payload: number }
  | { type: 'SET_DURATION'; payload: number }
  | { type: 'UPDATE_TIME'; payload: number }
  | { type: 'SET_VOLUME'; payload: number }
  | { type: 'TOGGLE_MUTE' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: Error | null };

interface AudioState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  muted: boolean;
  loading: boolean;
  error: Error | null;
}

const audioReducer = (state: AudioState, action: AudioAction): AudioState => {
  switch (action.type) {
    case 'PLAY':
      return { ...state, isPlaying: true, error: null };
    
    case 'PAUSE':
      return { ...state, isPlaying: false };
    
    case 'SEEK':
      return { ...state, currentTime: action.payload };
    
    case 'SET_DURATION':
      return { ...state, duration: action.payload, loading: false };
    
    case 'UPDATE_TIME':
      return { ...state, currentTime: action.payload };
    
    case 'SET_VOLUME':
      return { ...state, volume: action.payload };
    
    case 'TOGGLE_MUTE':
      return { ...state, muted: !state.muted };
    
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    
    default:
      return state;
  }
};

const useAudioReducer = (initialState: Partial<AudioState> = {}) => {
  const [state, dispatch] = useReducer(audioReducer, {
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    muted: false,
    loading: true,
    error: null,
    ...initialState
  });
  
  return { state, dispatch };
};
```

### 2.2 Context-Based Global State
```tsx
// Global audio state management
interface GlobalAudioState {
  currentTrack: string | null;
  playlist: AudioTrack[];
  isPlaying: boolean;
  volume: number;
  muted: boolean;
}

const AudioContext = createContext<{
  state: GlobalAudioState;
  actions: AudioActions;
} | null>(null);

interface AudioActions {
  playTrack: (trackId: string) => void;
  pauseCurrentTrack: () => void;
  addToPlaylist: (track: AudioTrack) => void;
  removeFromPlaylist: (trackId: string) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
}

const AudioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<GlobalAudioState>({
    currentTrack: null,
    playlist: [],
    isPlaying: false,
    volume: 1,
    muted: false
  });
  
  const actions: AudioActions = {
    playTrack: (trackId) => {
      setState(prev => ({
        ...prev,
        currentTrack: trackId,
        isPlaying: true
      }));
    },
    
    pauseCurrentTrack: () => {
      setState(prev => ({ ...prev, isPlaying: false }));
    },
    
    addToPlaylist: (track) => {
      setState(prev => ({
        ...prev,
        playlist: [...prev.playlist, track]
      }));
    },
    
    removeFromPlaylist: (trackId) => {
      setState(prev => ({
        ...prev,
        playlist: prev.playlist.filter(track => track.id !== trackId),
        currentTrack: prev.currentTrack === trackId ? null : prev.currentTrack
      }));
    },
    
    setVolume: (volume) => {
      setState(prev => ({ ...prev, volume }));
    },
    
    toggleMute: () => {
      setState(prev => ({ ...prev, muted: !prev.muted }));
    }
  };
  
  return (
    <AudioContext.Provider value={{ state, actions }}>
      {children}
    </AudioContext.Provider>
  );
};

const useGlobalAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useGlobalAudio must be used within AudioProvider');
  }
  return context;
};
```

### 2.3 External State Management (Zustand)
```tsx
// Zustand store for audio state
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface AudioStore {
  // State
  tracks: Map<string, AudioTrack>;
  currentTrackId: string | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  muted: boolean;
  
  // Actions
  addTrack: (track: AudioTrack) => void;
  removeTrack: (trackId: string) => void;
  playTrack: (trackId: string) => void;
  pauseTrack: () => void;
  updateTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
}

const useAudioStore = create<AudioStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      tracks: new Map(),
      currentTrackId: null,
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      volume: 1,
      muted: false,
      
      // Actions
      addTrack: (track) => set((state) => {
        const newTracks = new Map(state.tracks);
        newTracks.set(track.id, track);
        return { tracks: newTracks };
      }),
      
      removeTrack: (trackId) => set((state) => {
        const newTracks = new Map(state.tracks);
        newTracks.delete(trackId);
        return {
          tracks: newTracks,
          currentTrackId: state.currentTrackId === trackId ? null : state.currentTrackId
        };
      }),
      
      playTrack: (trackId) => {
        const { tracks } = get();
        if (tracks.has(trackId)) {
          set({ currentTrackId: trackId, isPlaying: true });
        }
      },
      
      pauseTrack: () => set({ isPlaying: false }),
      
      updateTime: (time) => set({ currentTime: time }),
      
      setDuration: (duration) => set({ duration }),
      
      setVolume: (volume) => set({ volume }),
      
      toggleMute: () => set((state) => ({ muted: !state.muted }))
    }),
    { name: 'audio-store' }
  )
);

// Usage in component
const AudioControls: React.FC = () => {
  const { 
    isPlaying, 
    currentTrackId, 
    playTrack, 
    pauseTrack 
  } = useAudioStore();
  
  const handlePlayPause = () => {
    if (isPlaying) {
      pauseTrack();
    } else if (currentTrackId) {
      playTrack(currentTrackId);
    }
  };
  
  return (
    <button onClick={handlePlayPause}>
      {isPlaying ? 'Pause' : 'Play'}
    </button>
  );
};
```

## 3. Performance Optimization Patterns

### 3.1 Lazy Loading and Code Splitting
```tsx
// Lazy load audio components
const AudioPlayer = lazy(() => import('./AudioPlayer'));
const AudioVisualizer = lazy(() => import('./AudioVisualizer'));

const AudioApp: React.FC = () => {
  const [showPlayer, setShowPlayer] = useState(false);
  const [showVisualizer, setShowVisualizer] = useState(false);
  
  return (
    <div>
      <button onClick={() => setShowPlayer(true)}>
        Load Audio Player
      </button>
      
      {showPlayer && (
        <Suspense fallback={<AudioPlayerSkeleton />}>
          <AudioPlayer />
        </Suspense>
      )}
      
      {showVisualizer && (
        <Suspense fallback={<div>Loading visualizer...</div>}>
          <AudioVisualizer />
        </Suspense>
      )}
    </div>
  );
};

// Preload critical audio components
const preloadAudioComponents = () => {
  import('./AudioPlayer');
  import('./AudioControls');
};

// Preload on user interaction
useEffect(() => {
  const handleFirstInteraction = () => {
    preloadAudioComponents();
    document.removeEventListener('click', handleFirstInteraction);
  };
  
  document.addEventListener('click', handleFirstInteraction);
  return () => document.removeEventListener('click', handleFirstInteraction);
}, []);
```

### 3.2 Virtualization for Large Audio Lists
```tsx
// Virtual scrolling for large audio lists
import { FixedSizeList as List } from 'react-window';

interface AudioListProps {
  tracks: AudioTrack[];
  itemHeight: number;
  containerHeight: number;
}

const VirtualizedAudioList: React.FC<AudioListProps> = ({
  tracks,
  itemHeight,
  containerHeight
}) => {
  const renderAudioItem = useCallback(({ index, style }) => {
    const track = tracks[index];
    return (
      <div style={style}>
        <AudioListItem 
          key={track.id}
          track={track}
          isVirtualized={true}
        />
      </div>
    );
  }, [tracks]);
  
  return (
    <List
      height={containerHeight}
      itemCount={tracks.length}
      itemSize={itemHeight}
      itemData={tracks}
    >
      {renderAudioItem}
    </List>
  );
};

// Optimized audio list item
const AudioListItem = memo<{
  track: AudioTrack;
  isVirtualized?: boolean;
}>(({ track, isVirtualized }) => {
  const [isLoaded, setIsLoaded] = useState(!isVirtualized);
  
  // Load audio metadata only when item becomes visible
  useEffect(() => {
    if (isVirtualized && !isLoaded) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsLoaded(true);
            observer.disconnect();
          }
        },
        { threshold: 0.1 }
      );
      
      // Observe the component
      const element = document.getElementById(`audio-item-${track.id}`);
      if (element) {
        observer.observe(element);
      }
      
      return () => observer.disconnect();
    }
  }, [track.id, isVirtualized, isLoaded]);
  
  return (
    <div id={`audio-item-${track.id}`} className="audio-list-item">
      {isLoaded ? (
        <AudioPlayer src={track.src} title={track.title} />
      ) : (
        <AudioItemSkeleton />
      )}
    </div>
  );
});
```

### 3.3 Memoization Strategies
```tsx
// Strategic memoization for audio components
const AudioControls = memo<{
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  disabled?: boolean;
}>(({ isPlaying, onPlay, onPause, disabled }) => {
  return (
    <div className="audio-controls">
      <button
        onClick={isPlaying ? onPause : onPlay}
        disabled={disabled}
        aria-label={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? <PauseIcon /> : <PlayIcon />}
      </button>
    </div>
  );
});

// Memoize expensive calculations
const AudioWaveform = memo<{
  audioBuffer: AudioBuffer;
  width: number;
  height: number;
}>(({ audioBuffer, width, height }) => {
  const waveformData = useMemo(() => {
    return generateWaveformData(audioBuffer, width);
  }, [audioBuffer, width]);
  
  const pathData = useMemo(() => {
    return generateSVGPath(waveformData, height);
  }, [waveformData, height]);
  
  return (
    <svg width={width} height={height}>
      <path d={pathData} stroke="currentColor" fill="none" />
    </svg>
  );
});

// Custom comparison for complex props
const AudioEqualizer = memo<{
  frequencies: Float32Array;
  settings: EqualizerSettings;
}>(({ frequencies, settings }) => {
  // Component implementation
}, (prevProps, nextProps) => {
  // Custom comparison for Float32Array
  if (prevProps.frequencies.length !== nextProps.frequencies.length) {
    return false;
  }
  
  for (let i = 0; i < prevProps.frequencies.length; i++) {
    if (Math.abs(prevProps.frequencies[i] - nextProps.frequencies[i]) > 0.001) {
      return false;
    }
  }
  
  return isEqual(prevProps.settings, nextProps.settings);
});
```

## 4. Testing Strategies

### 4.1 Unit Testing Audio Components
```tsx
// Mock audio element for testing
const createMockAudio = () => ({
  play: jest.fn().mockResolvedValue(undefined),
  pause: jest.fn(),
  load: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  currentTime: 0,
  duration: 100,
  paused: true,
  volume: 1,
  muted: false,
  readyState: 4
});

// Test audio hook
describe('useAudio', () => {
  let mockAudio: any;
  
  beforeEach(() => {
    mockAudio = createMockAudio();
    jest.spyOn(window, 'Audio').mockImplementation(() => mockAudio);
  });
  
  afterEach(() => {
    jest.restoreAllMocks();
  });
  
  it('should initialize with correct default state', () => {
    const { result } = renderHook(() => useAudio('test.mp3'));
    
    expect(result.current.state.isPlaying).toBe(false);
    expect(result.current.state.currentTime).toBe(0);
    expect(result.current.state.volume).toBe(1);
  });
  
  it('should call play when play control is used', async () => {
    const { result } = renderHook(() => useAudio('test.mp3'));
    
    await act(async () => {
      await result.current.controls.play();
    });
    
    expect(mockAudio.play).toHaveBeenCalled();
  });
  
  it('should update state when audio events fire', () => {
    const { result } = renderHook(() => useAudio('test.mp3'));
    
    act(() => {
      // Simulate play event
      const playHandler = mockAudio.addEventListener.mock.calls
        .find(([event]) => event === 'play')[1];
      playHandler();
    });
    
    expect(result.current.state.isPlaying).toBe(true);
  });
});
```

### 4.2 Integration Testing
```tsx
// Integration test for audio player component
describe('AudioPlayer Integration', () => {
  it('should play audio when play button is clicked', async () => {
    const mockPlay = jest.fn().mockResolvedValue(undefined);
    const mockAudio = {
      ...createMockAudio(),
      play: mockPlay
    };
    
    jest.spyOn(window, 'Audio').mockImplementation(() => mockAudio);
    
    render(<AudioPlayer src="test.mp3" />);
    
    const playButton = screen.getByRole('button', { name: /play/i });
    
    await userEvent.click(playButton);
    
    expect(mockPlay).toHaveBeenCalled();
    expect(screen.getByRole('button', { name: /pause/i })).toBeInTheDocument();
  });
  
  it('should seek when progress bar is clicked', async () => {
    const mockAudio = createMockAudio();
    jest.spyOn(window, 'Audio').mockImplementation(() => mockAudio);
    
    render(<AudioPlayer src="test.mp3" />);
    
    // Simulate loaded metadata
    act(() => {
      const loadedHandler = mockAudio.addEventListener.mock.calls
        .find(([event]) => event === 'loadedmetadata')[1];
      loadedHandler();
    });
    
    const progressBar = screen.getByRole('slider');
    
    await userEvent.click(progressBar);
    
    expect(mockAudio.currentTime).toHaveBeenSet();
  });
});
```

### 4.3 Accessibility Testing
```tsx
// Accessibility testing for audio components
describe('AudioPlayer Accessibility', () => {
  it('should have proper ARIA labels', () => {
    render(<AudioPlayer src="test.mp3" title="Test Audio" />);
    
    expect(screen.getByRole('button', { name: /play test audio/i }))
      .toBeInTheDocument();
    expect(screen.getByRole('slider', { name: /audio progress/i }))
      .toBeInTheDocument();
    expect(screen.getByRole('slider', { name: /volume/i }))
      .toBeInTheDocument();
  });
  
  it('should support keyboard navigation', async () => {
    render(<AudioPlayer src="test.mp3" />);
    
    const playButton = screen.getByRole('button', { name: /play/i });
    
    playButton.focus();
    expect(playButton).toHaveFocus();
    
    await userEvent.keyboard('{Enter}');
    // Verify play was triggered
    
    await userEvent.keyboard('{Tab}');
    expect(screen.getByRole('slider')).toHaveFocus();
  });
  
  it('should announce state changes to screen readers', async () => {
    render(<AudioPlayer src="test.mp3" />);
    
    const playButton = screen.getByRole('button');
    await userEvent.click(playButton);
    
    expect(screen.getByText(/now playing/i)).toBeInTheDocument();
  });
});
```

## 5. Common Anti-patterns and Solutions

### 5.1 Memory Leaks
```tsx
// ❌ Anti-pattern: Not cleaning up audio resources
const BadAudioComponent = ({ src }) => {
  const [audio] = useState(() => new Audio(src));
  
  useEffect(() => {
    audio.addEventListener('timeupdate', handleTimeUpdate);
    // Missing cleanup!
  }, []);
  
  return <div>Audio Player</div>;
};

// ✅ Correct pattern: Proper cleanup
const GoodAudioComponent = ({ src }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const handleTimeUpdate = () => {
      // Handle time update
    };
    
    audio.addEventListener('timeupdate', handleTimeUpdate);
    
    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.pause();
      audio.src = ''; // Important for garbage collection
    };
  }, [src]);
  
  return <audio ref={audioRef} src={src} />;
};
```

### 5.2 Excessive Re-renders
```tsx
// ❌ Anti-pattern: Creating new objects in render
const BadProgressBar = ({ currentTime, duration, onSeek }) => {
  // New object created every render!
  const style = { width: `${(currentTime / duration) * 100}%` };
  
  return (
    <div className="progress-bar">
      <div style={style} /> {/* Causes unnecessary re-renders */}
    </div>
  );
};

// ✅ Correct pattern: Memoized styles
const GoodProgressBar = ({ currentTime, duration, onSeek }) => {
  const progressPercentage = useMemo(() => {
    return duration > 0 ? (currentTime / duration) * 100 : 0;
  }, [currentTime, duration]);
  
  const progressStyle = useMemo(() => ({
    width: `${progressPercentage}%`
  }), [progressPercentage]);
  
  return (
    <div className="progress-bar">
      <div style={progressStyle} />
    </div>
  );
};
```

### 5.3 State Synchronization Issues
```tsx
// ❌ Anti-pattern: Manual state management
const BadAudioPlayer = ({ src }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const handlePlay = () => {
    setIsPlaying(true); // Can get out of sync!
    audioRef.current?.play();
  };
  
  // Missing actual audio event listeners
  
  return (
    <div>
      <audio ref={audioRef} src={src} />
      <button onClick={handlePlay}>
        {isPlaying ? 'Pause' : 'Play'}
      </button>
    </div>
  );
};

// ✅ Correct pattern: Event-driven state
const GoodAudioPlayer = ({ src }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    
    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, []);
  
  const handlePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;
    
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(console.error);
    }
  };
  
  return (
    <div>
      <audio ref={audioRef} src={src} />
      <button onClick={handlePlayPause}>
        {isPlaying ? 'Pause' : 'Play'}
      </button>
    </div>
  );
};
```

## Conclusion

Building robust React audio components requires careful attention to state management, performance optimization, and proper resource cleanup. The patterns outlined here provide a foundation for creating scalable, maintainable audio applications while avoiding common pitfalls.

## Further Reading
- [React Performance Optimization](https://react.dev/learn/render-and-commit)
- [Web Audio API Integration with React](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [Testing React Components](https://testing-library.com/docs/react-testing-library/intro/)