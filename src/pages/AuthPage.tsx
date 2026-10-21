import React, { useState } from 'react';
import {
  UtensilsCrossed,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  AlertCircle,
  Lock,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

interface AuthPageProps {
  onBackToLanding: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onBackToLanding }) => {
  const { signInWithGoogle, signInDemoGuest, loading } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const handleGoogleAuth = async () => {
    setError(null);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      console.error('Google Sign-In failed:', err);
      setError(
        err.message ||
          'Failed to complete Google Sign-In. You may also click "Instant Guest Demo" below to explore immediately.'
      );
    }
  };

  const handleDemoAuth = async () => {
    setError(null);
    try {
      await signInDemoGuest();
    } catch (err: any) {
      setError('Failed to initialize demo session.');
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-stone-200/80 p-8 space-y-6">
        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md shadow-emerald-600/20">
            <UtensilsCrossed className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">
            Welcome to NourishTrack
          </h1>
          <p className="text-xs text-stone-500">
            Eat. Track. Understand. Improve.
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-xs text-rose-800">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Auth Buttons */}
        <div className="space-y-3 pt-2">
          <button
            onClick={handleGoogleAuth}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-stone-50 border border-stone-300 text-stone-800 font-semibold py-3 px-4 rounded-2xl text-sm shadow-xs transition active:scale-95 disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-stone-200"></div>
            <span className="flex-shrink mx-3 text-stone-400 text-[11px] uppercase font-semibold">
              Or Instant Preview
            </span>
            <div className="flex-grow border-t border-stone-200"></div>
          </div>

          <button
            onClick={handleDemoAuth}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 font-bold py-3 px-4 rounded-2xl text-sm transition active:scale-95 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Instant Guest Demo Account</span>
          </button>
        </div>

        {/* Privacy Note */}
        <div className="pt-2 text-center space-y-3">
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-stone-500 font-medium">
            <Lock className="w-3.5 h-3.5 text-stone-400" />
            <span>Private sessions · Encrypted PostgreSQL persistence</span>
          </div>

          <button
            onClick={onBackToLanding}
            className="text-xs text-stone-500 hover:text-stone-800 underline transition"
          >
            Back to homepage
          </button>
        </div>
      </div>
    </div>
  );
};
