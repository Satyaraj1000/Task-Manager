"use client";

import type { Task, TaskPriority, AISuggestions } from '@/lib/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { useState, useEffect } from 'react';
import { getAISuggestionsForTask } from '@/lib/actions/tasks';
import { useToast } from '@/hooks/use-toast';

const taskFormSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters.' }),
  description: z.string().optional(),
  dueDate: z.date().optional(),
  priority: z.enum(['low', 'medium', 'high']),
  category: z.string().optional(),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

interface TaskFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: TaskFormValues) => Promise<void>;
  initialData?: Partial<Task>; // For editing
}

export function TaskForm({ open, onOpenChange, onSubmit, initialData }: TaskFormProps) {
  const [isAISuggesting, setIsAISuggesting] = useState(false);
  const [aiSuggestions, setAISuggestions] = useState<AISuggestions | null>(null);
  const { toast } = useToast();

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      dueDate: initialData?.dueDate ? (typeof initialData.dueDate === 'string' ? parseISO(initialData.dueDate) : initialData.dueDate) : undefined,
      priority: initialData?.priority || 'medium',
      category: initialData?.category || '',
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        title: initialData.title || '',
        description: initialData.description || '',
        dueDate: initialData.dueDate ? (typeof initialData.dueDate === 'string' ? parseISO(initialData.dueDate) : initialData.dueDate) : undefined,
        priority: initialData.priority || 'medium',
        category: initialData.category || '',
      });
    } else {
       form.reset({ title: '', description: '', dueDate: undefined, priority: 'medium', category: '' });
    }
     setAISuggestions(null);
  }, [initialData, form, open]);


  const handleGetAISuggestions = async () => {
    const description = form.getValues('description');
    if (!description || description.trim().length < 10) {
      toast({ title: "AI Suggestions", description: "Please provide a more detailed description (at least 10 characters) for AI suggestions.", variant: "default" });
      return;
    }
    setIsAISuggesting(true);
    try {
      const suggestions = await getAISuggestionsForTask(description);
      setAISuggestions(suggestions);
      if (suggestions.category) {
        form.setValue('category', suggestions.category);
      }
      if (suggestions.optimalDueDate) {
        form.setValue('dueDate', parseISO(suggestions.optimalDueDate));
      }
      toast({ title: "AI Suggestions Applied", description: "Category and due date updated based on AI." });
    } catch (error) {
      toast({ title: "AI Suggestion Error", description: "Could not fetch AI suggestions.", variant: "destructive" });
    }
    setIsAISuggesting(false);
  };
  
  const handleFormSubmit = async (values: TaskFormValues) => {
    await onSubmit(values);
    form.reset();
    setAISuggestions(null);
    onOpenChange(false);
  };


  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) {
        form.reset();
        setAISuggestions(null);
      }
      onOpenChange(isOpen);
    }}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>{initialData?.id ? 'Edit Task' : 'Create New Task'}</DialogTitle>
          <DialogDescription>
            {initialData?.id ? 'Update the details of your task.' : 'Fill in the details for your new task.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 py-2">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Finish project proposal" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Add more details about the task..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex items-end gap-2">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Category (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Work, Personal" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <Button type="button" variant="outline" size="sm" onClick={handleGetAISuggestions} disabled={isAISuggesting}>
                <Sparkles className={cn("mr-2 h-4 w-4", isAISuggesting && "animate-spin")} />
                {isAISuggesting ? 'Suggesting...' : 'AI Suggest'}
              </Button>
            </div>

            {aiSuggestions?.suggestedTasks && aiSuggestions.suggestedTasks.length > 0 && (
              <div className="p-3 my-2 border rounded-md bg-secondary/50">
                <p className="text-sm font-medium text-secondary-foreground mb-1">AI Suggested Related Tasks:</p>
                <ul className="list-disc list-inside text-sm text-muted-foreground">
                  {aiSuggestions.suggestedTasks.map((task, index) => <li key={index}>{task}</li>)}
                </ul>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Due Date (Optional)</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={'outline'}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))} // Disable past dates
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => {
                 form.reset(); setAISuggestions(null); onOpenChange(false);
              }}>Cancel</Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? (initialData?.id ? 'Saving...' : 'Creating...') : (initialData?.id ? 'Save Changes' : 'Create Task')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
