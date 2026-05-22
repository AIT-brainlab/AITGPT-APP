import { useEffect, useState } from 'react';
import { UserRole } from '../types/auth';
import { authenticateUser } from '../utils/authService';

export function SSOLoginPage() {
  const [role, setRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [authStatus, setAuthStatus] = useState<'authenticating' | 'success'>('authenticating');

  useEffect(() => {
    // Get the role from URL parameters
    const params = new URLSearchParams(window.location.search);
    const roleParam = params.get('role') as UserRole;
    if (roleParam) {
      setRole(roleParam);
      // Auto-authenticate after role is set
      performAutoLogin(roleParam);
    }
  }, []);

  const performAutoLogin = async (userRole: UserRole) => {
    setIsLoading(true);

    try {
      console.log('Starting authentication for role:', userRole);
      
      // Simulate authentication delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Authenticate the user
      const user = await authenticateUser(userRole);
      console.log('Authentication successful:', user);

      setAuthStatus('success');

      // Send the authenticated user back to the parent window
      if (window.opener && !window.opener.closed) {
        console.log('Sending message to parent window');
        window.opener.postMessage(
          {
            type: 'SSO_AUTH_SUCCESS',
            user: user,
          },
          '*' // Use wildcard for cross-origin compatibility in development
        );
        console.log('Message sent successfully');
      } else {
        console.error('No opener window available');
      }

      // Close window after success message is shown
      setTimeout(() => {
        console.log('Closing window');
        window.close();
      }, 1500);
    } catch (error) {
      console.error('Authentication error:', error);
    }
  };

  if (!role) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#4a7a3d] to-[#3C6031] flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 text-center">
          <p className="text-red-600">Invalid authentication request</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#4a7a3d] to-[#3C6031] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors ${
            authStatus === 'success' ? 'bg-green-500' : 'bg-[#5a8f47]'
          }`}>
            {authStatus === 'success' ? (
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-8 h-8 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            )}
          </div>
          <h1 className="text-2xl font-bold text-gray-900">AIT SSO Login</h1>
          <p className="text-sm text-gray-600 mt-1">Asian Institute of Technology</p>
        </div>

        {/* Status Display */}
        <div className="space-y-4">
          <div className="text-center py-8">
            {authStatus === 'authenticating' ? (
              <>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Authenticating...</h3>
                <p className="text-sm text-gray-600">Verifying your credentials</p>
                <div className="mt-4">
                  <div className="inline-block px-4 py-2 bg-green-50 rounded-lg border border-[#5a8f47]/20">
                    <p className="text-sm text-gray-700 capitalize">Role: <span className="font-semibold text-[#5a8f47]">{role}</span></p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-lg font-semibold text-green-700 mb-2">Authentication Successful!</h3>
                <p className="text-sm text-gray-600">Redirecting back to chat...</p>
              </>
            )}
          </div>

          {/* Info */}
          <div className="p-3 bg-green-50 rounded-lg border border-[#5a8f47]/20">
            <p className="text-xs text-gray-600 text-center">
              This is a simulated SSO login for demonstration purposes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
