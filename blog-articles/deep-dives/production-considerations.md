# Production Audio Apps: Monitoring, Analytics, and Error Handling

## Introduction

Moving audio applications from development to production requires comprehensive monitoring, error handling, and user experience optimization. This deep-dive covers the operational concerns that separate robust production apps from simple demos.

> **Foundation**: These production patterns build on [React Audio Architecture](react-audio-architecture.md) components and [Cross-Origin Audio](cross-origin-audio.md) security strategies.

## 1. Error Monitoring and Observability

### 1.1 Comprehensive Error Classification

```typescript
// Audio-specific error taxonomy for monitoring
interface AudioError {
  type: "network" | "format" | "permission" | "hardware" | "browser";
  severity: "low" | "medium" | "high" | "critical";
  recoverable: boolean;
  userImpact: "none" | "degraded" | "blocked";
  context: {
    audioId?: string;
    userId?: string;
    browser: string;
    device: string;
    networkType?: string;
  };
}

class AudioErrorMonitor {
  private analytics: AnalyticsService;
  private logger: LoggingService;

  constructor(analytics: AnalyticsService, logger: LoggingService) {
    this.analytics = analytics;
    this.logger = logger;
    this.setupGlobalErrorHandling();
  }

  private setupGlobalErrorHandling() {
    // Capture unhandled audio errors
    window.addEventListener("error", (event) => {
      if (event.target instanceof HTMLAudioElement) {
        this.handleAudioError({
          type: "format",
          severity: "high",
          recoverable: false,
          userImpact: "blocked",
          context: this.getErrorContext(event.target),
        });
      }
    });
  }

  handleLoadError(audio: HTMLAudioElement, error: Error) {
    const audioError: AudioError = {
      type: this.classifyError(error),
      severity: this.determineSeverity(error),
      recoverable: this.isRecoverable(error),
      userImpact: "blocked",
      context: {
        audioId: audio.dataset.audioId,
        userId: this.getCurrentUserId(),
        browser: navigator.userAgent,
        device: this.getDeviceInfo(),
        networkType: this.getNetworkType(),
      },
    };

    this.reportError(audioError, error);
  }

  private classifyError(error: Error): AudioError["type"] {
    if (error.message.includes("network")) return "network";
    if (error.message.includes("format")) return "format";
    if (error.message.includes("permission")) return "permission";
    if (error.message.includes("hardware")) return "hardware";
    return "browser";
  }

  private reportError(audioError: AudioError, originalError: Error) {
    // Send to error tracking service (Sentry, Bugsnag, etc.)
    this.logger.error("Audio Error", {
      ...audioError,
      stack: originalError.stack,
      message: originalError.message,
    });

    // Send metrics for analysis
    this.analytics.track("audio_error", {
      error_type: audioError.type,
      severity: audioError.severity,
      recoverable: audioError.recoverable,
      user_impact: audioError.userImpact,
    });
  }
}
```

### 1.2 Real-Time Performance Monitoring

> **Event Tracking**: Performance monitoring leverages [HTML5 Audio Events](html5-audio-events.md) for accurate timing metrics.

```javascript
// Performance monitoring for audio applications
class AudioPerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.observer = new PerformanceObserver(
      this.handlePerformanceEntries.bind(this)
    );
    this.observer.observe({
      entryTypes: ["navigation", "resource", "measure"],
    });
  }

  // Track audio-specific performance metrics
  trackAudioMetrics(audioElement, audioId) {
    const startTime = performance.now();

    const metrics = {
      loadStart: startTime,
      firstByte: null,
      canPlay: null,
      canPlayThrough: null,
      userInteraction: null,
    };

    audioElement.addEventListener("loadstart", () => {
      metrics.firstByte = performance.now();
    });

    audioElement.addEventListener("canplay", () => {
      metrics.canPlay = performance.now();
      this.reportMetric("audio_ready_to_play", {
        audioId,
        timeToCanPlay: metrics.canPlay - metrics.loadStart,
        timeToFirstByte: metrics.firstByte - metrics.loadStart,
      });
    });

    audioElement.addEventListener("canplaythrough", () => {
      metrics.canPlayThrough = performance.now();
      this.reportMetric("audio_fully_loaded", {
        audioId,
        totalLoadTime: metrics.canPlayThrough - metrics.loadStart,
      });
    });

    // Track user engagement
    audioElement.addEventListener("play", () => {
      if (!metrics.userInteraction) {
        metrics.userInteraction = performance.now();
        this.reportMetric("audio_first_interaction", {
          audioId,
          timeToInteraction: metrics.userInteraction - metrics.loadStart,
        });
      }
    });
  }

  // Monitor Core Web Vitals impact
  monitorWebVitals() {
    // Largest Contentful Paint
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.element && entry.element.tagName === "AUDIO") {
          this.reportMetric("audio_lcp", {
            value: entry.startTime,
            element: "audio",
          });
        }
      }
    }).observe({ type: "largest-contentful-paint", buffered: true });

    // Cumulative Layout Shift
    new PerformanceObserver((list) => {
      let clsValue = 0;
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      }
      this.reportMetric("audio_cls", { value: clsValue });
    }).observe({ type: "layout-shift", buffered: true });
  }
}
```

