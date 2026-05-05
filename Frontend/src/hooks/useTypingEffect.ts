import { useState, useEffect, useRef } from 'react';

/**
 * Hook to create a typing effect for text
 * @param text The full text to type out
 * @param speed Typing speed in milliseconds per character (default: 20ms)
 * @param enabled Whether typing effect is enabled (default: true)
 */
export const useTypingEffect = (
  text: string,
  speed: number = 20,
  enabled: boolean = true
): string => {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const indexRef = useRef(0);

  useEffect(() => {
    // Reset when text changes
    setDisplayedText('');
    setIsComplete(false);
    indexRef.current = 0;

    if (!enabled || !text) {
      setDisplayedText(text);
      setIsComplete(true);
      return;
    }

    const typeNextChar = () => {
      if (indexRef.current < text.length) {
        setDisplayedText(text.substring(0, indexRef.current + 1));
        indexRef.current += 1;
        timeoutRef.current = setTimeout(typeNextChar, speed);
      } else {
        setIsComplete(true);
      }
    };

    // Start typing after a short delay
    timeoutRef.current = setTimeout(typeNextChar, 100);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [text, speed, enabled]);

  return displayedText;
};
