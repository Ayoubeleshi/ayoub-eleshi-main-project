import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { 
  Zap, 
  Plus, 
  Search,
  ExternalLink,
  Settings,
  Check,
  AlertCircle
} from 'lucide-react';

const integrations = [
  {
    id: 'zapier',
    name: 'Zapier',
    description: 'Connect with 5000+ apps to automate your workflows',
    icon: '⚡',
    category: 'Automation',
    status: 'connected',
    config: { webhook: 'https://hooks.zapier.com/hooks/catch/123456/abcdef/' }
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Sync messages and notifications with your Slack workspace',
    icon: '💬',
    category: 'Communication',
    status: 'available'
  },
  {
    id: 'google-calendar',
    name: 'Google Calendar',
    description: 'Sync events and meetings with your Google Calendar',
    icon: '📅',
    category: 'Calendar',
    status: 'connected'
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp Business',
    description: 'Send notifications and updates via WhatsApp',
    icon: '📱',
    category: 'Communication',
    status: 'available'
  },
  {
    id: 'gmail',
    name: 'Gmail',
    description: 'Integrate email notifications and management',
    icon: '📧',
    category: 'Email',
    status: 'connected'
  },
  {
    id: 'salesforce',
    name: 'Salesforce',
    description: 'Sync contacts and deals with your CRM',
    icon: '☁️',
    category: 'CRM',
    status: 'available'
  },
  {
    id: 'hubspot',
    name: 'HubSpot',
    description: 'Connect your marketing and sales data',
    icon: '🎯',
    category: 'CRM',
    status: 'available'
  },
  {
    id: 'google-drive',
    name: 'Google Drive',
    description: 'Access and sync files from Google Drive',
    icon: '💾',
    category: 'Storage',
    status: 'connected'
  }
];

const categories = ['All', 'Automation', 'Communication', 'Calendar', 'Email', 'CRM', 'Storage'];

export default function IntegrationsSection() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [zapierWebhook, setZapierWebhook] = useState('');
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);
  const { toast } = useToast();

  const filteredIntegrations = integrations.filter(integration => {
    const matchesSearch = integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         integration.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || integration.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleTestZapierWebhook = async () => {
    if (!zapierWebhook) {
      toast({
        title: "Error",
        description: "Please enter your Zapier webhook URL",
        variant: "destructive",
      });
      return;
    }

    setIsTestingWebhook(true);
    
    try {
      const response = await fetch(zapierWebhook, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        mode: "no-cors",
        body: JSON.stringify({
          message: "Test notification from TeamFlow",
          timestamp: new Date().toISOString(),
          type: "test",
          user: "System"
        }),
      });

      toast({
        title: "Webhook Triggered",
        description: "Test notification sent to Zapier. Check your Zap history to confirm it was received.",
      });
    } catch (error) {
      console.error("Error triggering webhook:", error);
      toast({
        title: "Error",
        description: "Failed to trigger the webhook. Please check the URL and try again.",
        variant: "destructive",
      });
    } finally {
      setIsTestingWebhook(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Integrations</h1>
          <p className="text-muted-foreground">Connect your favorite tools and services</p>
        </div>
        <Button className="bg-gradient-brand">
          <Plus className="w-4 h-4 mr-2" />
          Request Integration
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search integrations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex space-x-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className={selectedCategory === category ? "bg-gradient-brand" : ""}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Zapier Configuration */}
      <Card className="p-6 bg-gradient-card border-0 shadow-custom-md">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-brand rounded-lg flex items-center justify-center text-xl">
              ⚡
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Zapier Webhook Configuration</h3>
              <p className="text-sm text-muted-foreground">Set up your webhook URL to receive notifications</p>
            </div>
          </div>
          <Badge variant="outline" className="bg-success/10 text-success border-success/20">
            <Check className="w-3 h-3 mr-1" />
            Connected
          </Badge>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Webhook URL
            </label>
            <div className="flex space-x-2">
              <Input
                placeholder="https://hooks.zapier.com/hooks/catch/..."
                value={zapierWebhook}
                onChange={(e) => setZapierWebhook(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={handleTestZapierWebhook}
                disabled={isTestingWebhook}
                variant="outline"
              >
                {isTestingWebhook ? 'Testing...' : 'Test'}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Enter your Zapier webhook URL to receive real-time notifications
            </p>
          </div>
        </div>
      </Card>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredIntegrations.map((integration) => (
          <Card key={integration.id} className="p-6 bg-gradient-card border-0 shadow-custom-sm hover:shadow-custom-md transition-all duration-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-surface rounded-lg flex items-center justify-center text-xl">
                  {integration.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{integration.name}</h3>
                  <Badge variant="outline" className="text-xs mt-1">
                    {integration.category}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {integration.status === 'connected' ? (
                  <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                    <Check className="w-3 h-3 mr-1" />
                    Connected
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Available
                  </Badge>
                )}
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground mb-4">{integration.description}</p>
            
            <div className="flex items-center justify-between">
              {integration.status === 'connected' ? (
                <div className="flex items-center space-x-2">
                  <Switch checked={true} />
                  <span className="text-sm text-foreground">Active</span>
                </div>
              ) : (
                <Button size="sm" className="bg-gradient-brand">
                  Connect
                </Button>
              )}
              
              <div className="flex space-x-1">
                <Button variant="ghost" size="icon" className="w-8 h-8">
                  <Settings className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="w-8 h-8">
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}