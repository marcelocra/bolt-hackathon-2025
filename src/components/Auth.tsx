import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Mail, Lock, User, Loader2 } from "lucide-react";

/**
 * Authentication component handling sign in and sign up
 */

interface AuthProps {
  mode?: "signin" | "signup";
  onModeChange?: (mode: "signin" | "signup") => void;
}

export const Auth: React.FC<AuthProps> = ({
  mode = "signin",
  onModeChange,
}) => {
  const { signIn, signUp } = useAuth();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (mode === "signin") {
        await signIn(email, password);
      } else {
        await signUp(email, password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-slate-700/50">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500/10 rounded-full mb-4">
            <User className="w-8 h-8 text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            {mode === "signin" ? "Welcome Back" : "Join Janus Arc"}
          </h2>
          <p className="text-slate-400">
            {mode === "signin"
              ? "Access your AI-powered founder log"
              : "Start your AI-enhanced founder journey"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-slate-300 mb-2"
            >
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter your email"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-slate-300 mb-2"
            >
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter your password"
                required
                disabled={loading}
                minLength={6}
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-blue-500/25"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>
                  {mode === "signin" ? "Signing In..." : "Creating Account..."}
                </span>
              </>
            ) : (
              <span>{mode === "signin" ? "Sign In" : "Create Account"}</span>
            )}
          </button>
        </form>

        {onModeChange && (
          <div className="mt-6 text-center">
            <p className="text-slate-400">
              {mode === "signin"
                ? "Don't have an account? "
                : "Already have an account? "}
              <button
                onClick={() =>
                  onModeChange(mode === "signin" ? "signup" : "signin")
                }
                className="text-blue-400 hover:text-blue-300 font-medium transition-colors duration-200"
                disabled={loading}
              >
                {mode === "signin" ? "Sign Up" : "Sign In"}
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Auth;
