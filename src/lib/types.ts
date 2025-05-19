
export type User = {
  id: string;
  name: string;
  email: string;
  // passwordHash is not stored on client
  role?: 'admin' | 'manager' | 'user'; // Optional as not all user objects might have this
  // notificationPreferences might be handled separately or be part of a fuller user profile
};

export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskStatus = 'pending' | 'in-progress' | 'completed';
export type TaskRecurrence = 'daily' | 'weekly' | 'monthly' | 'none';

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: Date | string; // string for form input, Date for actual data
  priority: TaskPriority;
  status: TaskStatus;
  category?: string; // Added for AI categorization
  createdBy?: string; // User ID
  assignedTo?: string; // User ID
  isRecurring?: boolean;
  recurrencePattern?: TaskRecurrence;
  createdAt: Date;
  updatedAt: Date;
}

export interface AISuggestions {
  suggestedTasks?: string[];
  category?: string;
  optimalDueDate?: string;
}
