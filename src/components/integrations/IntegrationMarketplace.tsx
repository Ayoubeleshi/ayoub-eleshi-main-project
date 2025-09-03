import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Search,
  Star,
  Download,
  Settings,
  Zap,
  Calendar,
  Mail,
  MessageSquare,
  FileText,
  BarChart3,
  Shield,
  Globe,
  Camera,
  Code,
  Database,
  Cloud,
  Smartphone,
  Users,
  Clock,
  CheckCircle,
  ExternalLink,
  Plus
} from 'lucide-react';
import { toast } from 'sonner';

interface Integration {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: any;
  rating: number;
  installs: number;
  verified: boolean;
  free: boolean;
  price?: string;
  features: string[];
  screenshots?: string[];
}

const integrations: Integration[] = [
  {
    id: 'slack',
    name: 'Slack',
    description: 'Sync messages and notifications between WorkFlow and Slack channels.',
    category: 'Communication',
    icon: MessageSquare,
    rating: 4.8,
    installs: 15420,
    verified: true,
    free: true,
    features: ['Two-way sync', 'Real-time notifications', 'Channel mapping', 'Bot commands']
  },
  {
    id: 'google-calendar',
    name: 'Google Calendar',
    description: 'Seamlessly sync meetings and events with your Google Calendar.',
    category: 'Calendar',
    icon: Calendar,
    rating: 4.9,
    installs: 22180,
    verified: true,
    free: true,
    features: ['Automatic sync', 'Meeting reminders', 'Availability checking', 'Event creation']
  },
  {
    id: 'gmail',
    name: 'Gmail',
    description: 'Integrate email workflows and track important conversations.',
    category: 'Email',
    icon: Mail,
    rating: 4.7,
    installs: 18650,
    verified: true,
    free: true,
    features: ['Email sync', 'Thread tracking', 'Auto-labeling', 'Smart filters']
  },
  {
    id: 'jira',
    name: 'Jira',
    description: 'Connect your development workflow with project management.',
    category: 'Development',
    icon: Code,
    rating: 4.6,
    installs: 12340,
    verified: true,
    free: false,
    price: '$5/month',
    features: ['Issue sync', 'Sprint tracking', 'Status updates', 'Time logging']
  },
  {
    id: 'github',
    name: 'GitHub',
    description: 'Track code commits, pull requests, and repository activity.',
    category: 'Development',
    icon: Code,
    rating: 4.8,
    installs: 16780,
    verified: true,
    free: true,
    features: ['Repository sync', 'PR notifications', 'Commit tracking', 'Issue linking']
  },
  {
    id: 'zoom',
    name: 'Zoom',
    description: 'Start video meetings directly from WorkFlow with one click.',
    category: 'Video',
    icon: Camera,
    rating: 4.5,
    installs: 20150,
    verified: true,
    free: true,
    features: ['One-click meetings', 'Meeting recordings', 'Participant tracking', 'Chat sync']
  },
  {
    id: 'google-drive',
    name: 'Google Drive',
    description: 'Access and share Google Drive files within your workspace.',
    category: 'Storage',
    icon: Cloud,
    rating: 4.7,
    installs: 25680,
    verified: true,
    free: true,
    features: ['File browser', 'Real-time collaboration', 'Permission management', 'Version history']
  },
  {
    id: 'salesforce',
    name: 'Salesforce',
    description: 'Connect your CRM data with team collaboration workflows.',
    category: 'CRM',
    icon: Database,
    rating: 4.4,
    installs: 8920,
    verified: true,
    free: false,
    price: '$15/month',
    features: ['Contact sync', 'Deal tracking', 'Activity logging', 'Report sharing']
  }
];

const categories = [
  { id: 'all', name: 'All', icon: Globe },
  { id: 'Communication', name: 'Communication', icon: MessageSquare },
  { id: 'Calendar', name: 'Calendar', icon: Calendar },
  { id: 'Email', name: 'Email', icon: Mail },
  { id: 'Development', name: 'Development', icon: Code },
  { id: 'Video', name: 'Video', icon: Camera },
  { id: 'Storage', name: 'Storage', icon: Cloud },
  { id: 'CRM', name: 'CRM', icon: Database }
];

