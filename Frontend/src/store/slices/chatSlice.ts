import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ChatMessage } from '../../types/auth';

interface ChatState {
  tabMessages: Record<string, ChatMessage[]>;
  reasoningMode: boolean;
  currentUserId: string | null;
}

const deserializeMessages = (messages: ChatMessage[]): ChatMessage[] =>
  messages.map((msg) => ({ ...msg, timestamp: new Date(msg.timestamp) }));

const initialState: ChatState = {
  tabMessages: {},
  reasoningMode: false,
  currentUserId: null,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addMessage: (state, action: PayloadAction<{ tab: string; message: ChatMessage }>) => {
      const { tab, message } = action.payload;
      if (!state.tabMessages[tab]) state.tabMessages[tab] = [];
      state.tabMessages[tab].push(message);
    },
    updateMessage: (
      state,
      action: PayloadAction<{ tab: string; id: string; updates: Partial<ChatMessage> }>
    ) => {
      const { tab, id, updates } = action.payload;
      const msgs = state.tabMessages[tab];
      if (!msgs) return;
      const index = msgs.findIndex((msg) => msg.id === id);
      if (index !== -1) msgs[index] = { ...msgs[index], ...updates };
    },
    setMessages: (state, action: PayloadAction<{ tab: string; messages: ChatMessage[] }>) => {
      const { tab, messages } = action.payload;
      state.tabMessages[tab] = deserializeMessages(messages);
    },
    clearMessages: (state, action: PayloadAction<string>) => {
      state.tabMessages[action.payload] = [];
    },
    clearAllMessages: (state) => {
      state.tabMessages = {};
    },
    setReasoningMode: (state, action: PayloadAction<boolean>) => {
      state.reasoningMode = action.payload;
    },
    initializeChat: (
      state,
      action: PayloadAction<{ tab: string; welcomeMessage: string; userId: string }>
    ) => {
      const { tab, welcomeMessage, userId } = action.payload;
      if (state.currentUserId !== userId) {
        state.tabMessages = {};
        state.currentUserId = userId;
      }
      if (!state.tabMessages[tab] || state.tabMessages[tab].length === 0) {
        state.tabMessages[tab] = [
          {
            id: `${tab}-welcome`,
            content: welcomeMessage,
            sender: 'bot',
            timestamp: new Date(),
          },
        ];
      }
    },
    setCurrentUser: (state, action: PayloadAction<string | null>) => {
      state.currentUserId = action.payload;
    },
  },
});

export const {
  addMessage,
  updateMessage,
  setMessages,
  clearMessages,
  clearAllMessages,
  setReasoningMode,
  initializeChat,
  setCurrentUser,
} = chatSlice.actions;

export default chatSlice.reducer;
