import { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { useTeamMembers } from '@/hooks/useTasks';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

interface TaskFilters {
  search?: string;
  status?: string[];
  assignee?: string;
}

interface TaskFiltersProps {
  filters: TaskFilters;
  onFiltersChange: (filters: TaskFilters) => void;
}

const statusOptions = [
  { value: 'not_started', label: 'Not Started' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
];

export function TaskFilters({ filters, onFiltersChange }: TaskFiltersProps) {
  const [filterPopoverOpen, setFilterPopoverOpen] = useState(false);
  const { data: teamMembers = [] } = useTeamMembers();

  const handleSearchChange = (search: string) => {
    onFiltersChange({ ...filters, search: search || undefined });
  };

  const handleStatusChange = (status: string, checked: boolean) => {
    const currentStatus = filters.status || [];
    const newStatus = checked
      ? [...currentStatus, status]
      : currentStatus.filter(s => s !== status);
    
    onFiltersChange({ 
      ...filters, 
      status: newStatus.length > 0 ? newStatus : undefined 
    });
  };

  const handleAssigneeChange = (assignee: string) => {
    onFiltersChange({ 
      ...filters, 
      assignee: assignee === 'all' ? undefined : assignee 
    });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = !!(filters.search || filters.status?.length || filters.assignee);
  const activeFilterCount = [
    filters.search,
    filters.status?.length,
    filters.assignee
  ].filter(Boolean).length;

  return (
    <div className="flex items-center space-x-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Search tasks..."
          value={filters.search || ''}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-10 w-64"
        />
      </div>

      {/* Advanced Filters */}
      <Popover open={filterPopoverOpen} onOpenChange={setFilterPopoverOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="relative">
            <Filter className="w-4 h-4 mr-2" />
            Filters
            {activeFilterCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-2 -right-2 w-5 h-5 p-0 flex items-center justify-center text-xs"
              >
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="start">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Filters</h4>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="h-auto p-0 text-muted-foreground hover:text-foreground"
                >
                  Clear all
                </Button>
              )}
            </div>

            {/* Status Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <div className="space-y-2">
                {statusOptions.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={option.value}
                      checked={filters.status?.includes(option.value) || false}
                      onCheckedChange={(checked) => 
                        handleStatusChange(option.value, checked as boolean)
                      }
                    />
                    <label 
                      htmlFor={option.value} 
                      className="text-sm font-normal cursor-pointer"
                    >
                      {option.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Assignee Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">Assignee</label>
              <Select 
                value={filters.assignee || ''} 
                onValueChange={handleAssigneeChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select assignee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All assignees</SelectItem>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {teamMembers.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.full_name || member.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Active Filter Tags */}
      {hasActiveFilters && (
        <div className="flex items-center space-x-2">
          {filters.search && (
            <Badge variant="secondary" className="gap-1">
              Search: {filters.search}
              <Button
                variant="ghost"
                size="icon"
                className="w-3 h-3 p-0 hover:bg-transparent"
                onClick={() => handleSearchChange('')}
              >
                <X className="w-2 h-2" />
              </Button>
            </Badge>
          )}
          
          {filters.status?.map((status) => {
            const statusLabel = statusOptions.find(s => s.value === status)?.label;
            return (
              <Badge key={status} variant="secondary" className="gap-1">
                {statusLabel}
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-3 h-3 p-0 hover:bg-transparent"
                  onClick={() => handleStatusChange(status, false)}
                >
                  <X className="w-2 h-2" />
                </Button>
              </Badge>
            );
          })}

          {filters.assignee && (
            <Badge variant="secondary" className="gap-1">
              {filters.assignee === 'unassigned' 
                ? 'Unassigned'
                : teamMembers.find(m => m.id === filters.assignee)?.full_name || 
                  teamMembers.find(m => m.id === filters.assignee)?.email || 
                  'Unknown'
              }
              <Button
                variant="ghost"
                size="icon"
                className="w-3 h-3 p-0 hover:bg-transparent"
                onClick={() => handleAssigneeChange('')}
              >
                <X className="w-2 h-2" />
              </Button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}