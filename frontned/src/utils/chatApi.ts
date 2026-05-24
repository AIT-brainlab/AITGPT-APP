/**
 * Chat API functions for communicating with the backend Langflow API
 */
import { post, ApiResponse } from './api';
import { User } from '../types/auth';

export interface ChatRequest {
  input_value: string;
  output_type?: string;
  input_type?: string;
  output_component?: string;
  include_generation_raw?: string;
  include_retrieval_chunks?: string;
  run_id?: string;
  session_id?: string; // For guest users
  reasoning_mode?: boolean; // Enable reasoning mode
}

export interface ChatResponse {
  assistant_text: string;
  metrics?: any;
}

/**
 * Get or create session ID for guest users
 */
export const getSessionId = (): string => {
  let sessionId = localStorage.getItem('chat_session_id');
  if (!sessionId) {
    sessionId = `guest-session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('chat_session_id', sessionId);
  }
  return sessionId;
};

/**
 * Clear session ID (useful when user logs out or switches accounts)
 */
export const clearSessionId = (): void => {
  localStorage.removeItem('chat_session_id');
};

/**
 * Send a chat message to the backend API
 */
export const sendChatMessage = async (
  message: string,
  user: User | null = null,
  reasoningMode: boolean = false
): Promise<ApiResponse<ChatResponse>> => {
  const requestData: ChatRequest = {
    input_value: message,
    output_type: 'any',
    input_type: 'chat',
    include_generation_raw: 'True',
    include_retrieval_chunks: 'True',
    reasoning_mode: reasoningMode,
  };

  // For guest users, include session_id
  if (!user || user.role === 'guest') {
    requestData.session_id = getSessionId();
  }

  try {
    const response = await post<ChatResponse>('/api/langflow/chat/', requestData);
    return response;
  } catch (error) {
    return {
      success: false,
      errors: {
        message: error instanceof Error ? error.message : 'Failed to send message',
      },
    };
  }
};