## 2. User Analytics and Behavior Tracking

### 2.1 Audio Engagement Metrics

```typescript
// Comprehensive audio analytics
interface AudioSession {
  sessionId: string;
  userId: string;
  audioId: string;
  startTime: number;
  endTime?: number;
  totalDuration: number;
  playedDuration: number;
  seekEvents: number;
  completionRate: number;
  qualityChanges: number;
  errorCount: number;
}

class AudioAnalytics {
  private sessions: Map<string, AudioSession> = new Map();
  private analyticsEndpoint: string;

  startSession(audioId: string, userId: string): string {
    const sessionId = this.generateSessionId();
    const session: AudioSession = {
      sessionId,
      userId,
      audioId,
      startTime: Date.now(),
      totalDuration: 0,
      playedDuration: 0,
      seekEvents: 0,
      completionRate: 0,
      qualityChanges: 0,
      errorCount: 0,
    };

    this.sessions.set(sessionId, session);
    return sessionId;
  }

  trackPlayback(sessionId: string, audio: HTMLAudioElement) {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    let lastTime = 0;
    let playStartTime = 0;

    audio.addEventListener("play", () => {
      playStartTime = Date.now();
    });

    audio.addEventListener("pause", () => {
      if (playStartTime > 0) {
        session.playedDuration += Date.now() - playStartTime;
        playStartTime = 0;
      }
    });

    audio.addEventListener("timeupdate", () => {
      const currentTime = audio.currentTime;

      // Detect seeks (non-linear time progression)
      if (Math.abs(currentTime - lastTime) > 1) {
        session.seekEvents++;
        this.trackEvent("audio_seek", {
          sessionId,
          fromTime: lastTime,
          toTime: currentTime,
        });
      }

      lastTime = currentTime;
      session.totalDuration = audio.duration || 0;
      session.completionRate = (currentTime / session.totalDuration) * 100;
    });

    audio.addEventListener("ended", () => {
      this.endSession(sessionId);
    });
  }

  endSession(sessionId: string) {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    session.endTime = Date.now();

    // Calculate engagement metrics
    const sessionDuration = session.endTime - session.startTime;
    const engagementRate = session.playedDuration / sessionDuration;

    // Send comprehensive session data
    this.trackEvent("audio_session_complete", {
      ...session,
      sessionDuration,
      engagementRate,
      averageSeeksPerMinute: session.seekEvents / (sessionDuration / 60000),
    });

    this.sessions.delete(sessionId);
  }

  // Track user behavior patterns
  trackUserBehavior(userId: string) {
    return {
      // Daily/weekly/monthly usage patterns
      getUsagePatterns: () => this.queryUsagePatterns(userId),

      // Preferred audio lengths
      getPreferredDurations: () => this.queryPreferredDurations(userId),

      // Device and browser preferences
      getDevicePatterns: () => this.queryDeviceUsage(userId),

      // Quality preferences (bitrate, format)
      getQualityPreferences: () => this.queryQualityPreferences(userId),
    };
  }
}
```

### 2.2 A/B Testing Framework

> **UX Validation**: A/B testing helps validate solutions to problems like [component UX anti-patterns](../react-component-ux-patterns.md).

