export type UserRole = 'guest' | 'candidate' | 'student' | 'faculty' | 'staff' | 'alumni' | 'management';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  studentId?: string;
  employeeId?: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  isStreaming?: boolean;
}
