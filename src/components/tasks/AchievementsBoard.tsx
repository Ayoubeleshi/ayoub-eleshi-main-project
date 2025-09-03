import { Trophy, Star, Zap, Target, Calendar, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Achievement {
  id: string;
  title: string;
  description: string;
  type: 'milestone' | 'streak' | 'collaboration' | 'speed' | 'quality';
  icon: React.ComponentType<{ className?: string }>;
  date: string;
  color: string;
  bgColor: string;
}

const SAMPLE_ACHIEVEMENTS: Achievement[] = [
  {
    id: '1',
    title: 'First Sprint Complete!',
    description: 'Completed your first sprint with 8 tasks done',
    type: 'milestone',
    icon: Trophy,
    date: '2 days ago',
    color: 'text-warning',
    bgColor: 'bg-warning/10'
  },
  {
    id: '2',
    title: '7-Day Streak',
    description: 'Completed tasks for 7 consecutive days',
    type: 'streak',
    icon: Zap,
    date: '1 week ago',
    color: 'text-primary',
    bgColor: 'bg-primary/10'
  },
  {
    id: '3',
    title: 'Team Player',
    description: 'Helped 3 teammates by completing their tasks',
    type: 'collaboration',
    icon: Users,
    date: '3 days ago',
    color: 'text-success',
    bgColor: 'bg-success/10'
  },
  {
    id: '4',
    title: 'Speed Demon',
    description: 'Completed 5 tasks in one day',
    type: 'speed',
    icon: Target,
    date: '5 days ago',
    color: 'text-destructive',
    bgColor: 'bg-destructive/10'
  }
];

interface AchievementsBoardProps {
  className?: string;
}

export function AchievementsBoard({ className }: AchievementsBoardProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">🏆 Achievements & Bravos</h2>
          <p className="text-sm text-muted-foreground">Celebrate your wins and milestones</p>
        </div>
        <Button variant="outline" size="sm">
          View All
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {SAMPLE_ACHIEVEMENTS.map(achievement => {
          const Icon = achievement.icon;
          
          return (
            <Card 
              key={achievement.id}
              className={cn(
                "relative overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-1",
                "border-l-4 group cursor-pointer",
                achievement.bgColor
              )}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center",
                    achievement.bgColor
                  )}>
                    <Icon className={cn("w-5 h-5", achievement.color)} />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-sm font-semibold leading-tight">
                      {achievement.title}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      {achievement.description}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <Badge 
                    variant="secondary" 
                    className={cn("text-xs px-2 py-1", achievement.bgColor, achievement.color)}
                  >
                    {achievement.type}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {achievement.date}
                  </span>
                </div>
              </CardContent>
              
              {/* Sparkle effect on hover */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Star className="w-4 h-4 text-warning animate-pulse" />
              </div>
            </Card>
          );
        })}
      </div>

      {/* Add Achievement Button */}
      <Card className="border-2 border-dashed border-muted-foreground/20 hover:border-primary/50 transition-colors">
        <CardContent className="flex items-center justify-center py-8">
          <Button variant="ghost" className="text-muted-foreground hover:text-primary">
            <Trophy className="w-4 h-4 mr-2" />
            Add Achievement
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}