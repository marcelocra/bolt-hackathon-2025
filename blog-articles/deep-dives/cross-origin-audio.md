# Cross-Origin Audio: CORS, Security, and Signed URLs

## Introduction

Audio applications often deal with files stored across different domains, requiring careful CORS handling, security policies, and access control. This deep-dive covers the complexities of cross-origin audio delivery and production-ready implementation patterns.

## 1. CORS in Audio Context

### 1.1 Why Audio Has Special CORS Requirements

```javascript
// Audio elements have stricter CORS requirements than other media
const audio = new Audio(crossOriginUrl);
audio.crossOrigin = "anonymous"; // Required for programmatic access

// Without CORS headers, you get limited functionality:
audio.addEventListener("canplay", () => {
  console.log(audio.duration); // Works
  console.log(audio.currentTime); // Works

  // These operations may fail without proper CORS:
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  // ctx.drawImage(video, 0, 0); // Would fail for audio visualization
});
```

### 1.2 Browser Security Model

```javascript
// Different crossOrigin values and their implications
const CORS_MODES = {
  anonymous: {
    credentials: "exclude",
    use: "Public audio files, no user data needed",
    headers: "Access-Control-Allow-Origin: *",
  },
  "use-credentials": {
    credentials: "include",
    use: "Private audio files, user authentication required",
    headers: "Access-Control-Allow-Origin: specific-domain",
  },
};
```

### 1.3 Error Patterns and Debugging

```javascript
// Common CORS errors in audio applications
const audioCORSErrors = {
  "CORS policy blocked": {
    cause: "Missing Access-Control-Allow-Origin header",
    solution: "Configure server CORS headers",
    debugging: "Check Network tab, look for OPTIONS request",
  },
  "Mixed Content": {
    cause: "HTTP audio on HTTPS page",
    solution: "Use HTTPS for all audio resources",
    debugging: "Console shows mixed content warning",
  },
  "Credentials not allowed": {
    cause: 'crossOrigin="use-credentials" with wildcard CORS',
    solution: "Specify exact domain in CORS headers",
    debugging: "Network tab shows 403/401 responses",
  },
};
```

## 2. Signed URL Strategies

### 2.1 Supabase Implementation

```typescript
// Complete Supabase signed URL service
class SupabaseAudioService {
  constructor(private supabase: SupabaseClient) {}

  async getSignedUrl(
    bucket: string,
    path: string,
    expiresIn: number = 3600
  ): Promise<{ signedUrl: string; error: Error | null }> {
    try {
      const { data, error } = await this.supabase.storage
        .from(bucket)
        .createSignedUrl(path, expiresIn);

      if (error) {
        console.error("Signed URL generation failed:", error);
        return { signedUrl: "", error };
      }

      return { signedUrl: data.signedUrl, error: null };
    } catch (error) {
      return { signedUrl: "", error: error as Error };
    }
  }

  // Batch signed URL generation for playlists
  async getBatchSignedUrls(
    bucket: string,
    paths: string[]
  ): Promise<{ [path: string]: string }> {
    const results = await Promise.allSettled(
      paths.map((path) => this.getSignedUrl(bucket, path))
    );

    return results.reduce((acc, result, index) => {
      if (result.status === "fulfilled" && !result.value.error) {
        acc[paths[index]] = result.value.signedUrl;
      }
      return acc;
    }, {} as { [path: string]: string });
  }
}
```

### 2.2 AWS S3 Patterns

```javascript
// AWS S3 pre-signed URL implementation
const AWS = require("aws-sdk");

class S3AudioService {
  constructor() {
    this.s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_SECRET_KEY,
      region: process.env.AWS_REGION,
    });
  }

  generateSignedUrl(bucket, key, expires = 3600) {
    const params = {
      Bucket: bucket,
      Key: key,
      Expires: expires,
      ResponseContentType: "audio/mpeg", // Ensure proper content type
      ResponseCacheControl: "max-age=3600", // Browser caching
    };

    return this.s3.getSignedUrl("getObject", params);
  }

  // Range request support for large audio files
  generateRangeSignedUrl(bucket, key, start, end) {
    const params = {
      Bucket: bucket,
      Key: key,
      Range: `bytes=${start}-${end}`,
      Expires: 3600,
    };

    return this.s3.getSignedUrl("getObject", params);
  }
}
```

### 2.3 CDN Integration

```javascript
// CloudFront signed URL for global audio delivery
const cloudfront = require("aws-cloudfront-sign");

class CDNAudioService {
  generateCloudFrontUrl(url, expires) {
    const policy = JSON.stringify({
      Statement: [
        {
          Resource: url,
          Condition: {
            DateLessThan: {
              "AWS:EpochTime": Math.floor(expires / 1000),
            },
          },
        },
      ],
    });

    return cloudfront.getSignedUrl(url, {
      keypairId: process.env.CLOUDFRONT_KEY_PAIR_ID,
      privateKeyString: process.env.CLOUDFRONT_PRIVATE_KEY,
      policy: policy,
    });
  }
}
```

