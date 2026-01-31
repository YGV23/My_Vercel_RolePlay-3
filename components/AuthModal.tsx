import React, { useState } from 'react';
import { LogIn, LogOut, Mail, Lock } from 'lucide-react';
import { authService, AuthUser } from '../services/authService';
import { Button } from './Button';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: AuthUser) => void;
  currentUser: AuthUser | null;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuthSuccess, currentUser }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    setError('');
    if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError('Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const { user, error: authError } = await authService.signUp(email, password);
    setLoading(false);

    if (authError) {
      setError(authError);
      return;
    }

    if (user) {
      onAuthSuccess(user);
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setIsSignUp(false);
      onClose();
    }
  };

  const handleSignIn = async () => {
    setError('');
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    const { user, error: authError } = await authService.signIn(email, password);
    setLoading(false);

    if (authError) {
      setError(authError);
      return;
    }

    if (user) {
      onAuthSuccess(user);
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setIsSignUp(false);
      onClose();
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    await authService.signOut();
    setLoading(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-[#0a0a0a] border border-zinc-800 rounded-lg shadow-2xl max-w-sm w-full mx-4 p-6">
        {currentUser ? (
          <>
            <h2 className="text-xl font-bold text-orange-500 mb-6 flex items-center gap-2">
              <LogOut size={20} />
              Account
            </h2>

            <div className="space-y-4 mb-6">
              <div className="p-4 bg-black/60 border border-zinc-800 rounded">
                <p className="text-zinc-400 text-sm">Logged in as</p>
                <p className="text-white font-bold truncate">{currentUser.email}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="ghost"
                onClick={onClose}
                className="flex-1"
              >
                Close
              </Button>
              <Button
                variant="danger"
                onClick={handleSignOut}
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'Signing out...' : 'Sign Out'}
              </Button>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-xl font-bold text-orange-500 mb-6 flex items-center gap-2">
              <LogIn size={20} />
              {isSignUp ? 'Create Account' : 'Sign In'}
            </h2>

            <div className="space-y-4 mb-6">
              <div>
                <label className="text-zinc-400 text-sm font-bold block mb-2">Email</label>
                <div className="flex items-center gap-2 bg-black/60 border border-zinc-800 rounded px-3 py-2 focus-within:border-orange-500 transition-colors">
                  <Mail size={16} className="text-zinc-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="flex-1 bg-transparent outline-none text-white text-sm"
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label className="text-zinc-400 text-sm font-bold block mb-2">Password</label>
                <div className="flex items-center gap-2 bg-black/60 border border-zinc-800 rounded px-3 py-2 focus-within:border-orange-500 transition-colors">
                  <Lock size={16} className="text-zinc-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="flex-1 bg-transparent outline-none text-white text-sm"
                    disabled={loading}
                  />
                </div>
              </div>

              {isSignUp && (
                <div>
                  <label className="text-zinc-400 text-sm font-bold block mb-2">Confirm Password</label>
                  <div className="flex items-center gap-2 bg-black/60 border border-zinc-800 rounded px-3 py-2 focus-within:border-orange-500 transition-colors">
                    <Lock size={16} className="text-zinc-500" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="flex-1 bg-transparent outline-none text-white text-sm"
                      disabled={loading}
                    />
                  </div>
                </div>
              )}

              {error && (
                <div className="p-3 bg-red-900/30 border border-red-800 rounded text-red-300 text-sm">
                  {error}
                </div>
              )}
            </div>

            <div className="space-y-3">
              <Button
                variant="primary"
                onClick={isSignUp ? handleSignUp : handleSignIn}
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Loading...' : isSignUp ? 'Create Account' : 'Sign In'}
              </Button>

              <button
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError('');
                  setPassword('');
                  setConfirmPassword('');
                }}
                disabled={loading}
                className="w-full text-zinc-400 hover:text-white text-sm transition-colors disabled:opacity-50"
              >
                {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Create one"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