```javascript
// A/B testing for audio UX optimization
class AudioABTesting {
  constructor() {
    this.experiments = new Map();
    this.userAssignments = new Map();
  }

  // Test different auto-play strategies
  testAutoPlayStrategy(userId) {
    const experiment = "autoplay_strategy_v1";
    const variants = [
      { name: "control", autoPlay: false, showPlayButton: true },
      { name: "auto_play", autoPlay: true, showPlayButton: false },
      { name: "delayed_auto", autoPlay: "delayed", delay: 2000 },
      { name: "gesture_auto", autoPlay: "on_gesture", showPlayButton: true },
    ];

    return this.assignVariant(experiment, userId, variants);
  }

  // Test different player UI layouts
  testPlayerLayout(userId) {
    const experiment = "player_layout_v2";
    const variants = [
      { name: "horizontal", layout: "horizontal", controlsPosition: "bottom" },
      { name: "vertical", layout: "vertical", controlsPosition: "right" },
      { name: "minimal", layout: "minimal", controlsPosition: "overlay" },
      { name: "full_featured", layout: "full", showWaveform: true },
    ];

    return this.assignVariant(experiment, userId, variants);
  }

  // Test audio quality vs performance trade-offs
  testQualitySettings(userId, networkType) {
    const experiment = "quality_optimization_v1";
    let variants;

    if (networkType === "4g" || networkType === "wifi") {
      variants = [
        { name: "high_quality", bitrate: 320, preload: "auto" },
        { name: "adaptive", bitrate: "adaptive", preload: "metadata" },
      ];
    } else {
      variants = [
        { name: "low_bandwidth", bitrate: 128, preload: "none" },
        { name: "progressive", bitrate: 192, preload: "metadata" },
      ];
    }

    return this.assignVariant(experiment, userId, variants);
  }

  assignVariant(experiment, userId, variants) {
    // Consistent assignment based on user ID
    const hash = this.hashUserId(userId, experiment);
    const variantIndex = hash % variants.length;
    const variant = variants[variantIndex];

    this.userAssignments.set(`${experiment}_${userId}`, variant);

    // Track assignment
    this.trackEvent("experiment_assignment", {
      experiment,
      variant: variant.name,
      userId,
    });

    return variant;
  }

  // Measure experiment results
  measureExperimentResults(experiment) {
    return {
      conversionRates: this.getConversionRates(experiment),
      engagementMetrics: this.getEngagementMetrics(experiment),
      errorRates: this.getErrorRates(experiment),
      userSatisfaction: this.getUserSatisfactionScores(experiment),
    };
  }
}
```

## 3. Accessibility and Inclusive Design

### 3.1 Comprehensive Accessibility Implementation

