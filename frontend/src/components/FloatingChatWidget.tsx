import React, { useState, useRef, useEffect } from 'react';
import OwlMascot from './OwlMascot';
import { User, ChatMessage } from '../types/auth';
import { Send, LogOut, LogIn, Trash2, User as UserIcon, Maximize2, Minimize2, UnfoldVertical, FoldVertical, X } from 'lucide-react';
import { getRoleDisplayName } from '../utils/authService';
import { getWelcomeMessage, getContextualSuggestions, sendChatMessage } from '../utils/chatService';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { addMessage, updateMessage, initializeChat, clearMessages } from '../store/slices/chatSlice';
import { FormattedMessageContent } from './FormattedMessageContent';

const DEFAULT_WIDTH = 420;
const DEFAULT_HEIGHT = 600;
const MAXIMIZED_WIDTH = 480;
const MAXIMIZED_HEIGHT = Math.round((MAXIMIZED_WIDTH / DEFAULT_WIDTH) * DEFAULT_HEIGHT);
const FULL_HEIGHT_WIDTH_EXTRA = 48;

type TabId = 'general' | 'programs' | 'fees';

const TAB_LABELS: Record<TabId, string> = {
  general: 'General',
  programs: 'Program Recommendation',
  fees: 'Fees & Scholarships',
};

const TAB_WELCOME: Record<TabId, (user: User) => string> = {
  general: (user) => getWelcomeMessage(user),
  programs: () =>
    "Hi! I can help you find the right program. Fill in your interests above or just ask me anything about our programs.",
  fees: () =>
    "Ask me anything about program fees, payment plans, and scholarship opportunities!",
};

const TAB_SUGGESTIONS: Record<TabId, string[]> = {
  general: [],
  programs: [
    'What programs do you offer?',
    'Recommend a program for someone interested in AI',
    'Which engineering programs are available?',
  ],
  fees: [
    'What are the tuition fees?',
    'Are there any scholarships available?',
    'How do I apply for financial aid?',
  ],
};

interface FloatingChatWidgetProps {
  user: User;
  onSignOut: () => void;
  onSignIn?: () => void;
}

