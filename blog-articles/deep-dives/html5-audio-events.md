# HTML5 Audio Events: The Complete Lifecycle and Reliability Patterns

## Introduction

Mastering HTML5 audio requires understanding the complete event lifecycle, timing dependencies, and cross-browser reliability patterns. This deep-dive covers everything from basic event sequencing to advanced state management strategies.

> **Practical Context**: These patterns solve real issues like the [WebM duration debugging](../webm-duration-debugging.md) problem and inform [React Audio Architecture](react-audio-architecture.md) decisions.

## 1. Audio Element Event Lifecycle

### 1.1 Complete Event Sequence

```javascript
// Comprehensive event logging for analysis
const audioEventLogger = (audio) => {
  const events = [
    "loadstart",
    "durationchange",
    "loadedmetadata",
    "loadeddata",
    "progress",
    "canplay",
    "canplaythrough",
    "play",
    "playing",
    "pause",
    "seeking",
    "seeked",
    "timeupdate",
    "ended",
    "error",
    "stalled",
    "suspend",
    "abort",
    "emptied",
    "waiting",
  ];

  events.forEach((event) => {
    audio.addEventListener(event, () => {
      console.log(
        `${event}: readyState=${audio.readyState}, networkState=${audio.networkState}`
      );
    });
  });
};

// Usage
const audio = new Audio("path/to/audio.webm");
audioEventLogger(audio);
audio.load();
```

### 1.2 ReadyState Progression

```javascript
// ReadyState constants and meanings
const READY_STATES = {
  HAVE_NOTHING: 0, // No information about media
  HAVE_METADATA: 1, // Duration and dimensions known
  HAVE_CURRENT_DATA: 2, // Data for current position available
  HAVE_FUTURE_DATA: 3, // Current + future data available
  HAVE_ENOUGH_DATA: 4, // Enough data to play without interruption
};

// Monitoring state transitions
function monitorReadyState(audio) {
  const checkState = () => {
    console.log({
      readyState: audio.readyState,
      networkState: audio.networkState,
      duration: audio.duration,
      buffered:
        audio.buffered.length > 0
          ? `${audio.buffered.start(0)}-${audio.buffered.end(0)}`
          : "none",
    });
  };

  audio.addEventListener("readystatechange", checkState);
  return checkState;
}
```

## 2. Event Reliability Patterns

### 2.1 Cross-Browser Event Consistency

> **WebM Context**: The `loadedmetadata` reliability issues here directly relate to the [WebM Format Analysis](webm-format-analysis.md) container limitations.

```javascript
// Events that fire reliably across browsers
const RELIABLE_EVENTS = [
  "loadstart", // Always fires when loading begins
  "error", // Always fires on errors
  "ended", // Always fires when playback completes
  "timeupdate", // Always fires during playback (but frequency varies)
];

// Events with browser-specific behavior
const UNRELIABLE_EVENTS = {
  canplay: {
    chrome: "Usually reliable",
    firefox: "May fire multiple times",
    safari: "Delayed on mobile",
  },
  loadedmetadata: {
    chrome: "Reliable for most formats",
    firefox: "WebM issues",
    safari: "Streaming media problems",
  },
};
```

### 2.2 Race Condition Management

```javascript
// Handling event timing issues
class AudioEventManager {
  constructor(audio) {
    this.audio = audio;
    this.eventQueue = [];
    this.isReady = false;
    this.setupEventHandlers();
  }

  setupEventHandlers() {
    // Handle race conditions between manual calls and events
    this.audio.addEventListener("canplay", () => {
      this.isReady = true;
      this.processQueue();
    });
  }

  play() {
    if (this.isReady) {
      return this.audio.play();
    } else {
      // Queue the play request
      return new Promise((resolve, reject) => {
        this.eventQueue.push({ action: "play", resolve, reject });
      });
    }
  }

  processQueue() {
    while (this.eventQueue.length > 0) {
      const { action, resolve, reject } = this.eventQueue.shift();
      if (action === "play") {
        this.audio.play().then(resolve).catch(reject);
      }
    }
  }
}
```

