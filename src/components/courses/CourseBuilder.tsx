import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, 
  Play, 
  Plus, 
  GraduationCap, 
  Users, 
  Upload,
  Edit3,
  Eye,
  Settings,
  FileText,
  Video,
  CheckCircle,
  Clock,
  DollarSign,
  Tag,
  Image as ImageIcon,
  Trash2,
  Move,
  Copy,
  MoreHorizontal
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';

// Add custom CSS for enhanced visual effects
const customStyles = `
  .course-builder-gradient {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }
  
  .glass-effect {
    backdrop-filter: blur(16px);
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }
  
  .hover-lift {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .hover-lift:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  }
`;

interface Course {
  id: string;
  title: string;
  description: string;
  created_at: string;
  lessons?: Lesson[];
}

interface Lesson {
  id: string;
  title: string;
  content: string;
  video_url?: string;
  order_index: number;
}

const courseCategories = [
  { id: 'business', name: 'Business', color: 'bg-blue-500', icon: '💼' },
  { id: 'technology', name: 'Technology', color: 'bg-green-500', icon: '💻' },
  { id: 'marketing', name: 'Marketing', color: 'bg-purple-500', icon: '📈' },
  { id: 'design', name: 'Design', color: 'bg-pink-500', icon: '🎨' },
  { id: 'personal-development', name: 'Personal Development', color: 'bg-orange-500', icon: '🚀' },
  { id: 'finance', name: 'Finance', color: 'bg-emerald-500', icon: '💰' },
];

const courseStatuses = [
  { id: 'draft', name: 'Draft', color: 'bg-gray-500' },
  { id: 'published', name: 'Published', color: 'bg-green-500' },
  { id: 'archived', name: 'Archived', color: 'bg-red-500' },
];

