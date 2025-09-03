import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Settings, Plus, Trash2 } from 'lucide-react';
import { CalendarData } from './CalendarModule';
import { GoogleIntegration } from './GoogleIntegration';

interface CalendarSidebarProps {
  calendars: CalendarData[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onToggleCalendar: (calendarId: string) => void;
  selectedDate: Date | undefined;
  onDateSelect: (date: Date | undefined) => void;
  onCalendarsUpdated: () => void;
  onCreateCalendar: (calendarData: {
    name: string;
    description?: string;
    color: string;
    type: 'local' | 'google' | 'outlook';
    sharing: 'private' | 'team' | 'public';
  }) => void;
  onDeleteCalendar: (calendarId: string) => void;
  onCalendarSelect: (calendarId: string) => void;
  selectedCalendarId: string | null;
}

export function CalendarSidebar({
  calendars,
  searchQuery,
  onSearchChange,
  onToggleCalendar,
  selectedDate,
  onDateSelect,
  onCalendarsUpdated,
  onCreateCalendar,
  onDeleteCalendar,
  onCalendarSelect,
  selectedCalendarId
}: CalendarSidebarProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newCalendar, setNewCalendar] = useState({
    name: '',
    description: '',
    color: '#3b82f6',
    type: 'local' as 'local' | 'google' | 'outlook',
    sharing: 'private' as 'private' | 'team' | 'public'
  });

  const colorOptions = [
    '#3b82f6', '#ef4444', '#22c55e', '#f59e0b', 
    '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'
  ];

  const handleCreateCalendar = () => {
    if (!newCalendar.name.trim()) return;
    
    onCreateCalendar(newCalendar);
    setNewCalendar({
      name: '',
      description: '',
      color: '#3b82f6',
      type: 'local',
      sharing: 'private'
    });
    setIsCreateModalOpen(false);
  };

  return (
    <div className="w-80 border-r border-border bg-card flex flex-col">

      {/* Search */}
      <div className="px-4 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Calendars List */}
      <div className="flex-1 px-4 pb-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center justify-between">
              My Calendars
              <Button variant="ghost" size="sm" onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {calendars.map((calendar) => (
              <div 
                key={calendar.id} 
                className={`flex items-center space-x-3 py-2 px-2 rounded cursor-pointer transition-colors group ${
                  selectedCalendarId === calendar.id 
                    ? 'bg-primary/20 border-2 border-primary' 
                    : 'hover:bg-muted/50'
                }`}
                onClick={() => onCalendarSelect(calendar.id)}
              >
                <Checkbox
                  checked={calendar.visible}
                  onCheckedChange={() => onToggleCalendar(calendar.id)}
                  onClick={(e) => e.stopPropagation()}
                />
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: calendar.color }}
                />
                <span className={`text-sm flex-1 truncate ${
                  selectedCalendarId === calendar.id ? 'font-semibold' : ''
                }`}>
                  {calendar.name}
                  {selectedCalendarId === calendar.id && (
                    <span className="ml-2 text-xs text-primary">(Active)</span>
                  )}
                </span>
                {calendar.type !== 'local' && (
                  <div className="text-xs text-muted-foreground capitalize">
                    {calendar.type}
                  </div>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteCalendar(calendar.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-opacity"
                  title="Delete calendar"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Team Calendars */}
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-sm">Team Calendars</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {calendars.filter(cal => cal.sharing === 'team').map((calendar) => (
              <div 
                key={calendar.id} 
                className={`flex items-center space-x-3 py-2 px-2 rounded cursor-pointer transition-colors group ${
                  selectedCalendarId === calendar.id 
                    ? 'bg-primary/20 border-2 border-primary' 
                    : 'hover:bg-muted/50'
                }`}
                onClick={() => onCalendarSelect(calendar.id)}
              >
                <Checkbox
                  checked={calendar.visible}
                  onCheckedChange={() => onToggleCalendar(calendar.id)}
                  onClick={(e) => e.stopPropagation()}
                />
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: calendar.color }}
                />
                <span className={`text-sm flex-1 truncate ${
                  selectedCalendarId === calendar.id ? 'font-semibold' : ''
                }`}>
                  {calendar.name}
                  {selectedCalendarId === calendar.id && (
                    <span className="ml-2 text-xs text-primary">(Active)</span>
                  )}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteCalendar(calendar.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-opacity"
                  title="Delete calendar"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            {calendars.filter(cal => cal.sharing === 'team').length === 0 && (
              <p className="text-xs text-muted-foreground">No team calendars</p>
            )}
          </CardContent>
        </Card>

        {/* Google Integration */}
        <GoogleIntegration onCalendarsUpdated={onCalendarsUpdated} />

        {/* Settings */}
        <Button variant="ghost" className="w-full mt-4 justify-start" size="sm">
          <Settings className="mr-2 h-4 w-4" />
          Calendar Settings
        </Button>
      </div>

      {/* Create Calendar Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Calendar</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="calendar-name">Calendar Name</Label>
              <Input
                id="calendar-name"
                value={newCalendar.name}
                onChange={(e) => setNewCalendar(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter calendar name"
              />
            </div>
            
            <div>
              <Label htmlFor="calendar-description">Description (Optional)</Label>
              <Input
                id="calendar-description"
                value={newCalendar.description}
                onChange={(e) => setNewCalendar(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter description"
              />
            </div>

            <div>
              <Label htmlFor="calendar-type">Type</Label>
              <Select
                value={newCalendar.type}
                onValueChange={(value: 'local' | 'google' | 'outlook') => 
                  setNewCalendar(prev => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="local">Local</SelectItem>
                  <SelectItem value="google">Google</SelectItem>
                  <SelectItem value="outlook">Outlook</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="calendar-sharing">Sharing</Label>
              <Select
                value={newCalendar.sharing}
                onValueChange={(value: 'private' | 'team' | 'public') => 
                  setNewCalendar(prev => ({ ...prev, sharing: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="private">Private</SelectItem>
                  <SelectItem value="team">Team</SelectItem>
                  <SelectItem value="public">Public</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Color</Label>
              <div className="flex space-x-2">
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`w-6 h-6 rounded-full border-2 ${
                      newCalendar.color === color ? 'border-primary' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setNewCalendar(prev => ({ ...prev, color }))}
                  />
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateCalendar} disabled={!newCalendar.name.trim()}>
                Create Calendar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}