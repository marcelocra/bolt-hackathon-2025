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

### Current Known Issues

Per README.md, audio player integration with HistoryList has seek functionality problems and incorrect duration display.

## Development Notes

- Uses React 19 with modern patterns (StrictMode, createRoot)
- TypeScript strict mode enabled
- ESLint configured for React development
- TailwindCSS v4 for styling
- No testing framework currently configured
- Built with Bolt.new (hackathon requirement - displays "powered by" badge)
