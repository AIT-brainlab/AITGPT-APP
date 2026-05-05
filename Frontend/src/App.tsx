import { useState, useEffect } from 'react';
import { AITWebsite } from './components/AITWebsite';
import { FloatingChatButton } from './components/FloatingChatButton';
import { FloatingWelcomeCard } from './components/FloatingWelcomeCard';
import { FloatingAuthModal } from './components/FloatingAuthModal';
import { FloatingUserTypeSelection } from './components/FloatingUserTypeSelection';
import { FloatingLoadingScreen } from './components/FloatingLoadingScreen';
import { FloatingChatWidget } from './components/FloatingChatWidget';
import { FloatingOwlSplash } from './components/FloatingOwlSplash';
import { SSOLoginPage } from './components/SSOLoginPage';
import { User, UserRole } from './types/auth';
import { authenticateUser } from './utils/authService';
import { saveUserSession, loadUserSession, clearUserSession } from './utils/sessionStorage';

type WidgetState = 'closed' | 'owl-splash' | 'welcome' | 'user-type-selection' | 'auth-modal' | 'authenticating' | 'chat';

export default function App() {
  const [widgetState, setWidgetState] = useState<WidgetState>('closed');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showSSOPage, setShowSSOPage] = useState(false);
  const [selectedUserType, setSelectedUserType] = useState<UserRole | null>(null);

  // Load saved session on component mount
  useEffect(() => {
    const savedUser = loadUserSession();
    if (savedUser) {
      setCurrentUser(savedUser);
      // Don't auto-open widget, but keep user session ready
    }
  }, []);

  // Listen for SSO authentication messages
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      console.log('Message received:', event.data);
      
      // Accept messages from any origin in development (for popup compatibility)
      if (event.data && event.data.type === 'SSO_AUTH_SUCCESS') {
        console.log('SSO authentication successful, setting user:', event.data.user);
        const user = event.data.user;
        setCurrentUser(user);
        saveUserSession(user);
        setWidgetState('chat');
      }
    };

    window.addEventListener('message', handleMessage);
    console.log('Message listener attached');
    return () => {
      window.removeEventListener('message', handleMessage);
      console.log('Message listener removed');
    };
  }, []);

  const handleToggleChat = () => {
    if (widgetState === 'closed') {
      setWidgetState('owl-splash');
    } else {
      setWidgetState('closed');
      // Don't reset user when closing - keep session for next time
    }
  };

  const handleOwlSplashComplete = async () => {
    const savedUser = loadUserSession();
    if (savedUser) {
      setCurrentUser(savedUser);
      setWidgetState('chat');
    } else {
      const guestUser = await authenticateUser('guest');
      setCurrentUser(guestUser);
      saveUserSession(guestUser);
      setWidgetState('chat');
    }
  };

  const handleSignInFromChat = () => {
    clearUserSession();
    setCurrentUser(null);
    setWidgetState('user-type-selection');
  };

  const handleSignIn = () => {
    setWidgetState('user-type-selection');
  };

  const handleUserTypeSelected = (userType: UserRole) => {
    setSelectedUserType(userType);
    setWidgetState('auth-modal');
  };

  const handleContinueAsGuest = async () => {
    const guestUser = await authenticateUser('guest');
    setCurrentUser(guestUser);
    saveUserSession(guestUser);
    setWidgetState('chat');
  };

  const handleAuthenticate = (user: User) => {
    console.log('User authenticated:', user);
    setCurrentUser(user);
    saveUserSession(user);
    setWidgetState('chat');
  };

  const handleCloseWidget = () => {
    setWidgetState('closed');
    // Don't reset user when closing - keep session for next time
  };

  const handleBackToWelcome = () => {
    setWidgetState('welcome');
    setSelectedUserType(null);
  };

  const handleBackToUserTypeSelection = () => {
    setWidgetState('user-type-selection');
  };

  const handleSignOut = async () => {
    // Call logout API if needed
    try {
      const { logout } = await import('./utils/authApi');
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
    // Clear chat session ID
    try {
      const { clearSessionId } = await import('./utils/chatApi');
      clearSessionId();
    } catch (error) {
      console.error('Error clearing session:', error);
    }
    // Clear chat messages from Redux store
    try {
      const { clearAllMessages, setCurrentUser } = await import('./store/slices/chatSlice');
      const { store } = await import('./store/store');
      store.dispatch(clearAllMessages());
      store.dispatch(setCurrentUser(null));
    } catch (error) {
      console.error('Error clearing chat messages:', error);
    }
    // Clear user session from storage
    clearUserSession();
    setCurrentUser(null);
    setWidgetState('closed');
  };

  const isOpen = widgetState !== 'closed';

  // Check if we're in SSO mode
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('sso') === 'true') {
      setShowSSOPage(true);
    }
  }, []);

  // If in SSO mode, show the SSO login page
  if (showSSOPage) {
    return <SSOLoginPage />;
  }

  return (
    <div className="relative">
      {/* AIT Website Background */}
      <AITWebsite />

      {/* Floating Chat Button */}
      <FloatingChatButton
        isOpen={isOpen}
        onClick={handleToggleChat}
        hasUnreadMessages={false}
      />

      {/* Owl splash landing screen */}
      {widgetState === 'owl-splash' && (
        <FloatingOwlSplash onComplete={handleOwlSplashComplete} />
      )}

      {/* Floating Chat Widgets */}
      {widgetState === 'welcome' && (
        <FloatingWelcomeCard
          onSignIn={handleSignIn}
          onContinueAsGuest={handleContinueAsGuest}
          onClose={handleCloseWidget}
        />
      )}

      {widgetState === 'user-type-selection' && (
        <FloatingUserTypeSelection
          onSelectType={handleUserTypeSelected}
          onClose={handleBackToWelcome}
        />
      )}

      {widgetState === 'auth-modal' && selectedUserType && (
        <FloatingAuthModal
          userType={selectedUserType}
          onAuthenticate={handleAuthenticate}
          onClose={handleBackToUserTypeSelection}
        />
      )}

      {widgetState === 'authenticating' && (
        <FloatingLoadingScreen message="Authenticating..." />
      )}

      {widgetState === 'chat' && currentUser && (
        <FloatingChatWidget
          user={currentUser}
          onSignOut={handleSignOut}
          onSignIn={currentUser.role === 'guest' ? handleSignInFromChat : undefined}
        />
      )}

      {/* Backdrop for focus - only close on click when not in chat (chat closes via minimize/chat icon only) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/25 z-30 transition-all duration-300"
          onClick={() => widgetState !== 'chat' && handleCloseWidget()}
        />
      )}
    </div>
  );
}