export default function IntegrationMarketplace() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [installedIntegrations, setInstalledIntegrations] = useState<Set<string>>(new Set());

  const filteredIntegrations = integrations.filter(integration => {
    const matchesSearch = integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         integration.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || integration.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleInstall = (integration: Integration) => {
    setInstalledIntegrations(prev => new Set([...prev, integration.id]));
    toast.success(`${integration.name} installed successfully!`);
    setSelectedIntegration(null);
  };

  const handleUninstall = (integrationId: string) => {
    setInstalledIntegrations(prev => {
      const newSet = new Set(prev);
      newSet.delete(integrationId);
      return newSet;
    });
    toast.success('Integration removed successfully!');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Integration Marketplace</h1>
          <p className="text-muted-foreground">Connect WorkFlow with your favorite tools</p>
        </div>
        <Button variant="outline">
          <Plus className="w-4 h-4 mr-2" />
          Request Integration
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search integrations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <Tabs defaultValue="marketplace" className="space-y-4">
        <TabsList>
          <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
          <TabsTrigger value="installed">
            Installed ({installedIntegrations.size})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="marketplace" className="space-y-6">
          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className="flex items-center gap-2"
                >
                  <Icon className="w-4 h-4" />
                  {category.name}
                </Button>
              );
            })}
          </div>

          {/* Integration Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredIntegrations.map((integration) => {
              const Icon = integration.icon;
              const isInstalled = installedIntegrations.has(integration.id);
              
              return (
                <Card 
                  key={integration.id} 
                  className="p-6 bg-gradient-card border-0 hover:shadow-custom-lg transition-all cursor-pointer"
                  onClick={() => setSelectedIntegration(integration)}
                >
                  <CardHeader className="p-0 pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center">
                          <Icon className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg flex items-center gap-2">
                            {integration.name}
                            {integration.verified && (
                              <CheckCircle className="w-4 h-4 text-success" />
                            )}
                          </CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex items-center">
                              <Star className="w-4 h-4 text-warning fill-current" />
                              <span className="text-sm text-muted-foreground ml-1">
                                {integration.rating}
                              </span>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {integration.installs.toLocaleString()} installs
                            </span>
                          </div>
                        </div>
                      </div>
                      {isInstalled && (
                        <Badge className="bg-success text-success-foreground">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Installed
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <CardDescription className="mb-4">
                      {integration.description}
                    </CardDescription>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{integration.category}</Badge>
                        {integration.free ? (
                          <Badge className="bg-success text-success-foreground">Free</Badge>
                        ) : (
                          <Badge variant="outline">{integration.price}</Badge>
                        )}
                      </div>
                      <Button size="sm" variant={isInstalled ? "outline" : "default"}>
                        {isInstalled ? (
                          <>
                            <Settings className="w-4 h-4 mr-2" />
                            Configure
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4 mr-2" />
                            Install
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="installed" className="space-y-6">
          {installedIntegrations.size === 0 ? (
            <Card className="p-12 text-center bg-gradient-card border-0">
              <Zap className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No integrations installed</h3>
              <p className="text-muted-foreground mb-4">
                Browse the marketplace to connect your favorite tools
              </p>
              <Button onClick={() => setSelectedCategory('all')}>
                Browse Marketplace
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from(installedIntegrations).map(id => {
                const integration = integrations.find(i => i.id === id);
                if (!integration) return null;
                
                const Icon = integration.icon;
                
                return (
                  <Card key={integration.id} className="p-6 bg-gradient-card border-0">
                    <CardHeader className="p-0 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{integration.name}</CardTitle>
                          <Badge className="bg-success text-success-foreground mt-1">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Active
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          <Settings className="w-4 h-4 mr-2" />
                          Configure
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleUninstall(integration.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          Remove
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Integration Detail Dialog */}
      {selectedIntegration && (
        <Dialog open={!!selectedIntegration} onOpenChange={() => setSelectedIntegration(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-accent rounded-lg flex items-center justify-center">
                  <selectedIntegration.icon className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <DialogTitle className="text-xl flex items-center gap-2">
                    {selectedIntegration.name}
                    {selectedIntegration.verified && (
                      <CheckCircle className="w-5 h-5 text-success" />
                    )}
                  </DialogTitle>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-warning fill-current" />
                      <span className="ml-1 font-medium">{selectedIntegration.rating}</span>
                    </div>
                    <span className="text-muted-foreground">
                      {selectedIntegration.installs.toLocaleString()} installs
                    </span>
                    <Badge variant="secondary">{selectedIntegration.category}</Badge>
                  </div>
                </div>
              </div>
            </DialogHeader>
            
            <DialogDescription className="text-base mb-6">
              {selectedIntegration.description}
            </DialogDescription>

            <div className="space-y-6">
              <div>
                <h4 className="font-semibold mb-3">Features</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedIntegration.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-success" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div>
                  {selectedIntegration.free ? (
                    <Badge className="bg-success text-success-foreground">Free</Badge>
                  ) : (
                    <div>
                      <span className="text-lg font-semibold">{selectedIntegration.price}</span>
                      <span className="text-muted-foreground ml-1">per month</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Learn More
                  </Button>
                  <Button 
                    onClick={() => handleInstall(selectedIntegration)}
                    disabled={installedIntegrations.has(selectedIntegration.id)}
                    className="bg-gradient-brand hover:opacity-90"
                  >
                    {installedIntegrations.has(selectedIntegration.id) ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Installed
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-2" />
                        Install Now
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}