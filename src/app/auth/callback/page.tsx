'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

function AuthCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your email...');
  const [isRecovery, setIsRecovery] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const handleCallback = async () => {
      const type = searchParams.get('type');

      if (type === 'recovery') {
        setIsRecovery(true);
        setMessage('Set your new password');
        setStatus('success');
        return;
      }

      // Handle email confirmation
      if (!supabase) {
        setStatus('error');
        setMessage('Authentication not configured');
        return;
      }

      try {
        // Get the session from URL hash (Supabase puts tokens there)
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          setStatus('error');
          setMessage(error.message);
          return;
        }

        if (session) {
          setStatus('success');
          setMessage('Email confirmed! Redirecting...');
          setTimeout(() => router.push('/'), 2000);
        } else {
          // Try to exchange the code
          const code = searchParams.get('code');
          if (code) {
            const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
            if (exchangeError) {
              setStatus('error');
              setMessage(exchangeError.message);
            } else {
              setStatus('success');
              setMessage('Email confirmed! Redirecting...');
              setTimeout(() => router.push('/'), 2000);
            }
          } else {
            setStatus('error');
            setMessage('Invalid confirmation link');
          }
        }
      } catch (err: any) {
        setStatus('error');
        setMessage(err.message || 'Something went wrong');
      }
    };

    handleCallback();
  }, [searchParams, router]);

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    if (!supabase) {
      setPasswordError('Authentication not configured');
      return;
    }

    setIsUpdating(true);

    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });

      if (error) {
        setPasswordError(error.message);
        setIsUpdating(false);
      } else {
        setMessage('Password updated! Redirecting...');
        setIsRecovery(false);
        setTimeout(() => router.push('/'), 2000);
      }
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to update password');
      setIsUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-2xl border border-slate-700 p-8 w-full max-w-md text-center">
        {/* Logo */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold mb-2">Amplify</h1>

        {isRecovery ? (
          <form onSubmit={handlePasswordUpdate} className="mt-6 space-y-4 text-left">
            <p className="text-slate-400 text-center mb-4">Enter your new password below</p>

            {passwordError && (
              <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm">
                {passwordError}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                required
                minLength={6}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={isUpdating}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-lg font-semibold transition-all disabled:opacity-50"
            >
              {isUpdating ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        ) : (
          <>
            {status === 'loading' && (
              <div className="mt-6">
                <div className="w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-slate-400">{message}</p>
              </div>
            )}

            {status === 'success' && (
              <div className="mt-6">
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-green-400 font-medium">{message}</p>
              </div>
            )}

            {status === 'error' && (
              <div className="mt-6">
                <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <p className="text-red-400 font-medium mb-4">{message}</p>
                <button
                  onClick={() => router.push('/')}
                  className="text-purple-400 hover:text-purple-300 text-sm"
                >
                  Return to home
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Loading fallback for Suspense
function LoadingFallback() {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-2xl border border-slate-700 p-8 w-full max-w-md text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold mb-2">Amplify</h1>
        <div className="mt-6">
          <div className="w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    </div>
  );
}

// Main export wrapped in Suspense
export default function AuthCallback() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AuthCallbackContent />
    </Suspense>
  );
}
