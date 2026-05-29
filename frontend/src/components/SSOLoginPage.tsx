import { useEffect, useState } from 'react';
import { User, UserRole } from '../types/auth';
import { authenticateUser, loginUser } from '../utils/authService';
import { User as UserIcon, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';
import OwlMascot from './OwlMascot';

const POPPINS = "'Poppins', sans-serif";

const PAGE_GRADIENT =
  'linear-gradient(125.03deg, #e8f5e9 0%, #ebf6ec 7.1429%, #eff8ef 14.286%, #f2f9f2 21.429%, #f5fbf6 28.571%, #f8fcf9 35.714%, #fcfefc 42.857%, #ffffff 50%, #ffffff 100%)';

// Figma: 13-stop gradient from #2e7d32 → #1b5e20; collapsed to 2 stops (visually identical).
const SIGN_IN_GRADIENT = 'linear-gradient(90deg, #2e7d32 0%, #1b5e20 100%)';

export function SSOLoginPage() {
  const [role, setRole] = useState<UserRole | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roleParam = params.get('role') as UserRole | null;
    if (roleParam) setRole(roleParam);
  }, []);

  const sendAuthSuccess = (user: User) => {
    if (window.opener && !window.opener.closed) {
      window.opener.postMessage({ type: 'SSO_AUTH_SUCCESS', user }, '*');
    }
    setTimeout(() => window.close(), 300);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) return;
    setError(null);
    setIsLoading(true);
    try {
      const user = await loginUser({ username, password, user_type: role });
      sendAuthSuccess(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
      setIsLoading(false);
    }
  };

  const handleGuest = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const user = await authenticateUser('guest');
      sendAuthSuccess(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to continue as guest.');
      setIsLoading(false);
    }
  };

  if (!role) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{ background: PAGE_GRADIENT, fontFamily: POPPINS }}
      >
        <div
          className="bg-white text-center"
          style={{
            borderRadius: '16px',
            padding: '32px',
            boxShadow: '0 20px 25px rgba(0,0,0,0.1), 0 8px 10px rgba(0,0,0,0.1)',
            border: '0.636px solid #e2e8f0',
          }}
        >
          <p style={{ color: '#dc2626', fontFamily: POPPINS, fontWeight: 500 }}>
            Invalid authentication request
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: PAGE_GRADIENT, fontFamily: POPPINS }}
    >
      <div style={{ width: '100%', maxWidth: '448px' }}>
        {/* Header — owl + heading + subtitle (Figma: 80x80 owl image, no halo) */}
        <div className="flex flex-col items-center" style={{ marginBottom: '32px' }}>
          <div
            className="flex items-center justify-center"
            style={{ width: '80px', height: '80px', marginBottom: '24px' }}
          >
            <OwlMascot size={62} hideBackground={true} />
          </div>
          <h1
            style={{
              fontFamily: POPPINS,
              fontWeight: 700,
              fontSize: '30px',
              lineHeight: '36px',
              color: '#0f172b',
              margin: 0,
              textAlign: 'center',
            }}
          >
            Welcome back
          </h1>
          <p
            style={{
              fontFamily: POPPINS,
              fontWeight: 400,
              fontSize: '16px',
              lineHeight: '24px',
              color: '#45556c',
              marginTop: '8px',
              marginBottom: 0,
              textAlign: 'center',
            }}
          >
            Sign in to your AIT Assistant account
          </p>
        </div>

        {/* Form card */}
        <div
          className="bg-white"
          style={{
            borderRadius: '16px',
            border: '0.636px solid #e2e8f0',
            padding: '32px',
            boxShadow: '0 20px 25px rgba(0,0,0,0.1), 0 8px 10px rgba(0,0,0,0.1)',
          }}
        >
          {error && (
            <div
              className="flex items-start gap-2"
              style={{
                marginBottom: '16px',
                padding: '12px',
                borderRadius: '12px',
                background: '#fef2f2',
                border: '1px solid #fecaca',
              }}
            >
              <AlertCircle className="w-5 h-5 shrink-0" style={{ color: '#dc2626', marginTop: '2px' }} />
              <p style={{ fontSize: '14px', color: '#b91c1c', margin: 0, fontFamily: POPPINS }}>{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Username */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label
                htmlFor="sso-username"
                style={{
                  fontFamily: POPPINS,
                  fontWeight: 500,
                  fontSize: '14px',
                  lineHeight: '20px',
                  color: '#314158',
                }}
              >
                Username
              </label>
              <div className="relative">
                <UserIcon
                  className="w-5 h-5 absolute"
                  style={{ left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }}
                />
                <input
                  id="sso-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={isLoading}
                  placeholder="Enter your username"
                  className="w-full focus:outline-none focus:ring-2 focus:ring-[#2e7d32]/30"
                  style={{
                    height: '48px',
                    paddingLeft: '48px',
                    paddingRight: '16px',
                    background: '#f8f9fa',
                    border: '0.636px solid #cad5e2',
                    borderRadius: '16px',
                    fontFamily: POPPINS,
                    fontSize: '14px',
                    color: '#0f172b',
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label
                htmlFor="sso-password"
                style={{
                  fontFamily: POPPINS,
                  fontWeight: 500,
                  fontSize: '14px',
                  lineHeight: '20px',
                  color: '#314158',
                }}
              >
                Password
              </label>
              <div className="relative">
                <Lock
                  className="w-5 h-5 absolute"
                  style={{ left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }}
                />
                <input
                  id="sso-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  placeholder="Enter your password"
                  className="w-full focus:outline-none focus:ring-2 focus:ring-[#2e7d32]/30"
                  style={{
                    height: '48px',
                    paddingLeft: '48px',
                    paddingRight: '48px',
                    background: '#f8f9fa',
                    border: '0.636px solid #cad5e2',
                    borderRadius: '16px',
                    fontFamily: POPPINS,
                    fontSize: '14px',
                    color: '#0f172b',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute"
                  style={{
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    color: '#6b7280',
                  }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Remember me + Forgot password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={isLoading}
                  className="cursor-pointer"
                  style={{ width: '16px', height: '16px', accentColor: '#2e7d32' }}
                />
                <span
                  style={{
                    fontFamily: POPPINS,
                    fontWeight: 500,
                    fontSize: '14px',
                    lineHeight: '20px',
                    color: '#45556c',
                  }}
                >
                  Remember me
                </span>
              </label>
              <button
                type="button"
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  fontFamily: POPPINS,
                  fontWeight: 500,
                  fontSize: '14px',
                  lineHeight: '20px',
                  color: '#2e7d32',
                }}
              >
                Forgot password?
              </button>
            </div>

            {/* Sign in button */}
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center justify-center gap-2 transition-opacity disabled:opacity-60"
              style={{
                height: '48px',
                width: '100%',
                borderRadius: '16px',
                background: SIGN_IN_GRADIENT,
                boxShadow: '0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.1)',
                border: 'none',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontFamily: POPPINS,
                fontWeight: 600,
                fontSize: '14px',
                lineHeight: '20px',
                color: '#ffffff',
              }}
            >
              <span>{isLoading ? 'Signing in…' : 'Sign in'}</span>
              {!isLoading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          {/* "or continue as" divider */}
          <div
            className="flex items-center"
            style={{ margin: '24px 0', gap: '12px' }}
          >
            <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
            <span
              style={{
                fontFamily: POPPINS,
                fontWeight: 400,
                fontSize: '14px',
                lineHeight: '20px',
                color: '#62748e',
                whiteSpace: 'nowrap',
              }}
            >
              or continue as
            </span>
            <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
          </div>

          {/* Continue as Guest */}
          <button
            type="button"
            onClick={handleGuest}
            disabled={isLoading}
            className="w-full transition-colors hover:bg-[#f8f9fa] disabled:opacity-60"
            style={{
              height: '48px',
              borderRadius: '12px',
              background: '#ffffff',
              border: '1.909px solid #cad5e2',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontFamily: POPPINS,
              fontWeight: 500,
              fontSize: '16px',
              lineHeight: '24px',
              color: '#314158',
            }}
          >
            Continue as Guest
          </button>
        </div>
      </div>
    </div>
  );
}
