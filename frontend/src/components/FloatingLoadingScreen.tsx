import { Loader2 } from 'lucide-react';

interface FloatingLoadingScreenProps {
  message?: string;
  width: number;
  height: number;
}

export function FloatingLoadingScreen({ message = 'Authenticating...', width, height }: FloatingLoadingScreenProps) {
  return (
    <div
      className="fixed bottom-24 right-6 bg-white rounded-2xl shadow-2xl z-40 animate-slideUp border border-[#5a8f47]/20 overflow-hidden flex flex-col"
      style={{
        width: `${width}px`,
        height: `${height}px`,
        maxWidth: 'calc(100vw - 48px)',
        maxHeight: 'calc(100vh - 120px)',
        transition: 'width 0.25s ease, height 0.25s ease',
      }}
    >
      <div className="bg-gradient-to-r from-[#4a7a3d] to-[#3C6031] text-white px-4 py-3 shrink-0">
        <h3 className="font-semibold text-lg">AITGPT</h3>
      </div>
      <div className="p-12 text-center flex-1 flex flex-col items-center justify-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <Loader2 className="w-8 h-8 text-[#5a8f47] animate-spin" />
        </div>
        <h4 className="text-lg font-semibold text-gray-800 mb-2">{message}</h4>
        <p className="text-sm text-gray-600">Please complete authentication in the new window</p>
        <div className="mt-4 p-3 bg-green-50 rounded-lg border border-[#5a8f47]/20">
          <p className="text-xs text-gray-600">
            A new window has been opened for secure authentication. Once you log in, this will automatically continue.
          </p>
        </div>
        <div className="mt-6 flex gap-2 justify-center">
          <div className="w-2 h-2 bg-[#5a8f47] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-[#5a8f47] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-[#5a8f47] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
}
