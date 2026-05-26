import React, { useState, useRef, useEffect } from 'react';
import OwlMascot from './OwlMascot';
import { User, ChatMessage } from '../types/auth';
import { ChevronLeft, Search, ChevronRight, ArrowLeftRight, ArrowUpDown, LogIn, LogOut, Trash2 } from 'lucide-react';
import { getRoleDisplayName } from '../utils/authService';
import { getWelcomeMessage, sendChatMessage } from '../utils/chatService';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { addMessage, updateMessage, initializeChat, clearMessages } from '../store/slices/chatSlice';
import { FormattedMessageContent } from './FormattedMessageContent';

type TabId = 'chat' | 'programs' | 'fees';

const TAB_LABELS: Record<TabId, string> = {
  chat: 'Chat',
  programs: 'Programs',
  fees: 'Fees & Scholarships',
};

const TAB_WELCOME: Record<TabId, (user: User) => string> = {
  chat: (user) => getWelcomeMessage(user),
  programs: () => 'Hi! I can help you find the right program. Ask me anything about our programs.',
  fees: () => 'Ask me anything about program fees, payment plans, and scholarship opportunities!',
};

interface FloatingChatWidgetProps {
  user: User;
  onSignOut: () => void;
  onClose: () => void;
  onSignIn?: () => void;
  width: number;
  height: number;
  isWide: boolean;
  isTall: boolean;
  onToggleWide: () => void;
  onToggleTall: () => void;
}

