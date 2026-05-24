import { User, UserRole } from '../types/auth';

export const getWelcomeMessage = (user: User): string => {
  const messages: Record<UserRole, string> = {
    guest: "Hello! Welcome to University AI Assistant. I can help you with general information about our programs, campus life, and admission requirements. How can I assist you today?",
    candidate: `Welcome, ${user.name}! I'm here to help you with your application process, program details, financial aid information, and answer any questions about joining our university community.`,
    student: `Hi ${user.name}! I can assist you with course registration, academic resources, campus services, grades, financial aid, and much more. What do you need help with?`,
    faculty: `Good day, ${user.name}. I can help you with course management, student records, research resources, administrative procedures, and faculty services. How may I assist you?`,
    staff: `Hello ${user.name}! I'm here to support you with administrative tasks, departmental information, university policies, and inter-department coordination. What can I help you with?`,
    alumni: `Welcome back, ${user.name}! I can help you with alumni events, networking opportunities, giving programs, career services, and staying connected with the university. How can I assist you?`,
    management: `Good day, ${user.name}. I have access to institutional analytics, budget information, strategic planning resources, and comprehensive administrative data. How may I assist you today?`,
  };
  return messages[user.role];
};

export const getContextualSuggestions = (role: UserRole): string[] => {
  const suggestions: Record<UserRole, string[]> = {
    guest: [
      "What programs do you offer?",
      "How do I apply?",
      "What are the admission requirements?",
      "Tell me about campus life",
    ],
    candidate: [
      "Check my application status",
      "What documents do I need to submit?",
      "Financial aid options",
      "Campus tour information",
    ],
    student: [
      "My class schedule",
      "Register for courses",
      "Check my grades",
      "Library resources",
      "Campus dining options",
    ],
    faculty: [
      "Access course roster",
      "Submit grades",
      "Research funding opportunities",
      "Book a classroom",
    ],
    staff: [
      "Department directory",
      "Submit a work order",
      "HR policies",
      "Event planning resources",
    ],
    alumni: [
      "Upcoming alumni events",
      "Career networking",
      "Make a donation",
      "Update my contact information",
    ],
    management: [
      "View enrollment statistics",
      "Budget reports",
      "Faculty performance metrics",
      "Strategic initiatives status",
    ],
  };
  return suggestions[role];
};

/**
 * Send a chat message to the backend API and get response
 * This replaces the mock generateBotResponse function
 */
export const sendChatMessage = async (
  userMessage: string,
  user: User,
  reasoningMode: boolean = false
): Promise<string> => {
  try {
    const { sendChatMessage: apiSendChatMessage } = await import('./chatApi');
    
    const response = await apiSendChatMessage(userMessage, user, reasoningMode);
    
    if (response.success && response.data?.assistant_text) {
      return response.data.assistant_text;
    }
    
    // Handle errors gracefully
    let errorMessage = 'Sorry, I encountered an error processing your request. Please try again.';
    
    if (response.errors) {
      if (typeof response.errors === 'string') {
        errorMessage = response.errors;
      } else if (typeof response.errors === 'object') {
        // Try to get a user-friendly error message
        const errorValues = Object.values(response.errors);
        if (errorValues.length > 0) {
          const firstError = errorValues[0];
          if (Array.isArray(firstError) && firstError.length > 0) {
            errorMessage = firstError[0];
          } else if (typeof firstError === 'string') {
            errorMessage = firstError;
          }
        }
      }
    }
    
    return errorMessage;
  } catch (error) {
    console.error('Chat API error:', error);
    return 'Sorry, I encountered a network error. Please check your connection and try again.';
  }
};
