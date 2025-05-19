"use server";

import type { Task, TaskPriority, TaskStatus, AISuggestions } from '@/lib/types';
import { suggestTasks as aiSuggestTasks } from '@/ai/flows/task-suggestions';
import { categorizeTask as aiCategorizeTask } from '@/ai/flows/smart-categorization';
import { suggestOptimalDueDate as aiSuggestOptimalDueDate } from '@/ai/flows/optimal-due-dates';

// This is a server-side in-memory store for demo purposes.
// In a real app, this would be a database.
let tasks: Task[] = [
  {
    id: '1',
    title: 'Initial Demo Task 1',
    description: 'This is the first pre-loaded task.',
    priority: 'medium',
    status: 'pending',
    dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
    category: 'Work',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    title: 'Initial Demo Task 2 - High Priority',
    description: 'A high priority task that is already in progress.',
    priority: 'high',
    status: 'in-progress',
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // Day after tomorrow
    category: 'Personal',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export async function getTasks(): Promise<Task[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return JSON.parse(JSON.stringify(tasks)); // Return a deep copy
}

export async function createTask(taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<Task> {
  await new Promise(resolve => setTimeout(resolve, 500));
  const newTask: Task = {
    ...taskData,
    id: Date.now().toString(),
    status: 'pending',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  tasks.push(newTask);
  return JSON.parse(JSON.stringify(newTask));
}

export async function updateTask(taskId: string, updates: Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Task | null> {
  await new Promise(resolve => setTimeout(resolve, 300));
  const taskIndex = tasks.findIndex(t => t.id === taskId);
  if (taskIndex === -1) {
    return null;
  }
  tasks[taskIndex] = { ...tasks[taskIndex], ...updates, updatedAt: new Date() };
  return JSON.parse(JSON.stringify(tasks[taskIndex]));
}

export async function updateTaskStatus(taskId: string, status: TaskStatus): Promise<Task | null> {
  return updateTask(taskId, { status });
}


export async function deleteTask(taskId: string): Promise<{ success: boolean }> {
  await new Promise(resolve => setTimeout(resolve, 300));
  const initialLength = tasks.length;
  tasks = tasks.filter(t => t.id !== taskId);
  return { success: tasks.length < initialLength };
}


// AI-Powered Actions
export async function getAISuggestionsForTask(description: string): Promise<AISuggestions> {
  if (!description.trim()) {
    return { category: 'General', optimalDueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] }; // Default if no description
  }
  try {
    const result = await aiSuggestTasks({ taskDescription: description });
    return {
      suggestedTasks: result.suggestedTasks,
      category: result.category,
      optimalDueDate: result.optimalDueDate,
    };
  } catch (error) {
    console.error("Error getting AI task suggestions:", error);
    // Fallback or re-throw depending on desired error handling
    return { category: 'Uncategorized', optimalDueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] };
  }
}

export async function getSmartCategoryForTask(description: string): Promise<{ category: string; suggestedDueDate?: string }> {
   if (!description.trim()) {
    return { category: 'General' };
  }
  try {
    const result = await aiCategorizeTask({ description });
    return {
      category: result.category,
      suggestedDueDate: result.suggestedDueDate,
    };
  } catch (error) {
    console.error("Error getting smart category:", error);
    return { category: 'Uncategorized' };
  }
}

export async function getOptimalDueDateForTask(taskDescription: string, historicalData: string = "No historical data available."): Promise<{ suggestedDueDate: string; reasoning: string }> {
  if (!taskDescription.trim()) {
    return { suggestedDueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] , reasoning: "Default due date." };
  }
  try {
    const result = await aiSuggestOptimalDueDate({ taskDescription, historicalData });
    return result;
  } catch (error) {
    console.error("Error getting optimal due date:", error);
    return { suggestedDueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] , reasoning: "Fell back to default due to error." };
  }
}
