"use client";

import type { TaskPriority, TaskStatus } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ListFilter, Search } from "lucide-react";

export type TaskFiltersType = {
  status: TaskStatus[];
  priority: TaskPriority[];
  searchTerm: string;
  sortBy: 'dueDate' | 'priority' | 'title' | 'createdAt';
  sortOrder: 'asc' | 'desc';
};

interface TaskFiltersProps {
  filters: TaskFiltersType;
  onFiltersChange: (filters: TaskFiltersType) => void;
}

const ALL_STATUSES: TaskStatus[] = ['pending', 'in-progress', 'completed'];
const ALL_PRIORITIES: TaskPriority[] = ['low', 'medium', 'high'];

export function TaskFilters({ filters, onFiltersChange }: TaskFiltersProps) {

  const handleStatusChange = (status: TaskStatus) => {
    const newStatuses = filters.status.includes(status)
      ? filters.status.filter(s => s !== status)
      : [...filters.status, status];
    onFiltersChange({ ...filters, status: newStatuses });
  };

  const handlePriorityChange = (priority: TaskPriority) => {
    const newPriorities = filters.priority.includes(priority)
      ? filters.priority.filter(p => p !== priority)
      : [...filters.priority, priority];
    onFiltersChange({ ...filters, priority: newPriorities });
  };
  
  const handleSearchTermChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({ ...filters, searchTerm: event.target.value });
  };

  const handleSortChange = (sortBy: TaskFiltersType['sortBy']) => {
    let newSortOrder = filters.sortOrder;
    if (filters.sortBy === sortBy) {
      newSortOrder = filters.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      newSortOrder = 'asc'; // Default to ascending for new sort field
    }
    onFiltersChange({ ...filters, sortBy, sortOrder: newSortOrder });
  };


  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6 p-4 border rounded-lg shadow-sm bg-card">
      <div className="relative w-full md:w-auto md:flex-grow">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search tasks by title or description..."
          value={filters.searchTerm}
          onChange={handleSearchTermChange}
          className="pl-10 w-full"
        />
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <ListFilter className="mr-2 h-4 w-4" />
              Filter Status ({filters.status.length > 0 ? filters.status.length : 'All'})
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[200px]">
            <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {ALL_STATUSES.map((status) => (
              <DropdownMenuCheckboxItem
                key={status}
                checked={filters.status.includes(status)}
                onCheckedChange={() => handleStatusChange(status)}
              >
                {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <ListFilter className="mr-2 h-4 w-4" />
              Filter Priority ({filters.priority.length > 0 ? filters.priority.length : 'All'})
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[200px]">
            <DropdownMenuLabel>Filter by Priority</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {ALL_PRIORITIES.map((priority) => (
              <DropdownMenuCheckboxItem
                key={priority}
                checked={filters.priority.includes(priority)}
                onCheckedChange={() => handlePriorityChange(priority)}
              >
                {priority.charAt(0).toUpperCase() + priority.slice(1)}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              Sort By: {filters.sortBy.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} ({filters.sortOrder === 'asc' ? 'Asc' : 'Desc'})
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Sort By</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {(['createdAt', 'dueDate', 'priority', 'title'] as const).map((option) => (
               <DropdownMenuItem key={option} onClick={() => handleSortChange(option)}>
                {option.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                {filters.sortBy === option && (filters.sortOrder === 'asc' ? ' (Asc)' : ' (Desc)')}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