### 2.3 Mobile-Specific Considerations

```javascript
// Mobile browser quirks and workarounds
const MOBILE_PATTERNS = {
  autoplay: {
    ios: "Requires user interaction",
    android: "Policy-dependent",
    solution: "User gesture detection",
  },

  preloading: {
    ios: "Ignored to save bandwidth",
    android: "Respected but limited",
    solution: "Progressive loading on demand",
  },
};

// User gesture detection for mobile
class MobileAudioManager {
  constructor() {
    this.hasUserInteracted = false;
    this.pendingAudio = [];
    this.setupGestureDetection();
  }

  setupGestureDetection() {
    const events = ["touchstart", "touchend", "click"];
    events.forEach((event) => {
      document.addEventListener(
        event,
        () => {
          this.hasUserInteracted = true;
          this.processPendingAudio();
        },
        { once: true }
      );
    });
  }

  async playAudio(audio) {
    if (this.hasUserInteracted) {
      return audio.play();
    } else {
      this.pendingAudio.push(audio);
      throw new Error("User interaction required");
    }
  }
}
```

## 3. Advanced State Management

### 3.1 Robust State Synchronization

```typescript
interface AudioState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  buffered: TimeRanges;
  volume: number;
  muted: boolean;
  readyState: number;
  error: MediaError | null;
}

class AudioStateManager {
  private audio: HTMLAudioElement;
  private state: AudioState;
  private listeners: ((state: AudioState) => void)[] = [];

  constructor(audio: HTMLAudioElement) {
    this.audio = audio;
    this.state = this.getInitialState();
    this.setupEventListeners();
  }

  private setupEventListeners() {
    const eventHandlers = {
      play: () => this.updateState({ isPlaying: true }),
      pause: () => this.updateState({ isPlaying: false }),
      timeupdate: () =>
        this.updateState({
          currentTime: this.audio.currentTime,
        }),
      durationchange: () =>
        this.updateState({
          duration: this.audio.duration,
        }),
      volumechange: () =>
        this.updateState({
          volume: this.audio.volume,
          muted: this.audio.muted,
        }),
      error: () => this.updateState({ error: this.audio.error }),
    };

    Object.entries(eventHandlers).forEach(([event, handler]) => {
      this.audio.addEventListener(event, handler);
    });
  }

  private updateState(partial: Partial<AudioState>) {
    this.state = { ...this.state, ...partial };
    this.notifyListeners();
  }

  subscribe(listener: (state: AudioState) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }
}
```

### 3.2 React Hook Implementation

> **Architecture**: This hook pattern is detailed in [React Audio Architecture](react-audio-architecture.md) with additional component patterns.

```typescript
// Custom hook for audio state management
function useAudioState(src: string) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [state, setState] = useState<AudioState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    buffered: null,
    volume: 1,
    muted: false,
    readyState: 0,
    error: null,
  });

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const stateManager = new AudioStateManager(audio);
    const unsubscribe = stateManager.subscribe(setState);

    return unsubscribe;
  }, [src]);

  const controls = useMemo(
    () => ({
      play: () => audioRef.current?.play(),
      pause: () => audioRef.current?.pause(),
      seek: (time: number) => {
        if (audioRef.current) {
          audioRef.current.currentTime = time;
        }
      },
      setVolume: (volume: number) => {
        if (audioRef.current) {
          audioRef.current.volume = volume;
        }
      },
    }),
    []
  );

  return { state, controls, audioRef };
}
```

## 4. Error Handling Strategies

### 4.1 Comprehensive Error Classification