## 3. Progressive Loading and Streaming

### 3.1 Range Request Implementation

```typescript
// Progressive audio loading with range requests
class ProgressiveAudioLoader {
  private audio: HTMLAudioElement;
  private totalSize: number = 0;
  private loadedRanges: { start: number; end: number }[] = [];

  constructor(audio: HTMLAudioElement) {
    this.audio = audio;
    this.setupRangeLoading();
  }

  private async setupRangeLoading() {
    // Get total file size first
    const headResponse = await fetch(this.audio.src, { method: "HEAD" });
    this.totalSize = parseInt(
      headResponse.headers.get("content-length") || "0"
    );

    // Load initial chunk for metadata
    await this.loadRange(0, Math.min(1024 * 1024, this.totalSize)); // 1MB or full file
  }

  private async loadRange(start: number, end: number) {
    const response = await fetch(this.audio.src, {
      headers: {
        Range: `bytes=${start}-${end}`,
      },
    });

    if (response.status === 206) {
      // Partial Content
      this.loadedRanges.push({ start, end });
      // Process the chunk...
    }
  }

  // Preload upcoming audio data based on current position
  preloadUpcoming(currentTime: number, duration: number) {
    const percentage = currentTime / duration;
    const bytePosition = Math.floor(percentage * this.totalSize);
    const preloadSize = 512 * 1024; // 512KB lookahead

    this.loadRange(bytePosition, bytePosition + preloadSize);
  }
}
```

### 3.2 Adaptive Streaming Strategy

```javascript
// Adaptive bitrate selection based on network conditions
class AdaptiveAudioStreaming {
  constructor() {
    this.networkInfo = this.getNetworkInfo();
    this.qualityLevels = [
      { bitrate: 128, suffix: "_128k" },
      { bitrate: 192, suffix: "_192k" },
      { bitrate: 320, suffix: "_320k" },
    ];
  }

  getNetworkInfo() {
    // Use Network Information API if available
    if ("connection" in navigator) {
      return {
        downlink: navigator.connection.downlink, // Mbps
        effectiveType: navigator.connection.effectiveType, // '4g', '3g', etc.
        rtt: navigator.connection.rtt, // Round trip time
      };
    }
    return { downlink: 1, effectiveType: "3g", rtt: 300 }; // Conservative defaults
  }

  selectOptimalBitrate(baseUrl) {
    const { downlink, effectiveType } = this.networkInfo;

    // Quality selection logic
    if (effectiveType === "4g" && downlink > 2) {
      return baseUrl.replace(".webm", "_320k.webm");
    } else if (effectiveType === "3g" || downlink > 0.5) {
      return baseUrl.replace(".webm", "_192k.webm");
    } else {
      return baseUrl.replace(".webm", "_128k.webm");
    }
  }
}
```

## 4. Security Best Practices

### 4.1 Token-Based Access Control

```typescript
// JWT-based audio access control
interface AudioToken {
  userId: string;
  audioId: string;
  permissions: ("read" | "download")[];
  expiresAt: number;
}

class SecureAudioService {
  async generateAudioToken(
    userId: string,
    audioId: string,
    permissions: AudioToken["permissions"]
  ): Promise<string> {
    const token: AudioToken = {
      userId,
      audioId,
      permissions,
      expiresAt: Date.now() + 60 * 60 * 1000, // 1 hour
    };

    return jwt.sign(token, process.env.JWT_SECRET);
  }

  async validateAudioAccess(token: string): Promise<AudioToken | null> {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET) as AudioToken;

      if (decoded.expiresAt < Date.now()) {
        return null; // Token expired
      }

      return decoded;
    } catch (error) {
      return null; // Invalid token
    }
  }

  async getSecureAudioUrl(
    audioId: string,
    token: string
  ): Promise<string | null> {
    const tokenData = await this.validateAudioAccess(token);

    if (!tokenData || tokenData.audioId !== audioId) {
      return null;
    }

    // Generate signed URL only for valid tokens
    return this.generateSignedUrl(audioId);
  }
}
```

### 4.2 Rate Limiting and Abuse Prevention

```javascript
// Rate limiting for audio access
class AudioRateLimiter {
  constructor() {
    this.requestCounts = new Map(); // In production, use Redis
  }

  async checkRateLimit(userId, endpoint = "audio_access") {
    const key = `${userId}:${endpoint}`;
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute window
    const maxRequests = 100; // Max requests per window

    const requests = this.requestCounts.get(key) || [];

    // Remove old requests outside the window
    const validRequests = requests.filter((time) => now - time < windowMs);

    if (validRequests.length >= maxRequests) {
      throw new Error("Rate limit exceeded");
    }

    validRequests.push(now);
    this.requestCounts.set(key, validRequests);

    return true;
  }
}
```

## 5. Error Handling and Resilience

### 5.1 Comprehensive Error Recovery

