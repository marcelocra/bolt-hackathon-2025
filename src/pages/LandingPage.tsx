import React from "react";
import { Link } from "react-router";
import { Logo } from "../components/Logo";

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Ambient background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Header */}
      <header className="relative z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Logo size={32} className="text-blue-400" />
              <h1 className="text-xl font-bold text-white">Janus Arc</h1>
            </div>
            <Link
              to="/login"
              className="px-4 py-2 text-sm font-semibold bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
            >
              Login / Sign Up
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 py-10 sm:py-14 text-center">
        <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
          Turn your thoughts into strategy:{" "}
          <span className="block text-blue-400">
            The AI thinking partner for founders
          </span>
        </h2>
        <div className="mt-8">
          <Link
            to="/login"
            className="px-8 py-4 text-lg font-bold bg-blue-600 rounded-lg hover:bg-blue-700 transition-transform hover:scale-105 inline-block"
          >
            Get Started for Free
          </Link>
        </div>
      </main>

      {/* Features Section */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 py-10">
        <h3 className="text-3xl font-bold text-center mb-8">Why Janus Arc?</h3>
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div className="bg-slate-800/50 p-6 rounded-lg">
            <h4 className="text-xl font-semibold mb-2">
              Effortless Voice Logging
            </h4>
            <p className="text-slate-400">
              No more typing. Capture your stream of consciousness with
              high-quality voice recording.
            </p>
          </div>
          <div className="bg-slate-800/50 p-6 rounded-lg">
            <h4 className="text-xl font-semibold mb-2">
              AI-Powered Transcription
            </h4>
            <p className="text-slate-400">
              Accurate, fast, and reliable transcription for all your voice
              notes.
            </p>
          </div>
          <div className="bg-slate-800/50 p-6 rounded-lg">
            <h4 className="text-xl font-semibold mb-2">Smart Organization</h4>
            <p className="text-slate-400">
              Automatically categorize and tag your logs for easy retrieval.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-700/50 mt-16">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center">
          <p className="text-slate-500 text-sm">
            © 2025 Janus Arc. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};