```tsx
// Production-ready accessible audio component
const AccessibleAudioPlayer: React.FC<{
  src: string;
  title: string;
  transcript?: string;
  captions?: Caption[];
}> = ({ src, title, transcript, captions }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showTranscript, setShowTranscript] = useState(false);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const audio = audioRef.current;
      if (!audio) return;

      switch (e.code) {
        case "Space":
          e.preventDefault();
          isPlaying ? audio.pause() : audio.play();
          break;
        case "ArrowLeft":
          e.preventDefault();
          audio.currentTime = Math.max(0, audio.currentTime - 10);
          break;
        case "ArrowRight":
          e.preventDefault();
          audio.currentTime = Math.min(duration, audio.currentTime + 10);
          break;
        case "Home":
          e.preventDefault();
          audio.currentTime = 0;
          break;
        case "End":
          e.preventDefault();
          audio.currentTime = duration;
          break;
      }
    },
    [isPlaying, duration]
  );

  // Screen reader announcements
  const announceToScreenReader = useCallback((message: string) => {
    const announcement = document.createElement("div");
    announcement.setAttribute("aria-live", "polite");
    announcement.setAttribute("aria-atomic", "true");
    announcement.className = "sr-only";
    announcement.textContent = message;

    document.body.appendChild(announcement);
    setTimeout(() => document.body.removeChild(announcement), 1000);
  }, []);

  // Progress updates for screen readers
  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        const progress = Math.round((currentTime / duration) * 100);
        if (progress % 25 === 0) {
          // Announce at 25%, 50%, 75%, 100%
          announceToScreenReader(`${progress}% complete`);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isPlaying, currentTime, duration, announceToScreenReader]);

  return (
    <div
      role="application"
      aria-label={`Audio player: ${title}`}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      className="audio-player focus:outline-2 focus:outline-blue-500"
    >
      <audio
        ref={audioRef}
        src={src}
        aria-label={title}
        onPlay={() => {
          setIsPlaying(true);
          announceToScreenReader("Audio playing");
        }}
        onPause={() => {
          setIsPlaying(false);
          announceToScreenReader("Audio paused");
        }}
        onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
        onDurationChange={() => setDuration(audioRef.current?.duration || 0)}
        onEnded={() => announceToScreenReader("Audio playback complete")}
      />

      {/* Main controls */}
      <div className="controls" role="group" aria-label="Audio controls">
        <button
          onClick={() =>
            isPlaying ? audioRef.current?.pause() : audioRef.current?.play()
          }
          aria-label={isPlaying ? `Pause ${title}` : `Play ${title}`}
          className="play-pause-btn"
        >
          {isPlaying ? <PauseIcon /> : <PlayIcon />}
        </button>

        {/* Progress slider with proper ARIA */}
        <div className="progress-container">
          <label htmlFor="audio-progress" className="sr-only">
            Audio progress: {formatTime(currentTime)} of {formatTime(duration)}
          </label>
          <input
            id="audio-progress"
            type="range"
            min={0}
            max={duration || 0}
            value={currentTime}
            onChange={(e) => {
              const newTime = parseFloat(e.target.value);
              if (audioRef.current) {
                audioRef.current.currentTime = newTime;
              }
            }}
            aria-valuetext={`${formatTime(currentTime)} of ${formatTime(
              duration
            )}`}
            className="progress-slider"
          />
        </div>

        {/* Playback speed control */}
        <div className="speed-control">
          <label htmlFor="playback-rate">Speed:</label>
          <select
            id="playback-rate"
            value={playbackRate}
            onChange={(e) => {
              const rate = parseFloat(e.target.value);
              setPlaybackRate(rate);
              if (audioRef.current) {
                audioRef.current.playbackRate = rate;
              }
              announceToScreenReader(`Playback speed set to ${rate}x`);
            }}
            aria-label="Playback speed"
          >
            <option value={0.5}>0.5x</option>
            <option value={0.75}>0.75x</option>
            <option value={1}>1x</option>
            <option value={1.25}>1.25x</option>
            <option value={1.5}>1.5x</option>
            <option value={2}>2x</option>
          </select>
        </div>
      </div>

      {/* Transcript toggle */}
      {transcript && (
        <div className="transcript-section">
          <button
            onClick={() => setShowTranscript(!showTranscript)}
            aria-expanded={showTranscript}
            aria-controls="audio-transcript"
          >
            {showTranscript ? "Hide" : "Show"} Transcript
          </button>

          {showTranscript && (
            <div
              id="audio-transcript"
              className="transcript"
              role="region"
              aria-label="Audio transcript"
            >
              {transcript}
            </div>
          )}
        </div>
      )}

      {/* Keyboard shortcuts help */}
      <details className="keyboard-help">
        <summary>Keyboard shortcuts</summary>
        <ul>
          <li>
            <kbd>Space</kbd> - Play/Pause
          </li>
          <li>
            <kbd>←</kbd> - Rewind 10 seconds
          </li>
          <li>
            <kbd>→</kbd> - Forward 10 seconds
          </li>
          <li>
            <kbd>Home</kbd> - Go to beginning
          </li>
          <li>
            <kbd>End</kbd> - Go to end
          </li>
        </ul>
      </details>
    </div>
  );
};
```

### 3.2 WCAG Compliance Testing