```typescript
// Robust error handling for cross-origin audio
class ResilientAudioLoader {
  private retryAttempts: number = 0;
  private maxRetries: number = 3;
  private backoffMultiplier: number = 2;

  async loadAudio(url: string): Promise<HTMLAudioElement> {
    try {
      return await this.attemptLoad(url);
    } catch (error) {
      console.error("Audio loading failed:", error);
      return this.handleLoadError(error, url);
    }
  }

  private async attemptLoad(url: string): Promise<HTMLAudioElement> {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      const timeout = setTimeout(() => {
        reject(new Error("Audio load timeout"));
      }, 10000); // 10 second timeout

      audio.addEventListener("canplay", () => {
        clearTimeout(timeout);
        resolve(audio);
      });

      audio.addEventListener("error", () => {
        clearTimeout(timeout);
        reject(new Error(`Audio load failed: ${audio.error?.message}`));
      });

      audio.crossOrigin = "anonymous";
      audio.preload = "metadata";
      audio.src = url;
    });
  }

  private async handleLoadError(
    error: Error,
    originalUrl: string
  ): Promise<HTMLAudioElement> {
    if (this.retryAttempts < this.maxRetries) {
      this.retryAttempts++;
      const delay =
        1000 * Math.pow(this.backoffMultiplier, this.retryAttempts - 1);

      console.log(
        `Retrying audio load in ${delay}ms (attempt ${this.retryAttempts})`
      );

      await new Promise((resolve) => setTimeout(resolve, delay));

      // Try to refresh the signed URL
      const refreshedUrl = await this.refreshSignedUrl(originalUrl);
      return this.loadAudio(refreshedUrl || originalUrl);
    }

    throw error; // Max retries exceeded
  }

  private async refreshSignedUrl(originalUrl: string): Promise<string | null> {
    try {
      // Extract audio ID from URL and generate new signed URL
      const audioId = this.extractAudioId(originalUrl);
      return await this.audioService.getSignedUrl(audioId);
    } catch (error) {
      console.error("Failed to refresh signed URL:", error);
      return null;
    }
  }
}
```

### 5.2 Fallback Strategy Implementation

```javascript
// Multi-tier fallback for audio delivery
class AudioFallbackStrategy {
  constructor() {
    this.fallbackChain = [
      { type: "primary", getUrl: this.getPrimaryUrl },
      { type: "cdn", getUrl: this.getCDNUrl },
      { type: "mirror", getUrl: this.getMirrorUrl },
      { type: "cached", getUrl: this.getCachedUrl },
    ];
  }

  async loadWithFallback(audioId) {
    for (const strategy of this.fallbackChain) {
      try {
        const url = await strategy.getUrl(audioId);
        const audio = await this.testAudioUrl(url);
        console.log(
          `Audio loaded successfully using ${strategy.type} strategy`
        );
        return audio;
      } catch (error) {
        console.warn(`${strategy.type} strategy failed:`, error);
        continue;
      }
    }

    throw new Error("All fallback strategies exhausted");
  }

  async testAudioUrl(url) {
    // Quick test to verify URL is accessible
    const response = await fetch(url, { method: "HEAD" });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return new Promise((resolve, reject) => {
      const audio = new Audio(url);
      audio.addEventListener("canplay", () => resolve(audio), { once: true });
      audio.addEventListener("error", reject, { once: true });
    });
  }
}
```

## 6. Performance Monitoring

### 6.1 Audio-Specific Metrics

```typescript
// Performance monitoring for cross-origin audio
class AudioPerformanceMonitor {
  private metrics: Map<string, any> = new Map();

  startLoadTimer(audioId: string) {
    this.metrics.set(`${audioId}_load_start`, performance.now());
  }

  recordLoadComplete(audioId: string, success: boolean) {
    const startTime = this.metrics.get(`${audioId}_load_start`);
    if (startTime) {
      const loadTime = performance.now() - startTime;

      // Send to analytics
      this.sendMetric({
        event: "audio_load_complete",
        audioId,
        loadTime,
        success,
        timestamp: Date.now(),
      });
    }
  }

  recordCORSError(audioId: string, error: Error) {
    this.sendMetric({
      event: "cors_error",
      audioId,
      error: error.message,
      userAgent: navigator.userAgent,
      timestamp: Date.now(),
    });
  }

  private sendMetric(data: any) {
    // Send to your analytics service
    fetch("/api/metrics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).catch(console.error);
  }
}
```

## Conclusion

Cross-origin audio delivery requires careful consideration of security, performance, and user experience. The patterns outlined here provide a foundation for building robust audio applications that handle CORS complexities gracefully while maintaining security and performance standards.

## Further Reading

- [CORS Specification](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [AWS S3 Pre-signed URLs](https://docs.aws.amazon.com/AmazonS3/latest/userguide/PresignedUrlUploadObject.html)
- [Supabase Storage Security](https://supabase.com/docs/guides/storage)
