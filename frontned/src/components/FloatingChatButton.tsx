import { X } from 'lucide-react';
import OwlMascot from './OwlMascot';

interface FloatingChatButtonProps {
  isOpen: boolean;
  onClick: () => void;
  hasUnreadMessages?: boolean;
}

export function FloatingChatButton({ isOpen, onClick, hasUnreadMessages }: FloatingChatButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`fixed bottom-6 right-6 z-50 shadow-2xl transition-all duration-300 ${
        isOpen
          ? 'bg-[#4a7a3d] hover:bg-[#3C6031] w-14 h-14'
          : 'w-16 h-16'
      } rounded-full flex items-center justify-center text-white group`}
      aria-label={isOpen ? 'Close chat' : 'Open chat'}
    >
      {isOpen ? (
        <X className="w-6 h-6" />
      ) : (
        <>
          <div className="group-hover:scale-110 transition-transform">
            <OwlMascot size={64} />
          </div>
          {hasUnreadMessages && (
            <span className="absolute top-0 right-0 w-4 h-4 bg-[#a1be37] rounded-full border-2 border-white animate-pulse"></span>
          )}
        </>
      )}
      {!isOpen && (
        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 -translate-y-full mb-2 px-3 py-1 bg-[#28393e] text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Need help? Chat with us!
        </div>
      )}
    </button>
  );
}
