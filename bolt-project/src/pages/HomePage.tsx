import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Recorder } from '../components/Recorder';
import { HistoryList } from '../components/HistoryList';
import { UserProfile } from '../components/UserProfile';
import { Logo } from '../components/Logo';

/**
 * Home page component - main dashboard for voice journal
 */

export const HomePage: React.FC = () => {
  const { user, loading } = useAuth();
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  const handleEntryCreated = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-pulse">
          <Logo size={48} className="text-blue-400" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Ambient background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/3 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-slate-700/50 bg-slate-800/20 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Logo size={32} className="text-blue-400 flex-shrink-0" />
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl font-bold text-white truncate">Janus Arc</h1>
                <p className="text-slate-400 text-xs sm:text-sm">The AI Log for Startup Founders</p>
              </div>
            </div>

            {/* User profile dropdown */}
            <UserProfile />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 max-w-6xl mx-auto px-4 py-6 sm:py-8">
        <div className="space-y-6 sm:space-y-8">
          {/* Recording section */}
          <section className="flex justify-center">
            <Recorder onEntryCreated={handleEntryCreated} />
          </section>

          {/* History section */}
          <section className="flex justify-center">
            <HistoryList refreshTrigger={refreshTrigger} />
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-700/50 bg-slate-800/20 backdrop-blur-sm mt-12 sm:mt-16">
        <div className="max-w-6xl mx-auto px-4 py-4 sm:py-6">
          <div className="text-center">
            <p className="text-slate-500 text-xs sm:text-sm">
              © 2025 Janus Arc. The AI-powered voice log for startup founders.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;