```javascript
// Audio error types and handling strategies
const AUDIO_ERRORS = {
  MEDIA_ERR_ABORTED: {
    code: 1,
    description: "User aborted download",
    recovery: "Retry on user request",
    common: false,
  },
  MEDIA_ERR_NETWORK: {
    code: 2,
    description: "Network error during download",
    recovery: "Retry with exponential backoff",
    common: true,
  },
  MEDIA_ERR_DECODE: {
    code: 3,
    description: "Error during decoding",
    recovery: "Try alternative format",
    common: false,
  },
  MEDIA_ERR_SRC_NOT_SUPPORTED: {
    code: 4,
    description: "Format not supported",
    recovery: "Provide fallback format",
    common: true,
  },
};

class AudioErrorHandler {
  constructor(audio, options = {}) {
    this.audio = audio;
    this.retryCount = 0;
    this.maxRetries = options.maxRetries || 3;
    this.fallbackFormats = options.fallbackFormats || [];
    this.setupErrorHandling();
  }

  setupErrorHandling() {
    this.audio.addEventListener("error", (e) => {
      const error = this.audio.error;
      if (error) {
        this.handleError(error);
      }
    });
  }

  async handleError(error) {
    const errorInfo = AUDIO_ERRORS[`MEDIA_ERR_${error.code}`] || {
      description: "Unknown error",
      recovery: "Retry",
    };

    console.error(`Audio Error ${error.code}: ${errorInfo.description}`);

    switch (error.code) {
      case MediaError.MEDIA_ERR_NETWORK:
        return this.retryWithBackoff();

      case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
        return this.tryFallbackFormat();

      default:
        return this.reportError(error);
    }
  }

  async retryWithBackoff() {
    if (this.retryCount < this.maxRetries) {
      const delay = Math.pow(2, this.retryCount) * 1000;
      this.retryCount++;

      await new Promise((resolve) => setTimeout(resolve, delay));
      this.audio.load();
    }
  }
}
```

## 5. Performance Optimization

### 5.1 Memory Management

```javascript
// Proper cleanup patterns
class AudioManager {
  constructor() {
    this.audioInstances = new Map();
    this.eventListeners = new WeakMap();
  }

  createAudio(id, src) {
    const audio = new Audio(src);
    const cleanup = this.setupListeners(audio);

    this.audioInstances.set(id, audio);
    this.eventListeners.set(audio, cleanup);

    return audio;
  }

  destroyAudio(id) {
    const audio = this.audioInstances.get(id);
    if (audio) {
      // Cleanup event listeners
      const cleanup = this.eventListeners.get(audio);
      if (cleanup) cleanup();

      // Stop and cleanup audio
      audio.pause();
      audio.removeAttribute("src");
      audio.load(); // Important: triggers garbage collection

      this.audioInstances.delete(id);
      this.eventListeners.delete(audio);
    }
  }

  setupListeners(audio) {
    const handlers = {
      timeupdate: this.handleTimeUpdate.bind(this),
      ended: this.handleEnded.bind(this),
      error: this.handleError.bind(this),
    };

    Object.entries(handlers).forEach(([event, handler]) => {
      audio.addEventListener(event, handler);
    });

    // Return cleanup function
    return () => {
      Object.entries(handlers).forEach(([event, handler]) => {
        audio.removeEventListener(event, handler);
      });
    };
  }
}
```

### 5.2 Concurrent Audio Management

```javascript
// Managing multiple audio instances
class ConcurrentAudioManager {
  constructor(maxConcurrent = 3) {
    this.maxConcurrent = maxConcurrent;
    this.playingAudio = new Set();
    this.queue = [];
  }

  async play(audio) {
    if (this.playingAudio.size >= this.maxConcurrent) {
      // Queue the request
      return new Promise((resolve, reject) => {
        this.queue.push({ audio, resolve, reject });
      });
    }

    return this.startPlayback(audio);
  }

  async startPlayback(audio) {
    this.playingAudio.add(audio);

    const cleanup = () => {
      this.playingAudio.delete(audio);
      this.processQueue();
    };

    audio.addEventListener("ended", cleanup, { once: true });
    audio.addEventListener("error", cleanup, { once: true });

    try {
      await audio.play();
    } catch (error) {
      cleanup();
      throw error;
    }
  }

  processQueue() {
    if (this.queue.length > 0 && this.playingAudio.size < this.maxConcurrent) {
      const { audio, resolve, reject } = this.queue.shift();
      this.startPlayback(audio).then(resolve).catch(reject);
    }
  }
}
```

