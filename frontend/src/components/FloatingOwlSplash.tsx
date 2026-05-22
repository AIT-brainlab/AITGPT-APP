import { useEffect, useState } from 'react';
import OwlMascot from './OwlMascot';

interface FloatingOwlSplashProps {
  onComplete: () => void;
}

export function FloatingOwlSplash({ onComplete }: FloatingOwlSplashProps) {
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFading(true), 2000);
    const completeTimer = setTimeout(() => onComplete(), 2500);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div
      className="fixed right-6 bottom-24 z-50 w-[420px] h-[600px] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
      style={{
        background: 'linear-gradient(135deg, #4a7a3d 0%, #3C6031 100%)',
        opacity: fading ? 0 : 1,
        transition: 'opacity 0.5s ease-out',
        animation: 'slideUp 0.3s ease-out',
      }}
    >
      {/* Header bar */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/20">
        <div className="w-2 h-2 rounded-full bg-green-500" />
        <span className="text-white font-semibold text-sm">AIT AI Assistant</span>
      </div>

      {/* Owl display area */}
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <OwlMascot size={160} withSparkle />

        <div className="text-center px-6">
          <p className="text-white font-semibold text-lg leading-tight">
            Hello! I'm your AIT assistant.
          </p>
          <p className="text-white/70 text-sm mt-1">
            Ready to help you today...
          </p>
        </div>

        {/* Loading dots */}
        <div className="flex gap-1.5 mt-1">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-white/60"
              style={{ animation: `dotBounce 1s ease-in-out infinite ${i * 150}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
