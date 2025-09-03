import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  MoreHorizontal,
  Download,
  RefreshCw
} from 'lucide-react';
import { useState } from 'react';

const productivityData = [
  { name: 'Mon', tasks: 12, meetings: 3, messages: 45, focus: 85 },
  { name: 'Tue', tasks: 15, meetings: 5, messages: 38, focus: 78 },
  { name: 'Wed', tasks: 8, meetings: 2, messages: 52, focus: 92 },
  { name: 'Thu', tasks: 18, meetings: 4, messages: 41, focus: 88 },
  { name: 'Fri', tasks: 14, meetings: 6, messages: 35, focus: 75 },
  { name: 'Sat', tasks: 6, meetings: 1, messages: 28, focus: 95 },
  { name: 'Sun', tasks: 4, meetings: 0, messages: 22, focus: 98 }
];

const teamPerformanceData = [
  { month: 'Jan', productivity: 68, satisfaction: 72, retention: 94 },
  { month: 'Feb', productivity: 72, satisfaction: 75, retention: 96 },
  { month: 'Mar', productivity: 78, satisfaction: 78, retention: 93 },
  { month: 'Apr', productivity: 82, satisfaction: 81, retention: 97 },
  { month: 'May', productivity: 85, satisfaction: 84, retention: 95 },
  { month: 'Jun', productivity: 88, satisfaction: 86, retention: 98 }
];

const projectStatusData = [
  { name: 'Completed', value: 35, fill: 'hsl(var(--success))' },
  { name: 'In Progress', value: 45, fill: 'hsl(var(--primary))' },
  { name: 'Planning', value: 15, fill: 'hsl(var(--warning))' },
  { name: 'On Hold', value: 5, fill: 'hsl(var(--muted))' }
];

const chartConfig = {
  tasks: {
    label: 'Tasks Completed',
    color: 'hsl(var(--primary))',
  },
  meetings: {
    label: 'Meetings',
    color: 'hsl(var(--secondary))',
  },
  messages: {
    label: 'Messages',
    color: 'hsl(var(--success))',
  },
  focus: {
    label: 'Focus Score',
    color: 'hsl(var(--warning))',
  },
};

interface AnalyticsChartProps {
  title: string;
  description?: string;
  type: 'line' | 'area' | 'bar' | 'pie';
  data?: any[];
  className?: string;
}

export function AnalyticsChart({ 
  title, 
  description, 
  type, 
  data = productivityData,
  className = "" 
}: AnalyticsChartProps) {
  const [timeRange, setTimeRange] = useState('7d');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  const renderChart = () => {
    switch (type) {
      case 'line':
        return (
          <ChartContainer config={chartConfig}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="name" 
                className="text-muted-foreground"
                fontSize={12}
              />
              <YAxis className="text-muted-foreground" fontSize={12} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line 
                type="monotone" 
                dataKey="tasks" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={{ fill: "hsl(var(--primary))", strokeWidth: 2 }}
              />
              <Line 
                type="monotone" 
                dataKey="focus" 
                stroke="hsl(var(--success))" 
                strokeWidth={2}
                dot={{ fill: "hsl(var(--success))", strokeWidth: 2 }}
              />
            </LineChart>
          </ChartContainer>
        );
      
      case 'area':
        return (
          <ChartContainer config={chartConfig}>
            <AreaChart data={teamPerformanceData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="month" 
                className="text-muted-foreground"
                fontSize={12}
              />
              <YAxis className="text-muted-foreground" fontSize={12} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                type="monotone"
                dataKey="productivity"
                stackId="1"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary) / 0.6)"
              />
              <Area
                type="monotone"
                dataKey="satisfaction"
                stackId="1"
                stroke="hsl(var(--secondary))"
                fill="hsl(var(--secondary) / 0.6)"
              />
            </AreaChart>
          </ChartContainer>
        );
      
      case 'bar':
        return (
          <ChartContainer config={chartConfig}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="name" 
                className="text-muted-foreground"
                fontSize={12}
              />
              <YAxis className="text-muted-foreground" fontSize={12} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar 
                dataKey="tasks" 
                fill="hsl(var(--primary))" 
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="meetings" 
                fill="hsl(var(--secondary))" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        );
      
      case 'pie':
        return (
          <ChartContainer config={chartConfig}>
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent />} />
              <Pie
                data={projectStatusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {projectStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Legend />
            </PieChart>
          </ChartContainer>
        );
      
      default:
        return null;
    }
  };

  const getTrendInfo = () => {
    // Simple trend calculation for demo
    const isPositive = Math.random() > 0.5;
    const percentage = Math.floor(Math.random() * 20) + 1;
    
    return {
      isPositive,
      percentage,
      text: isPositive ? 'increase' : 'decrease'
    };
  };

  const trend = getTrendInfo();

  return (
    <Card className={`bg-gradient-card border-0 shadow-custom-md ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
          {description && (
            <CardDescription className="text-sm">{description}</CardDescription>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-24 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7d</SelectItem>
              <SelectItem value="30d">30d</SelectItem>
              <SelectItem value="90d">90d</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
          <Button variant="ghost" size="sm">
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          {renderChart()}
        </div>
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
          <div className="flex items-center space-x-2">
            {trend.isPositive ? (
              <TrendingUp className="h-4 w-4 text-success" />
            ) : (
              <TrendingDown className="h-4 w-4 text-destructive" />
            )}
            <span className={`text-sm font-medium ${trend.isPositive ? 'text-success' : 'text-destructive'}`}>
              {trend.percentage}% {trend.text}
            </span>
            <span className="text-sm text-muted-foreground">from last period</span>
          </div>
          <Badge variant="secondary" className="text-xs">
            Updated 2 min ago
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}