## 6. Testing Strategies

### 6.1 Event Mocking for Tests

```javascript
// Mock audio element for testing
class MockAudioElement {
  constructor() {
    this.readyState = 0;
    this.networkState = 0;
    this.currentTime = 0;
    this.duration = NaN;
    this.paused = true;
    this.listeners = {};
  }

  addEventListener(event, listener) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(listener);
  }

  removeEventListener(event, listener) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(
        (l) => l !== listener
      );
    }
  }

  dispatchEvent(event) {
    if (this.listeners[event.type]) {
      this.listeners[event.type].forEach((listener) => {
        listener(event);
      });
    }
  }

  // Simulate loading
  simulateLoad(duration = 10) {
    this.readyState = 1;
    this.duration = duration;
    this.dispatchEvent(new Event("loadedmetadata"));

    setTimeout(() => {
      this.readyState = 4;
      this.dispatchEvent(new Event("canplaythrough"));
    }, 100);
  }

  // Simulate playback
  async play() {
    if (this.readyState < 3) {
      throw new Error("Not ready to play");
    }

    this.paused = false;
    this.dispatchEvent(new Event("play"));

    // Simulate time updates
    this.timeUpdateInterval = setInterval(() => {
      if (!this.paused && this.currentTime < this.duration) {
        this.currentTime += 0.1;
        this.dispatchEvent(new Event("timeupdate"));

        if (this.currentTime >= this.duration) {
          this.pause();
          this.dispatchEvent(new Event("ended"));
        }
      }
    }, 100);
  }

  pause() {
    this.paused = true;
    if (this.timeUpdateInterval) {
      clearInterval(this.timeUpdateInterval);
    }
    this.dispatchEvent(new Event("pause"));
  }
}
```

## 7. Browser-Specific Optimizations

### 7.1 Chrome Optimizations

```javascript
// Chrome-specific audio optimizations
const chromeOptimizations = {
  // Use AudioContext for better performance
  useAudioContext: true,

  // Preload strategy
  preloadStrategy: "metadata", // vs 'auto' or 'none'

  // Buffer size optimization
  bufferSize: 4096,

  // Memory management
  aggressiveCleanup: true,
};
```

### 7.2 Safari/iOS Optimizations

```javascript
// Safari/iOS specific handling
const safariOptimizations = {
  // Work around iOS limitations
  iosWorkarounds: {
    requireUserGesture: true,
    disableAutoplay: true,
    limitConcurrentAudio: 1,
  },

  // Format preferences
  preferredFormats: ["audio/mp4", "audio/mpeg"],

  // Bandwidth considerations
  useAdaptiveBitrate: true,
};
```

## Conclusion

Mastering HTML5 audio events requires understanding the complex interplay between browser implementations, network conditions, and user interactions. The patterns and strategies outlined here provide a foundation for building robust audio applications that work reliably across all modern browsers.

## Related Articles

- **[WebM Duration Debugging](../webm-duration-debugging.md)** - Real debugging case study using these event patterns
- **[WebM Format Analysis](webm-format-analysis.md)** - Why certain events are unreliable with WebM files
- **[React Audio Architecture](react-audio-architecture.md)** - Implementing these patterns in React components
- **[Cross-Origin Audio](cross-origin-audio.md)** - CORS considerations for audio events
- **[Production Considerations](production-considerations.md)** - Monitoring audio events in production

## Further Reading

- [HTML5 Audio/Video Events - MDN](https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Media_events)
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [Media Session API](https://developer.mozilla.org/en-US/docs/Web/API/Media_Session_API)
