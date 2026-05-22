import { useState } from 'react';
import { User, UserRole } from '../types/auth';
import { loginUser } from '../utils/authService';
import { LogIn, AlertCircle, X } from 'lucide-react';

interface FloatingAuthModalProps {
  userType: UserRole;
  onAuthenticate: (user: User) => void;
  onClose: () => void;
}

export function FloatingAuthModal({ userType, onAuthenticate, onClose }: FloatingAuthModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Login form state
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

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
      // Don't call onClose() here - let onAuthenticate handle the state transition
      // The modal will be hidden when widgetState changes to 'chat'
      onAuthenticate(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed bottom-24 right-6 bg-white rounded-2xl shadow-2xl z-40 animate-slideUp border border-[#5a8f47]/20 overflow-y-auto"
      style={{ width: '24rem', minWidth: '24rem', maxWidth: '90vw', maxHeight: '85vh' }}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-[#4a7a3d] to-[#3C6031] text-white px-4 py-3 rounded-t-2xl sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">Sign In</h3>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-lg p-1 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 min-h-[16rem]">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="floating-login-username" className="block text-sm font-medium text-gray-700 mb-1.5">
              Username
            </label>
            <input
              id="floating-login-username"
              type="text"
              value={loginUsername}
              onChange={(e) => setLoginUsername(e.target.value)}
              required
              className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5a8f47]"
              placeholder="Enter your username"
            />
          </div>

          <div>
            <label htmlFor="floating-login-password" className="block text-sm font-medium text-gray-700 mb-1.5">
              Password
            </label>
            <input
              id="floating-login-password"
              type="password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              required
              className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5a8f47]"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 px-4 rounded-lg font-semibold text-sm transition-colors ${
              isLoading
                ? 'bg-gray-400 cursor-not-allowed text-white'
                : 'bg-[#5a8f47] text-white hover:bg-[#4a7a3d]'
            }`}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