export function FloatingChatWidget({ user, onSignOut, onSignIn }: FloatingChatWidgetProps) {
  const dispatch = useAppDispatch();
  const tabMessages = useAppSelector((state) => state.chat.tabMessages);

  const [activeTab, setActiveTab] = useState<TabId>('general');
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isFullHeight, setIsFullHeight] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const messages: ChatMessage[] = tabMessages[activeTab] ?? [];

  const baseWidth = isMaximized ? MAXIMIZED_WIDTH : DEFAULT_WIDTH;
  const width = baseWidth + (isFullHeight ? FULL_HEIGHT_WIDTH_EXTRA : 0);
  const height = isMaximized ? MAXIMIZED_HEIGHT : DEFAULT_HEIGHT;

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
    const tab = activeTab; // capture before any async gap
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
      const botResponseText = await sendChatMessage(messageContent, user, false);
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
  };

  const suggestions =
    activeTab === 'general'
      ? getContextualSuggestions(user.role).slice(0, 3)
      : TAB_SUGGESTIONS[activeTab];

  return (
    <div
      data-floating-stage="chat"
      className={`fixed right-6 bg-white rounded-2xl shadow-2xl flex flex-col animate-slideUp border border-[#5a8f47]/20 transition-[width,height] duration-200 ease-out ${isFullHeight ? 'top-0' : 'bottom-24 z-40'}`}
      style={{
        width: `${width}px`,
        height: isFullHeight ? '100vh' : `${height}px`,
        ...(isFullHeight && { zIndex: 9999 }),
      }}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-[#4a7a3d] to-[#3C6031] text-white px-4 py-3 rounded-t-2xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <OwlMascot size={32} />
          <div>
            <h3 className="font-semibold">AIT AI Assistant</h3>
            <div className="flex items-center gap-1 text-xs text-green-100">
              <div className="w-2 h-2 bg-[#a1be37] rounded-full"></div>
              <span>Online</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setIsFullHeight((h) => !h)} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors" title={isFullHeight ? 'Restore height' : 'Full height'}>
            {isFullHeight ? <FoldVertical className="w-4 h-4" /> : <UnfoldVertical className="w-4 h-4" />}
          </button>
          <button onClick={() => setIsMaximized((m) => !m)} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors" title={isMaximized ? 'Restore size' : 'Maximize'}>
            {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          {isFullHeight && (
            <button onClick={() => setIsFullHeight(false)} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors" title="Exit">
              <X className="w-4 h-4" />
            </button>
          )}
          <button onClick={handleClearChat} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors" title="Clear chat">
            <Trash2 className="w-4 h-4" />
          </button>
          <button onClick={onSignOut} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors" title="Sign Out">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* User Info Banner */}
      {user.role === 'guest' ? (
        <div className="bg-[#f0f7ed] px-4 py-2.5 border-b border-green-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <UserIcon className="w-3.5 h-3.5" />
            <span>Browsing as guest</span>
          </div>
          {onSignIn && (
            <button onClick={onSignIn} title="Sign in" className="p-1.5 bg-[#4a7a3d] text-white rounded-full hover:bg-[#3C6031] transition-colors">
              <LogIn className="w-4 h-4" />
            </button>
          )}
        </div>
      ) : (
        <div className="bg-green-50 px-4 py-2 border-b border-green-100">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Logged in as:</span>
              <span className="font-semibold text-gray-800">{user.name}</span>
            </div>
            <div className="px-2 py-0.5 rounded-full text-xs bg-[#5a8f47] text-white">
              {getRoleDisplayName(user.role)}
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex gap-1 px-3 py-2 border-b border-gray-100 overflow-x-auto shrink-0">
        {(Object.keys(TAB_LABELS) as TabId[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1 rounded-full text-xs whitespace-nowrap transition-all duration-150 border ${
              activeTab === tab
                ? 'bg-[#4a7a3d] text-white border-[#4a7a3d] shadow-sm'
                : 'text-gray-500 border-gray-200 hover:border-[#5a8f47] hover:text-[#4a7a3d]'
            }`}
          >
            {TAB_LABELS[tab]}
          </button>
        ))}
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {/* Owl mascot (initial state only) */}
        {messages.length <= 1 && (
          <div className="flex justify-center pt-2 pb-1">
            <OwlMascot size={72} />
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-2 ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            {message.sender === 'bot' ? (
              <div className="flex-shrink-0">
                <OwlMascot size={24} />
              </div>
            ) : (
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                <UserIcon className="w-5 h-5 text-gray-600" />
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
                      <div key={idx} className="inline-block px-3 py-2 rounded-2xl text-sm bg-gray-100 text-gray-800 mt-5 first:mt-0 max-w-full">
                        <FormattedMessageContent content={segment} isStreaming={message.isStreaming || false} />
                      </div>
                    ));
                  })()}
                </>
              ) : (
                <div className="inline-block px-3 py-2 rounded-2xl text-sm bg-[#5a8f47] text-white">
                  <FormattedMessageContent content={message.content} isStreaming={false} />
                </div>
              )}
              <div className="text-xs text-gray-500 mt-1 px-1">
                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-2">
            <div className="flex-shrink-0">
              <OwlMascot size={24} />
            </div>
            <div className="bg-gray-100 rounded-2xl px-3 py-2">
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

      {/* Quick Suggestions */}
      {messages.length <= 1 && suggestions.length > 0 && (
        <div className="px-4 pb-3 shrink-0">
          <p className="text-xs text-gray-500 mb-2">Quick suggestions:</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSendMessage(suggestion)}
                className="px-3 py-1.5 bg-green-100 rounded-full text-xs text-[#3C6031] hover:bg-green-200 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="border-t border-gray-200 p-3 shrink-0">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5a8f47] focus:border-transparent"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputValue.trim() || isTyping}
            className={`px-3 py-2 rounded-lg transition-colors flex items-center ${
              inputValue.trim() && !isTyping
                ? 'bg-[#5a8f47] text-white hover:bg-[#4a7a3d]'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
