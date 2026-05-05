/**
 * Format text with markdown and special characters
 * Handles **bold**, \n, \r, \t
 */

export interface FormattedTextPart {
  type: 'text' | 'bold' | 'newline' | 'tab';
  content: string;
}

/**
 * Parse text and convert markdown and special characters to formatted parts
 */
export const parseText = (text: string): FormattedTextPart[] => {
  const parts: FormattedTextPart[] = [];
  let currentIndex = 0;
  
  // Regular expression to match **bold** text
  const boldRegex = /\*\*(.*?)\*\*/g;
  let match;
  let lastIndex = 0;
  
  // Find all bold matches
  const boldMatches: Array<{ start: number; end: number; content: string }> = [];
  while ((match = boldRegex.exec(text)) !== null) {
    boldMatches.push({
      start: match.index,
      end: match.index + match[0].length,
      content: match[1],
    });
  }
  
  // Process text character by character
  let i = 0;
  while (i < text.length) {
    // Check if we're at the start of a bold section
    const boldMatch = boldMatches.find(m => m.start === i);
    if (boldMatch) {
      // Add text before bold if any
      if (i > lastIndex) {
        const beforeText = text.substring(lastIndex, i);
        parts.push(...processSpecialChars(beforeText));
      }
      // Add bold text
      parts.push({ type: 'bold', content: boldMatch.content });
      i = boldMatch.end;
      lastIndex = i;
      continue;
    }
    
    i++;
  }
  
  // Add remaining text after last bold match
  if (lastIndex < text.length) {
    const remainingText = text.substring(lastIndex);
    parts.push(...processSpecialChars(remainingText));
  }
  
  return parts;
};

/**
 * Process special characters (\n, \r, \t) in text
 */
const processSpecialChars = (text: string): FormattedTextPart[] => {
  const parts: FormattedTextPart[] = [];
  let currentText = '';
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];
    
    if (char === '\\' && nextChar) {
      // Handle escape sequences
      if (nextChar === 'n') {
        if (currentText) {
          parts.push({ type: 'text', content: currentText });
          currentText = '';
        }
        parts.push({ type: 'newline', content: '\n' });
        i++; // Skip next character
        continue;
      } else if (nextChar === 'r') {
        if (currentText) {
          parts.push({ type: 'text', content: currentText });
          currentText = '';
        }
        parts.push({ type: 'newline', content: '\r' });
        i++; // Skip next character
        continue;
      } else if (nextChar === 't') {
        if (currentText) {
          parts.push({ type: 'text', content: currentText });
          currentText = '';
        }
        parts.push({ type: 'tab', content: '\t' });
        i++; // Skip next character
        continue;
      }
    }
    
    // Handle actual newlines, tabs, etc. (not escaped)
    if (char === '\n') {
      if (currentText) {
        parts.push({ type: 'text', content: currentText });
        currentText = '';
      }
      parts.push({ type: 'newline', content: '\n' });
      continue;
    } else if (char === '\r') {
      if (currentText) {
        parts.push({ type: 'text', content: currentText });
        currentText = '';
      }
      parts.push({ type: 'newline', content: '\r' });
      continue;
    } else if (char === '\t') {
      if (currentText) {
        parts.push({ type: 'text', content: currentText });
        currentText = '';
      }
      parts.push({ type: 'tab', content: '\t' });
      continue;
    }
    
    currentText += char;
  }
  
  if (currentText) {
    parts.push({ type: 'text', content: currentText });
  }
  
  return parts;
};

/**
 * Render formatted text parts as React elements
 */
export const renderFormattedText = (parts: FormattedTextPart[]): React.ReactNode[] => {
  return parts.map((part, index) => {
    switch (part.type) {
      case 'bold':
        return <strong key={index}>{part.content}</strong>;
      case 'newline':
        return <br key={index} />;
      case 'tab':
        return <span key={index} style={{ display: 'inline-block', width: '2em' }} />;
      default:
        return <span key={index}>{part.content}</span>;
    }
  });
};

/**
 * Simple function to format text with markdown and special chars
 * Returns a string with HTML-like formatting that can be rendered
 */
export const formatTextForDisplay = (text: string): string => {
  // Replace **bold** with HTML strong tags
  let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Replace \n with actual newlines (for pre-wrap)
  formatted = formatted.replace(/\\n/g, '\n');
  formatted = formatted.replace(/\\r/g, '\r');
  formatted = formatted.replace(/\\t/g, '\t');
  
  return formatted;
};
