"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import type { Task, TaskFormValues, TaskPriority, TaskStatus } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { TaskList } from '@/components/tasks/TaskList';
import { TaskForm } from '@/components/tasks/TaskForm';
import { createTask, deleteTask, getTasks, updateTask, updateTaskStatus } from '@/lib/actions/tasks';
import { PlusCircle, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { TaskFilters, type TaskFiltersType } from '@/components/tasks/TaskFilters';
import { Skeleton } from '@/components/ui/skeleton';
import { parseISO } from 'date-fns';

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const { toast } = useToast();

  const [filters, setFilters] = useState<TaskFiltersType>({
    status: [],
    priority: [],
    searchTerm: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    try {
      const fetchedTasks = await getTasks();
      setTasks(fetchedTasks);
    } catch (error) {
      toast({ title: "Error", description: "Failed to fetch tasks.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleCreateOrUpdateTask = async (data: TaskFormValues) => {
    try {
      if (editingTask) {
        const updatedTask = await updateTask(editingTask.id, { 
          ...data, 
          dueDate: data.dueDate ? data.dueDate.toISOString() : undefined 
        });
        if (updatedTask) {
          setTasks(prevTasks => prevTasks.map(t => t.id === updatedTask.id ? updatedTask : t));
          toast({ title: "Task Updated", description: `"${updatedTask.title}" has been updated.` });
        }
      } else {
        const newTask = await createTask({ 
          ...data, 
          dueDate: data.dueDate ? data.dueDate.toISOString() : undefined 
        });
        setTasks(prevTasks => [newTask, ...prevTasks]);
        toast({ title: "Task Created", description: `"${newTask.title}" has been added.` });
      }
      setEditingTask(undefined);
    } catch (error) {
      toast({ title: "Error", description: "Failed to save task.", variant: "destructive" });
    }
  };

  const handleToggleComplete = async (taskId: string, currentStatus: TaskStatus) => {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    try {
      const updatedTask = await updateTaskStatus(taskId, newStatus);
      if (updatedTask) {
        setTasks(prevTasks => prevTasks.map(t => t.id === taskId ? updatedTask : t));
        toast({ title: "Task Status Updated", description: `Task marked as ${newStatus}.` });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to update task status.", variant: "destructive" });
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsTaskFormOpen(true);
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(taskId);
      setTasks(prevTasks => prevTasks.filter(t => t.id !== taskId));
      toast({ title: "Task Deleted", description: "The task has been successfully deleted." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete task.", variant: "destructive" });
    }
  };
  
  const priorityOrder: Record<TaskPriority, number> = { high: 1, medium: 2, low: 3 };

  const filteredAndSortedTasks = useMemo(() => {
    return tasks
      .filter(task => {
        const matchesSearch = filters.searchTerm.toLowerCase() === '' ||
          task.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
          (task.description && task.description.toLowerCase().includes(filters.searchTerm.toLowerCase()));
        
        const matchesStatus = filters.status.length === 0 || filters.status.includes(task.status);
        const matchesPriority = filters.priority.length === 0 || filters.priority.includes(task.priority);

        return matchesSearch && matchesStatus && matchesPriority;
      })
      .sort((a, b) => {
        let comparison = 0;
        switch (filters.sortBy) {
          case 'dueDate':
            comparison = (a.dueDate ? parseISO(a.dueDate.toString()).getTime() : Infinity) - (b.dueDate ? parseISO(b.dueDate.toString()).getTime() : Infinity);
            break;
          case 'priority':
            comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
            break;
          case 'title':
            comparison = a.title.localeCompare(b.title);
            break;
          case 'createdAt':
            comparison = parseISO(a.createdAt.toString()).getTime() - parseISO(b.createdAt.toString()).getTime();
            break;
        }
        return filters.sortOrder === 'asc' ? comparison : -comparison;
      });
  }, [tasks, filters, priorityOrder]);


  return (
    <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
        <h1 className="text-3xl font-bold text-foreground">My Tasks</h1>
        <div className="flex gap-2">
           <Button onClick={fetchTasks} variant="outline" disabled={isLoading}>
            <RefreshCw className={cn("mr-2 h-4 w-4", isLoading && "animate-spin")} />
            Refresh
          </Button>
          <Button onClick={() => { setEditingTask(undefined); setIsTaskFormOpen(true); }}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Task
          </Button>
        </div>
      </div>

      <TaskFilters filters={filters} onFiltersChange={setFilters} />
      
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card className="flex flex-col justify-between" key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3 mt-1" />
              </CardHeader>
              <CardContent className="py-2">
                <Skeleton className="h-4 w-1/2 mb-2" />
                <Skeleton className="h-4 w-1/3" />
              </CardContent>
              <CardFooter className="flex items-center justify-between pt-2 pb-4 px-6">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-24" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <TaskList
          tasks={filteredAndSortedTasks}
          onToggleComplete={handleToggleComplete}
          onEdit={handleEditTask}
          onDelete={handleDeleteTask}
        />
      )}

      <TaskForm
        open={isTaskFormOpen}
        onOpenChange={setIsTaskFormOpen}
        onSubmit={handleCreateOrUpdateTask}
        initialData={editingTask}
      />
    </div>
  );
}

// Dummy Card and Header components for Skeleton to work if not globally available
// These should ideally be imported from ui if they exist and are setup for general use
const Card = ({ className, children }: {className?: string, children: React.ReactNode}) => <div className={cn("rounded-lg border bg-card text-card-foreground shadow-sm", className)}>{children}</div>;
const CardHeader = ({ className, children }: {className?: string, children: React.ReactNode}) => <div className={cn("flex flex-col space-y-1.5 p-6", className)}>{children}</div>;
const CardContent = ({ className, children }: {className?: string, children: React.ReactNode}) => <div className={cn("p-6 pt-0", className)}>{children}</div>;
const CardFooter = ({ className, children }: {className?: string, children: React.ReactNode}) => <div className={cn("flex items-center p-6 pt-0", className)}>{children}</div>;

