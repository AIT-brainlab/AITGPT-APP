import { MessageSquare, LogIn, UserCircle } from 'lucide-react';

interface FloatingWelcomeCardProps {
  onSignIn: () => void;
  onContinueAsGuest: () => void;
  onClose: () => void;
}

export function FloatingWelcomeCard({ onSignIn, onContinueAsGuest, onClose }: FloatingWelcomeCardProps) {
  return (
    <div
      className="fixed bottom-24 right-6 bg-white rounded-2xl shadow-2xl z-40 animate-slideUp border border-[#5a8f47]/20 overflow-hidden"
      style={{ width: '22rem', minWidth: '22rem', maxWidth: '90vw' }}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-[#4a7a3d] to-[#3C6031] text-white px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-[#4a7a3d]" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">AIT AI Assistant</h3>
              <p className="text-xs text-green-100">How can we help you today?</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-lg p-1 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-4 text-center">
          How would you like to proceed?
        </h4>
        
        <div className="space-y-3">
          <button
            onClick={onSignIn}
            className="w-full group p-4 rounded-xl border-2 border-gray-200 hover:border-[#5a8f47] transition-all bg-white hover:bg-green-50"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-[#5a8f47] transition-colors">
                <LogIn className="w-6 h-6 text-[#5a8f47] group-hover:text-white transition-colors" />
              </div>
              <div className="flex-1 text-left">
                <h5 className="font-semibold text-gray-800">Sign In</h5>
                <p className="text-sm text-gray-600">Access personalized services</p>
              </div>
              <svg className="w-5 h-5 text-gray-400 group-hover:text-[#5a8f47] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>

          <button
            onClick={onContinueAsGuest}
            className="w-full group p-4 rounded-xl border-2 border-gray-200 hover:border-[#6ea355] transition-all bg-white hover:bg-green-50"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-[#6ea355] transition-colors">
                <UserCircle className="w-6 h-6 text-[#6ea355] group-hover:text-white transition-colors" />
              </div>
              <div className="flex-1 text-left">
                <h5 className="font-semibold text-gray-800">Continue as Guest</h5>
                <p className="text-sm text-gray-600">Browse general information</p>
              </div>
              <svg className="w-5 h-5 text-gray-400 group-hover:text-[#6ea355] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-3 gap-4 text-center text-xs">
            <div>
              <div className="font-bold text-[#5a8f47]">24/7</div>
              <div className="text-gray-600">Available</div>
            </div>
            <div>
              <div className="font-bold text-[#5a8f47]">Instant</div>
              <div className="text-gray-600">Responses</div>
            </div>
            <div>
              <div className="font-bold text-[#5a8f47]">Secure</div>
              <div className="text-gray-600">& Private</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
