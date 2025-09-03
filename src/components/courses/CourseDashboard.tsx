import React from 'react';
import { BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const CourseDashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent mb-2">
            My Learning Dashboard
          </h1>
          <p className="text-xl text-muted-foreground">
            Continue your learning journey and track your progress
          </p>
        </div>

        {/* Coming Soon Message */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-12 text-center">
            <BookOpen className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Dashboard Coming Soon</h3>
            <p className="text-muted-foreground mb-6">
              Course dashboard functionality will be available soon. For now, you can browse and enroll in courses.
            </p>
            <Button className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90">
              <BookOpen className="mr-2 h-4 w-4" />
              Browse Courses
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CourseDashboard;