```javascript
// Automated accessibility testing for audio components
class AudioAccessibilityTester {
  async runAccessibilityAudit(audioComponent) {
    const results = {
      colorContrast: await this.testColorContrast(audioComponent),
      keyboardNavigation: await this.testKeyboardNavigation(audioComponent),
      screenReaderCompatibility: await this.testScreenReaderLabels(
        audioComponent
      ),
      focusManagement: await this.testFocusManagement(audioComponent),
      ariaLabels: await this.testAriaLabels(audioComponent),
    };

    return {
      passed: Object.values(results).every((test) => test.passed),
      results,
      wcagLevel: this.calculateWCAGCompliance(results),
    };
  }

  async testColorContrast(component) {
    // Test color contrast ratios for WCAG AA/AAA compliance
    const elements = component.querySelectorAll(
      'button, [role="button"], input'
    );
    const contrastIssues = [];

    for (const element of elements) {
      const contrast = this.calculateContrast(element);
      if (contrast < 4.5) {
        // WCAG AA standard
        contrastIssues.push({
          element: element.tagName,
          contrast,
          required: 4.5,
        });
      }
    }

    return {
      passed: contrastIssues.length === 0,
      issues: contrastIssues,
    };
  }

  async testKeyboardNavigation(component) {
    // Simulate keyboard navigation
    const focusableElements = component.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const issues = [];

    for (let i = 0; i < focusableElements.length; i++) {
      const element = focusableElements[i];
      element.focus();

      if (document.activeElement !== element) {
        issues.push(`Element ${i} cannot receive focus: ${element.tagName}`);
      }

      // Test keyboard activation
      if (
        element.tagName === "BUTTON" ||
        element.getAttribute("role") === "button"
      ) {
        const activated = this.simulateKeyPress(element, "Enter");
        if (!activated) {
          issues.push(
            `Button cannot be activated with keyboard: ${element.tagName}`
          );
        }
      }
    }

    return {
      passed: issues.length === 0,
      issues,
    };
  }
}
```

## 4. Performance Optimization at Scale

### 4.1 Memory Management

> **Architecture Scaling**: Memory management patterns extend the [React Audio Architecture](react-audio-architecture.md) cleanup strategies to production scale.

```javascript
// Production memory management for audio applications
class AudioMemoryManager {
  constructor() {
    this.audioPool = new Map(); // Reuse audio elements
    this.loadedAudio = new WeakMap(); // Track loaded audio data
    this.cleanupInterval = setInterval(this.performCleanup.bind(this), 30000); // 30s
  }

  getAudioElement(src) {
    // Try to reuse existing audio element
    let audio = this.audioPool.get(src);

    if (!audio) {
      audio = new Audio();
      this.setupAudioElement(audio, src);
      this.audioPool.set(src, audio);
    }

    return audio;
  }

  setupAudioElement(audio, src) {
    audio.preload = "metadata"; // Conservative preloading
    audio.src = src;

    // Memory cleanup on errors
    audio.addEventListener("error", () => {
      this.cleanupAudioElement(audio);
    });

    // Track memory usage
    this.loadedAudio.set(audio, {
      loadTime: Date.now(),
      lastUsed: Date.now(),
      memoryUsage: this.estimateMemoryUsage(audio),
    });
  }

  performCleanup() {
    const now = Date.now();
    const maxIdleTime = 5 * 60 * 1000; // 5 minutes

    for (const [src, audio] of this.audioPool.entries()) {
      const audioData = this.loadedAudio.get(audio);

      if (audioData && now - audioData.lastUsed > maxIdleTime) {
        this.cleanupAudioElement(audio);
        this.audioPool.delete(src);
      }
    }

    // Force garbage collection if memory usage is high
    if (this.getTotalMemoryUsage() > 100 * 1024 * 1024) {
      // 100MB
      this.forceGarbageCollection();
    }
  }

  cleanupAudioElement(audio) {
    audio.pause();
    audio.removeAttribute("src");
    audio.load(); // Important: triggers cleanup
    this.loadedAudio.delete(audio);
  }

  estimateMemoryUsage(audio) {
    // Rough estimation based on duration and quality
    const duration = audio.duration || 0;
    const sampleRate = 44100; // Typical sample rate
    const bitDepth = 16; // Typical bit depth
    const channels = 2; // Stereo

    return duration * sampleRate * (bitDepth / 8) * channels;
  }
}
```

### 4.2 CDN and Caching Strategy