export function FloatingChatWidget({
  user,
  onSignOut,
  onClose,
  onSignIn,
  width,
  height,
  isWide,
  isTall,
  onToggleWide,
  onToggleTall,
}: FloatingChatWidgetProps) {
  const dispatch = useAppDispatch();
  const tabMessages = useAppSelector((state) => state.chat.tabMessages);

  const [activeTab, setActiveTab] = useState<TabId>('chat');
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const messages: ChatMessage[] = tabMessages[activeTab] ?? [];

  // Initialize tab on first visit (or user change)
  useEffect(() => {
    dispatch(
      initializeChat({
        tab: activeTab,
        welcomeMessage: TAB_WELCOME[activeTab](user),
        userId: user.id,
      })
    );
  }, [activeTab, user.id, dispatch]);

  // Reset input and streaming state on tab switch
  useEffect(() => {
    setInputValue('');
    setIsTyping(false);
    setStreamingMessageId(null);
  }, [activeTab]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessageId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (content?: string) => {
    const tab = activeTab;
    const messageContent = content || inputValue.trim();
    if (!messageContent) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: messageContent,
      sender: 'user',
      timestamp: new Date(),
    };

    dispatch(addMessage({ tab, message: userMessage }));
    setInputValue('');
    setIsTyping(true);

    try {
      const botResponseText = await sendChatMessage(messageContent, user, false, tab);
      const botResponseId = (Date.now() + 1).toString();

      const botResponse: ChatMessage = {
        id: botResponseId,
        content: '',
        sender: 'bot',
        timestamp: new Date(),
        isStreaming: true,
      };

      dispatch(addMessage({ tab, message: botResponse }));
      setStreamingMessageId(botResponseId);
      setIsTyping(false);

      await streamMessage(tab, botResponseId, botResponseText);
    } catch {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, I encountered an error. Please try again.',
        sender: 'bot',
        timestamp: new Date(),
      };
      dispatch(addMessage({ tab, message: errorMessage }));
      setIsTyping(false);
    }
  };

  const streamMessage = async (tab: string, messageId: string, fullText: string) => {
    let currentText = '';
    for (let i = 0; i < fullText.length; i++) {
      currentText += fullText[i];
      const isStillStreaming = i < fullText.length - 1;
      dispatch(updateMessage({ tab, id: messageId, updates: { content: currentText, isStreaming: isStillStreaming } }));
      setTimeout(() => scrollToBottom(), 0);
      await new Promise((resolve) => setTimeout(resolve, 15));
    }
    setStreamingMessageId(null);
    setTimeout(() => scrollToBottom(), 0);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    dispatch(clearMessages(activeTab));
    dispatch(
      initializeChat({
        tab: activeTab,
        welcomeMessage: TAB_WELCOME[activeTab](user),
        userId: user.id,
      })
    );
    setIsTyping(false);
    setStreamingMessageId(null);
  };

  const headerSubtitle =
    user.role === 'guest'
      ? 'Guest Assistant'
      : user.name
        ? `${user.name} · ${getRoleDisplayName(user.role)}`
        : getRoleDisplayName(user.role);

  return (
    <div
      data-floating-stage="chat"
      data-figma-node="197:1289"
      className="fixed right-6 bottom-24 shadow-xl flex flex-col animate-slideUp"
      style={{
        width: `${width}px`,
        height: `${height}px`,
        maxWidth: 'calc(100vw - 48px)',
        maxHeight: 'calc(100vh - 120px)',
        borderRadius: '15px',
        overflow: 'hidden',
        fontFamily: "'Inter', sans-serif",
        transition: 'width 0.25s ease, height 0.25s ease',
        zIndex: 60,
        backgroundImage:
          'linear-gradient(141.36deg, rgb(236, 246, 237) 0%, rgb(255, 255, 255) 100%)',
      }}
    >
      {/* Header — Figma node 197:1293 */}
      <div
        className="bg-white px-4 py-3 flex items-center gap-3 shrink-0"
        style={{
          borderTopLeftRadius: '15px',
          borderTopRightRadius: '15px',
          borderBottomLeftRadius: '5px',
          borderBottomRightRadius: '5px',
          boxShadow:
            '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.1)',
        }}
      >
        {/* Back arrow */}
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-gray-100 transition-colors shrink-0"
          title="Close"
        >
          <ChevronLeft className="w-5 h-5" style={{ color: '#4a5568' }} />
        </button>

        {/* Owl avatar — Figma node 197:1299 (40px) */}
        <div className="w-10 h-10 flex items-center justify-center shrink-0">
          <OwlMascot size={40} />
        </div>

        {/* Title — Figma nodes 197:1301 / 197:1303 */}
        <div className="flex-1 min-w-0">
          <h3
            className="font-medium text-base leading-tight"
            style={{ color: '#4a5568' }}
          >
            AITGPT
          </h3>
          <p
            className="text-xs leading-tight truncate"
            style={{ color: '#717182' }}
          >
            {headerSubtitle}
          </p>
        </div>

        {/* Sign-in (guest only) */}
        {onSignIn && (
          <button
            onClick={onSignIn}
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors shrink-0"
            title="Sign in"
            aria-label="Sign in"
          >
            <LogIn className="w-4 h-4" style={{ color: '#2e7d32' }} />
          </button>
        )}

        {/* Sign-out (logged-in users only) */}
        {user.role !== 'guest' && (
          <button
            onClick={onSignOut}
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors shrink-0"
            title="Sign out"
            aria-label="Sign out"
          >
            <LogOut className="w-4 h-4" style={{ color: '#4a5568' }} />
          </button>
        )}

        {/* Clear chat */}
        <button
          onClick={handleClearChat}
          className="p-1 rounded-lg hover:bg-gray-100 transition-colors shrink-0"
          title="Clear chat"
          aria-label="Clear chat"
        >
          <Trash2 className="w-4 h-4" style={{ color: '#4a5568' }} />
        </button>

        {/* Resize controls */}
        <button
          onClick={onToggleWide}
          className="p-1 rounded-lg hover:bg-gray-100 transition-colors shrink-0"
          title={isWide ? 'Reduce width' : 'Increase width'}
          aria-label={isWide ? 'Reduce width' : 'Increase width'}
        >
          <ArrowLeftRight className="w-4 h-4" style={{ color: isWide ? '#2e7d32' : '#4a5568' }} />
        </button>
        <button
          onClick={onToggleTall}
          className="p-1 rounded-lg hover:bg-gray-100 transition-colors shrink-0"
          title={isTall ? 'Reduce height' : 'Increase height'}
          aria-label={isTall ? 'Reduce height' : 'Increase height'}
        >
          <ArrowUpDown className="w-4 h-4" style={{ color: isTall ? '#2e7d32' : '#4a5568' }} />
        </button>
      </div>

      {/* Tab Navigation — Figma node 197:3462 (floating pill) */}
      <div className="px-3 pt-3 pb-1 shrink-0">
        <div
          className="bg-white flex items-center justify-center gap-1 px-1.5 py-1 overflow-x-auto scrollbar-none"
          style={{
            borderRadius: '15px',
            boxShadow: '0 4px 6.5px rgba(159,159,159,0.25)',
          }}
        >
          {(Object.keys(TAB_LABELS) as TabId[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="px-3 py-1 rounded-full text-sm whitespace-nowrap transition-all duration-150 font-medium shrink-0"
              style={
                activeTab === tab
                  ? { backgroundColor: '#66bb6a', color: '#ffffff' }
                  : { color: '#4a5568' }
              }
            >
              {TAB_LABELS[tab]}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages — scroll container with messages pushed to bottom.
          Background intentionally transparent so the parent gradient shows through. */}
      <div className="flex-1 overflow-y-auto">
        <div className="min-h-full flex flex-col justify-end px-4 py-4 gap-3">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-2 ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {message.sender === 'bot' ? (
                <div className="flex-shrink-0 mt-1">
                  <OwlMascot size={32} />
                </div>
              ) : (
                <div
                  className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center mt-1"
                  style={{ backgroundColor: '#2e7d32' }}
                >
                  <span className="text-white text-xs font-bold">
                    {user.name ? user.name[0].toUpperCase() : 'U'}
                  </span>
                </div>
              )}

              <div className={`flex-1 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}>
                {message.sender === 'bot' ? (
                  <>
                    {(() => {
                      const separator = /\n\s*---\s*\n/;
                      const parts = message.content.split(separator).map((s) => s.trim()).filter(Boolean);
                      const segments = parts.length > 1 ? parts : [message.content];
                      return segments.map((segment, idx) => (
                        <div
                          key={idx}
                          className="inline-block py-2.5 rounded-2xl text-sm bg-white max-w-full"
                          style={{
                            color: '#2f2f2f',
                            border: '1px solid #e0e0e0',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                            marginTop: idx > 0 ? '8px' : 0,
                            paddingLeft: '20px',
                            paddingRight: '20px',
                          }}
                        >
                          <FormattedMessageContent content={segment} isStreaming={message.isStreaming || false} />
                        </div>
                      ));
                    })()}
                  </>
                ) : (
                  <div
                    className="inline-block px-3.5 py-2.5 rounded-2xl text-sm text-white"
                    style={{ backgroundColor: '#2e7d32' }}
                  >
                    <FormattedMessageContent content={message.content} isStreaming={false} />
                  </div>
                )}
                <div className="text-xs mt-1 px-1" style={{ color: '#90a1b9' }}>
                  {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-2">
              <div className="flex-shrink-0 mt-1">
                <OwlMascot size={24} />
              </div>
              <div
                className="bg-white rounded-2xl px-3.5 py-2.5"
                style={{ border: '1px solid #e0e0e0', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
              >
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area — Figma node 197:3466 (floating pill with icon + input + Ask button) */}
      <div className="px-3 pt-1 pb-3 shrink-0">
        <div
          className="bg-white flex items-center gap-3 pl-4 pr-1.5 py-1.5"
          style={{
            borderRadius: '14.4px',
            border: '0.6px solid #c8d2e0',
            boxShadow:
              '0 9px 13.5px rgba(0,0,0,0.1), 0 3.6px 5.4px rgba(0,0,0,0.1)',
          }}
        >
          <Search
            className="w-5 h-5 shrink-0"
            style={{ color: '#90a1b9' }}
          />
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about admissions, programs, campus ...."
            className="flex-1 bg-transparent text-sm outline-none min-w-0 chat-input"
            style={{ color: '#2f2f2f' }}
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputValue.trim() || isTyping}
            className="flex items-center justify-center gap-1 px-4 py-2 rounded-xl text-sm font-semibold transition-opacity shrink-0 text-white"
            style={
              inputValue.trim() && !isTyping
                ? {
                    backgroundImage:
                      'linear-gradient(90deg, rgb(46,125,50) 0%, rgb(27,94,32) 100%)',
                    boxShadow:
                      '0 3.6px 5.4px rgba(0,0,0,0.1), 0 1.8px 3.6px rgba(0,0,0,0.1)',
                  }
                : {
                    backgroundImage:
                      'linear-gradient(90deg, rgb(46,125,50) 0%, rgb(27,94,32) 100%)',
                    opacity: 0.45,
                    cursor: 'not-allowed',
                    boxShadow: 'none',
                  }
            }
          >
            Ask <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
