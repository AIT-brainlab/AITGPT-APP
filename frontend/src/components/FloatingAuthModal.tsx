import { useState } from 'react';
import { User, UserRole } from '../types/auth';
import { loginUser } from '../utils/authService';
import { AlertCircle, ArrowRight, Eye, EyeOff, Lock, User as UserIcon, X, ArrowLeftRight, ArrowUpDown } from 'lucide-react';
import OwlMascot from './OwlMascot';

interface FloatingAuthModalProps {
  userType: UserRole;
  onAuthenticate: (user: User) => void;
  onClose: () => void;
  onContinueAsGuest?: () => void;
  width: number;
  height: number;
  isWide: boolean;
  isTall: boolean;
  onToggleWide: () => void;
  onToggleTall: () => void;
}

export function FloatingAuthModal({
  userType,
  onAuthenticate,
  onClose,
  onContinueAsGuest,
  width,
  height,
  isWide,
  isTall,
  onToggleWide,
  onToggleTall,
}: FloatingAuthModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const user = await loginUser({
        username: loginUsername,
        password: loginPassword,
        user_type: userType,
      });
      onAuthenticate(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed bottom-24 right-6 animate-slideUp flex flex-col"
      style={{
        width: `${width}px`,
        height: `${height}px`,
        maxWidth: 'calc(100vw - 48px)',
        maxHeight: 'calc(100vh - 120px)',
        background:
          'linear-gradient(125deg, #e8f5e9 0%, #ebf6ec 14%, #eff8ef 29%, #f2f9f2 43%, #f8fcf9 57%, #ffffff 100%)',
        borderRadius: '20px',
        border: '1px solid #c8d2e0',
        boxShadow: '0 20px 40px rgba(0,0,0,0.15), 0 8px 16px rgba(0,0,0,0.08)',
        overflow: 'hidden',
        fontFamily: "'Inter', sans-serif",
        zIndex: 60,
        transition: 'width 0.25s ease, height 0.25s ease',
      }}
    >
      {/* Top-right controls: resize toggles + close */}
      <div className="absolute top-3 right-3 flex items-center gap-1" style={{ zIndex: 2 }}>
        <button
          onClick={onToggleWide}
          className="p-1 rounded-lg hover:bg-black/5 transition-colors"
          title={isWide ? 'Reduce width' : 'Increase width'}
          aria-label={isWide ? 'Reduce width' : 'Increase width'}
        >
          <ArrowLeftRight className="w-4 h-4" style={{ color: isWide ? '#2e7d32' : '#4a5568' }} />
        </button>
        <button
          onClick={onToggleTall}
          className="p-1 rounded-lg hover:bg-black/5 transition-colors"
          title={isTall ? 'Reduce height' : 'Increase height'}
          aria-label={isTall ? 'Reduce height' : 'Increase height'}
        >
          <ArrowUpDown className="w-4 h-4" style={{ color: isTall ? '#2e7d32' : '#4a5568' }} />
        </button>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-black/5 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" style={{ color: '#4a5568' }} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pt-8 pb-6">
        {/* Owl */}
        <div className="flex justify-center mb-3">
          <OwlMascot size={56} />
        </div>

        {/* Heading */}
        <h2
          className="text-center"
          style={{
            fontWeight: 700,
            fontSize: '22px',
            lineHeight: '28px',
            color: '#0f172b',
            letterSpacing: '-0.01em',
          }}
        >
          Welcome back
        </h2>
        <p
          className="text-center mt-1 mb-5"
          style={{
            fontSize: '13px',
            lineHeight: '18px',
            color: '#45556c',
          }}
        >
          Sign in to your AIT Assistant account
        </p>

        {/* Form card */}
        <div
          className="bg-white p-5"
          style={{
            border: '1px solid #e2e8f0',
            borderRadius: '16px',
            boxShadow: '0 8px 16px rgba(0,0,0,0.06), 0 2px 4px rgba(0,0,0,0.04)',
          }}
        >
          {error && (
            <div className="mb-3 p-2.5 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <p className="text-xs text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-3">
            {/* Username */}
            <div>
              <label
                htmlFor="floating-login-username"
                className="block mb-1.5"
                style={{ fontSize: '13px', fontWeight: 500, color: '#314158' }}
              >
                Username
              </label>
              <div className="relative">
                <UserIcon
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4"
                  style={{ color: '#6b7280' }}
                />
                <input
                  id="floating-login-username"
                  type="text"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  required
                  placeholder="Sara1234"
                  className="w-full pl-10 pr-4 py-3 text-sm outline-none focus:border-[#2e7d32] transition-colors"
                  style={{
                    background: '#f8f9fa',
                    border: '1px solid #cad5e2',
                    borderRadius: '14px',
                    color: '#314158',
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="floating-login-password"
                className="block mb-1.5"
                style={{ fontSize: '13px', fontWeight: 500, color: '#314158' }}
              >
                Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4"
                  style={{ color: '#6b7280' }}
                />
                <input
                  id="floating-login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 text-sm outline-none focus:border-[#2e7d32] transition-colors"
                  style={{
                    background: '#f8f9fa',
                    border: '1px solid #cad5e2',
                    borderRadius: '14px',
                    color: '#314158',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-gray-100"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" style={{ color: '#6b7280' }} />
                  ) : (
                    <Eye className="w-4 h-4" style={{ color: '#6b7280' }} />
                  )}
                </button>
              </div>
            </div>

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded accent-[#2e7d32]"
                />
                <span style={{ fontSize: '13px', fontWeight: 500, color: '#45556c' }}>
                  Remember me
                </span>
              </label>
              <button
                type="button"
                className="hover:underline"
                style={{ fontSize: '13px', fontWeight: 500, color: '#2e7d32' }}
              >
                Forgot password?
              </button>
            </div>

            {/* Sign in button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 mt-1 flex items-center justify-center gap-2 text-white font-semibold text-sm transition-opacity disabled:opacity-60"
              style={{
                background: 'linear-gradient(90deg, #2e7d32 0%, #1b5e20 100%)',
                borderRadius: '14px',
                boxShadow: '0 8px 16px rgba(46,125,50,0.25), 0 2px 4px rgba(46,125,50,0.15)',
              }}
            >
              {isLoading ? (
                'Signing in...'
              ) : (
                <>
                  Sign in <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px" style={{ background: '#e2e8f0' }} />
            <span style={{ fontSize: '12px', color: '#62748e' }}>or continue as</span>
            <div className="flex-1 h-px" style={{ background: '#e2e8f0' }} />
          </div>

          {/* Continue as Guest */}
          <button
            type="button"
            onClick={onContinueAsGuest ?? onClose}
            className="w-full py-3 bg-white font-medium transition-colors hover:bg-gray-50"
            style={{
              border: '2px solid #cad5e2',
              borderRadius: '12px',
              color: '#314158',
              fontSize: '14px',
            }}
          >
            Continue as Guest
          </button>
        </div>
      </div>
    </div>
  );
}
