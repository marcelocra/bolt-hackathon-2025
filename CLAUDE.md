# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Janus Arc** is a voice journaling web application built for Bolt's 2025 hackathon. It allows users to record audio, get AI-powered transcriptions, and manage their voice entries. The app is deployed at https://janusarc.com.

## Development Commands

- **Start development server**: `pnpm run dev`
- **Build for production**: `pnpm run build` (includes TypeScript compilation)
- **Lint code**: `pnpm run lint`
- **Preview production build**: `pnpm run preview`

Note: There are no test commands configured - verify functionality through manual testing and the build process.

## Technology Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: TailwindCSS v4 with Vite plugin
- **Routing**: React Router 7
- **Database & Auth**: Supabase (PostgreSQL + Auth)
- **Audio Processing**: ElevenLabs API for speech-to-text transcription
- **State Management**: React Context for authentication
- **Build Tool**: Vite with SWC for fast refresh

## Architecture Overview

### Authentication Flow

- Managed via `src/context/AuthContext.tsx` using Supabase Auth
- User session persists across page reloads
- Routes are protected but don't use route guards - authentication is handled in individual pages

### Core Application Structure

- **Entry Point**: `src/main.tsx` → `src/App.tsx`
- **Routing**: 5 main routes in App.tsx:
  - `/` - LandingPage (public)
  - `/login` - LoginPage (public)
  - `/app` - HomePage (main app interface)
  - `/settings` - SettingsPage
  - `/help` - HelpPage

### Audio Processing Pipeline

1. **Recording**: Browser MediaRecorder API captures audio as WebM
2. **Storage**: Original audio uploaded to Supabase Storage (private bucket)
3. **Transcription**: ElevenLabs Speech-to-Text API processes audio
4. **Database**: Entry metadata stored in Supabase `entries` table
5. **Playback**: Signed URLs generated for private audio file access

### Key Components

- **Recorder**: Handles audio recording with MediaRecorder
- **AudioPlayer**: Custom audio player with seek functionality
- **HistoryList**: Displays user's audio entries with playback/transcription
- **Auth**: Login/signup forms with Supabase integration

### Database Schema

- **entries** table: id, user_id, title, original_audio_url, transcription, duration, timestamps
- **Audio files**: Stored in Supabase Storage under user-specific folders

### API Integration

- **ElevenLabs**: Speech-to-text transcription with language auto-detection
- **Supabase**: Database operations, authentication, file storage
- **Language Support**: 24+ languages with 3-letter ISO codes

## Important Implementation Details

### Environment Variables

- `VITE_ELEVENLABS_API_KEY`: Required for transcription (format: sk\_\*)
- Supabase credentials configured in `src/services/supabaseClient.ts`

### File Organization

- **Components**: Reusable UI components in `src/components/`
- **Pages**: Route-level components in `src/pages/`
- **Services**: API logic in `src/services/` (api.ts, supabaseClient.ts)
- **Types**: TypeScript definitions in `src/types/index.ts`
- **Context**: React context providers in `src/context/`

### Audio Handling Specifics

- Audio stored as WebM format in Supabase Storage
- User-specific folder structure: `{userId}/{filename}`
- Private bucket with signed URLs for security
- Duration calculated on frontend during recording

## Recent Critical Fixes (December 2024)

### ✅ Audio Player Integration - RESOLVED
**Problem**: AudioPlayer showed "0:00 / 0:00" with disabled controls despite accessible audio files.
**Root Cause**: WebM files from MediaRecorder API don't provide reliable duration metadata (`audio.duration = Infinity`).
**Solution**: Implemented fallback duration strategy using database-stored duration calculated during recording.

**Key Implementation**:
```tsx
// AudioPlayer now accepts duration prop as fallback
<AudioPlayer
  src={signedUrl}
  title={entry.title}
  duration={entry.duration} // From database, calculated during recording
  onEnded={pauseAudio}
/>
```

### ✅ Menu Dropdown Navigation - RESOLVED  
**Problem**: Settings and Help page links in UserProfile dropdown didn't navigate.
**Root Cause**: Click-outside detection closed dropdown before navigation could complete.
**Solution**: Enhanced DOM targeting with `data-dropdown-menu` attribute and refined event handling.

## Audio Architecture Details

### WebM Duration Issue Understanding
- **MediaRecorder + WebM = No Duration**: Browser-generated WebM files often lack duration metadata
- **Signed URLs Work**: Files are accessible and playable, duration is the only issue
- **Fallback Strategy**: Always store duration during recording, use as fallback when `audio.duration = Infinity`

### AudioPlayer Component Architecture
```tsx
// Current working implementation
interface AudioPlayerProps {
  src: string;           // Signed URL from Supabase
  title: string;         
  subtitle?: string;     
  duration?: number;     // 👈 CRITICAL: Fallback from database
  onEnded?: () => void;
}
```

### HistoryList Integration Pattern
- **HistoryList button**: "Show/Hide Player" (blue → green state)
- **AudioPlayer button**: Actual playback controls (play/pause icons)
- **Auto-play**: AudioPlayer starts playing when component mounts
- **Event sync**: React state synced with HTML5 audio events (`play`, `pause`, `timeupdate`)

## Known Working Solutions

### Audio Duration Fallback
```tsx
// Fallback duration implementation in AudioPlayer
useEffect(() => {
  const checkDurationFallback = () => {
    if (duration === 0 && propDuration && propDuration > 0) {
      console.log('Using fallback duration from props:', propDuration);
      setDuration(propDuration);
    }
  };
  
  const timer = setTimeout(checkDurationFallback, 1000);
  return () => clearTimeout(timer);
}, [duration, propDuration]);
```

### Signed URL Generation
```tsx
// Working pattern for audio playback
const playAudio = async (entry: Entry) => {
  const audioPath = entry.processed_audio_url || entry.original_audio_url;
  const { data, error } = await supabase.storage
    .from("audio-recordings")
    .createSignedUrl(audioPath, 3600);
    
  if (error || !data?.signedUrl) {
    throw new Error(error?.message || "Failed to create signed URL");
  }
  
  setPlayingEntryId(entry.id);
  setPlayingEntryUrl(data.signedUrl);
};
```

## Blog Articles Documentation

Comprehensive debugging and solution documentation available in `/blog-articles/`:

### Main Articles (Ready for Publication)
- **`webm-duration-debugging.md`**: WebM duration mystery debugging story
- **`react-component-ux-patterns.md`**: React component UX anti-patterns and solutions

### Technical Deep-Dives (Outlines Ready)
- **`deep-dives/webm-format-analysis.md`**: WebM container format and MediaRecorder limitations
- **`deep-dives/html5-audio-events.md`**: Complete HTML5 audio event lifecycle
- **`deep-dives/react-audio-architecture.md`**: React audio component patterns and anti-patterns

## Development Notes

- Uses React 19 with modern patterns (StrictMode, createRoot)
- TypeScript strict mode enabled
- ESLint configured for React development
- TailwindCSS v4 for styling
- No testing framework currently configured
- Built with Bolt.new (hackathon requirement - displays "powered by" badge)

## Current Status: MVP Complete ✅

All critical MVP features are now working:
- ✅ Audio recording and storage
- ✅ Audio playback with seek functionality  
- ✅ Speech-to-text transcription
- ✅ User authentication and data persistence
- ✅ Menu navigation (Settings, Help pages)
- ✅ Responsive design and UX
