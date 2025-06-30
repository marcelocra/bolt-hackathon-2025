import React from "react";
import { Link } from "react-router";
import { Logo } from "../components/Logo";
import { Mic, Brain, Layers, ArrowRight, Sparkles } from "lucide-react";

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Ambient background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 backdrop-blur-sm bg-slate-900/50 border-b border-slate-700/50">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Logo size={36} className="text-blue-400" />
              <h1 className="text-2xl font-bold text-white">Janus Arc</h1>
            </div>
            <Link
              to="/login"
              className="group px-6 py-3 text-sm font-semibold bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-blue-600/25 flex items-center space-x-2"
            >
              <span>Login / Sign Up</span>
              <ArrowRight
                size={16}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 max-w-6xl mx-auto px-4 py-12 sm:py-20 text-center">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-3xl mb-6 backdrop-blur-sm border border-blue-500/20 shadow-lg shadow-blue-500/10">
            <Sparkles className="text-blue-400" size={40} />
          </div>
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight leading-[1.05] mb-6">
          Turn your thoughts into strategy:{" "}
          <span className="block text-transparent bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text mt-2">
            The AI thinking partner for founders
          </span>
        </h1>
        <p className="text-lg sm:text-xl text-slate-300 max-w-4xl mx-auto leading-relaxed mb-8">
          Capture your stream of consciousness with voice, let AI transcribe and
          organize your thoughts, then turn them into actionable strategies.
          From brainstorms to board meetings, never lose a critical insight
          again.
        </p>

        {/* Value proposition badges */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          <span className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-300 text-sm font-medium backdrop-blur-sm">
            🎤 Voice-First
          </span>
          <span className="px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-300 text-sm font-medium backdrop-blur-sm">
            🧠 AI-Powered
          </span>
          <span className="px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-cyan-300 text-sm font-medium backdrop-blur-sm">
            ⚡ Instant Results
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            to="/login"
            className="group px-8 py-4 text-lg font-bold bg-gradient-to-r from-blue-600 via-blue-700 to-cyan-600 rounded-2xl hover:from-blue-700 hover:via-blue-800 hover:to-cyan-700 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-blue-600/30 inline-flex items-center space-x-3"
          >
            <span>Get Started for Free</span>
            <ArrowRight
              size={20}
              className="group-hover:translate-x-1 transition-transform duration-300"
            />
          </Link>
          <p className="text-slate-400 text-sm">
            No credit card required • 5 minutes to setup
          </p>
        </div>
      </main>

      {/* Features Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h3 className="text-4xl sm:text-5xl font-bold mb-4">
            Why Janus Arc?
          </h3>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
            Experience the future of strategic thinking with our AI-powered
            platform
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Feature Card 1 */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-0 group-hover:opacity-100"></div>
            <div className="relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl p-8 rounded-2xl border border-slate-700/50 hover:border-blue-500/50 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl hover:shadow-blue-600/20">
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl mb-6 group-hover:scale-110 transition-transform duration-300">
                <Mic className="text-white" size={32} />
              </div>
              <h4 className="text-2xl font-bold mb-4 text-white group-hover:text-blue-300 transition-colors">
                Effortless Voice Logging
              </h4>
              <p className="text-slate-400 text-lg leading-relaxed group-hover:text-slate-300 transition-colors">
                No more typing. Capture your stream of consciousness with
                high-quality voice recording that understands context and
                nuance.
              </p>
              <div className="mt-6 flex items-center text-blue-400 font-semibold group-hover:text-blue-300 transition-colors">
                <span>Learn more</span>
                <ArrowRight
                  size={16}
                  className="ml-2 group-hover:translate-x-2 transition-transform"
                />
              </div>
            </div>
          </div>

          {/* Feature Card 2 */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-0 group-hover:opacity-100"></div>
            <div className="relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl p-8 rounded-2xl border border-slate-700/50 hover:border-purple-500/50 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-600/20">
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl mb-6 group-hover:scale-110 transition-transform duration-300">
                <Brain className="text-white" size={32} />
              </div>
              <h4 className="text-2xl font-bold mb-4 text-white group-hover:text-purple-300 transition-colors">
                AI-Powered Transcription
              </h4>
              <p className="text-slate-400 text-lg leading-relaxed group-hover:text-slate-300 transition-colors">
                Accurate, fast, and reliable transcription powered by advanced
                AI that understands context, emotion, and strategic intent.
              </p>
              <div className="mt-6 flex items-center text-purple-400 font-semibold group-hover:text-purple-300 transition-colors">
                <span>Learn more</span>
                <ArrowRight
                  size={16}
                  className="ml-2 group-hover:translate-x-2 transition-transform"
                />
              </div>
            </div>
          </div>

          {/* Feature Card 3 */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/20 to-teal-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-0 group-hover:opacity-100"></div>
            <div className="relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl p-8 rounded-2xl border border-slate-700/50 hover:border-cyan-500/50 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl hover:shadow-cyan-600/20">
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-xl mb-6 group-hover:scale-110 transition-transform duration-300">
                <Layers className="text-white" size={32} />
              </div>
              <h4 className="text-2xl font-bold mb-4 text-white group-hover:text-cyan-300 transition-colors">
                Smart Organization
              </h4>
              <p className="text-slate-400 text-lg leading-relaxed group-hover:text-slate-300 transition-colors">
                Automatically categorize, tag, and connect your thoughts into
                actionable strategies with intelligent pattern recognition.
              </p>
              <div className="mt-6 flex items-center text-cyan-400 font-semibold group-hover:text-cyan-300 transition-colors">
                <span>Learn more</span>
                <ArrowRight
                  size={16}
                  className="ml-2 group-hover:translate-x-2 transition-transform"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-700/50 mt-12 backdrop-blur-sm bg-slate-900/50">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <Logo size={20} className="text-blue-400" />
              <span className="text-slate-400 text-sm">Janus Arc</span>
            </div>
            <p className="text-slate-500 text-xs">
              © 2025 Janus Arc. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
