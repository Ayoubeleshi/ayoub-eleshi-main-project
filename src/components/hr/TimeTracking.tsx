import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Play, 
  Square, 
  Pause,
  Clock, 
  Calendar, 
  Plus, 
  Coffee,
  FileText,
  Download,
  Users,
  Target,
  Timer,
  PlayCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';
import { format, differenceInMinutes, startOfDay, endOfDay, parseISO } from 'date-fns';

interface TimeEntry {
  id: string;
  profile_id: string;
  task_id?: string;
  start_time: string;
  end_time?: string;
  description?: string;
  is_break?: boolean;
  break_type?: string;
  created_at: string;
  updated_at: string;
}

interface LeaveRequest {
  id: string;
  profile_id: string;
  start_date: string;
  end_date: string;
  reason: string;
  status: string;
  approved_by?: string;
  created_at: string;
}

interface Project {
  id: string;
  name: string;
  color: string;
}

export default function TimeTracking() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [activeTimer, setActiveTimer] = useState<TimeEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('timer');

  // Timer form
  const [timerDescription, setTimerDescription] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [isBreak, setIsBreak] = useState(false);
  const [breakType, setBreakType] = useState('lunch');

  // Leave request form
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  // Mock projects
  const mockProjects: Project[] = [
    { id: '1', name: 'Website Development', color: 'bg-blue-500' },
    { id: '2', name: 'Mobile App', color: 'bg-green-500' },
    { id: '3', name: 'Marketing Campaign', color: 'bg-purple-500' },
    { id: '4', name: 'Client Support', color: 'bg-orange-500' },
  ];

  useEffect(() => {
    if (profile?.id) {
      fetchTimeEntries();
      fetchLeaveRequests();
    }
  }, [profile]);

  const fetchTimeEntries = async () => {
    if (!profile?.id) return;

    try {
      const { data, error } = await supabase
        .from('time_tracking')
        .select('*')
        .eq('profile_id', profile.id)
        .gte('start_time', startOfDay(new Date()).toISOString())
        .lte('start_time', endOfDay(new Date()).toISOString())
        .order('start_time', { ascending: false });

      if (error) throw error;

      const entries = (data || []).map(entry => ({
        ...entry,
        is_break: false,
        break_type: null
      }));
      setTimeEntries(entries);
      
      const active = entries.find(entry => !entry.end_time);
      setActiveTimer(active || null);
    } catch (error) {
      console.error('Error fetching time entries:', error);
      toast({
        title: "Error",
        description: "Failed to load time entries",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLeaveRequests = async () => {
    if (!profile?.id) return;

    try {
      const { data, error } = await supabase
        .from('leave_requests')
        .select('*')
        .eq('profile_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLeaveRequests(data || []);
    } catch (error) {
      console.error('Error fetching leave requests:', error);
    }
  };

  const startTimer = async () => {
    if (!profile?.id) return;

    try {
      const { data, error } = await supabase
        .from('time_tracking')
        .insert({
          profile_id: profile.id,
          task_id: selectedProject || null,
          start_time: new Date().toISOString(),
          description: timerDescription,
          is_break: isBreak,
          break_type: isBreak ? breakType : null,
        })
        .select()
        .single();

      if (error) throw error;
      
      setActiveTimer(data);
      setTimerDescription('');
      setIsBreak(false);
      setBreakType('lunch');
      setIsDialogOpen(false);
      
      toast({
        title: "Timer Started! ⏰",
        description: isBreak ? `Break started - ${breakType}` : "Work timer is now running",
      });

      fetchTimeEntries();
    } catch (error) {
      console.error('Error starting timer:', error);
      toast({
        title: "Error",
        description: "Failed to start timer",
        variant: "destructive",
      });
    }
  };

  const stopTimer = async () => {
    if (!activeTimer) return;

    try {
      const { error } = await supabase
        .from('time_tracking')
        .update({
          end_time: new Date().toISOString(),
        })
        .eq('id', activeTimer.id);

      if (error) throw error;
      
      setActiveTimer(null);
      
      toast({
        title: "Timer Stopped! ✅",
        description: "Time entry saved successfully",
      });

      fetchTimeEntries();
    } catch (error) {
      console.error('Error stopping timer:', error);
      toast({
        title: "Error",
        description: "Failed to stop timer",
        variant: "destructive",
      });
    }
  };

  const pauseTimer = async () => {
    if (!activeTimer) return;

    try {
      const { error: stopError } = await supabase
        .from('time_tracking')
        .update({
          end_time: new Date().toISOString(),
        })
        .eq('id', activeTimer.id);

      if (stopError) throw stopError;

      const { data: breakData, error: breakError } = await supabase
        .from('time_tracking')
        .insert({
          profile_id: profile.id,
          start_time: new Date().toISOString(),
          description: 'Break',
          is_break: true,
          break_type: 'pause',
        })
        .select()
        .single();

      if (breakError) throw breakError;

      setActiveTimer(breakData);
      
      toast({
        title: "Break Started! ☕",
        description: "Timer paused - break timer is running",
      });

      fetchTimeEntries();
    } catch (error) {
      console.error('Error pausing timer:', error);
      toast({
        title: "Error",
        description: "Failed to pause timer",
        variant: "destructive",
      });
    }
  };

  const resumeTimer = async () => {
    if (!activeTimer || !activeTimer.is_break) return;

    try {
      const { error: stopError } = await supabase
        .from('time_tracking')
        .update({
          end_time: new Date().toISOString(),
        })
        .eq('id', activeTimer.id);

      if (stopError) throw stopError;

      const { data: workData, error: workError } = await supabase
        .from('time_tracking')
        .insert({
          profile_id: profile.id,
          task_id: selectedProject || null,
          start_time: new Date().toISOString(),
          description: timerDescription || 'Work resumed',
          is_break: false,
        })
        .select()
        .single();

      if (workError) throw workError;

      setActiveTimer(workData);
      
      toast({
        title: "Work Resumed! 🚀",
        description: "Break ended - work timer is running",
      });

      fetchTimeEntries();
    } catch (error) {
      console.error('Error resuming timer:', error);
      toast({
        title: "Error",
        description: "Failed to resume timer",
        variant: "destructive",
      });
    }
  };

  const createLeaveRequest = async () => {
    if (!profile?.id) return;

    try {
      const { error } = await supabase
        .from('leave_requests')
        .insert({
          profile_id: profile.id,
          start_date: startDate,
          end_date: endDate,
          reason: reason,
          status: 'pending',
        });

      if (error) throw error;

      toast({
        title: "Leave Request Submitted! 📅",
        description: "Your request has been sent for approval",
      });

      setStartDate('');
      setEndDate('');
      setReason('');
      setIsLeaveDialogOpen(false);
      fetchLeaveRequests();
    } catch (error) {
      console.error('Error creating leave request:', error);
      toast({
        title: "Error",
        description: "Failed to submit leave request",
        variant: "destructive",
      });
    }
  };

  const getTodayStats = () => {
    const today = timeEntries.filter(entry => {
      const entryDate = parseISO(entry.start_time);
      return entryDate >= startOfDay(new Date()) && entryDate <= endOfDay(new Date());
    });

    const workTime = today
      .filter(entry => !entry.is_break)
      .reduce((total, entry) => {
        if (entry.end_time) {
          return total + differenceInMinutes(parseISO(entry.end_time), parseISO(entry.start_time));
        }
        return total;
      }, 0);

    const breakTime = today
      .filter(entry => entry.is_break)
      .reduce((total, entry) => {
        if (entry.end_time) {
          return total + differenceInMinutes(parseISO(entry.end_time), parseISO(entry.start_time));
        }
        return total;
      }, 0);

    return {
      workHours: Math.round((workTime / 60) * 100) / 100,
      breakHours: Math.round((breakTime / 60) * 100) / 100,
      totalEntries: today.length,
    };
  };

    const exportTimeData = () => {
    const csvContent = [
      'Date,Start Time,End Time,Duration (hours),Description,Project,Type'
    ];
    
    timeEntries.forEach(entry => {
      const startTime = parseISO(entry.start_time);
      const endTime = entry.end_time ? parseISO(entry.end_time) : null;
      const duration = endTime ? differenceInMinutes(endTime, startTime) / 60 : 'Active';
      
      const row = [
        format(startTime, 'yyyy-MM-dd'),
        format(startTime, 'HH:mm'),
        endTime ? format(endTime, 'HH:mm') : 'Active',
        duration,
        entry.description || '',
        mockProjects.find(p => p.id === entry.task_id)?.name || '',
        entry.is_break ? 'Break' : 'Work'
      ].join(',');
      
      csvContent.push(row);
    });
    
    const finalCsv = csvContent.join('\n');
    const blob = new Blob([finalCsv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `time-tracking-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Complete! 📊",
      description: "Time tracking data downloaded as CSV",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Loading Time Tracking</h2>
            <p className="text-muted-foreground">Setting up your workspace...</p>
          </div>
        </div>
      </div>
    );
  }

  const todayStats = getTodayStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-blue-900/20 dark:to-purple-900/20">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Time Tracking & HR</h1>
            <p className="text-muted-foreground">Track your work hours, manage breaks, and request time off</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={exportTimeData}>
              <Download className="mr-2 h-4 w-4" />
              Export Data
            </Button>
            <Button onClick={() => setIsLeaveDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Request Leave
            </Button>
          </div>
        </div>

        {/* Today's Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-blue-600 dark:text-blue-400">Work Hours</p>
                  <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">{todayStats.workHours}h</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                  <Coffee className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-green-600 dark:text-green-400">Break Time</p>
                  <p className="text-2xl font-bold text-green-800 dark:text-green-200">{todayStats.breakHours}h</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-purple-600 dark:text-purple-400">Time Entries</p>
                  <p className="text-2xl font-bold text-purple-800 dark:text-purple-200">{todayStats.totalEntries}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-orange-600 dark:text-orange-400">Leave Requests</p>
                  <p className="text-2xl font-bold text-orange-800 dark:text-orange-200">{leaveRequests.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="timer">Timer & Tracking</TabsTrigger>
            <TabsTrigger value="overview">Daily Overview</TabsTrigger>
            <TabsTrigger value="leave">Leave Management</TabsTrigger>
          </TabsList>

          {/* Timer & Tracking Tab */}
          <TabsContent value="timer" className="space-y-6">
            {/* Active Timer */}
            {activeTimer && (
              <Card className="bg-gradient-to-r from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-800/20 border-green-200">
                <CardContent className="p-8">
                  <div className="text-center space-y-6">
                    <div className="flex items-center justify-center space-x-4">
                      <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center">
                        <Timer className="w-10 h-10 text-white" />
                      </div>
                      <div className="text-left">
                        <h2 className="text-2xl font-bold text-green-800 dark:text-green-200">
                          {activeTimer.is_break ? 'Break Timer Running' : 'Work Timer Running'}
                        </h2>
                        <p className="text-green-600 dark:text-green-400">
                          Started at {format(parseISO(activeTimer.start_time), 'HH:mm')}
                        </p>
                        {activeTimer.description && (
                          <p className="text-green-600 dark:text-green-400">
                            {activeTimer.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-center space-x-4">
                      {activeTimer.is_break ? (
                        <Button size="lg" onClick={resumeTimer} className="bg-green-600 hover:bg-green-700">
                          <PlayCircle className="mr-2 h-5 w-5" />
                          Resume Work
                        </Button>
                      ) : (
                        <>
                          <Button size="lg" variant="outline" onClick={pauseTimer} className="border-orange-300 text-orange-700 hover:bg-orange-50">
                            <Pause className="mr-2 h-5 w-5" />
                            Take Break
                          </Button>
                          <Button size="lg" onClick={stopTimer} className="bg-red-600 hover:bg-red-700">
                            <Square className="mr-2 h-5 w-5" />
                  Stop Timer
                </Button>
              </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Start New Timer */}
            {!activeTimer && (
              <Card className="bg-gradient-to-r from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-800/20 border-blue-200">
                <CardContent className="p-8">
                  <div className="text-center space-y-6">
                    <div className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center mx-auto">
                      <Play className="w-12 h-12 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-blue-800 dark:text-blue-200 mb-2">
                        Ready to Start Working?
                      </h2>
                      <p className="text-blue-600 dark:text-blue-400">
                        Click the button below to start tracking your work time
                      </p>
                    </div>
                    <Button size="lg" onClick={() => setIsDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                <Play className="mr-2 h-5 w-5" />
                Start Timer
              </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Coffee className="w-5 h-5 text-orange-500" />
                    <span>Quick Break</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Take a quick break without stopping your work timer
                  </p>
                  <Button variant="outline" onClick={() => {
                    setIsBreak(true);
                    setBreakType('quick');
                    setIsDialogOpen(true);
                  }}>
                    <Coffee className="mr-2 h-4 w-4" />
                    Start Break
                  </Button>
        </CardContent>
      </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-purple-500" />
                    <span>Manual Entry</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Add time entries manually for past work sessions
                  </p>
                  <Button variant="outline">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Entry
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Daily Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
        <Card>
          <CardHeader>
                <CardTitle>Today's Time Entries</CardTitle>
          </CardHeader>
          <CardContent>
                {timeEntries.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No time entries for today</p>
                    <p className="text-sm text-muted-foreground">Start your timer to begin tracking</p>
                  </div>
                ) : (
            <Table>
              <TableHeader>
                <TableRow>
                        <TableHead>Time</TableHead>
                  <TableHead>Duration</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Project</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                      {timeEntries.map((entry) => {
                        const duration = entry.end_time 
                          ? differenceInMinutes(parseISO(entry.end_time), parseISO(entry.start_time))
                          : differenceInMinutes(new Date(), parseISO(entry.start_time));
                        
                        return (
                          <TableRow key={entry.id}>
                            <TableCell>
                              <div className="text-sm">
                                <div className="font-medium">
                                  {format(parseISO(entry.start_time), 'HH:mm')}
                                </div>
                                {entry.end_time && (
                                  <div className="text-muted-foreground">
                                    - {format(parseISO(entry.end_time), 'HH:mm')}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={entry.end_time ? "secondary" : "default"}>
                                {entry.end_time ? `${Math.round(duration)}m` : 'Active'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={entry.is_break ? "outline" : "default"}>
                                {entry.is_break ? 'Break' : 'Work'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {entry.task_id && mockProjects.find(p => p.id === entry.task_id)?.name}
                            </TableCell>
                            <TableCell>
                              <div className="max-w-xs truncate">
                                {entry.description || 'No description'}
                              </div>
                    </TableCell>
                  </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Leave Management Tab */}
          <TabsContent value="leave" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Leave Requests</CardTitle>
              </CardHeader>
              <CardContent>
                {leaveRequests.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No leave requests</p>
                    <p className="text-sm text-muted-foreground">Submit a request to get started</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Dates</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Submitted</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {leaveRequests.map((request) => (
                        <TableRow key={request.id}>
                          <TableCell>
                            <div className="text-sm">
                              <div className="font-medium">
                                {format(parseISO(request.start_date), 'MMM dd')}
                              </div>
                              <div className="text-muted-foreground">
                                to {format(parseISO(request.end_date), 'MMM dd, yyyy')}
                              </div>
                            </div>
                          </TableCell>
                      <TableCell>
                            <div className="max-w-xs truncate">
                              {request.reason}
                            </div>
                      </TableCell>
                      <TableCell>
                            <Badge 
                              variant={
                                request.status === 'approved' ? 'default' : 
                                request.status === 'rejected' ? 'destructive' : 'secondary'
                              }
                            >
                              {request.status}
                            </Badge>
                      </TableCell>
                      <TableCell>
                            {format(parseISO(request.created_at), 'MMM dd, yyyy')}
                      </TableCell>
                    </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
          </CardContent>
        </Card>
          </TabsContent>
        </Tabs>

        {/* Start Timer Dialog */}
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Start Timer</DialogTitle>
              <DialogDescription>
                Configure your timer settings before starting
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Description (Optional)</Label>
                <Input
                  value={timerDescription}
                  onChange={(e) => setTimerDescription(e.target.value)}
                  placeholder="What are you working on?"
                />
              </div>

              <div className="space-y-2">
                <Label>Project (Optional)</Label>
                <Select value={selectedProject} onValueChange={setSelectedProject}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a project" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockProjects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${project.color}`}></div>
                          <span>{project.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Timer Type</Label>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      checked={!isBreak}
                      onChange={() => setIsBreak(false)}
                      className="text-primary"
                    />
                    <span>Work</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      checked={isBreak}
                      onChange={() => setIsBreak(true)}
                      className="text-primary"
                    />
                    <span>Break</span>
                  </label>
                </div>
              </div>

              {isBreak && (
                <div className="space-y-2">
                  <Label>Break Type</Label>
                  <Select value={breakType} onValueChange={setBreakType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lunch">Lunch</SelectItem>
                      <SelectItem value="coffee">Coffee Break</SelectItem>
                      <SelectItem value="quick">Quick Break</SelectItem>
                      <SelectItem value="pause">General Pause</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={startTimer}>
                <Play className="mr-2 h-4 w-4" />
                Start Timer
                  </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Leave Request Dialog */}
        <Dialog open={isLeaveDialogOpen} onOpenChange={setIsLeaveDialogOpen}>
          <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Request Leave</DialogTitle>
              <DialogDescription>
                Submit a request for time off
              </DialogDescription>
                  </DialogHeader>
            <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                        <Input
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          required
                        />
                      </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                        <Input
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          required
                        />
                      </div>
                    </div>
              <div className="space-y-2">
                <Label>Reason</Label>
                      <Textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                  placeholder="Why do you need time off?"
                  rows={3}
                        required
                      />
                    </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsLeaveDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={createLeaveRequest}>
                <Plus className="mr-2 h-4 w-4" />
                      Submit Request
                    </Button>
            </DialogFooter>
                </DialogContent>
              </Dialog>
      </div>
    </div>
  );
}