export default function CourseBuilder() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCourseDialogOpen, setIsCourseDialogOpen] = useState(false);
  const [isLessonDialogOpen, setIsLessonDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Course form
  const [courseTitle, setCourseTitle] = useState('');
  const [courseDescription, setCourseDescription] = useState('');
  const [courseCategory, setCourseCategory] = useState('');
  const [courseStatus, setCourseStatus] = useState('draft');
  const [coursePrice, setCoursePrice] = useState('0');
  const [courseThumbnail, setCourseThumbnail] = useState('');
  const [courseThumbnailFile, setCourseThumbnailFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Lesson form
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonContent, setLessonContent] = useState('');
  const [lessonVideoUrl, setLessonVideoUrl] = useState('');
  const [lessonType, setLessonType] = useState('text');
  const [lessonDuration, setLessonDuration] = useState('');
  const [lessonFile, setLessonFile] = useState<File | null>(null);
  const [lessonFileType, setLessonFileType] = useState('');
  const [isFileUploading, setIsFileUploading] = useState(false);

  useEffect(() => {
    if (profile?.organization_id) {
      fetchCourses();
    }
  }, [profile?.organization_id]);

  useEffect(() => {
    if (selectedCourse) {
      fetchLessons(selectedCourse.id);
    }
  }, [selectedCourse?.id]);

  const fetchCourses = async () => {
    if (!profile?.organization_id) return;

    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCourses(data || []);
      
      if (data && data.length > 0 && !selectedCourse) {
        setSelectedCourse(data[0]);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast({
        title: "Error",
        description: "Failed to load courses",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLessons = async (courseId: string) => {
    try {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', courseId)
        .order('order_index');

      if (error) throw error;
      setLessons(data || []);
    } catch (error) {
      console.error('Error fetching lessons:', error);
    }
  };

  const createCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Creating course...', { courseTitle, courseDescription, courseThumbnailFile });
    
    try {
      if (!profile?.organization_id) {
        toast({
          title: "Error",
          description: "User profile not found",
          variant: "destructive",
        });
        return;
      }

      if (!courseTitle.trim()) {
        toast({
          title: "Title Required",
          description: "Please enter a course title",
          variant: "destructive",
        });
        return;
      }

      if (!courseDescription.trim()) {
        toast({
          title: "Description Required",
          description: "Please enter a course description",
          variant: "destructive",
        });
        return;
      }

      if (!courseThumbnailFile) {
        toast({
          title: "Thumbnail Required",
          description: "Please upload a course thumbnail",
          variant: "destructive",
        });
        return;
      }

      console.log('All validations passed, starting upload...');
      setIsUploading(true);

      // TODO: Upload thumbnail file to storage
      // For now, we'll just create the course without the thumbnail
      const { data, error } = await supabase
        .from('courses')
        .insert({
          organization_id: profile.organization_id,
          title: courseTitle,
          description: courseDescription,
          created_by: profile.id
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success! 🎉",
        description: "Your course has been created successfully! Click 'Add Lesson' to start building your course content.",
      });

      // Reset form
      resetCourseForm();
      
      // Close dialog (Dialog component will handle this automatically)
      setIsCourseDialogOpen(false);
      
      // Refresh data
      await fetchCourses();
      
      // Set selected course
      if (data) {
      setSelectedCourse(data);
      }
    } catch (error) {
      console.error('Error creating course:', error);
      toast({
        title: "Oops! 😅",
        description: "Failed to create course. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const createLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Creating lesson...', { lessonTitle, lessonContent, lessonType, lessonFile });
    
    if (!selectedCourse) {
      toast({
        title: "Error",
        description: "No course selected",
        variant: "destructive",
      });
      return;
    }

    if (!lessonTitle.trim()) {
      toast({
        title: "Title Required",
        description: "Please enter a lesson title",
        variant: "destructive",
      });
      return;
    }

    if (!lessonContent.trim()) {
      toast({
        title: "Content Required",
        description: "Please enter lesson content",
        variant: "destructive",
      });
      return;
    }

    // Validate required fields based on lesson type
    if (lessonType === 'video-upload' && !lessonVideoUrl.trim()) {
      toast({
        title: "Video URL Required",
        description: "Please enter a video URL for video lessons",
        variant: "destructive",
      });
      return;
    }

    if (lessonType === 'document' && !lessonFile) {
      toast({
        title: "File Required",
        description: "Please upload a document file for document lessons",
        variant: "destructive",
      });
      return;
    }

    setIsFileUploading(true);

    try {
      // TODO: Upload file to storage if lesson type requires it
      // For now, we'll just create the lesson with metadata
      const { error } = await supabase
        .from('lessons')
        .insert({
          course_id: selectedCourse.id,
          title: lessonTitle,
          content: lessonContent,
          video_url: lessonVideoUrl || null,
          order_index: lessons.length,
          // TODO: Add these fields to database schema
          // lesson_type: lessonType,
          // file_url: lessonFile ? 'uploaded_file_url' : null,
          // file_type: lessonFileType || null
        });

      if (error) throw error;

      toast({
        title: "Success! 🎉",
        description: "Lesson created successfully",
      });

      // Reset form
      resetLessonForm();
      
      // Close dialog (Dialog component will handle this automatically)
      setIsLessonDialogOpen(false);
      
      // Refresh lessons
      fetchLessons(selectedCourse.id);
    } catch (error) {
      console.error('Error creating lesson:', error);
      toast({
        title: "Oops! 😅",
        description: "Failed to create lesson. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsFileUploading(false);
    }
  };

  const handleLessonReorder = (fromIndex: number, toIndex: number) => {
    const newLessons = [...lessons];
    const [movedLesson] = newLessons.splice(fromIndex, 1);
    newLessons.splice(toIndex, 0, movedLesson);
    
    // Update order_index for all lessons
    const updatedLessons = newLessons.map((lesson, index) => ({
      ...lesson,
      order_index: index
    }));
    
    setLessons(updatedLessons);
    // TODO: Update database with new order
  };

  const resetCourseForm = () => {
    setCourseTitle('');
    setCourseDescription('');
    setCourseCategory('');
    setCourseStatus('draft');
    setCoursePrice('0');
    setCourseThumbnail('');
    setCourseThumbnailFile(null);
  };

  const resetLessonForm = () => {
    setLessonTitle('');
    setLessonContent('');
    setLessonVideoUrl('');
    setLessonType('text');
    setLessonDuration('');
    setLessonFile(null);
    setLessonFileType('');
  };

  const handleContentTypeClick = (contentType: string) => {
    // Map content types to lesson types
    const lessonTypeMap: { [key: string]: string } = {
      'text': 'text',
      'video': 'video-upload',
      'document': 'document'
    };

    // Set the lesson type and open lesson dialog
    setLessonType(lessonTypeMap[contentType] || 'text');
    
    // Pre-fill some content based on type
    switch (contentType) {
      case 'text':
        setLessonContent('Write your lesson content here...');
        break;
      case 'video':
        setLessonContent('Add video description and learning objectives...');
        break;
      case 'document':
        setLessonContent('Upload document and provide context...');
        break;
    }

    // Open lesson dialog
    setIsLessonDialogOpen(true);
    
    // Show toast with info
    toast({
      title: "Content Type Selected! 🎯",
      description: `Ready to create a ${contentType} lesson. The form has been pre-filled for you.`,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Loading Course Builder</h2>
            <p className="text-muted-foreground">Setting up your course creation workspace...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{customStyles}</style>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-blue-900/20 dark:to-purple-900/20">

        <div className="container mx-auto p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                Course Builder
              </h1>
              <p className="text-xl text-muted-foreground">
                Create engaging courses and share knowledge with your team
              </p>
            </div>
            <Dialog open={isCourseDialogOpen} onOpenChange={(open) => {
              if (!open) {
                // Reset form when dialog is closed
                resetCourseForm();
              }
              setIsCourseDialogOpen(open);
            }}>
          <DialogTrigger asChild>
                <Button size="lg" className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-lg hover:shadow-xl transition-all duration-300">
                  <Plus className="mr-2 h-5 w-5" />
                  Create New Course
            </Button>
          </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
                  <DialogTitle className="text-2xl">Create New Course</DialogTitle>
                  <DialogDescription>
                    Fill out the form below to create a new course. All fields marked with * are required.
                  </DialogDescription>
            </DialogHeader>
                <form onSubmit={createCourse} className="space-y-6">
                  {/* Course Thumbnail */}
                  <div className="space-y-3">
                    <Label className="text-base font-semibold">Course Thumbnail *</Label>
                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-primary/30 rounded-xl cursor-pointer bg-gradient-to-br from-primary/5 to-purple-600/5 hover:from-primary/10 hover:to-purple-600/10 transition-all duration-300 group">
                        {courseThumbnailFile ? (
                          <div className="relative w-full h-full">
                            <img 
                              src={URL.createObjectURL(courseThumbnailFile)} 
                              alt="Course thumbnail" 
                              className="w-full h-full object-cover rounded-lg"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                              <div className="text-white text-center">
                                <ImageIcon className="w-8 h-8 mx-auto mb-2" />
                                <p className="text-sm">Click to change</p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-purple-600/20 rounded-full flex items-center justify-center mb-4 group-hover:from-primary/30 group-hover:to-purple-600/30 transition-all duration-300">
                              <ImageIcon className="w-8 h-8 text-primary" />
                            </div>
                            <p className="mb-2 text-base font-medium text-primary">
                              <span className="font-semibold">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-sm text-muted-foreground">PNG, JPG, GIF up to 10MB</p>
                            <p className="text-xs text-muted-foreground mt-1">Recommended: 1200x675px</p>
                          </div>
                        )}
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setCourseThumbnailFile(file);
                              setCourseThumbnail(URL.createObjectURL(file));
                            }
                          }}
                        />
                      </label>
                    </div>
                    {courseThumbnailFile && (
                      <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-green-800">
                            {courseThumbnailFile.name} uploaded successfully
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setCourseThumbnailFile(null);
                            setCourseThumbnail('');
                          }}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          Remove
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="courseTitle" className="text-base font-semibold">Course Title *</Label>
                <Input
                  id="courseTitle"
                  value={courseTitle}
                  onChange={(e) => setCourseTitle(e.target.value)}
                        placeholder="e.g., Complete Web Development Bootcamp"
                        className="h-12 text-base border-2 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>
                    <div className="space-y-3">
                      <Label className="text-base font-semibold">Category</Label>
                      <Select value={courseCategory} onValueChange={setCourseCategory}>
                        <SelectTrigger className="h-12 border-2 focus:border-primary focus:ring-2 focus:ring-primary/20">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {courseCategories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              <div className="flex items-center space-x-3">
                                <span className="text-lg">{category.icon}</span>
                                <span className="font-medium">{category.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label className="text-base font-semibold">Status</Label>
                      <Select value={courseStatus} onValueChange={setCourseStatus}>
                        <SelectTrigger className="h-12 border-2 focus:border-primary focus:ring-2 focus:ring-primary/20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {courseStatuses.map((status) => (
                            <SelectItem key={status.id} value={status.id}>
                              <div className="flex items-center space-x-3">
                                <div className={`w-4 h-4 rounded-full ${status.color}`}></div>
                                <span className="font-medium capitalize">{status.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="coursePrice" className="text-base font-semibold">Price ($)</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-lg">$</span>
                        <Input
                          id="coursePrice"
                          type="number"
                          value={coursePrice}
                          onChange={(e) => setCoursePrice(e.target.value)}
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                          className="h-12 text-base border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 pl-8"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="courseDescription" className="text-base font-semibold">Course Description *</Label>
                <Textarea
                  id="courseDescription"
                  value={courseDescription}
                  onChange={(e) => setCourseDescription(e.target.value)}
                      placeholder="Describe what students will learn in this course, the skills they'll gain, and why they should take this course..."
                      rows={5}
                      className="text-base border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
                  required
                />
                    <p className="text-sm text-muted-foreground">
                      Write a compelling description that will attract students to your course
                    </p>
              </div>

                  {/* Content Module Preview - Skool Style */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-lg font-semibold">Content Types</Label>
                      <Badge variant="secondary" className="text-xs">
                        {courses.length > 0 ? 'Click to add content' : 'Create course first'}
                      </Badge>
                    </div>
                    
                    {/* 3 Main Content Types - Wide Layout */}
                    <div className="grid grid-cols-1 gap-4">
                      {/* Video Content */}
                      <div 
                        className="p-6 bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-xl cursor-pointer hover:from-red-100 hover:to-pink-100 hover:border-red-300 transition-all duration-300 group hover:shadow-lg"
                        onClick={() => handleContentTypeClick('video')}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Video className="w-8 h-8 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-red-800 mb-2">Video Lessons</h3>
                            <p className="text-red-700 mb-3">Add YouTube links, Vimeo videos, or upload video files</p>
                            <div className="flex items-center space-x-4 text-sm text-red-600">
                              <span className="flex items-center">
                                <Play className="w-4 h-4 mr-1" />
                                Video links
                              </span>
                              <span className="flex items-center">
                                <Upload className="w-4 h-4 mr-1" />
                                File uploads
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-red-600 opacity-0 group-hover:opacity-100 transition-opacity mb-2">
                              Click to add video
                            </div>
                            <Button variant="outline" size="sm" className="border-red-300 text-red-700 hover:bg-red-50">
                              Add Video
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Document Content */}
                      <div 
                        className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl cursor-pointer hover:from-blue-100 hover:to-indigo-100 hover:border-blue-300 transition-all duration-300 group hover:shadow-lg"
                        onClick={() => handleContentTypeClick('document')}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Upload className="w-8 h-8 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-blue-800 mb-2">Documents & Materials</h3>
                            <p className="text-blue-700 mb-3">Upload PDFs, Word docs, presentations, and study materials</p>
                            <div className="flex items-center space-x-4 text-sm text-blue-600">
                              <span className="flex items-center">
                                <FileText className="w-4 h-4 mr-1" />
                                PDF files
                              </span>
                              <span className="flex items-center">
                                <BookOpen className="w-4 h-4 mr-1" />
                                Documents
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity mb-2">
                              Click to upload
                            </div>
                            <Button variant="outline" size="sm" className="border-blue-300 text-blue-700 hover:bg-blue-50">
                              Upload Files
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Text Lessons */}
                      <div 
                        className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl cursor-pointer hover:from-green-100 hover:to-emerald-100 hover:border-green-300 transition-all duration-300 group hover:shadow-lg"
                        onClick={() => handleContentTypeClick('text')}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <FileText className="w-8 h-8 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-green-800 mb-2">Text Lessons</h3>
                            <p className="text-green-700 mb-3">Write lesson content, guides, and learning materials</p>
                            <div className="flex items-center space-x-4 text-sm text-green-600">
                              <span className="flex items-center">
                                <FileText className="w-4 h-4 mr-1" />
                                Written content
                              </span>
                              <span className="flex items-center">
                                <BookOpen className="w-4 h-4 mr-1" />
                                Study guides
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-green-600 opacity-0 group-hover:opacity-100 transition-opacity mb-2">
                              Click to write
                            </div>
                            <Button variant="outline" size="sm" className="border-green-300 text-green-700 hover:bg-green-50">
                              Write Lesson
                            </Button>
                            </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <p className="text-sm text-muted-foreground">
                        Choose your content type and start building your course
                      </p>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => setIsLessonDialogOpen(true)}
                        className="text-xs"
                      >
                        <Plus className="mr-2 h-3 w-3" />
                        Quick Add
                      </Button>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-lg hover:shadow-xl transition-all duration-300"
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Creating Course...
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-5 w-5" />
                Create Course
                      </>
                    )}
              </Button>
            </form>
                
                <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={resetCourseForm}
                    className="flex-1 sm:flex-none"
                  >
                    Reset Form
                  </Button>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={() => setIsCourseDialogOpen(false)}
                    className="flex-1 sm:flex-none"
                  >
                    Cancel
                  </Button>
                </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Courses Sidebar */}
            <Card className="lg:col-span-1 bg-white/90 backdrop-blur-sm border-0 shadow-xl hover-lift">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-lg">
                  <BookOpen className="mr-2 h-5 w-5 text-primary" />
                  My Courses
                  <Badge variant="secondary" className="ml-auto">
                    {courses.length}
                  </Badge>
            </CardTitle>
          </CardHeader>
              <CardContent className="space-y-3">
              {courses.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground text-sm">No courses created yet</p>
                    <p className="text-muted-foreground text-xs">Create your first course to get started</p>
                  </div>
              ) : (
                courses.map((course) => (
                    <div
                    key={course.id}
                      className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                        selectedCourse?.id === course.id
                          ? 'bg-gradient-to-r from-primary/10 to-purple-600/10 border border-primary/20 shadow-md'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800 hover:shadow-md'
                      }`}
                    onClick={() => setSelectedCourse(course)}
                  >
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                          <GraduationCap className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm truncate">{course.title}</h3>
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                        {course.description}
                      </p>
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {course.lessons?.length || 0} lessons
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(course.created_at).toLocaleDateString()}
                            </span>
                    </div>
                        </div>
                      </div>
                    </div>
                ))
              )}
          </CardContent>
        </Card>

        {/* Course Content */}
        {selectedCourse ? (
              <div className="lg:col-span-3 space-y-6">
                {/* Course Header */}
                <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl overflow-hidden hover-lift">
                  <div className="relative h-56 bg-gradient-to-br from-primary/20 via-purple-600/20 to-pink-600/20">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                      <div className="flex items-center space-x-3 mb-3">
                        <Badge variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                          {courseCategories.find(c => c.id === 'business')?.icon} Business
                        </Badge>
                        <Badge variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                          Draft
                        </Badge>
                        <Badge variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                          {lessons.length} Lessons
                        </Badge>
                        {/* Content Type Badges */}
                        {lessons.length > 0 && (
                          <>
                            {lessons.some(l => l.video_url) && (
                              <Badge variant="secondary" className="bg-red-500/20 text-red-100 border-red-500/30 backdrop-blur-sm">
                                <Video className="w-3 h-3 mr-1" />
                                Video
                              </Badge>
                            )}
                            <Badge variant="secondary" className="bg-blue-500/20 text-blue-100 border-blue-500/30 backdrop-blur-sm">
                              <FileText className="w-3 h-3 mr-1" />
                              Text
                            </Badge>
                            <Badge variant="secondary" className="bg-green-500/20 text-green-100 border-green-500/30 backdrop-blur-sm">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Interactive
                            </Badge>
                          </>
                        )}
                      </div>
                      <h2 className="text-4xl font-bold mb-3 drop-shadow-lg">{selectedCourse.title}</h2>
                      <p className="text-white/95 max-w-3xl text-lg leading-relaxed">{selectedCourse.description}</p>
                    </div>
                  </div>
                  <CardContent className="p-8">
                <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-8">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-primary">{lessons.length}</div>
                          <div className="text-sm text-muted-foreground font-medium">Total Lessons</div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-green-600">0</div>
                          <div className="text-sm text-muted-foreground font-medium">Students</div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-purple-600">0%</div>
                          <div className="text-sm text-muted-foreground font-medium">Completion</div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-orange-600">0h</div>
                          <div className="text-sm text-muted-foreground font-medium">Duration</div>
                        </div>
                      </div>
                      <div className="flex space-x-3">
                        <Button variant="outline" size="sm" className="border-2 hover:bg-primary hover:text-white transition-all duration-300">
                          <Eye className="mr-2 h-4 w-4" />
                          Preview
                        </Button>
                        <Button variant="outline" size="sm" className="border-2 hover:bg-primary hover:text-white transition-all duration-300">
                          <Settings className="mr-2 h-4 w-4" />
                          Settings
                        </Button>
                        <Button size="sm" className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-lg hover:shadow-xl transition-all duration-300">
                          <Play className="mr-2 h-4 w-4" />
                          Publish Course
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Course Tabs */}
                <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl hover-lift">
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <CardHeader className="pb-0">
                      <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="lessons">Lessons</TabsTrigger>
                        <TabsTrigger value="students">Students</TabsTrigger>
                        <TabsTrigger value="analytics">Analytics</TabsTrigger>
                      </TabsList>
                    </CardHeader>
                    <CardContent className="pt-6">
                                             <TabsContent value="overview" className="space-y-6">
                         {/* Content Types Showcase */}
                         <div className="space-y-4">
                           <div className="flex items-center justify-between">
                             <h3 className="text-lg font-semibold">Available Content Types</h3>
                             <Button 
                               size="sm" 
                               onClick={() => setIsLessonDialogOpen(true)}
                               className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
                             >
                               <Plus className="mr-2 h-4 w-4" />
                               Add Lesson
                             </Button>
                           </div>
                           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                             <Card className="p-4 text-center hover-lift cursor-pointer" onClick={() => setIsLessonDialogOpen(true)}>
                               <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                                 <FileText className="w-6 h-6 text-blue-600" />
                               </div>
                               <h4 className="font-medium text-sm mb-1">Text Lessons</h4>
                               <p className="text-xs text-muted-foreground">Written content</p>
                             </Card>
                             <Card className="p-4 text-center hover-lift cursor-pointer" onClick={() => setIsLessonDialogOpen(true)}>
                               <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                                 <Video className="w-6 h-6 text-red-600" />
                               </div>
                               <h4 className="font-medium text-sm mb-1">Video Content</h4>
                               <p className="text-xs text-muted-foreground">YouTube & uploads</p>
                             </Card>
                             <Card className="p-4 text-center hover-lift cursor-pointer" onClick={() => setIsLessonDialogOpen(true)}>
                               <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                                 <FileText className="w-6 h-6 text-orange-600" />
                               </div>
                               <h4 className="font-medium text-sm mb-1">PDF Documents</h4>
                               <p className="text-xs text-muted-foreground">Readings</p>
                             </Card>
                             <Card className="p-4 text-center hover-lift cursor-pointer" onClick={() => setIsLessonDialogOpen(true)}>
                               <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                                 <CheckCircle className="w-6 h-6 text-green-600" />
                               </div>
                               <h4 className="font-medium text-sm mb-1">Quiz Modules</h4>
                               <p className="text-xs text-muted-foreground">Assessments</p>
                             </Card>
                             <Card className="p-4 text-center hover-lift cursor-pointer" onClick={() => setIsLessonDialogOpen(true)}>
                               <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                                 <BookOpen className="w-6 h-6 text-purple-600" />
                               </div>
                               <h4 className="font-medium text-sm mb-1">Assignments</h4>
                               <p className="text-xs text-muted-foreground">Projects</p>
                             </Card>
                             <Card className="p-4 text-center hover-lift cursor-pointer" onClick={() => setIsLessonDialogOpen(true)}>
                               <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                                 <Upload className="w-6 h-6 text-emerald-600" />
                               </div>
                               <h4 className="font-medium text-sm mb-1">File Uploads</h4>
                               <p className="text-xs text-muted-foreground">Resources</p>
                             </Card>
                           </div>
                         </div>

                         {/* Course Stats */}
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                           <Card className="p-4 text-center hover-lift">
                             <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                               <BookOpen className="w-6 h-6 text-blue-600" />
                             </div>
                             <h3 className="font-semibold mb-1">Course Progress</h3>
                             <Progress value={lessons.length > 0 ? 25 : 0} className="mb-2" />
                             <p className="text-sm text-muted-foreground">25% Complete</p>
                           </Card>
                           <Card className="p-4 text-center hover-lift">
                             <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                               <Users className="w-6 h-6 text-green-600" />
                             </div>
                             <h3 className="font-semibold mb-1">Enrolled Students</h3>
                             <div className="text-2xl font-bold text-green-600 mb-1">0</div>
                             <p className="text-sm text-muted-foreground">No students yet</p>
                           </Card>
                           <Card className="p-4 text-center hover-lift">
                             <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                               <Clock className="w-6 h-6 text-purple-600" />
                             </div>
                             <h3 className="font-semibold mb-1">Total Duration</h3>
                             <div className="text-2xl font-bold text-purple-600 mb-1">0h</div>
                             <p className="text-sm text-muted-foreground">No lessons yet</p>
                           </Card>
                         </div>
                       </TabsContent>

                      <TabsContent value="lessons" className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold">Course Lessons</h3>
                                                  <Dialog open={isLessonDialogOpen} onOpenChange={(open) => {
                          if (!open) {
                            // Reset form when dialog is closed
                            resetLessonForm();
                          }
                          setIsLessonDialogOpen(open);
                        }}>
                    <DialogTrigger asChild>
                            <Button size="sm" className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Lesson
                      </Button>
                    </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Add New Lesson</DialogTitle>
                              <DialogDescription>
                                Add content to your course. Choose the type and provide the details.
                              </DialogDescription>
                              {lessonType !== 'text' && (
                                <div className="mt-2 p-3 bg-primary/10 border border-primary/20 rounded-lg">
                                  <div className="flex items-center space-x-2">
                                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                                      {lessonType === 'video-upload' && <Video className="w-3 h-3 text-white" />}
                                      {lessonType === 'document' && <Upload className="w-3 h-3 text-white" />}
                                      {lessonType === 'text' && <FileText className="w-3 h-3 text-white" />}
                                    </div>
                                    <span className="text-sm font-medium text-primary">
                                                                             Creating {lessonType === 'video-upload' ? 'Video' : lessonType === 'document' ? 'Document' : 'Text'} Lesson
                                    </span>
                                  </div>
                                </div>
                              )}
                      </DialogHeader>
                              <form onSubmit={createLesson} className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                  <div className="space-y-3">
                                    <Label htmlFor="lessonTitle" className="text-base font-semibold">Lesson Title *</Label>
                          <Input
                            id="lessonTitle"
                            value={lessonTitle}
                            onChange={(e) => setLessonTitle(e.target.value)}
                                      placeholder="e.g., Introduction to React Hooks"
                                      className="h-12 text-base border-2 focus:border-primary focus:ring-2 focus:ring-primary/20"
                            required
                          />
                        </div>
                                  <div className="space-y-3">
                                    <Label className="text-base font-semibold">Lesson Type</Label>
                                    <Select value={lessonType} onValueChange={setLessonType}>
                                      <SelectTrigger className="h-12 border-2 focus:border-primary focus:ring-2 focus:ring-primary/20">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="text">
                                          <div className="flex items-center space-x-3">
                                            <FileText className="w-5 h-5 text-green-600" />
                                            <span className="font-medium">Text Lesson</span>
                                          </div>
                                        </SelectItem>
                                        <SelectItem value="video-upload">
                                          <div className="flex items-center space-x-3">
                                            <Video className="w-5 h-5 text-red-600" />
                                            <span className="font-medium">Video</span>
                                          </div>
                                        </SelectItem>
                                        <SelectItem value="document">
                                          <div className="flex items-center space-x-3">
                                            <Upload className="w-5 h-5 text-blue-600" />
                                            <span className="font-medium">Document</span>
                                          </div>
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>

                                                                 {/* Content Section - Changes based on lesson type */}
                                 {lessonType === 'video-upload' && (
                                   <div className="space-y-3">
                                     <Label className="text-base font-semibold">Video URL *</Label>
                                     <Input
                                       value={lessonVideoUrl}
                                       onChange={(e) => setLessonVideoUrl(e.target.value)}
                                       placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
                                       className="h-12 text-base border-2 focus:border-primary focus:ring-2 focus:ring-primary/20"
                            required
                          />
                                     <p className="text-sm text-muted-foreground">
                                       Paste YouTube, Vimeo, or other video platform URLs
                                     </p>
                        </div>
                                 )}

                                 {lessonType === 'pdf' && (
                                   <div className="space-y-3">
                                     <Label className="text-base font-semibold">Upload PDF Document *</Label>
                                     <div className="flex items-center justify-center w-full">
                                       <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-primary/30 rounded-xl cursor-pointer bg-gradient-to-br from-primary/5 to-purple-600/5 hover:from-primary/10 hover:to-purple-600/10 transition-all duration-300 group">
                                         {lessonFile ? (
                                           <div className="relative w-full h-full">
                                             <div className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center">
                                               <div className="text-white text-center">
                                                 <FileText className="w-8 h-8 mx-auto mb-2" />
                                                 <p className="text-sm font-medium">{lessonFile.name}</p>
                                                 <p className="text-xs opacity-80">Click to change</p>
                                               </div>
                                             </div>
                                           </div>
                                         ) : (
                                           <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                             <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-purple-600/20 rounded-full flex items-center justify-center mb-4 group-hover:from-primary/30 group-hover:to-purple-600/30 transition-all duration-300">
                                               <FileText className="w-8 h-8 text-primary" />
                                             </div>
                                             <p className="mb-2 text-base font-medium text-primary">
                                               <span className="font-semibold">Click to upload</span> or drag and drop
                                             </p>
                                             <p className="text-sm text-muted-foreground">PDF files up to 50MB</p>
                                             <p className="text-xs text-muted-foreground mt-1">High quality recommended</p>
                                           </div>
                                         )}
                                         <input 
                                           type="file" 
                                           className="hidden" 
                                           accept=".pdf"
                                           onChange={(e) => {
                                             const file = e.target.files?.[0];
                                             if (file) {
                                               setLessonFile(file);
                                               setLessonFileType('pdf');
                                             }
                                           }}
                                         />
                                       </label>
                                     </div>
                                     {lessonFile && (
                                       <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                                         <div className="flex items-center space-x-2">
                                           <CheckCircle className="w-4 h-4 text-green-600" />
                                           <span className="text-sm text-green-800">
                                             {lessonFile.name} uploaded successfully
                                           </span>
                                         </div>
                                         <Button
                                           variant="ghost"
                                           size="sm"
                                           onClick={() => {
                                             setLessonFile(null);
                                             setLessonFileType('');
                                           }}
                                           className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                         >
                                           Remove
                                         </Button>
                                       </div>
                                     )}
                                   </div>
                                 )}

                                 {lessonType === 'document' && (
                                   <div className="space-y-3">
                                     <Label className="text-base font-semibold">Upload Document *</Label>
                                     <div className="flex items-center justify-center w-full">
                                       <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-primary/30 rounded-xl cursor-pointer bg-gradient-to-br from-primary/5 to-purple-600/5 hover:from-primary/10 hover:to-purple-600/10 transition-all duration-300 group">
                                         {lessonFile ? (
                                           <div className="relative w-full h-full">
                                             <div className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center">
                                               <div className="text-white text-center">
                                                 <FileText className="w-8 h-8 mx-auto mb-2" />
                                                 <p className="text-sm font-medium">{lessonFile.name}</p>
                                                 <p className="text-xs opacity-80">Click to change</p>
                                               </div>
                                             </div>
                                           </div>
                                         ) : (
                                           <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                             <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-purple-600/20 rounded-full flex items-center justify-center mb-4 group-hover:from-primary/30 group-hover:to-purple-600/30 transition-all duration-300">
                                               <FileText className="w-8 h-8 text-primary" />
                                             </div>
                                             <p className="mb-2 text-sm font-medium text-primary">
                                               <span className="font-semibold">Click to upload</span> or drag and drop
                                             </p>
                                             <p className="text-sm text-muted-foreground">Word, PowerPoint, Excel up to 100MB</p>
                                             <p className="text-xs text-muted-foreground mt-1">DOCX, PPTX, XLSX supported</p>
                                           </div>
                                         )}
                                         <input 
                                           type="file" 
                                           className="hidden" 
                                           accept=".docx,.pptx,.xlsx,.doc,.ppt,.xls"
                                           onChange={(e) => {
                                             const file = e.target.files?.[0];
                                             if (file) {
                                               setLessonFile(file);
                                               setLessonFileType('document');
                                             }
                                           }}
                                         />
                                       </label>
                                     </div>
                                     {lessonFile && (
                                       <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                                         <div className="flex items-center space-x-2">
                                           <CheckCircle className="w-4 h-4 text-green-600" />
                                           <span className="text-sm text-green-800">
                                             {lessonFile.name} uploaded successfully
                                           </span>
                                         </div>
                                         <Button
                                           variant="ghost"
                                           size="sm"
                                           onClick={() => {
                                             setLessonFile(null);
                                             setLessonFileType('');
                                           }}
                                           className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                         >
                                           Remove
                                         </Button>
                                       </div>
                                     )}
                                   </div>
                                 )}

                                 {lessonType === 'quiz' && (
                                   <div className="space-y-3">
                                     <Label className="text-base font-semibold">Quiz Configuration</Label>
                                     <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                       <p className="text-sm text-blue-800 mb-3">
                                         Quiz module will be configured in the next step. You can add questions, multiple choice options, and set correct answers.
                                       </p>
                                       <div className="grid grid-cols-2 gap-4 text-sm">
                                         <div className="flex items-center space-x-2">
                                           <CheckCircle className="w-4 h-4 text-blue-600" />
                                           <span>Multiple choice questions</span>
                                         </div>
                                         <div className="flex items-center space-x-2">
                                           <CheckCircle className="w-4 h-4 text-blue-600" />
                                           <span>True/False questions</span>
                                         </div>
                                         <div className="flex items-center space-x-2">
                                           <CheckCircle className="w-4 h-4 text-blue-600" />
                                           <span>Scoring system</span>
                                         </div>
                                         <div className="flex items-center space-x-2">
                                           <CheckCircle className="w-4 h-4 text-blue-600" />
                                           <span>Time limits</span>
                                         </div>
                                       </div>
                                     </div>
                                   </div>
                                 )}

                                 {lessonType === 'assignment' && (
                                   <div className="space-y-3">
                                     <Label className="text-base font-semibold">Assignment Details</Label>
                                     <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                                       <p className="text-sm text-green-800 mb-3">
                                         Assignment module will be configured in the next step. You can set submission requirements, due dates, and grading criteria.
                                       </p>
                                       <div className="grid grid-cols-2 gap-4 text-sm">
                                         <div className="flex items-center space-x-2">
                                           <CheckCircle className="w-4 h-4 text-green-600" />
                                           <span>File submissions</span>
                                         </div>
                                         <div className="flex items-center space-x-2">
                                           <CheckCircle className="w-4 h-4 text-green-600" />
                                           <span>Due dates</span>
                                         </div>
                                         <div className="flex items-center space-x-2">
                                           <CheckCircle className="w-4 h-4 text-green-600" />
                                           <span>Grading rubrics</span>
                                         </div>
                                         <div className="flex items-center space-x-2">
                                           <CheckCircle className="w-4 h-4 text-green-600" />
                                           <span>Peer reviews</span>
                                         </div>
                                       </div>
                                     </div>
                                   </div>
                                 )}

                                 {/* Duration and Video URL fields */}
                                 <div className="grid grid-cols-2 gap-6">
                                   <div className="space-y-3">
                                     <Label htmlFor="lessonDuration" className="text-base font-semibold">Duration (minutes)</Label>
                                     <Input
                                       id="lessonDuration"
                                       type="number"
                                       value={lessonDuration}
                                       onChange={(e) => setLessonDuration(e.target.value)}
                                       placeholder="30"
                                       min="1"
                                       className="h-12 text-base border-2 focus:border-primary focus:ring-2 focus:ring-primary/20"
                                     />
                                   </div>
                                   <div className="space-y-3">
                                     <Label htmlFor="lessonVideoUrl" className="text-base font-semibold">Video URL (optional)</Label>
                          <Input
                            id="lessonVideoUrl"
                            type="url"
                            value={lessonVideoUrl}
                            onChange={(e) => setLessonVideoUrl(e.target.value)}
                            placeholder="https://youtube.com/watch?v=..."
                                       className="h-12 text-base border-2 focus:border-primary focus:ring-2 focus:ring-primary/20"
                                       disabled={lessonType === 'video-upload'}
                          />
                                     {lessonType === 'video-upload' && (
                                       <p className="text-xs text-muted-foreground">
                                         Video URL is disabled when uploading video files
                                       </p>
                                     )}
                        </div>
                                 </div>

                                                                 {/* Content Section - Changes based on lesson type */}
                                 {lessonType === 'text' && (
                                   <div className="space-y-3">
                                     <Label htmlFor="lessonContent" className="text-base font-semibold">Lesson Content *</Label>
                                     <Textarea
                                       id="lessonContent"
                                       value={lessonContent}
                                       onChange={(e) => setLessonContent(e.target.value)}
                                       placeholder="Write your lesson content here. You can include text, links, and basic formatting..."
                                       rows={6}
                                       className="text-base border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
                                       required
                                     />
                                     <p className="text-sm text-muted-foreground">
                                       Write engaging content that will help students learn effectively
                                     </p>
                                   </div>
                                 )}

                                 {lessonType === 'video' && (
                                   <div className="space-y-3">
                                     <Label htmlFor="lessonContent" className="text-base font-semibold">Video Description *</Label>
                                     <Textarea
                                       id="lessonContent"
                                       value={lessonContent}
                                       onChange={(e) => setLessonContent(e.target.value)}
                                       placeholder="Describe what this video covers, key points, and what students will learn..."
                                       rows={4}
                                       className="text-base border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
                                       required
                                     />
                                     <p className="text-sm text-muted-foreground">
                                       Provide context for the video lesson
                                     </p>
                                   </div>
                                 )}

                                 {lessonType === 'video-upload' && (
                                   <div className="space-y-3">
                                     <Label htmlFor="lessonContent" className="text-base font-semibold">Video Description *</Label>
                                     <Textarea
                                       id="lessonContent"
                                       value={lessonContent}
                                       onChange={(e) => setLessonContent(e.target.value)}
                                       placeholder="Describe what this video covers, key points, and what students will learn..."
                                       rows={4}
                                       className="text-base border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
                                       required
                                     />
                                     <p className="text-sm text-muted-foreground">
                                       Provide context for the uploaded video
                                     </p>
                                   </div>
                                 )}

                                 {lessonType === 'pdf' && (
                                   <div className="space-y-3">
                                     <Label htmlFor="lessonContent" className="text-base font-semibold">Document Summary *</Label>
                                     <Textarea
                                       id="lessonContent"
                                       value={lessonContent}
                                       onChange={(e) => setLessonContent(e.target.value)}
                                       placeholder="Summarize the key points, chapters, or sections covered in this PDF..."
                                       rows={4}
                                       className="text-base border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
                                       required
                                     />
                                     <p className="text-sm text-muted-foreground">
                                       Help students understand what to focus on in the document
                                     </p>
                                   </div>
                                 )}

                                 {lessonType === 'document' && (
                                   <div className="space-y-3">
                                     <Label htmlFor="lessonContent" className="text-base font-semibold">Document Overview *</Label>
                                     <Textarea
                                       id="lessonContent"
                                       value={lessonContent}
                                       onChange={(e) => setLessonContent(e.target.value)}
                                       placeholder="Provide an overview of the document content, key sections, and learning objectives..."
                                       rows={4}
                                       className="text-base border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
                                       required
                                     />
                                     <p className="text-sm text-muted-foreground">
                                       Guide students through the document content
                                     </p>
                                   </div>
                                 )}

                                 {lessonType === 'quiz' && (
                                   <div className="space-y-3">
                                     <Label htmlFor="lessonContent" className="text-base font-semibold">Quiz Instructions</Label>
                                     <Textarea
                                       id="lessonContent"
                                       value={lessonContent}
                                       onChange={(e) => setLessonContent(e.target.value)}
                                       placeholder="Provide instructions for the quiz, time limits, passing score, and any special requirements..."
                                       rows={4}
                                       className="text-base border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
                                     />
                                     <p className="text-sm text-muted-foreground">
                                       Set clear expectations for the quiz
                                     </p>
                                   </div>
                                 )}

                                 {lessonType === 'assignment' && (
                                   <div className="space-y-3">
                                     <Label htmlFor="lessonContent" className="text-base font-semibold">Assignment Instructions *</Label>
                                     <Textarea
                                       id="lessonContent"
                                       value={lessonContent}
                                       onChange={(e) => setLessonContent(e.target.value)}
                                       placeholder="Describe the assignment requirements, submission format, evaluation criteria, and due date..."
                                       rows={6}
                                       className="text-base border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
                                       required
                                     />
                                     <p className="text-sm text-muted-foreground">
                                       Provide clear assignment guidelines for students
                                     </p>
                                   </div>
                                 )}

                                                                 <Button 
                                   type="submit" 
                                   className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-lg hover:shadow-xl transition-all duration-300"
                                   disabled={isFileUploading}
                                 >
                                   {isFileUploading ? (
                                     <>
                                       <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                       Creating Lesson...
                                     </>
                                   ) : (
                                     <>
                                       <Plus className="mr-2 h-4 w-4" />
                          Add Lesson
                                     </>
                                   )}
                        </Button>
                      </form>
                              
                              <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
                                <Button 
                                  type="button" 
                                  variant="outline" 
                                  onClick={resetLessonForm}
                                  className="flex-1 sm:flex-none"
                                >
                                  Reset Form
                                </Button>
                                <Button 
                                  type="button" 
                                  variant="ghost" 
                                  onClick={() => setIsLessonDialogOpen(false)}
                                  className="flex-1 sm:flex-none"
                                >
                                  Cancel
                                </Button>
                              </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                {lessons.length === 0 ? (
                           <div className="text-center py-12">
                             <div className="mx-auto h-24 w-24 bg-gradient-to-br from-primary/20 to-purple-600/20 rounded-full flex items-center justify-center mb-6">
                               <BookOpen className="h-12 w-12 text-primary" />
                             </div>
                             <h3 className="text-2xl font-bold mb-3">Ready to Build Your Course?</h3>
                             <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                               Choose from 6 different content types to create engaging lessons for your students
                             </p>
                             <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button 
                                 size="lg"
                      onClick={() => setIsLessonDialogOpen(true)}
                                 className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
                               >
                                 <Plus className="mr-2 h-5 w-5" />
                                 Add Your First Lesson
                               </Button>
                               <Button 
                                 variant="outline" 
                                 size="lg"
                                 onClick={() => setActiveTab('overview')}
                               >
                                 <BookOpen className="mr-2 h-5 w-5" />
                                 View Content Types
                    </Button>
                             </div>
                  </div>
                ) : (
                          <div className="space-y-3">
                    {lessons.map((lesson, index) => (
                              <Card key={lesson.id} className="p-4 hover:shadow-md transition-shadow hover-lift">
                                <div className="flex items-center space-x-4">
                                  <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-primary to-purple-600 text-white rounded-lg flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </div>
                                  <div className="flex-1 min-w-0">
                                                                       <div className="flex items-center space-x-3 mb-2">
                                     <h3 className="font-medium truncate">{lesson.title}</h3>
                                     <Badge variant="outline">
                                       {lesson.video_url ? 'Video' : 'Text'}
                                     </Badge>
                                     {/* TODO: Add lesson type badge based on lesson.type when we add it to database */}
                                   </div>
                                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                              {lesson.content}
                            </p>
                                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                                      <span className="flex items-center">
                                        <Clock className="w-3 h-3 mr-1" />
                                        {lesson.video_url ? '15' : '10'} min
                                      </span>
                                      <span className="flex items-center">
                                        <FileText className="w-3 h-3 mr-1" />
                                        {lesson.content.length} chars
                                      </span>
                                    </div>
                                  </div>
                            <div className="flex items-center space-x-2">
                              {lesson.video_url && (
                                <Button size="sm" variant="outline">
                                  <Play className="mr-2 h-4 w-4" />
                                        Preview
                                </Button>
                              )}
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm">
                                          <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuItem>
                                          <Edit3 className="mr-2 h-4 w-4" />
                                          Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem>
                                          <Copy className="mr-2 h-4 w-4" />
                                          Duplicate
                                        </DropdownMenuItem>
                                        <DropdownMenuItem>
                                          <Move className="mr-2 h-4 w-4" />
                                          Move
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem className="text-red-600">
                                          <Trash2 className="mr-2 h-4 w-4" />
                                          Delete
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
                      </TabsContent>

                      <TabsContent value="students" className="space-y-4">
                        <div className="text-center py-12">
                          <Users className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                          <h3 className="text-lg font-medium mb-2">No students enrolled yet</h3>
                          <p className="text-muted-foreground">
                            Students will appear here once they enroll in your course
                          </p>
                        </div>
                      </TabsContent>

                      <TabsContent value="analytics" className="space-y-4">
                        <div className="text-center py-12">
                          <div className="mx-auto h-16 w-16 bg-gradient-to-br from-primary/20 to-purple-600/20 rounded-lg flex items-center justify-center mb-4">
                            <div className="w-8 h-8 bg-gradient-to-br from-primary to-purple-600 rounded-lg"></div>
                          </div>
                          <h3 className="text-lg font-medium mb-2">Analytics coming soon</h3>
                          <p className="text-muted-foreground">
                            Track student progress, engagement, and course performance
                          </p>
                        </div>
                      </TabsContent>
              </CardContent>
                  </Tabs>
            </Card>
          </div>
        ) : (
              <div className="lg:col-span-3 flex items-center justify-center">
            <div className="text-center">
                  <BookOpen className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Course Selected</h3>
                  <p className="text-muted-foreground mb-4">
                    Select a course from the sidebar or create a new one to get started
              </p>
                  <Button onClick={() => setIsCourseDialogOpen(true)}>
                    Create Your First Course
                  </Button>
            </div>
          </div>
        )}
      </div>
    </div>
      </div>
    </>
  );
}