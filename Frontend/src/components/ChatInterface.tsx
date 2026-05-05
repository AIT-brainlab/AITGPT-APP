import React, { useState, useRef, useEffect } from 'react';
import { User, ChatMessage } from '../types/auth';
import { Send, LogOut, Bot, User as UserIcon } from 'lucide-react';
import { getRoleDisplayName, getRoleColor } from '../utils/authService';
import { getWelcomeMessage, getContextualSuggestions, sendChatMessage } from '../utils/chatService';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { addMessage, initializeChat } from '../store/slices/chatSlice';
import { FormattedMessageContent } from './FormattedMessageContent';

interface ChatInterfaceProps {
  user: User;
  onSignOut: () => void;
}

export function ChatInterface({ user, onSignOut }: ChatInterfaceProps) {
  const dispatch = useAppDispatch();
  const { messages } = useAppSelector((state) => state.chat);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const suggestions = getContextualSuggestions(user.role);

  // Initialize chat with welcome message if needed
  useEffect(() => {
    dispatch(initializeChat({ welcomeMessage: getWelcomeMessage(user), userId: user.id }));
  }, [user, dispatch]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (content?: string) => {
    const messageContent = content || inputValue.trim();
    if (!messageContent) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: messageContent,
      sender: 'user',
      timestamp: new Date(),
    };

    dispatch(addMessage(userMessage));
    setInputValue('');
    setIsTyping(true);

    try {
      const botResponseText = await sendChatMessage(messageContent, user, false);
      const botResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: botResponseText,
        sender: 'bot',
        timestamp: new Date(),
      };
      dispatch(addMessage(botResponse));
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, I encountered an error. Please try again.',
        sender: 'bot',
        timestamp: new Date(),
      };
      dispatch(addMessage(errorMessage));
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-800">University AI Assistant</h1>
              <p className="text-sm text-gray-500">Always here to help</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="font-semibold text-gray-800">{user.name}</div>
              <div className={`text-xs px-2 py-1 rounded-full inline-block ${getRoleColor(user.role)}`}>
                {getRoleDisplayName(user.role)}
              </div>
            </div>
            <button
              onClick={onSignOut}
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* User Info Banner */}
      <div className="bg-blue-50 border-b border-blue-100 px-6 py-3">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 text-sm text-blue-800">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>
              Authenticated as <strong>{user.name}</strong>
              {user.studentId && ` • Student ID: ${user.studentId}`}
              {user.employeeId && ` • Employee ID: ${user.employeeId}`}
              {user.department && ` • ${user.department}`}
            </span>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                  message.sender === 'bot'
                    ? 'bg-gradient-to-br from-blue-600 to-indigo-600'
                    : 'bg-gray-300'
                }`}
              >
                {message.sender === 'bot' ? (
                  <Bot className="w-6 h-6 text-white" />
                ) : (
                  <UserIcon className="w-6 h-6 text-gray-600" />
                )}
              </div>
              <div
                className={`flex-1 max-w-2xl ${
                  message.sender === 'user' ? 'text-right' : 'text-left'
                }`}
              >
                {message.sender === 'bot' ? (
                  (() => {
                    // Split bot content by "---" (section separator) so each part renders in its own block
                    const separator = /\n\s*---\s*\n/;
                    const parts = message.content.split(separator).map((s) => s.trim()).filter(Boolean);
                    const segments = parts.length > 1 ? parts : [message.content];
                    return segments.map((segment, idx) => (
                      <div
                        key={idx}
                        className="inline-block px-4 py-3 rounded-2xl bg-white border border-gray-200 text-gray-800 mt-5 first:mt-0 max-w-full"
                      >
                        <FormattedMessageContent content={segment} />
                      </div>
                    ));
                  })()
                ) : (
                  <div className="inline-block px-4 py-3 rounded-2xl bg-blue-600 text-white">
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                )}
                <div className="text-xs text-gray-500 mt-1 px-2">
                  {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Quick Suggestions */}
      {messages.length <= 1 && (
        <div className="px-6 pb-4">
          <div className="max-w-4xl mx-auto">
            <p className="text-sm text-gray-600 mb-3">Quick suggestions:</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSendMessage(suggestion)}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-3">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputValue.trim() || isTyping}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2 ${
                inputValue.trim() && !isTyping
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Send className="w-5 h-5" />
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
