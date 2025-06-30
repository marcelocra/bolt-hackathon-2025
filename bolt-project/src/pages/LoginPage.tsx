import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Auth } from '../components/Auth';
import { Logo } from '../components/Logo';

/**
 * Login page component with authentication form
 */

export const LoginPage: React.FC = () => {
  const { user, loading } = useAuth();
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-pulse">
          <Logo size={48} className="text-blue-400" />
        </div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center p-4">
      {/* Ambient background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo and branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-3 mb-6">
            <Logo size={48} className="text-blue-400" />
            <div>
              <h1 className="text-3xl font-bold text-white">Janus Arc</h1>
              <p className="text-slate-400 text-sm">The AI Log for Startup Founders</p>
            </div>
          </div>
        </div>

        {/* Authentication form */}
        <Auth mode={authMode} onModeChange={setAuthMode} />

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-slate-500 text-xs">
            AI-Powered • Secure • Founder-Focused
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;