"use client";

import type { Task } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Edit3, Trash2, MoreVertical, CalendarDays, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { format, parseISO, differenceInDays, isPast } from 'date-fns';
import { cn } from '@/lib/utils';

interface TaskCardProps {
  task: Task;
  onToggleComplete: (taskId: string, currentStatus: Task['status']) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

const priorityColors: Record<Task['priority'], string> = {
  low: 'bg-green-500 hover:bg-green-600',
  medium: 'bg-yellow-500 hover:bg-yellow-600',
  high: 'bg-red-500 hover:bg-red-600',
};

const statusIcons: Record<Task['status'], React.ReactNode> = {
  pending: <AlertTriangle className="h-4 w-4 text-yellow-500" />,
  'in-progress': <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-blue-500 animate-spin-slow"><path d="M12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2ZM12 4C7.58172 4 4 7.58172 4 12C4 13.8228 4.66307 15.4893 5.76729 16.818L16.818 5.76729C15.4893 4.66307 13.8228 4 12 4Z"></path></svg>,
  completed: <CheckCircle2 className="h-4 w-4 text-green-500" />,
};

export function TaskCard({ task, onToggleComplete, onEdit, onDelete }: TaskCardProps) {
  const formattedDueDate = task.dueDate ? format(parseISO(task.dueDate.toString()), 'MMM dd, yyyy') : 'No due date';
  const isOverdue = task.dueDate && isPast(parseISO(task.dueDate.toString())) && task.status !== 'completed';
  const daysRemaining = task.dueDate && task.status !== 'completed' ? differenceInDays(parseISO(task.dueDate.toString()), new Date()) : null;

  return (
    <Card className={cn("flex flex-col justify-between shadow-md hover:shadow-lg transition-shadow duration-200", task.status === 'completed' ? 'bg-muted/50' : 'bg-card')}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox
              id={`task-${task.id}`}
              checked={task.status === 'completed'}
              onCheckedChange={() => onToggleComplete(task.id, task.status)}
              aria-label={task.status === 'completed' ? 'Mark task as incomplete' : 'Mark task as complete'}
              className={cn(task.status === 'completed' ? 'border-primary data-[state=checked]:bg-primary' : '')}
            />
            <CardTitle className={cn("text-lg font-semibold leading-tight", task.status === 'completed' && 'line-through text-muted-foreground')}>
              {task.title}
            </CardTitle>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(task)} disabled={task.status === 'completed'}>
                <Edit3 className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(task.id)} className="text-destructive focus:text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {task.description && (
          <CardDescription className={cn("mt-1 text-sm", task.status === 'completed' && 'line-through text-muted-foreground/70')}>
            {task.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="py-2">
        <div className="flex items-center text-xs text-muted-foreground mb-2">
          <CalendarDays className="mr-1.5 h-3.5 w-3.5" />
          <span>{formattedDueDate}</span>
          {isOverdue && <Badge variant="destructive" className="ml-2">Overdue</Badge>}
          {daysRemaining !== null && !isOverdue && daysRemaining >= 0 && (
            <Badge variant="outline" className="ml-2">
              {daysRemaining === 0 ? 'Due today' : `${daysRemaining} day${daysRemaining === 1 ? '' : 's'} left`}
            </Badge>
          )}
        </div>
         {task.category && <Badge variant="secondary">{task.category}</Badge>}
      </CardContent>
      <CardFooter className="flex items-center justify-between pt-2 pb-4 px-6">
        <Badge className={cn("text-xs text-white", priorityColors[task.priority])}>
          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
        </Badge>
        <div className="flex items-center space-x-1 text-xs text-muted-foreground">
          {statusIcons[task.status]}
          <span>{task.status.charAt(0).toUpperCase() + task.status.slice(1).replace('-', ' ')}</span>
        </div>
      </CardFooter>
    </Card>
  );
}