```javascript
// Advanced caching strategy for audio files
class AudioCacheManager {
  constructor() {
    this.cache = new Map();
    this.cacheSize = 0;
    this.maxCacheSize = 50 * 1024 * 1024; // 50MB
    this.setupServiceWorkerCache();
  }

  async setupServiceWorkerCache() {
    if ("serviceWorker" in navigator && "caches" in window) {
      const cache = await caches.open("audio-cache-v1");
      this.serviceWorkerCache = cache;
    }
  }

  async getAudio(url, options = {}) {
    // Try memory cache first
    if (this.cache.has(url)) {
      const cached = this.cache.get(url);
      cached.lastAccessed = Date.now();
      return cached.audio;
    }

    // Try service worker cache
    if (this.serviceWorkerCache) {
      const cachedResponse = await this.serviceWorkerCache.match(url);
      if (cachedResponse) {
        const audio = await this.createAudioFromResponse(cachedResponse);
        this.addToMemoryCache(url, audio);
        return audio;
      }
    }

    // Load from network with caching
    return this.loadAndCache(url, options);
  }

  async loadAndCache(url, options) {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Cache-Control": "max-age=3600", // 1 hour browser cache
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Audio load failed: ${response.status}`);
    }

    // Cache in service worker
    if (this.serviceWorkerCache) {
      await this.serviceWorkerCache.put(url, response.clone());
    }

    const audio = await this.createAudioFromResponse(response);
    this.addToMemoryCache(url, audio);

    return audio;
  }

  addToMemoryCache(url, audio) {
    const size = this.estimateAudioSize(audio);

    // Evict old entries if necessary
    while (this.cacheSize + size > this.maxCacheSize && this.cache.size > 0) {
      this.evictLeastRecentlyUsed();
    }

    this.cache.set(url, {
      audio,
      size,
      cached: Date.now(),
      lastAccessed: Date.now(),
    });

    this.cacheSize += size;
  }

  evictLeastRecentlyUsed() {
    let oldestEntry = null;
    let oldestTime = Date.now();

    for (const [url, entry] of this.cache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestEntry = url;
      }
    }

    if (oldestEntry) {
      const entry = this.cache.get(oldestEntry);
      this.cacheSize -= entry.size;
      this.cache.delete(oldestEntry);
    }
  }
}
```

## 5. Deployment and Operations

### 5.1 Health Monitoring

```typescript
// Production health monitoring for audio services
class AudioHealthMonitor {
  private healthMetrics: Map<string, any> = new Map();
  private alertThresholds = {
    errorRate: 0.05, // 5% error rate
    avgLoadTime: 3000, // 3 seconds
    memoryUsage: 100 * 1024 * 1024, // 100MB
  };

  async checkHealth(): Promise<HealthStatus> {
    const checks = await Promise.allSettled([
      this.checkAudioServiceHealth(),
      this.checkCDNHealth(),
      this.checkDatabaseHealth(),
      this.checkMemoryUsage(),
      this.checkErrorRates(),
    ]);

    const failed = checks.filter(
      (check) =>
        check.status === "rejected" ||
        (check.status === "fulfilled" && !check.value.healthy)
    );

    return {
      healthy: failed.length === 0,
      checks: checks.map((check) => ({
        name: check.status === "fulfilled" ? check.value.name : "unknown",
        healthy: check.status === "fulfilled" ? check.value.healthy : false,
        message:
          check.status === "fulfilled"
            ? check.value.message
            : check.reason?.message,
      })),
      timestamp: Date.now(),
    };
  }

  async checkAudioServiceHealth() {
    try {
      // Test audio loading from primary service
      const testAudio = new Audio("/api/health/test-audio.mp3");
      const startTime = Date.now();

      await new Promise((resolve, reject) => {
        testAudio.addEventListener("canplay", resolve, { once: true });
        testAudio.addEventListener("error", reject, { once: true });
        setTimeout(() => reject(new Error("Timeout")), 5000);
      });

      const loadTime = Date.now() - startTime;

      return {
        name: "audio_service",
        healthy: loadTime < this.alertThresholds.avgLoadTime,
        message: `Audio service responding in ${loadTime}ms`,
        metrics: { loadTime },
      };
    } catch (error) {
      return {
        name: "audio_service",
        healthy: false,
        message: `Audio service check failed: ${error.message}`,
      };
    }
  }

  setupAlerts() {
    // Set up monitoring alerts
    setInterval(async () => {
      const health = await this.checkHealth();

      if (!health.healthy) {
        await this.sendAlert({
          severity: "critical",
          message: "Audio service health check failed",
          details: health.checks.filter((check) => !check.healthy),
        });
      }

      // Check performance metrics
      const errorRate = this.calculateErrorRate();
      if (errorRate > this.alertThresholds.errorRate) {
        await this.sendAlert({
          severity: "warning",
          message: `High error rate detected: ${(errorRate * 100).toFixed(2)}%`,
          metrics: { errorRate },
        });
      }
    }, 60000); // Check every minute
  }

  private async sendAlert(alert: any) {
    // Send to alerting service (PagerDuty, Slack, etc.)
    try {
      await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...alert,
          timestamp: Date.now(),
          service: "audio-app",
        }),
      });
    } catch (error) {
      console.error("Failed to send alert:", error);
    }
  }
}
```

### 5.2 Feature Flags and Gradual Rollouts

```javascript
// Feature flag system for audio features
class AudioFeatureFlags {
  constructor() {
    this.flags = new Map();
    this.userSegments = new Map();
    this.loadFeatureFlags();
  }

  async loadFeatureFlags() {
    try {
      const response = await fetch("/api/feature-flags");
      const flags = await response.json();

      flags.forEach((flag) => {
        this.flags.set(flag.name, flag);
      });
    } catch (error) {
      console.error("Failed to load feature flags:", error);
      // Use default/cached flags
    }
  }

  isEnabled(flagName, userId, context = {}) {
    const flag = this.flags.get(flagName);
    if (!flag) return false;

    // Check if flag is globally enabled
    if (!flag.enabled) return false;

    // Check user segment targeting
    if (flag.userSegments && flag.userSegments.length > 0) {
      const userSegment = this.getUserSegment(userId);
      if (!flag.userSegments.includes(userSegment)) {
        return false;
      }
    }

    // Check percentage rollout
    if (flag.percentage < 100) {
      const hash = this.hashUserId(userId, flagName);
      if (hash % 100 >= flag.percentage) {
        return false;
      }
    }

    // Check context conditions
    if (flag.conditions) {
      return this.evaluateConditions(flag.conditions, context);
    }

    return true;
  }

  // Audio-specific feature flags
  getAudioFeatures(userId, context) {
    return {
      enhancedPlayer: this.isEnabled("enhanced_audio_player", userId, context),
      adaptiveQuality: this.isEnabled(
        "adaptive_audio_quality",
        userId,
        context
      ),
      waveformVisualization: this.isEnabled("waveform_viz", userId, context),
      speedControl: this.isEnabled("playback_speed_control", userId, context),
      transcriptSync: this.isEnabled("transcript_sync", userId, context),
    };
  }

  // Gradual rollout for new audio formats
  getAudioFormatSupport(userId, context) {
    const features = {
      webm: true, // Always supported
      opus: this.isEnabled("opus_codec_support", userId, context),
      flac: this.isEnabled("flac_support", userId, context),
      dolbyAtmos: this.isEnabled("dolby_atmos", userId, context),
    };

    // Log feature usage for analysis
    this.trackFeatureUsage(userId, "audio_format_support", features);

    return features;
  }
}
```

## Conclusion

Production audio applications require comprehensive monitoring, analytics, and operational excellence. The patterns outlined here provide a foundation for building resilient, scalable audio services that deliver exceptional user experiences while maintaining operational visibility and control.

## Related Articles

- **[WebM Duration Debugging](../webm-duration-debugging.md)** - Real debugging case study that informed these monitoring strategies
- **[React Component UX Patterns](../react-component-ux-patterns.md)** - UX lessons that drive A/B testing approaches
- **[React Audio Architecture](react-audio-architecture.md)** - Component patterns that scale to production
- **[HTML5 Audio Events](html5-audio-events.md)** - Event handling foundation for monitoring
- **[Cross-Origin Audio](cross-origin-audio.md)** - Security considerations for production deployment
- **[WebM Format Analysis](webm-format-analysis.md)** - Format-specific monitoring requirements

## Further Reading

- [Web Performance Monitoring](https://web.dev/monitoring/)
- [Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Service Worker Caching](https://developers.google.com/web/ilt/pwa/caching-files-with-service-worker)
